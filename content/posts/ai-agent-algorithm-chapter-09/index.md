+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第9章 MCP 协议与通信算法"
tags = ["AI Agent", "Claude Code", "算法思想", "MCP", "协议通信"]
categories = ["AI Agent", "Claude Code"]
+++
> "任何足够先进的抽象，都不可与协议区分。"

一个智能 Agent 的能力上限，不在于它的模型有多强大，而在于它能与多少外部系统有效协作。Claude Code 通过 MCP（Model Context Protocol）协议，将数据库、API、文件系统、IDE、浏览器乃至 SaaS 服务，统一纳入 Agent 的工具可达边界。本章将深入 MCP 协议的设计思想，逐层剖析连接建立、能力发现、传输选择、认证流程、交互式授权以及资源截断等核心算法。

---

## 9.1 问题引入：Agent 通信的统一协议挑战

现代 AI Agent 面临一个根本性的通信难题：它需要与形态各异的外部服务交互——本地命令行工具通过 stdin/stdout 对话，远程 API 通过 HTTP 请求访问，IDE 通过 WebSocket 推送事件，SaaS 服务需要 OAuth 认证后才能调用。如果为每种服务编写专用的通信逻辑，系统复杂度将随服务数量呈组合爆炸式增长。

MCP 协议正是为解决此问题而设计的。它定义了一套标准化的客户端-服务端交互规范，使 Agent 能够以统一的方式发现、连接、调用任意外部服务。从 Claude Code 的源码中，我们可以提炼出 MCP 协议的七个核心算法问题：

1. **连接建立**：如何在多种传输层之上建立标准化连接？
2. **能力协商**：客户端与服务端如何互相声明和发现功能？
3. **传输选择**：如何为不同场景选择最优的传输层？
4. **生命周期管理**：如何处理连接的缓存、超时、断开与重连？
5. **OAuth 认证**：如何安全地完成浏览器重定向认证流程？
6. **交互式授权**（Elicitation）：服务端需要用户输入时如何发起交互？
7. **资源截断**：大型工具输出如何智能截断以适应上下文窗口？

---

## 9.2 传输层选择算法

### 9.2.1 多传输层架构

Claude Code 支持的传输类型在 `types.ts` 中通过 Zod Schema 严格定义：

```typescript
export const TransportSchema = z.enum([
  'stdio',    // 本地子进程通信
  'sse',      // Server-Sent Events（旧版远程）
  'sse-ide',  // IDE 专用 SSE
  'http',     // Streamable HTTP（新版远程）
  'ws',       // WebSocket
  'sdk',      // 进程内 SDK 传输
])
```

每种传输类型对应不同的配置 Schema。例如 stdio 需要 `command` 和 `args`，而 http 和 sse 需要 `url`、可选的 `headers`、`headersHelper` 和 `oauth` 配置。这种设计体现了**策略模式**的典型应用——传输层的选择与连接的建立逻辑分离。

### 9.2.2 传输选择决策树

`connectToServer` 函数实现了一个多分支的传输选择算法，其决策逻辑可以概括为：

```
输入: serverRef (服务器配置)
输出: transport (传输实例)

1. if type == 'sse':
     创建 SSEClientTransport
     配置 OAuth 认证提供者
     分离 eventSourceInit（长连接）与 requestInit（短请求）
2. elif type == 'sse-ide':
     创建简化的 SSEClientTransport（无认证）
3. elif type == 'ws-ide' or type == 'ws':
     检测运行时环境（Bun vs Node）
     选择对应的 WebSocket 实现
     配置 TLS 和代理
     创建 WebSocketTransport
4. elif type == 'http':
     创建 StreamableHTTPClientTransport
     配置 OAuth + 超时包装 + Step-up 检测
5. elif type == 'sdk':
     使用进程内传输（不经过 connectToServer）
6. elif type == 'claudeai-proxy':
     创建代理传输，附加 claude.ai OAuth token
7. elif type == 'stdio' 且为特殊服务器（Chrome/ComputerUse）:
     使用进程内传输对，避免 ~325MB 子进程开销
8. elif type == 'stdio' or 无类型:
     创建 StdioClientTransport
     配置子进程环境变量
```

