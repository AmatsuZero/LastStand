+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第8章 多 Agent 协调算法"
tags = ["AI Agent", "Claude Code", "算法思想", "多 Agent", "协作算法"]
categories = ["AI Agent", "Claude Code"]
weight = 10
+++
> "任何足够复杂的 AI 系统，最终都会重新发明操作系统。"

当一个 Agent 面对庞大的代码库需要同时研究架构、修改代码、运行测试时，单一上下文窗口的局限性就会暴露无遗。Claude Code 的回答不是让单个 Agent 变得更强，而是让多个 Agent 协作——如同一个工程团队，各司其职，并行推进。

本章深入分析 Claude Code 的多 Agent 协调架构，从最基础的父子 Agent 派生，到 Coordinator 中心调度模式，再到 Swarm 去中心化协作，揭示这些算法背后的核心设计思想。

---

## 8.1 问题引入：为什么需要多 Agent？

考虑一个典型场景：用户要求"修复认证模块中的空指针异常"。一个优秀的 Agent 需要：

1. **研究阶段**：搜索代码库找到相关文件，理解类型定义，分析调用链
2. **实现阶段**：修改代码，添加空值检查
3. **验证阶段**：运行测试，检查类型，确保不引入新问题

单个 Agent 执行这些步骤意味着上下文窗口中充斥着大量搜索结果和中间产物，导致两个核心问题：

- **上下文污染**：研究阶段产生的探索性信息会干扰实现阶段的决策精度
- **串行瓶颈**：研究代码结构和研究测试覆盖本可以并行进行，却只能排队执行

Claude Code 的解决方案是**任务分解与并行执行**——将复杂任务拆分为独立的子任务，由专门的子 Agent 并行完成，最终汇总结果。这种设计需要回答三个核心问题：

1. 如何派生子 Agent 并传递恰当的上下文？
2. 如何在多个 Agent 之间协调任务、同步状态？
3. 如何保证资源隔离，避免 Agent 之间互相干扰？

---

## 8.2 Agent 派生算法

### 8.2.1 AgentTool：派生的入口

在 Claude Code 中，一切 Agent 派生都始于 `AgentTool`。当主 Agent（父 Agent）决定需要子 Agent 协助时，它会调用 AgentTool 工具，指定子 Agent 的类型、任务描述和所需的 prompt。

源码中 `runAgent` 函数是 Agent 派生的核心引擎。它的签名揭示了设计意图：

```typescript
// 简化的 runAgent 签名（源自 AgentTool/runAgent.ts）
async function* runAgent({
  agentDefinition,     // Agent 定义：类型、工具集、系统提示
  promptMessages,      // 任务指令
  toolUseContext,      // 父 Agent 的工具使用上下文
  isAsync,             // 同步 or 异步执行
  forkContextMessages, // 可选：从父 Agent 继承的对话历史
  allowedTools,        // 工具权限白名单
  worktreePath,        // 可选：隔离的 git worktree 路径
  ...
}): AsyncGenerator<Message, void>
```

这是一个 **AsyncGenerator**——它逐条 yield 子 Agent 产生的消息，让父 Agent 可以实时消费结果。这个设计比返回最终结果更灵活：同步 Agent 可以流式展示进度，异步 Agent 可以在后台运行并最终通过通知报告结果。

### 8.2.2 上下文传递的三种模式

Agent 派生中最微妙的决策是：子 Agent 应该继承多少父 Agent 的上下文？Claude Code 提供了三种模式：

**模式一：全新上下文（Clean Slate）**

子 Agent 从空白状态开始，仅接收任务 prompt。适用于独立任务，如代码搜索。

```typescript
// 默认模式：不传递 forkContextMessages
const contextMessages: Message[] = forkContextMessages
  ? filterIncompleteToolCalls(forkContextMessages)
  : []  // 空数组 → 干净的上下文
```

**模式二：继承上下文（Context Forking）**

子 Agent 继承父 Agent 的完整对话历史。适用于需要理解前因后果的跟进任务。

```typescript
// Fork 模式：传递过滤后的父对话历史
const contextMessages = filterIncompleteToolCalls(forkContextMessages)
const initialMessages = [...contextMessages, ...promptMessages]
```

