+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第12章 性能优化算法"
tags = ["AI Agent", "Claude Code", "算法思想", "性能优化", "缓存"]
categories = ["AI Agent", "Claude Code"]
weight = 14
+++
> "过早优化是万恶之源，但在正确的时机做正确的优化，则是工程艺术的巅峰。"

## 12.1 问题引入

一个成熟的 AI Agent 系统面临着多维度的性能挑战。Claude Code 作为一个包含数十万行 TypeScript 代码的终端 AI 助手，需要同时解决以下问题：

- **启动速度**：用户在终端输入 `claude` 后，如何在亚秒级时间内完成初始化？数百个模块的加载、配置的解析、API 客户端的构建——任何一项阻塞都意味着体验的劣化。
- **上下文窗口管理**：模型的上下文窗口是有限的（通常为 200K tokens），而一个长时间的编程会话可能产生数百万 tokens 的对话内容。如何在不超过窗口限制的前提下最大化信息密度？
- **内存控制**：终端 UI 需要维护大量的渲染状态。一个包含 1000 条消息的会话，如果不做虚拟化，仅 React fiber 和 Yoga 布局节点就可能消耗 250MB 内存。
- **渲染流畅性**：流式输出时每个 token 都会触发渲染更新。如何避免因频繁重绘导致的 CPU 峰值和卡顿？

本章将深入剖析 Claude Code 针对这些问题的系统性优化策略，从 Token 计数的精妙权衡，到上下文压缩的三级体系，再到终端渲染的虚拟滚动算法。每一项优化背后都蕴含着对"精确性"与"速度"之间平衡的深刻思考。

## 12.2 启动优化策略

### 12.2.1 性能度量驱动的优化

Claude Code 遵循一个朴素但有效的原则：**不能度量的东西无法优化**。启动阶段的每一个关键检查点都被 `startupProfiler` 精确记录：

```typescript
// startupProfiler.ts — 启动性能度量框架
const PHASE_DEFINITIONS = {
  import_time: ['cli_entry', 'main_tsx_imports_loaded'],
  init_time: ['init_function_start', 'init_function_end'],
  settings_time: ['eagerLoadSettings_start', 'eagerLoadSettings_end'],
  total_time: ['cli_entry', 'main_after_run'],
}

export function profileCheckpoint(name: string): void {
  if (!SHOULD_PROFILE) return  // 非采样用户零开销
  const perf = getPerformance()
  perf.mark(name)
  if (DETAILED_PROFILING) {
    memorySnapshots.push(process.memoryUsage())
  }
}
```

该框架采用**分层采样**策略：100% 的内部用户和 0.5% 的外部用户被采样记录启动性能指标，而完整的内存快照报告仅在显式启用 `CLAUDE_CODE_PROFILE_STARTUP=1` 时生成。这种设计确保了生产环境中性能数据的持续可观测性，同时将度量本身的开销降至最低。

### 12.2.2 延迟加载与死代码消除

Claude Code 的启动优化中，**延迟加载（Lazy Loading）**是最重要的策略之一。其核心思想是：只在真正需要时才加载模块。

以 AWS Bedrock SDK 为例，该依赖包约 279KB，但仅在用户配置了 Bedrock 后端时才需要：

```typescript
// tokenEstimation.ts — 按需加载重型依赖
// @aws-sdk/client-bedrock-runtime is imported dynamically in countTokensWithBedrock()
// to defer ~279KB of AWS SDK code until a Bedrock call is actually made
async function countTokensWithBedrock(...) {
  const { CountTokensCommand } = await import('@aws-sdk/client-bedrock-runtime')
  // 仅在此处才发生实际加载
}
```

类似地，Zod schema 的构造也被延迟到首次访问：

```typescript
// lazySchema.ts — 延迟 schema 构造
export function lazySchema<T>(factory: () => T): () => T {
  let cached: T | undefined
  return () => (cached ??= factory())
}
```

`??=` 运算符的使用极为精炼——它确保工厂函数仅被调用一次，后续访问直接返回缓存结果。

在构建层面，Claude Code 利用 Bun 打包器的 `feature()` 机制实现**编译期死代码消除**。例如，仅内部可用的功能（如 Proactive 模式）在外部构建中会被完全剔除：