这个决策树有两个值得注意的设计点。

**第一，长连接与短请求的分离。** 对于 SSE 传输，代码刻意区分了 `eventSourceInit`（用于长生命周期的 SSE 流）和 `requestInit`（用于短命的 POST 请求）。SSE 流不应用超时（它需要无限期保持连接以接收服务端推送事件），而 POST 请求则必须有超时保护：

```typescript
// SSE 传输的核心设计：长连接不设超时
transportOptions.eventSourceInit = {
  fetch: async (url, init) => {
    // 不包装 wrapFetchWithTimeout —— 这是长生命周期的 SSE 流
    return fetch(url, {
      ...init,
      headers: { ...authHeaders, Accept: 'text/event-stream' },
    })
  },
}

// 短请求则包装超时
transportOptions.fetch = wrapFetchWithTimeout(
  wrapFetchWithStepUpDetection(createFetchWithInit(), authProvider)
)
```

**第二，进程内传输的优化。** 对于特定的 MCP 服务器（如 Chrome 浏览器控制、ComputerUse），Claude Code 使用 `InProcessTransport`——通过链式传输对（linked transport pair）在同一进程内模拟客户端-服务端通信，避免 spawn 一个可能消耗数百 MB 内存的子进程。

### 9.2.3 Fetch 包装链

远程传输的 fetch 函数经过层层包装，形成一个责任链：

```
原始 fetch
  → wrapFetchWithStepUpDetection (OAuth 403 step-up 检测)
    → wrapFetchWithTimeout (60秒超时 + Accept 头保障)
```

`wrapFetchWithTimeout` 的实现展现了精细的资源管理思维：

```typescript
export function wrapFetchWithTimeout(baseFetch: FetchLike): FetchLike {
  return async (url, init) => {
    const method = (init?.method ?? 'GET').toUpperCase()
    // GET 请求跳过超时——MCP 传输中 GET 是长生命周期 SSE 流
    if (method === 'GET') return baseFetch(url, init)

    // 使用 setTimeout 而非 AbortSignal.timeout()
    // 因为后者在 Bun 运行时会泄漏 ~2.4KB 原生内存
    const controller = new AbortController()
    const timer = setTimeout(
      c => c.abort(new DOMException('The operation timed out.', 'TimeoutError')),
      MCP_REQUEST_TIMEOUT_MS,
      controller,
    )
    timer.unref?.()  // 不阻止进程退出

    // 合并父 signal 与超时 signal
    const parentSignal = init?.signal
    const abort = () => controller.abort(parentSignal?.reason)
    parentSignal?.addEventListener('abort', abort)

    try {
      const response = await baseFetch(url, { ...init, headers, signal: controller.signal })
      cleanup()
      return response
    } catch (error) {
      cleanup()
      throw error
    }
  }
}
```

这里有三个工程细节值得学习：(1) 对 GET 和 POST 分策略处理；(2) 用 `setTimeout` + `unref()` 替代 `AbortSignal.timeout()` 以避免内存泄漏；(3) 同时保障 `Accept: application/json, text/event-stream` 头的存在，遵循 MCP Streamable HTTP 规范。

---

## 9.3 协议握手与能力协商算法

### 9.3.1 客户端声明

连接建立后，MCP 客户端首先声明自身的能力。Claude Code 在创建 `Client` 实例时传入能力声明：

```typescript
const client = new Client(
  {
    name: 'claude-code',
    title: 'Claude Code',
    version: MACRO.VERSION ?? 'unknown',
    description: "Anthropic's agentic coding tool",
    websiteUrl: PRODUCT_URL,
  },
  {
    capabilities: {
      roots: {},        // 支持工作目录列表
      elicitation: {},  // 支持交互式授权
    },
  },
)
```

