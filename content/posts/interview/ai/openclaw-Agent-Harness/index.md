+++
title = "OpenClaw 源码导读（三）：Agent Harness — 为\"每一家 LLM 都能兜住\"而生的执行管线"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 14
tags = ["AI", "LLM", "面试", "OpenClaw"]
categories = ["AI", "面试"]
+++
> 系列第一篇把 OpenClaw 的架构地图摊开，第二篇深入 Gateway 控制平面。这一篇，我们钻进整个项目的心脏——`src/agents/`，看 OpenClaw 怎么处理最复杂的一件事：**当 Gateway 接到一条用户消息之后，怎么把它变成一轮真正的 LLM turn + Tool 循环**。
>
> 这一层代码的体量和复杂度非常惊人：
>
> - `src/agents/pi-embedded-runner/run.ts` 单文件 **2160 行**，是整个 agent 循环的驱动器。
> - `src/agents/pi-embedded-runner/compact.ts` **1148 行**，专门处理上下文压缩。
> - 整个 `src/agents/` 目录有 **830+ 个文件**，光 `anthropic-*.ts` 就有近 20 个（为了 Messages API 的各种 edge case）。
> - 同时支持 **Anthropic、OpenAI、Google Gemini、Bedrock、Vertex、OpenRouter、Z.AI/GLM、MiniMax、Qwen、Ollama、Kilocode** 等十多个 provider。
>
> 但这些"量"的背后，是一个**只有一个接口的核心抽象：AgentHarness**。本文就从这个抽象出发，一路看到 2160 行循环如何处置真实世界里十几类失败。

---

## 一、Harness 抽象：只有一个 `runAttempt`

### 1. 为什么不用 LangChain 风格的"Agent Framework"

读过 LangChain 或 CrewAI 的人第一眼会期望看到 `AgentExecutor`、`AgentChain`、`Memory`、`Callback`、`Tool` 这些类。OpenClaw 里**一个都没有**。

它的选择是：**把整个 agent 循环当成一个黑盒**，对外只暴露一个接口：

```30:39:src/agents/harness/types.ts
export type AgentHarness = {
  id: string;
  label: string;
  pluginId?: string;
  supports(ctx: AgentHarnessSupportContext): AgentHarnessSupport;
  runAttempt(params: AgentHarnessAttemptParams): Promise<AgentHarnessAttemptResult>;
  compact?(params: AgentHarnessCompactParams): Promise<AgentHarnessCompactResult | undefined>;
  reset?(params: AgentHarnessResetParams): Promise<void> | void;
  dispose?(): Promise<void> | void;
};
```

五个方法，其中三个可选：

| 方法 | 必选 | 职责 |
|------|------|------|
| `supports(ctx)` | ✅ | 告诉注册表"我这个 harness 能不能跑 provider=X / model=Y" |
| `runAttempt(params)` | ✅ | **跑完一次完整的 agent turn**（包含多轮 tool 调用）|
| `compact(params)` | ⬜ | 对 session 做上下文压缩 |
| `reset(params)` | ⬜ | 收到 /reset 或 /new 时清理内部状态 |
| `dispose()` | ⬜ | Gateway 退出时做资源回收 |

这对应了 Anthropic 在 **Harness Engineering** 里反复强调的理念：**一个 agent 就是 "Model + Harness" 的组合，框架只应该提供 harness 接入点，不应该规定 harness 的内部实现**。OpenClaw 把这个理念落到了类型签名里。

### 2. Harness 注册表

所有 harness 在 **进程全局** Map 里注册，key 就是 `harness.id`：

```4:19:src/agents/harness/registry.ts
const AGENT_HARNESS_REGISTRY_STATE = Symbol.for("openclaw.agentHarnessRegistryState");
const log = createSubsystemLogger("agents/harness");

type AgentHarnessRegistryState = {
  harnesses: Map<string, RegisteredAgentHarness>;
};

function getAgentHarnessRegistryState(): AgentHarnessRegistryState {
  const globalState = globalThis as typeof globalThis & {
    [AGENT_HARNESS_REGISTRY_STATE]?: AgentHarnessRegistryState;
  };
  globalState[AGENT_HARNESS_REGISTRY_STATE] ??= {
    harnesses: new Map<string, RegisteredAgentHarness>(),
  };
  return globalState[AGENT_HARNESS_REGISTRY_STATE];
}
```

注意这里用了 `Symbol.for(...)` + `globalThis`，而不是模块级变量——这是为了**应对 Vitest 的模块隔离**：测试里每个测试文件都可能拿到不同的模块实例，但 harness 注册表必须是进程全局的。这种防御风格在整个代码库非常常见。