```typescript
// feature() — 编译期条件分支
const proactiveModule = feature('PROACTIVE')
  ? require('../../proactive/index.js')
  : null
```

当 `PROACTIVE` feature flag 为 `false` 时，整个 `require` 分支及其传递依赖在打包阶段即被消除，不会进入最终产物。

### 12.2.3 并行预取

启动过程中存在许多相互独立的初始化任务，如加载用户配置、初始化 API 客户端、检查认证状态等。Claude Code 通过 `Promise.all` 将这些任务并行化，将总启动时间从各任务耗时之和降低到最慢任务的耗时。

值得注意的是，钥匙串预取（`keychainPrefetch`）是一个典型的乐观并行策略——在启动早期就异步读取可能需要的凭证，即使最终可能不使用，其边际成本也远低于需要时再同步读取的延迟代价。

## 12.3 Token 计数与预估算法

### 12.3.1 精确计数与快速预估的权衡

Token 计数是上下文管理的基础。Claude Code 同时维护两套计数机制，在不同场景中选择最合适的方案：

**精确计数**通过 API 调用实现，分为两种路径：

```typescript
// 路径1：专用 countTokens 端点（首选）
const response = await anthropic.beta.messages.countTokens({
  model: normalizeModelStringForAPI(model),
  messages: messages,
  tools: tools,
})
return response.input_tokens

// 路径2：Haiku 回退——当 countTokens 不可用时
// 发送一个 max_tokens=1 的请求，从 usage 中获取 input_tokens
const response = await anthropic.beta.messages.create({
  model: normalizeModelStringForAPI(model),
  max_tokens: containsThinking ? TOKEN_COUNT_MAX_TOKENS : 1,
  messages: messagesToSend,
})
```

**快速预估**则采用简单的字符除法：

```typescript
export function roughTokenCountEstimation(
  content: string,
  bytesPerToken: number = 4,
): number {
  return Math.round(content.length / bytesPerToken)
}
```

"每 4 个字符约等于 1 个 token"是一个经验值，对于一般的英文代码内容足够准确。但系统对此做了**文件类型感知**的修正：

```typescript
export function bytesPerTokenForFileType(fileExtension: string): number {
  switch (fileExtension) {
    case 'json':
    case 'jsonl':
    case 'jsonc':
      return 2   // JSON 中大量单字符 token: {, }, :, ", 等
    default:
      return 4
  }
}
```

JSON 文件因其结构性字符密度高，每个 token 平均仅对应约 2 个字符。如果仍按 4 字符预估，会严重低估 token 数量，导致过大的内容滑入上下文窗口。

### 12.3.2 混合估算算法

真正精妙的是 `tokenCountWithEstimation`——它将 API 返回的精确计数与本地快速预估相结合：

```typescript
export function tokenCountWithEstimation(messages: readonly Message[]): number {
  // 1. 从后向前找到最近一次 API 响应的 usage 数据
  let i = messages.length - 1
  while (i >= 0) {
    const usage = getTokenUsage(messages[i])
    if (usage) {
      // 2. 处理并行工具调用的分裂消息
      const responseId = getAssistantMessageId(messages[i])
      if (responseId) {
        // 回溯到同一 API 响应的第一条分裂消息
        let j = i - 1
        while (j >= 0) {
          if (getAssistantMessageId(messages[j]) === responseId) i = j
          else if (getAssistantMessageId(messages[j]) !== undefined) break
          j--
        }
      }
      // 3. 精确计数 + 新增消息的粗略估算
      return getTokenCountFromUsage(usage) +
        roughTokenCountEstimationForMessages(messages.slice(i + 1))
    }
    i--
  }
  // 4. 无 API 数据时，全部使用粗略估算
  return roughTokenCountEstimationForMessages(messages)
}
```

该算法的核心洞察是：**最近一次 API 响应的 usage 反映了当时整个上下文窗口的精确大小**（包含所有历史消息），因此只需要对"那次响应之后新增的消息"做粗略估算即可。这避免了对全量消息的逐一计算，同时保持了足够的精度。

特别值得关注的是对**并行工具调用分裂消息**的处理。当模型在一次响应中发起多个工具调用时，流式处理代码会为每个 content block 生成一条独立的 `AssistantMessage`，它们共享同一个 `message.id`。消息数组呈现为：

