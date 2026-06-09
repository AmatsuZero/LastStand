+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第4章 推理循环算法"
tags = ["AI Agent", "Claude Code", "算法思想", "推理循环", "上下文管理"]
categories = ["AI Agent", "Claude Code"]
+++
> "Intelligence is not a single act, but an iterated loop of perception, reasoning, and action."

## 4.1 问题引入：Agent 的心跳

当用户在终端输入一行自然语言指令——比如"帮我把这个函数重构成两个"——背后发生的事情远比想象中复杂。Claude Code 不会仅仅调用一次大语言模型就给出答案。相反，它启动了一个**推理循环**（Reasoning Loop）：先理解任务，再决定调用哪个工具，然后执行工具、观察结果，之后再次推理——如此反复，直到任务完成。

这个循环就像 Agent 的心跳。每一次搏动，Agent 都在感知世界（读取工具执行结果）、思考对策（调用 LLM）、采取行动（调用工具）。心跳停止，Agent 停止。心跳失控，Agent 陷入死循环。如何设计这个循环，使其既足够灵活以应对任意复杂的任务，又足够可控以避免失控和资源浪费——这是 Agent 系统最核心的工程挑战。

在 Claude Code 的源码中，这个推理循环分布在两个关键模块中：**QueryEngine**（`src/QueryEngine.ts`）负责会话级别的生命周期管理，包括用户输入处理、系统提示词构建、会话持久化等；**query**（`src/query.ts`）负责核心推理循环的实际执行，包括 LLM 调用、工具执行、上下文压缩、异常恢复等。两者的关系可以类比为操作系统中的**进程管理器**与**CPU 调度器**——前者管理进程的创建和资源分配，后者决定每个时间片做什么。

本章将深入解析这一核心循环的算法设计。

## 4.2 算法思想

### 4.2.1 核心 Loop 算法：永动的推理引擎

推理循环的基本骨架是一个 `while(true)` 无限循环。乍看之下这似乎很原始，但其精妙之处在于**退出条件的分布式设计**——循环体内有多个出口，每个出口对应一种终止语义。

让我们先看最精简的算法骨架：

```
算法 4-1：推理循环核心骨架

function queryLoop(params):
    state ← 初始化(params)

    while true:
        // 阶段1：准备
        messagesForQuery ← 预处理消息(state.messages)
        messagesForQuery ← 自动压缩IfNeeded(messagesForQuery)

        // 阶段2：调用 LLM
        for message in streamCallModel(messagesForQuery):
            yield message                   // 向外部流式输出
            if message.type == 'assistant':
                收集工具调用块(message)

        // 阶段3：判断是否需要继续
        if 无工具调用:
            执行停止钩子检查()
            return { reason: 'completed' }  // 出口1：正常完成

        // 阶段4：执行工具
        toolResults ← executeTools(toolUseBlocks)
        yield toolResults

        // 阶段5：检查终止条件
        if 用户中断:
            return { reason: 'aborted' }    // 出口2：用户中断
        if 超过最大轮次:
            return { reason: 'max_turns' }  // 出口3：轮次上限

        // 阶段6：组装下一轮输入
        state.messages ← [...messagesForQuery, ...assistantMessages, ...toolResults]
        state.turnCount++
```

这个算法有几个值得注意的设计决策：

**第一，循环不是递归。** Claude Code 早期版本使用递归实现推理链：每次工具调用后递归调用自身。这在一般场景下工作良好，但在长任务中会产生栈溢出的风险。当前版本将递归重构为迭代——使用一个显式的 `State` 对象在循环迭代之间传递状态：

```
算法 4-2：循环状态对象

type State = {
    messages: Message[]              // 当前消息历史
    toolUseContext: ToolUseContext    // 工具执行上下文
    autoCompactTracking: Tracking    // 压缩追踪状态
    maxOutputTokensRecoveryCount: int // 输出截断恢复计数
    hasAttemptedReactiveCompact: bool // 是否已尝试过反应式压缩
    turnCount: int                   // 当前轮次
    transition: Continue | undefined // 上一次迭代的转移原因
}
```

