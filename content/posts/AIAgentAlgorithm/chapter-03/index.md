+++
date = '2026-06-09T00:00:00+08:00'
draft = false
title = "第3章 启动算法与生命周期管理"
tags = ["AI Agent", "Claude Code", "算法思想", "生命周期管理", "启动算法"]
categories = ["AI Agent", "Claude Code"]
weight = 5
+++
> "一个系统的工程成熟度，不在于它能做什么，而在于它多快准备好做什么，以及它如何在做完之后优雅地离开。"

## 3.1 问题引入：亚秒级启动的挑战

想象这样一个系统：它拥有 45 个以上的内置工具、上百个 CLI 命令选项、数十个服务模块，还要在启动时读取操作系统钥匙串、解析 MDM 企业管理策略、连接 MCP 外部服务器、加载插件与技能系统、执行数据迁移、初始化遥测与分析管道——然后在用户敲下回车后的 900 毫秒内完成首次渲染。

这不是理论问题，而是 Claude Code 每次启动时面临的真实挑战。

传统做法是串行初始化：读取配置 → 验证权限 → 加载模块 → 渲染界面。但这种线性流水线在模块数量膨胀后迅速成为瓶颈。假设有 N 个初始化任务，每个平均耗时 t_i，串行总时间为 T_serial = sum(t_i)。当 N 超过 30、且部分任务涉及子进程 spawn 或网络 I/O 时，T_serial 轻松突破数秒。

Claude Code 的回答是一套精心编排的**并行预取 + 延迟初始化 + 依赖拓扑排序**算法。本章将从源码中提取这些算法思想，揭示如何在有限时间内完成复杂的启动序列，以及如何在生命终结时优雅退场。

## 3.2 并行预取算法：与模块加载赛跑

### 3.2.1 核心洞察：子进程 spawn 与 import 的时间重叠

Claude Code 启动的第一个算法洞察是：**JavaScript 模块的 import 求值是 CPU 密集型的同步操作，而子进程 spawn 是异步 I/O 操作——两者可以完美重叠**。

打开 `main.tsx` 的前 20 行，你会看到一段精心安排的代码序列：

```
// main.tsx 顶部（伪代码）
import { profileCheckpoint } from './utils/startupProfiler.js'

profileCheckpoint('main_tsx_entry')                    // 标记：入口

import { startMdmRawRead } from './settings/mdm/rawRead.js'
startMdmRawRead()                                      // 立即启动 MDM 子进程

import { startKeychainPrefetch } from './secureStorage/keychainPrefetch.js'
startKeychainPrefetch()                                 // 立即启动钥匙串读取

// 接下来是约 135ms 的 import 链...
import { Command } from '@commander-js/extra-typings'
import chalk from 'chalk'
import React from 'react'
// ... 总计约 180+ 个 import 语句 ...

profileCheckpoint('main_tsx_imports_loaded')            // 标记：import 完成
```

这里的关键在于 **import 语句之间的副作用调用**。ECMAScript 规范保证 import 按源码顺序同步求值。`startMdmRawRead()` 在第三个 import 之后立即执行，此时 Node.js/Bun 还在同步求值后续的 180 多个 import 语句。被 spawn 的子进程（macOS 上是 `plutil`，Windows 上是 `reg query`）在独立进程空间运行，与主线程的 import 求值**并行执行**。

用时序图表达：

```
时间轴 ─────────────────────────────────────────────────>

主线程:  [import profileCheckpoint] [startMdmRawRead()] [import ...剩余180个模块... ~135ms]
MDM进程:                            [plutil 子进程执行 ~~~~~~ ~5-40ms]
钥匙串:                              [security 子进程1 ~32ms] [security 子进程2 ~33ms]
                                      ↑ 两个钥匙串读取也是并行的

结果:    子进程在 import 求值期间就已完成, 后续 await 几乎零成本
```

### 3.2.2 MDM 预取的具体实现

`rawRead.ts` 的设计体现了"最小依赖"原则——它只导入 `child_process` 和 `fs`，避免引入重型模块链：

