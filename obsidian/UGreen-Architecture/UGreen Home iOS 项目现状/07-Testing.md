# Testing

[返回调研总览](00-调研总览.md) · [构建实测](06-Build-Time.md)

> 分别记录原工作区基线与临时修正副本。2026-09-13 真机副本执行 419 个案例：396 通过、23 失败；已取得限定口径的行覆盖率，不能推断整个 App 通过。

## 最新：USB 真机已实际执行

使用 iPhone 16 Pro Max / iOS 26.6.2，在临时副本修正测试配置和 7 个测试文件的编译兼容问题后，测试构建通过。采用独立 Bundle ID 与空白宿主执行全部 419 个案例，最终 **396 通过、23 失败（21 个断言失败、2 个崩溃）、0 跳过**；命令退出 65，wall time 231.17 秒。

**原工作区没有应用修正，仍保留原构建阻断。** 运行结果不覆盖正常 App 启动、账号/RTCX 联调或 UI 测试。首次执行因 `.xctestrun` 留有旧宿主 ID 误启动原 App，发现自动网络请求后已中止；最终统计只取修正宿主 ID 后的独立运行。详见 [真机调试记录](附件/App-XCTest真机调试记录.md)、[案例 CSV](附件/App-XCTest真机案例.csv) 与 [结果 JSON](附件/App-XCTest真机结果.json)。

## 1. 测试层级与接入

| 层级 | 当前证据 | 主 App 集成程度 |
|---|---|---|
| Native 单元测试 | `UgreenHomeTests` XCTest target；56 个 Swift 文件、419 个 `func test...` 方法 | Xcode 测试 target 依赖 App；原工作区的两条测试构建路径均失败；修正副本后已在 USB 真机执行 419 个案例，396 通过、23 失败 |
| RN Runtime Core 单元测试 | 独立 Swift Package，2 个测试文件、9 个方法 | 可在 macOS 执行；不覆盖 UIKit/RN 引擎/预编译库集成 |
| KMM 单元/平台测试 | 74 个 Kotlin 测试 source-set 文件、545 个 `@Test` 注解 | source set 跨 common/JVM/iOS/Android，不等于 545 个 iOS 可执行案例 |
| RN 打包工具测试 | 4 个 Node 测试文件、21 个测试 | 包含 artifact 校验、发布/回滚和 Xcode 资源编辑夹具；不是 App 运行测试 |
| Python 工具测试 | `Tools` 下 2 个 unittest 文件、17 个方法 | 图片导入与国际化工具，不是 App 单元测试 |
| 集成测试 | 存在桥接/策略 acceptance 与工具集成式测试 | 没有发现独立命名的主 App integration target 或可证明在线端到端联调通过的报告 |
| UI Test | 主 Xcode 工程未发现 UI testing target 或 UI test 源码目录 | 本轮无可执行 UI 自动化套件，也未进行人工 UI 运行验收 |

Native target 证据：`iot/UgreenHome.xcodeproj/project.pbxproj:420-494`，只有 App、NotificationService、unit-test 三个 Native targets；`iot/Podfile:104-107` 配置测试 Target。

## 2. Native XCTest 的范围

`iot/UgreenHomeTests` 主要是策略/映射/桥接/缓存边界测试，而不是覆盖每个屏幕的用户流程：

- 设备关系与 Runtime：账户关系快照、property index/value codec、固件宿主快照、时区、reported property、face counts。
- IPC：feature policy/catalog/resolver/acceptance、action guard、privacy、device-info、network-config/info、setting root。
- Home / Provisioning：设备发现弹窗、滚动偏移、网络信号、配网步骤、图片提供者。
- AIBase / HDMI：配置合并、静音、分页、投屏行、设备 payload、家庭内容 use case、安防报告、车牌校验。
- RN：Network envelope/URL builder、二维码、DeviceHost、runtime contract/bundle validator、native Lottie/preview 等。
- Playback / UI 辅助：回放事件 adapter、时间线、图片合成、主题资源等。

