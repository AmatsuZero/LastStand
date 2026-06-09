+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第5章：工具调度算法"
tags = ["AI Agent", "Claude Code", "算法思想", "工具调度", "反馈闭环"]
categories = ["AI Agent", "Claude Code"]
+++
> "When a tool is called, the real challenge isn't executing it — it's everything that happens before and after."

## 5.1 问题引入

当LLM生成一段包含 `tool_use` 块的响应——例如"我需要读取文件 `src/main.ts`"——系统面临一连串精密的调度决策：

1. **工具发现**：从40余个注册工具中，根据名称（或别名）精确定位到 `FileReadTool`；
2. **输入验证**：用 Zod Schema 验证 LLM 生成的参数是否合法——模型并不总能生成正确的类型；
3. **权限裁决**：经过 PreToolUse Hook → 规则匹配 → 分类器 → 用户交互 的多级权限链，决定是否允许执行；
4. **并发编排**：如果 LLM 同时请求了5次文件读取和1次写入，系统需要判断哪些可以并行、哪些必须串行；
5. **流式执行**：工具在执行过程中通过 AsyncGenerator 逐步报告进度，而非等到完成才返回；
6. **结果注入**：将工具执行结果编排为 `tool_result` 消息，按正确顺序注入回消息流，形成下一轮对话的上下文；
7. **推测执行**：在用户还未确认提示建议时，系统就在后台预执行可能的工具调用，以减少端到端延迟。

这不是一个简单的"查表→调用→返回"的过程。它是一个涉及并发控制、流式处理、权限安全、容错回退的完整调度系统。本章将逐一拆解这些算法。

---

## 5.2 工具注册与发现算法

### 5.2.1 注册表的构建

Claude Code 的工具注册采用**静态声明 + 动态过滤**的两阶段模型。所有工具在 `src/tools.ts` 中被集中声明，形成一个"全量工具池"：

```
源码位置：src/tools.ts — getAllBaseTools()
```

```pseudo
function getAllBaseTools() -> Tool[]:
    baseTools = [
        AgentTool, BashTool, FileReadTool, FileEditTool,
        FileWriteTool, GlobTool, GrepTool, WebFetchTool,
        WebSearchTool, NotebookEditTool, ...
    ]

    // 特性门控：根据环境变量和 feature flag 动态注入
    if feature('AGENT_TRIGGERS'):
        baseTools.append(CronCreateTool, CronDeleteTool, CronListTool)
    if isWorktreeModeEnabled():
        baseTools.append(EnterWorktreeTool, ExitWorktreeTool)
    if isToolSearchEnabledOptimistic():
        baseTools.append(ToolSearchTool)
    // ... 更多条件注入

    return baseTools
```

关键设计决策有三个：

**（1）编译时死代码消除**。对于 feature flag 控制的工具，源码使用 `require()` 而非 `import`，配合 Bun 的 `feature()` 宏实现编译时条件加载。如果某特性未开启，对应工具的代码根本不会被打包进最终产物：

```typescript
const SleepTool = feature('PROACTIVE')
  ? require('./tools/SleepTool/SleepTool.js').SleepTool
  : null
```

**（2）懒加载打破循环依赖**。部分工具（如 `TeamCreateTool`）与 `tools.ts` 存在循环引用关系，通过函数包装延迟 `require` 的时机：

```typescript
const getTeamCreateTool = () =>
  require('./tools/TeamCreateTool/TeamCreateTool.js').TeamCreateTool
```

**（3）`buildTool` 工厂函数**。每个工具通过 `buildTool(def)` 构建，该函数用 `{ ...TOOL_DEFAULTS, ...def }` 的展开语法为未定义的方法填充安全默认值（fail-closed 原则）：

```pseudo
TOOL_DEFAULTS = {
    isEnabled:         () -> true,
    isConcurrencySafe: () -> false,   // 默认不安全 — 保守策略
    isReadOnly:        () -> false,   // 默认假定有写操作
    isDestructive:     () -> false,
    checkPermissions:  () -> { behavior: 'allow' },
}

function buildTool(def) -> Tool:
    return { ...TOOL_DEFAULTS, userFacingName: () -> def.name, ...def }
```

### 5.2.2 动态过滤管线

从全量工具池到最终呈现给模型的工具列表，经过三级过滤：