每个 `continue` 语句处（即需要再次推理的地方），都会构造一个完整的新 `State` 对象赋值给局部变量，而不是零散地修改多个变量。这种"不可变状态快照"的设计极大地降低了状态管理的心智负担——在源码中有 7 个不同的 `continue` 点（正常工具循环、停止钩子重试、反应式压缩恢复、输出截断恢复、上下文坍缩重试、Token 预算续行等），每个点都显式声明了完整的下一轮状态。

**第二，`transition` 字段记录了"为什么继续"。** 这不仅用于调试和测试，更重要的是用于防止恢复策略之间的无限循环。例如，当上下文坍缩（Context Collapse）重试后仍然收到 413 错误时，`transition.reason === 'collapse_drain_retry'` 会阻止再次尝试坍缩，转而将控制权交给反应式压缩（Reactive Compact）。

### 4.2.2 终止条件设计：七种方式结束循环

推理循环的终止条件设计体现了工程实践中的**防御性编程**思想。Claude Code 定义了完整的终止原因枚举，每一种都对应特定的场景：

```
算法 4-3：终止条件分类

Terminal = {
    reason: 'completed'           // 模型自然完成，无更多工具调用
          | 'aborted_streaming'   // 用户在 LLM 流式输出时中断
          | 'aborted_tools'       // 用户在工具执行时中断
          | 'max_turns'           // 达到最大轮次限制
          | 'blocking_limit'      // Token 达到硬阻塞上限
          | 'prompt_too_long'     // 上下文过长且压缩失败
          | 'model_error'         // LLM API 错误
          | 'image_error'         // 图像大小错误
          | 'hook_stopped'        // 钩子阻止继续
          | 'stop_hook_prevented' // 停止钩子验证失败
}
```

这种设计有两层含义：

1. **对内**——每种终止原因触发不同的清理逻辑。例如 `aborted_streaming` 需要为已发出但未完成的 `tool_use` 块补充空的 `tool_result`（否则 API 会因消息格式不完整而报错）；`max_turns` 需要向外部发送 `max_turns_reached` 附件消息。

2. **对外**——`QueryEngine` 的调用者（SDK、REPL 等）可以根据终止原因决定后续行为，比如是否重试、是否向用户显示错误信息。

源码中一个精妙的细节是**中断信号的分级处理**。当用户按下 Ctrl+C 时，系统区分两种情况：如果是在 LLM 流式输出阶段中断，需要为所有已输出的 `tool_use` 块生成错误结果；如果是在工具执行阶段中断，`StreamingToolExecutor` 会通过子级 `AbortController` 传播取消信号。此外，还存在一种特殊的"提交中断"（`signal.reason === 'interrupt'`），此时不发送中断提示消息，因为紧随其后的新用户消息会提供足够的上下文。

### 4.2.3 流式推理管线：边生成边执行

传统的 Agent 实现通常是**串行管线**：等待 LLM 完整响应 → 解析所有工具调用 → 批量执行工具 → 收集结果 → 再次调用 LLM。这意味着工具执行必须等待 LLM 完成所有输出——即使第一个工具调用在输出第二句话时就已经完整了。

Claude Code 实现了一种**流式并行管线**，通过 `StreamingToolExecutor` 在 LLM 还在生成后续内容时就开始执行已完成的工具调用：

```
算法 4-4：流式工具执行管线

class StreamingToolExecutor:
    tools: TrackedTool[]     // 追踪列表

    method addTool(block, assistantMessage):
        tracked ← 创建追踪条目(block)
        tools.append(tracked)
        tryStartExecution(tracked)   // 立即尝试启动

    method tryStartExecution(tool):
        if tool.isConcurrencySafe:
            // 并发安全的工具可以与其他并发安全工具并行
            if 当前没有独占工具在执行:
                startExecution(tool)
        else:
            // 非并发安全的工具需要独占执行
            if 没有任何工具在执行:
                startExecution(tool)

    method getCompletedResults():
        // 按接收顺序（而非完成顺序）返回已完成的结果
        while tools 中有已完成但未交付的工具:
            yield 下一个按顺序已完成的工具结果
```

这里的并发控制策略值得关注。`StreamingToolExecutor` 将工具分为两类：**并发安全**（Concurrency-Safe）的工具可以并行执行，如文件读取、搜索等只读操作；**非并发安全**的工具必须独占执行，如文件写入、Shell 命令等可能产生副作用的操作。当一个非并发安全的工具在执行时，后续所有工具都被阻塞，直到它完成。