注意 `filterIncompleteToolCalls` 的存在——它过滤掉没有对应 `tool_result` 的 `tool_use` 消息。这是一个关键的防御性设计：如果父 Agent 在中途派生子 Agent，可能存在尚未完成的工具调用，将这些不完整的消息传递给子 Agent 会导致 API 错误。

**模式三：Fork 子 Agent（Prompt Cache 共享）**

这是最精巧的模式。Fork 子 Agent 继承父 Agent 的全部上下文，并且刻意保持 API 请求前缀字节一致，以共享 prompt cache：

```typescript
// forkSubagent.ts - 构建 Fork 消息
function buildForkedMessages(
  directive: string,
  assistantMessage: AssistantMessage,
): Message[] {
  // 1. 保留完整的 assistant 消息（包含所有 tool_use 块）
  const fullAssistantMessage = { ...assistantMessage, uuid: randomUUID() }

  // 2. 为每个 tool_use 生成统一的占位符 tool_result
  const toolResultBlocks = toolUseBlocks.map(block => ({
    type: 'tool_result',
    tool_use_id: block.id,
    content: [{ type: 'text', text: 'Fork started — processing in background' }],
  }))

  // 3. 拼接：统一占位符 + 本 fork 独有的 directive
  return [fullAssistantMessage, createUserMessage({
    content: [...toolResultBlocks, { type: 'text', text: buildChildMessage(directive) }],
  })]
}
```

这里的算法巧思在于：所有 Fork 子 Agent 共享同一个占位符 `tool_result`，差异仅在最后一个 text block（各自的 directive）。这确保了 API 请求的前缀部分完全一致，最大化 prompt cache 命中率。考虑到 prompt cache 可以节省大量 token 成本，这是一个极具实际价值的优化。

### 8.2.3 子 Agent 上下文隔离

`createSubagentContext` 函数是资源隔离的核心。它为每个子 Agent 创建独立的 `ToolUseContext`，精确控制哪些状态共享、哪些隔离：

```typescript
// forkedAgent.ts - 简化的子 Agent 上下文创建
function createSubagentContext(
  parentContext: ToolUseContext,
  overrides?: SubagentContextOverrides,
): ToolUseContext {
  return {
    // ---- 隔离的状态 ----
    readFileState: cloneFileStateCache(parentContext.readFileState),  // 克隆文件缓存
    nestedMemoryAttachmentTriggers: new Set<string>(),               // 全新的触发器集合
    toolDecisions: undefined,                                         // 独立的决策记录
    contentReplacementState: cloneContentReplacementState(...),       // 克隆内容替换状态

    // ---- 独立的 ID 和控制 ----
    agentId: overrides?.agentId ?? createAgentId(),                  // 每个 Agent 有唯一 ID
    abortController: createChildAbortController(parentContext.abortController),

    // ---- 可选共享的回调 ----
    setAppState: overrides?.shareSetAppState
      ? parentContext.setAppState
      : () => {},  // 默认是 no-op

    // ---- 任务注册始终共享 ----
    setAppStateForTasks: parentContext.setAppStateForTasks ?? parentContext.setAppState,

    // ---- UI 回调全部隔离 ----
    addNotification: undefined,
    setToolJSX: undefined,
  }
}
```

这里体现了几个重要的设计决策：

1. **文件状态缓存采用克隆**：子 Agent 读取的文件状态不应影响父 Agent 的缓存，反之亦然。这避免了并行 Agent 之间的缓存混淆。

2. **AbortController 采用父子链接**：`createChildAbortController` 创建一个链接到父控制器的子控制器——父 Agent 被中断时，子 Agent 自动中断；但子 Agent 被中断不影响父 Agent。这是经典的级联取消模式。

3. **setAppState 默认为 no-op**：异步子 Agent 默认不能修改全局 AppState，防止并行 Agent 产生竞态条件。但 `setAppStateForTasks` 始终共享——任务注册和后台 shell 管理必须触达全局状态，否则会留下僵尸进程。

4. **UI 回调全部为 undefined**：子 Agent 无法直接操控父 Agent 的 UI，避免多个 Agent 同时争夺 UI 控制权。

