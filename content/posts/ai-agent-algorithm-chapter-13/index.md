+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第13章 容错与恢复算法"
tags = ["AI Agent", "Claude Code", "算法思想", "容错恢复", "错误处理"]
categories = ["AI Agent", "Claude Code"]
+++
> "真正的韧性不在于永不失败，而在于每次失败后都能优雅地站起来。"

## 13.1 问题引入

想象这样一个场景：用户正在使用 Claude Code 进行一个复杂的代码重构任务。Agent 已经分析了数十个文件，制定了修改计划，正在逐步执行。此时 API 突然返回 HTTP 529（Overloaded）错误。

这个看似简单的场景引发了一系列深刻的工程决策：

- **立即失败？** 用户等待了几分钟的上下文将全部丢失，体验极差。
- **无限重试？** 如果服务器已过载，盲目重试只会加剧雪崩，使所有用户的体验都恶化。
- **等待后重试？** 等多久？如果所有客户端都在同一时刻重试呢？
- **降级到备用模型？** 什么条件下降级？如何在质量和可用性之间取舍？

更复杂的场景还包括：网络在 SSH 会话中断开，进程收到 SIGTERM 信号，OAuth Token 在请求中途过期，SSL 证书验证失败……每一种故障都需要不同的处理策略。

Claude Code 作为一个长时间运行的交互式 Agent 系统，面临的容错挑战远比普通 Web 应用复杂。它必须在"永不放弃"和"适时认输"之间找到精确的平衡点。本章将深入分析 Claude Code 源码中的容错与恢复算法，揭示一个生产级 Agent 系统如何在真实世界的混乱中保持韧性。

## 13.2 错误分类状态机

容错系统的第一步是**正确分类错误**。不同类型的错误需要截然不同的处理策略。Claude Code 构建了一个精密的错误分类体系，将错误分为可重试、不可重试、可降级等多个类别。

### 13.2.1 分类的核心逻辑

错误分类是一棵决策树。Claude Code 的 `shouldRetry` 函数体现了这棵树的结构：

```
错误发生
  ├── 是否为模拟错误？ → 不重试（测试用）
  ├── 是否为持久模式下的瞬态容量错误（429/529）？ → 始终重试
  ├── 远程模式下的 401/403？ → 重试（基础设施令牌刷新）
  ├── 包含 "overloaded_error"？ → 重试（流式 529 的变体）
  ├── 上下文溢出 400？ → 重试（自动调整 max_tokens）
  ├── x-should-retry 响应头
  │     ├── "true" + 企业用户 → 重试
  │     └── "false" + 非5xx → 不重试
  ├── 连接错误（APIConnectionError）？ → 重试
  ├── 408 请求超时 → 重试
  ├── 409 锁超时 → 重试
  ├── 429 速率限制 → 条件重试（非订阅用户或企业用户）
  ├── 401 认证失败 → 清除缓存后重试
  ├── 403 Token 撤销 → 重试
  ├── 5xx 服务端错误 → 重试
  └── 其他 → 不重试
```

这棵决策树的设计体现了几个关键原则：

**原则一：瞬态错误总是可重试的。** HTTP 429（速率限制）、529（过载）、5xx（服务端错误）、连接超时等都是瞬态的——它们不反映请求本身的问题，只反映当前时刻的系统状态。

**原则二：身份验证错误需要区分上下文。** 同样是 401 错误，在本地模式下意味着 API Key 可能已过期（清除缓存后重试即可），而在远程模式下意味着基础设施 JWT 的短暂抖动（直接重试即可）。

**原则三：服务端指令优先级最高。** `x-should-retry` 响应头是服务端给出的明确指令。如果服务端说"不要重试"，客户端应该尊重，除非有强有力的理由覆盖（如内部用户遇到 5xx）。

### 13.2.2 连接错误的精细分类

网络层错误的多样性远超 HTTP 状态码。Claude Code 的 `errorUtils.ts` 实现了对连接错误的深度分析：

```typescript
// 伪代码：连接错误详情提取
function extractConnectionErrorDetails(error) {
  // 沿着 cause 链向下遍历（最多5层防死循环）
  let current = error, depth = 0
  while (current && depth < 5) {
    if (current.code) {
      return {
        code: current.code,           // 如 'ECONNRESET', 'ETIMEDOUT'
        message: current.message,
        isSSLError: SSL_ERROR_CODES.has(current.code)
      }
    }
    current = current.cause
    depth++
  }
  return null
}
```

