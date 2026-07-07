+++
title = "OpenClaw 源码导读（四）：Channels、Nodes 与扩展生态"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 15
tags = ["AI", "LLM", "面试", "OpenClaw"]
categories = ["AI", "面试"]
+++
> 前三篇我们看清了 OpenClaw 的三副骨架：架构全景、Gateway 控制平面、Agent Harness 执行管线。这一篇是压轴篇，我们看它的"血肉"——**`channels/`、`node-host/`、`canvas-host/`、`plugins/`、`skills/`、`sandbox/`**。OpenClaw 真正"好用"的感觉，是从这一层来的：一条消息从 WhatsApp 进来、触发 iOS 上的摄像头、在 Android 上渲染一张 Canvas、最后把结果发回 Slack 线程——整个过程中 Gateway 本身一行代码都不需要改。
>
> 本文涵盖 **118 个 channel/provider extension、53 个 skill、iOS/macOS/Android node 客户端、A2UI Canvas 协议、以及 Docker sandbox 的整套隔离模型**。

---

## 一、Channels：118 个 extension 是怎么"插"进来的

### 1. ChannelPlugin 接口

OpenClaw 所有 channel（微信、Telegram、Slack、iMessage、IRC、Discord……）本质上都是实现同一个接口 `ChannelPlugin`：

```53:96:src/channels/plugins/types.plugin.ts
export type ChannelPlugin<ResolvedAccount = any, Probe = unknown, Audit = unknown> = {
  id: ChannelId;
  meta: ChannelMeta;
  capabilities: ChannelCapabilities;
  defaults?: {
    queue?: {
      debounceMs?: number;
    };
  };
  reload?: { configPrefixes: string[]; noopPrefixes?: string[] };
  setupWizard?: ChannelPluginSetupWizard;
  config: ChannelConfigAdapter<ResolvedAccount>;
  configSchema?: ChannelConfigSchema;
  setup?: ChannelSetupAdapter;
  pairing?: ChannelPairingAdapter;
  security?: ChannelSecurityAdapter<ResolvedAccount>;
  groups?: ChannelGroupAdapter;
  mentions?: ChannelMentionAdapter;
  outbound?: ChannelOutboundAdapter;
  status?: ChannelStatusAdapter<ResolvedAccount, Probe, Audit>;
  gatewayMethods?: string[];
  gateway?: ChannelGatewayAdapter<ResolvedAccount>;
  auth?: ChannelAuthAdapter;
  approvalCapability?: ChannelApprovalCapability;
  elevated?: ChannelElevatedAdapter;
  commands?: ChannelCommandAdapter;
  lifecycle?: ChannelLifecycleAdapter;
  secrets?: ChannelSecretsAdapter;
  allowlist?: ChannelAllowlistAdapter;
  doctor?: ChannelDoctorAdapter;
  bindings?: ChannelConfiguredBindingProvider;
  conversationBindings?: ChannelConversationBindingSupport;
  streaming?: ChannelStreamingAdapter;
  threading?: ChannelThreadingAdapter;
  messaging?: ChannelMessagingAdapter;
  agentPrompt?: ChannelAgentPromptAdapter;
  directory?: ChannelDirectoryAdapter;
  resolver?: ChannelResolverAdapter;
  actions?: ChannelMessageActionAdapter;
  heartbeat?: ChannelHeartbeatAdapter;
  agentTools?: ChannelAgentToolFactory | ChannelAgentTool[];
};
```

这个接口一共有 **40 多个可选的 adapter**，每个对应一种能力：

- **核心**：`config`、`capabilities`、`meta`——必选。
- **生命周期**：`lifecycle`、`setup`、`pairing`、`secrets`、`auth`。
- **消息路径**：`outbound`（出站）、`messaging`（入站）、`streaming`（流式消息）、`threading`（线程管理）。
- **群组/mention**：`groups`、`mentions`、`allowlist`、`bindings`、`conversationBindings`。
- **工具集成**：`agentTools`、`actions`、`commands`、`approvalCapability`。
- **健康**：`status`、`doctor`、`heartbeat`、`security`。

