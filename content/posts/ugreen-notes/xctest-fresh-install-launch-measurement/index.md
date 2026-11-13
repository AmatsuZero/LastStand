---
title: "XCTest 启动测量：一次迭代不等于一次全新安装启动"
date: 2026-11-12T17:00:37+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "CI/CD", "踩坑"]
---

## 现象（symptom）

启动性能方案要求每个样本都先重新安装 App，再且仅启动一次，并将“固定 mock 设备卡片可见、可点击”作为业务终点。

最初计划使用 `XCTApplicationLaunchMetric`，把 `XCTMeasureOptions.iterationCount` 设置为 1，以为能同时满足一次进程启动和系统首帧采集。检查实际安装的 XCTest 公开头文件后，发现这个假设不成立。

## 已验证成因（verified cause）

本次安装工具链的 `XCTMeasureOptions.h` 对 `iterationCount` 明确说明：

> Note that the block is actually invoked `iterationCount` + 1 times, and the first iteration is discarded.

因此，`iterationCount = 1` 不能保证测量块只调用一次。如果块内调用 `app.launch()`，就不能把这个配置当作“恰好一次 App 启动”的证明。后续启动也可能受到首次运行创建的状态影响；具体进程和缓存行为仍要用运行证据确认。

这是本次工具链头文件证明的调用契约，首次审计时尚无真机轨迹量化额外调用的耗时或影响。其他 XCTest 版本应核对其文档和实际行为，不能把本次发现扩大为所有性能 API 的固定实现。

后续保留数据的有界试验将首个 block 留空，只在第二个 block 显式 launch 一次。实际观察到 block 调用两次、launch 调用一次，且 xcresult 成功导出单个 `com.apple.dt.XCTMetric_ApplicationLaunch-AppLaunch.duration` 值。空预热块在该工具链上没有导致测量报错，但这只是候选来源：测试日志在 launch 时仍有已有目标进程，metrics 行只提供测试、设备、配置身份，没有 App PID 或业务 sample。

