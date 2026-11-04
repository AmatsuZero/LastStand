---
title: "Crash 收集治理：从吞异常到 iOS 27 CrashReportExtension"
date: 2026-09-17T17:33:05+08:00
categories: ["绿联工作笔记"]
tags: ["iOS", "Crashlytics", "Bugly", "崩溃", "CrashReportExtension"]
aliases: ["/posts/crash-collection-governance/"]
---

## 现状：崩溃根本送不到后台

### P0 — 崩溃根本送不到 SDK

**1. UHAvoidCrash 把 NSException 吞了（最严重）**

`AppDelegate.swift:48` 无条件调用 `AvoidCrash.makeAllEffective()`。它 swizzle 了 `NSArray` / `NSDictionary` / `NSObject` 系列方法并包在 `@try/@catch` 里，异常被捕获后只发一个 `AvoidCrashNotification`，永远不会走到任何 uncaught exception handler。数组越界、插 nil 这类 iOS 最高频的崩溃，Bugly 和 Crashlytics 都收不到。`AppDelegate.swift:182` 的弹窗还是 `#if UGDEBUG` 门控的，线上连痕迹都没有。

**2. UGLog 装了不链式的 uncaught handler**

`UGLog.swift:212` 的 `NSSetUncaughtExceptionHandler` 在 `AppDelegate:61` 安装，捕获后只写日志、不转发给前一个 handler。它是三者中最早装的，所以实际会被 Crashlytics / Bugly 覆盖；但 Bugly 在 `AppDelegate:274` 最后启动，它是否把 handler 链回 Crashlytics，源码里看不出来。这意味着 Crashlytics 可能整条链路被 Bugly 顶掉。这个必须实测：Release 包强制崩一次，同时看两个后台。

### P1 — Bugly 数据基本不可用

**3. Bugly 没有 dSYM 上传**：全仓库只有 `${PODS_ROOT}/FirebaseCrashlytics/run`（`project.pbxproj:692`），没有任何 buglySymbol / 上传脚本。Bugly 上的堆栈会是纯地址。

**4. Beta 包两边都没符号**：`Fastfile:323-347`，`configuration == "Beta"` 时 `uploadSymbols = false`、`include_symbols: false`、`xcargs DEBUG_INFORMATION_FORMAT=dwarf`。Beta / TestFlight 崩溃两个平台都是未符号化的。

**5. Bugly 用户值写在 start 之前**：`AppDelegate:74` → `UGAppConfigManager:660`（current_country）、`AppDelegate:80` → `UGUserManager:484`（user_id），都早于 `AppDelegate:274` 的 `Bugly.start`。而且 `BuglyManager.swift:26` 还 `async` 到串行队列。`setUserValue` 在 start 前调用基本是 no-op，冷启动设的这两个值大概率丢了。

### P2 — 双跑本身的代价与一致性

**6. Crashlytics 零上下文**：全仓库没有 `setUserID` / `setCustomValue` / `record(error:)` / `.log()`，唯一调用是 `AppDelegate:99` 的 `didCrashDuringPreviousExecution()`。Bugly 有 4 个自定义字段，Crashlytics 一个没有——两边无法按用户关联，等于白交一份数据。

**7. 隐私合规不一致**：`AppDelegate:58` 的注释明确说「Bugly 启动延迟到协议同意后」，但 `FirebaseApp.configure()`（`:97`）在 `didFinishLaunching` 里无条件执行，早于协议同意。Firebase 这套违背了你们自己的策略。

**8. `performNetworkOperations()` 没有 once 保护**：`agreementAccepted` 有两个发送点（`UGAgreementViewController:236`、`UGSharedRootCoordinator:253`），重复触发会导致重复 `Bugly.start` 和重复的 `fetchCountryList` / `startConfig`。

**9. 死代码地雷**：`CrashHandler.swift` 的 `setupCrashHandler()` 从未被调用，但里面 `exit(signal)`（`:73`）不恢复默认 handler 也不 re-raise——谁哪天接上，信号类崩溃上报直接全废。`AppDelegate:46` 的注释说它设置了 SIGPIPE 也是错的。