```pseudo
function getTools(permissionContext) -> Tool[]:
    // 第一级：简单模式过滤
    if CLAUDE_CODE_SIMPLE:
        return filterByDenyRules([BashTool, FileReadTool, FileEditTool], permissionContext)

    // 第二级：全量工具去除特殊工具，再经deny规则过滤
    tools = getAllBaseTools().filter(t -> t.name not in SpecialToolSet)
    allowedTools = filterToolsByDenyRules(tools, permissionContext)

    // 第三级：REPL 模式下隐藏被包装的原子工具
    if isReplModeEnabled() and REPLTool in allowedTools:
        allowedTools = allowedTools.filter(t -> t.name not in REPL_ONLY_TOOLS)

    // 第四级：isEnabled() 动态检查
    return allowedTools.filter(t -> t.isEnabled())
```

`filterToolsByDenyRules` 实现了一个重要的安全特性——**前置拒绝**。它检查每个工具是否被权限规则无条件禁止（blanket deny），如果是则在模型看到工具定义之前就将其剔除，避免模型生成无意义的工具调用。

### 5.2.3 工具查找：名称与别名

当LLM返回一个 `tool_use` 块时，系统需要将工具名称解析为具体的工具对象。这个查找支持**主名称 + 别名**双路径：

```pseudo
function findToolByName(tools, name) -> Tool | undefined:
    return tools.find(t -> t.name == name or name in t.aliases)
```

别名机制解决了工具重命名的向后兼容问题——例如旧的 `KillShell` 可以通过别名映射到新的 `TaskStop`。在 `runToolUse` 中还有一层回退逻辑：如果在当前可用工具列表中找不到，会尝试在全量工具列表中按别名查找：

```pseudo
function runToolUse(toolUse, ...):
    tool = findToolByName(context.options.tools, toolUse.name)
    if tool is null:
        // 回退：检查是否是已废弃工具的别名
        fallback = findToolByName(getAllBaseTools(), toolUse.name)
        if fallback and toolUse.name in fallback.aliases:
            tool = fallback
    if tool is null:
        yield ErrorMessage("No such tool available: " + toolUse.name)
        return
    // ... 继续执行
```

### 5.2.4 工具搜索与延迟加载

当 MCP 工具数量很多时（例如超过上下文窗口的10%），将所有工具定义全部发送给模型是低效的。Claude Code 引入了**工具搜索（Tool Search）** 机制：

```pseudo
// 延迟加载判定
function isDeferredTool(tool) -> boolean:
    return tool.isMcp or tool.shouldDefer

// 在系统提示中，延迟工具只发送一行摘要而非完整 schema
function formatDeferredToolLine(tool) -> string:
    return tool.name + ": " + tool.searchHint

// 模型需要使用某个延迟工具时，先调用 ToolSearchTool
// ToolSearchTool 返回 tool_reference 块，API 将其展开为完整 schema
```

这是一种**按需加载**的策略：模型首先看到所有工具的摘要列表，当它认为需要某个工具时，先调用 `ToolSearch` 来"激活"该工具的完整定义，然后才能在后续轮次中使用。

---

## 5.3 输入验证算法

### 5.3.1 两级验证管线

LLM 并不总能生成完美的工具调用参数。Claude Code 实施两级验证：

```
源码位置：src/services/tools/toolExecution.ts — checkPermissionsAndCallTool()
```

```pseudo
function checkPermissionsAndCallTool(tool, toolUseID, input, context, ...):
    // === 第一级：Schema 验证 (Zod) ===
    parsedInput = tool.inputSchema.safeParse(input)
    if not parsedInput.success:
        errorContent = formatZodValidationError(tool.name, parsedInput.error)

        // 特殊处理：延迟工具的 Schema 未发送
        schemaHint = buildSchemaNotSentHint(tool, context.messages, context.tools)
        if schemaHint:
            errorContent += schemaHint  // 提示模型先调用 ToolSearch

        return ErrorResult(toolUseID, "InputValidationError: " + errorContent)

    // === 第二级：业务逻辑验证 ===
    validationResult = await tool.validateInput(parsedInput.data, context)
    if validationResult.result == false:
        return ErrorResult(toolUseID, validationResult.message)

    // 验证通过，进入权限检查...
```

**第一级 Zod 验证**关注类型安全——字段是否存在、类型是否正确、必填项是否完整。这里有一个精巧的细节：`buildSchemaNotSentHint` 函数检测到延迟工具的 Schema 未被模型看到时，会在错误消息中附加指引，告诉模型去调用 `ToolSearch` 加载完整定义后重试。