```
// rawRead.ts 核心算法（伪代码）
let rawReadPromise = null

function startMdmRawRead():
    if rawReadPromise: return          // 幂等：只启动一次
    rawReadPromise = fireRawRead()

function fireRawRead() -> Promise<RawReadResult>:
    if platform == 'darwin':
        plistPaths = getMacOSPlistPaths()    // 多个可能的 plist 路径
        results = await Promise.all(
            plistPaths.map(path =>
                if not existsSync(path):     // 快速路径：文件不存在则跳过
                    return { stdout: '', ok: false }
                return execFilePromise('plutil', [...args, path])
            )
        )
        return first(results, r => r.ok)     // 优先级序列，取第一个成功的

    if platform == 'win32':
        [hklm, hkcu] = await Promise.all([   // HKLM 和 HKCU 并行读取
            execFilePromise('reg', ['query', HKLM_PATH, ...]),
            execFilePromise('reg', ['query', HKCU_PATH, ...])
        ])
        return { hklmStdout, hkcuStdout }

    return empty                              // Linux 无 MDM 等价物
```

这里有两个值得注意的算法细节：

1. **existsSync 快速路径**：在非 MDM 管理的机器上（绝大多数开发者），plist 文件不存在。`existsSync` 是纯文件系统调用，耗时远小于 spawn 子进程的约 5ms 开销。这个快速路径将绝大多数用户的 MDM 检测成本降至微秒级。

2. **优先级序列模式**：macOS 上可能存在多个 MDM 配置路径（系统级、用户级等），它们按优先级排列在数组中。`Promise.all` 并行读取所有路径，然后取第一个成功的——这是并行探测与优先级决策的组合模式。

### 3.2.3 钥匙串并行预取

钥匙串预取（`keychainPrefetch.ts`）解决的问题更具体：macOS 上读取两个 Keychain 条目（OAuth 令牌和遗留 API Key）原本是**串行**的同步操作，每个约 32-33ms，总计约 65ms。预取算法将其改为：

```
// keychainPrefetch.ts 核心算法（伪代码）
function startKeychainPrefetch():
    if platform != 'darwin': return
    if prefetchPromise: return        // 幂等
    if isBareMode(): return           // --bare 模式跳过

    // 两个 security 子进程同时 spawn
    oauthSpawn  = spawnSecurity(CREDENTIALS_SERVICE)
    legacySpawn = spawnSecurity(LEGACY_SERVICE)

    prefetchPromise = Promise.all([oauthSpawn, legacySpawn])
        .then(([oauth, legacy]) =>
            if not oauth.timedOut:  primeKeychainCache(oauth.stdout)
            if not legacy.timedOut: legacyApiKeyPrefetch = { stdout: legacy.stdout }
        )

// 在 preAction 钩子中等待结果
async function ensureKeychainPrefetchCompleted():
    if prefetchPromise: await prefetchPromise
```

关键设计：**超时保护**。如果子进程超时（`err.killed === true`），预取结果不会写入缓存——因为超时意味着钥匙串中**可能存在**密钥但未成功读取，贸然缓存 `null` 会遮蔽真实值。后续的同步读取路径会用更长的超时重试。

### 3.2.4 并行预取的通用模式

从源码中可以提炼出 Claude Code 使用的通用并行预取模式：

```
// 通用模式：Spawn-During-Import
阶段 1 — 模块求值期（同步，不可打断）:
    import 最小依赖
    启动异步操作（子进程 / 网络 / 文件 I/O）
    继续 import 其余模块                    // 异步操作在后台运行

阶段 2 — 命令解析期:
    commander.hook('preAction', async () =>
        await Promise.all([                 // 此时异步操作大概率已完成
            ensureMdmSettingsLoaded(),
            ensureKeychainPrefetchCompleted()
        ])
        await init()                        // init() 中的同步读取命中预取缓存
    )

阶段 3 — setup() + 首次渲染:
    // setup() 与 getCommands() 并行
    setupPromise = setup(cwd, ...)          // ~28ms，主要是 UDS socket bind
    commandsPromise = getCommands(cwd)      // 文件系统读取，与 setup 不竞争 I/O
    await setupPromise
    commands = await commandsPromise        // 大概率已完成
```

**总时间**不再是所有任务的总和，而是最长并行路径的时间加上少量串行关键路径：