注意 `elicitation: {}` 的写法——使用空对象而非包含子类型的详细对象。源码注释解释了原因：Java MCP SDK（如 Spring AI）的 Elicitation 类没有字段定义，传入未知属性会导致反序列化失败。这是跨语言协议兼容性的典型教训。

### 9.3.2 服务端能力读取

连接成功后，客户端通过 SDK 读取服务端的能力声明：

```typescript
const capabilities = client.getServerCapabilities()
// 典型的能力结构:
// { tools?: {}, prompts?: {}, resources?: { subscribe?: boolean } }

const serverVersion = client.getServerVersion()
const rawInstructions = client.getInstructions()
```

能力声明驱动后续的功能发现：只有当 `capabilities.tools` 存在时，才会调用 `tools/list`；只有当 `capabilities.resources` 存在时，才会获取资源列表。这种"先声明，后发现"的模式避免了不必要的网络请求。

### 9.3.3 请求处理器注册

客户端同时注册自己能响应的请求处理器，使服务端可以反向调用客户端：

```typescript
// 响应服务端的 ListRoots 请求，告知工作目录
client.setRequestHandler(ListRootsRequestSchema, async () => ({
  roots: [{ uri: `file://${getOriginalCwd()}` }],
}))

// 响应服务端的 Elicitation 请求（默认返回 cancel，后续被覆盖）
client.setRequestHandler(ElicitRequestSchema, async () => ({
  action: 'cancel' as const,
}))
```

这体现了 MCP 的**双向通信**设计——客户端不仅是请求的发起者，也可以是响应者。

---

## 9.4 连接生命周期管理算法

### 9.4.1 Memoization 连接池

`connectToServer` 使用 lodash 的 `memoize` 实现连接池化：

```typescript
export const connectToServer = memoize(
  async (name, serverRef, serverStats?) => {
    // ... 建立连接逻辑
  },
  getServerCacheKey,  // 缓存键 = name + JSON.stringify(config)
)
```

缓存键由服务器名称和完整配置的 JSON 序列化组成。这意味着：同名但配置不同的服务器会得到独立的连接；配置未变时，重复调用直接返回缓存的连接。

### 9.4.2 连接超时竞赛

连接建立使用 `Promise.race` 实现超时竞赛：

```typescript
const connectPromise = client.connect(transport)
const timeoutPromise = new Promise<never>((_, reject) => {
  const timeoutId = setTimeout(() => {
    transport.close().catch(() => {})
    reject(new Error(`Connection timed out after ${getConnectionTimeoutMs()}ms`))
  }, getConnectionTimeoutMs())  // 默认 30 秒

  connectPromise.then(
    () => clearTimeout(timeoutId),
    () => clearTimeout(timeoutId),
  )
})

await Promise.race([connectPromise, timeoutPromise])
```

### 9.4.3 批量连接的并发控制

系统对本地（stdio）和远程（sse/http）服务器使用不同的并发度：

```typescript
function getMcpServerConnectionBatchSize(): number {
  return parseInt(process.env.MCP_SERVER_CONNECTION_BATCH_SIZE || '', 10) || 3
}

function getRemoteMcpServerConnectionBatchSize(): number {
  return parseInt(process.env.MCP_REMOTE_SERVER_CONNECTION_BATCH_SIZE || '', 10) || 20
}
```

本地默认并发 3（受 CPU 和文件句柄限制），远程默认并发 20（主要受网络 I/O 限制）。这种区分体现了对不同传输层瓶颈的精确理解。

### 9.4.4 断连检测与重连

连接建立后，Claude Code 安装了精心设计的断连检测逻辑：

```typescript
// 连续终端性错误计数器
let consecutiveConnectionErrors = 0
const MAX_ERRORS_BEFORE_RECONNECT = 3