**第二级业务验证**由每个工具自行定义。例如 `FileReadTool` 会验证文件路径是否在允许的目录范围内，`BashTool` 会验证命令是否符合当前模式的约束。

### 5.3.2 输入后处理

验证通过后，输入还会经历一系列后处理：

```pseudo
// backfillObservableInput: 在浅拷贝上填充兼容字段
// 目的：让 Hook 和 UI 看到完整字段，但不影响 tool.call() 的原始输入
if tool.backfillObservableInput:
    backfilledClone = { ...processedInput }
    tool.backfillObservableInput(backfilledClone)
    processedInput = backfilledClone  // 用于 Hook/权限检查

callInput = originalProcessedInput  // tool.call() 使用原始输入

// 如果 Hook 或权限系统返回了 updatedInput，则使用更新后的输入
if permissionDecision.updatedInput != undefined:
    callInput = permissionDecision.updatedInput
```

这种"观察输入"和"执行输入"的分离设计值得注意：它确保了 Hook 系统可以看到标准化的字段（例如展开后的路径），而工具本身收到的是模型的原始输入，避免了对转录记录和 VCR 测试哈希的干扰。

---

## 5.4 Generator 流式执行模型

### 5.4.1 为什么是 AsyncGenerator？

Claude Code 的工具执行全链路使用 `AsyncGenerator` 而非 `Promise`。这个设计选择影响深远。

考虑一个执行耗时10秒的 Bash 命令。如果使用 Promise 模型：

```pseudo
// Promise 模型 — 用户在10秒内看不到任何反馈
result = await bashTool.call(input)
yield createToolResult(result)
```

使用 AsyncGenerator 模型：

```pseudo
// AsyncGenerator 模型 — 实时流式反馈
async function* runToolUse(toolUse, ...):
    for await (update of streamedCheckPermissionsAndCallTool(...)):
        yield update  // 每个中间状态都能被外层消费
```

关键优势有三：

1. **实时进度报告**：工具执行过程中的 `ProgressMessage`（如 Bash 的 stdout 输出、Agent 的中间步骤）可以即时推送到 UI；
2. **统一的流式管道**：进度消息、权限请求附件、Hook 附件、最终结果——所有消息类型通过同一个 AsyncGenerator 通道流出，无需为每种消息类型维护独立的回调机制；
3. **天然的取消支持**：当 AbortController 发出信号时，AsyncGenerator 的 `for await...of` 循环自然终止。

### 5.4.2 Stream 桥接器

有趣的是，工具的实际执行（`tool.call()`）返回的是 `Promise<ToolResult>`，而非 Generator。系统通过一个 `Stream` 桥接器将回调式的进度报告转化为流式输出：

```
源码位置：src/services/tools/toolExecution.ts — streamedCheckPermissionsAndCallTool()
```

```pseudo
function streamedCheckPermissionsAndCallTool(tool, ...):
    stream = new Stream<MessageUpdate>()

    // 异步启动工具执行，进度通过回调推入 stream
    checkPermissionsAndCallTool(tool, ...,
        onProgress: (progress) -> stream.enqueue(createProgressMessage(progress))
    )
    .then(results -> results.forEach(r -> stream.enqueue(r)))
    .catch(error -> stream.error(error))
    .finally(() -> stream.done())

    return stream  // 外部通过 for await...of 消费
```

`Stream` 类本质上是一个基于 Promise 链的异步队列——生产者通过 `enqueue()` 推入数据，消费者通过 `for await...of` 拉取数据。这是一个经典的生产者-消费者模式在 JavaScript 异步编程中的实现。

---

## 5.5 并行工具执行算法

### 5.5.1 并发安全分区

当 LLM 在一次响应中请求多个工具调用时，系统需要决定哪些可以并行执行。这通过**分区算法**实现：

```
源码位置：src/services/tools/toolOrchestration.ts — partitionToolCalls()
```

```pseudo
function partitionToolCalls(toolUseMessages, context) -> Batch[]:
    batches = []
    for each toolUse in toolUseMessages:
        tool = findToolByName(context.tools, toolUse.name)
        input = tool.inputSchema.safeParse(toolUse.input)

        // 判定并发安全性
        isSafe = input.success ? tool.isConcurrencySafe(input.data) : false

        // 贪心合并：连续的并发安全工具合并为一个批次
        if isSafe and batches.last().isConcurrencySafe:
            batches.last().blocks.append(toolUse)
        else:
            batches.append({ isConcurrencySafe: isSafe, blocks: [toolUse] })

    return batches
```