实现一个 channel，通常只要填一半左右。比如 Telegram 只填 `config`、`outbound`、`lifecycle`、`setup`、`secrets`、`auth`、`status`、`pairing`——其它走默认实现。

### 2. Plugin Manifest

每个 channel extension 都有一份 `openclaw.plugin.json`：

```json
{
  "id": "telegram",
  "channels": ["telegram"],
  "channelEnvVars": {
    "telegram": ["TELEGRAM_BOT_TOKEN"]
  },
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {}
  }
}
```

这三个字段就能让 Gateway：

- **`id`**：识别 plugin。
- **`channels`**：告诉 Gateway 这个 plugin 提供哪些 channel id（一个 plugin 可以实现多个 channel，比如 `bluebubbles` 实现了 iMessage）。
- **`channelEnvVars`**：运行时自动注入哪些环境变量（`TELEGRAM_BOT_TOKEN` 会被 Gateway 从 keychain 取出来，传给子进程）。
- **`configSchema`**：用 JSON Schema 校验 config，`additionalProperties: false` 是严格检查。

### 3. Extensions 目录一瞥

`extensions/` 下已经有 **118 个 plugin**，大致分几类（从目录名看）：

- **IM/Chat**：`telegram`、`slack`、`discord`、`wechat`、`qqbot`、`line`、`feishu`、`msteams`、`signal`、`imessage`、`bluebubbles`、`matrix`、`irc`、`nostr`、`tlon`、`mattermost`、`synology-chat`、`googlechat`、`google-meet`、`nextcloud-talk`。
- **AI Provider**：`anthropic`、`openai`、`google`、`anthropic-vertex`、`amazon-bedrock`、`deepseek`、`mistral`、`groq`、`fireworks`、`together`、`moonshot`、`minimax`、`qwen`、`tencent`、`alibaba`、`byteplus`、`stepfun`、`kimi-coding`、`copilot-proxy`、`openrouter`、`ollama`、`lmstudio`、`sglang`、`litellm`、`kilocode`、`github-copilot`、`huggingface`、`nvidia`、`perplexity`、`chutes`、`fal`、`runway`、`synthetic`、`microsoft`、`microsoft-foundry`、`cloudflare-ai-gateway`、`opencode`、`opencode-go`、`tokenjuice`、`arcee`、`qianfan`。
- **搜索/内容**：`brave`、`duckduckgo`、`exa`、`firecrawl`、`tavily`、`searxng`。
- **语音/多媒体**：`deepgram`、`elevenlabs`、`openai-whisper`、`music-generation-providers`、`speech-core`、`media-understanding-core`、`image-generation-core`、`comfy`。
- **基础能力**：`acpx`、`active-memory`、`memory-core`、`memory-lancedb`、`memory-wiki`、`device-pair`、`browser`、`codex`、`diagnostics-otel`、`diffs`、`llm-task`、`thread-ownership`、`open-prose`、`openshell`、`phone-control`、`qa-channel`、`qa-lab`、`qa-matrix`、`skill-workshop`、`talk-voice`、`test-support`、`lobster`、`shared`。

这张列表的密度说明 OpenClaw 的 **"让一切都变 plugin"** 策略非常彻底——连 Anthropic / OpenAI 这样的一等公民，也是被当作 plugin 挂进系统的。

### 4. Setup Wizard 的共同风格

由于 channel 种类极多，OpenClaw 为 setup 流程定义了一套**可发现、可描述、可并发登录**的协议 `ChannelSetupWizard`，统一处理：

- 把 token / cookie / QR code 从用户处收集过来。
- 存到 keychain（macOS Keychain / libsecret / Windows Credential Vault，最次落地到加密文件）。
- 在 Gateway 启动时解密并注入对应子进程。
- 遇到 token 失效时打断 agent turn、弹出"重新登录"提示、恢复后自动重放。

