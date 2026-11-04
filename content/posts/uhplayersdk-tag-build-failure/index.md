---
title: "UHPlayerSDK 打 tag 打包失败复盘"
date: 2026-10-26T10:17:32+08:00
categories: ["绿联工作笔记"]
tags: ["iOS", "CI", "Xcode", "CompilationCache", "GitLabRunner"]
---

## 概述

10 月 26 日，UHPlayerSDK 打 `1.1.0.rc1` tag 时，动态库真机 archive 在 `PrecompileModule` 阶段失败，xcodebuild 退出码 65，甚至还没编到 SDK 源码。

根因是 CI 的每日缓存清理脚本按文件年龄逐个删除 Xcode 编译缓存，把仍被后续构建引用的系统 module 对象拆掉了。这破坏了按内容寻址（CAS）缓存的正确性——不是简单的缓存未命中。

本文记录现象、排查过程、根因，以及清理规则、发版 pin、launchd 路径三类修复。

## 现象

`1.1.0.rc1` 的 `release-ug-component` 流水线失败。同一流水线里：

- job 14862：`git fetch` 连接被重置（exit 128），属于网络抖动；
- 重试后的 job 14863：才是真正的构建失败。

失败点是动态库、真机 archive，xcodebuild 退出码 65，报错停在预处理系统 module：

```text
error: There was an error precompiling module .../ExplicitPrecompiledModules/_AvailabilityInternal-....scan
```

`_AvailabilityInternal` 是 Xcode SDK 里的系统 clang module。构建脚本把 xcodebuild 输出交给 `xcpretty` 美化，底层 clang 的详细诊断被滤掉了，所以第一眼看不到根因。

## 排查过程

先排除了几类常见怀疑：

- **源码没问题**：tag 指向的 `44b366aa` 与 10 月 23 日 MR !12 成功 archive 的是同一棵树；
- **依赖和工具链没变**：仍是 `RTCXSDK 1.7.0.7`、`libopus 1.1`，Xcode 仍是 26.5（17F42）；
- **发版改写不是原因**：podspec 仍是 `1.0.5`，发版脚本会改写成 tag 版本，`1.1.0` 当时也是这么改写后 archive 成功的；
- **磁盘/进程问题无关**：10 月 24 日磁盘写满（`No space left on device`）和随后的 `maxUserProcs` 耗尽是另一件事，UHPlayerSDK 当时并未写这份缓存。

真正定位靠一句话：**整份删掉 `compilation_cache/464` 再编就通过了**。说明问题在缓存本身，而不是源码或依赖。

## 根因

CI 从 10 月 17 日起，把每个工程的编译缓存放在 `builds/compilation_cache/项目id`，并打开 **explicit modules**。这是一套按内容寻址的缓存（CAS）：

- 每个编译产物对象以内容哈希命名；
- 后续构建会复用更早构建写入的系统 module 对象；
- 那些复用对象的 `mtime` 停在第一次写入时，之后不再更新。

每天 04:00 的 `runner-cleanup` 用 `find -delete` 删掉“超过 7 天的单个文件”。10 月 26 日 04:03 的 job 14859 删了 40190 个文件，缓存从约 40 GB 降到 19 GB。

问题在于：**旧对象被删，新对象还在**，缓存处于“半残”状态；下一次 archive 立刻死在 `PrecompileModule`——因为它引用的系统 module 对象已经不存在。

原清理脚本注释里写着「删旧对象只会造成缓存 miss，不会破坏正确性」，这个判断是错的：CAS 缓存的正确性依赖对象完整性，删掉仍被引用的对象不是 miss，而是损坏。

下图是失败链路：

<pre class="mermaid">
flowchart LR
    A[10-17 开启 Compilation Cache + explicit modules] --> B[每次构建复用更早的系统 module 对象]
    B --> C[对象 mtime 停在首次写入, 不再更新]
    C --> D[每日 04:00 find -delete 删超过 7 天的单文件]
    D --> E[旧对象被删, 新对象仍在, 缓存半残]
    E --> F[下一次 archive 在 PrecompileModule 失败]
    F --> G[xcodebuild exit 65]
</pre>

## 时间线（北京时间）

| 时间 | 事件 |
| --- | --- |
| 10-17 | Compilation Cache 和 explicit modules 开启 |
| 10-22 / 10-23 | UHPlayerSDK 1.1.0 发版、MR !12 archive 成功，缓存留下可复用对象 |
| 10-24 | runner 磁盘写满，随后模拟器进程把 `maxUserProcs` 打满（后续才补了磁盘清理和进程回收） |
| 10-25 04:03 | cleanup 删掉 15150 个超过 7 天的 CAS 文件 |
| 10-26 04:03 | job 14859 再删 40190 个文件 |
| 10-26 08:45 | tag 1.1.0.rc1，job 14863 archive 失败 |
| 10-26 09:02 | pipeline 6296 / job 14868 带一次性变量 `CI_CLEAR_COMPILATION_CACHE=true` 清掉项目 464 缓存后发布成功（变量未写入项目设置） |