分区结果形如：

```
[Read A, Read B, Grep C]  →  并发批次
[Edit D]                   →  串行批次
[Read E, Read F]           →  并发批次
```

每个工具通过 `isConcurrencySafe(input)` 方法声明自身的并发安全性。这个判断是**输入相关**的——例如 `BashTool` 对 `ls` 命令可以并发，但对 `mkdir` 则不行。

### 5.5.2 并发执行器

并发批次内的工具通过 `all()` 函数并行执行，该函数实现了**带并发上限的 Promise.race 调度**：

```
源码位置：src/utils/generators.ts — all()
```

```pseudo
async function* all(generators, concurrencyCap = Infinity):
    waiting = [...generators]   // 等待队列
    promises = Set()             // 活跃的 Promise 集合

    // 启动初始批次，不超过并发上限
    while promises.size < concurrencyCap and waiting is not empty:
        gen = waiting.shift()
        promises.add(advanceGenerator(gen))

    // Promise.race 调度循环
    while promises is not empty:
        { done, value, generator, promise } = await Promise.race(promises)
        promises.delete(promise)

        if not done:
            promises.add(advanceGenerator(generator))  // 推进当前 generator
            yield value                                 // 产出中间结果
        else if waiting is not empty:
            nextGen = waiting.shift()                   // 启动下一个 generator
            promises.add(advanceGenerator(nextGen))
```

这个算法的精妙之处在于：它将多个 AsyncGenerator 的输出"交错合并"为一个单一的 AsyncGenerator 流，同时通过 `concurrencyCap`（默认10）限制并行度。`Promise.race` 确保了"谁先完成谁先输出"的语义。

### 5.5.3 上下文修改器的排队

并发执行带来一个额外挑战：某些工具执行后需要修改共享的 `ToolUseContext`（例如更新文件状态缓存）。并发批次内的上下文修改被排队，等整个批次完成后按工具顺序依次应用：

```pseudo
// 并发批次中的上下文修改延迟应用
queuedContextModifiers = {}
for await (update of runToolsConcurrently(blocks, ...)):
    if update.contextModifier:
        queuedContextModifiers[toolUseID].append(update.contextModifier)
    yield update

// 批次完成后，按工具顺序应用修改
for block in blocks:
    for modifier in queuedContextModifiers[block.id]:
        currentContext = modifier(currentContext)
```

---

## 5.6 流式工具执行器（StreamingToolExecutor）

### 5.6.1 问题：等待全部解析后再执行太慢

默认的 `runTools` 必须等待 LLM 的完整响应解析完毕后才开始执行工具。但在长响应中，第一个 `tool_use` 块可能在第10个块解析完毕前就已就绪。`StreamingToolExecutor` 解决了这个问题——**边解析边执行**。

```
源码位置：src/services/tools/StreamingToolExecutor.ts
```

```pseudo
class StreamingToolExecutor:
    tools: TrackedTool[]  // 每个工具的执行状态
    states: { queued, executing, completed, yielded }

    // 在 LLM 响应流式解析过程中被调用
    addTool(block, assistantMessage):
        tracked = createTrackedTool(block)
        this.tools.append(tracked)
        this.processQueue()  // 立即尝试启动执行

    // 并发控制核心
    canExecuteTool(isConcurrencySafe) -> boolean:
        executing = this.tools.filter(t -> t.status == 'executing')
        return executing.isEmpty()
            or (isConcurrencySafe and executing.all(t -> t.isConcurrencySafe))

    processQueue():
        for tool in this.tools:
            if tool.status != 'queued': continue
            if this.canExecuteTool(tool.isConcurrencySafe):
                this.executeTool(tool)
            else if not tool.isConcurrencySafe:
                break  // 非并发安全工具阻塞队列
```

### 5.6.2 错误级联与兄弟取消

当一个 Bash 命令失败时（例如 `mkdir` 失败导致后续操作无意义），StreamingToolExecutor 会通过**兄弟 AbortController** 级联取消所有并行工具：