这种"登录态像密钥一样被 Gateway 托管"的统一做法，让 OpenClaw 可以同时管理几十个 IM 账号不打架——每个账号不需要自己实现 token refresh，只要实现 `ChannelAuthAdapter` 的三个回调。

---

## 二、Nodes：手机和 Mac 也能变成 RPC host

### 2.1 node-host 的 invoke 协议

`src/node-host/invoke-types.ts` 是 node 侧可调用命令的核心类型，注意它是**双向的**：

```3:17:src/node-host/invoke-types.ts
export type SystemRunParams = {
  command: string[];
  rawCommand?: string | null;
  systemRunPlan?: SystemRunApprovalPlan | null;
  cwd?: string | null;
  env?: Record<string, string>;
  timeoutMs?: number | null;
  needsScreenRecording?: boolean | null;
  agentId?: string | null;
  sessionKey?: string | null;
  approved?: boolean | null;
  approvalDecision?: string | null;
  runId?: string | null;
  suppressNotifyOnExit?: boolean | null;
};
```

注意这里的 **`needsScreenRecording`**：它是一个特殊标记，告诉 Gateway"这条命令在 macOS 上需要 Screen Recording 权限才能跑"——Gateway 不会自己申请权限，而是把请求**路由到已授权 Screen Recording 的 node**（通常是本机 Mac 上的 OpenClaw menu bar app）。用户在 macOS 上提前给 OpenClaw App 开了屏幕录制权限，之后所有 session 触发的 Screenshot / OCR 工具都通过它走。

这是 OpenClaw 做的一个关键取舍：**Gateway 本身是 background Node 进程，缺少 GUI 能做 TCC 弹窗；所以把"需要敏感权限的系统调用"剥离到 desktop app node 上代理**。

### 2.2 Plugin Node Host

Node-host 本身也有"插件"：

```44:56:src/node-host/plugin-node-host.ts
export async function invokeRegisteredNodeHostCommand(
  command: string,
  paramsJSON?: string | null,
): Promise<string | null> {
  const registry = getActivePluginRegistry();
  const match = (registry?.nodeHostCommands ?? []).find(
    (entry) => entry.command.command === command,
  );
  if (!match) {
    return null;
  }
  return await match.command.handle(paramsJSON);
}
```

每个 plugin 都可以注册自己的 "node-host command"——比如 `camsnap` plugin 注册 `camsnap.capture`，在 Mac node 上启动 camera 然后返回 jpg base64。Gateway 收到 invoke 请求后：

1. 查 `nodeHostCommands` 注册表里的 `match`。
2. 如果本 gateway 就能处理，直接 `match.command.handle(paramsJSON)` 返回。
3. 否则把请求转发到合适的 `node` client（比如 iOS / macOS app）。
4. 通过 `caps` 能力声明做路由判断（"谁家支持 `camera.ios`"）。

### 2.3 iOS 客户端看起来什么样

iOS 客户端源码在 `apps/ios/Sources/` 里，目录划分一目了然：

```
Calendar  Camera  Capabilities  Chat  Contacts
Device  EventKit  Gateway  HomeToolbar.swift
LiveActivity  Location  Media  Model  Motion
Onboarding  OpenClawApp.swift  Push  Reminders
RootCanvas.swift  RootTabs.swift  RootView.swift
Screen  Services  SessionKey.swift  Settings
Status  Voice
```

每个首字母大写目录对应一个 "capability"：

- **Camera**：`UIImagePickerController` + AVFoundation，为 `camera.capture` 命令提供能力。
- **Screen**：`ReplayKit` 录屏，为 `screen.capture` 提供能力。
- **Calendar / EventKit / Reminders / Contacts**：iOS 系统数据源的 proxy。
- **Location / Motion**：CoreLocation / CoreMotion。
- **Voice**：TTS + 离线语音识别。
- **LiveActivity**：ActivityWidget，让 agent 的长时任务在锁屏上可见。
- **Gateway**：最重要——维护到 Gateway 的 WebSocket 连接。

