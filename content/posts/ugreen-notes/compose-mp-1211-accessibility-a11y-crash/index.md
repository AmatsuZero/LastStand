---
title: "Compose Multiplatform 升级到 1.12.1 修 iOS 无障碍崩溃及配套依赖"
date: 2026-11-19T10:25:04+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "依赖", "KotlinMultiplatform", "构建"]
---

## 现象（symptom）

iOS 自动化测试中主线程崩溃 `EXC_BAD_ACCESS / SIGSEGV`，访问地址是 `0x8`（或同类 `0x18`），栈顶为：

```
-[CMPAccessibilityElement accessibilityFrame]
  -> AccessibilityElement.bounds (Accessibility.uikit.kt)
  -> -[NSObject(AXPrivCategory) _iosAccessibilityAttributeValue:]
  -> _handleNonMainThreadCallback   <- 系统 AXServer 进程经 Mach IPC 异步查询
```

同类还可表现为 `accessibilityTraits`（`Accessibility.ios.kt`）读取崩溃。触发条件：节点在重组、导航或滚动中已被拆除，UIKit 仍持有旧的 `CMPAccessibilityElement` 去问 frame，读到一个已失效对象的偏移字段。

## 已验证成因（verified cause）

- 对应 JetBrains 已知问题 compose-multiplatform#5543。
- CMP 1.11.1 的 `AccessibilityElement` **属性 getter**（`bounds`、`accessibilityTraits` 等）没有 `isAlive` 守卫，直接访问 `node.*`；而动作类 getter（如 `accessibilityActivate()`）已有守卫，属于同一类遗漏。
- 官方修复分两步落地：
  - CMP 1.12.0：`Fix rare crash that occurs when iOS accesses a disposed AccessibilityElement`（PR #3214）
  - CMP 1.12.1：`Fix crash when iOS reads AccessibilityElement's properties after disposal`（PR #3403）
- PR #3403 把 `isDisposed` 标记下沉到 ObjC `CMPAccessibilityElement`（`dealloc` 时置位），Kotlin 侧 `isAlive` 改为 `!isDisposed && node.semanticsNode.isValid`，陈旧元素返回安全默认值而不再解引用已释放节点。

## 有效恢复（effective recovery）

升级到 Compose Multiplatform **1.12.1**，并按官方 release notes 同步配套版本（KMP 工程需在 `gradle/libs.versions.toml` 显式声明，勿依赖传递解析）：

| 依赖 | 旧 | 新 |
| --- | --- | --- |
| compose-multiplatform（插件 + runtime/ui/foundation 等） | 1.11.1 | 1.12.1 |
| org.jetbrains.compose.material3:material3 | 1.11.0-alpha07 | 1.12.0-alpha03 |
| org.jetbrains.androidx.lifecycle:* | 2.11.0-beta01 | 2.11.0 |
| org.jetbrains.androidx.navigation:navigation-compose | 2.9.1 | 2.10.0-beta01 |

不需要跟着改的：

- `androidx.activity` / `androidx.fragment` / `androidx.browser` / `androidx.startup`：Android-only 构件，不与 Compose 版本绑定。
- Kotlin（含 `org.jetbrains.kotlin.plugin.compose`）：Compose 编译器插件只要求与 Kotlin 插件同版本，CMP 1.12.1 不强制升 Kotlin。

本地验证（确认升级在依赖与编译层生效）：

- Gradle 9.4.1 + JDK 21 下 `./gradlew help` 配置通过。
- `./gradlew :core-ui:dependencies` / `:core-navigation:dependencies` 解析出 `runtime/ui/foundation:1.12.1`、`material3:1.12.0-alpha03`、`lifecycle-*:2.11.0`、`navigation-compose:2.10.0-beta01`。
- `:core-ui:compileAndroidMain`、`:core-navigation:compileAndroidMain` 均 BUILD SUCCESSFUL（证明新版本 API 与现有源码兼容）。
- 新版本构件在 Maven Central / Google Maven 均返回 HTTP 200。

