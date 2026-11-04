---
title: "cc-switch 切 Codex 供应商「不生效」的排查"
date: 2026-10-22T16:51:13+08:00
categories: ["绿联工作笔记"]
tags: ["Codex", "CLI", "daemon", "配置"]
aliases: ["/posts/cc-switch-codex-provider/"]
---

## 现象

`cc-switch` 里切换 Codex 供应商（官方 ↔ 自建）后，`codex` 仍走原供应商，像没生效。

## 根因（三个独立问题）

### 1. daemon 不重读配置

`cc-switch` 只改写 `~/.codex/config.toml`；真正发请求的是常驻 managed daemon（`codex app-server --listen unix:// --managed-daemon`，由 `pid-update-loop` 守护、PPID=1 常驻后台），它只在启动时读一次 config，之后不重读。

→ 切了文件但 daemon 没重启 = 没用。

### 2. daemon 忽略 SIGTERM

有客户端连接时 `kill(TERM)` 返回成功但进程不死，必须 SIGKILL。早期 `codex-restart`「没生效」就是这个坑。

### 3. requires_openai_auth 残留（最新发现）

`cc-switch` 切换是「合并」写 config：官方→自建时更新 `base_url` / `bearer_token`，却把上个官方配置里的 `requires_openai_auth=true` 留了下来。`=true` 会让 codex 用官方 OAuth 账号、忽略自建 `base_url` → 仍走官方。自建时该行必须为 `false`。（`cc-switch` 里 UGreen 模板存的其实是 `false`，但合并时没覆盖到。）

## daemon 是谁启动的

不是 launchd 登录项（`launchctl` / `~/Library/LaunchAgents` 无 codex 任务），而是 codex 自己按需拉起：首次运行 codex CLI 或打开桌面版时 spawn `pid-update-loop`（监督者）+ `app-server`（daemon），之后常驻后台（脱离父进程、过继给 PID 1），只在被 kill 或注销 / 重启时死。

## 多界面注意

- **CLI codex**：用 managed daemon(unix) + `~/.codex/config.toml`，`codex-restart` 针对它。
- **VS Code ChatGPT / Codex 插件**：跑自己的 app-server（扩展目录内），`codex-restart` 不碰，要重载 VS Code 窗口 / 重启插件才重读配置。
- **ChatGPT 桌面版**：自带 codex-cli + 自己的 `stdio://` app-server + 自己的配置（`~/Library/Application Support/Codex`），不读自建 provider；需单独重启桌面版。

## 其它坑

- 退出 `cc-switch` 会「客户端已指回直连」把 config 重置回官方；切自建需保持托盘常驻、别退出。
- 切回官方要求重登：`preserveCodexOfficialAuthOnSwitch=false` 时不保留官方登录态；打开它（`=true`）可免重登（与自建路由是两回事，互不影响）。

## 正确解法 / 标准流程

```text
cc-switch 切供应商 → 跑 codex-restart（自动自愈 requires_openai_auth + SIGKILL 重启 daemon）→ 重开 codex
```

## 工具 codex-restart（已加进 ~/.zshrc）

- `codex-restart`：自愈配置 + 杀 daemon / host / 残留 CLI 会话，提示重开 codex
- `codex-restart --gui`：额外退出重开 ChatGPT 桌面版
- `codex-restart --check`：只诊断，打印当前 config 供应商 + 运行中的 daemon

只杀 `unix://` managed daemon，不碰桌面版 `stdio://` app-server。新终端或 `source ~/.zshrc` 生效。

## 名词补充

- **managed daemon（unix socket）**：Codex CLI 以常驻进程方式运行、通过本地 unix socket 通信的 app-server，避免每次命令冷启动；正因常驻，它只在启动时读一次配置，切换供应商必须重启它。
- **requires_openai_auth**：Codex 配置项，为 `true` 时强制走官方 OAuth 账号身份，会覆盖自建 `base_url`。切到自建 provider 时务必置 `false`，否则配置看似生效、请求却仍发往官方。
- **stdio / unix 两种 app-server**：CLI 与 VS Code 插件多用 unix socket 的 managed daemon；桌面版用 `stdio://` 自有 app-server，二者配置与生命周期互不干扰，因此重启一端不会让另一端生效。