```
T_total ≈ T_import + max(T_mdm, T_keychain) + T_init + max(T_setup, T_commands)
        ≈ 135ms   + ~0ms（已在import中完成）+ 50ms  + max(28ms, 15ms)
        ≈ 213ms
```

对比串行方案：`135 + 40 + 65 + 50 + 28 + 15 = 333ms`。节省约 36%，且随预取任务增多优势更大。

## 3.3 依赖图解析：初始化任务的拓扑排序

### 3.3.1 隐式依赖图

并行预取的前提是正确识别任务间的依赖关系。Claude Code 的启动序列中存在一张隐式的有向无环图（DAG）：

```
                    ┌─────────────────┐
                    │  main_tsx_entry  │
                    └────────┬────────┘
                  ┌──────────┼──────────┐
                  ▼          ▼          ▼
           ┌──────────┐ ┌────────┐ ┌──────────────┐
           │ MDM Read │ │Keychain│ │ Module Import │
           └────┬─────┘ └───┬────┘ └──────┬───────┘
                │            │             │
                └──────┬─────┘             │
                       ▼                   ▼
              ┌──────────────┐   ┌──────────────────┐
              │ensureMdm/KC  │   │ eagerLoadSettings │
              └──────┬───────┘   └────────┬─────────┘
                     │                    │
                     └────────┬───────────┘
                              ▼
                     ┌──────────────┐
                     │    init()    │─────────────────────────┐
                     └──────┬──────┘                         │
                            │                                ▼
               ┌────────────┼────────────┐        ┌──────────────────┐
               ▼            ▼            ▼        │ setupGraceful    │
        ┌───────────┐ ┌──────────┐ ┌─────────┐   │ Shutdown()       │
        │ mTLS/Proxy│ │ 1P Event │ │ OAuth   │   └──────────────────┘
        │ Configure │ │ Logging  │ │ Populate│
        └─────┬─────┘ └──────────┘ └─────────┘
              │
              ▼
       ┌──────────────┐
       │ preconnect   │   ← TCP+TLS 预握手，与后续工作重叠
       │ AnthropicApi │
       └──────────────┘
              │
              ▼
     ┌────────────────┐     ┌───────────────┐
     │    setup()     │────▶│  getCommands() │  ← 并行执行
     └────────┬───────┘     └───────┬───────┘
              │                     │
              ▼                     ▼
     ┌────────────────┐    ┌───────────────┐
     │   MCP Connect  │    │ SessionStart  │  ← 并行执行
     │   (prefetch)   │    │ Hooks         │
     └────────┬───────┘    └───────┬───────┘
              │                    │
              └────────┬───────────┘
                       ▼
              ┌────────────────┐
              │  launchRepl()  │
              │  首次渲染       │
              └────────┬───────┘
                       ▼
              ┌────────────────┐
              │ startDeferred  │  ← 首次渲染后才执行
              │ Prefetches()   │
              └────────────────┘
```

### 3.3.2 关键约束与排序规则

从源码注释中可以提取出这些约束规则：

**硬约束**（违反会导致错误）：
1. `setCwd()` 必须在任何依赖 cwd 的代码之前调用
2. `ensureMdmSettingsLoaded()` 必须在 `init()` 之前完成（init 触发 settings 读取）
3. `ensureKeychainPrefetchCompleted()` 必须在 `applySafeConfigEnvironmentVariables()` 之前（否则触发 65ms 同步钥匙串读取）
4. `applyExtraCACertsFromConfig()` 必须在任何 TLS 连接之前（Bun 在启动时缓存 TLS 证书库）
5. `configureGlobalMTLS()` 和 `configureGlobalAgents()` 必须在 `preconnectAnthropicApi()` 之前

**软约束**（违反会导致性能下降但不出错）：
1. `initBundledSkills()` 应在 `getCommands()` 之前（否则命令列表中缺少内置技能）
2. `processSessionStartHooks()` 应与 MCP 连接并行（两者无数据依赖）
3. `startDeferredPrefetches()` 应在首次渲染之后（避免争抢事件循环）

### 3.3.3 preAction 钩子：拓扑排序的序列化点

Commander.js 的 `preAction` 钩子充当了启动序列的**汇合点**（join point）。所有必须在命令执行前完成的异步操作在此 await：