[Apple 的默认 initializer 文档](https://developer.apple.com/documentation/xctest/xctapplicationlaunchmetric/init()) 还说明它包含 extended launch tasks；仅当没有通过 MetricKit 扩展启动测量时，才只测到首帧。因此，指标名字里含 AppLaunch 及单个非空数值，均不能独立证明 non-extended 首帧语义或全新安装状态。

[带 `waitUntilResponsive` 的 initializer 文档](https://developer.apple.com/documentation/xctest/xctapplicationlaunchmetric/init(waituntilresponsive:)) 明确说明：`false` 同样等待首帧与扩展启动任务完成。它控制的不是“是否包含扩展任务”，不能把 `false` 当成 non-extended 首帧的证明。本地头文件的简短注释没有展开这一边界，需同时核对当前官方文档。

MetricKit 的 `addSubscriber` 订阅和扩展启动 API 是两种行为。只有看到 `MetricKit` 依赖或 `MXMetricManager` 符号，不能断言启动时间已被扩展。最终 Mach-O 镜像可检查旧 Objective-C selector `extendLaunchMeasurement` 与新 Swift `trackLaunchTask` 的普通编译引用；静态依赖已链接入主可执行文件，应一起检查。这样的静态扫描不证明任意运行时拼接 selector 不存在，不能在引入反射、外部 native 代码或新增 API 后继续照搬旧审计结论。

还要区分命令行的测试重复与性能块迭代：Xcode 27.2 的真实 `xcodebuild test-without-building -test-iterations 1` 在启动前报错 `Must specify -test-iterations with more than 1 iteration.`。该参数用于重复测试；运行唯一所选用例一次时使用默认值，不传这个参数，也不启用失败重试。

有意让设备断言失败时，还观察到 Xcode 派生 `devicectl diagnose` 收集整机诊断，用例已结束但结果包迟迟未完成。尚未落盘 `Info.plist` 的 `.xcresult` 不能由 xcresulttool 正常读取；不能据此误判导出 schema 无效。

## 有效恢复（effective recovery）

专项用例暂时直接调用一次 `app.launch()`，由外部编排为每个样本执行独立的准备、卸载和安装。计时起点使用 UI 测试进程的单调时钟，在固定卡片可见、可点击时停止；详情导航在停止计时后单独验证。

该值命名为 `business_ready_ui_ms`，明确包含自动化等待与轮询开销。App 内从 AppDelegate 到列表就绪的事件保留在独立时钟域，只计算本域区间。

`system_first_frame_ms` 暂记为 unavailable。待找到并验证“与该次唯一启动对应”的系统采集来源后，再补齐首帧指标；不能用 UI 等待时间改名代替，不能把缺失指标填成 0，也不能把缺失系统指标的样本标成完整首帧基线。

后续接入采集来源时，需要保存原始指标身份、单位、样本映射和启动次数证据。只看到一个非空数字，不足以判断它属于哪次启动或是否包含预热。

有明确样本超时预算的采集任务可传 `-collect-test-diagnostics never`，保留主动添加的截图、事件及控件树附件，避免失败时额外收集整机 sysdiagnose。该选项及其 `on-failure|never` 取值已用本机 `xcodebuild -help` 核对；这不改变测试失败结果，也不能使缺少事件的样本有效。

## 边界（boundaries）

- 用例中只有一个显式 `app.launch()`，不等于已经证明外部 XCTest 编排没有额外启动或安装；还需真机进程与安装证据。
- 卸载重装通常重置 App 沙盒，不代表清除了 Keychain、第三方 SDK 私有持久化、系统缓存或运行时缓存。状态范围未查清时，应拒绝“无业务缓存”有效样本声明。
- `launch.app_delegate_begin` 是 AppDelegate 入口，不是 `main`，也不包含 pre-main。不同进程的时钟不能直接相减来推导 pre-main。
- 设备列表响应收到、模型绑定或 cell 创建均不能单独证明页面可交互。App 内 readiness 还需 UI 可见、可点击与导航断言验证。
- 本次调整保住了单次显式启动设计，但首帧采集与真机 fresh-install 验收仍是待办，不能记成已解决全部启动测量问题。

## 证据（evidence）

2026-11-12，读取安装工具链的 XCTest 公开头文件，确认上述 `iterationCount + 1` 说明；专项测试源码因此不使用标准 `measure` 块。

调整后的 App 与 UI test target 已完成 unsigned `StartupProfile build-for-testing`。记录器、readiness 和精确范围准备逻辑的 macOS 源码测试 harness 31 项通过，但这类单元证据不证明真机启动次数、首帧指标或 Keychain 重置已经通过。

本文归档的是测量契约纠正与当前验证边界，没有给出真实设备启动速度、劣化阈值或真机成功结论。

2026-11-13 的空预热块试验完成签名优化构建及 1 项真机用例。原始 metrics 与计数附件验证了上述候选行为；没有执行状态重置或全新安装，也未将候选值接入普通首帧解析器。临时用例已精确撤回，结论保留为候选已观察、验收未通过。

2026-11-13 在新优化构建的有界 UI 验收中复现 `-test-iterations 1` 的启动前错误，移除后实际运行 1 项测试。该测试捕获了卡片已可点击而 App readiness 缺失的失败，继而观察到 Xcode 的整机诊断子进程。只停止本次任务精确归属的该子进程后，结果包完成并成功导出附件；未停止其他会话或设备进程。适配器回归分别验证默认单次执行和关闭附加整机诊断，均先失败再通过。

2026-11-13 再次读取 Apple 上述两个 initializer 的 DocC JSON，确认默认值与 `waitUntilResponsive=false` 的扩展任务语义。用同一工具链优化编译旧 Objective-C 和新 Swift API 探针，两种调用均可在编译产物中检出对应标识；这是扫描机制验证，尚不能代替真实新安装首帧验收。

同轮两次 UI 测试在执行用例前报 `Timed out while enabling automation mode.`。设备截图直接显示“为 XCTest 输入设备密码 / Enable UI Automation”，确认本次阻塞为系统等待设备持有人授权。仅看 CoreDevice 连接正常及 `passcodeRequired=false` 不足以排除该授权页。应由持有人直接在设备输入密码；日志只保留脱敏错误码，不收集密码、不绕过系统确认。尚未观察授权后的恢复结果，不将重试、重启或锁定状态查询写成已验证修复。

### 可选指标生命周期不能无条件转发

后续同日，设备持有人完成密码授权后，三次精确范围状态准备均实际通过。但启动测量用例在测试 runner 内崩溃，原始错误为 `-[XCTApplicationLaunchMetric willBeginMeasuring]: unrecognized selector sent to instance`。这是指标包装层错误，与设备授权超时属于两个不同阶段，不能继续归因为设备未授权。

当前安装工具链的公开 `XCTMetric.h` 将 `willBeginMeasuring` 和 `didStopMeasuring` 声明在 `@optional` 下。Swift 对具体 `XCTApplicationLaunchMetric` 类型接受直接调用，并不保证运行时对象实现了该 selector。将系统指标保存为 `any XCTMetric`，使用 `metric.willBeginMeasuring?()` 和 `metric.didStopMeasuring?()` 转发，才能保留协议的可选调用语义。必需的 `reportMeasurements` 仍原样转发，未替换、合成或修改系统测量值。

回归从实际交付源码提取包装类，链接本机真实 XCTest 运行库，执行生命周期调用及复制实例调用。修复前重现同一个 Objective-C 异常，修复后通过。该回归证明本工具链上的生命周期兼容性；不代替真机新安装、启动次数、页面可交互或系统首帧验收。不同 XCTest 版本仍需运行验证。