### 8.2.4 内置 Agent 类型体系

Claude Code 预定义了一组内置 Agent 类型，形成了一个"角色分工"系统：

```typescript
// builtInAgents.ts - 内置 Agent 类型
function getBuiltInAgents(): AgentDefinition[] {
  if (isCoordinatorMode()) {
    return getCoordinatorAgents()  // Coordinator 模式有专门的 Agent 集
  }

  const agents = [
    GENERAL_PURPOSE_AGENT,   // 通用 Agent：可读可写，执行多步骤任务
    STATUSLINE_SETUP_AGENT,  // 状态栏配置 Agent
  ]

  if (areExplorePlanAgentsEnabled()) {
    agents.push(EXPLORE_AGENT, PLAN_AGENT)  // 只读搜索 Agent 和规划 Agent
  }

  return agents
}
```

其中 `EXPLORE_AGENT` 的定义最能体现"角色隔离"思想：

```typescript
const EXPLORE_AGENT: BuiltInAgentDefinition = {
  agentType: 'Explore',
  disallowedTools: [AGENT_TOOL_NAME, FILE_EDIT_TOOL_NAME, FILE_WRITE_TOOL_NAME, ...],
  model: 'haiku',         // 用更快更便宜的模型
  omitClaudeMd: true,     // 省略 CLAUDE.md 项目配置
  getSystemPrompt: () => '... READ-ONLY MODE - NO FILE MODIFICATIONS ...',
}
```

Explore Agent 被严格限制为只读模式：禁止所有写入工具，使用更小更快的模型（Haiku），甚至省略 CLAUDE.md 配置文件（因为只读搜索不需要了解提交规范和代码风格）。这种"最小权限"设计节省了 token 开销（仅 CLAUDE.md 的省略就在全量用户中节省了每周数十亿 token），同时确保搜索 Agent 不会意外修改文件。

---

## 8.3 Coordinator 调度算法

### 8.3.1 Coordinator 模式概述

当任务复杂度超过单个 Agent 的能力范围时，Claude Code 提供了一种更高级的协调模式——**Coordinator 模式**。在这种模式下，主 Agent 不再直接执行任务，而是作为"调度员"（Coordinator），将任务分解并分配给多个 Worker Agent 并行执行。

```typescript
// coordinatorMode.ts
function isCoordinatorMode(): boolean {
  return isEnvTruthy(process.env.CLAUDE_CODE_COORDINATOR_MODE)
}
```

Coordinator 模式通过环境变量激活，一旦进入该模式，整个系统的行为发生根本性变化。Coordinator 的系统提示明确定义了其角色：

```
你是一个协调者（coordinator）。你的工作是：
- 帮助用户实现目标
- 指挥 Worker 进行研究、实现和验证代码变更
- 综合结果并与用户沟通
- 在可以直接回答时不要委派工作
```

### 8.3.2 Coordinator 的工具集

Coordinator 的工具集被严格限制，它不能直接读写文件或执行命令：

```typescript
// coordinatorMode.ts - Coordinator 可用的工具
const coordinatorTools = [
  AGENT_TOOL_NAME,         // 派生新 Worker
  SEND_MESSAGE_TOOL_NAME,  // 向已有 Worker 发送消息
  TASK_STOP_TOOL_NAME,     // 停止运行中的 Worker
]
```

这种"只协调、不执行"的设计迫使 Coordinator 将所有实际工作委派给 Worker，保持了架构的清晰分层。Coordinator 甚至被告知："Workers 无法看到你的对话。每个 prompt 必须是自包含的，包含 Worker 所需的一切信息。"

### 8.3.3 任务分解的四阶段模型

Coordinator 的系统提示中定义了一套严谨的任务分解工作流：

| 阶段 | 执行者 | 目的 |
|------|-------|------|
| 研究（Research） | Worker（并行） | 调查代码库，理解问题 |
| 综合（Synthesis） | Coordinator | 阅读研究结果，制定实现方案 |
| 实现（Implementation） | Worker | 按方案修改代码，提交 |
| 验证（Verification） | Worker | 测试变更的正确性 |

