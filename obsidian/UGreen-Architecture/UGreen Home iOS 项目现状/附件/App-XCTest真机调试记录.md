# App XCTest 真机调试记录

日期：2026-09-13。[Testing](../07-Testing.md) · [未改配置的补测基线](App-XCTest补测记录.md)

## 1. 当前结论：能运行，但未全通过

USB 真机可用。**在临时副本修正测试工程配置与编译兼容问题后，App XCTest 已能进入真机执行**；原项目没有应用这些修正，因此不能把副本结果写成原工作区已经修好。

| 项目 | 最终结果 |
|---|---|
| 设备 | iPhone 16 Pro Max / iOS 26.6.2；USB wired、paired、developer mode enabled |
| 配置 | `UgreenHomeTests` / Debug / iphoneos arm64 |
| 修正后的测试构建（未替换启动宿主、关闭签名） | **TEST BUILD SUCCEEDED，退出 0，65.78 秒** |
| 独立宿主签名构建 | **TEST BUILD SUCCEEDED，退出 0，103.42 秒** |
| 真机案例 | **419：396 通过、23 失败、0 跳过** |
| 失败分类 | 21 个断言失败案例 + 2 个崩溃案例；不是 23 条编译错误 |
| 最终执行命令 | **TEST EXECUTE FAILED，退出 65，231.17 秒** |

测试计数以最终 `.xcresult` 的 `get test-results summary` 为准。两次崩溃后 Xcode 重启宿主继续剩余案例；日志最后一段的 48 个案例不是全轮总数。231.17 秒包含部署、重启与结果收集，不是纯断言执行时长。

证据：[结构化真机结果](App-XCTest真机结果.json)、[419 个案例结果 CSV](App-XCTest真机案例.csv)。

## 2. 从构建阻断到可执行的修正

所有修改只发生在 `/private/tmp/ugreen-ios-xctest-20260913/source`：

1. **删除错误的跨 Target 源码归属。** 从 Tests 的同步组 membership 中移除 171 个 AIBase 产品源码。Tests 的 Swift 编译输入由 227 项恢复为 56 个测试文件；产品实现由 `@testable import UgreenHome` 引用，不再由 Tests 重复编译。
2. 单独完成第 1 步后，原先的 `RxSwift` 编译错误即消失。这修正了此前“缺搜索路径是唯一原因”的简化理解；搜索路径问题随后在链接阶段暴露。
3. **修正 7 个测试文件的编译兼容问题。** 包括可变 struct 夹具使用 `var`、超时 API 参数标签与 Optional 解包、显式 `UgreenHomeShared` import、`CheckedContinuation<Void, Error>` 类型、非 throwing 回调中显式失败断言、移除非 Optional 的可选链、先解包 parser 输入。没有删除测试、修改期望值或关闭失败断言；独立只读复核确认断言意图保留。
4. **修正 Pod target 继承。** 测试源码编译完成后，链接仍缺 `DeviceSetupSDK.UGProductCode.serialNo`、`RTCXDeviceInfo` 符号，伴随依赖 framework 搜索警告。将 Tests 嵌套到 App Pod target 内，保留 `inherit! :search_paths`，仅在副本执行 `pod install --no-repo-update`。解析后的 `PODS` 版本清单不变；lock 的 spec checksum 与 Podfile checksum 有变化。
5. 最终测试构建成功。没有修改产品逻辑去迎合测试，也没有继续修复下述 23 个运行失败案例。

[候选修正补丁](App-XCTest构建候选修正.patch) 覆盖 pbxproj、Podfile、Podfile.lock 及 7 个测试文件；已对原工作区执行 `git apply --check`，**未实际应用**。补丁不包含临时宿主、Bundle ID、签名、上传禁用等调研专用调整。后续应用时需要在源工程重新生成 Pods 并验证，不能把只应用补丁当作已完成集成。

## 3. 运行隔离与首次中止事件

为避免覆盖手机现有 App 或读取其业务沙盒，副本使用独立 Bundle ID `com.ugreen.archsurvey.xctesthost`，并以临时 `ArchitectureSurveyXCTestHost` 作为入口，只创建空白窗口；原 AppDelegate 不再是 `@main`，构建产物 Info.plist 移除了生产 SceneDelegate manifest 与 URL scheme，签名不包含原 App Group 权限。

**首次执行出现了一次启动目标错误，不能隐藏为成功隔离：**

- Xcode 生成的 `.xctestrun` 仍保留 `TestHostBundleIdentifier = com.ugreen.home`，虽然构建 App 的 Info.plist 已是独立 ID。
- runner 尝试启动手机现有 App，日志出现测试环境的自动请求，包括推送 token 注册及用户模块设置请求；未进入本轮 XCTest 案例执行。没有验证服务端处理结果，不能声称没有业务副作用。
- 发现后立即中止 xcodebuild；之后查询设备进程确认该次启动的进程已经退出，没有卸载或清除原 App 数据。设备查询确认原 App 与独立测试 App 是两个不同安装项。
- 修正独立 `.xctestrun` 的 `TestHostBundleIdentifier`，检查其已不再引用原 Bundle ID，再次执行。签名与 entitlement 检查需要在沙箱外完成；沙箱内的证书信任/entitlement 读取错误不能代替实际签名结论。

