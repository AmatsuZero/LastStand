# Build Time

[返回调研总览](00-调研总览.md) · [测试现状](07-Testing.md)

## 1. 最新实测结果（用户更新 Pods 后）

| 场景 | 结果 | Wall time | 解释 |
|---|---|---:|---|
| Debug `clean build` | **BUILD SUCCEEDED，退出 0** | **243.35 秒（4 分 3.35 秒）** | 新副本、新 DerivedData；关闭签名和 Crashlytics 上传 |
| 修改单个业务 Swift 文件后 `build` | **BUILD SUCCEEDED，退出 0** | **44.30 秒** | 同一副本、相同缓存、不 clean；确认业务文件被重新编译 |

每种场景仅采样一次，不是多轮中位数，也不是完全无依赖缓存的构建。成功范围是 **Debug / iphoneos / arm64 / 关闭签名**，不代表模拟器、Release/Archive、真机运行或 XCTest 已通过。

证据：[Clean 复测摘要](附件/clean-build-复测摘要.log)、[Incremental 复测摘要](附件/incremental-build-复测摘要.log)、[复测环境](附件/构建复测环境.json)、[变更与还原](附件/增量变更与还原.json)、[保护校验](附件/构建复测保护校验.json)。App 产物确认为 arm64 Mach-O executable，NotificationService.appex 也已生成并嵌入；没有启动 App。

### 2026-09-13 XCTest 补测边界

上述 App-only 构建成功记录不变。新增 `UgreenHomeTests / Debug / build-for-testing` 实测：模拟器 50.28 秒因 `React` 模块不可解析失败；真机架构 226.84 秒在 **Tests target** 因 `RxSwift` 模块不可见失败，均退出 65。这是失败的测试构建耗时，不纳入成功 Clean/Incremental Build 基线，也不是案例执行耗时。详见 [Testing](07-Testing.md) 与 [补测记录](附件/App-XCTest补测记录.md)。

随后在副本修正测试配置/源码兼容后，未替换启动宿主的 `build-for-testing` **65.78 秒通过**；独立测试宿主的签名构建 **103.42 秒通过**。真机最终执行 419 个案例、23 失败。这些是修正副本的验证，不改写原工作区状态，也不纳入此前 Clean/Incremental 性能基线，见 [真机记录](附件/App-XCTest真机调试记录.md)。

### 历史尝试（不作为当前失败结论）

| 场景 | 结果 | Wall time |
|---|---|---:|
| 首次沙箱内尝试 | Xcode 服务/文件访问受限，退出 66 | 0.68 秒 |
| 首次沙箱外 clean build | UHKit 生成工程引用缺失文件，退出 65 | 48.00 秒 |

旧日志保留：[首次失败摘要](附件/clean-build-摘要.log)、[沙箱摘要](附件/clean-build-sandbox-摘要.log)。用户更新 Pods 后旧引用已移除，不能继续把旧错误写成当前构建状态。

## 2. 环境与快照

| 项目 | 值 |
|---|---|
| 日期 | 2026-09-12，Asia/Shanghai |
| CPU / 逻辑核心 | Apple M5 Pro / 18 |
| 内存 | 48 GiB，51,539,607,552 bytes |
| macOS | 26.6.2，25G83 |
| Xcode | 26.6，17F113 |
| SDK / 架构 | iphoneos26.5 / arm64，generic iOS device destination |
| Workspace / Scheme | `iot/UgreenHome.xcworkspace` / `UgreenHome` |
| Configuration | Debug |
| Signing | `CODE_SIGNING_ALLOWED=NO` |
| 主源码 | `31e1af1aa23e893886153b91cb51d5cedb674ca0`，`release/1.7.0` |
| KMM 实际检出 | `7abfcd0134c062f46c06b739a11f0cbeb69e1c0c`；主仓库显示子模块有差异 |
| 最新复测临时副本 | `/private/tmp/ugreen-ios-architecture-20260912-rerun2/source` |
| DerivedData / SPM checkout | 临时根下 `derived-data` / `packages` |

原始基线见 [环境与版本快照](附件/环境与版本快照.json)，更新 Pods 后的状态与哈希见 [构建复测环境](附件/构建复测环境.json)。本次 `Podfile.lock` 中 CocoaPods 工具版本由 1.16.2 变为 1.17.0，并更新 UHReactNativeRuntime spec checksum，已锁定的依赖版本号没有变化。没有清除使用者的 Xcode、Gradle 或系统缓存；机器上其他进程的负载未受控，因此仍需重复采样才能得出稳定基线。

## 3. 隔离与缓存口径

本次是**当前本地源码与已安装 Pods 的隔离副本测量**，不是重新 clone 后从零安装全部依赖：