最关键的是 **综合阶段**——Coordinator 必须亲自理解 Worker 的研究结果，然后写出具体的实现规格，而不是简单地"转发"。这是系统提示中明确反对的反模式：

```
// 反模式 — 惰性委派
Agent({ prompt: "Based on your findings, fix the auth bug" })

// 正确 — 综合后的具体规格
Agent({ prompt: "Fix the null pointer in src/auth/validate.ts:42.
  The user field on Session is undefined when sessions expire but the
  token remains cached. Add a null check before user.id access —
  if null, return 401 with 'Session expired'." })
```

### 8.3.4 并发控制策略

Coordinator 遵循精确的并发控制规则：

- **只读任务（研究）**：自由并行，多个 Worker 可以同时搜索代码
- **写入任务（实现）**：同一组文件上同一时间只有一个 Worker
- **验证任务**：可以与不同文件区域的实现任务并行

这种分级并发模型避免了多个 Worker 同时修改相同文件导致的冲突，同时最大化了并行度。

### 8.3.5 Worker 续命与重用

Coordinator 不是每次都创建新 Worker，而是通过 `SendMessageTool` 复用已有 Worker：

```typescript
// SendMessage 的核心路由逻辑
if (typeof input.message === 'string' && input.to !== '*') {
  const task = appState.tasks[agentId]

  if (isLocalAgentTask(task) && task.status === 'running') {
    // Worker 仍在运行 → 排队消息
    queuePendingMessage(agentId, input.message, setAppState)
    return { success: true, message: 'Message queued for delivery' }
  }

  // Worker 已停止 → 从磁盘 transcript 恢复
  const result = await resumeAgentBackground({
    agentId,
    prompt: input.message,
    toolUseContext: context,
  })
  return { success: true, message: 'Agent resumed with your message' }
}
```

这里有两个重要机制：

1. **消息排队**：如果 Worker 正在执行中，新消息被排队，等 Worker 当前轮次结束后在下一轮注入。这避免了中断 Worker 的当前工作。

2. **磁盘恢复**：如果 Worker 已停止（完成或失败），系统可以从磁盘上的 sidechain transcript 恢复它的完整对话历史，然后以新消息继续执行。这意味着 Worker 的上下文不会因为停止而丢失。

---

## 8.4 Swarm 并行架构

### 8.4.1 从 Agent 到 Team

当需要更持久、更自主的多 Agent 协作时，Claude Code 提供了 **Swarm 架构**。与 Coordinator 模式中 Worker 是短暂的不同，Swarm 中的 Teammate 是独立的长期运行进程，拥有自己的终端窗口和完整的 Claude Code 实例。

创建 Team 是 Swarm 的第一步：

```typescript
// TeamCreateTool.ts - 创建 Team
async call(input, context) {
  const teamFile: TeamFile = {
    name: finalTeamName,
    description: _description,
    createdAt: Date.now(),
    leadAgentId,                // Team Leader 的 ID
    leadSessionId: getSessionId(),
    members: [{
      agentId: leadAgentId,
      name: TEAM_LEAD_NAME,    // "team-lead"
      joinedAt: Date.now(),
      cwd: getCwd(),
      subscriptions: [],
    }],
  }

  await writeTeamFileAsync(finalTeamName, teamFile)
  registerTeamForSessionCleanup(finalTeamName)  // 会话结束时清理
  await resetTaskList(taskListId)                // 任务编号从 1 开始
}
```

Team 的元数据持久化到磁盘文件中（`~/.claude/teams/{team_name}/team.json`），使得 Team 的状态可以跨进程存活。

### 8.4.2 Teammate 派生的三种后端

`spawnMultiAgent.ts` 中的 `handleSpawn` 函数揭示了 Teammate 派生的三种后端策略：

```typescript
// spawnMultiAgent.ts
async function handleSpawn(input, context) {
  // 策略 1：In-Process（同进程）
  if (isInProcessEnabled()) {
    return handleSpawnInProcess(input, context)
  }

  // 策略 2：尝试面板后端（tmux 或 iTerm2）
  try {
    await detectAndGetBackend()
  } catch (error) {
    // 策略 3：面板不可用时回退到 In-Process
    markInProcessFallback()
    return handleSpawnInProcess(input, context)
  }

  // 使用分屏或独立窗口
  return input.use_splitpane !== false
    ? handleSpawnSplitPane(input, context)
    : handleSpawnSeparateWindow(input, context)
}
```