client.onerror = (error: Error) => {
  // 1. Session 过期检测 (HTTP 404 + JSON-RPC -32001)
  if (isMcpSessionExpiredError(error)) {
    closeTransportAndRejectPending('session expired')
    return
  }

  // 2. SDK SSE 重连耗尽检测
  if (error.message.includes('Maximum reconnection attempts')) {
    closeTransportAndRejectPending('SSE reconnection exhausted')
    return
  }

  // 3. 终端性连接错误累计
  if (isTerminalConnectionError(error.message)) {
    consecutiveConnectionErrors++
    if (consecutiveConnectionErrors >= MAX_ERRORS_BEFORE_RECONNECT) {
      closeTransportAndRejectPending('max consecutive terminal errors')
    }
  } else {
    consecutiveConnectionErrors = 0  // 非终端错误重置计数
  }
}
```

终端性错误的判定基于错误消息中的关键字：

```typescript
const isTerminalConnectionError = (msg: string): boolean => {
  return (
    msg.includes('ECONNRESET') ||
    msg.includes('ETIMEDOUT') ||
    msg.includes('EPIPE') ||
    msg.includes('EHOSTUNREACH') ||
    msg.includes('ECONNREFUSED') ||
    msg.includes('Body Timeout Error') ||
    msg.includes('terminated') ||
    msg.includes('SSE stream disconnected') ||
    msg.includes('Failed to reconnect SSE stream')
  )
}
```

当连接关闭时，`onclose` 处理器清除 memoization 缓存，使下一次操作触发重连：

```typescript
client.onclose = () => {
  // 清除连接缓存
  connectToServer.cache.delete(key)
  // 清除工具/资源/命令的 fetch 缓存
  fetchToolsForClient.cache.delete(name)
  fetchResourcesForClient.cache.delete(name)
  fetchCommandsForClient.cache.delete(name)
}
```

### 9.4.5 Session 过期与自动重试

对于 HTTP 传输，MCP 规范定义了 session 机制。当服务端返回 HTTP 404 + JSON-RPC 错误码 -32001 时，表示 session 已过期：

```typescript
export function isMcpSessionExpiredError(error: Error): boolean {
  const httpStatus = 'code' in error ? (error as any).code : undefined
  if (httpStatus !== 404) return false
  return (
    error.message.includes('"code":-32001') ||
    error.message.includes('"code": -32001')
  )
}
```

工具调用层对 session 过期进行自动重试：

```typescript
const MAX_SESSION_RETRIES = 1
for (let attempt = 0; ; attempt++) {
  try {
    const connectedClient = await ensureConnectedClient(client)
    return await callMCPToolWithUrlElicitationRetry({ ... })
  } catch (error) {
    if (error instanceof McpSessionExpiredError && attempt < MAX_SESSION_RETRIES) {
      continue  // 重试一次
    }
    throw error
  }
}
```

### 9.4.6 优雅关闭的信号升级

stdio 传输的清理逻辑实现了经典的信号升级策略：

```
SIGINT (100ms等待) → SIGTERM (400ms等待) → SIGKILL (强制终止)
```

每一步都用 `process.kill(pid, 0)` 检测进程是否存活，总计不超过 600ms，保持 CLI 的响应性。

---

## 9.5 OAuth 认证流算法

### 9.5.1 认证服务器发现

OAuth 流程的第一步是发现认证服务器的元数据。`fetchAuthServerMetadata` 实现了三层回退策略：

```
1. 如果配置了 authServerMetadataUrl:
     直接获取该 URL 的元数据（必须是 HTTPS）
2. 否则，尝试 RFC 9728 + RFC 8414 发现:
     探测 /.well-known/oauth-protected-resource
     → 读取 authorization_servers[0]
     → 对该 URL 执行 RFC 8414 发现
3. 回退：路径感知的 RFC 8414 发现:
     探测 /.well-known/oauth-authorization-server/{path}
     （兼容未实现 RFC 9728 的旧版服务器）