## Android 端连锁：compileSdk 必须升到 37

- 现象：CI `verify-android-main` 编译失败，AGP 报 `Dependency 'androidx.compose.ui:ui-android:1.12.1' requires ... compileSdk 37 or later`，而项目当前 `android-36`。Compose 1.12.1 / lifecycle 2.11.0 的 Android 构件硬性要求 compileSdk≥37。
- 恢复：`gradle/kmp-library.gradle` 两处都改——`useAndroidLibraryApi` 分支的 `compileSdk = 36` 改 37；else 分支的 `compileSdk { version = release(36) }` 改 `release(37)`。默认 `useAndroidLibraryApi=false`，所以两处都要改。
- CI 配套：固定 SDK Docker 镜像只含 android-36，需在 job 的 before_script 按需 `yes | sdkmanager "platforms;android-37.0"`。注意 sdkmanager 的包名是 `platforms;android-37.0`（不是 `android-37`），装出的目录是 `platforms/android-37.0`；AGP 9.x 的 `release(37)` / 数值 37 能识别该目录，`android.jar` 校验也要同步从 android-36 改 android-37.0。
- 验证：`./gradlew :app-shared:assembleAndroidMain -Pugreen.enableIos=false` BUILD SUCCESSFUL（CI 同款命令，本地用 android-37.0 目录）。
- 规则边界：该仓库的 `.gitlab-ci.yml` / `scripts/tests/**/*` 属于 `release_ci_infra_changes`，改动它们会命中 verify-android-main 的 `when: never`——含 CI infra 改动的 MR，其 pipeline 不跑重型 Android 编译 job，只跑契约测试。因此这类 MR 的 Android 编译只能靠本地按 CI 同款命令验证。

## iOS 端 CI：Nexus 冷缓存超时

- 现象：`verify-ios-release` 下载 `ui-iossimulatorarm64:1.12.1.klib` / `material3-iosarm64:1.12.0-alpha03.klib` 从内网 Nexus `maven-public` 报 `Read timed out`，而 Maven Central 同名构件 HTTP 200。
- 成因：新版本 klib 首次进入 Nexus 代理需回源，实测首次回源耗时约 46s，超过 Runner 的 HTTP 读超时；构件落缓存后续请求 0.4s。
- 恢复：确认构件在 Nexus 已缓存（重试 200）后重跑 job 即可，无需改代码或版本。判定方法是分别测 Nexus 与 Maven Central 的同坐标 HTTP 状态——Central 200 而 Nexus 000/超时即冷缓存，不是缺件。

## 边界（boundaries）

- **本地无法验证崩溃消失**：该崩溃是 AXServer 异步查询与节点析构的竞态，本机无法确定性复现；修复有效性依赖官方 release notes 与 PR diff，合入后须在真机开启 VoiceOver 做回归。
- 本机 PATH 里的 `java` 不可用，但 Gradle 缓存目录 `~/.gradle/jdks/` 下有 JDK 21，用 `JAVA_HOME` 指向它即可跑 Gradle。
- 在 worktree 里跑 Gradle 前，必须先 `git submodule update --init --recursive` 初始化嵌套的 strings 子模块，否则配置阶段报 `Configuring project '...' without an existing directory is not allowed`。
- 内网 GitLab 域名在 `no_proxy` 列表中时直连会 SSL_ERROR_SYSCALL / EOF；git / glab 需临时清空 `NO_PROXY` 并显式走本地代理。

## 证据（evidence）

- JetBrains Compose Multiplatform 1.12.0 / 1.12.1 release notes（iOS fixes：#3214、#3403）
- compose-multiplatform-core PR #3403 diff（`CMPAccessibilityElement.isDisposed` + `Accessibility.ios.kt` 的 `isAlive`）
- JetBrains Compose compatibility / versioning 官方页的 Jetpack Compose 配套表
- Kotlin Multiplatform compatibility guide 的 Kotlin/AGP/Gradle 对应表
- 本地 Gradle 依赖解析与 `compileAndroidMain` 输出