**In-Process 后端**：Teammate 在同一个 Node.js 进程内运行，通过 `AsyncLocalStorage` 实现上下文隔离。这是最轻量的方式，无需外部依赖。

**Tmux 后端**：每个 Teammate 在 tmux 的一个独立 pane 中运行，拥有完整的 Claude Code 进程。Leader 在左侧面板，Teammate 在右侧面板，用户可以直观地看到每个 Agent 的工作状态。

**iTerm2 后端**：与 Tmux 类似，但使用 iTerm2 的原生分屏功能，提供更好的 macOS 集成体验。

无论使用哪种后端，Teammate 的身份信息都通过 CLI 参数传递：

```typescript
const teammateArgs = [
  `--agent-id ${quote([teammateId])}`,
  `--agent-name ${quote([sanitizedName])}`,
  `--team-name ${quote([teamName])}`,
  `--agent-color ${quote([teammateColor])}`,
  `--parent-session-id ${quote([getSessionId()])}`,
]
```

每个 Teammate 拥有确定性的 ID（格式为 `agentName@teamName`）、唯一的颜色标识（用于 UI 区分），以及对父会话的引用。

### 8.4.3 基于 Mailbox 的消息传递

Swarm 架构中，Agent 间通信采用 **文件系统 Mailbox** 机制——一种经典的异步消息队列模式：

```
文件布局：
~/.claude/teams/{team_name}/inboxes/
  ├── team-lead.json      # Leader 的收件箱
  ├── researcher.json     # Researcher 的收件箱
  └── implementer.json    # Implementer 的收件箱
```

每个 Agent 的收件箱是一个 JSON 文件，包含消息数组：

```typescript
// teammateMailbox.ts
type TeammateMessage = {
  from: string       // 发送者名称
  text: string       // 消息内容
  timestamp: string  // 时间戳
  read: boolean      // 是否已读
  color?: string     // 发送者颜色
  summary?: string   // UI 预览摘要
}
```

写入消息使用文件锁保证并发安全：

```typescript
async function writeToMailbox(
  recipientName: string,
  message: Omit<TeammateMessage, 'read'>,
  teamName?: string,
) {
  const inboxPath = getInboxPath(recipientName, teamName)
  // 使用带重试的文件锁，防止多个 Agent 同时写入
  const LOCK_OPTIONS = {
    retries: { retries: 10, minTimeout: 5, maxTimeout: 100 },
  }
  // ... 加锁、读取、追加、写入、释放锁
}
```

这种基于文件系统的消息传递看似"原始"，但有几个重要优势：

1. **零外部依赖**：不需要 Redis、RabbitMQ 等消息中间件
2. **跨进程通信**：tmux 后端的 Teammate 是独立进程，文件是天然的 IPC 通道
3. **持久化**：消息自动持久化到磁盘，进程崩溃后不丢失
4. **可调试**：可以直接查看 JSON 文件来调试通信问题

### 8.4.4 广播与结构化消息

`SendMessageTool` 支持三种消息路由模式：

```typescript
// 点对点消息
SendMessage({ to: "researcher", message: "查找 auth 模块的入口点" })

// 广播消息
SendMessage({ to: "*", message: "所有人暂停，需求变更了" })

// 结构化消息（用于协议级通信）
SendMessage({ to: "worker-1", message: {
  type: "shutdown_request",
  reason: "任务已完成"
}})
```

结构化消息支持关闭请求/响应协议和计划审批流程，使得 Swarm 具备了进程生命周期管理的能力。

---

## 8.5 结果合并与通知机制

### 8.5.1 同步 Agent 的流式合并

同步 Agent 的结果通过 AsyncGenerator 实时流回父 Agent：