```pseudo
executeTool(tool):
    tool.status = 'executing'
    toolAbortController = createChildAbortController(this.siblingAbortController)

    for await (update of runToolUse(tool.block, ..., toolAbortController)):
        // 检测 Bash 错误 → 级联取消
        if isErrorResult(update) and tool.block.name == 'Bash':
            this.hasErrored = true
            this.siblingAbortController.abort('sibling_error')

        // 进度消息立即推送，结果消息缓冲
        if update.message.type == 'progress':
            tool.pendingProgress.append(update.message)
            this.wakeUpConsumer()  // 唤醒 getRemainingResults
        else:
            tool.results.append(update.message)

    tool.status = 'completed'
    promise.finally(() -> this.processQueue())  // 完成后推进队列
```

注意这里的设计决策：**只有 Bash 错误会级联取消兄弟工具**。原因是 Bash 命令之间经常存在隐式依赖链（如 `mkdir` → `cd` → `touch`），而 `Read`、`WebFetch` 等工具是独立的——一个失败不应影响其他工具的执行。

### 5.6.3 有序结果产出

尽管工具可能乱序完成，消费者看到的结果必须保持特定顺序。`getCompletedResults` 实现了**有序消耗**：

```pseudo
*getCompletedResults():
    for tool in this.tools:
        // 进度消息始终立即产出
        while tool.pendingProgress is not empty:
            yield tool.pendingProgress.shift()

        if tool.status == 'yielded': continue

        if tool.status == 'completed' and tool.results:
            tool.status = 'yielded'
            for message in tool.results:
                yield message
        else if tool.status == 'executing' and not tool.isConcurrencySafe:
            break  // 非并发安全的正在执行的工具阻塞后续结果
```

关键语义：进度消息不受排序约束（实时推送），而最终结果遵循"非并发安全工具按顺序、并发安全工具完成即产出"的策略。

---

## 5.7 推测执行算法

### 5.7.1 核心思想

推测执行（Speculation）是 Claude Code 中最具创新性的优化之一。其核心思想是：当系统向用户展示一个**提示建议**（Prompt Suggestion）时，在用户按下回车接受之前，系统就在后台启动一个"分支代理"来预执行这个建议可能产生的工具调用。

```
源码位置：src/services/PromptSuggestion/speculation.ts
```

```pseudo
async function startSpeculation(suggestionText, context, setAppState):
    overlayPath = createOverlayDirectory()

    // 使用 forked agent 在隔离环境中执行
    result = await runForkedAgent({
        promptMessages: [createUserMessage(suggestionText)],
        maxTurns: MAX_SPECULATION_TURNS,  // 上限 20 轮
        canUseTool: speculationPermissionChecker,  // 受限的权限检查器
        onMessage: trackMessages,
    })
```

### 5.7.2 安全边界：Overlay 文件系统

推测执行面临一个关键安全问题：如果模型决定写入文件，而用户最终拒绝了建议，系统如何回滚？Claude Code 通过**文件系统 Overlay（覆盖层）** 解决：

```pseudo
speculationPermissionChecker = (tool, input) ->:
    // 写工具：Copy-on-Write 到 overlay 目录
    if tool.name in WRITE_TOOLS:
        rel = relative(cwd, filePath)
        if isAbsolute(rel) or rel.startsWith('..'):
            return DENY  // 禁止写入 cwd 之外

        if rel not in writtenPaths:
            // 首次写入：将原文件拷贝到 overlay
            copyFile(join(cwd, rel), join(overlayPath, rel))
            writtenPaths.add(rel)

        // 重定向写入到 overlay
        input[pathKey] = join(overlayPath, rel)
        return ALLOW(updatedInput: input)

    // 读工具：如果文件已在 overlay 中被修改，从 overlay 读取
    if tool.name in SAFE_READ_ONLY_TOOLS:
        if rel in writtenPaths:
            input[pathKey] = join(overlayPath, rel)
        return ALLOW(updatedInput: input)

    // Bash：仅允许只读命令
    if tool.name == 'Bash':
        if checkReadOnlyConstraints(input).behavior == 'allow':
            return ALLOW
        else:
            setBoundary({ type: 'bash', command })
            abort()
            return DENY

    // 其他工具：触达边界，停止推测
    setBoundary({ type: 'denied_tool', toolName: tool.name })
    abort()
    return DENY
```

这个算法建立了三类安全边界：