```
[..., assistant(id=A), user(result), assistant(id=A), user(result), ...]
```

如果仅从最后一条 `assistant(id=A)` 开始估算，就会遗漏中间穿插的 `user(result)` 消息。算法通过回溯到同一 `id` 的第一条 assistant 消息来解决此问题。

### 12.3.3 Token 预算管理

Token 预算管理系统将上下文窗口划分为多个区域：

```
┌─────────────────────────────────────────────────┐
│                  Context Window                  │
│ ┌─────────────────────────────────────────────┐ │
│ │          Effective Context Window            │ │
│ │  (contextWindow - maxOutputTokens)          │ │
│ │ ┌───────────────────────────────────────┐   │ │
│ │ │        Auto-Compact Threshold         │   │ │
│ │ │  (effective - 13K buffer)             │   │ │
│ │ │ ┌─────────────────────────────────┐   │   │ │
│ │ │ │    Warning Threshold            │   │   │ │
│ │ │ │  (threshold - 20K)              │   │   │ │
│ │ │ └─────────────────────────────────┘   │   │ │
│ │ └───────────────────────────────────────┘   │ │
│ └─────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────┐ │
│ │  Blocking Limit (effective - 3K)            │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

```typescript
export function calculateTokenWarningState(tokenUsage: number, model: string) {
  const autoCompactThreshold = getAutoCompactThreshold(model)
  const threshold = isAutoCompactEnabled()
    ? autoCompactThreshold
    : getEffectiveContextWindowSize(model)

  const percentLeft = Math.max(0,
    Math.round(((threshold - tokenUsage) / threshold) * 100))
  const warningThreshold = threshold - WARNING_THRESHOLD_BUFFER_TOKENS  // -20K
  const errorThreshold = threshold - ERROR_THRESHOLD_BUFFER_TOKENS      // -20K
  const blockingLimit = actualContextWindow - MANUAL_COMPACT_BUFFER_TOKENS // -3K

  return {
    percentLeft,
    isAboveWarningThreshold: tokenUsage >= warningThreshold,
    isAboveErrorThreshold: tokenUsage >= errorThreshold,
    isAboveAutoCompactThreshold: tokenUsage >= autoCompactThreshold,
    isAtBlockingLimit: tokenUsage >= blockingLimit,
  }
}
```

每个阈值对应不同的响应策略：超过 warning 阈值时 UI 开始显示剩余百分比；超过 auto-compact 阈值时自动触发压缩；达到 blocking limit 时阻塞新的用户输入，强制要求手动压缩。

## 12.4 上下文压缩的三级体系

当上下文接近窗口限制时，Claude Code 通过三个层次递进地管理内容：**微压缩（Microcompact）**、**会话记忆压缩（Session Memory Compact）**、**全量压缩（Full Compact）**。

### 12.4.1 微压缩：不丢信息的精准瘦身

微压缩的策略是：**清除历史工具调用结果的内容，保留结构**。这基于一个关键观察——模型已经消化过这些结果并据此做出了后续决策，保留旧的原始输出对继续对话的贡献有限。

系统定义了可压缩的工具集合：

```typescript
const COMPACTABLE_TOOLS = new Set([
  'Read', 'Bash', 'PowerShell', 'Grep', 'Glob',
  'WebSearch', 'WebFetch', 'Edit', 'Write',
])
```

微压缩有三条路径，按优先级依次尝试：

**路径一：时间触发微压缩**。当用户离开一段时间后回来继续对话，服务端的 prompt cache 已过期。此时清除旧工具结果不会影响缓存命中，反而能显著减小重新编码的内容量：

```typescript
function maybeTimeBasedMicrocompact(messages, querySource) {
  const lastAssistant = messages.findLast(m => m.type === 'assistant')
  const gapMinutes = (Date.now() - new Date(lastAssistant.timestamp).getTime()) / 60_000

  if (gapMinutes < config.gapThresholdMinutes) return null

  const keepSet = new Set(compactableIds.slice(-keepRecent))
  // 保留最近 N 个工具结果，清除其余
  for (const block of blocks) {
    if (clearSet.has(block.tool_use_id)) {
      block.content = '[Old tool result content cleared]'
    }
  }
}
```

**路径二：缓存编辑微压缩**。这是最精妙的路径。当服务端的 prompt cache 仍然热（warm）时，直接修改消息内容会导致缓存失效。缓存编辑微压缩通过 API 层面的 `cache_edits` 指令，让服务端在缓存内部直接删除指定的工具结果，**不改变本地消息内容，不破坏缓存前缀**：

```typescript
async function cachedMicrocompactPath(messages, querySource) {
  const toolsToDelete = mod.getToolResultsToDelete(state)
  if (toolsToDelete.length > 0) {
    // 不修改 messages，而是生成 cache_edits 指令
    pendingCacheEdits = mod.createCacheEditsBlock(state, toolsToDelete)
    // messages 原样返回——cache_edits 在 API 层注入
    return { messages, compactionInfo: { pendingCacheEdits: ... } }
  }
}
```

**路径三：Token 预算强制**。`enforceToolResultBudget` 对每条 API 级别的 user 消息施加聚合预算。当一条消息中所有工具结果的总大小超过阈值时，将最大的结果持久化到磁盘，替换为包含文件路径和预览的引用：

```typescript
// toolResultStorage.ts — 大结果落盘策略
async function maybePersistLargeToolResult(toolResultBlock, toolName, threshold) {
  const size = contentSize(content)
  if (size <= threshold) return toolResultBlock  // 快速路径：小结果直接通过

  const result = await persistToolResult(content, toolResultBlock.tool_use_id)
  return { ...toolResultBlock, content: buildLargeToolResultMessage(result) }
}

