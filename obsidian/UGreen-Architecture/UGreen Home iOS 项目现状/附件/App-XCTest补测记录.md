# App XCTest 补测记录

日期：2026-09-13（Asia/Shanghai）。[测试现状](../07-Testing.md) · [构建基线](../06-Build-Time.md)

> 本页保留未改测试配置的基线结果；后续修正副本已在 USB 真机执行 419 个案例，见 [真机调试记录](App-XCTest真机调试记录.md)。原工作区未应用修正。

## 1. 结论

**当前 App XCTest 仍未进入执行：两条 `build-for-testing` 路径均失败。** 这不是此前的 UHKit 过期文件引用问题；此前 Debug / iphoneos 的 App-only Clean/Incremental Build 成功记录仍成立。

| 路径 | 最终结果 | Wall time | 直接错误 |
|---|---|---:|---|
| iOS Simulator / arm64 | `TEST BUILD FAILED`，退出 65 | 50.28 秒 | `Unable to resolve module dependency: 'React'` |
| iOS device / arm64（generic，仅构建） | `TEST BUILD FAILED`，退出 65 | 226.84 秒 | `No such module 'RxSwift'`，发生于 `UgreenHomeTests` |

这两项耗时包括构建准备和失败前工作，不是 XCTest 执行时长。**本次 App 案例执行数为 0，断言通过/失败数与覆盖率均为 N/A**。419 是静态方法计数，不是 runner 发现或执行结果。请求 coverage 不等于获得 coverage；两份 `.xcresult` 都是失败构建报告。

机器可读证据：[补测结果 JSON](App-XCTest补测结果.json)。其中错误/警告计数由 `xcresulttool get build-results` 提取，错误重复输出不计为多条失败测试。

## 2. 环境与保护

- 使用主源码 `31e1af1aa23e893886153b91cb51d5cedb674ca0`，KMM `7abfcd0134c062f46c06b739a11f0cbeb69e1c0c`，保留用户更新后的已安装 Pods。没有再次执行 `pod install` 或调整依赖版本。
- 新隔离根：`/private/tmp/ugreen-ios-xctest-20260913`。源码复制到 `source`，排除 `.git`、`.omx`、`.codebuddy`、`.workbuddy`、`.build`、`.gradle`、`build` 和 `.env`。
- 仅在副本禁用 Crashlytics 构建上传，并将 `iot/.local-packages/UGStrings` 链接指向副本内字符串包。未修改产品或测试源码。
- Workspace `UgreenHome.xcworkspace`，Scheme `UgreenHomeTests`，显式 **Debug**；Scheme 的默认 TestAction 为 Beta，未声称 Beta 已验证。关闭签名，模拟器/device 使用独立 DerivedData，SPM checkout 共用本次临时目录。
- 使用可用的 iPhone 17 Pro / iOS 26.5 模拟器。最初受沙箱限制的设备查询不是最终结论；授权后成功查询设备并完成两次构建尝试。
- 设备只做可用性查询，发现有已连接且开启开发者模式的配对真机；**不能将本轮未运行归因于没有真机**。未在任何设备安装或启动 App；未访问业务账号进行联调。附件不保存个人设备名称或标识符。
- 前后主仓库/子仓库 HEAD 和工作区状态一致，pbxproj 与 Podfile.lock 的 SHA-256 一致；原项目与副本的 `iot/iot`、`iot/UgreenHomeTests` 合计 **1,813 个 Swift 文件**内容一致。具体保护检查见结果 JSON。这不是对仓库全部文件的哈希审计。

## 3. 模拟器阻断：RN 二进制平台支持

错误位置：

```text
LocalPods/UHReactNativeRuntime/Sources/Bridges/lottie-react-native/
LottieReactNative/AnimationViewManagerModule.swift:1:8:
Unable to resolve module dependency: 'React'
```

当前 RN **82 个 xcframework 全部仅包含 `ios-arm64` device library，没有 simulator variant**。这是读取框架 `Info.plist` 的 `AvailableLibraries` 得到的平台证据，不是仅看 CPU 架构推断：device arm64 不等同于 simulator arm64。清单见 [RN 框架切片 JSON](App-XCTest-RN框架切片.json)。

因此当前预编译 RN 依赖不满足这条模拟器构建路径。更换模拟器型号不能据此认定会解决问题；也不能把这一结果描述成测试断言失败。其他依赖是否还存在模拟器限制，本次未逐一验证。

## 4. 真机架构阻断：Tests 源码归属与依赖可见性

错误位置：

```text
iot/iot/Modules/AIBase/AIAnalysis/Repository/UHAIAnalysisRepository.swift:7:8:
error: no such module 'RxSwift'
... (in target 'UgreenHomeTests' from project 'UgreenHome')
** TEST BUILD FAILED **
real 226.84
EXIT_CODE=65
```