```

### 9.5.2 浏览器重定向认证流程

完整的 OAuth 认证涉及本地 HTTP 回调服务器。`ClaudeAuthProvider` 实现了 `OAuthClientProvider` 接口，其核心流程为：

```
1. 生成 PKCE code_verifier 和 code_challenge
2. 生成随机 state 参数
3. 在本地启动 HTTP 服务器监听回调端口
4. 构造授权 URL，打开系统浏览器
5. 等待回调 → 验证 state 参数
6. 用 authorization_code 交换 access_token
7. 安全存储 tokens（使用系统 Keychain）
```

安全存储通过 `getSecureStorage()` 使用系统级凭证管理（macOS Keychain、Linux secret-service），而非明文文件。

### 9.5.3 Token 刷新与错误标准化

Token 刷新面临一个实际问题：某些 OAuth 服务器（如 Slack）对非标准错误码的处理不符合 RFC 6749。`normalizeOAuthErrorBody` 函数进行错误标准化：

```typescript
const NONSTANDARD_INVALID_GRANT_ALIASES = new Set([
  'invalid_refresh_token',
  'expired_refresh_token',
  'token_expired',
])

// 将非标准的 200 + error body 转为 400 Response
// 将非标准错误码映射到 'invalid_grant'
```

### 9.5.4 认证状态缓存

为避免已知需要认证的服务器反复发起 401 请求，系统维护了一个 15 分钟 TTL 的认证缓存：

```typescript
const MCP_AUTH_CACHE_TTL_MS = 15 * 60 * 1000

// 序列化写入，防止并发 read-modify-write 竞争
let writeChain = Promise.resolve()

function setMcpAuthCacheEntry(serverId: string): void {
  writeChain = writeChain.then(async () => {
    const cache = await getMcpAuthCache()
    cache[serverId] = { timestamp: Date.now() }
    await writeFile(cachePath, jsonStringify(cache))
    authCachePromise = null  // 使读缓存失效
  })
}
```

这里的 `writeChain` 模式值得借鉴：通过 Promise 链序列化写操作，在不引入锁机制的情况下防止并发写入导致的数据丢失。

---

## 9.6 Elicitation 交互式授权算法

### 9.6.1 问题背景

有些 MCP 操作需要用户的即时授权或输入——例如服务端需要用户选择一个 Jira 项目，或确认一次数据库写操作。MCP 的 Elicitation 机制允许服务端向客户端发起交互请求。

### 9.6.2 两种 Elicitation 模式

Claude Code 支持两种 Elicitation 模式：

```typescript
function getElicitationMode(params: ElicitRequestParams): 'form' | 'url' {
  return params.mode === 'url' ? 'url' : 'form'
}
```

- **Form 模式**：服务端定义一个表单 Schema，客户端渲染表单、收集用户输入后返回。
- **URL 模式**：服务端提供一个 URL，客户端打开浏览器，等待服务端确认完成（通过 `ElicitationCompleteNotification`）。

### 9.6.3 Elicitation 处理流程

```
服务端发送 ElicitRequest
    ↓
1. 运行 Elicitation Hooks（可编程式响应）
    ↓ (若 Hook 未处理)
2. 将请求加入 AppState.elicitation.queue
3. UI 层渲染 ElicitationDialog
4. 用户交互（填写表单 / 打开浏览器）
5. 用户响应：accept / decline / cancel
    ↓
6. 运行 ElicitationResult Hooks（可修改响应）
    ↓
