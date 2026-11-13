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

后续签名真机验证证明了上述边界：可选调用异常消失，App 已启动且找到设备卡片，但包装层转发 `reportMeasurements` 时，系统指标报 `Bad date range to search archive`，并因 `_startDate` 为空触发 `MXMOSSignpostMetric` 内部断言。因此，这个生命周期回归通过不能证明公开协议包装器能完整复用内置指标；具体内部日期设置机制尚未证实，不应调用私有方法补齐。

最终候选改为将原始 `XCTApplicationLaunchMetric` 直接传给 XCTest，再对同一个 `.xcresult` 使用公开的 `xcresulttool get test-results metrics --schema-version 0.5.0 --test-id <exact-test>` 读取原始指标。用同结果包内的 sample 回执、测试、配置、设备和单次测量建立关联；系统指标自身不携带业务 sample 或 PID。缺失、重复或身份不符一律拒绝，不能以聚合平均值、日志时间或另一轮结果补齐。本次公开工具 schema 与解析回归已验证，新的完整真机验收仍需另行确认。

### 最终本地真机验收

2026-11-13 随后的签名优化包验证中，三次精确范围准备和三次独立重装后的启动用例全部通过。直接使用原始指标并从同次结果包导出，得到三个有效的系统首帧值；样本回执同时确认测量块调用两次、首块不启动、总共只启动一次。每个样本均验证状态准备、重装后的受控状态缺失、首页可点击和后续详情导航，未再出现包装器的 selector 或空日期断言。

这补齐了上述“候选待验证”的本地设备证据：在本次工具链和最终包上，原生指标加同次公开导出可以满足受控新安装采样。回归解析器继续拒绝错误测试、配置、设备、指标身份、数量、单位及非正或非有限值；不能只校验字段非空。全部脚本回归 665 项通过，独立审查也重新运行并通过同一套回归。

同包另外执行的 Instruments 诊断成功捕获进程初始化、main 探针、首帧和业务就绪边界，并给出热点、dyld 操作及主线程区间。该诊断保留前序 App 数据且受到插桩，必须和普通 fresh 样本分别报告；不同来源的计时值不能相减来补齐 pre-main。普通新安装仍保留明确声明的设备标识 Keychain，并不表示全 Keychain 或系统缓存已清空。

此验收只证明本地签名设备流程。定时任务的功能套件、自动 Wiki 发布、制品上传和默认删除仍需单独核对 CI 结果；不能用本地六项用例通过替代每日任务完成证明。原始 trace、XML、符号和结果包在分析与发布完成后删除，结构化小报告保留。

## 失败取证：立即终止 XCTest 会绕过 Swift defer

每日采样有一次在等待 App ready 时超时。精确状态准备通过，同次 xcresult 保留了 XCTest 自动截图和控件调试信息，却没有测试主动添加的启动回执、UI 与事件 JSON。报告只能看到 missing_attachment，无法取得探针的具体拒绝原因。

已验证的控制流边界是 `continueAfterFailure=false`：断言失败会立即终止用例，Swift 的 defer 不保证执行，不能把关键失败取证只寄托在该 defer。用真实 Apple XCTest 运行库、同一等待 helper 和始终 pending 的 NSObject 查询复现，旧实现仍是 failed，但 defer 哨兵缺失。

有界恢复是让等待返回 Bool，超时时先将 continueAfterFailure 设为 true，再记录 XCTFail；两个调用方通过 guard 正常返回，不执行详情导航。这样保留失败结果，同时允许原 defer 执行 JSON 导出和终止。不要在外层 defer 前恢复立即中止策略，否则导出中的后续断言仍可能打断剩余清理。修复后同一运行库仍返回失败，导出哨兵存在，导航哨兵不存在。

这是等待失败路径的取证修复，不说明 App ready 缺失的具体生命周期或遮挡成因已解决。该小型运行库探针也不替代新签名真机的完整 App 导出验证；缺少事件时仍拒绝基线，不能靠放宽遮挡判断或把失败改成通过来恢复指标。

后续独立 iOS XCTest 运行时验证：用相同等待 helper 和始终 pending 的控件查询故意触发超时，xcodebuild 返回测试失败；同次 xcresult 的 summary 为 failed=1/passed=0，并成功导出 defer 中添加的 JSON 附件，未出现导航附件。该探针只验证失败控制流和附件导出，不代表完整 App 已支持模拟器。另一个签名优化 App 的六次独立重装和同包 retained 正常路径均通过，仍没有复现原来的偶发 ready 超时。

取证还必须覆盖比 ready 等待更早的断言：另一次自然失败出现在测量前 `.state != .notRunning`，旧代码没有保存原始枚举值，因此错误文本不能区分 unknown 和真实运行。仅在 ready 超时分支打开 continueAfterFailure 无法修补这条较早路径。后续将失败记录策略放到方法入口，并为所有后续 App 操作添加明确的 guard-return；原始状态只记录，不修改门禁。

真实签名设备的单独预期失败验收主动启动 App，再进入实际采样方法：同次结果包只记录一条预期的启动前门禁失败，四类 JSON（回执、UI、事件、沙盒）均导出；原始状态为4，stopped=false，blocks=0、launches=0，导航false。该主动造出的运行状态不说明前次自然失败也是4。负向验收后，另外三次独立 fresh 与同包 retained 正常路径通过。预期失败用例默认跳过，不加入普通性能样本。

附件导出成功还不足以保证日常可诊断：默认删除原始结果包时，回执若没有被 manifest 选定并进入小报告，原始状态仍会丢失。应在 UI 启动次数等后续门禁拒绝前，读取路径与样本身份已验证的回执，再以字段白名单保留观测；这不能产生任何性能指标。测量前即失败时，warm-up 后状态尚未被观察，必须保留缺失，不能填 unknown=0。真实签名 JSON 的离线报告验收确认：正常三次仍有效，主动制造的失败仍为零有效样本、无指标，但初始状态4可见；错样本、schema、类型和越界字段不发布，布尔值也不能被当成整数。旧实现对四个新增回归失败，修复后聚焦93项及全量671项通过；这是本地报告链路证据，尚不替代修改后每日任务的实际发布与清理验收。