代表源码：

- `iot/UgreenHomeTests/IPCFeaturePolicyAcceptanceTests.swift`
- `iot/UgreenHomeTests/DeviceHostRNBridgeServiceTests.swift`
- `iot/UgreenHomeTests/NetworkRNBridgeEnvelopeDecoderTests.swift`
- `iot/UgreenHomeTests/HDMISetting/UHHDMILoadHomeContentUseCaseTests.swift`

这些测试文件的存在和方法数不说明断言质量或业务覆盖率；含 `Acceptance`、`Bridge` 的名字也不自动等同于访问真实设备/后端的集成测试。

### Scheme 默认配置与本轮口径

共享 `UgreenHome.xcscheme` 和 `UgreenHomeTests.xcscheme` 的 TestAction 使用 **Beta**，而本轮经确认的构建基线是 **Debug**。2026-09-13 XCTest 补测也显式使用 **Debug**。比较测试结果时必须显式记录配置，不能默认为同一套。

证据：`iot/UgreenHome.xcodeproj/xcshareddata/xcschemes/UgreenHome.xcscheme:43-66`、`iot/UgreenHome.xcodeproj/xcshareddata/xcschemes/UgreenHomeTests.xcscheme:27-48`。

`generic/platform=iOS` 适合 build，不是可执行 XCTest 的设备；执行测试需可用的具体模拟器或真机 destination。本轮没有对 generic destination 发出伪执行测试命令。

## 3. KMM 测试分布

| Source set | Kotlin 文件数 | 静态 `@Test` 数 | 含义 |
|---|---:|---:|---|
| commonTest | 65 | 535 | 在配置的实际测试平台上运行；文件包含 helper 时不能按文件推断案例 |
| jvmTest | 1 | 4 | JVM 专属互操作测试 |
| iosTest | 2 | 1 | 包括 iOS 测试及平台 helper |
| androidHostTest | 4 | 3 | Android host-side 测试及 helper |
| androidDeviceTest | 2 | 2 | Android device-side 测试 |
| 合计 | **74** | **545** | 源码注解计数，不是本次执行数 |

模块范围包括 core 的 util/logger/net/navigation/ui/secure-package/database，以及 device-thing-model、device-biz、auth、home-management、OTA、playback、third-party-services 和 sample。`app-shared` / `feature-device-event` 未发现独立测试文件；这不排除其他模块测试间接调用它们，也不等同于零间接覆盖。

`core-util` 明确开启 JVM target，适合无设备的局部验证：`ugreenhome-shared/core/core-util/build.gradle.kts:12-28`。这也是本轮选择 `:core-util:jvmTest` 的依据，不能把该结果推广至 Kotlin/Native 或 Compose iOS。

完整清单见 [测试源码清单 CSV](附件/测试源码清单.csv)。该 CSV 还包括字符串包测试和仓库中技能/工具脚本的测试，需按路径过滤，不能把全文件合计当作主 App 测试规模。

## 4. 本次执行结果