这个函数揭示了一个重要的工程细节：SDK 库通常会层层包装错误，原始的网络错误码被埋在 `cause` 链的深处。通过遍历 cause 链，系统能够识别出根因，从而做出精确的分类决策。

特别值得注意的是对 SSL 错误的专门处理。Claude Code 维护了一个完整的 SSL 错误码集合（包括证书验证失败、证书过期、自签名证书、主机名不匹配等），并为企业用户提供了精准的诊断提示：

```
SSL certificate error (UNABLE_TO_VERIFY_LEAF_SIGNATURE).
If you are behind a corporate proxy or TLS-intercepting firewall,
set NODE_EXTRA_CA_CERTS to your CA bundle path.
```

这种对错误的精细分类不仅仅是为了决定是否重试——它还直接影响着用户看到的错误信息的质量。模糊的"网络错误"毫无用处，而精确的"SSL 证书验证失败，请配置 NODE_EXTRA_CA_CERTS"则能立即指导用户解决问题。

### 13.2.3 Axios 错误的统一分类

对于非 API 层的 HTTP 请求（如同步设置、远程策略等），Claude Code 提供了一个通用的 Axios 错误分类器：

```typescript
// 伪代码：Axios 错误分类
type AxiosErrorKind = 'auth' | 'timeout' | 'network' | 'http' | 'other'

function classifyAxiosError(e): { kind, status?, message } {
  if (!e.isAxiosError) return { kind: 'other' }
  if (status === 401 || status === 403) return { kind: 'auth' }
  if (e.code === 'ECONNABORTED') return { kind: 'timeout' }
  if (e.code === 'ECONNREFUSED' || e.code === 'ENOTFOUND') return { kind: 'network' }
  return { kind: 'http' }
}
```

这个分类器消除了分散在各处的重复判断逻辑。过去有约 20 行的 `isAxiosError → 401/403 → ECONNABORTED → ECONNREFUSED` 判断链被复制在多个服务中，现在统一收敛到一个函数，体现了错误处理中"单一职责"的设计思想。

## 13.3 指数退避与抖动算法

确定了错误可以重试之后，下一个关键问题是：**何时重试？**

### 13.3.1 基础退避算法

Claude Code 的 `getRetryDelay` 函数实现了经典的指数退避加随机抖动：

```typescript
// 源码精简
const BASE_DELAY_MS = 500

function getRetryDelay(attempt, retryAfterHeader?, maxDelayMs = 32000) {
  // 优先使用服务端指定的 retry-after
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10)
    if (!isNaN(seconds)) return seconds * 1000
  }
  // 指数退避：500ms, 1000ms, 2000ms, 4000ms, ...
  const baseDelay = Math.min(BASE_DELAY_MS * Math.pow(2, attempt - 1), maxDelayMs)
  // 随机抖动：在 baseDelay 的基础上增加 0~25% 的随机延迟
  const jitter = Math.random() * 0.25 * baseDelay
  return baseDelay + jitter
}
```

这个简洁的函数蕴含了三个重要的算法思想：

**指数退避（Exponential Backoff）。** 重试间隔按 2 的幂次递增：500ms → 1s → 2s → 4s → 8s → 16s → 32s。这意味着系统在早期阶段快速重试（也许只是一个瞬间抖动），在后期阶段缓慢重试（给服务端足够的恢复时间）。

**上限封顶（Capped Backoff）。** `maxDelayMs` 参数将最大等待时间封顶在 32 秒（默认）。没有封顶的指数退避会导致等待时间无限增长，第 20 次重试将等待约 145 小时——这显然不合理。

**随机抖动（Jitter）。** 这是防止**惊群效应（Thundering Herd）** 的关键。假设 1000 个客户端同时遇到 429 错误，如果它们都在完全相同的时刻重试，服务端将再次过载。25% 的随机抖动使这 1000 个请求分散到一个时间窗口内，大幅降低瞬时并发压力。

Claude Code 选择了**装饰性抖动（Decorrelated Jitter）** 的一种变体——在基础延迟之上叠加正向随机量，而非以基础延迟为中心的双向随机。这确保了实际延迟永远不会低于基础退避值，兼顾了分散和保守。

### 13.3.2 服务端指令优先