Gateway 连接控制器用 **`URLSessionWebSocketTask`** 建立连接：

```1014:1014:apps/ios/Sources/Gateway/GatewayConnectionController.swift
    var task: URLSessionWebSocketTask?
```

并且 `Gateway/` 目录里还实现了：

- `GatewayDiscoveryModel.swift`：通过 Bonjour / mDNS 发现局域网内的 Gateway。
- `GatewayHealthMonitor.swift`：心跳 + 弱网自动重连。
- `GatewayTrustPromptAlert.swift`：首次连接到某 Gateway 时弹 trust prompt（TLS pin）。
- `GatewaySetupCode.swift`：扫码配对，对接第二篇介绍的 bootstrap token 流程。
- `KeychainStore.swift`：把签发的 `deviceToken` 存进 iOS Keychain。

组合起来，**iOS app 就是 Gateway 的一个"远程能力池"**。你在 Telegram 里发一句"帮我拍张照"，Gateway 发现 `camera.capture` 需要 iOS node，路由到手机上的 `URLSessionWebSocketTask`，iOS 真的弹相机界面、拍完照回传 base64——整个链路对 user 是透明的。

---

## 三、Canvas 与 A2UI：Agent 画 UI 给 user 看

### 3.1 Canvas Host：Gateway 内嵌的 HTTP+WS 静态服务器

`src/canvas-host/server.ts` 在 Gateway 启动时顺便开一个 HTTP 服务器（默认 18793），可以服务任意 HTML/CSS/JS。**Agent 生成一个页面文件写到 `canvasHost.root` 目录，Gateway 就能给这个页面一个可访问 URL**。

```9:13:src/canvas-host/a2ui.ts
export const A2UI_PATH = "/__openclaw__/a2ui";

export const CANVAS_HOST_PATH = "/__openclaw__/canvas";

export const CANVAS_WS_PATH = "/__openclaw__/ws";
```

三个 reserved path：

- `/__openclaw__/canvas/*`：静态资源路径。Agent 通过 `canvas` tool 把 HTML 文件写到 canvas root，URL 就是 `http://<host>:18793/__openclaw__/canvas/<file>.html`。
- `/__openclaw__/a2ui/*`：A2UI runtime bundle。页面通过 `<script src="/__openclaw__/a2ui/a2ui.bundle.js">` 加载 runtime。
- `/__openclaw__/ws`：canvas 页面反向连回 Gateway 的 WebSocket，用于双向事件（比如 user 点了按钮 → 触发 agent 回调）。

### 3.2 A2UI：Agent-to-UI 的"准协议"