最终 419 个案例的结果只取自修正后的 `device-isolated-test-run.xcresult`，不合并首次中止记录。最终运行日志未出现前次正常启动/业务请求标记；这不等于对所有 SDK 网络行为做过抓包审计。即使空白宿主，已链接 SDK 的加载钩子和测试本身的本地读写仍可能执行，例如 Lookin 的本地监听。

原始日志可能包含账号凭据、推送 token 等信息，**不纳入笔记附件**；附件只保留去标识的统计和案例名称。

## 4. 失败分布与诊断边界

| 范围 | 失败案例数 | 已观察到的现象 |
|---|---:|---|
| FirmwareHostSnapshot | 2 | 事件变更判断、同设备重新绑定预期不符 |
| QRCode/share image | 1 | 像素尺寸与点尺寸预期不符：1125×1500 vs 375×500 |
| RTCXImageProvider | 4 | 子设备 SN 回退、picture ID 拼接预期不符 |
| Playback legacy adapter | 1 | 无效输入未按测试预期抛错 |
| AIBase overview | 3 | 高度 128.5 与预期 130 的容差判断不符 |
| HDMI config merge | 1 | 默认选择数量不符 |
| IPC network-info role | 1 | member / manager 角色预期不符 |
| Traffic management | 2 | 过期状态与剩余天数预期不符 |
| Image composition | 1 | 主题通知后的图片刷新预期不符 |
| Loop video | 2 | 本地 AVURLAsset / 主题视频资源预期不符 |
| Multi-track timeline | 4 | 2 个分页/轨道断言失败，另 2 个案例发生 nil unwrap 崩溃 |
| Vehicle plate validator | 1 | 8 字符输入边界预期不符 |
| 合计 | **23** | **21 个断言失败案例 + 2 个崩溃案例** |

两次崩溃都落在 `UGDeviceModel.swift:138` 的 `iotId` 回退路径，`wrappedRTCXDeviceModel.iotId` 的隐式 Optional 解包失败。案例名称和类型见 JSON/CSV。这里只定位崩溃点，没有判定最终修复应落在生产代码、测试夹具还是宿主初始化。

部分失败可能受屏幕 scale、区域/时间、资源加载或空白宿主初始化影响；另一些是源码行为与测试预期不一致。**本次没有逐项确认根因，不能把 23 项全部定性为线上缺陷，也不能把它们都归咎于隔离环境。**

## 5. 覆盖率：有数据，但不是全 App 业务覆盖率

由最终结果执行 `xccov view --report --only-targets --json` 得到：

| Instrumented target | Covered / executable lines | 行覆盖率 |
|---|---:|---:|
| `UgreenHome.app` | 8,295 / 405,194 | **2.05%** |
| `UHKit.framework` | 1,837 / 35,320 | 5.20% |
| `UgreenHomeTests.xctest` | 8,597 / 8,727 | 98.51% |

这是本轮修正副本、空白宿主、发生过崩溃的测试运行所收集的 Xcode instrumented target 行覆盖率；没有验证崩溃前覆盖数据是否全部保留，也不覆盖完整正常启动链和在线业务。不能把测试 bundle 的 98.51% 当作 App 覆盖率，不能把 App target 的 2.05% 当作 Native/KMM/RN 全栈业务覆盖率；它也不是业务功能覆盖率或通过率。

## 6. 复现入口与原项目保护

临时根为 `/private/tmp/ugreen-ios-xctest-20260913`。以下命令需使用已建立并核对身份的副本/产物；设备 ID 仅保存在本机，不写入笔记。

```bash
ROOT=/private/tmp/ugreen-ios-xctest-20260913
# 必须先核对 TestHostBundleIdentifier 与实际 App Info.plist 一致。
rtk proxy /usr/bin/time -p xcodebuild \
  -xctestrun "$ROOT/derived-device/Build/Products/IsolatedUgreenHomeTests_iphoneos26.5-arm64.xctestrun" \
  -destination "platform=iOS,id=${DEVICE_UDID}" \
  -parallel-testing-enabled NO -test-timeouts-enabled YES \
  -maximum-test-execution-time-allowance 120 \
  -resultBundlePath "$ROOT/device-isolated-test-run.xcresult" \
  test-without-building

rtk proxy xcrun xcresulttool get test-results summary \
  --path "$ROOT/device-isolated-test-run.xcresult" --compact
rtk proxy xcrun xccov view --report --only-targets --json \
  "$ROOT/device-isolated-test-run.xcresult"
```

再次运行需使用新的 result bundle 路径。对应原始文件：`logs/device-test-deps.log`、`logs/device-signed-auto.log`、`logs/device-isolated-test-run.log`、`device-runtime-summary.json`、`device-runtime-coverage.json`；临时文件可能被清理。

原工作区 HEAD、主/子仓库状态、pbxproj 与用户更新后的 Podfile.lock 哈希均未变。没有向原项目写入测试修正、没有提交或推送；Known Pain Points 按要求仍只保留标题。测试修复、正常启动链验收和 UI/在线集成不在本轮完成声明之内。

测试结束后已卸载本次独立测试包，并通过设备 App 清单确认原 `com.ugreen.home` 仍保留；本机临时构建产物和测试结果保留，供后续复现。