注意算法中 `retryAfterHeader` 的优先级：它**绕过了整个退避计算**。这体现了一个重要的设计原则——**服务端比客户端更了解当前的系统状态**。当服务端通过 `Retry-After` 头部告知"请等待 60 秒后重试"时，客户端不应该自作主张地用自己的 2 秒退避值覆盖它。

### 13.3.3 持久模式下的扩展退避

对于无人值守（Unattended）的长期运行会话，Claude Code 实现了一套扩展的退避策略：

```typescript
const PERSISTENT_MAX_BACKOFF_MS = 5 * 60 * 1000    // 5分钟最大退避
const PERSISTENT_RESET_CAP_MS  = 6 * 60 * 60 * 1000 // 6小时绝对上限

// 429 错误：优先使用速率限制重置时间戳
const resetDelay = getRateLimitResetDelayMs(error)
delayMs = resetDelay ?? Math.min(
  getRetryDelay(persistentAttempt, retryAfter, PERSISTENT_MAX_BACKOFF_MS),
  PERSISTENT_RESET_CAP_MS
)
```

持久模式的退避策略有两个独特之处：

1. **使用速率限制重置时间戳。** 429 响应可能携带 `anthropic-ratelimit-unified-reset` 头部，指示窗口何时重置。系统直接等到重置时刻而非盲目轮询——这避免了在 5 小时的速率限制窗口内每 5 分钟发送一次注定失败的请求。

2. **心跳保活机制。** 长时间等待期间，系统每 30 秒产生一次心跳事件，防止宿主环境将会话标记为空闲：

```typescript
const HEARTBEAT_INTERVAL_MS = 30_000

// 将长等待分割为30秒的心跳块
let remaining = delayMs
while (remaining > 0) {
  if (signal?.aborted) throw new APIUserAbortError()
  yield createSystemAPIErrorMessage(error, remaining, attempt, maxRetries)
  const chunk = Math.min(remaining, HEARTBEAT_INTERVAL_MS)
  await sleep(chunk, signal, { abortError })
  remaining -= chunk
}
```

这里用 `yield` 产出心跳消息的设计非常精妙——`withRetry` 是一个 `AsyncGenerator`，调用者可以在等待期间持续接收状态更新并展示给用户，而不是一个黑盒般的长时间阻塞。

## 13.4 模型降级与回退策略

当错误超出了简单重试所能解决的范围时，系统需要更高层次的应对策略。Claude Code 实现了多层级的降级机制。

### 13.4.1 529 过载的模型回退

当 API 持续返回 529（Overloaded）错误时，说明当前模型的容量已经饱和。此时继续重试同一模型是徒劳的。Claude Code 实现了一个基于计数器的回退触发机制：

```typescript
const MAX_529_RETRIES = 3

// 每次 529 递增计数器
if (is529Error(error)) {
  consecutive529Errors++
  if (consecutive529Errors >= MAX_529_RETRIES) {
    if (options.fallbackModel) {
      // 触发模型回退：从 Opus 降级到 Sonnet
      throw new FallbackTriggeredError(options.model, options.fallbackModel)
    }
  }
}
```

这里的 `consecutive529Errors` 计数器特别值得注意——它在流式请求和非流式请求之间是连续的。当流式请求中途收到 529 后降级为非流式重试时，流式阶段的 529 计数通过 `initialConsecutive529Errors` 参数传递下来，确保总体 529 容忍度不变。

### 13.4.2 Fast Mode 的温度降级

Claude Code 的 Fast Mode 使用更快速的模型配置。当遭遇速率限制时，系统根据等待时间的长短决定策略：

```typescript
const SHORT_RETRY_THRESHOLD_MS = 20 * 1000  // 20秒
const MIN_COOLDOWN_MS = 10 * 60 * 1000      // 10分钟

const retryAfterMs = getRetryAfterMs(error)

if (retryAfterMs !== null && retryAfterMs < SHORT_RETRY_THRESHOLD_MS) {
  // 短等待：保持 Fast Mode（保留 Prompt Cache）
  await sleep(retryAfterMs, signal)
  continue
} else {
  // 长等待或未知：切换到标准模式
  const cooldownMs = Math.max(retryAfterMs ?? 30 * 60 * 1000, MIN_COOLDOWN_MS)
  triggerFastModeCooldown(Date.now() + cooldownMs, cooldownReason)
  retryContext.fastMode = false
  continue
}
```