另一个重要的设计是**按序交付**（In-Order Delivery）。尽管工具可能乱序完成，但结果始终按工具在 LLM 输出中出现的顺序交付。这保证了消息历史的线性一致性——后续 LLM 调用看到的消息序列是确定性的。

在主循环中，流式执行与 LLM 流式输出交织进行：

```
算法 4-5：主循环中的流式交织

// LLM 流式输出阶段
for message in streamFromModel():
    yield message
    if message 包含 tool_use 块:
        streamingExecutor.addTool(block)    // 立即提交执行
    // 检查已完成的工具结果
    for result in streamingExecutor.getCompletedResults():
        yield result                        // 边流式输出边交付结果

// LLM 输出完毕后，等待剩余工具完成
for result in streamingExecutor.getRemainingResults():
    yield result
```

这种设计使得在 LLM 输出 5 个工具调用时，前 3 个可能在第 4 个输出时就已经执行完毕了。根据源码注释，实际场景中工具执行时间（2-30 秒）远大于 LLM 流式输出延迟，因此这种优化可以显著减少端到端延迟。

### 4.2.4 消息编排算法：构建模型的记忆

LLM 是无状态的——每次调用都需要把完整的对话历史作为输入发送。因此，如何组织和编排这些消息，直接决定了 Agent 的行为质量。Claude Code 的消息编排分为三层：

**第一层：系统提示词层。** 系统提示词由多个部分拼接而成：

```
算法 4-6：系统提示词构建

systemPrompt ← [
    defaultSystemPrompt    或  customSystemPrompt,   // 默认 / 自定义
    memoryMechanicsPrompt?,                          // 记忆机制指导（可选）
    appendSystemPrompt?,                             // 追加系统提示（可选）
]

// 在发送给 API 前，还会追加系统上下文
fullSystemPrompt ← appendSystemContext(systemPrompt, systemContext)
```

`systemContext` 包含动态的环境信息，如当前工作目录、Git 状态等。这些信息放在系统提示词的末尾而非开头，是因为 Anthropic API 的 Prompt Caching 机制——只有前缀匹配时才能复用缓存，动态变化的部分放在末尾可以最大化缓存命中率。

**第二层：用户上下文层。** 在发送给 API 之前，会将用户上下文注入到消息序列的开头：

```
算法 4-7：用户上下文注入

messagesForAPI ← prependUserContext(messagesForQuery, userContext)
```

用户上下文包含协调器模式信息、工作目录配置等。之所以用 `prepend` 而非 `append`，同样是为了配合 Prompt Caching——用户上下文在同一会话中相对稳定，放在消息序列的前部可以提高缓存命中。

**第三层：工具结果与附件层。** 每一轮工具执行完毕后，系统会在工具结果之后注入多种"附件"消息：

```
算法 4-8：附件注入流程

toolResults ← 工具执行结果
attachments ← []

// 1. 获取文件变更附件（外部编辑检测）
attachments.append(getAttachmentMessages(...))

// 2. 获取记忆预取结果（若已就绪）
if memoryPrefetch.settled:
    attachments.append(filterDuplicateMemoryAttachments(...))

// 3. 获取技能发现结果
if skillPrefetch.settled:
    attachments.append(collectSkillDiscoveryPrefetch(...))

// 4. 获取排队的命令通知
attachments.append(queuedCommandAttachments)

nextMessages ← [...messagesForQuery, ...assistantMessages, ...toolResults, ...attachments]
```

附件系统的设计体现了**异步预取**的思想：记忆搜索和技能发现都在循环迭代开始时异步启动，在工具执行完毕后非阻塞地检查结果。如果预取尚未完成，则跳过（下一轮迭代重试），绝不阻塞主循环。源码注释中专门提到："prefetch gets as many chances as there are loop iterations"——预取有和循环迭代次数一样多的机会被消费。

### 4.2.5 上下文窗口管理算法：对话的记忆与遗忘

随着对话的进行，消息历史不断增长，最终会逼近模型的上下文窗口上限。Claude Code 设计了一套**多层级上下文管理**体系来应对这一挑战，从轻量到重量依次为：