```
program.hook('preAction', async () =>
    // 汇合点 1：等待模块求值期启动的子进程
    await Promise.all([
        ensureMdmSettingsLoaded(),
        ensureKeychainPrefetchCompleted()
    ])

    // 汇合点 2：执行 init()（内部有自己的并行操作）
    await init()

    // 汇合点 3：附加日志 sink、运行迁移
    initSinks()
    runMigrations()

    // 启动非阻塞远程设置加载
    void loadRemoteManagedSettings()
    void loadPolicyLimits()
)
```

这种设计将 DAG 中的并行分支在 `preAction` 处汇合，确保后续的 `action` handler 看到一致的初始化状态。

## 3.4 延迟初始化策略：只在需要时付出代价

### 3.4.1 动态 import 的分层策略

Claude Code 对动态 `import()` 的使用不是随意的，而是遵循明确的分层策略：

**第一层：死代码消除（编译期）**
```
// 通过 feature flag 实现编译期消除
const coordinatorModule = feature('COORDINATOR_MODE')
    ? require('./coordinator/coordinatorMode.js')
    : null

// 如果 COORDINATOR_MODE 为 false，打包工具可以 tree-shake 整个模块
```

**第二层：动态 import（运行期条件加载）**
```
// 仅在特定条件下加载重型模块
if (feature('COMMIT_ATTRIBUTION')):
    setImmediate(() =>                        // 推迟到下一个 tick
        void import('./utils/attributionHooks.js')
            .then(m => m.registerAttributionHooks())
    )
```

注意 `setImmediate` 的使用：它将子进程 spawn 推迟到首次渲染之后的事件循环周期，避免在 `setup()` 的微任务窗口内竞争 CPU。

**第三层：首次渲染后延迟加载**

`startDeferredPrefetches()` 函数封装了所有不影响首次渲染的预热工作：

```
function startDeferredPrefetches():
    if isBareMode(): return        // --bare 模式：一切从简

    // 这些在用户打字期间预热，首次 API 调用时命中缓存
    void initUser()
    void getUserContext()
    void prefetchSystemContextIfSafe()
    void getRelevantTips()
    void countFilesRoundedRg(cwd, timeout=3000)

    // 功能标志和分析初始化
    void initializeAnalyticsGates()
    void prefetchOfficialMcpUrls()
    void refreshModelCapabilities()

    // 变更检测器
    void settingsChangeDetector.initialize()
    void skillChangeDetector.initialize()
```

这个函数在 REPL 首次渲染之后才调用。设计哲学是：**用户输入第一个提示词需要时间（通常 3-10 秒），这段"用户思考时间"是免费的计算窗口**。将缓存预热和非关键初始化推迟到此窗口，用户完全感知不到延迟。

### 3.4.2 --bare 模式：极简启动路径

`--bare` 模式（也称 SIMPLE 模式）是延迟初始化的极端案例——它跳过几乎所有非必要初始化：

```
--bare 跳过的组件:
  ✗ CLAUDE.md 自动发现
  ✗ 钥匙串读取（仅用环境变量 API Key）
  ✗ Hooks 系统（SessionStart、FileChanged 等）
  ✗ LSP 服务器管理
  ✗ 插件同步
  ✗ 提交归因
  ✗ 自动记忆（Auto-memory）
  ✗ 后台预取（initUser、getUserContext 等）
  ✗ 团队记忆观察者
  ✗ 会话文件访问分析

--bare 保留的组件:
  ✓ 权限安全门控
  ✓ tengu_started 启动信标（发版健康监控）
  ✓ API Key 预取（如果已建立信任）
  ✓ 核心工具加载
```

这种分层设计使得 SDK 调用（通过 `--bare` 或 `-p` 模式）的启动路径远短于交互式 REPL，将启动开销控制在最小。

## 3.5 循环依赖破解：动态 require 的艺术

### 3.5.1 问题本质

在大型 TypeScript 项目中，循环依赖是难以完全避免的。Claude Code 的模块图中存在多个潜在环路，例如：

```
teammate.ts → AppState.tsx → ... → main.tsx → teammate.ts
```

