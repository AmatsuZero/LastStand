---
title: "GitLab 上 KMP 二进制的发布链路与踩坑"
date: 2026-09-22T14:12:53+08:00
tags: ["Kotlin Multiplatform", "iOS", "CocoaPods", "GitLab", "XCFramework", "CI/CD"]
categories: ["绿联工作笔记"]
aliases: ["/posts/gitlab-kmp-build/"]
---

## 背景

把 Kotlin Multiplatform 共享库以 XCFramework 形式发给 iOS 侧使用时，发布链路并不只是「编出来传上去」。它涉及 XCFramework 构建、二进制归档、私有 CocoaPods Specs 仓库、GitLab 包 registry，以及一连串的权限与凭据隔离问题。这里把一次完整发布踩过的坑整理成可复用的清单。

## 推荐发布链路

<pre class="mermaid">
flowchart LR
  A[构建 XCFramework] --> B[打包 ZIP + SHA256]
  B --> C[生成二进制 Podspec]
  C --> D[上传 GitLab Generic Package]
  D --> E[匿名下载并校验 ZIP/SHA]
  E --> F[pod spec lint]
  F --> G[push Podspec 到私有 Specs Git]
  G --> H[重新 clone / readback]
  H --> I[干净 Podfile 执行 pod install]
</pre>

## 名词解释

- **XCFramework**：Apple 的跨平台 / 多架构二进制分发格式，可同时携带真机与模拟器 slice。
- **Podspec**：CocoaPods 的依赖描述文件，声明版本、源码 / 二进制地址与校验和。
- **Specs 仓库**：存放 Podspec 的私有 Git 仓库，相当于私有 CocoaPods 源。
- **Generic Package Registry**：GitLab 提供的通用二进制包仓库，用来托管 ZIP 等任意产物。
- **Project Access Token**：GitLab 的项目级访问令牌，区别于个人令牌，可限定角色与权限范围。

## 1. 版本必须全链路一致

以下字段必须保持一致：Git tag、VERSION_NAME、Podspec 的 version、Package Registry 路径、ZIP 文件名、checksum sidecar 文件名，以及 Specs 路径（如 UgreenHomeShared/1.7.0.4/UgreenHomeShared.podspec）。

发布版本应视为不可变。一旦 ZIP 上传成功但 Specs 推送失败，**不要覆盖原版本**；用显式的 --resume 恢复，或者发下一个补丁版本。

## 2. Specs 仓库地址很容易写错

Specs 仓库地址少一个 .git 后缀，GitLab 可能返回类似认证失败的错误，容易误判为 Token 问题。建议发布前做 preflight：

    git ls-remote "${SPECS_REPO_URL}" HEAD

并尽量把「仓库不存在」和「凭据被拒绝」分开诊断。

## 3. Project Access Token 的 Role 与 Scope 是两层权限

Token 需要 Role: Maintainer，以及 read_repository / write_repository 两个 scope。Developer 令牌即便有 write_repository，若目标分支规则是「main → Allowed to push: Maintainers」，仍会被拒：

    GitLab: You are not allowed to push code to protected branches

优先把专用发布 Token 提为 Maintainer，不要把整个受保护分支开放给所有 Developer。

## 4. CI 变量配置

建议配置 SPECS_GIT_USERNAME=oauth2、SPECS_GIT_PASSWORD=<Project Access Token> 等。敏感变量应标记为 Protected、Masked，并限定 Environment scope 覆盖发布 Job，且不在日志打印、不写进 Podspec / remote URL / 构建产物。

修改变量后应创建新 Pipeline——GitLab 的 Retry Job 可能沿用原 Job 的参数和变量，不能用来验证刚更新的变量。

## 5. 不要用 .netrc 给同一 GitLab 主机注入 Specs 凭据

这是最隐蔽的问题。Specs Git 和 Package URL 往往在同一台 GitLab 主机上，例如：

    Specs:   http://gitlab-host/home/ios/ugreenhomespecs.git
    Package: http://gitlab-host/api/v4/projects/279/packages/...

如果写了：

    machine gitlab-host
    login oauth2
    password <Specs Token>

CocoaPods 下载二进制时用 curl --netrc-optional，会把 Specs 项目的 Token 也发到 Package URL，导致原本匿名可读的 Package 反而返回 403。

正确做法是用 path-scoped 的 Git credential helper，只对 home/ios/ugreenhomespecs.git 这一个仓库路径返回凭据，不影响同主机的 Package 下载：

    [credential]
        helper =
        useHttpPath = true

    [credential "http://gitlab-host"]
        helper = "!/tmp/specs-git-credential"

helper 内同时校验 protocol、host 与 repository path。

## 6. 二进制 Package 最好允许匿名读取

