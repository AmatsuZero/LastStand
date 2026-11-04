---
title: "rn-runtime-ios Runtime 发布与接入踩坑复盘"
date: 2026-10-07T23:28:30+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["iOS", "ReactNative", "CocoaPods", "Specs", "GitLabCI"]
---

## 最终结果

- Runtime 最终发布版本：`0.1.9.17`
- Lottie 内网修订版本：`4.6.0.1`
- Runtime 发布流水线：Pipeline 3740
- 真机产物验证 Job：9486 成功
- Runtime MR !22 已合并并完成发布
- ugreenhome MR !8 已合并，Runtime 与 Lottie 依赖已同步升级

下面按「问题 → 根因 → 处理」的方式复盘，避免把教训写成流水账。

## 1. 依赖地址与 Lottie Podspec

依赖地址必须统一使用内网 GitLab 新域名，**不能把 Runner 内部 IP（形如 192.168.x.x）写进 Podspec**。这会造成环境耦合、证书 / SNI 问题，也让开发机与 CI 行为不一致。

Lottie 原始 `4.6.0` 已经发布，不能移动或覆盖旧 Tag。保留源码不变，仅修复 Podspec URL 时，应发布新的修订版本 `4.6.0.1`。

Specs 仓库中的版本、`s.version`、Git Tag 与 Runtime 依赖版本必须完全一致——这是后面一系列问题的总根。

## 2. 版本号与 Tag

- 任何会影响发布产物或 Podspec 的修复都要递增版本号，不能复用已经发布的 Tag；
- Tag 应从已经合并且验证通过的 main 创建，不要从未合并提交直接打发布 Tag；
- 发布前确认「Tag 规则、流水线 rules、版本文件」三者一致。「打了 Tag」不等于「publish-runtime 一定会触发」。

## 3. publish-runtime 未随 Tag 触发

- 首先检查 `.gitlab-ci.yml` 中 job 的 `rules/only` 是否匹配当前 Tag；
- 检查 Tag 是否属于 Protected Tag，以及触发者是否有对应权限；
- 发布 job 与普通构建 job 是两条独立链路：普通 CI 绿色不能证明发布 job 已创建或已执行；
- 修复后必须用新的版本和新 Tag 验证，不能移动旧 Tag 来「补跑」。

## 4. Specs Token 鉴权

`SPECS_GIT_PASSWORD` 必须是对 Specs 仓库具备写权限的有效 Token，并正确配置到 Runtime 项目的 CI/CD Variables。变量还要检查 Protected / Masked / Environment scope——受保护 Tag 上运行时，未受保护变量可能不可见。

用户名、Token 类型与 GitLab HTTPS 鉴权方式必须匹配；仅「能登录 GitLab」不代表能 push Specs。

**安全红线**：曾在会话或日志中暴露的 Token 不应继续使用，应立即撤销并重新生成；本文不记录任何 Token 明文。

## 5. Runner Git 连接被重置

典型错误：`Recv failure: Connection reset by peer`。这不是 Podspec 版本错误，日志已显示 CocoaPods 正确尝试拉取 `4.6.0.1`，失败点是 Git HTTPS 传输。

对瞬时网络错误增加了有限重试（日志可见 `retry 2/3`、`retry 3/3`），但重试只能缓解抖动，不能替代网络修复。必须在 Runner 本机分别验证 DNS、TCP / TLS、IPv4 / IPv6、HTTP/1.1、HTTP/2、`git ls-remote` 和真实 shallow clone。Runtime 仓库各协议 `ls-remote` 与 `depth=20` clone 均成功后，Job 9472 成功，说明此前更像瞬时链路问题。

## 6. Consumer 编译与 Boost 头文件

真正导致编译失败的错误是：`boost/preprocessor/control/expr_iif.hpp file not found`。

CocoaPods 的 `:path` 场景中，宿主工程的 `PODS_ROOT` 与 Runtime 生产阶段路径不同，不能把生产工程路径直接带入 Consumer。Header Search Path 必须基于交付后的 XCFramework / Pod 布局，而不是构建机 staging 或 Pods 临时目录。

大量 umbrella header、deprecated API 警告并非本次阻断根因；要从截断日志里找第一条 fatal error。

## 7. Explicit Modules 警告

`SWIFT_ENABLE_EXPLICIT_MODULES` 与 `CLANG_ENABLE_EXPLICIT_MODULES override` 是 CocoaPods 警告，不是本次失败根因。Consumer 验证命令已显式设置二者为 NO，用于减少 Xcode 26 下的模块兼容问题。

不要因为它们出现在日志末尾附近就误判；真正 exit 65 的原因仍应看后续编译 fatal error。

## 8. Artifact 413：产物过大