在 ES Module 规范下，循环导入会导致被导入模块的绑定在求值时为 `undefined`，引发运行时错误。

### 3.5.2 惰性 require 模式

Claude Code 采用**惰性 require 工厂函数**打破编译期循环：

```typescript
// main.tsx 第 68-77 行
// Lazy require to avoid circular dependency:
//   teammate.ts -> AppState.tsx -> ... -> main.tsx
const getTeammateUtils = () =>
    require('./utils/teammate.js') as typeof import('./utils/teammate.js')

const getTeammatePromptAddendum = () =>
    require('./utils/swarm/teammatePromptAddendum.js')
        as typeof import('./utils/swarm/teammatePromptAddendum.js')

const getTeammateModeSnapshot = () =>
    require('./utils/swarm/backends/teammateModeSnapshot.js')
        as typeof import('./utils/swarm/backends/teammateModeSnapshot.js')
```

这个模式的精妙之处：

1. **工厂函数延迟求值**：`require()` 在函数被调用时才执行，而非模块加载时。到调用时，环路中的所有模块已经完成初始化。
2. **类型安全**：`as typeof import(...)` 保留了完整的 TypeScript 类型信息，IDE 补全和类型检查正常工作。
3. **缓存语义**：`require()` 的结果由 Node.js/Bun 的模块缓存管理，多次调用 `getTeammateUtils()` 不会重复加载。

### 3.5.3 源码中循环依赖的常见场景

从 Claude Code 源码中可以总结出几种典型的循环依赖场景及其解法：

| 场景 | 示例 | 解法 |
|------|------|------|
| 状态管理 ↔ UI 组件 | AppState ↔ main.tsx | 惰性 require 工厂 |
| 工具名常量 ↔ 工具实现 | BashTool prompt ↔ BashTool impl | 抽取常量到独立文件（`toolName.ts`） |
| Hook 类型 ↔ 设置类型 | hooks schema ↔ settings types | 抽取 schema 到独立模块 |
| 分析管道 ↔ 其他模块 | analytics/index.ts | 零依赖设计，不导入任何业务模块 |
| 权限系统 ↔ 文件系统 | permissions ↔ filesystem | 动态 import 在使用点 |

`analytics/index.ts` 的注释尤其值得关注："This module has NO dependencies to avoid import cycles." 这是另一种策略：**将高频被依赖的模块设计为零依赖**，从根本上消除它参与循环的可能。

## 3.6 优雅终止协议：有序的资源回收

### 3.6.1 问题的复杂性

进程终止听起来简单——`process.exit()` 就行了。但对于 Claude Code 这样的交互式系统，暴力退出会导致：

- 终端停留在替代屏幕（alt screen），用户看不到 shell 提示符
- 鼠标追踪、键盘扩展协议未关闭，终端行为异常
- 会话数据未持久化，无法 resume
- MCP 服务器连接未关闭，子进程成为孤儿
- 分析事件丢失，影响发版健康监控

### 3.6.2 清理注册表：发布-订阅的清理模式

Claude Code 设计了一个全局清理注册表（`cleanupRegistry.ts`），它与 `gracefulShutdown.ts` 解耦以避免循环依赖：

```typescript
// cleanupRegistry.ts — 极简设计
const cleanupFunctions = new Set<() => Promise<void>>()

function registerCleanup(cleanupFn): () => void {
    cleanupFunctions.add(cleanupFn)
    return () => cleanupFunctions.delete(cleanupFn)  // 返回注销函数
}

async function runCleanupFunctions(): void {
    await Promise.all(
        Array.from(cleanupFunctions).map(fn => fn())
    )
}
```

各模块在初始化时注册清理函数：

```
// init.ts 中的注册示例
registerCleanup(shutdownLspServerManager)         // LSP 服务器关闭
registerCleanup(async () => {
    const { cleanupSessionTeams } = await import('./swarm/teamHelpers.js')
    await cleanupSessionTeams()                    // 清理团队工作区
})
```

注意清理函数中的动态 import——这是故意的。如果整个会话从未使用 swarm 功能，`teamHelpers.js` 从未被加载，清理时的 import 会加载它并执行清理。如果已被加载则命中缓存。**这保证了清理的完备性而不增加启动时的加载成本。**