Canvas skill 的 SKILL.md 里有一张很清晰的拓扑图：

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Canvas Host    │────▶│   Node Bridge    │────▶│  Node App   │
│  (HTTP Server)  │     │  (TCP Server)    │     │ (Mac/iOS/   │
│  Port 18793     │     │  Port 18790      │     │  Android)   │
└─────────────────┘     └──────────────────┘     └─────────────┘
```

1. **Canvas Host** 服务静态页面。
2. **Node Bridge** 是 Gateway 给 node 推送 canvas URL 的专用 TCP 通道（不走主 WebSocket）。
3. **Node App**（iOS/macOS/Android）用 WebView 渲染。

### 3.3 bindHost 决定 URL 的形态

canvas 还解决了一个非常现实的问题：**agent 画的 canvas URL 究竟是 `localhost` 还是 LAN IP 还是 Tailscale？**

```
| Bind Mode  | Server Binds To     | Canvas URL Uses            |
| ---------- | ------------------- | -------------------------- |
| `loopback` | 127.0.0.1           | localhost (local only)     |
| `lan`      | LAN interface       | LAN IP address             |
| `tailnet`  | Tailscale interface | Tailscale hostname         |
| `auto`     | Best available      | Tailscale > LAN > loopback |
```

当 Gateway bind 在 Tailscale 接口时，Canvas URL 会自动写成 Tailscale hostname，这样手机在外面也能访问同一个 canvas。**这和第二篇里讲的 pairing setup code URL resolver 共用一套逻辑**——都是 `resolveRuntimeBridgeHostSnapshot()` 做的决策。

---

## 四、Skills：模块化的 "agent 剧本"

### 4.1 Skill 目录

`skills/` 下有 53 个 skill：

```
1password  apple-notes  apple-reminders  bear-notes  blogwatcher
blucli  bluebubbles  camsnap  canvas  clawhub  coding-agent
discord  eightctl  gemini  gh-issues  gifgrep  github  gog
goplaces  healthcheck  himalaya  imsg  mcporter  model-usage
nano-pdf  node-connect  notion  obsidian  openai-whisper
openai-whisper-api  openhue  oracle  ordercli  peekaboo
sag  session-logs  sherpa-onnx-tts  skill-creator  slack
songsee  sonoscli  spotify-player  summarize  taskflow
taskflow-inbox-triage  things-mac  tmux  trello  video-frames
voice-call  wacli  weather  xurl
```

每个 skill 都只是一个 `SKILL.md`（或加上少量脚本），里面写着"**当 user 说 xxx 时，你应该做 yyy**"。比如 `summarize` 会告诉 agent "如果 user 给了一个 URL，先用 exec 跑 `curl | html2text | head -4000`，再 summarize"。

这点和 Anthropic 的 **"Claude skills"** 理念高度一致——skill 不是 tool，而是 **prompt 层面的"Agent 行为提示"**：

- **Tool**：能力本身（`camera.capture`、`canvas.open`）。
- **Skill**：何时使用该能力的"行为剧本"。

### 4.2 Skill 与 Tool 的关系

在 `runEmbeddedPiAgent` 里我们看到 `skillsSnapshot: params.skillsSnapshot` 和 `contextEngine` 的参数。OpenClaw 不会把所有 skills 一次性塞到 system prompt——它根据**当前 session 的 provider / channel / model / 能力集**动态挑选：

```
skills/ 下的所有 SKILL.md
  → SkillRegistry 读取并缓存
  → 每轮 agent turn 开始时：resolveSkillsPromptForRun() 过滤
    - 去掉不兼容当前 channel 的 skill（比如 camsnap 在 Telegram 里用不了摄像头）
    - 去掉被 agent config disable 的 skill
    - 去掉超过 token budget 的 skill
  → 最终挑选的 skills 合并进 extraSystemPrompt
```

这让 "53 个 skill 都注入" 变成"按需注入最多 5~10 个"，system prompt 体积可控。

### 4.3 Skill Workshop：让 Agent 自己写 Skill

`extensions/skill-workshop` 和 skills 下的 `skill-creator` 合起来构成一个有意思的闭环：**agent 可以给自己写 skill**。

- User 说"每次我提到购物清单，帮我调用 Things"。
- Agent 调用 `skill-creator` 生成 `things-shopping/SKILL.md`。
- 文件落盘到 `~/.openclaw/skills/things-shopping/`。
- 下一轮 turn 开始时，`resolveSkillsPromptForRun` 自动 pick 新 skill。

这是 "**self-improving agent**" 的一种朴素实现：不改 model weights，不跑 RL loop，只改提示词。

---

## 五、Sandbox：非 main session 的 Docker 隔离

### 5.1 默认 image 和 policy

`src/agents/sandbox/constants.ts` 定义了非常保守的默认：

```7:38:src/agents/sandbox/constants.ts
export const DEFAULT_SANDBOX_IMAGE = "openclaw-sandbox:bookworm-slim";
export const DEFAULT_SANDBOX_CONTAINER_PREFIX = "openclaw-sbx-";
export const DEFAULT_SANDBOX_WORKDIR = "/workspace";
export const DEFAULT_SANDBOX_IDLE_HOURS = 24;
export const DEFAULT_SANDBOX_MAX_AGE_DAYS = 7;