**第一级：Snip 压缩。** 这是最轻量的压缩方式，在每轮循环开始时运行。它根据消息的重要性标记，裁剪掉历史中不再需要的细节——类似于人类记忆中的"遗忘曲线"：

```
算法 4-9：Snip 压缩

function snipCompactIfNeeded(messages):
    snipResult ← 按重要性标记裁剪旧消息
    return {
        messages: 裁剪后的消息,
        tokensFreed: 释放的 Token 数,
        boundaryMessage: 压缩边界标记（如果发生了裁剪）
    }
```

**第二级：微压缩（Microcompact）。** 在 Snip 之后、自动压缩之前运行。微压缩针对的是工具执行结果的冗余内容——比如两次读取同一文件的完整内容可以合并为只保留最新版本：

```
算法 4-10：微压缩

function microcompact(messages, context):
    // 识别可压缩的工具结果
    // 用更短的摘要替换冗余内容
    // 返回压缩后的消息和压缩信息
    return { messages, compactionInfo }
```

**第三级：上下文坍缩（Context Collapse）。** 这是一种"分段归档"策略。当上下文使用率达到 90% 时，系统将较旧的消息段落坍缩为摘要，但保留摘要的来源引用，使得在需要时可以"展开"回顾：

```
算法 4-11：上下文坍缩

function applyCollapsesIfNeeded(messages, context):
    if 上下文使用率 < 90%:
        return { messages }  // 不需要坍缩

    // 选择最旧的消息段落
    // 生成段落摘要
    // 用摘要替换原始段落，保留引用
    return { messages: 坍缩后的消息 }
```

坍缩与自动压缩的关键区别在于：坍缩是**增量**的，每次只处理一部分消息，保留粒度化的上下文；而自动压缩是**全量**的，将整个历史替换为一个统一摘要。因此在架构上，坍缩被安排在自动压缩之前——如果坍缩就能将上下文控制在阈值以下，就避免了更激进的全量压缩。

**第四级：自动压缩（Auto Compact）。** 这是最重量级的上下文管理手段。当 Token 使用量超过阈值时触发：

```
算法 4-12：自动压缩

function autoCompactIfNeeded(messages, context, tracking):
    // 1. 电路断路器：连续失败超过 3 次则放弃
    if tracking.consecutiveFailures >= MAX_FAILURES:
        return { wasCompacted: false }

    // 2. 计算是否需要压缩
    tokenCount ← estimateTokens(messages)
    threshold  ← contextWindow - bufferTokens - maxOutputTokens
    if tokenCount < threshold:
        return { wasCompacted: false }

    // 3. 尝试会话记忆压缩（更轻量的替代方案）
    sessionMemResult ← trySessionMemoryCompaction(messages)
    if sessionMemResult:
        return sessionMemResult

    // 4. 执行完整压缩
    compactionResult ← compactConversation(messages, context)

    // 5. 构建压缩后的消息
    postCompactMessages ← [
        boundaryMarker,      // 压缩边界标记
        ...summaryMessages,  // 摘要消息
        ...messagesToKeep,   // 保留的近期消息
        ...attachments,      // 重新注入的附件（记忆、文件等）
        ...hookResults,      // 压缩后钩子结果
    ]
    return { wasCompacted: true, postCompactMessages }
```

阈值的计算值得详细说明。源码中定义了多个关键常量：

- `AUTOCOMPACT_BUFFER_TOKENS = 13,000`：自动压缩触发阈值的缓冲区
- `WARNING_THRESHOLD_BUFFER_TOKENS = 20,000`：警告阈值缓冲区
- `MANUAL_COMPACT_BUFFER_TOKENS = 3,000`：手动压缩保留的空间
- `MAX_OUTPUT_TOKENS_FOR_SUMMARY = 20,000`：为压缩摘要预留的输出空间

有效上下文窗口 = 模型上下文窗口 - 最大输出 Token 数（上限 20,000）。自动压缩阈值 = 有效上下文窗口 - 13,000。也就是说，系统在上下文还剩约 13,000 Token 余量时就开始压缩，为新的对话留出足够空间。

**第五级：反应式压缩（Reactive Compact）。** 这是**最后的防线**。当前面所有主动措施都未能控制住上下文大小，API 返回 `prompt_too_long` 错误时触发：