返回值是注销函数，遵循 React hooks 的 cleanup 模式——短生命周期的资源可以在不需要时取消注册。

### 3.6.3 gracefulShutdown：分阶段有序退出

`gracefulShutdown()` 是整个退出协议的编排器。它按严格顺序执行多个阶段：

```
async function gracefulShutdown(exitCode, reason, options):
    if shutdownInProgress: return      // 幂等保护：只执行一次
    shutdownInProgress = true

    // ① 计算故障保护预算
    sessionEndTimeoutMs = getSessionEndHookTimeoutMs()
    failsafeTimer = setTimeout(
        () => { cleanupTerminalModes(); printResumeHint(); forceExit(code) },
        max(5000, sessionEndTimeoutMs + 3500)    // 至少 5 秒，留足 hook 预算
    )
    failsafeTimer.unref()              // 不阻止进程退出

    // ② 立即恢复终端状态（最高优先级）
    cleanupTerminalModes()             // 同步、writeSync，不会被打断
    printResumeHint()                  // 打印 resume 提示

    // ③ 执行注册的清理函数（限时 2 秒）
    try:
        await Promise.race([
            runCleanupFunctions(),
            timeout(2000)              // 超时即放弃
        ])

    // ④ 执行 SessionEnd 生命周期钩子（限时可配置）
    try:
        await executeSessionEndHooks(reason, {
            signal: AbortSignal.timeout(sessionEndTimeoutMs)
        })

    // ⑤ 记录启动性能报告
    profileReport()

    // ⑥ 发送缓存驱逐提示
    logEvent('tengu_cache_eviction_hint', { last_request_id })

    // ⑦ 刷新分析管道（限时 500ms）
    await Promise.race([
        Promise.all([shutdown1PEventLogging(), shutdownDatadog()]),
        sleep(500)
    ])

    // ⑧ 强制退出
    forceExit(exitCode)
```

### 3.6.4 故障保护定时器：最后的防线

上述流程中，**故障保护定时器**是最关键的安全机制。设计要点：

1. **预算动态计算**：`max(5000, sessionEndTimeoutMs + 3500)`。如果用户配置了 10 秒的 SessionEnd hook 超时，故障保护自动延展到 13.5 秒。源码注释 "gh-32712 follow-up" 说明这是在修复一个真实 bug 后添加的——之前 5 秒的固定超时会截断用户配置的 hook。

2. **先清理终端再退出**：故障保护定时器的回调先调用 `cleanupTerminalModes()`，再调用 `forceExit()`。这确保即使清理逻辑挂起，终端也不会处于损坏状态。

3. **`unref()` 语义**：`failsafeTimer.unref()` 告诉 Node.js 事件循环不要仅因为这个定时器而保持进程存活。如果所有异步操作都已完成，进程会自然退出而不等待定时器。

### 3.6.5 终端模式清理：底层细节

`cleanupTerminalModes()` 使用同步的 `writeSync` 直接向文件描述符 1（stdout）写入终端控制序列：

```
function cleanupTerminalModes():
    if not process.stdout.isTTY: return

    writeSync(1, DISABLE_MOUSE_TRACKING)       // 最先发送：需要终端往返时间
    // Ink 实例卸载（退出替代屏幕）
    inst = instances.get(process.stdout)
    if inst?.isAltScreenActive:
        inst.unmount()                          // 在替代屏幕上完成最终渲染
    inst?.drainStdin()                          // 排空卸载期间到达的输入
    inst?.detachForShutdown()                   // 标记已卸载，防止重复清理
    writeSync(1, DISABLE_MODIFY_OTHER_KEYS)     // 禁用扩展按键协议
    writeSync(1, DISABLE_KITTY_KEYBOARD)        // 禁用 Kitty 键盘协议
    writeSync(1, DFE)                           // 禁用焦点事件
    writeSync(1, DBP)                           // 禁用方括号粘贴模式
    writeSync(1, SHOW_CURSOR)                   // 显示光标
    writeSync(1, CLEAR_ITERM2_PROGRESS)         // 清除进度条
    writeSync(1, CLEAR_TAB_STATUS)              // 清除标签状态
    writeSync(1, CLEAR_TERMINAL_TITLE)          // 清除终端标题
```