这个策略背后的权衡是：Fast Mode 通常与 Prompt Cache（提示缓存）关联，模型名称的切换会使缓存失效。因此，对于短暂的限流（< 20 秒），保持 Fast Mode 并等待是更优的选择（避免缓存失效的成本）；而对于长时间的限流，切换到标准模式可以避免用户漫长的等待。

### 13.4.3 背景查询的静默丢弃

并非所有请求都同等重要。Claude Code 将查询源分为"前台"和"后台"两类：

```typescript
const FOREGROUND_529_RETRY_SOURCES = new Set([
  'repl_main_thread',   // 主对话线程
  'sdk',                // SDK 调用
  'compact',            // 上下文压缩
  'hook_agent',         // Hook Agent
  // ...
])

function shouldRetry529(querySource) {
  return querySource === undefined || FOREGROUND_529_RETRY_SOURCES.has(querySource)
}
```

对于后台查询（如摘要生成、标题建议、分类器），当遇到 529 时直接放弃，不进行重试。源码注释清楚地解释了原因：

> "在容量级联期间，每次重试都是 3-10 倍的网关放大，而用户永远不会看到这些后台查询失败。"

这是一个典型的**负载卸载（Load Shedding）** 策略：在系统过载时，牺牲非关键功能来保护核心功能。

## 13.5 连接恢复与断点续传

Agent 系统的运行时间可能长达数小时。如何在连接中断后恢复状态，是生产级 Agent 系统的核心能力。

### 13.5.1 SSE 传输层的自动重连

Claude Code 的远程模式使用 SSE（Server-Sent Events）维持与服务端的长连接。`SSETransport` 实现了完整的自动重连机制：

```typescript
const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS  = 30_000
const RECONNECT_GIVE_UP_MS    = 600_000  // 10分钟总预算
const LIVENESS_TIMEOUT_MS     = 45_000   // 45秒无活动视为断连

private handleConnectionError(): void {
  const elapsed = now - this.reconnectStartTime
  if (elapsed < RECONNECT_GIVE_UP_MS) {
    this.reconnectAttempts++
    // 指数退避 + ±25%双向抖动
    const baseDelay = Math.min(
      RECONNECT_BASE_DELAY_MS * Math.pow(2, this.reconnectAttempts - 1),
      RECONNECT_MAX_DELAY_MS
    )
    const delay = baseDelay + baseDelay * 0.25 * (2 * Math.random() - 1)
    setTimeout(() => this.connect(), delay)
  } else {
    // 超过10分钟预算，永久关闭
    this.state = 'closed'
    this.onCloseCallback?.()
  }
}
```

这个重连机制有几个关键设计：

**时间预算而非次数限制。** 系统不限制重连次数，而是设置了 10 分钟的总时间预算。这比固定次数更合理——10 次重连可能只需 10 秒（如果每次都快速失败），也可能需要 30 分钟（如果退避到了最大值）。时间预算确保了可预测的最长不可用时间。

**活性检测（Liveness Detection）。** 服务端每 15 秒发送一次 keepalive；如果 45 秒内没有收到任何帧（3 倍容忍），传输层主动判定连接已死亡并触发重连：

```typescript
private readonly onLivenessTimeout = () => {
  this.abortController?.abort()
  this.handleConnectionError()
}
private resetLivenessTimer() {
  this.clearLivenessTimer()
  this.livenessTimer = setTimeout(this.onLivenessTimeout, LIVENESS_TIMEOUT_MS)
}
```

每次收到任何 SSE 帧（包括 keepalive 注释）都会重置活性计时器。

**序列号续传。** 重连时通过 `Last-Event-ID` 头部和 `from_sequence_num` 查询参数告知服务端上次接收到的最后一个事件，实现无缝恢复：

```typescript
if (this.lastSequenceNum > 0) {
  sseUrl.searchParams.set('from_sequence_num', String(this.lastSequenceNum))
  headers['Last-Event-ID'] = String(this.lastSequenceNum)
}
```

同时，`seenSequenceNums` 集合用于去重——重连后服务端可能重放已经接收过的事件，客户端需要识别并跳过这些重复帧。

**永久性错误的快速失败。** 不是所有 HTTP 错误都值得重连：

```typescript
const PERMANENT_HTTP_CODES = new Set([401, 403, 404])

if (PERMANENT_HTTP_CODES.has(response.status)) {
  this.state = 'closed'
  this.onCloseCallback?.(response.status)
  return  // 不触发重连
}
```