7. 返回 ElicitResult 给服务端
```

Hook 机制允许 IDE 集成或自动化测试场景下无 UI 地处理 Elicitation。

### 9.6.4 表单验证

Elicitation 表单支持丰富的字段类型，验证逻辑在 `elicitationValidation.ts` 中实现：

```typescript
function getZodSchema(schema: PrimitiveSchemaDefinition): z.ZodTypeAny {
  if (isEnumSchema(schema)) {
    return z.enum([first, ...rest])         // 枚举选择
  }
  if (schema.type === 'string') {
    // 支持 email, uri, date, date-time 格式校验
    // 支持 minLength, maxLength 约束
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    // 支持 minimum, maximum 范围约束
  }
  if (schema.type === 'boolean') {
    return z.coerce.boolean()
  }
}
```

特别值得注意的是异步验证：当用户输入的日期时间不是 ISO 8601 格式时，系统会调用 AI 模型进行自然语言解析：

```typescript
export async function validateElicitationInputAsync(
  stringValue: string,
  schema: PrimitiveSchemaDefinition,
  signal: AbortSignal,
): Promise<ValidationResult> {
  const syncResult = validateElicitationInput(stringValue, schema)
  if (syncResult.isValid) return syncResult

  // 非 ISO 格式的日期/时间：尝试自然语言解析
  if (isDateTimeSchema(schema) && !looksLikeISO8601(stringValue)) {
    const parseResult = await parseNaturalLanguageDateTime(
      stringValue, schema.format, signal
    )
    if (parseResult.success) {
      return validateElicitationInput(parseResult.value, schema)
    }
  }
  return syncResult
}
```

这意味着用户可以输入 "next Monday at 3pm" 这样的自然语言，系统会将其转换为标准的 ISO 8601 格式。

---

## 9.7 资源截断策略

### 9.7.1 问题与阈值

MCP 工具可能返回极大量的数据（例如数据库查询结果），但 LLM 的上下文窗口有限。系统定义了一个可配置的截断阈值：

```typescript
const DEFAULT_MAX_MCP_OUTPUT_TOKENS = 25000
export const MCP_TOKEN_COUNT_THRESHOLD_FACTOR = 0.5
```

### 9.7.2 两阶段截断决策

截断决策采用两阶段策略以平衡准确性与性能：

```typescript
export async function mcpContentNeedsTruncation(content: MCPToolResult): Promise<boolean> {
  if (!content) return false

  // 阶段 1: 粗略估计（O(n) 字符扫描，无 API 调用）
  const contentSizeEstimate = getContentSizeEstimate(content)
  if (contentSizeEstimate <= getMaxMcpOutputTokens() * MCP_TOKEN_COUNT_THRESHOLD_FACTOR) {
    return false  // 低于阈值 50%，直接放行
  }

  // 阶段 2: 精确计数（调用 API 进行 token 计数）
  const tokenCount = await countMessagesTokensWithAPI(messages, [])
  return !!(tokenCount && tokenCount > getMaxMcpOutputTokens())
}
```

当粗略估计低于阈值的 50% 时，直接判定无需截断。只有在"可能超标"的灰色区域，才调用精确的 token 计数 API。这避免了对每次 MCP 调用都发起 API 请求的开销。

### 9.7.3 内容截断算法

截断针对文本块和图片块分别处理：

```typescript
async function truncateContentBlocks(
  blocks: ContentBlockParam[], maxChars: number
): Promise<ContentBlockParam[]> {
  const result: ContentBlockParam[] = []
  let currentChars = 0

  for (const block of blocks) {
    if (isTextBlock(block)) {
      const remainingChars = maxChars - currentChars
      if (remainingChars <= 0) break
      if (block.text.length <= remainingChars) {
        result.push(block)
        currentChars += block.text.length
      } else {
        result.push({ type: 'text', text: block.text.slice(0, remainingChars) })
        break
      }
    } else if (isImageBlock(block)) {
      const imageChars = IMAGE_TOKEN_ESTIMATE * 4  // 1600 tokens × 4
      if (currentChars + imageChars <= maxChars) {
        result.push(block)
        currentChars += imageChars
      } else {
        // 尝试压缩图片以适应剩余空间
        const compressedBlock = await compressImageBlock(block, remainingBytes)
        result.push(compressedBlock)
      }
    }
  }
  return result
}
```

截断后附加明确的提示消息，引导 Agent 使用分页或过滤工具获取完整数据：

```
[OUTPUT TRUNCATED - exceeded 25000 token limit]
The tool output was truncated. If this MCP server provides pagination
or filtering tools, use them to retrieve specific portions of the data.
```

---

## 9.8 工具分类与安全管理算法

### 9.8.1 MCP 工具名称标准化

MCP 工具名称需要符合 API 模式 `^[a-zA-Z0-9_-]{1,64}$`。`normalizeNameForMCP` 函数进行标准化：

```typescript
export function normalizeNameForMCP(name: string): string {
  let normalized = name.replace(/[^a-zA-Z0-9_-]/g, '_')
  if (name.startsWith('claude.ai ')) {
    // claude.ai 服务器额外处理：避免 __ 分隔符冲突
    normalized = normalized.replace(/_+/g, '_').replace(/^_|_$/g, '')
  }
  return normalized
}
```

完整的 MCP 工具名称格式为 `mcp__{serverName}__{toolName}`，使用双下划线作为分隔符。

### 9.8.2 工具行为分类

`classifyForCollapse.ts` 实现了一个基于允许列表的工具分类算法，将数百个已知的 MCP 工具分为三类：

- **Search 工具**（如 `slack_search_public`、`search_code`）：搜索类操作
- **Read 工具**（如 `slack_read_channel`、`get_file_contents`）：只读操作
- **Write 工具**（未在列表中的默认类别）：可能有副作用的操作

分类算法首先将工具名称标准化为 snake_case，然后在预定义集合中查找：

```typescript
function normalize(name: string): string {
  return name
    .replace(/([a-z])([A-Z])/g, '$1_$2')  // camelCase → snake_case
    .replace(/-/g, '_')                      // kebab-case → snake_case
    .toLowerCase()
}