这段代码的注释密度极高，每条都解释了"为什么"而不仅是"做什么"。特别值得注意的是 `DISABLE_MOUSE_TRACKING` 被**最先**发送——因为禁用鼠标追踪需要一个终端往返时间（终端收到序列 → 停止发送鼠标事件），在这个往返期间可以执行 Ink 卸载等其他清理工作。这是一种**流水线化**的思想：利用 I/O 延迟窗口执行计算。

### 3.6.6 信号处理与孤儿进程检测

`setupGracefulShutdown()` 注册了完整的信号处理链：

```
process.on('SIGINT',  () => gracefulShutdown(0))      // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown(143))     // kill 命令 (128+15)
process.on('SIGHUP',  () => gracefulShutdown(129))     // 终端关闭 (128+1)
```

但 macOS 有一个特殊问题：关闭终端窗口时，系统有时不发送 `SIGHUP`，而是撤销 TTY 文件描述符的权限。进程仍在运行但无法读写终端。Claude Code 通过定期检测解决：

```
if process.stdin.isTTY:
    orphanCheckInterval = setInterval(() =>
        if isScrollDraining: return    // 滚动排空期间跳过（节省事件循环时间）
        if not process.stdout.writable or not process.stdin.readable:
            clearInterval(orphanCheckInterval)
            gracefulShutdown(129)       // 作为 SIGHUP 处理
    , 30_000)                          // 每 30 秒检查
    orphanCheckInterval.unref()        // 不阻止自然退出
```

这里还有一个精妙的处理——`signal-exit` 库的 Bun 兼容性 bug。当短生命周期的 signal-exit 订阅者注销时，Bun 会错误地重置内核级 sigaction，导致后续信号直接触发默认行为（终止进程），而不是调用 JavaScript handler。解法是**钉住一个永不注销的空 handler**：

```
onExit(() => {})  // 永远不注销，防止 Bun 的 signal-exit 注销 bug
```

## 3.7 生命周期状态机

综合以上分析，Claude Code 的完整生命周期可以建模为以下状态机：

```
┌─────────────┐
│  模块求值    │  startMdmRawRead(), startKeychainPrefetch()
│  (Evaluating)│  并行预取启动
└──────┬──────┘
       │ import 完成
       ▼
┌─────────────┐
│  解析命令    │  commander 解析 argv
│  (Parsing)   │
└──────┬──────┘
       │ preAction 触发
       ▼
┌─────────────┐
│  初始化      │  await ensureMdm + ensureKeychain
│  (Initing)   │  await init()  (mTLS, proxy, preconnect, ...)
│              │  runMigrations()
└──────┬──────┘
       │ action handler 开始
       ▼
┌─────────────┐
│  配置        │  setup(), getCommands(), loadPlugins()
│  (Setting Up)│  MCP 连接, Hook 执行 (并行)
└──────┬──────┘
       │ launchRepl() / runHeadless()
       ▼
┌─────────────┐
│  运行中      │  REPL 交互 / 查询处理
│  (Running)   │  startDeferredPrefetches() (后台预热)
│              │
└──────┬──────┘
       │ SIGINT / SIGTERM / SIGHUP / 用户退出
       ▼
┌─────────────┐
│  关闭中      │  cleanupTerminalModes()
│  (Shutting   │  printResumeHint()
│   Down)      │  runCleanupFunctions() (限时 2s)
│              │  executeSessionEndHooks() (限时可配置)
│              │  flush analytics (限时 500ms)
└──────┬──────┘
       │ forceExit() 或故障保护定时器
       ▼
┌─────────────┐
│  已终止      │  process.exit(code)
│  (Terminated)│  或 SIGKILL（终端已断开时）
└─────────────┘
```

关键的状态转换保护：

- `shutdownInProgress` 布尔标志确保关闭流程**最多执行一次**，即使多个信号同时到达。
- `failsafeTimer` 确保无论清理逻辑多慢，进程**必定终止**。
- `forceExit()` 中，如果 `process.exit()` 抛出 EIO 错误（终端已断开），回退到 `process.kill(process.pid, 'SIGKILL')`——这是终极保底。