// 生成的引用消息格式：
// <persisted-output>
// Output too large (66.8KB). Full output saved to: /path/to/file.txt
// Preview (first 2KB):
// [前2KB内容]
// ...
// </persisted-output>
```

该机制的设计有几个值得注意的细节：

1. **幂等写入**：使用 `flag: 'wx'`（排他创建），如果文件已存在则跳过写入，避免微压缩重播时的重复 I/O。
2. **状态冻结**：通过 `ContentReplacementState` 跟踪每个 `tool_use_id` 的决策。一旦某个结果被标记为"已见"，其命运（替换或保留）在整个会话中固定不变，确保 prompt cache 前缀稳定。
3. **Preview 截断**：在行边界而非字节边界截断，避免破坏代码结构的可读性。

### 12.4.2 会话记忆压缩

会话记忆压缩（Session Memory Compact）是一种轻量级的压缩策略，它尝试通过剪除旧消息（而非重新摘要）来释放空间。这种方式比全量压缩快得多，因为不需要调用 LLM 生成摘要。

### 12.4.3 全量压缩：LLM 驱动的智能摘要

当微压缩无法释放足够空间时，系统执行全量压缩。其核心是让 LLM 阅读完整对话历史并生成结构化摘要。

压缩 prompt 的设计体现了对信息保留优先级的深思熟虑：

```
摘要需包含以下章节：
1. 主要请求与意图
2. 关键技术概念
3. 文件与代码片段（包含完整代码片段！）
4. 错误与修复（特别关注用户的反馈）
5. 问题解决过程
6. 所有用户消息（非工具结果的用户消息）
7. 待处理任务
8. 当前工作（含文件名和代码片段）
9. 可选的下一步
```

尤其值得注意的是"所有用户消息"的要求——这确保了用户的意图和反馈不会在压缩中丢失。

Claude Code 还引入了**分析-摘要两阶段**方法，通过 `<analysis>` 标签让模型先进行思维整理：

```typescript
export function formatCompactSummary(summary: string): string {
  // 剥离分析阶段——它是提升摘要质量的草稿，不应进入最终上下文
  formattedSummary = formattedSummary.replace(
    /<analysis>[\s\S]*?<\/analysis>/, '')
  // 提取摘要正文
  const summaryMatch = formattedSummary.match(/<summary>([\s\S]*?)<\/summary>/)
  // ...
}
```

`<analysis>` 块作为"思维草稿纸"存在——它提升了摘要生成的质量（因为模型在写出最终摘要前先做了系统性分析），但被 `formatCompactSummary` 在存入上下文前剥离，避免浪费宝贵的上下文空间。

全量压缩还支持**部分压缩（Partial Compact）**，这是一种精细化的策略。系统将对话按 API 轮次分组：

```typescript
export function groupMessagesByApiRound(messages: Message[]): Message[][] {
  const groups: Message[][] = []
  let current: Message[] = []
  let lastAssistantId: string | undefined

  for (const msg of messages) {
    if (msg.type === 'assistant' &&
        msg.message.id !== lastAssistantId &&
        current.length > 0) {
      groups.push(current)
      current = [msg]
    } else {
      current.push(msg)
    }
    if (msg.type === 'assistant') lastAssistantId = msg.message.id
  }
  return groups
}
```

部分压缩只压缩前半部分的对话（利用缓存命中），保留最近的消息原文。这在信息保留和空间释放之间取得了更好的平衡：最近的上下文是最可能被引用的，保留原文比摘要更有价值。

### 12.4.4 熔断机制

自动压缩的一个关键防御机制是**连续失败熔断器**：

```typescript
const MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES = 3