| 套件 | 执行/通过/失败 | Wall time | 结论与证据 |
|---|---|---:|---|
| UHReactNativeRuntime SwiftPM Core | 9 / 9 / 0 | 10.66 秒 | [Swift 摘要](附件/swift-test-摘要.log)；独立 macOS 包 |
| KMM `:core-util:jvmTest` | 37 / 37 / 0 | 30.36 秒 | [Gradle 摘要](附件/kmm-jvm-test-摘要.log)、[JUnit XML 汇总](附件/KMM-JVM测试结果.csv)；8 个 suite，0 skipped |
| RN bundle tool | 21 / 20 / 1 | 0.07 秒 | [Node 摘要](附件/rn-bundle-tests-root-摘要.log)；宿主 bridge contract 期望值不一致 |
| UHKit 图片导入 Python | 9 / 9 / 0 | 0.12 秒 | [Python 摘要](附件/image-tool-tests-摘要.log) |
| 国际化工具 Python | 8 / 8 / 0 | 0.07 秒 | [Python 摘要](附件/l10n-tests-摘要.log) |
| 原工作区基线 XCTest：模拟器 | 0 / N/A / N/A（构建阻断） | 50.28 秒 | `build-for-testing` 退出 65；RN `React` 模块不可解析 |
| 原工作区基线 XCTest：真机架构 | 0 / N/A / N/A（构建阻断） | 226.84 秒 | `build-for-testing` 退出 65；Tests target 报 `no such module RxSwift` |
| App XCTest：修正副本 + 隔离宿主真机 | 419 / 396 / 23 | 231.17 秒 | 0 skipped；23 中包含 2 个崩溃案例；[最终报告](附件/App-XCTest真机结果.json) |
| KMM 其余模块/Native targets | 未执行 | N/A | 未扩展为全平台测试矩阵 |
| 主 App Integration / UI | 未执行 | N/A | 未连接测试账号、真实设备和后端，也无已确认 UI 套件 |

上述五组独立套件为 2026-09-12 的执行结果，本次未重跑；合计 **84 个案例：83 通过、1 失败**。这个合计包含工具与平台子集，**不是 App 的测试通过率或代码覆盖率**。

### 2026-09-13 App XCTest 未改配置的补测基线

**未修改测试配置的原工作区仍不能成功执行 App XCTest，但不是此前的 pod install / UHKit 缺失文件问题。** 下文两次构建是修正副本真机运行之前的基线记录。 本次使用用户更新后的依赖，在新隔离副本分别尝试两条测试构建路径：

| 路径 | 已确认阻断 | 证据边界 |
|---|---|---|
| 模拟器（iPhone 17 Pro / iOS 26.5） | Lottie RN bridge 的 `import React` 失败；当前 82 个 RN xcframework 均只有 iOS device slice，没有 simulator slice | 模拟器可用；不是“未安装模拟器”，也不是 XCTest 断言失败 |
| 真机架构（generic iOS / arm64） | `UgreenHomeTests` 编译 `UHAIAnalysisRepository.swift:7` 时找不到 `RxSwift` | 这是测试 Target 编译失败，不是真机运行失败，也不否定已成功的 App-only build |

生成的 Tests `SwiftFileList` 共 **227 个输入：56 个测试源码 + 171 个 AIBase 产品源码**。因此测试 Target 不只是消费 App 模块，还直接重编译 AIBase 的 View/Repository/ViewModel 等文件。工程的同步组 membership exception 指向 Tests；不能仅凭名称把这些条目视为排除项。

与此同时，`Podfile:104-107` 的 Tests 是 App 的**同级 Target**；只有 `inherit! :search_paths`，当前生成的 `Pods-UgreenHomeTests.debug.xcconfig` 没有 RxSwift 等 Pod 的 framework 搜索路径。编译输入与依赖可见性不匹配是当前真机架构路径的明确阻断，不能解释成整个项目没装 RxSwift。后续副本验证中，移除错误源码 membership 消除了 RxSwift 错误；又修正测试编译兼容及 Pod 继承后测试构建通过，但实际执行仍有 23 个失败案例，见本章最新结果。

本次两条命令均为 `build-for-testing`，**没有执行任何 App XCTest 案例**；请求了 coverage，但构建失败，未取得覆盖率。日志中的 “15 failures” 指失败的构建命令，不是 15 条失败测试。没有安装/启动 App、运行 UI 测试或连接业务账号。

完整命令、错误与后续验证边界见 [App XCTest 补测记录](附件/App-XCTest补测记录.md)，机器可读摘要见 [补测结果](附件/App-XCTest补测结果.json)。

### Node 失败的当前证据

从项目根目录执行后，失败案例为 `detects current host bridge contract version`：