**10. 杂项**：`FirebasePerformance` 链接并自动启动但代码里从未使用，还拖进 RemoteConfig / ABTesting；`BuglyManager.swift:18` 注释写「开启卡顿检测」但值是 false（连带 `:19` 的 timeout 是死配置）；Firebase 10.29.0（2023-11）偏旧。

## 技术探索：iOS 27 的 CrashReportExtension

传统 iOS 崩溃捕获依赖进程内 signal handler：一旦应用崩溃，进程内存、锁、内存分配都可能处于损坏状态，常规 API 无法安全执行，第三方崩溃 SDK 只能依靠大量底层汇编代码绕开限制，维护成本极高。iOS 27 推出的 `CrashReportExtension` 提供**进程外**崩溃处理能力：主 App 崩溃后由系统独立拉起扩展进程，通过只读的 `CrashedProcess` 对象访问崩溃进程的现场信息，开发者可以在安全独立的进程中完成自定义崩溃分析。

### 核心 API 能力与边界

- 唯一入口是 `processCrashReport(process:)` 同步方法；
- 通过 `CrashedProcess` 可拿到 Mach 异常类型与错误码、加载的二进制镜像列表，还能直接调用内置接口完成地址符号化，支持展开内联栈帧，也能反向根据符号名称查询内存地址；
- 但高层 API 并不直接提供崩溃线程完整调用栈；想要读取线程寄存器、内存等更深层信息，只能使用 `corpsePort` 只读 Mach 端口，需要掌握 Mach IPC 底层编程。

### 工程落地最佳实践

扩展**只负责采集存储**，上报、重试等复杂逻辑交给主 App 处理：扩展捕获崩溃信息，构建精简的自定义崩溃数据包并保存到 App Group 共享目录，扩展任务到此结束。后续由主 App 正常启动后读取共享目录内的崩溃文件，补充面包屑、版本、渠道等业务元数据，再通过主 App 成熟网络模块完成上传，成功后清理文件。App Group 是扩展与主 App 共享文件的关键，需要两边同时开启并配置相同的安全组 ID。

### 定位与限制

- 它是对系统原生 `.ips` 崩溃报告的**补充而非替代**：原生 `.ips` 包含完整线程栈、寄存器、虚拟机信息，仍是深度复盘首选；`CrashReportExtension` 的价值在于设备端自定义处理（实时分类、生成适配自家后端的精简数据包、关联业务埋点面包屑）。
- 适合已有成熟诊断体系、自建崩溃后端的团队；普通独立开发者用原生崩溃报告搭配 MetricKit 就足够。
- 硬性限制：仅支持 iOS 27 真机，模拟器 / Catalyst / Apple Silicon Mac 运行的 iOS 应用都无法使用；扩展 Bundle ID 必须是主 App Bundle ID 的子标识；扩展进程生命周期极短，普通 `print` 不可靠，调试需依靠 `os_log` 在 Mac 端 Console.app 查看。扩展不能自动还原崩溃 App 内未持久化的业务对象状态，想记录崩溃前场景，必须在 App 正常运行阶段主动持久化面包屑。

## 名词补充

- **NSSetUncaughtExceptionHandler**：设置进程级未捕获 Objective-C 异常处理器；多个 SDK 各自安装时会相互覆盖，正确做法是链式转发前一个 handler，而非直接替换。
- **dSYM / 符号化**：崩溃上报的是内存地址，需配合编译时生成的 dSYM 符号文件才能还原为函数名与行号；不上传 dSYM，后台堆栈就是纯地址。
- **DEBUG_INFORMATION_FORMAT=dwarf**：仅生成 DWARF 调试信息但不生成 dSYM 包，导致无法离线符号化；发版构建应设为 `dwarf-with-dsym`。
- **CrashReportExtension / corpsePort**：iOS 27 新增的进程外崩溃分析扩展框架；`corpsePort` 是系统提供给扩展的只读 Mach 端口，用于深入读取崩溃进程内存。