```
算法 4-13：反应式压缩（错误恢复路径）

// 在主循环的"无工具调用"分支中
if 最后消息是 prompt_too_long 错误:

    // 策略1：先尝试上下文坍缩排空
    if 之前未尝试过坍缩排空:
        drained ← recoverFromOverflow(messages)
        if drained.committed > 0:
            state ← 新状态(drained.messages)
            continue  // 重试

    // 策略2：再尝试反应式全量压缩
    if 之前未尝试过反应式压缩:
        compacted ← tryReactiveCompact(messages)
        if compacted:
            state ← 新状态(compacted.messages)
            continue  // 重试

    // 所有恢复策略失败，上报错误
    yield 错误消息
    return { reason: 'prompt_too_long' }
```

这种分层策略的设计哲学是：**先用轻量方案，不够再升级；主动预防为主，被动恢复为辅**。每一层都有明确的边界条件和降级路径，形成了一个完整的"上下文安全网"。

### 4.2.6 Token 预算管理：追踪、预警与降级

除了上下文窗口的输入侧管理，Claude Code 还实现了**输出侧**的 Token 预算管理，应对模型输出被截断的情况。

当模型输出达到 `max_output_tokens` 限制时，响应会被截断。Claude Code 对此有两层恢复策略：

```
算法 4-14：输出 Token 截断恢复

if 最后消息是 max_output_tokens 错误:

    // 策略1：升级输出窗口（仅一次）
    if 当前使用默认输出限制 且 未升级过:
        maxOutputTokensOverride ← ESCALATED_MAX_TOKENS  // 64K
        continue  // 用更大的输出窗口重试

    // 策略2：注入恢复消息让模型继续
    if recoveryCount < 3:
        recoveryMessage ← "Output token limit hit. Resume directly —
            no apology, no recap. Pick up mid-thought."
        messages.append(recoveryMessage)
        recoveryCount++
        continue  // 让模型从断点继续

    // 恢复次数耗尽，输出截断的错误交给调用者
    yield 最终错误消息
```

这里 `recoveryMessage` 的措辞经过精心设计："Resume directly — no apology, no recap of what you were doing. Pick up mid-thought if that is where the cut happened. Break remaining work into smaller pieces."——它明确指示模型不要道歉、不要重述已有内容、从断点直接继续，并将剩余工作拆分成更小的片段。这种**元指令**（Meta-instruction）是 Agent 工程中的重要实践：通过精确的提示词引导 LLM 在异常情况下做出正确行为。

此外，Claude Code 还支持 API 层面的 `task_budget`（任务预算）功能。在压缩发生时，系统会追踪已消耗的 Token 量并计算剩余预算：

```
算法 4-15：任务预算跟踪

// 压缩发生时更新预算
if taskBudget 存在 且 发生了压缩:
    preCompactContext ← 压缩前最后一次响应的上下文 Token 数
    taskBudgetRemaining ← max(0, taskBudgetRemaining - preCompactContext)

// 发送给 API 时附带预算信息
apiParams.taskBudget ← {
    total: taskBudget.total,
    remaining: taskBudgetRemaining  // 仅在压缩后设置
}
```

在未发生压缩时，服务端可以从完整历史中自行推算消耗，因此 `remaining` 字段不需要设置。但压缩后，服务端只能看到摘要，无法知道摘要前已经消耗了多少——`remaining` 字段正是为此而设。

## 4.3 架构图解

下图展示了推理循环的完整流程，包括各分支和异常处理路径：