export function classifyMcpToolForCollapse(
  _serverName: string, toolName: string
): { isSearch: boolean; isRead: boolean } {
  const normalized = normalize(toolName)
  return {
    isSearch: SEARCH_TOOLS.has(normalized),
    isRead: READ_TOOLS.has(normalized),
  }
}
```

这个分类驱动了两个关键行为：
1. **UI 折叠**：搜索和只读工具的结果在 UI 中默认折叠，减少视觉噪声。
2. **并发安全**：标记了 `readOnlyHint` 的工具可以并发执行，而非串行等待。

### 9.8.3 工具描述截断

MCP 服务器（尤其是基于 OpenAPI 自动生成的）可能在工具描述中注入数十 KB 的文档。系统对描述进行硬截断：

```typescript
const MAX_MCP_DESCRIPTION_LENGTH = 2048

async prompt() {
  const desc = tool.description ?? ''
  return desc.length > MAX_MCP_DESCRIPTION_LENGTH
    ? desc.slice(0, MAX_MCP_DESCRIPTION_LENGTH) + '… [truncated]'
    : desc
}
```

---

## 9.9 架构图解

下面的序列图展示了 MCP 通信的完整生命周期：

```
┌──────────────┐         ┌───────────────┐         ┌──────────────┐
│ Claude Code  │         │  MCP Client   │         │  MCP Server  │
│   (Agent)    │         │   (SDK)       │         │  (External)  │
└──────┬───────┘         └───────┬───────┘         └──────┬───────┘
       │                         │                        │
       │  1. 读取配置             │                        │
       │  选择传输层              │                        │
       ├────────────────────────>│                        │
       │                         │  2. 建立传输连接        │
       │                         ├───────────────────────>│
       │                         │                        │
       │                         │  3. initialize         │
       │                         │  (声明客户端能力)        │
       │                         ├───────────────────────>│
       │                         │                        │
       │                         │  4. initialize response│
       │                         │  (返回服务端能力)        │
       │                         │<───────────────────────┤
       │                         │                        │
       │                         │  5. tools/list         │
       │  6. 注册工具到 Agent     │<───────────────────────┤
       │<────────────────────────┤                        │
       │                         │                        │
       │  7. Agent 决定调用工具   │                        │
       ├────────────────────────>│  8. tools/call         │
       │                         ├───────────────────────>│
       │                         │                        │
       │                         │  9. Elicitation?       │
       │                         │<───────────────────────┤
       │  10. 显示 UI 给用户     │                        │
       │<────────────────────────┤                        │
       │  11. 用户响应           │  12. ElicitResult      │
       ├────────────────────────>│───────────────────────>│
       │                         │                        │
       │                         │  13. 工具执行结果       │
       │  14. 截断检查           │<───────────────────────┤
       │<────────────────────────┤                        │
       │  15. 结果送入上下文      │                        │
       │                         │                        │
