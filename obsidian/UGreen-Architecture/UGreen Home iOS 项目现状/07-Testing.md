# Testing

[返回调研总览](00-调研总览.md) · [构建实测](06-Build-Time.md)

> 分别记录“源码里有什么”和“这次实际跑了什么”。以下测试总数均有统计口径；没有覆盖率百分比数据，也没有用局部测试推断整个 App 通过。

## 1. 测试层级与接入

| 层级 | 当前证据 | 主 App 集成程度 |
|---|---|---|
| Native 单元测试 | `UgreenHomeTests` XCTest target；56 个 Swift 文件、419 个 `func test...` 方法 | Xcode 测试 target 依赖 App；首次因 App 编译阻断而未执行；更新 Pods 后 build 已通过，但未补跑 XCTest |
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

共享 `UgreenHome.xcscheme` 和 `UgreenHomeTests.xcscheme` 的 TestAction 使用 **Beta**，而本轮经确认的构建基线是 **Debug**。后续比较测试结果时必须显式记录配置，不能默认为同一套。

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
| 主 App XCTest | 未执行 | N/A | 首次被编译阻断；更新 Pods 后构建已通过，但本轮复测不包含 XCTest，见 Build Time |
| KMM 其余模块/Native targets | 未执行 | N/A | 未扩展为全平台测试矩阵 |
| 主 App Integration / UI | 未执行 | N/A | 未连接测试账号、真实设备和后端，也无已确认 UI 套件 |

五组已执行套件合计 **84 个案例：83 通过、1 失败**。这个合计包含工具与平台子集，**不是 App 的测试通过率或代码覆盖率**。

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
- 没有执行 coverage instrumentation；未获取 `.xcresult`/`xccov` 覆盖率或全 KMM coverage 报告。
- 没有运行发布包、真机网络/数据库/账号联调或 UI 自动化。因此不能报告这些验证通过。
- 所有失败与未执行项保留在本章和构建章，按用户要求不自动填充 Known Pain Points。