```typescript
// runAgent.ts - 同步 Agent 的消息流
for await (const message of query({
  messages: initialMessages,
  systemPrompt: agentSystemPrompt,
  toolUseContext: agentToolUseContext,
  maxTurns: maxTurns ?? agentDefinition.maxTurns,
})) {
  if (isRecordableMessage(message)) {
    // 1. 持久化到 sidechain transcript（磁盘）
    await recordSidechainTranscript([message], agentId, lastRecordedUuid)
    // 2. yield 给父 Agent
    yield message
  }
}
```

父 Agent 的 AgentTool 实现会收集所有 yield 的消息，通过 `finalizeAgentTool` 提取最终结果：

```typescript
function finalizeAgentTool(agentMessages, agentId, metadata): AgentToolResult {
  const lastAssistantMessage = getLastAssistantMessage(agentMessages)
  return {
    agentId,
    content: lastAssistantMessage.message.content.filter(b => b.type === 'text'),
    totalToolUseCount: countToolUses(agentMessages),
    totalDurationMs: Date.now() - metadata.startTime,
    totalTokens: getTokenCountFromUsage(lastAssistantMessage.message.usage),
    usage: lastAssistantMessage.message.usage,
  }
}
```

### 8.5.2 异步 Agent 的通知机制

异步 Agent 的结果通过 `<task-notification>` XML 消息注入父 Agent 的对话流：

```xml
<task-notification>
  <task-id>agent-a1b2c3</task-id>
  <status>completed</status>
  <summary>Agent "Investigate auth bug" completed</summary>
  <result>Found null pointer in src/auth/validate.ts:42...</result>
  <usage>
    <total_tokens>15000</total_tokens>
    <tool_uses>8</tool_uses>
    <duration_ms>12500</duration_ms>
  </usage>
</task-notification>
```

这些通知以 user 角色消息的形式注入，使父 Agent（或 Coordinator）能够根据结果决定下一步行动。`runAsyncAgentLifecycle` 函数管理整个异步生命周期：

```typescript
// agentToolUtils.ts - 简化的异步 Agent 生命周期
async function runAsyncAgentLifecycle({ taskId, makeStream, ... }) {
  try {
    for await (const message of makeStream(onCacheSafeParams)) {
      agentMessages.push(message)
      updateAsyncAgentProgress(taskId, getProgressUpdate(tracker), rootSetAppState)
    }

    // 成功完成
    const agentResult = finalizeAgentTool(agentMessages, taskId, metadata)
    completeAsyncAgent(agentResult, rootSetAppState)
    enqueueAgentNotification({ taskId, status: 'completed', finalMessage, ... })

  } catch (error) {
    if (error instanceof AbortError) {
      // 被用户或 Coordinator 中止
      killAsyncAgent(taskId, rootSetAppState)
      enqueueAgentNotification({ taskId, status: 'killed', ... })
    } else {
      // 执行失败
      failAsyncAgent(taskId, errorMessage(error), rootSetAppState)
      enqueueAgentNotification({ taskId, status: 'failed', error: msg, ... })
    }
  }
}
```

注意三种终态：`completed`（成功）、`killed`（被中止）、`failed`（失败）。被中止的 Agent 还会尝试提取部分结果（`extractPartialResult`），让 Coordinator 了解 Agent 在中止前完成了什么工作。

---

## 8.6 资源隔离与生命周期管理

### 8.6.1 工具权限隔离

不同类型的 Agent 拥有不同的工具权限。`filterToolsForAgent` 函数实现了精确的权限控制：

```typescript
function filterToolsForAgent({ tools, isBuiltIn, isAsync, permissionMode }) {
  return tools.filter(tool => {
    if (tool.name.startsWith('mcp__')) return true       // MCP 工具始终允许
    if (ALL_AGENT_DISALLOWED_TOOLS.has(tool.name)) return false  // 全局禁止列表
    if (!isBuiltIn && CUSTOM_AGENT_DISALLOWED_TOOLS.has(tool.name)) return false
    if (isAsync && !ASYNC_AGENT_ALLOWED_TOOLS.has(tool.name)) return false
    return true
  })
}
```