```
用户输入
  │
  ▼
┌──────────────────────────────────────────────────────────────┐
│  QueryEngine.submitMessage()                                  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 1. 构建系统提示词 (system prompt)                       │  │
│  │ 2. 处理用户输入 (processUserInput)                      │  │
│  │ 3. 持久化消息到 transcript                              │  │
│  │ 4. 初始化工具上下文                                     │  │
│  └────────────────┬───────────────────────────────────────┘  │
│                   │                                           │
│                   ▼                                           │
│  ┌─── query() ─── queryLoop() ────────────────────────────┐  │
│  │                                                         │  │
│  │  ╔═══════════ while(true) ════════════════════════╗    │  │
│  │  ║                                                 ║    │  │
│  │  ║  ┌─────────────────────────┐                   ║    │  │
│  │  ║  │ Snip 压缩               │                   ║    │  │
│  │  ║  │ 微压缩 (Microcompact)   │                   ║    │  │
│  │  ║  │ 上下文坍缩 (Collapse)   │  ◄── 上下文管理   ║    │  │
│  │  ║  │ 自动压缩 (Auto Compact) │                   ║    │  │
│  │  ║  └───────────┬─────────────┘                   ║    │  │
│  │  ║              │                                  ║    │  │
│  │  ║              ▼                                  ║    │  │
│  │  ║  ┌─────────────────────────┐                   ║    │  │
│  │  ║  │  调用 LLM (流式)        │                   ║    │  │
│  │  ║  │  ┌───────────────────┐  │                   ║    │  │
│  │  ║  │  │ StreamingTool     │  │                   ║    │  │
│  │  ║  │  │ Executor          │  │◄── 边输出边执行   ║    │  │
│  │  ║  │  │ (并行工具执行)    │  │                   ║    │  │
│  │  ║  │  └───────────────────┘  │                   ║    │  │
│  │  ║  └───────────┬─────────────┘                   ║    │  │
│  │  ║              │                                  ║    │  │
│  │  ║         ┌────┴────┐                            ║    │  │
│  │  ║         │有工具调用?│                            ║    │  │
│  │  ║         └────┬────┘                            ║    │  │
│  │  ║          /       \                             ║    │  │
│  │  ║      是 /         \ 否                          ║    │  │
│  │  ║        /           \                           ║    │  │
│  │  ║       ▼             ▼                          ║    │  │
│  │  ║  ┌─────────┐  ┌──────────────┐               ║    │  │
│  │  ║  │执行工具  │  │错误恢复检查   │               ║    │  │
│  │  ║  │等待剩余  │  │• prompt_too_long → 压缩重试  ║    │  │
│  │  ║  │结果      │  │• max_output → 升级/续写      ║    │  │
│  │  ║  └────┬────┘  │• 正常完成 → return            ║    │  │
│  │  ║       │       └──────────────┘                 ║    │  │
│  │  ║       ▼                                        ║    │  │
│  │  ║  ┌──────────────────┐                         ║    │  │
│  │  ║  │终止条件检查        │                         ║    │  │
│  │  ║  │• 用户中断?        │──→ return 'aborted'    ║    │  │
│  │  ║  │• 钩子阻止?        │──→ return 'hook_stop'  ║    │  │
│  │  ║  │• 超轮次上限?      │──→ return 'max_turns'  ║    │  │
│  │  ║  └────────┬─────────┘                         ║    │  │
│  │  ║           │ 通过                               ║    │  │
│  │  ║           ▼                                    ║    │  │
│  │  ║  ┌──────────────────┐                         ║    │  │
│  │  ║  │注入附件            │                         ║    │  │
│  │  ║  │• 记忆预取         │                         ║    │  │
│  │  ║  │• 技能发现         │                         ║    │  │
│  │  ║  │• 文件变更检测     │                         ║    │  │
│  │  ║  │• 排队命令         │                         ║    │  │
│  │  ║  └────────┬─────────┘                         ║    │  │
│  │  ║           │                                    ║    │  │
│  │  ║           ▼                                    ║    │  │
│  │  ║   state ← 新状态(更新的消息列表)               ║    │  │
│  │  ║   continue ──────────────────────────→ 循环顶部║    │  │
│  │  ║                                                ║    │  │
│  │  ╚════════════════════════════════════════════════╝    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  收集结果，计算 usage，生成 SDK 响应                           │
└──────────────────────────────────────────────────────────────┘
  │
  ▼
SDK / REPL 输出
```

## 4.4 源码印证

### 4.4.1 QueryEngine：会话生命周期管理

`QueryEngine` 类是每个会话（Conversation）的所有者。它的 `submitMessage` 方法是一个**异步生成器**（`async *submitMessage`），调用者通过 `for await...of` 消费其输出流。

源码中 `QueryEngine` 的构造函数极为简洁：

```typescript
// src/QueryEngine.ts 第 200-207 行（简化）
constructor(config: QueryEngineConfig) {
    this.config = config
    this.mutableMessages = config.initialMessages ?? []
    this.abortController = config.abortController ?? createAbortController()
    this.totalUsage = EMPTY_USAGE
}
```