if (tracking?.consecutiveFailures >= MAX_CONSECUTIVE_AUTOCOMPACT_FAILURES) {
  return { wasCompacted: false }
  // 日志: "circuit breaker tripped — skipping future attempts this session"
}
```

数据表明，约 1,279 个会话曾发生 50 次以上的连续压缩失败（最高达 3,272 次），每天浪费约 250K 次 API 调用。熔断器在 3 次连续失败后停止尝试，避免了这种资源浪费。

## 12.5 LRU 缓存策略

### 12.5.1 文件状态缓存

`FileStateCache` 是 Claude Code 中最核心的缓存实现，用于跟踪模型"见过"的文件内容：

```typescript
export class FileStateCache {
  private cache: LRUCache<string, FileState>

  constructor(maxEntries: number, maxSizeBytes: number) {
    this.cache = new LRUCache<string, FileState>({
      max: maxEntries,                    // 条目数上限：100
      maxSize: maxSizeBytes,              // 总大小上限：25MB
      sizeCalculation: value =>           // 按内容实际字节数计量
        Math.max(1, Buffer.byteLength(value.content)),
    })
  }

  get(key: string): FileState | undefined {
    return this.cache.get(normalize(key))  // 路径规范化确保缓存一致性
  }
}
```

该缓存有几个精妙的设计点：

1. **双维度淘汰**：同时限制条目数（100）和总字节数（25MB），两者任一触及上限即触发 LRU 淘汰。这防止了少数大文件独占缓存，也防止了大量小文件耗尽内存。

2. **路径规范化**：所有路径键在存取前经过 `normalize()`，消除 `/foo/../bar` vs `/bar` 这类别名问题，保证缓存命中率。

3. **可序列化**：通过 `dump()` / `load()` 支持状态快照和恢复，用于压缩前后的缓存迁移。

4. **基于时间戳的合并**：`mergeFileStateCaches` 在合并两个缓存时，总是保留时间戳更新的条目：

```typescript
export function mergeFileStateCaches(first, second): FileStateCache {
  const merged = cloneFileStateCache(first)
  for (const [filePath, fileState] of second.entries()) {
    const existing = merged.get(filePath)
    if (!existing || fileState.timestamp > existing.timestamp) {
      merged.set(filePath, fileState)
    }
  }
  return merged
}
```

### 12.5.2 行宽缓存

在终端渲染中，`stringWidth`（计算字符串的显示宽度，需要处理 CJK 字符、emoji 等）是一个相对昂贵的操作。流式输出期间，每个 token 到达都可能触发数百行文本的宽度重算：

```typescript
// line-width-cache.ts — 行级宽度缓存
const cache = new Map<string, number>()
const MAX_CACHE_SIZE = 4096