| 边界类型 | 触发条件 | 行为 |
|---------|----------|------|
| 文件编辑边界 | 写工具 + 非 auto 权限模式 | 停止推测，等待用户确认 |
| Bash 边界 | 非只读 bash 命令 | 停止推测 |
| 工具边界 | 任何非白名单工具 | 停止推测 |

### 5.7.3 接受与注入

当用户接受建议时，推测的结果被"嫁接"到主消息流中：

```pseudo
async function acceptSpeculation(state, setAppState):
    messages = state.messagesRef.current

    // 将 overlay 中的文件拷贝回主目录
    await copyOverlayToMain(overlayPath, writtenPaths, cwd)
    removeOverlay(overlayPath)

    // 清洗消息：移除 thinking 块、未成功的 tool_use/tool_result 对、中断消息
    cleanMessages = prepareMessagesForInjection(messages)

    // 如果推测未完成（遇到了边界），截断到最后一个非 assistant 消息
    if not isComplete:
        cleanMessages = truncateTrailingAssistant(cleanMessages)

    return { messages: cleanMessages, timeSavedMs }
```

`prepareMessagesForInjection` 实现了精细的消息清洗逻辑：只保留有成功 `tool_result` 的 `tool_use` 块，剥离 `thinking`/`redacted_thinking` 块，以及中断产生的占位消息。这确保了注入后的消息流在结构上是合法的。

### 5.7.4 流水线化推测

当一次推测完成后，系统立即开始为下一步生成建议——形成"推测→执行→建议→推测"的流水线：

```pseudo
// 推测完成后，立即生成下一个建议
if result.boundary.type == 'complete':
    void generatePipelinedSuggestion(context, suggestion, messages, ...)

// 接受时，如果流水线建议已就绪，直接提升
if isComplete and state.pipelinedSuggestion:
    promoteToUI(state.pipelinedSuggestion)
    void startSpeculation(pipelinedSuggestion.text, augmentedContext, ...)
```

---

## 5.8 超时与取消机制

### 5.8.1 分层 AbortController 架构

Claude Code 的取消机制基于**树状 AbortController** 结构：

```
queryAbortController (查询级)
    └─ StreamingToolExecutor.siblingAbortController (批次级)
          ├─ toolAbortController[0] (工具级)
          ├─ toolAbortController[1]
          └─ toolAbortController[2]
```

- **查询级取消**：用户输入新消息或按 ESC，取消整个查询；
- **批次级取消**：Bash 工具错误时，通过 `siblingAbortController` 取消同批次的其他工具；
- **工具级取消**：权限拒绝时取消单个工具。

关键设计：工具级 AbortController 的 abort 事件会**冒泡**到查询级（除非原因是 `sibling_error`），确保权限拒绝能正确终止整个轮次。

### 5.8.2 中断行为分类

每个工具可以声明自己的中断行为：

```pseudo
// Tool 接口
interruptBehavior?(): 'cancel' | 'block'
```

- `'cancel'`：用户输入新消息时，立即取消工具执行（如文件搜索）；
- `'block'`：用户输入新消息时，等待工具完成后再处理（默认行为）。

StreamingToolExecutor 在产出合成错误消息之前会检查此属性，只对 `cancel` 类工具生成中断消息。

---

## 5.9 架构图解

以下是工具调度的完整流程：

```
LLM 响应流 (含 tool_use 块)
         │
         ▼
┌─────────────────────────────────────────────┐
│            工具发现 (findToolByName)           │
│  主名称匹配 → 别名匹配 → 全量池回退            │
└─────────────┬──────────────────────────┬─────┘
              │ 找到                     │ 未找到
              ▼                          ▼
    ┌──────────────────┐        ErrorMessage:
    │  Zod Schema 验证  │        "No such tool"
    │  + 业务逻辑验证    │
    └────────┬─────────┘
             │ 验证通过
             ▼
    ┌──────────────────────────────────────────┐
    │           PreToolUse Hook 链               │
    │  → 权限决策 (allow/deny/ask)              │
    │  → 规则检查 (deny rules > hook allow)     │
    │  → 分类器 (auto mode)                     │
    │  → 用户交互 (permission dialog)           │
    └────────┬────────────────────────┬────────┘
             │ 允许                    │ 拒绝
             ▼                         ▼
    ┌──────────────────┐        ErrorMessage:
    │   tool.call()     │        权限拒绝原因
    │   (via Stream     │
    │    bridge)        │
    └────────┬─────────┘
             │
    ┌────────┴────────────────────────────────┐
    │         PostToolUse Hook 链               │
    │  → 额外上下文注入                          │
    │  → 输出修改 (MCP tools)                    │
    │  → 阻止继续标志                            │
    └────────┬────────────────────────────────┘
             │
             ▼
    ┌──────────────────────────────────────────┐
    │        结果编排 (Result Mapping)            │
    │  tool.mapToolResultToToolResultBlockParam  │
    │  → tool_result 消息                        │
    │  → 大结果持久化 (maxResultSizeChars)        │
    └────────┬────────────────────────────────┘
             │
             ▼
      注入回消息流 → 下一轮 LLM 调用
```