`mutableMessages` 是跨轮次持久化的消息数组——每次 `submitMessage` 调用都在同一个数组上追加新消息。这种设计使得多轮交互的状态自然保持。

`submitMessage` 的主要工作是**准备上下文**然后**委托给 `query()`**：

```typescript
// src/QueryEngine.ts 第 675-686 行（简化）
for await (const message of query({
    messages,
    systemPrompt,
    userContext,
    systemContext,
    canUseTool: wrappedCanUseTool,
    toolUseContext: processUserInputContext,
    fallbackModel,
    querySource: 'sdk',
    maxTurns,
    taskBudget,
})) {
    // 对 query() 产出的每条消息进行分类处理
    // assistant → 推送到 mutableMessages, 持久化, 向 SDK 输出
    // user (tool_result) → 推送, 持久化
    // stream_event → 累计 usage, 可选输出
    // attachment → 推送, 处理特殊类型
    // system (compact_boundary) → 持久化, 向 SDK 输出
}
```

### 4.4.2 queryLoop：推理循环的真正核心

`query()` 函数本身只是一个薄包装——它调用 `queryLoop()` 并在正常返回后通知命令生命周期。真正的循环在 `queryLoop()` 中。

以下是循环中**上下文管理阶段**的源码结构（`src/query.ts` 第 365-547 行简化）：

```typescript
// 1. 获取压缩边界之后的消息
let messagesForQuery = [...getMessagesAfterCompactBoundary(messages)]

// 2. 应用工具结果预算（裁剪过大的工具输出）
messagesForQuery = await applyToolResultBudget(messagesForQuery, ...)

// 3. Snip 压缩
const snipResult = snipCompactIfNeeded(messagesForQuery)
messagesForQuery = snipResult.messages

// 4. 微压缩
const mcResult = await deps.microcompact(messagesForQuery, ...)
messagesForQuery = mcResult.messages

// 5. 上下文坍缩
const collapseResult = await contextCollapse.applyCollapsesIfNeeded(messagesForQuery, ...)
messagesForQuery = collapseResult.messages

// 6. 自动压缩
const { compactionResult } = await deps.autocompact(messagesForQuery, ...)
if (compactionResult) {
    messagesForQuery = buildPostCompactMessages(compactionResult)
    for (const msg of messagesForQuery) yield msg
}
```

注意这些步骤的顺序是精心设计的：Snip → 微压缩 → 坍缩 → 自动压缩，从轻到重依次尝试。如果较轻的方案已将上下文控制在阈值以下，较重的方案会检测到不需要触发而直接跳过。

**LLM 调用与流式处理**（第 654-863 行简化）使用嵌套循环实现模型降级：

```typescript
let attemptWithFallback = true
while (attemptWithFallback) {
    attemptWithFallback = false
    try {
        for await (const message of deps.callModel({...})) {
            // 判断是否需要扣留（withheld）错误消息
            let withheld = false
            if (isWithheldPromptTooLong(message)) withheld = true
            if (isWithheldMaxOutputTokens(message)) withheld = true
            if (!withheld) yield message

            // 收集工具调用块
            if (message.type === 'assistant') {
                assistantMessages.push(message)
                if (hasToolUseBlocks(message)) needsFollowUp = true
                // 流式提交给 StreamingToolExecutor
                streamingExecutor?.addTool(block, message)
            }
        }
    } catch (error) {
        if (error instanceof FallbackTriggeredError && fallbackModel) {
            currentModel = fallbackModel
            attemptWithFallback = true  // 降级到备用模型重试
            continue
        }
        throw error
    }
}
```

这里的**错误扣留**（Withholding）机制值得关注：当流式输出中出现可恢复的错误（如 `prompt_too_long` 或 `max_output_tokens`）时，系统不会立即将错误暴露给调用者，而是先尝试恢复。只有恢复失败后才输出错误。这避免了 SDK 消费者过早终止会话。

### 4.4.3 自动压缩的触发与执行

自动压缩的触发条件在 `autoCompact.ts` 中明确定义：