export function lineWidth(line: string): number {
  const cached = cache.get(line)
  if (cached !== undefined) return cached

  const width = stringWidth(line)

  if (cache.size >= MAX_CACHE_SIZE) {
    cache.clear()  // 简单全清——一帧即可重建
  }
  cache.set(line, width)
  return width
}
```

关键洞察：**流式输出中已完成的行是不可变的**。新 token 只追加到最后一行，之前的行内容不会改变。因此行级缓存能实现约 50 倍的 `stringWidth` 调用减少。

淘汰策略采用简单的全清而非 LRU，因为缓存在一帧之内即可从零完全重建——复杂的淘汰逻辑在此场景下是过度设计。

## 12.6 推测执行算法

推测执行（Speculation）是 Claude Code 中最具创新性的优化之一。其核心思想是：**在用户审阅上一次 AI 响应的间隙，预测用户可能的下一步操作并提前执行**。

### 12.6.1 架构概览

```
用户输入 → 模型响应 → [用户阅读中...]
                        ↓
              ┌─ 生成下一步建议（promptSuggestion）
              ├─ Fork 一个沙盒 Agent
              ├─ 在隔离环境中预执行建议
              └─ 用户接受 → 注入预执行结果（跳过等待）
                 用户拒绝 → 丢弃，零副作用
```

### 12.6.2 安全隔离的 Copy-on-Write

推测执行的最大挑战是安全性——如何确保预执行的操作在用户确认前不产生不可逆的副作用？Claude Code 采用了**文件系统 overlay + Copy-on-Write** 策略：

```typescript
// speculation.ts — Copy-on-Write 文件隔离
canUseTool: async (tool, input) => {
  if (isWriteTool) {
    const rel = relative(cwd, filePath)
    // 跨越项目根目录的写入被拒绝
    if (isAbsolute(rel) || rel.startsWith('..')) {
      return denySpeculation('Write outside cwd not allowed', ...)
    }
    // 首次写入某文件时，复制原件到 overlay 目录
    if (!writtenPathsRef.current.has(rel)) {
      const overlayFile = join(overlayPath, rel)
      await mkdir(dirname(overlayFile), { recursive: true })
      try { await copyFile(join(cwd, rel), overlayFile) } catch {}
      writtenPathsRef.current.add(rel)
    }
    // 重定向写入到 overlay
    input = { ...input, [pathKey]: join(overlayPath, rel) }
  } else if (isSafeReadOnlyTool && writtenPathsRef.current.has(rel)) {
    // 读取已修改文件时，重定向到 overlay
    input = { ...input, [pathKey]: join(overlayPath, rel) }
  }
}
```

当用户接受推测结果时，overlay 中的文件被复制回主目录：

```typescript
async function copyOverlayToMain(overlayPath, writtenPaths, cwd) {
  for (const rel of writtenPaths) {
    await copyFile(join(overlayPath, rel), join(cwd, rel))
  }
}
```

拒绝时，整个 overlay 目录被递归删除。

### 12.6.3 边界检测与流水线

推测执行并非无限制地运行。遇到以下**边界条件**时自动停止：

- **非只读 Bash 命令**：`npm install`、`git push` 等有副作用的命令
- **需要权限确认的文件编辑**：在非 `acceptEdits` 模式下的写操作
- **未知工具**：任何不在白名单中的工具调用

更进一步，当推测执行完整完成时（模型认为任务已完成），系统会**流水线化地生成下一个建议**：

```typescript
// 推测完成后，立即开始生成下一步建议
void generatePipelinedSuggestion(
  context, suggestionText, speculatedMessages, setAppState, abortController)