```text
actual:   '4.3.0'
expected: '4.2.0'
tests 21
pass 20
fail 1
```

- 测试硬编码期望：`Tools/rn-bundle-tool/test/smoke.test.js:40-42`。
- 实际检测宿主常量的逻辑：`Tools/rn-bundle-tool/builtin-bundle.js:28-39`。
- 当前随包 DeviceSettings manifest 也声明 `bridgeContractVersion: 4.3.0`。

初次在 `Tools/rn-bundle-tool` 子目录运行还出现 `process.cwd()` 不能找到宿主契约的问题；随后在副本**项目根目录**重跑，确认上述版本断言失败。两次尝试均留有摘要，最终结论以正确 cwd 的运行结果为准。本轮不修改测试或宿主契约。

### 环境失败与代码失败分开

- SwiftPM 初次沙箱执行因 `sandbox_apply: Operation not permitted` 失败；授权后原命令在沙箱外通过。
- Gradle 初次因用户缓存 wrapper lock 的写权限失败；授权后在同一副本使用 `--offline` 成功，不下载/升级依赖。
- Gradle 终端的 `BUILD SUCCESSFUL` 配合 JUnit XML 中 37 个测试且 0 failures/errors/skipped，才构成本轮通过证据。
- Swift 输出末尾另有 Swift Testing 的“0 tests”；本包实际 XCTest 在前面已经执行 9 个，不应把两种 runner 的输出混为零测试。

## 5. 可复现测试命令

```bash
# SwiftPM；源码只读，scratch/module cache 独立
SWIFTPM_MODULECACHE_OVERRIDE=/private/tmp/ugreen-ios-architecture-20260912/swift-module-cache \
CLANG_MODULE_CACHE_PATH=/private/tmp/ugreen-ios-architecture-20260912/clang-cache \
/usr/bin/time -p swift test \
  --package-path /Users/daubert/UGreen/ugreenhome/LocalPods/UHReactNativeRuntime \
  --scratch-path /private/tmp/ugreen-ios-architecture-20260912/swift-build

# 以下命令在临时副本运行
cd /private/tmp/ugreen-ios-architecture-20260912/source/ugreenhome-shared
JAVA_HOME='/Users/daubert/Applications/Android Studio.app/Contents/jbr/Contents/Home' \
  /usr/bin/time -p ./gradlew --offline --console=plain :core-util:jvmTest

cd /private/tmp/ugreen-ios-architecture-20260912/source
/usr/bin/time -p node --test Tools/rn-bundle-tool/test/*.test.js
PYTHONDONTWRITEBYTECODE=1 /usr/bin/time -p python3 -m unittest discover \
  -s Tools -p test_import_uhkit_images.py -v
PYTHONDONTWRITEBYTECODE=1 /usr/bin/time -p python3 -m unittest discover \
  -s Tools/国际化/l10n_tool -p test_l10n_diff_tool.py -v
```

## 6. 统计与验证限制

- 静态计数排除 `.git`、Pods、生成 build/.build/.gradle、node_modules、预编译 frameworks；但显式保留受审计的字符串生成包源码测试。
- Swift 计数为 `func test...(`；Kotlin 为 `@Test`；Node 为顶层 `test(`；Python 为 `def test_`。这不是测试 runner 的最终发现规则，参数化、继承、跳过和 helper 会导致差异。
- 独立套件未采集 coverage；最初两份 App XCTest `.xcresult` 只有失败构建结果。后续修正副本真机运行取得 App target 行覆盖率 **8,295 / 405,194 = 2.05%**，仅代表本轮隔离宿主的 instrumented target；崩溃可能影响数据完整性，不代表全栈业务覆盖率。全 KMM coverage 未获取。
- 没有运行发布包、真机网络/数据库/账号联调或 UI 自动化。因此不能报告这些验证通过。
- 所有失败与未执行项保留在本章和构建章，按用户要求不自动填充 Known Pain Points。