证据链：

1. `UgreenHomeTests.SwiftFileList` 实际包含 **227 个源码输入**，其中 **56 个测试源码、171 个 AIBase 产品源码**。已将副本前缀移除并保存 [完整编译输入清单](App-XCTest编译输入.txt)。
2. `project.pbxproj:110-298` 的同步组 membership exception 指向 Tests；该集合的命名不能当作“源码已被排除”的证明，实际编译命令确认 AIBase 的 Repository、ViewModel 等被 Tests 编译。
3. `Podfile:104-107` 的 Tests 与 App 是同级 target，只有 `inherit! :search_paths` 和 dynamic frameworks 声明。当前 `Pods/Target Support Files/Pods-UgreenHomeTests/Pods-UgreenHomeTests.debug.xcconfig` 没有提供 RxSwift 等 Pod 的 framework 搜索路径。
4. 最终编译在上述产品文件的 `import RxSwift` 处失败。它说明 **Tests 自身编译输入需要的依赖未正确可见**，不说明 RxSwift 在整个工程中没有安装，也不否定 App-only build 成功。

日志尾部 `(15 failures)` 是失败构建命令数量；`.xcresult` 汇总为 1 项 Swift 编译错误，不能写为 15 个失败测试案例。这里确认了当前阻断，但没有试修后续链路，不能承诺修复 RxSwift 可见性后所有测试就能通过。

## 5. 命令与原始证据位置

以下命令用于已经建立的隔离副本。模拟器标识符用变量代替，需填入实际可用 destination；原始运行选择的是上述 iPhone 17 Pro / iOS 26.5。若再次运行，使用新的 result bundle 路径，不能覆盖已存在的 `.xcresult`。

```bash
cd /private/tmp/ugreen-ios-xctest-20260913/source/iot
ROOT=/private/tmp/ugreen-ios-xctest-20260913

# 模拟器：仅测试构建，不执行案例
rtk proxy /usr/bin/time -p xcodebuild \
  -workspace UgreenHome.xcworkspace -scheme UgreenHomeTests \
  -configuration Debug -sdk iphonesimulator \
  -destination "platform=iOS Simulator,id=${SIMULATOR_UDID}" \
  -derivedDataPath "$ROOT/derived-simulator" \
  -clonedSourcePackagesDirPath "$ROOT/packages" \
  -disableAutomaticPackageResolution -enableCodeCoverage YES \
  -resultBundlePath "$ROOT/build-for-testing.xcresult" \
  CODE_SIGNING_ALLOWED=NO build-for-testing

# 真机架构：generic destination 只用于构建，不能执行测试
rtk proxy /usr/bin/time -p xcodebuild \
  -workspace UgreenHome.xcworkspace -scheme UgreenHomeTests \
  -configuration Debug -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath "$ROOT/derived-device" \
  -clonedSourcePackagesDirPath "$ROOT/packages" \
  -disableAutomaticPackageResolution -enableCodeCoverage YES \
  -resultBundlePath "$ROOT/build-for-testing-device.xcresult" \
  CODE_SIGNING_ALLOWED=NO build-for-testing

rtk proxy xcrun xcresulttool get build-results \
  --path "$ROOT/build-for-testing-device.xcresult" --compact
```

本机临时原始证据（不提交大体积日志或设备发现数据）：

- `logs/build-for-testing.log`、`build-for-testing.xcresult`
- `logs/build-for-testing-device.log`、`build-for-testing-device.xcresult`
- `simulator-build-result.json`、`device-build-result.json`
- `derived-device/Build/Intermediates.noindex/UgreenHome.build/Debug-iphoneos/UgreenHomeTests.build/Objects-normal/arm64/UgreenHomeTests.SwiftFileList`

上述路径均相对隔离根，可能被系统清理；知识库内已保留精简错误、框架平台清单、编译输入和保护检查。

## 6. 下一步验证边界（本次未实施修复）

- 先核对 Tests 中 171 个产品文件是否确实需要直接编译，并按预期的测试边界修正 target membership / Pod 依赖配置，避免仅为消除首条错误盲目复制全部 App 依赖。
- 若选择模拟器路线，需要为 RN 提供匹配的 simulator 构建产物，并继续检查其他二进制平台约束。
- 测试构建成功后，才进入具体 destination 的签名、安装和 XCTest 执行。Hosted XCTest 会涉及 App 启动，需先确认测试环境和启动副作用隔离；本次没有执行这些步骤。
- 最终需取得真实测试案例与 coverage 报告，才能补写通过率/覆盖率。本次不把构建失败计入既有独立套件的 84 个案例，也不填充 Known Pain Points。