## 处理措施

三类修复，分别落在不同仓库：

### 1. 清理规则（ci!105，合并 commit 74a8be6）

`runner-cleanup.sh` 和 `runner-disk-doctor.sh` 改为**只整份删除 `compilation_cache/项目id` 目录**：

- 目录里最新文件也超过 7 天才删；只要还有较新文件，更旧的对象一并保留；
- 某个项目近 10 分钟内有写入时，只跳过该目录。

### 2. 发版 pin（ugreenhome!190，合进 ci/runner-maint）

include ref 和两处 `RUNNER_MAINT_REF` 从 `d81a66e` 换成 `74a8be6`。

注意：04:00 的 Schedule 按这个 commit 拉脚本。Schedule 的 ref 是 `ci/runner-maint`，合进 `main` 不会生效——这是之前容易踩的坑。

### 3. launchd 路径（ci!106）

仓库里的 plist 原来写的是 `/Users/ugreen001/runner-cleanup.sh`，但该文件在 runner 上并不存在（实际在 `/opt/ugreen/ci/runner/`）。

- `com.ugreen.runner-doctor` 没有加载（uid 501），`com.ugreen.runner-cleanup` 有加载；
- 已在 runner 上把启动参数改成 `/opt/ugreen/ci/runner/runner-cleanup.sh`，并把 `/opt/ugreen/ci` 拉到 `main`；
- `PlistBuddy` 不在 PATH 里，改用 `plutil`；日志仍在 `/Users/ugreen001/runner-cleanup.log`。

ci!106 进一步把仓库两份 plist 指到 `/opt/ugreen/ci/runner/` 下的脚本，避免下次按 README 安装又写回家目录副本。

## 遗留：哪些缓存还需要清理

今早被按文件删过的项目缓存，新规则会因为“还有 7 天内的文件”而继续保留。这些目录在下一次 archive 前必须整份删掉，否则会和 UHPlayerSDK 一样失败。UHPlayerSDK（项目 464）已经清过。

下次打包前需要清 `builds/compilation_cache/项目id` 的组件：

```text
uhcore 421          uhfoundation 422    uhkit 423
Alamofire 328      AMPopTip 327        CocoaAsyncSocket 330
FCUUID 332         FSCalendar 333      GCDWebServer 334
JPImageresizerView 347  KakaJSON 349   Kingfisher 350
KingfisherWebP 351 lottie-ios 380      MJRefresh 353
MMKV 358           Moya 359            NSObject-Rx 360
RTRootNavigationController 361  RxDataSources 362  RxGesture 363
RxOptional 364     RxSwift 365         RxSwiftExt 366
RxViewController 367       SnapKit 368  SwiftyRSA 370
UICKeyChainStore 372    UITextView-Placeholder 373  ZIPFoundation 374
```

`UGKVStore`（371）和 `libwebp`（379）的缓存都是 10 月 20 日以后写的，今早没动到。`JXSegmentedView`、`SwifterSwift`、`IQKeyboardManager` 的缓存已整份过期。其余没在这台 runner 上打过包的组件没有这份缓存。

另外：`/opt/ugreen/ci` 要保持在 `main` 上，否则 03:30 的 launchd 会跑到旧脚本。

## 名词补充

- **Compilation Cache / Explicit Precompiled Modules**：Xcode 开启 explicit modules 后，系统及三方 framework 的 module 会被预编译成 `.pcm`/`.scan` 等产物并缓存，后续构建直接复用，省去重复解析头文件。其代价是缓存对象之间存在强引用关系。
- **CAS（Content-Addressable Storage）**：按内容哈希命名和寻址的存储。Xcode 的模块缓存即此模式——同名 module 的不同版本以内容区分，复用对象不会因时间推移而“刷新” mtime。
- **PrecompileModule**：xcodebuild 在编译前预编译 module 的阶段；一旦引用的预编译 module 对象缺失或损坏，会直接以 exit 65 失败，且被 `xcpretty` 过滤后只暴露一句 `error precompiling module`。
- **xcpretty**：把 xcodebuild 冗长输出美化的工具，默认会折叠 clang 底层诊断，排障时建议加 `-r`/`--report` 或临时直出原始日志。
- **`maxUserProcs`**：macOS 单用户进程数上限，模拟器批量启动容易打满，表现为构建无故卡死或新进程无法 fork。