异步 Agent 的工具集被严格限制在 `ASYNC_AGENT_ALLOWED_TOOLS` 白名单中，防止后台 Agent 执行需要用户交互的操作。自定义 Agent（用户定义的）则有额外的工具限制，防止用户定义的 Agent 执行敏感操作。

### 8.6.2 权限模式继承

Agent 的权限模式（permission mode）遵循一套严格的继承规则：

```typescript
// runAgent.ts - 权限模式覆盖逻辑
const agentGetAppState = () => {
  const state = toolUseContext.getAppState()

  // 父 Agent 的 bypassPermissions 或 acceptEdits 始终优先
  if (agentPermissionMode &&
      state.toolPermissionContext.mode !== 'bypassPermissions' &&
      state.toolPermissionContext.mode !== 'acceptEdits') {
    toolPermissionContext = { ...toolPermissionContext, mode: agentPermissionMode }
  }

  // 异步 Agent 默认不显示权限提示（自动拒绝）
  if (isAsync && !canShowPermissionPrompts) {
    toolPermissionContext = {
      ...toolPermissionContext,
      shouldAvoidPermissionPrompts: true
    }
  }
}
```

这确保了安全模式不会被子 Agent 降级：如果父 Agent 在 `bypassPermissions` 模式（已获得用户完全信任），子 Agent 继承这种信任；如果父 Agent 在常规模式，子 Agent 可以有自己的权限模式，但不能超越父 Agent 的安全级别。

### 8.6.3 完善的清理机制

Agent 生命周期结束时，`runAgent` 的 `finally` 块确保所有资源被正确释放：

```typescript
finally {
  await mcpCleanup()                           // 清理 Agent 专属 MCP 服务器
  clearSessionHooks(rootSetAppState, agentId)   // 清理会话钩子
  cleanupAgentTracking(agentId)                 // 清理 prompt cache 追踪
  agentToolUseContext.readFileState.clear()      // 释放文件缓存
  initialMessages.length = 0                     // 释放消息数组
  unregisterPerfettoAgent(agentId)              // 释放 Perfetto 追踪条目
  clearAgentTranscriptSubdir(agentId)           // 释放 transcript 子目录映射

  // 释放 todos 条目，防止内存泄漏
  rootSetAppState(prev => {
    if (!(agentId in prev.todos)) return prev
    const { [agentId]: _removed, ...todos } = prev.todos
    return { ...prev, todos }
  })

  // 杀死后台 shell 任务，防止僵尸进程
  killShellTasksForAgent(agentId, getAppState, rootSetAppState)
}
```

特别值得注意的是 `killShellTasksForAgent`——如果子 Agent 通过 `run_in_background` 启动了后台 shell 命令，这些进程会在 Agent 结束时被清理。没有这个机制，长时间运行的会话可能会累积大量 PPID=1 的孤儿进程。

---

## 8.7 架构图解

Claude Code 的多 Agent 协调形成了三种拓扑结构：

```
┌─────────────────────────────────────────────────────┐
│           拓扑一：星形（Agent 派生）                   │
│                                                       │
│              ┌──────────┐                             │
│              │  主 Agent │                             │
│              └──┬───┬───┘                             │
│            ┌────┘   └────┐                            │
│     ┌──────▼──┐    ┌──────▼──┐                        │
│     │ Explore  │    │ General │                        │
│     │ (只读)   │    │ Purpose │                        │
│     └─────────┘    └─────────┘                        │
│     同步返回结果    同步返回结果                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│         拓扑二：星形+异步（Coordinator 模式）          │
│                                                       │
│             ┌─────────────┐                           │
│             │ Coordinator │                            │
│             └──┬───┬───┬──┘                           │
│           ┌────┘   │   └────┐                         │
│    ┌──────▼──┐ ┌───▼────┐ ┌─▼────────┐               │
│    │Worker-1 │ │Worker-2│ │ Worker-3  │               │
│    │(研究)   │ │(研究)  │ │(实现)     │               │
│    └────┬────┘ └───┬────┘ └────┬──────┘               │
│         │          │           │                      │
│    <task-notification> 异步通知回 Coordinator           │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│            拓扑三：网状（Swarm 架构）                   │
│                                                       │
│    ┌──────────┐    Mailbox     ┌──────────┐          │
│    │  Leader   │◄─────────────►│Teammate-1│          │
│    │(team-lead)│               │(researcher)          │
│    └──┬───┬───┘               └──────────┘           │
│       │   │       Mailbox     ┌──────────┐           │
│       │   └──────────────────►│Teammate-2│           │
│       │                       │(implementer)          │
│       │       Mailbox         └─────┬────┘           │
│       └──────────────────┐          │                │
│                    ┌─────▼────┐     │ Mailbox         │
│                    │Teammate-3│◄────┘                │
│                    │(verifier) │                       │
│                    └──────────┘                       │
│    各 Agent 独立进程，通过文件 Mailbox 通信             │
└─────────────────────────────────────────────────────┘
```