注册 harness 的时候还会把 `pluginId` 粘到 harness 对象上：

```21:34:src/agents/harness/registry.ts
export function registerAgentHarness(
  harness: AgentHarness,
  options?: { ownerPluginId?: string },
): void {
  const id = harness.id.trim();
  getAgentHarnessRegistryState().harnesses.set(id, {
    harness: {
      ...harness,
      id,
      pluginId: harness.pluginId ?? options?.ownerPluginId,
    },
    ownerPluginId: options?.ownerPluginId,
  });
}
```

目的是：当某个 plugin 被 disable 时，Gateway 可以同时把它注册的 harness 摘掉——通过 `ownerPluginId` 反查哪些 harness 属于哪个 plugin。

### 3. 两个官方 harness

OpenClaw 自带两个 harness 实现，分别覆盖"主流 LLM API"和"Codex CLI"两条赛道：

```11:13:src/agents/harness/index.ts
export {
  maybeCompactAgentHarnessSession,
  runAgentHarnessAttemptWithFallback,
  selectAgentHarness,
} from "./selection.js";
```

- **`builtin-pi`（`src/agents/harness/builtin-pi.ts`）**：基于 Mario Zechner 的 [pi-mono](https://github.com/badlogic/pi-mono) 和 `@mariozechner/pi-coding-agent`，封装了十多家 provider 的 Messages/Responses API。
- **`codex-app-server-extensions`**：把 Codex CLI 的 app-server 模式套一层，让 OpenClaw 直接复用 Codex 的 agent 循环和工具执行（参考 Claude Code 的 MCP 手法）。

Plugin 还可以注册自己的 harness。比如未来某个 plugin 想接入 Anthropic 新发布的 Agent SDK，只要 `registerAgentHarness({ id: "anthropic-agent-sdk", supports, runAttempt })`，就自动接入了。

---

## 二、Harness Selection：多级兜底是怎么做的

### 1. 选择决策数据结构

`src/agents/harness/selection.ts` 是 harness 选择的核心，它的返回类型很能说明问题：

```40:54:src/agents/harness/selection.ts
type AgentHarnessSelectionDecision = {
  harness: AgentHarness;
  policy: AgentHarnessPolicy;
  selectedHarnessId: string;
  selectedReason:
    | "pinned"
    | "forced_pi"
    | "forced_plugin"
    | "forced_plugin_fallback_to_pi"
    // Auto mode chose a registered plugin harness that supports the provider/model.
    | "auto_plugin"
    // Auto mode found no supporting plugin harness, so PI handled the run.
    | "auto_pi_fallback";
  candidates: AgentHarnessSelectionCandidate[];
};
```

选择结果不只告诉你"用了哪个 harness"，还告诉你**为什么**（`selectedReason`）、**还有哪些候选**（`candidates`）。这让 `openclaw trace` 命令可以在 debug 输出里给出非常精确的路径：

```
agent harness selected
  selectedHarnessId: pi
  selectedReason: auto_pi_fallback
  runtime: auto
  fallback: pi
  candidates: [
    { id: "codex-app-server", supported: false, reason: "codex_cli_not_found" }
  ]
```

### 2. Auto 模式的比较函数

在 `runtime === "auto"` 时，Gateway 调用每个 harness 的 `supports()`，过滤出支持的，然后按一个稳定比较函数排序：

```60:69:src/agents/harness/selection.ts
function compareHarnessSupport(
  left: { harness: AgentHarness; support: AgentHarnessSupport & { supported: true } },
  right: { harness: AgentHarness; support: AgentHarnessSupport & { supported: true } },
): number {
  const priorityDelta = (right.support.priority ?? 0) - (left.support.priority ?? 0);
  if (priorityDelta !== 0) {
    return priorityDelta;
  }
  return left.harness.id.localeCompare(right.harness.id);
}
```

两点细节：

- **priority 是倒序（大的优先）**：harness 可以在 `supports` 返回里声明 priority，类似 `@media` 的层叠。
- **priority 相同时按 id 字典序**：保证相同配置下每次都选一样的 harness，不被注册顺序影响——**可重现性**是分布式系统里的美德。

### 3. 四种 runtime 模式

`resolveAgentHarnessPolicy` 这个函数定义了 runtime 模式有哪些：

```299:324:src/agents/harness/selection.ts
export function resolveAgentHarnessPolicy(params: {
  provider?: string;
  modelId?: string;
  config?: OpenClawConfig;
  agentId?: string;
  sessionKey?: string;
  env?: NodeJS.ProcessEnv;
}): AgentHarnessPolicy {
  const env = params.env ?? process.env;
  // Harness policy can be session-scoped because users may switch between agents
  // with different strictness requirements inside the same gateway process.
  const agentPolicy = resolveAgentEmbeddedHarnessConfig(params.config, {
    agentId: params.agentId,
    sessionKey: params.sessionKey,
  });
  const defaultsPolicy = params.config?.agents?.defaults?.embeddedHarness;
  const runtime = env.OPENCLAW_AGENT_RUNTIME?.trim()
    ? resolveEmbeddedAgentRuntime(env)
    : normalizeEmbeddedAgentRuntime(agentPolicy?.runtime ?? defaultsPolicy?.runtime);
  return {
    runtime,
    fallback:
      resolveEmbeddedAgentHarnessFallback(env) ??
      normalizeAgentHarnessFallback(agentPolicy?.fallback ?? defaultsPolicy?.fallback),
  };
}
```

可选的 `runtime` 取值：

- `auto`：自动选最合适的 harness（默认）。
- `pi`：强制用 builtin-pi。
- `<plugin-harness-id>`：强制用某个 plugin harness。
- 配合 `fallback: "pi" | "none"` 决定选中的 harness 找不到 / 跑失败时要不要兜到 pi。

这套 policy **可以 session 级覆盖**——同一个 Gateway 里，"工作 agent" 可以 pin 到 `codex-app-server`、"生活 agent" 用 `auto`。这让不同领域的 agent 互不干扰。

### 4. Run with fallback

真正被 Gateway 调用的入口是 `runAgentHarnessAttemptWithFallback`：

```172:207:src/agents/harness/selection.ts
export async function runAgentHarnessAttemptWithFallback(
  params: EmbeddedRunAttemptParams,
): Promise<EmbeddedRunAttemptResult> {
  const selection = selectAgentHarnessDecision({
    provider: params.provider,
    modelId: params.modelId,
    config: params.config,
    agentId: params.agentId,
    sessionKey: params.sessionKey,
    agentHarnessId: params.agentHarnessId,
  });
  const harness = selection.harness;
  logAgentHarnessSelection(selection, {
    provider: params.provider,
    modelId: params.modelId,
    sessionKey: params.sessionKey,
    agentId: params.agentId,
  });
  if (harness.id === "pi") {
    const result = await harness.runAttempt(params);
    return { ...result, agentHarnessId: harness.id };
  }

  try {
    const result = await harness.runAttempt(params);
    return { ...result, agentHarnessId: harness.id };
  } catch (error) {
    log.warn(`${harness.label} failed; not falling back to embedded PI backend`, {
      harnessId: harness.id,
      provider: params.provider,
      modelId: params.modelId,
      error: formatErrorMessage(error),
    });
    throw error;
  }
}
```

注意这里有个反直觉的设计：**plugin harness 失败时不自动 fallback 到 pi**，即使 `policy.fallback === "pi"`。这是因为 plugin harness 可能已经做了副作用（发了消息、改了文件），再 fallback 到 pi 重跑会重复执行。作者写了一条明确的 warn 日志，让用户意识到失败原因而不是被无声地兜回 pi。

---

## 三、`runEmbeddedPiAgent`：一次 turn 的 2160 行

下面我们看 `builtin-pi` 是怎么跑一次 turn 的，这对应 `src/agents/pi-embedded-runner/run.ts::runEmbeddedPiAgent`。

### 1. 整体结构

2160 行代码的骨架是：

```
runEmbeddedPiAgent(params)
├── backfillSessionKey()              # 把 sessionId 补成 sessionKey
├── resolve lanes                     # 全局 + session 两级 lane
├── enqueueSession(() => enqueueGlobal(async () => {
│    ├── resolveRunWorkspaceDir()      # 定位 workspace 目录
│    ├── ensureRuntimePluginsLoaded()  # 装 plugin
│    ├── resolveHookModelSelection()   # before_model_resolve hook
│    ├── resolveModelAsync()           # 从 openclaw.models.json 取 provider 规格
│    ├── ensureAuthProfileStore()      # keychain + file 双模认证存储
│    ├── createEmbeddedRunAuthController()  # profile 轮换控制器
│    ├── initializeAuthProfile()
│    │
│    └── while (true) {                # 主循环
│         ├── 检查 runLoopIterations 上限
│         ├── prompt = basePrompt + promptAdditions
│         ├── runEmbeddedAttemptWithBackend(...)  # 实际跑一轮 agent
│         ├── 处理 attempt 返回的 20+ 个状态位
│         │   ├── aborted
│         │   ├── externalAbort
│         │   ├── promptError
│         │   ├── preflightRecovery
│         │   ├── timedOut / idleTimedOut / timedOutDuringCompaction
│         │   ├── compactionCount
│         │   ├── lastAssistant
│         │   ├── ...
│         ├── 根据状态决定：
│         │   ├── break out (成功)
│         │   ├── continue (重试本轮)
│         │   ├── compact + continue (上下文溢出)
│         │   ├── rotate auth profile + continue (auth 失败)
│         │   ├── switch thinking level + continue (reasoning loop)
│         │   └── abort (硬错误)
│       }
│    }))
```

### 2. 两级 lane 串行化

一开始就做的事是**把 turn 压进两级队列**：

```221:226:src/agents/pi-embedded-runner/run.ts
  const sessionLane = resolveSessionLane(params.sessionKey?.trim() || params.sessionId);
  const globalLane = resolveGlobalLane(params.lane);
  const enqueueGlobal =
    params.enqueue ?? ((task, opts) => enqueueCommandInLane(globalLane, task, opts));
  const enqueueSession =
    params.enqueue ?? ((task, opts) => enqueueCommandInLane(sessionLane, task, opts));
```

两级队列的意义：

- **session lane**：同一个 session 的多条消息**必须严格串行**（你不能同时对一个对话发 "help me" 和 "wait cancel that"，model 会彻底蒙）。
- **global lane**：同一个 Gateway 进程里同时只允许有限个 agent turn 在跑（默认 2 个），防止 OOM。

这种"session 严格串行 + 全局有限并发"的模型在 Kafka Streams、Temporal 等系统里都能见到，OpenClaw 用到了一个非常简单的 `command-queue` 实现（`src/process/command-queue.ts`），效果够用。

### 3. AbortSignal 的三级守卫

在 `enqueueSession` 前后各做一次 `throwIfAborted`：

```253:253:src/agents/pi-embedded-runner/run.ts
  throwIfAborted();
```

```255:258:src/agents/pi-embedded-runner/run.ts
  return enqueueSession(() => {
    throwIfAborted();
    return enqueueGlobal(async () => {
      throwIfAborted();
```

这是因为 Queue 里可能排了几十个任务、等了十几秒才轮到自己，此时 user 可能已经按了 Ctrl-C——三次检查保证任何"上游已放弃"的请求不会空跑。

`throwIfAborted` 特意处理了 reason：

```237:251:src/agents/pi-embedded-runner/run.ts
  const throwIfAborted = () => {
    if (!params.abortSignal?.aborted) {
      return;
    }
    const reason = params.abortSignal.reason;
    if (reason instanceof Error) {
      throw reason;
    }
    const abortErr =
      reason !== undefined
        ? new Error("Operation aborted", { cause: reason })
        : new Error("Operation aborted");
    abortErr.name = "AbortError";
    throw abortErr;
  };
```

把 reason 作为 `cause` 挂到 Error 上，上游 catch 的时候能拿到原始原因，这是 ES2022 `Error.prototype.cause` 的正确用法。

### 4. 主循环的状态变量

进入 `while(true)` 之前，`run.ts` 声明了**超过 40 个循环级的可变状态变量**。我挑几个最关键的：

```469:494:src/agents/pi-embedded-runner/run.ts
      const MAX_TIMEOUT_COMPACTION_ATTEMPTS = 2;
      const MAX_OVERFLOW_COMPACTION_ATTEMPTS = 3;
      const MAX_RUN_LOOP_ITERATIONS = resolveMaxRunRetryIterations(profileCandidates.length);
      let overflowCompactionAttempts = 0;
      let toolResultTruncationAttempted = false;
      let bootstrapPromptWarningSignaturesSeen =
        params.bootstrapPromptWarningSignaturesSeen ??
        (params.bootstrapPromptWarningSignature ? [params.bootstrapPromptWarningSignature] : []);
      const usageAccumulator = createUsageAccumulator();
      let lastRunPromptUsage: ReturnType<typeof normalizeUsage> | undefined;
      let autoCompactionCount = 0;
      let runLoopIterations = 0;
      let overloadProfileRotations = 0;
      let planningOnlyRetryAttempts = 0;
      let reasoningOnlyRetryAttempts = 0;
      let emptyResponseRetryAttempts = 0;
      let sameModelIdleTimeoutRetries = 0;
      let lastRetryFailoverReason: FailoverReason | null = null;
      let planningOnlyRetryInstruction: string | null = null;
      let reasoningOnlyRetryInstruction: string | null = null;
      let emptyResponseRetryInstruction: string | null = null;
      ...
      let rateLimitProfileRotations = 0;
      let timeoutCompactionAttempts = 0;
```

每一个变量都对应一种**真实世界里见过的失败模式**：

| 变量 | 说明 |
|------|------|
| `overflowCompactionAttempts` | 上下文溢出之后尝试压缩的次数（上限 3） |
| `timeoutCompactionAttempts` | 因 LLM 超时触发压缩的次数（上限 2） |
| `overloadProfileRotations` | Anthropic 529 Overloaded 时轮换 API key 的次数 |
| `rateLimitProfileRotations` | 遇到 429 时轮换 API key 的次数 |
| `planningOnlyRetryAttempts` | 遇到"只规划不执行"异常（strict-agentic 检测）时重试次数 |
| `reasoningOnlyRetryAttempts` | 只产出 reasoning 没产出 assistant text 的重试次数 |
| `emptyResponseRetryAttempts` | 输出为空的重试次数（通常 gpt-5 遇到） |
| `sameModelIdleTimeoutRetries` | 同 model idle timeout 的重试次数 |
| `toolResultTruncationAttempted` | 是否已尝试过截断超大 tool result |
| `autoCompactionCount` | 累计主动压缩次数（用于给 agent meta） |
| `runLoopIterations` | 总循环次数（上限由 profileCandidates 数决定） |

这张清单，本质上就是 OpenClaw 运维人员在实战中踩过的所有坑的结晶。传统 LangChain / AutoGen 的 agent loop 只处理其中一两种，OpenClaw 每一种都定义了**阈值 + 计数 + 退避**。

### 5. 一轮 attempt 的调用签名

循环里最核心的一步调用是 `runEmbeddedAttemptWithBackend`，它被调用时传了 **90+ 个参数**：

```692:791:src/agents/pi-embedded-runner/run.ts
          const attempt = await runEmbeddedAttemptWithBackend({
            sessionId: params.sessionId,
            sessionKey: resolvedSessionKey,
            sandboxSessionKey: params.sandboxSessionKey,
            trigger: params.trigger,
            memoryFlushWritePath: params.memoryFlushWritePath,
            messageChannel: params.messageChannel,
            messageProvider: params.messageProvider,
            agentAccountId: params.agentAccountId,
            messageTo: params.messageTo,
            messageThreadId: params.messageThreadId,
            groupId: params.groupId,
            groupChannel: params.groupChannel,
            groupSpace: params.groupSpace,
            memberRoleIds: params.memberRoleIds,
            spawnedBy: params.spawnedBy,
            isCanonicalWorkspace,
            senderId: params.senderId,
            senderName: params.senderName,
            senderUsername: params.senderUsername,
            senderE164: params.senderE164,
            senderIsOwner: params.senderIsOwner,
            ...
            prompt,
            images: params.images,
            imageOrder: params.imageOrder,
            clientTools: params.clientTools,
            disableTools: params.disableTools,
            provider,
            modelId,
            agentHarnessId: params.agentHarnessId,
            model: applyAuthHeaderOverride(
              applyLocalNoAuthHeaderOverride(effectiveModel, apiKeyInfo),
              runtimeAuthState ? null : apiKeyInfo,
              params.config,
            ),
            resolvedApiKey: resolvedStreamApiKey,
            authProfileId: lastProfileId,
            ...
          });
```

为什么参数这么多？因为 `runAttempt` 的返回需要**同时带回"所有能帮助外层决策的信号"**——而决策需要的信号本身就极多：

- 消息元信息（发给谁、哪个线程、群里还是私聊、是 owner 还是普通人）
- Workspace 路径（影响 bash/文件工具的 cwd）
- Tools 开关（用户可能开了 browser 关了 camera）
- Provider 凭据（apiKey / OAuth token / Vertex creds）
- Thinking level、verbose level、reasoning level
- Stream 回调（onPartialReply / onBlockReply / onReasoningStream / onToolResult / onAgentEvent）
- 上下文预算（ctxInfo.tokens）
- Skills snapshot、Hook runner、Abort signal …

`runEmbeddedAttemptWithBackend` 再分发给 pi-coding-agent（Mario Zechner 的 SDK），完成一次**"模型流式输出 + 工具调用 + 结果注入"的完整 turn**。

---

## 四、failover 的多层决策

### 1. FailoverReason 分类

OpenClaw 对"失败为什么算失败"有精细的分类（`src/agents/failover-error.ts` + `pi-embedded-helpers.ts`）：

```58:71:src/agents/pi-embedded-runner/run.ts
import {
  classifyFailoverReason,
  extractObservedOverflowTokenCount,
  type FailoverReason,
  formatAssistantErrorText,
  isAuthAssistantError,
  isBillingAssistantError,
  isCompactionFailureError,
  isFailoverAssistantError,
  isFailoverErrorMessage,
  isLikelyContextOverflowError,
  isRateLimitAssistantError,
  parseImageDimensionError,
  parseImageSizeError,
  pickFallbackThinkingLevel,
} from "../pi-embedded-helpers.js";
```

这些 `is*Error` / `parse*Error` 函数各对应一类错误：

- **`isAuthAssistantError`**：401/403，轮换 auth profile。
- **`isBillingAssistantError`**：付费相关（额度耗尽）——直接终止，不重试。
- **`isRateLimitAssistantError`**：429，等 retry-after 或换 profile。
- **`isLikelyContextOverflowError`**：通过解析 error body 里的 "maximum context length exceeded" / "context window" 等文本判断是否是上下文溢出。
- **`parseImageDimensionError` / `parseImageSizeError`**：图片太大——要求调用方在下一轮传一张更小的图。
- **`isCompactionFailureError`**：在 compaction 本身出错时抛出的特殊错误类型——要走另一条路径，不能再 compact。

### 2. 三级 "fallback" 策略

```83:101:src/agents/pi-embedded-runner/run.ts
import { handleAssistantFailover } from "./run/assistant-failover.js";
import { createEmbeddedRunAuthController } from "./run/auth-controller.js";
import { runEmbeddedAttemptWithBackend } from "./run/backend.js";
import { createFailoverDecisionLogger } from "./run/failover-observation.js";
import { mergeRetryFailoverReason, resolveRunFailoverDecision } from "./run/failover-policy.js";
import {
  buildErrorAgentMeta,
  buildUsageAgentMetaFields,
  createCompactionDiagId,
  resolveActiveErrorContext,
  resolveFinalAssistantRawText,
  resolveFinalAssistantVisibleText,
  resolveMaxRunRetryIterations,
  resolveOverloadFailoverBackoffMs,
  resolveOverloadProfileRotationLimit,
  resolveRateLimitProfileRotationLimit,
  type RuntimeAuthState,
  scrubAnthropicRefusalMagic,
} from "./run/helpers.js";
```

可以看到 `run/` 子目录已经是一个**小型的状态机库**。`failover-policy.ts` 是政策解析、`assistant-failover.ts` 是在接到 `isFailoverAssistantError` 后决定跳哪个 model，`auth-controller.ts` 专管 auth profile 的轮换。

三级 fallback 的顺序一般是：

```
1. 同 provider 同 model，换 auth profile（API key）
   → 若当前 profile 因 429/529 挂掉，轮到下一个 profile
   → profile rotation 计数满后停
2. 同 provider 换 model
   → 比如 gpt-5 → gpt-5-mini
   → 由 config 里 agents.defaults.modelFallbacks 决定
3. 换 provider（跨家）
   → 比如 openai → anthropic
   → 由 agents.defaults.modelFallbacks 配合 hasConfiguredModelFallbacks 决定
```

每一级失败后都会记录到 `traceAttempts: TraceAttempt[]`，最终打到 `openclaw agent trace` 日志里。用户一条消息发出去跑了 3 次 retry 跨 2 个 provider，都能看到。

### 3. retry limit 的统一兜底

主循环开头就有一个硬上限检查：

```633:665:src/agents/pi-embedded-runner/run.ts
        while (true) {
          if (runLoopIterations >= MAX_RUN_LOOP_ITERATIONS) {
            const message =
              `Exceeded retry limit after ${runLoopIterations} attempts ` +
              `(max=${MAX_RUN_LOOP_ITERATIONS}).`;
            log.error(
              `[run-retry-limit] sessionKey=${params.sessionKey ?? params.sessionId} ` +
                `provider=${provider}/${modelId} attempts=${runLoopIterations} ` +
                `maxAttempts=${MAX_RUN_LOOP_ITERATIONS}`,
            );
            const retryLimitDecision = resolveRunFailoverDecision({
              stage: "retry_limit",
              fallbackConfigured,
              failoverReason: lastRetryFailoverReason,
            });
            return handleRetryLimitExhaustion({
              message,
              decision: retryLimitDecision,
              provider,
              model: modelId,
              profileId: lastProfileId,
              durationMs: Date.now() - started,
              agentMeta: buildErrorAgentMeta({
                sessionId: params.sessionId,
                provider,
                model: model.id,
                usageAccumulator,
                lastRunPromptUsage,
                lastTurnTotal,
              }),
              replayInvalid: accumulatedReplayState.replayInvalid ? true : undefined,
              livenessState: "blocked",
            });
          }
          runLoopIterations += 1;
```

`MAX_RUN_LOOP_ITERATIONS` 来自 `resolveMaxRunRetryIterations(profileCandidates.length)`——**上限和 auth profile 数量挂钩**，profile 多就允许多转几轮，profile 少就早停。这个设计很克制：不是"无限重试到成功"，也不是"固定重试 3 次"，而是跟着资源数动态。

---

## 五、Compaction：把 250k token 压成 8k summary

### 1. 压缩失败原因的"可读化分类"

`src/agents/pi-embedded-runner/compact-reasons.ts` 里这个函数把各种错误 message 映射成 label，用于上报和统计：

```17:61:src/agents/pi-embedded-runner/compact-reasons.ts
export function classifyCompactionReason(reason?: string): string {
  const text = normalizeLowercaseStringOrEmpty(reason);
  if (!text) {
    return "unknown";
  }
  if (text.includes("nothing to compact")) {
    return "no_compactable_entries";
  }
  if (text.includes("below threshold")) {
    return "below_threshold";
  }
  if (text.includes("already compacted")) {
    return "already_compacted_recently";
  }
  if (text.includes("still exceeds target")) {
    return "live_context_still_exceeds_target";
  }
  if (text.includes("guard")) {
    return "guard_blocked";
  }
  if (text.includes("summary")) {
    return "summary_failed";
  }
  if (text.includes("timed out") || text.includes("timeout")) {
    return "timeout";
  }
  if (
    text.includes("400") ||
    text.includes("401") ||
    text.includes("403") ||
    text.includes("429")
  ) {
    return "provider_error_4xx";
  }
  if (
    text.includes("500") ||
    text.includes("502") ||
    text.includes("503") ||
    text.includes("504")
  ) {
    return "provider_error_5xx";
  }
  return "unknown";
}
```

九种 label：

- `no_compactable_entries`：历史太短，没东西可压。
- `below_threshold`：token 预算还没触顶。
- `already_compacted_recently`：最近刚压过，短期内不再压。
- `live_context_still_exceeds_target`：压了之后还超 budget（说明消息太大、压缩不划算，需要别的手段）。
- `guard_blocked`：compaction safeguard 被触发（某个 hook 说"不要压"）。
- `summary_failed`：summary 这一步自己失败了（网络/model 问题）。
- `timeout`：compaction 整体超时。
- `provider_error_4xx` / `5xx`：上游 LLM 报错。
- `unknown`：兜底。

**有了这张 label，压缩失败就不再是一个空白异常**。用户在 `openclaw doctor` 里能看到"本周压缩失败 24 次，其中 `timeout` 18 次，`live_context_still_exceeds_target` 5 次"，可以决定要不要换一个 context 更大的模型。

### 2. Compaction Safeguard

compact.ts 顶部有一组 import 很有意思：

```68:73:src/agents/pi-embedded-runner/compact.ts
import { pickFallbackThinkingLevel } from "../pi-embedded-helpers.js";
import {
  consumeCompactionSafeguardCancelReason,
  setCompactionSafeguardCancelReason,
} from "../pi-hooks/compaction-safeguard-runtime.js";
```

"Safeguard" 是一组 hook 可以往里面 push 的 cancel reason。当 agent 正在执行一个敏感操作（比如写一个文件、发一条消息）时，hook 可以 `setCompactionSafeguardCancelReason("mid-write")`，compaction 进来发现有非空 reason 就放弃这次压缩。

为什么要这么设计？因为 compaction **会改变 session history**，如果正好发生在 tool_use 和 tool_result 之间，消息结构被破坏，下一次 LLM 请求就会报错（Anthropic/OpenAI 都强制 tool_use 必须对应 tool_result）。

`resolveCompactionFailureReason` 里把这个 safeguard reason 替代"Compaction cancelled"的通用错误：

```8:16:src/agents/pi-embedded-runner/compact-reasons.ts
export function resolveCompactionFailureReason(params: {
  reason: string;
  safeguardCancelReason?: string | null;
}): string {
  if (isGenericCompactionCancelledReason(params.reason) && params.safeguardCancelReason) {
    return params.safeguardCancelReason;
  }
  return params.reason;
}
```

这样日志里不会看到"Compaction cancelled"这种无效信息，而是直接看到 safeguard 具体原因，比如 `"Compaction skipped because tool_use/tool_result pairing is in progress"`。

### 3. 压缩的双重持久化

compact.ts 最上面这组 import 也值得留意：

```13:19:src/agents/pi-embedded-runner/compact.ts
import {
  captureCompactionCheckpointSnapshot,
  cleanupCompactionCheckpointSnapshot,
  persistSessionCompactionCheckpoint,
  resolveSessionCompactionCheckpointReason,
  type CapturedCompactionCheckpointSnapshot,
} from "../../gateway/session-compaction-checkpoints.js";
```

OpenClaw 在 compaction 前会**先打一个完整 checkpoint**（相当于一份 git stash），压缩失败时自动 rollback。文档里对应的概念叫 ["Session compaction checkpoint"](https://docs.openclaw.ai/reference/session-management-compaction)：

- 压缩前：保存 messages / tool_results / session meta 到 `~/.openclaw/workspace/<agent>/sessions/<id>/checkpoints/<ts>/`。
- 压缩中：执行 summary，写新的 session file。
- 压缩成功：`cleanupCompactionCheckpointSnapshot` 删除 checkpoint。
- 压缩失败：保留 checkpoint，可通过 `openclaw sessions restore <id>` 回滚。

这是一种 **"防御性磁盘日志"**—— 承认 compaction 很容易挂，宁可浪费磁盘也不让用户的对话丢失。

---

## 六、和 Claude Code 对比：harness 演化的两条路

系列第一篇提过，OpenClaw 和 Claude Code 在 agent 循环上做了截然不同的工程选择。这里做一次直接对比：

| 维度 | Claude Code `query.ts` | OpenClaw `run.ts` |
|------|----------------------|------------------|
| 入口 | `AsyncGenerator<Message>` | `Promise<EmbeddedPiRunResult>` |
| 流式协议 | 基于 Generator yield | 基于 callback（`onPartialReply` / `onBlockReply`） |
| 多 provider | 单一 Anthropic SDK | 多 provider via pi-mono |
| Compaction | 内置在 query loop 的预处理六步 | 主动调用，失败则 rollback |
| Tool 执行 | 四段式 `StreamingToolExecutor` | 由 pi-coding-agent 自己处理 |
| 重试策略 | 有限（empty response / reasoning only）| 40+ 种细粒度 retry |
| Fork sub-agent | task tool 显式 fork | ACP binding + sessions_spawn |
| Harness 概念 | 无（单一实现） | 有（AgentHarness 接口） |
| Auth | 单一 API key | Profile 轮换（多 key / OAuth / Vertex / Bedrock） |

两条路都没错——Claude Code 是"给工程师的锋利小刀"，OpenClaw 是"给生活的多功能瑞士军刀"。前者的 loop 靠简单可预测赢，后者的 loop 靠覆盖全面赢。

---

## 七、小结：Harness 层的四个设计公理

看完这一层，再回过头看 `AgentHarness` 接口的 39 行定义，就能品味出它的克制：它**什么都没规定**，但通过这个接口 + 注册表 + 选择策略，OpenClaw 做到了：

1. **Agent 循环内部的复杂度被封装在 harness 内**。Gateway 只管"给我跑一次"，不关心里面转了多少圈、换了几个 key、压了几次 context。
2. **运行时可切换 + 热插拔**。Plugin 可以动态注册新的 harness，甚至 session 级 pin 到指定 harness。
3. **失败被分类、被计数、被持久化**。每一种失败都是结构化的 `FailoverReason` 或 `classifyCompactionReason` label，可统计可监控。
4. **防御性持久化**。Compaction checkpoint、profile rotation log、trace attempt 都落盘——系统不假设任何一步成功。

这正是"生产级 Agent 系统"和"demo 级 Agent 框架"的分野。

---

> 下一篇预告：**OpenClaw 源码导读（四）：Channels、Nodes 与扩展生态**。我们将讨论：一条微信消息怎么触发 Telegram/WhatsApp 的群路由、Canvas 里的 A2UI 协议长什么样、iOS node 如何把摄像头能力挂到 Gateway、Plugin SDK 与 Skills 平台各自的边界、以及 Docker sandbox 是怎么给非 main session 套上沙箱的。

---

## 参考文件列表

- `src/agents/harness/types.ts`：Harness 接口定义
- `src/agents/harness/registry.ts`：全局注册表
- `src/agents/harness/selection.ts`：Harness 选择策略
- `src/agents/harness/builtin-pi.ts`：内置 Pi Harness
- `src/agents/pi-embedded-runner/run.ts`：2160 行主循环
- `src/agents/pi-embedded-runner/run/*.ts`：子模块（auth/failover/payload/helpers）
- `src/agents/pi-embedded-runner/compact.ts`：压缩入口
- `src/agents/pi-embedded-runner/compact-reasons.ts`：压缩失败分类
- `src/agents/failover-error.ts`：FailoverError 与 FailoverReason
- `src/agents/pi-embedded-helpers.ts`：错误检测辅助函数
- `src/gateway/session-compaction-checkpoints.ts`：压缩前的 checkpoint 管理
- pi-mono / pi-coding-agent：底层 SDK（<https://github.com/badlogic/pi-mono>）