CI_JOB_TOKEN 只在当前 Job 有效，不能写进最终 Podspec。Podspec 里的下载地址需要让开发者和 CocoaPods 后续长期可访问，因此 Package URL 应匿名可读，或使用经批准的长期只读机制 / 镜像。

发布后必须做匿名回读，不要仅以上传返回 201 作为成功标准：

    curl --fail "${ZIP_URL}"
    curl --fail "${ZIP_URL}.sha256"
    shasum -a 256 ...

## 7. Device-only XCFramework 的 lint

为控制产物体积只发真机 slice（ios-arm64）时，XCFramework 的 Info.plist 应明确 SupportedPlatform = ios、SupportedArchitectures = arm64，且不要有 SupportedPlatformVariant = simulator。Podspec 没有「只支持真机」的独立字段，支持范围由 XCFramework 的 slice 元数据决定。

普通 pod spec lint 会尝试用 iPhone Simulator，导致：

    Unable to find matching slice in 'ios-arm64'

Device-only 产物应使用：

    pod spec lint       --private --allow-warnings       --platforms=ios       --skip-import-validation --no-ansi       UgreenHomeShared.podspec

pod repo push 同样加 --skip-import-validation --no-overwrite。

这不会伪装模拟器支持，只是避免 lint 强制进行不可能成功的模拟器链接。

## 8. pod repo push 不等于完整发布验证

成功 push 后还应：重新 clone Specs 仓库、确认远端 Podspec 存在且与构建产物中的 Podspec 完全一致、在空目录生成最小 Podfile、执行 pod install。例如：

    install! 'cocoapods', :integrate_targets => false
    source 'http://gitlab-host/home/ios/ugreenhomespecs.git'
    platform :ios, '15.1'
    target 'SpecsVerification' do
      pod 'UgreenHomeShared', '1.7.0.4'
    end

## 9. CocoaPods / Ruby 必须使用 UTF-8

Runner 没有 UTF-8 locale 时，Ruby / CocoaPods 可能报：

    Unicode Normalization not appropriate for ASCII-8BIT

发布脚本入口建议强制：

    export LANG=en_US.UTF-8
    export LC_ALL=en_US.UTF-8

不要把 CocoaPods 输出的 UTF-8 提示只当普通警告，某些路径最终会直接崩溃。

## 10. GitLab artifact 上传是独立故障域

构建多次成功，但 Runner 上传 artifact 时可能出现 use of closed network connection / EOF。判断依据：Gradle 已 BUILD SUCCESSFUL、失败发生在 upload_artifacts_on_success、同等大小的历史 artifact 上传成功、Retry 后返回 201。这种情况通常直接 Retry Job 即可；若连续发生，应检查 Runner 到 GitLab 的网络 / 代理 / 反向代理（body size、timeout）、Runner 版本与网络配置。它与 Podspec、Token 和编译结果无关。

## 11. 推荐的失败恢复策略

发布脚本建议支持两个显式模式：--publish-staged VERSION 与 --resume VERSION。

- 正常发布：要求远端 ZIP 和 checksum 都不存在，拒绝覆盖。
- Resume：只接受 ZIP 与 checksum 已存在、且内容与本地产物完全一致、已存在的远端 Podspec 内容也完全一致；拒绝只有 ZIP 或只有 checksum、checksum 不一致、同版本 Podspec 内容不同的情况。

这样可以安全恢复「Package 已上传、Specs 未完成」的中间状态。

## 快速排障表

| 错误阶段 | 最可能原因 |
| --- | --- |
| ls-remote 失败 | URL 拼错、变量未生效、Token 过期、凭据 helper 未命中 |
| clone 成功、push 被拒绝 | Token Role 低于 protected branch 要求 |
| Package 上传 401 / 403 | CI_JOB_TOKEN 权限不足 |
| Package 已存在 | 同版本重复发布或上次部分成功 |
| CocoaPods 下载 Package 403 | .netrc 凭据污染匿名下载 |
| lint 找不到 slice | Device-only XCFramework 被拿去做 simulator lint |
| UnicodeNormalize / ASCII-8BIT | Runner 未设置 UTF-8 locale |
| artifact upload closed connection | Runner / GitLab 网络或反向代理问题 |
| push 成功但 Job 最后失败 | 发布后 pod install / readback 验证失败 |

## 最重要的原则

1. Package 与 Specs 是两个独立发布步骤。
2. 版本不可覆盖。
3. 凭据必须按仓库路径隔离。
4. 发布成功必须包括远端 readback 和干净 pod install。
5. Device-only 产物不要伪造 simulator slice。
6. CI 红灯不一定意味着发布没发生；每次重试前先检查远端 Package 和 Specs 状态。