```

---

## 9.10 思考题

**思考题 1：传输层选择的扩展性**

当前系统通过 `if-else` 链选择传输层。如果未来需要支持更多传输类型（如 QUIC、gRPC），这个决策树会变得越来越庞大。请设计一种基于注册表（Registry）模式的传输选择架构，使新增传输类型只需注册一个工厂函数，而无需修改 `connectToServer` 的主体逻辑。

**思考题 2：断连检测的准确性**

当前的断连检测依赖错误消息中的关键字匹配（如 `ECONNRESET`、`ETIMEDOUT`）。这种方式在不同运行时（Node.js vs Bun）和不同 MCP SDK 版本下可能不稳定。请提出一种更健壮的断连检测策略，例如基于心跳/ping-pong 机制或传输层状态码的方案，并分析其对延迟和资源消耗的影响。

**思考题 3：资源截断的语义保全**

当前的截断算法是基于 token 数量的简单截尾。但对于结构化数据（如 JSON 数组、SQL 查询结果），截尾可能破坏数据结构的完整性，导致 Agent 基于不完整的 JSON 做出错误推理。请设计一种"语义感知"的截断策略，能在保持数据结构完整性的前提下智能选择保留哪些数据。

---

## 9.11 小结

本章深入剖析了 Claude Code 中 MCP 协议的完整实现，揭示了以下核心设计思想：

1. **传输层抽象**：通过策略模式将传输选择与连接逻辑解耦，支持 stdio、SSE、HTTP、WebSocket 等多种传输，并通过 fetch 包装链实现超时、认证、Step-up 检测等横切关注点的组合。

2. **双向能力协商**：客户端与服务端在握手阶段互相声明能力，后续的功能发现（工具、资源、提示）以能力声明为前提，避免不必要的网络请求。

3. **连接生命周期管理**：通过 memoization 连接池、超时竞赛、三级信号升级关闭、以及基于连续错误计数的自动重连，实现了高效且健壮的连接管理。

4. **多层认证体系**：OAuth 认证实现了 RFC 9728/8414 的多层回退发现、PKCE 安全增强、Token 刷新的错误标准化、以及基于文件系统的认证状态缓存。

5. **用户交互桥接**：Elicitation 机制在 Agent 的自动化执行流程中嵌入了人类决策点，支持表单和 URL 两种模式，并通过 Hook 机制允许编程式响应。

6. **智能资源管控**：两阶段截断决策平衡了准确性与性能，工具描述截断防止了上下文污染，而基于允许列表的工具分类则驱动了 UI 优化和并发控制。

MCP 协议的设计本质上解决了一个分布式系统的经典问题：如何在异构的通信环境中建立统一的交互范式。Claude Code 的实现告诉我们，好的协议不仅需要清晰的抽象层次，更需要在每一层中处理大量的边界情况——从 Java SDK 的反序列化兼容性，到 Slack OAuth 的非标准错误码，再到 Bun 运行时的内存泄漏。这些"丑陋"的工程细节，恰恰是协议从"设计"走向"可用"的关键。