错误：`413 Request Entity Too Large`，当时 `products/runtime-ios/` 命中约 26622 个文件。这是 artifact upload 阶段失败，不是 Runtime 编译失败。

在当前业务只需要真机的前提下，产物改为仅保留 iOS device slice，移除 simulator slice，显著降低体积。上传范围必须白名单化，只上传发布需要的文件；不要把整个中间构建目录、临时 Pods、DerivedData 一并上传。Job 9486 成功证明真机-only 方案解决了上传限制。

## 9. 发布脚本变量与 downloadUrl

曾出现 `downloadUrl is not defined`，属于发布脚本变量作用域 / 初始化问题。发布逻辑应先完成上传并得到确定 URL，再生成 Podspec / Specs 提交；失败时要明确停止，不能生成半成品。所有跨阶段值都应显式传递，不依赖隐式全局变量。

## 10. Specs push 的 PATH / HOME 环境

CI 中执行 Specs 提交时不能假设交互式 shell 环境；PATH、HOME、Git identity 和 credential helper 都可能缺失。需要在 job 中显式设置可执行文件路径、HOME、Git 用户信息和鉴权方式。

不要把 Token 拼进最终日志或错误信息；远端 URL 输出前应脱敏。

## 11. pod repo push 重复 lint

如果流水线已经在前一步完成了严格的 `pod spec lint`，后续 `pod repo push` 默认再次 lint 会重复下载和编译，增加失败面与耗时。在已有独立 lint 证据的前提下，push 阶段可使用 `--no-lint`；不能在没有任何 lint 的情况下直接跳过。发布链路应将「校验」和「写入 Specs」分开，失败位置更清晰，也便于安全重试。

## 12. Ruby / CocoaPods 环境混用

系统 Ruby 2.6 与 RVM Ruby 3.4.10 混用会导致 gem、Bundler、CocoaPods 路径不一致。本项目应固定使用 RVM Ruby 3.4.10、对应 Bundler 与项目约定的 CocoaPods 命令。

调试时要同时输出 `ruby -v`、`which ruby`、`bundle -v`、`pod --version` 和 `which pod`。

## 13. Podfile.lock 与 ugreenhome 接入

不要手工编辑 `Podfile.lock`；修改 Podfile 后必须通过项目标准安装流程重新解析并生成锁文件。ugreenhome 同时升级 Runtime 和 Lottie，避免锁文件仍指向旧版本或旧 source。接入 MR 至少应验证：Podfile、Podfile.lock、Specs source、干净安装、编译目标与依赖版本完全一致。

## 14. 验收边界：绿色 CI 不等于端到端完成

证据必须分别收集，不能互相替代：

1. 构建：Runtime 真机产物成功生成；
2. 上传：制品上传成功且 URL 可访问；
3. Specs：Podspec 已推送到正确 Specs 仓库和分支；
4. 解析：Consumer / ugreenhome 能通过干净 `pod install` 获取新版本；
5. 编译：Consumer 与宿主工程能编译通过；
6. 运行：真机启动与关键 RN 功能验证通过。

手动 job、绿色普通流水线或单独 Tag 都不能替代完整发布验收。

## 发布检查清单

- 相关 MR 已合并到 main，工作区与远端 main 一致；
- 版本号、Podspec、依赖版本和 Tag 一致，旧 Tag 不移动；
- Protected Tag 与 CI/CD Variables 对发布 job 可见；
- 单元测试、Runtime 真机构建、Consumer pod install 与编译通过；
- artifact 范围仅包含发布所需真机产物，大小低于 GitLab 限制；
- 上传完成后生成并校验 download URL；
- 独立 lint 通过，再以 `pod repo push --no-lint` 写入 Specs；
- 从 Specs 做一次干净安装，确认解析到新版本；
- 宿主项目更新 Podfile.lock，并完成真机运行验证；
- 确认流水线、制品、Specs 与 Tag 均可追溯后，发布才算完成。

## 安全提醒

不要在 Podspec、仓库、CI 日志、MR 描述或备忘录中保存 Token 明文。任何曾暴露的凭据都应撤销并重新生成，并按最小权限、有效期、Protected 与 Masked 原则配置。

## 名词补充

- **Protected Tag**：GitLab 中受保护的 tag，只有特定角色能创建 / 推送，常配合 CI 规则限制发布触发，避免随意打发布 tag。
- **pod spec lint / pod repo push**：前者校验 Podspec 的语法、源码与构建正确性；后者把通过校验的 Podspec 写入私有 Specs 仓库，使 `pod install` 能解析到该版本。`--no-lint` 用于已有独立 lint 证据时跳过重复校验。
- **XCFramework**：苹果推荐的跨平台 / 多架构二进制分发格式，可同时包含 device 与 simulator slice；本文通过只保留 device slice 规避上传体积限制。