三种拓扑对应不同的复杂度级别：

- **星形同步**：简单任务分解，父 Agent 同步等待子 Agent 结果
- **星形异步**：Coordinator 并行派发任务，通过通知收集结果
- **网状**：完全去中心化，Teammate 之间可以直接通信（包括广播）

---

## 8.8 思考题

**思考题 1：Fork 子 Agent 的 prompt cache 共享策略**

`buildForkedMessages` 函数为所有 Fork 子 Agent 生成统一的 `tool_result` 占位符，差异仅在最后一个 text block。请思考：如果某个 Fork 子 Agent 需要额外的上下文信息（比如特定文件的内容），如何在不破坏 prompt cache 共享的前提下传递？是否可以借鉴"差分编码"的思想？

**思考题 2：Mailbox 的一致性保证**

当前 Mailbox 使用文件锁保证并发写入安全，但没有使用分布式事务。在以下场景中可能出现什么问题：Leader 同时向 3 个 Teammate 发送任务，其中一个 Teammate 的 Mailbox 写入失败？系统如何保证"要么全部送达，要么全部回滚"？在 Claude Code 的设计中，为什么可以接受"尽力而为"的语义而非严格的事务语义？

**思考题 3：Agent 递归深度控制**

Fork 子 Agent 通过 `isInForkChild` 检测对话历史中的 `<fork-boilerplate>` 标签来防止递归 Fork。但如果对话被 auto-compact（自动压缩）后，标签被移除了怎么办？源码中使用 `querySource` 作为备用检测机制。请分析这种"多重防御"策略的设计思想，以及它如何平衡安全性和 prompt cache 效率。

---

## 8.9 小结

Claude Code 的多 Agent 协调系统并非一个单一的框架，而是一组互补的机制，它们共同解决了"让多个 AI Agent 有效协作"这一核心挑战：

1. **Agent 派生算法**通过 `runAgent` 和 `createSubagentContext` 提供了精确的上下文传递和状态隔离能力。三种上下文模式（全新、继承、Fork）适配了从简单搜索到复杂实现的各种场景。

2. **Coordinator 调度算法**实现了一种"只协调不执行"的中心化模式，通过四阶段任务分解（研究、综合、实现、验证）和精确的并发控制，让复杂任务可以被系统化地拆解和并行执行。

3. **Swarm 并行架构**通过文件系统 Mailbox 实现了去中心化的 Agent 通信，支持 In-Process、Tmux、iTerm2 三种后端，在轻量级和完全隔离之间提供了灵活选择。

4. **资源管理**贯穿整个设计——从工具权限的分层控制，到文件缓存的克隆隔离，到 AbortController 的级联取消，再到 `finally` 块中的全面清理——确保多 Agent 系统在任何终止条件下都不会泄漏资源。

这些设计的共同哲学是：**宁可多一层隔离，不可少一重防护**。每个 Agent 默认是完全隔离的，只有在明确需要时才选择性地共享状态。这种"默认隔离、显式共享"的原则，是构建可靠多 Agent 系统的关键。

从算法思想的角度，Claude Code 的多 Agent 系统综合运用了操作系统中的进程管理（fork/exec）、消息队列（Mailbox）、级联取消（AbortController 树）和最小权限原则，将这些经典的系统设计范式成功应用于 AI Agent 协调领域。这提醒我们：AI 系统的工程挑战，往往能在传统系统设计中找到成熟的解决方案。