- 保留当前安装的 `iot/Pods` 及预编译 xcframework；没有执行 `pod install`、更新版本或重写 lock。
- 排除 `.git`、`.omx`、`.codebuddy`、`.workbuddy`、`.build`、`.gradle`、`build` 和 `.env`。没有复制历史 KMP 编译产物；默认 Gradle 用户依赖缓存仍可能被读取。
- 使用独立的新 DerivedData，先执行 `clean`，再执行 `build`。SwiftPM 本地 `UGStrings` 链接重新指向副本中的同一子模块源码。
- 仅在副本把 `FirebaseCrashlytics/run` 构建阶段替换成 `echo ARCHITECTURE_SURVEY_SKIP_CRASHLYTICS_UPLOAD`，避免后台上传。原项目未改动。这不是完全未调整的生产构建脚本，测量口径明确排除上传。
- `.env` 不复制；本轮关闭签名的 Debug 构建通过，但未启动 App，不对运行期配置有效性作结论。
- 依赖准备耗时：**未单独测量，N/A**。预装 Pods/框架已存在；不能填写 0 秒，也不能声称下载完全不计入未来构建。

副本创建与测试不是基准计时的一部分。`/usr/bin/time -p` 包裹完整 Xcode 命令；243.35 秒包含最新 clean、构建准备、Gradle 调用和完成构建。44.30 秒包含单文件变更后完整增量构建流程。

## 4. 可复现命令

以下命令针对上述已建立、已禁用上传的隔离副本；不要直接在含既有工作成果的目录清理缓存。

```bash
cd /private/tmp/ugreen-ios-architecture-20260912-rerun2/source/iot
/usr/bin/time -p xcodebuild \
  -workspace UgreenHome.xcworkspace \
  -scheme UgreenHome \
  -configuration Debug \
  -sdk iphoneos \
  -destination 'generic/platform=iOS' \
  -derivedDataPath /private/tmp/ugreen-ios-architecture-20260912-rerun2/derived-data \
  -clonedSourcePackagesDirPath /private/tmp/ugreen-ios-architecture-20260912-rerun2/packages \
  -disableAutomaticPackageResolution \
  CODE_SIGNING_ALLOWED=NO \
  clean build -showBuildTimingSummary
```

最新原始日志位于 `/private/tmp/ugreen-ios-architecture-20260912-rerun2/logs/clean-build.log` 与同目录 `incremental-build.log`；仓库中仅保存经过筛选的结果与错误摘要，避免把大体积构建输出或不必要的环境信息纳入知识库。

## 5. 首次失败与复测变化

首次错误为 `LocalPods/UHKit/UHBottomPopview/UHBottomPopviewTemplates.swift` 不存在但仍在生成 Pods 工程中被引用。源文件本身没有恢复；更新后 **生成工程中的过期引用被移除**，`Podfile.lock` 与 `Pods/Manifest.lock` 内容也一致。

新的隔离副本取自用户更新后的原工程。没有执行额外 pod install、升级依赖或修改源工程。旧引用已消失和本轮 clean build 最终成功共同证明该阻断不再复现；不是根据 repo update 的操作名称推断成功。

## 6. 增量测量与还原

成功 clean build 后，在同一隔离副本的 `iot/iot/Modules/Home/Controller/UHHomeViewController.swift:218` 的 `viewDidLoad()` 实现体中插入一条日志语句：

```swift
print("ARCHITECTURE_SURVEY_INCREMENTAL_PROBE")
```

然后保持 workspace、scheme、configuration、SDK、destination、DerivedData、SPM 路径和签名设置不变，将命令末尾的 `clean build` 替换为 `build`。此次是语义性实现体变更，不是仅 touch/空白操作。

增量日志包含：

```text
SwiftCompile normal arm64 Compiling UHHomeViewController.swift
  (in target 'UgreenHome' from project 'UgreenHome')
** BUILD SUCCEEDED **
real 44.30
EXIT_CODE=0
```

临时源文件已还原并校验 SHA-256 与原始值一致；原项目同名业务文件、主 pbxproj、用户更新后的 Podfile.lock 与工作区状态均未变。还原只恢复源码，临时增量产物仍对应带日志探针的输入，未部署、未运行；后续若使用该副本运行 App，应先重新 build。每种场景仅运行一次，没有声称重复测量中位数。

## 7. 构建链的静态观察

- Xcode `Compile Kotlin Framework` 阶段运行 `:app-shared:embedAndSignAppleFrameworkForXcode`，并在 GUI 环境缺少 JAVA_HOME 时查找 Android Studio JBR：`iot/UgreenHome.xcodeproj/project.pbxproj:632-650`。
- 本次 Xcode 明确提示该阶段未声明 outputs，会在每次构建运行。**脚本每次调用不代表 Gradle 每次全量重编译**；增量效果仍由 Gradle 的任务输入/输出决定。
- Podfile Debug/Test 配置启用当前架构和 Swift singlefile/Onone：`iot/Podfile:109-162`。这是配置证据，不是构建性能数据。
- 最新两次构建均完成 KMP/主 App 构建链，但本次没有独立隔离采样各层耗时占比。Gradle 内部耗时与 BuildTimingSummary 并行 task 累计秒数不能直接相加成 wall time。