认证失败和资源不存在是永久性错误，重连没有意义。

### 13.5.2 会话级别的恢复

当整个进程崩溃或被终止时，Claude Code 通过**会话持久化与恢复**机制，让用户能够从中断处继续。

`conversationRecovery.ts` 中的 `loadConversationForResume` 函数实现了完整的会话恢复流程：

```
会话恢复流程：
1. 加载会话日志文件（JSONL 格式的消息记录）
2. 迁移旧版本附件格式（前向兼容）
3. 过滤无效的权限模式值
4. 过滤未解析的 tool_use（中途中断的工具调用）
5. 过滤孤立的 thinking 块（不完整的思考过程）
6. 过滤仅含空白的助手消息
7. 检测中断类型（未响应的提示 / 中断的执行 / 正常结束）
8. 恢复技能状态、文件历史、归因状态
9. 执行 SessionStart 钩子
```

最精妙的部分是**中断检测算法**。系统通过分析消息序列的尾部来推断会话是如何结束的：

```typescript
function detectTurnInterruption(messages) {
  // 跳过系统消息和进度消息，找到最后一条有意义的消息
  const lastMessage = messages.findLast(m =>
    m.type !== 'system' && m.type !== 'progress'
    && !(m.type === 'assistant' && m.isApiErrorMessage)
  )

  if (lastMessage.type === 'assistant') {
    // 助手消息在最后 → 回合正常完成
    return { kind: 'none' }
  }

  if (lastMessage.type === 'user') {
    if (isToolUseResultMessage(lastMessage)) {
      if (isTerminalToolResult(lastMessage, messages)) {
        return { kind: 'none' }  // Brief 模式的正常结束
      }
      return { kind: 'interrupted_turn' }  // 工具执行中途被中断
    }
    // 用户发送了消息但未收到回复
    return { kind: 'interrupted_prompt', message: lastMessage }
  }
}
```

对于"中断的回合"，系统会自动注入一条 `"Continue from where you left off."` 的延续消息，使恢复后的对话能自然地继续。

### 13.5.3 陈旧连接的检测与恢复

TCP 长连接有一个隐蔽的问题：底层连接已经断开（ECONNRESET/EPIPE），但连接池中的 socket 尚未清理。Claude Code 专门处理了这种"僵尸连接"：

```typescript
function isStaleConnectionError(error) {
  if (!(error instanceof APIConnectionError)) return false
  const details = extractConnectionErrorDetails(error)
  return details?.code === 'ECONNRESET' || details?.code === 'EPIPE'
}

// 在重试循环中
if (isStaleConnection) {
  disableKeepAlive()  // 禁用连接池，后续请求使用新连接
  client = await getClient()  // 获取新的客户端实例
}
```

这确保了"连接重置"这类偶发错误不会演变为持续失败。

## 13.6 优雅关闭与资源清理

Agent 的关闭过程同样需要精心设计——突然终止可能导致终端状态混乱、会话数据丢失、分析数据未上报。

### 13.6.1 分层关闭策略

`gracefulShutdown.ts` 实现了一个带时间预算的分层关闭流程：

```
关闭时序：
T+0ms     终端模式重置 + 打印恢复提示（同步，最关键）
T+0~2000ms 运行清理函数（会话数据持久化）
T+2000ms   执行 SessionEnd 钩子（用户自定义）
T+...      刷新分析数据（限时500ms）
T+max      强制退出

故障安全计时器：max(5000ms, 钩子超时 + 3500ms) 后强制退出
```

```typescript
// 故障安全计时器：即使清理挂起也保证进程退出
failsafeTimer = setTimeout(
  (code) => {
    cleanupTerminalModes()
    printResumeHint()
    forceExit(code)
  },
  Math.max(5000, sessionEndTimeoutMs + 3500),
  exitCode
)
failsafeTimer.unref()  // 不阻止进程自然退出
```

**为什么终端重置是最先执行的？** 如果在异步清理过程中进程被强制终止（如 `SIGKILL`），至少终端状态已经恢复，用户的 shell 不会处于异常模式（如 Kitty 键盘模式、鼠标追踪模式、备用屏幕缓冲区等）。

**为什么分析数据刷新有 500ms 的硬限制？** 源码注释解释了历史教训：

> "Previously unbounded: the 1P exporter awaits all pending axios POSTs (10s each), eating the full failsafe budget. Lost analytics on slow networks are acceptable; a hanging exit is not."

