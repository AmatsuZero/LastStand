---
title: "网络 / 代理 / Gradle 问题修复记录"
date: 2026-09-07T23:14:45+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["网络", "代理", "Gradle", "Clash", "排障"]
---\n
## 环境

- Clash Verge Rev（混合端口 7897），全局代理在 `~/.zshenv`；
- 两个机场订阅；
- 涉及内网域名 `ugreeniot.com`、`ugreensmart.com`，以及一台内网 Gradle 私服（形如 `192.168.75.x`）。

## 问题与修复

### 1. Android Studio Gradle 同步失败

**现象**：拉 `kotlin-compiler-embeddable-2.4.0.jar`（57 MB）失败，走代理 3m19s 只下 5.79 MB（29 kB/s），直连仍 3m48s 失败。

**根因**：AS 的 HTTP Proxy 设置不影响 Gradle daemon（Gradle 只看 `gradle.properties` / init script）。`repo.maven.apache.org` 走 Cloudflare CDN，Gradle 并发 HTTP/2 在国内频繁 RESET。`curl` 单连接 4.4 MB/s 正常，但 Gradle 不行。阿里云镜像 17.5 MB/s。

**修复**：新增 `init.d` 脚本把 3 个仓库换阿里云镜像（只影响本机，不污染团队项目）。验证 `BUILD SUCCESSFUL`。

**坑**：换源后报 `Could not find xxx.klib`——镜像文件其实是全的（md5 一致），真因是之前超时留下的半截缓存（pom / module 下了，klib 没下）。解决：删 metadata + 坏 artifact 目录，保留 1.1 GB 有效文件，**不要用 `--refresh-dependencies` 或整个删 caches**。

```sh
rm -rf ~/.gradle/caches/modules-2/files-2.1/<group>/<artifact>
```

### 2. Android SDK Manager 下载

结论：清华 TUNA Android SDK 镜像已下线（403）；只有腾讯可用。但 `dl.google.com` 直连 4.3 MB/s，够快，不用配镜像。清华只维护 Maven 镜像（已用阿里云解决）。

### 3. ~/.zshrc 里 chatgpt 命令报错

**现象**：输出 `Example: echo_color red string`。

**根因**：`chatgpt()` 调 `echo_color yellow`，但 `echo_color` 只有 green / red，yellow 落到兜底分支打印 usage。不是报错，ChatGPT 已启动。

**修复**：`echo_color` 补 7 色；`$2` 改 `shift + $*`（支持带空格）。改完须 `source ~/.zshrc` 生效。

### 4. ChatGPT 桌面端「正在重新连接」

**根因**：代理层正常，但 `chatgpt.com` 返回 403、`api.openai.com` 返回 421——机场共享 IP 被 OpenAI 封禁（IP 级）。免费机场无解，需付费 / 住宅 IP。

### 5. git clone GitHub 失败

**根因**：某订阅只有 1 个真实节点，对 GitHub 链路极差（18 B/s，HTTP/1.1 也失败，不是协议 / 配置问题）。

**修复**：换另一订阅（多节点日本线路），实测 codeload 4.9 MB/s，clone 成功。附带：SSH over 443 + 7897 走代理完全可用，作备选。

### 6. npm 任务 ECONNRESET

**根因**：不是节点问题！`npm.ugreeniot.com` 是公司内网 npm 源（直连 0.05s），但 `no_proxy` 漏了 `.ugreeniot.com`（只有 `.ugreensmart.com`），导致它走代理 → TLS 被重置。

**修复**：`~/.zshenv` 的 `no_proxy` 加 `.ugreeniot.com`。验证：`npm view` 返回 0.1.10，tgz 2.4 MB / 0.19s。注意：系统代理 / TUN 都关着，GUI 应用不走 Clash，走终端继承的环境变量 → 修后须新开终端重启任务。

### 7. 切换订阅后内网规则丢失

**发现**：切到新订阅后，旧订阅时期配的自定义规则全丢（新订阅 rules 是空模板），`ugreensmart.com` 和那台内网 Gradle 私服一度走代理。

**修复**：两个订阅都补规则（`ugreeniot.com` / `ugreensmart.com` / `192.168.75.x` → DIRECT；`github.com` 等 → 走节点）。注意不同订阅策略组名不同。改完须在 UI Profiles 里重新应用。

### 8. 打印机 IP 排查

结论：不需要加。已被 `192.168.0.0/16` 覆盖。打印机走 IPP / 9100 / mDNS 非 HTTP 协议，不走 HTTP 代理。

## 遗留事项

1. Clash 规则需在 UI 里「重新应用」一次；
2. ChatGPT 桌面端：免费机场被封，需付费 / 住宅 IP；
3. `.zshrc` 修复要 `source` 生效；
4. Gradle `nonProxyHosts` 目前只含 `*.ugreensmart.com`，如需访问 `ugreeniot.com` 要补。

## 经验教训

1. 区分「代理问题 vs 节点问题」：ChatGPT 403（IP 封禁）/ GitHub 18 B/s（节点质量）/ npm ECONNRESET（内网域名误走代理），三者病因完全不同；
2. 内网域名必须进 `no_proxy`，漏了会导致奇怪的 TLS 重置错误；
3. 换 Clash 订阅 = 自定义规则可能全丢（每订阅一套规则）；
4. 改 shell 配置文件要 `source` 生效；GUI 应用不吃 `.zshenv`，要走代理就从终端启动；
5. Gradle 换源报 `Could not find`：先查本地缓存残骸，别全量重下；
6. `curl` 单连接正常 ≠ Gradle 正常（HTTP/2 stream reset），镜像比修代理可靠；
7. 实测数据优先于直觉：`curl` 打点三方对比（直连 vs 代理 vs 镜像），几秒出真相。

## 名词补充

- **Gradle daemon / init script**：Gradle 守护进程缓存 JVM 与配置，不受 IDE 的 HTTP Proxy 设置影响；`init.d` 下的脚本在每次构建早期统一注入仓库镜像，是改源最干净的方式。
- **no_proxy / nonProxyHosts**：指定不走代理的主机名单；内网域名漏配会经代理出去，触发 TLS 重置等诡异错误。
- **HTTP/2 stream reset**：Gradle 默认并发多路复用 HTTP/2，在跨境链路上容易因 RESET 中断单个 stream；镜像或限制并发往往比调代理更立竿见影。