---

## 5.10 源码印证

以下伪代码展示了查询循环中工具调度的核心路径，综合了 `query.ts` 和 `StreamingToolExecutor` 的逻辑：

```pseudo
async function* queryLoop(params):
    state = initState(params)
    streamingExecutor = new StreamingToolExecutor(tools, canUseTool, context)

    while true:
        // 1. 调用 LLM API，流式接收响应
        for await (event of streamAPI(messages, systemPrompt)):
            if event.type == 'content_block_stop' and isToolUse(event.block):
                toolUseBlocks.append(event.block)

                // 2. 流式执行：边接收边启动工具
                if streamingExecutor and not aborted:
                    streamingExecutor.addTool(event.block, assistantMessage)

                // 3. 消费已完成的结果
                if streamingExecutor and not aborted:
                    for result in streamingExecutor.getCompletedResults():
                        yield result.message
                        toolResults.append(result.message)

        // 4. 流式响应结束后，消费剩余工具结果
        toolUpdates = streamingExecutor
            ? streamingExecutor.getRemainingResults()
            : runTools(toolUseBlocks, assistantMessages, canUseTool, context)

        for await (update of toolUpdates):
            yield update.message
            context = update.newContext
            messages.append(update.message)

        // 5. 判断是否需要继续循环
        if not needsFollowUp:
            return { reason: 'end_turn' }
        // 否则：将工具结果追加到消息列表，开始下一轮
```

---

## 5.11 思考题

**思考题1：为什么 `isConcurrencySafe` 的默认值是 `false` 而非 `true`？**

提示：考虑文件编辑工具同时修改同一文件的场景、Bash 工具隐式依赖链的场景。默认并发安全意味着什么风险？这与 Claude Code 的 "fail-closed" 设计哲学有何关联？

**思考题2：推测执行为什么只允许 "只读 Bash" 和 "文件读写"，而禁止 WebFetch 和 AskUser？**

提示：考虑推测执行的前提假设——"用户将接受建议"。WebFetch 有网络副作用（请求日志、速率限制），AskUser 需要用户交互。如果推测最终被丢弃，这些副作用是否可逆？

**思考题3：StreamingToolExecutor 中进度消息（progress）和结果消息（results）为什么分开处理？**

提示：想象5个并发的文件搜索工具同时运行，每个都在持续报告发现的文件数。如果进度消息也遵循有序消耗规则，用户会看到什么体验？第1个工具的进度堆积，而第2-5个完全无反馈——直到第1个完成。

---

## 5.12 小结

本章剖析了 Claude Code 工具调度系统的六大核心算法：

| 算法 | 核心思想 | 关键源码 |
|------|---------|---------|
| 工具注册与发现 | 静态声明 + 动态过滤 + 别名回退 | `tools.ts`, `Tool.ts` |
| 输入验证 | Zod Schema + 业务逻辑二级管线 | `toolExecution.ts` |
| Generator 流式执行 | AsyncGenerator 统一进度/结果流 | `toolExecution.ts` |
| 并行工具执行 | 并发安全分区 + Promise.race 调度 | `toolOrchestration.ts`, `generators.ts` |
| 流式工具执行 | 边解析边执行 + 有序结果产出 | `StreamingToolExecutor.ts` |
| 推测执行 | Overlay 文件系统 + 安全边界 + 流水线 | `speculation.ts` |

这些算法共同构成了一个既追求低延迟（推测执行、流式执行、并行执行）又确保安全性（分层取消、权限前置、Overlay 隔离）的调度系统。其中最值得借鉴的设计哲学是**fail-closed 默认值**（并发不安全、非只读、不可推测）——系统在"安全"方向犯错的代价远低于在"性能"方向犯错的代价。