### 13.6.2 孤儿进程检测

macOS 上存在一个特殊问题：当终端窗口关闭时，操作系统可能不发送 SIGHUP 信号，而是直接撤销 TTY 文件描述符。进程仍然存活，但无法读写终端。Claude Code 通过定期检查终端可用性来检测这种"孤儿"状态：

```typescript
if (process.stdin.isTTY) {
  orphanCheckInterval = setInterval(() => {
    if (!process.stdout.writable || !process.stdin.readable) {
      clearInterval(orphanCheckInterval)
      void gracefulShutdown(129)  // SIGHUP 退出码
    }
  }, 30_000)
  orphanCheckInterval.unref()
}
```

### 13.6.3 强制退出的最后手段

即使 `process.exit()` 也可能失败——当终端已关闭时，Bun 运行时尝试刷新 stdout 会抛出 EIO 错误：

```typescript
function forceExit(exitCode) {
  try {
    process.exit(exitCode)
  } catch (e) {
    // process.exit() 因 EIO 失败，使用 SIGKILL
    process.kill(process.pid, 'SIGKILL')
  }
}
```

这种"退出的退出策略"确保了无论终端状态如何，进程都能最终终止。

## 13.7 上下文溢出的自适应处理

大型对话可能导致输入 token 数超过模型的上下文窗口。Claude Code 实现了自适应的 `max_tokens` 调整来应对这个问题：

```typescript
function parseMaxTokensContextOverflowError(error) {
  // 解析错误消息: "input length and `max_tokens` exceed context limit: 188059 + 20000 > 200000"
  const match = error.message.match(
    /input length and `max_tokens` exceed context limit: (\d+) \+ (\d+) > (\d+)/
  )
  return { inputTokens: match[1], maxTokens: match[2], contextLimit: match[3] }
}

// 在重试逻辑中
if (overflowData) {
  const safetyBuffer = 1000
  const availableContext = contextLimit - inputTokens - safetyBuffer
  if (availableContext < FLOOR_OUTPUT_TOKENS) {
    throw error  // 可用空间太小，无法生成有意义的输出
  }
  retryContext.maxTokensOverride = Math.max(FLOOR_OUTPUT_TOKENS, availableContext)
  continue  // 用调整后的参数重试
}
```

这个策略的关键在于 `FLOOR_OUTPUT_TOKENS = 3000`——系统保证至少有 3000 个 token 的输出空间。如果连这个最低限度都无法满足，说明对话已经膨胀到几乎占满了整个上下文窗口，此时应该触发上下文压缩（Compact）而非勉强生成过短的回复。

## 13.8 错误处理架构图

下面是 Claude Code 错误处理的完整决策流程：

```
                           ┌──────────────┐
                           │   API 调用    │
                           └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │  发生错误？   │──── 否 ──→ 返回结果
                           └──────┬───────┘
                                  │ 是
                           ┌──────▼───────┐
                      ┌─── │  用户中止？   │──── 是 ──→ 抛出 AbortError
                      │    └──────┬───────┘
                      │           │ 否
                      │    ┌──────▼───────────┐
                      │    │  Fast Mode 活跃?  │──── 是 ──→ Fast Mode 降级逻辑
                      │    └──────┬───────────┘       │    ├ 短等待：保持 + sleep
                      │           │ 否                │    └ 长等待：进入冷却期
                      │    ┌──────▼───────────┐       │
                      │    │  后台查询 529？   │── 是 → 静默丢弃
                      │    └──────┬───────────┘
                      │           │ 否
                      │    ┌──────▼───────────┐
                      │    │ 连续529 ≥ 3次？  │──── 是 ──→ 触发模型回退
                      │    └──────┬───────────┘
                      │           │ 否
                      │    ┌──────▼───────────┐
                      │    │  超过重试次数？   │──── 是 ──→ 抛出 CannotRetryError
                      │    │  (且非持久模式)   │
                      │    └──────┬───────────┘
                      │           │ 否
                      │    ┌──────▼───────────┐
                      │    │  shouldRetry()   │──── 否 ──→ 抛出 CannotRetryError
                      │    │  错误可重试？     │
                      │    └──────┬───────────┘
                      │           │ 是
                      │    ┌──────▼───────────┐
                      │    │ 上下文溢出 400？  │──── 是 ──→ 调整 max_tokens, continue
                      │    └──────┬───────────┘
                      │           │ 否
                      │    ┌──────▼───────────┐
                      │    │  计算退避延迟    │
                      │    │ (指数退避+抖动)  │
                      │    └──────┬───────────┘
                      │           │
                      │    ┌──────▼───────────┐
                      │    │yield 状态消息    │
                      │    │await sleep(delay)│
                      │    └──────┬───────────┘
                      │           │
                      └───────────┘  (返回循环顶部重试)
```