export const DEFAULT_TOOL_ALLOW = [
  "exec",
  "process",
  "read",
  "write",
  "edit",
  "apply_patch",
  "image",
  "sessions_list",
  "sessions_history",
  "sessions_send",
  "sessions_spawn",
  "sessions_yield",
  "subagents",
  "session_status",
] as const;

export const DEFAULT_TOOL_DENY = [
  "browser",
  "canvas",
  "nodes",
  "cron",
  "gateway",
  ...CHANNEL_IDS,
] as const;
```

两条关键规则：

- **allow-list**：sandbox 里只允许文件/进程相关工具。
- **deny-list**：**禁止 browser / canvas / nodes / cron / gateway / 所有 channels**。也就是说，sandbox 里跑的 agent **不能给任何人发消息**、**不能启动 canvas**、**不能调 iOS/macOS node**、**不能给自己设 cron**、**不能调 gateway 元命令**。

这就是 "**subagent 不能直接 DM user**" 的技术实现：通过 `sandboxSessionKey` 把 subagent 锁在一个 Docker 容器里，它的 tool 列表被 `DEFAULT_TOOL_DENY` 砍掉了所有对外能力，只能通过 `sessions_yield` 把结果还给 main agent，再由 main agent 决定是否发出去。

### 5.2 Workspace 隔离策略

context.ts 里还控制着 workspace 目录的可见性：

```33:50:src/agents/sandbox/context.ts
  const { cfg, rawSessionKey } = params;

  const agentWorkspaceDir = resolveUserPath(
    params.workspaceDir?.trim() || DEFAULT_AGENT_WORKSPACE_DIR,
  );
  const workspaceRoot = resolveUserPath(cfg.workspaceRoot);
  const scopeKey = resolveSandboxScopeKey(cfg.scope, rawSessionKey);
  const sandboxWorkspaceDir =
    cfg.scope === "shared" ? workspaceRoot : resolveSandboxWorkspaceDir(workspaceRoot, scopeKey);
  const workspaceDir = cfg.workspaceAccess === "rw" ? agentWorkspaceDir : sandboxWorkspaceDir;

  if (workspaceDir === sandboxWorkspaceDir) {
    await ensureSandboxWorkspace(
      sandboxWorkspaceDir,
      agentWorkspaceDir,
      params.config?.agents?.defaults?.skipBootstrap,
    );
```

三种 scope：

- `per-session`（默认）：每个 session 独立 workspace，**写互不影响**。
- `shared`：某些 agent 可能需要 subagent 和 main 共享 workspace（比如 main 写代码、subagent 跑测试）。
- `per-agent`：同一个 agent 的所有 session 共享 workspace，不同 agent 隔离。

`workspaceAccess` 可以进一步收紧到 `ro`（read-only），适合只读查询类的 subagent。

### 5.3 Skill 同步

sandbox 启动时会把 main workspace 的 skills 目录同步进去：

```51:77:src/agents/sandbox/context.ts
    if (cfg.workspaceAccess !== "rw") {
      try {
        const [{ getRemoteSkillEligibility }, { canExecRequestNode }, { syncSkillsToWorkspace }] =
          await Promise.all([
            import("../../infra/skills-remote.js"),
            import("../exec-defaults.js"),
            import("../skills.js"),
          ]);
        await syncSkillsToWorkspace({
          sourceWorkspaceDir: agentWorkspaceDir,
          targetWorkspaceDir: sandboxWorkspaceDir,
          config: params.config,
          agentId: params.agentId,
          eligibility: {
            remote: getRemoteSkillEligibility({
              advertiseExecNode: canExecRequestNode({
                cfg: params.config,
                sessionKey: rawSessionKey,
                agentId: params.agentId,
              }),
            }),
          },
        });
      } catch (error) {
```

注意 `getRemoteSkillEligibility` 这个决策：**主 session 里的"需要 node"的 skill 在 sandbox 里应不应该显示？**

- 如果 sandbox session 能申请 node（`canExecRequestNode` 返回 true），就可以用远程 skill。
- 否则（比如 subagent）只同步 sandbox-compatible 的 skill，不让 agent 看到"camera.capture"这种自己根本调不到的工具——避免 agent 浪费 token 去试然后失败。

这是非常细腻的 prompt engineering：**"让 agent 只看到它真正能用的东西"**。

### 5.4 Browser Sandbox：独立安全 hash

注意这一行：

```42:42:src/agents/sandbox/constants.ts
export const SANDBOX_BROWSER_SECURITY_HASH_EPOCH = "2026-04-05-cdp-source-range";
```

Browser sandbox 有**独立的 security hash**——只要 upstream 的安全补丁有新版本（比如针对 CDP source range 的加固），这个常量就换个日期，所有旧的 browser 容器会被重建。这是"**如何在不可变容器里做 hotfix**"的标准做法。

---

## 六、Plugin SDK：让"插 LLM"和"插 Channel"一样简单

`src/plugin-sdk/` 下是一个巨大的公开 API 面（200+ 文件），核心分为几组：

- **Provider runtime**：`anthropic-cli.ts`、`anthropic-vertex.ts`、`agent-runtime.ts`、`provider-runtime.ts`——让 LLM provider 不需要自己实现 streaming loop，只需要实现 "prepare auth / send / stream" 三段。
- **Channel runtime**：`channel-runtime-surface.types.ts` 系列，对应第一节的 ChannelPlugin。
- **Account resolution**：`account-*.ts` 一大串，处理"同一 plugin 多账号"情形（比如一个人连了三个 WhatsApp 账号）。
- **Approval**：`approval-*.ts` 系列，统一 user 批准 / 拒绝的 UI+回调。
- **ACP（Agent-to-Channel-Proxy）**：`acp-*.ts`，让 channel 之间可以互相 "binding"——你在 Telegram 开的对话可以继续在 macOS 桌面里回复。

这层代码的目的是：**让第三方 plugin 作者完全不碰 Gateway 内部状态**。

---

## 七、合在一起看：一条消息从 Telegram 到 iMessage 回复

最后用一条完整数据流把本系列所有概念串起来。用户在 Telegram 里发了一句 "@openclaw 帮我拍张照发到 iMessage 给我妈"：

```
[1] Telegram Bot API
     → getUpdates 收到消息
     → extensions/telegram 的 ChannelMessagingAdapter.onInbound()

[2] channels/session.ts
     → 根据 (channel=telegram, from=xxx) 解析出 sessionKey
     → 把消息 push 进 inbound-debounce-policy（防抖）
     → 触发 agents.spawn / run

[3] src/agents/pi-embedded-runner/run.ts
     → enqueueSession / enqueueGlobal 串行化
     → selectAgentHarness: 根据 config 选 pi harness
     → runEmbeddedAttemptWithBackend: 调 pi-coding-agent
     → LLM 返回：调用 camera.capture 工具

[4] tools → channels 联动
     → camera.capture 的 tool handler 检查 caps
     → 当前 Gateway 里没有 camera 能力
     → 走 nodes RPC：把请求包装成 NodeInvokeRequestPayload
     → 路由到 iOS node（通过 WebSocket）

[5] iOS app
     → GatewayConnectionController 收到 req 帧
     → 分发给 Camera module
     → 弹出系统 camera，user 拍完一张
     → base64 jpeg 回传

[6] Gateway 拿到结果，注入 tool_result
     → LLM 下一轮：调用 iMessage send
     → 查 channel registry，找到 bluebubbles plugin
     → BlueBubbles 向 macOS 端 REST API 发请求
     → 消息送达妈妈的 iMessage

[7] Gateway 通过 Event 帧把 assistant text 回 push 给所有订阅者
     → Telegram 用户看到："✅ 已发送"
     → macOS OpenClaw App 同步显示这段历史
     → iOS App Live Activity 短暂高亮
```

整个流程涉及到：

- **Channels** 层：telegram 入站 + bluebubbles 出站。
- **Session** 层：sessionKey 把两边黏在一起。
- **Agent Harness** 层：pi-embedded-runner 跑 turn + tool loop。
- **Nodes** 层：iOS camera RPC。
- **Event 帧**：跨 channel 的"已发送"通知广播。

代码量几千行，但用户感知：**一句话生效**。

---

## 八、整个系列的收束

读完四篇，我们可以给 OpenClaw 下一个更精确的定义：

> OpenClaw 是一个**以 Gateway 为控制平面、以 Harness 为执行平面、以 Plugin/Channel/Node/Skill 为扩展平面**的个人 AI 助理基础设施。它的工程价值不在于任何单一技术突破，而在于**把上百种真实世界的 AI 使用场景统一到一套 WebSocket 协议下**。

和流行的 LangChain / AutoGen / CrewAI 框架相比，它有几点根本不同：

| 对比维度 | 典型 Agent 框架 | OpenClaw |
|----------|----------------|----------|
| 运行形态 | 单进程库 | 带守护进程的 daemon + 多客户端 |
| 通讯 | 函数调用 | WebSocket + 双向 RPC |
| 多端覆盖 | 无 | Web / iOS / macOS / Android / Watch |
| 扩展 | plugin as code | plugin as package + 远程 skill |
| Provider | 内置 1~2 家 | 40+ 家（plugin 模式） |
| Sandbox | 无 | Docker + 能力白名单 |
| Compaction | 简单 summary | 9 类失败分类 + checkpoint |
| 观测 | 不可观测 | Trace + structured logs |

如果说 Claude Code 演示了 "**一个 agent 可以多锋利**"，OpenClaw 演示了 "**怎么让一堆 agent 在同一个屋檐下长期工作**"。两个方向都值得 iOS 工程师关注——前者是单兵作战的范式，后者是客户端与后端融合的新范式（因为 Gateway 本身就是后端，但它要跟手机/Mac app/ WebView 打交道，形态和移动端网关完全重合）。

---

## 系列索引

- **（一）** [OpenClaw 源码导读：架构总览]({{< relref "/posts/interview/ai/openclaw-架构总览" >}})
- **（二）** [OpenClaw 源码导读：Gateway 控制平面 — 一条 WebSocket 连上所有人]({{< relref "/posts/interview/ai/openclaw-Gateway控制平面" >}})
- **（三）** [OpenClaw 源码导读：Agent Harness — 为"每一家 LLM 都能兜住"而生的执行管线]({{< relref "/posts/interview/ai/openclaw-Agent-Harness" >}})
- **（四）** OpenClaw 源码导读：Channels、Nodes 与扩展生态（本文）

## 参考资料

- OpenClaw 仓库：<https://github.com/openclaw/openclaw>
- DeepWiki 架构导览：<https://deepwiki.com/openclaw/openclaw>
- pi-mono（pi-coding-agent 依赖）：<https://github.com/badlogic/pi-mono>
- Anthropic Harness Engineering 文章：<https://www.anthropic.com/engineering>
- 本系列用到的主要源码：
  - `src/channels/`（入站/出站路由、session 绑定）
  - `src/channels/plugins/`（ChannelPlugin 接口族）
  - `src/node-host/`（node RPC invoke）
  - `src/canvas-host/`（HTTP+WS 静态页面 + A2UI）
  - `src/agents/sandbox/`（Docker sandbox）
  - `src/plugin-sdk/`（对外 API）
  - `skills/`（53 个 skill 剧本）
  - `extensions/`（118 个 channel / provider）
  - `apps/ios/Sources/`（iOS 端 node 客户端）