```typescript
// src/services/compact/autoCompact.ts 第 72-91 行（简化）
function getAutoCompactThreshold(model):
    effectiveWindow = contextWindowSize - min(maxOutputTokens, 20000)
    return effectiveWindow - 13000  // 预留 13K 缓冲

function shouldAutoCompact(messages, model):
    tokenCount = estimateTokenCount(messages)
    threshold = getAutoCompactThreshold(model)
    return tokenCount >= threshold
```

压缩本身是通过**分叉代理**（Forked Agent）实现的——另起一个 LLM 调用来生成对话摘要。压缩提示词要求模型生成结构化的摘要，保留关键的任务上下文、文件路径、代码变更等信息。

电路断路器机制（第 257-265 行）防止了无限压缩尝试：

```typescript
if (tracking.consecutiveFailures >= 3) {
    return { wasCompacted: false }  // 放弃，不再尝试
}
```

源码注释记录了引入此机制的原因："1,279 sessions had 50+ consecutive failures (up to 3,272) in a single session, wasting ~250K API calls/day globally."——在没有断路器的时代，某些会话会疯狂重试压缩，每天浪费约 25 万次 API 调用。

## 4.5 思考题

**思考题 4-1：递归 vs 迭代的权衡**

Claude Code 的推理循环从递归重构为迭代。但在另一些 Agent 框架中（如 LangGraph），推理循环被建模为有向图的遍历，支持更灵活的控制流（如条件分支、并行分支、子图调用）。请思考：在什么场景下，"平坦的 while 循环 + State 对象"比"图遍历"更优？什么场景下相反？Claude Code 选择前者，是否与其"单 Agent + 工具调用"的架构有关？

**思考题 4-2：流式执行的一致性挑战**

`StreamingToolExecutor` 在 LLM 还在输出时就开始执行工具。假设 LLM 输出了两个工具调用：先读取文件 A，再修改文件 A。由于流式执行，读取操作可能在修改操作的 `tool_use` 块完整输出之前就已经完成。这会导致问题吗？Claude Code 是如何处理这种"读-写依赖"的？（提示：关注并发安全标记和独占执行机制。）

**思考题 4-3：压缩的信息损失**

自动压缩将完整对话历史替换为一个摘要。这意味着模型"忘记"了具体的交互细节。在实践中，这种"遗忘"可能导致模型重复执行已经完成的操作，或者遗漏之前讨论过的约束条件。Claude Code 通过 `messagesToKeep`（保留近期消息）和 `attachments`（重新注入关键文件、记忆、钩子结果）来缓解这一问题。请设计一个实验方案来量化评估压缩带来的信息损失对任务完成率的影响。你会选择什么样的基准任务和评估指标？

## 4.6 小结

本章深入解析了 Claude Code 推理循环的核心算法设计。我们看到，一个看似简单的 `while(true)` 循环背后，蕴含着大量精妙的工程决策：

1. **迭代替代递归**，通过显式 `State` 对象在多个 `continue` 点之间传递完整状态，避免了栈溢出风险并提升了可调试性。`transition` 字段记录了每次继续的原因，为防止恢复策略的无限循环提供了关键的"记忆"。

2. **流式并行管线**通过 `StreamingToolExecutor` 实现了 LLM 输出与工具执行的交织，并发安全标记区分了只读操作（可并行）和副作用操作（须独占），按序交付保证了消息历史的确定性。

3. **多层级上下文管理**——Snip、微压缩、上下文坍缩、自动压缩、反应式压缩——形成了一个从轻到重的"安全网"。每一层都有明确的触发条件和降级路径，既最大化信息保留又避免上下文溢出。电路断路器防止了失败时的无限重试。

4. **防御性终止设计**定义了完整的终止原因枚举，每种原因触发不同的清理逻辑。错误扣留机制在恢复成功时完全透明，仅在恢复失败时才将错误暴露给调用者。

5. **Token 预算管理**覆盖了输入侧（上下文窗口）和输出侧（输出截断恢复），通过元指令引导模型在截断后正确续写，通过预算跟踪在压缩后维持服务端的消耗可见性。

推理循环是 Agent 的心跳。Claude Code 的设计告诉我们：一个健壮的心跳不仅要有力地搏动（高效执行每一轮推理），更要知道何时加速（流式并行）、何时减负（上下文压缩）、何时停止（终止条件），以及在异常时如何恢复而不是崩溃。这些经验对于设计任何 Agent 系统都具有参考价值。