## 13.9 错误上下文保留

生产环境中的错误诊断依赖于充足的上下文信息。Claude Code 在错误保留方面的实践值得关注。

### 13.9.1 CannotRetryError：保留原始错误

当重试耗尽时，系统不是简单地抛出"重试失败"，而是将原始错误和重试上下文一起封装：

```typescript
class CannotRetryError extends Error {
  constructor(
    public readonly originalError: unknown,
    public readonly retryContext: RetryContext, // 包含模型、配置等
  ) {
    super(errorMessage(originalError))
    // 保留原始堆栈跟踪
    if (originalError instanceof Error && originalError.stack) {
      this.stack = originalError.stack
    }
  }
}
```

### 13.9.2 截断堆栈以节省 Token

当错误信息需要传递给模型（如工具执行失败的 `tool_result`）时，完整的堆栈跟踪会浪费宝贵的上下文 token：

```typescript
function shortErrorStack(e, maxFrames = 5) {
  const lines = e.stack.split('\n')
  const header = lines[0]
  const frames = lines.slice(1).filter(l => l.trim().startsWith('at '))
  if (frames.length <= maxFrames) return e.stack
  return [header, ...frames.slice(0, maxFrames)].join('\n')
}
```

保留前 5 帧通常足以定位问题，而不是发送 500-2000 字符的完整堆栈。

### 13.9.3 TelemetrySafeError：敏感信息隔离

错误信息中可能包含文件路径、代码片段等敏感数据。`TelemetrySafeError` 通过双消息机制实现了用户可见消息和遥测消息的分离：

```typescript
class TelemetrySafeError extends Error {
  readonly telemetryMessage: string

  constructor(message: string, telemetryMessage?: string) {
    super(message)              // 完整消息给用户
    this.telemetryMessage = telemetryMessage ?? message  // 脱敏消息上报
  }
}

// 使用示例
throw new TelemetrySafeError(
  `MCP tool timed out after ${ms}ms`,  // 用户看到具体时间
  'MCP tool timed out'                  // 遥测不包含时间值
)
```

## 13.10 工具执行超时管理

Agent 的工具执行（如 Bash 命令）需要严格的超时控制，防止单个工具执行阻塞整个对话。

```typescript
const DEFAULT_TIMEOUT_MS = 120_000  // 2分钟
const MAX_TIMEOUT_MS     = 600_000  // 10分钟

function getDefaultBashTimeoutMs(env = process.env) {
  const envValue = env.BASH_DEFAULT_TIMEOUT_MS
  if (envValue) {
    const parsed = parseInt(envValue, 10)
    if (!isNaN(parsed) && parsed > 0) return parsed
  }
  return DEFAULT_TIMEOUT_MS
}

function getMaxBashTimeoutMs(env = process.env) {
  const envValue = env.BASH_MAX_TIMEOUT_MS
  if (envValue) {
    const parsed = parseInt(envValue, 10)
    if (!isNaN(parsed) && parsed > 0) {
      return Math.max(parsed, getDefaultBashTimeoutMs(env))
    }
  }
  return Math.max(MAX_TIMEOUT_MS, getDefaultBashTimeoutMs(env))
}
```

超时系统的设计体现了**可配置但安全**的原则：

- 默认超时 2 分钟，最大允许 10 分钟
- 通过环境变量可调，适应不同场景
- 最大超时始终 ≥ 默认超时（`Math.max` 保证）
- 模型被允许为单次命令指定超时，但不能超过最大值

## 13.11 认证错误的特殊恢复

认证错误需要一套独立的恢复策略，因为它们的根因不在网络层而在凭证层。Claude Code 针对三种云平台（Anthropic API、AWS Bedrock、GCP Vertex）分别实现了凭证刷新逻辑：