## 3.8 startupProfiler：度量驱动的优化闭环

前文展示的所有优化不是凭直觉完成的，而是由 `startupProfiler.ts` 的度量系统驱动。

### 3.8.1 零成本探针

```
function profileCheckpoint(name):
    if not SHOULD_PROFILE: return       // 非采样用户：零成本
    performance.mark(name)
    if DETAILED_PROFILING:
        memorySnapshots.push(process.memoryUsage())
```

采样率设计：100% 内部用户，0.5% 外部用户。非采样用户执行 `profileCheckpoint` 时只做一次布尔判断就返回——真正的零成本。

### 3.8.2 阶段度量与闭环

```
PHASE_DEFINITIONS = {
    import_time:   ['cli_entry',              'main_tsx_imports_loaded'],
    init_time:     ['init_function_start',    'init_function_end'],
    settings_time: ['eagerLoadSettings_start', 'eagerLoadSettings_end'],
    total_time:    ['cli_entry',              'main_after_run']
}
```

这些阶段数据上报到分析管道后，工程团队可以监控每个版本的启动性能回归。源码中 40 多个 `profileCheckpoint` 调用点覆盖了从入口到首次渲染的每个关键路径，形成了**度量 → 发现瓶颈 → 优化 → 度量**的闭环。

## 3.9 思考题

**思考题 1：预取的风险边界**

Claude Code 在模块求值期间就启动了 MDM 和钥匙串子进程。如果某个新的预取任务存在副作用（例如修改文件系统），在模块求值阶段执行会带来什么风险？设计一个判断标准：什么样的操作适合在模块求值期预取，什么样的不适合？

**思考题 2：故障保护预算的自适应设计**

当前的故障保护预算公式是 `max(5000, sessionEndTimeoutMs + 3500)`。考虑这样一个场景：用户同时配置了 10 秒的 SessionEnd hook 和多个慢速 MCP 服务器（关闭需要 8 秒）。当前的 2 秒清理超时和 500ms 分析刷新超时是固定的。你会如何设计一个更灵活的预算分配算法，使各阶段的超时能根据实际负载动态调整？

**思考题 3：延迟初始化的缓存一致性**

`startDeferredPrefetches()` 在首次渲染后预热缓存（如 `getUserContext()`、`getSystemContext()`）。如果用户在预热完成前就提交了第一个查询，查询路径会重新发起相同的异步操作。Claude Code 使用 memoize 确保不会重复执行。但如果在预热进行中用户切换了工作目录（`cd` 到另一个项目），memoized 的结果就过期了。如何在保持 memoize 性能优势的同时处理这种缓存失效场景？

## 3.10 小结

本章从 Claude Code 源码中提取了五个核心的启动与生命周期管理算法：

1. **并行预取（Spawn-During-Import）**：利用 JS 模块同步求值与子进程异步执行的时间重叠，将 MDM 读取、钥匙串访问等 I/O 操作"隐藏"在 import 求值的时间窗口中。

2. **依赖图拓扑排序**：通过识别硬约束（必须先于）和软约束（应该先于），将启动任务编排为 DAG，在 `preAction` 汇合点同步关键依赖，在 action 内部继续并行化。

3. **分层延迟初始化**：编译期死代码消除 → 运行期条件加载 → 首次渲染后延迟预热，三层策略确保每个模块只在真正需要时才付出加载代价。

4. **循环依赖破解**：惰性 require 工厂函数、零依赖底层模块、常量抽取等多种手法，在保持类型安全的同时打破编译期循环。

5. **优雅终止协议**：注册表模式收集清理函数 → 分阶段有序执行 → 每阶段限时 → 故障保护兜底 → 终极 SIGKILL 回退，形成五层防御纵深。

这些不是独立的技巧，而是一套协调工作的算法体系。并行预取缩短了"模块求值→可交互"的时间；延迟初始化将非关键工作推迟到用户思考窗口；优雅终止确保无论何种退出路径，终端和数据都处于一致状态。度量系统贯穿始终，为每次优化提供数据支撑。

这套体系的设计哲学可以归结为一句话：**对关键路径锱铢必较，对非关键路径慷慨延迟，对异常路径防御纵深。**