```

这实现了一个"推测链"——当用户接受当前推测时，下一个建议已经准备好，可以立即开始新一轮推测。在理想情况下，用户可以连续接受建议，每次都跳过等待时间。

## 12.7 渲染优化：终端 UI 的虚拟滚动

### 12.7.1 问题分析

Claude Code 的终端 UI 基于 Ink（React for CLI）。在一个长会话中，消息列表可能包含数千条记录。虽然 Ink 已经在输出层面做了视口裁剪（render-node-to-output 跳过视口外的子节点），但 **React fiber 和 Yoga 布局节点仍然被全量分配**。按每条 MessageRow 约 250KB RSS 计算，1000 条消息意味着约 250MB 的仅增长型内存消耗。

### 12.7.2 虚拟滚动核心算法

`useVirtualScroll` hook 仅挂载视口范围内（加上 overscan）的消息项，用 spacer Box 占位其余部分：

```
┌────────────────────────────────────────┐
│ topSpacer (offsets[start] rows)        │  ← 占位：未挂载的上方内容
├────────────────────────────────────────┤
│ Item[start]                            │
│ Item[start+1]                          │  ← 实际挂载的 React 组件
│ ...                                    │
│ Item[end-1]                            │
├────────────────────────────────────────┤
│ bottomSpacer (remaining rows)          │  ← 占位：未挂载的下方内容
└────────────────────────────────────────┘
```

**高度估算与测量**：未测量的项使用保守估计值（`DEFAULT_ESTIMATE = 3` 行），经过 Yoga 布局后用真实高度替换。偏移数组 `offsets[i]` 是前缀和，通过 `Float64Array` 存储以避免频繁 GC：

```typescript
// 版本化的偏移数组——仅在高度缓存变更时重建
if (offsetsRef.current.version !== offsetVersionRef.current) {
  const arr = new Float64Array(n + 1)
  arr[0] = 0
  for (let i = 0; i < n; i++) {
    arr[i + 1] = arr[i] + (heightCache.current.get(itemKeys[i]) ?? DEFAULT_ESTIMATE)
  }
  offsetsRef.current = { arr, version: offsetVersionRef.current, n }
}
```

**滚动量子化**：并非每次滚动都需要重新计算挂载范围。通过将 `scrollTop` 量子化到 `SCROLL_QUANTUM = 40` 行的桶中，只有跨桶的滚动才触发 React 重渲染：

```typescript
useSyncExternalStore(subscribe, () => {
  const target = s.getScrollTop() + s.getPendingDelta()
  const bin = Math.floor(target / SCROLL_QUANTUM)
  return s.isSticky() ? ~bin : bin  // 粘滞状态折叠入快照
})
```

**二分查找起始位置**：对于大量消息（如 27K 条），线性查找起始位置的 O(n) 成本不可忽视。算法使用二分查找将其降至 O(log n)：

```typescript
// 二分查找 start——offsets 单调递增
let l = 0, r = n
while (l < r) {
  const m = (l + r) >> 1
  if (offsets[m + 1] <= lo) l = m + 1
  else r = m
}
start = l
```

**滑动窗口限速**：快速滚动到全新区域时，按 `PESSIMISTIC_HEIGHT = 1` 计算覆盖可能需要挂载 194 个新项。每个 MessageRow 首次渲染约需 1.5ms（语法高亮、标记解析），总计约 290ms 的同步阻塞。算法通过 `SLIDE_STEP = 25` 限制每次 commit 的新增挂载数：

```typescript
if (prev && scrollVelocity > viewportH * 2) {
  if (start < pS - SLIDE_STEP) start = pS - SLIDE_STEP
  if (end > pE + SLIDE_STEP) end = pE + SLIDE_STEP
}
```

滑动期间，`setClampBounds` 将视口钳制在已挂载内容的边缘，避免出现空白区域。

### 12.7.3 渲染器的增量更新

在底层，Ink 的渲染器通过 **Screen blit** 机制实现增量更新。`Output` 对象维护一个 `charCache`，缓存每行文本的 tokenization 和 grapheme clustering 结果：

```typescript
type ClusteredChar = {
  value: string      // 字形簇
  width: number      // 终端宽度
  styleId: number    // 样式 ID（从池中获取，会话级稳定）
  hyperlink: string  // 超链接
}
```

当前帧与上一帧的 `Screen` 进行 diff 时，`blitRegion` 可以直接复制未变化区域的像素数据，仅重绘发生变化的部分。对于稳态帧（如 spinner 跳动、时钟更新），变化通常仅涉及极少数单元格，diff 的成本是 O(changed cells) 而非 O(rows × cols)。

滚动场景下，系统甚至尝试使用硬件滚动（DECSTBM + SU/SD 控制序列），让终端硬件完成内容的移动：

```typescript
export type ScrollHint = {
  top: number      // 滚动区域顶部（屏幕行，0-indexed）
  bottom: number   // 滚动区域底部
  delta: number    // 正值=内容上移（scrollTop 增大）
}
```

## 12.8 架构总览

Claude Code 的性能优化并非孤立的技巧集合，而是一个分层协作的体系：

```
┌────────────────────────────────────────────────────────────┐
│ Layer 1: 编译期优化                                         │
│   feature() 死代码消除 │ Tree-shaking │ 延迟 import         │
├────────────────────────────────────────────────────────────┤
│ Layer 2: 启动期优化                                         │
│   并行预取 │ lazySchema │ 采样式度量 │ 钥匙串预读            │
├────────────────────────────────────────────────────────────┤
│ Layer 3: 运行时缓存                                         │
│   FileStateCache (LRU, 双维度) │ lineWidthCache │ charCache │
│   settingsCache │ completionCache                           │
├────────────────────────────────────────────────────────────┤
│ Layer 4: Token 管理                                         │
│   精确计数 + 快速预估混合 │ 多级阈值监控 │ 文件类型修正       │
├────────────────────────────────────────────────────────────┤
│ Layer 5: 上下文压缩                                         │
│   微压缩(缓存编辑/时间触发) → 会话记忆 → 全量摘要           │
│   大结果落盘 │ 分析-摘要两阶段 │ 熔断器                      │
├────────────────────────────────────────────────────────────┤
│ Layer 6: 推测执行                                           │
│   建议生成 → 沙盒Fork → CoW隔离 → 接受注入/拒绝丢弃         │
├────────────────────────────────────────────────────────────┤
│ Layer 7: 渲染优化                                           │
│   虚拟滚动 │ 量子化触发 │ 二分定位 │ 滑动限速               │
│   Screen blit │ 硬件滚动 │ 双缓冲                           │
└────────────────────────────────────────────────────────────┘
```

各层之间存在协同效应。例如，推测执行依赖 Token 管理来判断是否有足够的上下文空间注入预执行结果；虚拟滚动的高度缓存利用了消息内容不可变（compaction 边界之前的消息不会被修改）这一由上下文压缩保证的不变量。

## 12.9 思考题

**思考题 1：缓存编辑微压缩的一致性问题**

缓存编辑微压缩不修改本地消息，而是通过 `cache_edits` 指令让服务端在缓存内部删除工具结果。当时间触发微压缩在下一次请求中生效时（发现缓存已冷），它会修改本地消息内容。此时 `cachedMCState` 中仍持有旧的工具 ID。如果不调用 `resetMicrocompactState()`，会发生什么？请分析可能的故障模式。

**思考题 2：虚拟滚动的高度估算偏差**

虚拟滚动使用 `DEFAULT_ESTIMATE = 3` 作为未测量项的高度估计，注释中解释"宁可低估也不高估"。但在非粘滞滚动场景中，末端使用 `PESSIMISTIC_HEIGHT = 1` 来计算覆盖所需的项数。这两个不同的估计值分别在什么场景下发挥作用？如果统一使用同一个值（例如全部用 1 或全部用 3），会分别带来什么问题？

**思考题 3：推测执行的取消粒度**

当前的推测执行使用 `AbortController` 进行取消。当用户开始输入新内容时，正在进行的推测被中止。但如果推测已经执行了多个成功的工具调用（例如读取了 3 个文件），这些部分结果能否被保留和利用？设计一个增量接受机制，使得即使推测被中途取消，已完成的工具调用结果仍能被注入对话上下文。需要考虑哪些一致性约束？

## 12.10 小结

本章深入剖析了 Claude Code 中的性能优化算法体系。从宏观架构的视角看，这些优化可以归纳为三个核心思想：

**分级策略**：Token 计数的精确 vs 预估、上下文压缩的微压缩 → 会话记忆 → 全量摘要、渲染的增量 diff vs 全量重绘——每个维度都存在从轻量到重量的多级方案，系统根据实际压力动态选择最经济的路径。

**缓存复用**：从文件状态的 LRU 缓存、行宽的 Map 缓存、渲染器的 char 缓存，到 prompt cache 的维护（缓存编辑微压缩的核心目标就是避免破坏服务端缓存），Claude Code 在每一个计算环节都尽可能复用已有结果。

**乐观并行**：启动阶段的并行预取、推测执行的提前 fork、流水线化的建议生成——这些策略共同的特点是在主线程空闲时发起可能有用的后台工作。成功时显著缩短延迟，失败时优雅回退到正常路径。

这些优化并非事后追加的补丁，而是从架构层面就考虑了性能的需求。不可变消息数组使得共享引用成为可能，内容寻址的 tool_use_id 使得幂等落盘自然高效，消息的结构化分组使得部分压缩精确可控。好的性能优化，往往来自好的数据模型设计。