```typescript
// 在重试循环中，每次重试前检查是否需要刷新凭证
if (
  client === null ||
  (lastError instanceof APIError && lastError.status === 401) ||
  isOAuthTokenRevokedError(lastError) ||
  isBedrockAuthError(lastError) ||
  isVertexAuthError(lastError) ||
  isStaleConnectionError(lastError)
) {
  // OAuth 401 或 403 token revoked：强制刷新令牌
  if (lastError.status === 401 || isOAuthTokenRevokedError(lastError)) {
    await handleOAuth401Error(failedAccessToken)
  }
  // 重新获取客户端（会使用新的凭证）
  client = await getClient()
}
```

每种平台的错误表现不同：
- **Anthropic API**：401 表示 token 过期，403 表示 token 被撤销
- **AWS Bedrock**：`CredentialsProviderError` 表示本地凭证过期，403 表示远端 token 失效
- **GCP Vertex**：`Could not refresh access token` 等 Google 认证库的特定消息

系统对每种情况清除对应的凭证缓存，然后在下一次重试时使用刷新后的凭证，实现了无感知的认证续期。

## 13.12 思考题

**思考题 1：退避策略的权衡**

Claude Code 的默认退避策略使用 25% 的正向抖动（`jitter = random() * 0.25 * baseDelay`）。如果改用"完全抖动"（`delay = random() * baseDelay`），客户端的平均等待时间会缩短约一半，但请求的聚集度会升高。在什么场景下完全抖动更优？在什么场景下 Claude Code 的策略更优？考虑客户端数量、服务端恢复时间、请求延迟敏感度等因素。

**思考题 2：熔断器模式的缺失**

经典的容错设计中，熔断器（Circuit Breaker）是一个重要模式：当连续失败次数达到阈值时，暂时停止所有请求，定期探测直到服务恢复。Claude Code 没有显式实现熔断器，而是通过 `consecutive529Errors` 计数和 Fast Mode 冷却期间接实现了类似效果。请思考：对于一个交互式 Agent 系统，显式的熔断器模式是否合适？它与重试策略应该如何协调？

**思考题 3：会话恢复的一致性保证**

会话恢复过程中，`filterUnresolvedToolUses` 会移除没有对应 `tool_result` 的 `tool_use`（即中途中断的工具调用）。但这意味着模型看到的消息历史与实际执行的不完全一致——某些工具可能已经执行了一半（如文件已部分修改）。请设计一个方案，使恢复后的模型能够感知这些"部分执行"的副作用，而不仅仅是简单地移除这些消息。

## 13.13 小结

本章深入分析了 Claude Code 源码中的容错与恢复算法。从中我们可以提炼出以下核心设计原则：

**1. 精确的错误分类是一切的基础。** 不同错误需要不同策略——瞬态错误可重试，永久错误快速失败，认证错误刷新凭证，容量错误降级模型。分类越精确，系统的响应越合理。

**2. 退避策略必须考虑全局效应。** 单个客户端的最优策略（立即重试）可能是整个系统的灾难（惊群效应）。指数退避和随机抖动是分布式系统中的基础设施级算法。

**3. 降级是一种特殊的成功。** 当 Opus 模型过载时切换到 Sonnet，当 Fast Mode 受限时切换到标准模式，当后台查询遇到 529 时静默丢弃——这些"失败"实际上比坚持原方案的结果更好。

**4. 会话恢复需要理解语义，而非仅仅恢复字节。** Claude Code 不是简单地回放消息日志，而是分析消息序列的语义（中断类型检测、未解析工具调用过滤、孤立思考块清理），确保恢复后的对话在逻辑上是连贯的。

**5. 关闭流程与启动流程同样重要。** 终端模式重置、会话数据持久化、恢复提示打印——这些发生在进程退出前最后几百毫秒的操作，决定了用户下一次打开终端时的体验。故障安全计时器和分层超时确保了即使清理过程本身出了问题，进程也不会永远挂起。

**6. 错误信息的质量决定了恢复的速度。** 从 SSL 错误的精确诊断（"请配置 NODE_EXTRA_CA_CERTS"）到上下文溢出的自动调整，好的错误处理不仅仅是"不崩溃"，更是"帮助系统或用户快速找到正确的恢复路径"。

这些算法思想共同构成了一个**反脆弱（Antifragile）** 的系统——它不仅能在故障中存活，还能通过降级、回退、恢复等机制，在故障中维持尽可能高的服务质量。这正是生产级 Agent 系统与原型系统的本质区别。
