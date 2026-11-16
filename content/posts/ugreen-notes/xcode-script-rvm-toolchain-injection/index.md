---
title: "Xcode script phase 下 KMP synthetic pod 的 Ruby 环境串味与 RVM 注入"
date: 2026-11-16T14:25:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CocoaPods", "Gradle", "Xcode", "KotlinMultiplatform"]
---

## 现象（symptom）

宿主 App 的 `make pods`（KMP 本地源码模式）偶发失败，Xcode 构建日志：

```
:core-udc:podInstallSyntheticIos FAILED
Executing of '<home>/.rvm/gems/ruby-3.4.11/bin/pod install' failed with code 1
can't find gem cocoapods (>= 0.a) with executable pod (Gem::GemNotFoundException)
  /System/Library/Frameworks/Ruby.framework/Versions/2.6/.../rubygems.rb
  <home>/.rvm/gems/ruby-3.4.11/bin/pod:25:in `<main>'
```

失败机器上 Homebrew 与 RVM 各装了一份 CocoaPods、PATH 里有多个 `pod`。

## 已验证成因（verified cause）

三个条件叠加才触发，缺一不可：

1. `podExecutablePath` 被固化成 RVM 的 pod 绝对路径。Kotlin CocoaPods plugin 的 `AbstractPodInstallTask.podExecutablePath` 来自 gradle property `kotlin.apple.cocoapods.bin`，可由 `local.properties`（被 gitignore、每机本地）或命令行 `-P` 注入；plugin 缺 pod 时官方报错还直接教 `echo "kotlin.apple.cocoapods.bin=$(which pod)" >> local.properties`。本地 shell 里 RVM 激活时 `which pod` 命中 RVM pod，被写进该文件后长期残留。
2. wrapper 被绕过。KMP 模块 build.gradle.kts 里 `if (podExecutablePath.orNull == null)` 才注入宿主 wrapper `bundled-pod.sh`；外部一旦给值，synthetic install 直接跑裸 pod 绝对路径（日志里 wrapper 文件名出现 0 次是直接证据）。
3. Xcode script phase 的 PATH 没有 RVM 的 ruby bin。RVM pod 是 binstub，shebang `#!/usr/bin/env ruby`，`env ruby` 在 Xcode 的 PATH 下回退到 `/usr/bin/ruby`（系统 2.6），系统 rubygems 里没有 cocoapods gem，报 `can't find gem cocoapods`。

光「多个 pod 共存」不构成根因：机器上即使只有 RVM pod 也会炸；反过来若选中的是 Homebrew pod（在 Xcode PATH 里、走 Homebrew ruby），反而不报这个错。但切到 Homebrew pod 不是正确修法——那不是项目锁定的 RVM 依赖，版本还可能与锁文件不一致。

注意与另一种失败模式区分：独立/无宿主 checkout（没有宿主 `iot/`、`Tools/ios-ci/`）走 `bundled-pod.sh` 硬校验宿主 Gemfile/JDK 报「找不到 Swift 宿主 Gemfile」，那是另一个问题（已有独立 MR 修复），错误指纹与本例不同。

## 有效恢复（effective recovery）

不破坏 plugin「显式配置优先」的内部逻辑，改用脚本层覆盖——在 Xcode script phase 调用的宿主 wrapper（如 `Tools/ios-ci/xcode-sync-shared-framework.sh`）里，`exec gradlew` 前 `source` 锁定 Ruby 环境脚本（`iot/fastlane/ruby_env.sh`）激活 RVM 3.4.11，让 pod/ruby 子进程解析到 RVM 工具链：

```sh
RUBY_ENV="$REPO_ROOT/../../iot/fastlane/ruby_env.sh"
if [ -f "$RUBY_ENV" ]; then
  export UG_REQUIRE_PINNED_RUBY=true
  . "$RUBY_ENV"
fi
exec "$GRADLEW" "$@"
```

关键点：

- **wrapper 的 shebang 必须是 bash**（`#!/usr/bin/env bash`）。RVM 脚本开头 `#!/usr/bin/env bash` 且显式「prevent from loading in sh shells」：`/bin/sh -c` 下 source RVM 后 `declare -F rvm` 取不到函数（`rvm: command not found`），bash 下才能正常加载。这是最易漏的一环——实测时若用 bash 跑探针会误以为方案成立，必须用真实的 `/bin/sh` 调用路径复现。
- `[ -f "$RUBY_ENV" ]` 守卫兼容 standalone checkout：无宿主 `iot/` 时跳过 source，由 `bundled-pod.sh` 的 standalone 分支兜底 pod 发现。
- 不要去改 KMP 模块 build.gradle.kts 的 `orNull == null` 守卫（那会改变 plugin 的显式配置语义），也不要把 pod 路径钉成 Homebrew 那份。

## 边界（boundaries）

- 最小 Gradle 实验用 `env -i` 模拟 Xcode 干净 PATH + 项目 managed JDK（本机无系统 Java，须注入 `JAVA_HOME`）。三种环境实测：纯 Xcode PATH → 子进程落系统 Ruby 2.6.10 且 `pod: command not found`（精确复现）；脚本内 source RVM → pod/ruby 解析到 RVM 3.4.11；**source RVM + Gradle daemon 复用（Xcode 真实场景）仍拿到 RVM 环境**——daemon 环境固化不是障碍，客户端注入的环境会传给 daemon 起的 pod 子进程。
- `UG_REQUIRE_PINNED_RUBY=true` 走 fail-closed 分支，要求锁定 Ruby 3.4.11 与锁定 Bundler 预装；本机/CI 按约定预装则通过。
- 端到端真机/Xcode 构建未在复现污染环境的机器上验证；合入后须在该机器用 KMP_DEBUG 源码模式的 `make pods` 实测。

## 证据（evidence）

- 日志中 `:core-udc:podInstallSyntheticIos` 的报错栈含系统 Ruby 2.6 `rubygems.rb` 与 RVM 目录下 pod binstub 第 25 行，且 wrapper 文件名出现 0 次（被绕过）。
- Kotlin CocoaPods plugin 2.4.0 反编译（`unzip -p <kotlin-gradle-plugin jar> | strings | grep`）命中 `podExecutablePath`、`kotlin.apple.cocoapods.bin` 与提示串 `echo "kotlin.apple.cocoapods.bin=$(which pod)" >> local.properties`。本机无 Java Runtime，`javap` 不可用，用 `strings` 取证即可。
- RVM 脚本的 shell 检查：分别在 `/bin/sh` 与 `/bin/bash` 下 `source ~/.rvm/scripts/rvm` 后 `declare -F rvm`，前者 NOT FOUND、后者 FOUND；wrapper shebang 改 bash 后探针在 Xcode 干净 PATH 下解析出 ruby 3.4.11 / pod 1.17.0。
- 修复附带的两个单测分别覆盖「宿主 checkout source 激活 RVM」与「standalone 跳过 source」，5/5 通过。
