# Android 运行实测

- 环境：API 36 arm64 临时 AVD `UGreenSurveyApi36`，专用 ADB 端口 5052；启动约 18.22 秒。
- 安全边界：离线模式（airplane mode=1，Wi‑Fi/移动数据关闭）；APK 使用临时本地证书签名，未使用生产密钥；未登录、未同意隐私协议、未连接真实设备。
- 构建：`assembleDomesticDebug` 与 `assembleDomesticDebugAndroidTest` 成功，41.22 秒，950 tasks / 88 executed。
- 安装：App 与 test APK 均 `adb install` 成功。
- Instrumentation：执行 3 个案例；`ExampleInstrumentedTest.useAppContext` 通过；两个 `IPCDeviceSettingActivityBackStackTest` 因 `DatabaseHolder not initialized` 在 setup/teardown 失败，未进入路由断言。
- 启动冒烟：`am start -W` 成功，`RootActivity` resumed；10 秒后 UI 显示 Personal Information Protection Terms，已保存截图和 UI dump。

完整机器结果见 [Android模拟器运行验证.json](Android模拟器运行验证.json)，原始 runner 输出见 [instrumentation-all.log](instrumentation-all.log)。

## 计数与复现边界

runner 报告 `Tests run: 3, Failures: 4`：两个失败案例各在 `@Before` 和 `@After` 抛错，故为 **1个通过案例、2个失败案例、4条失败事件**，不是执行了4个失败测试。`adb shell` 退出0、`INSTRUMENTATION_CODE: -1` 只说明调用/runner结束，不能作全通过证据。未修改产品或测试源码来绕过初始化。

离线且未同意协议、未登录的首次安装状态是本次测试前提；不能由这次初始化失败推断账号初始化后的返回栈一定错误。Shared device/host、其他模块 instrumentation、真机、真实后端/IoT、推送/崩溃上报与覆盖率未在本次运行覆盖。

- [构建摘要](androidTest-build-摘要.log) / [安装及运行JSON](Android模拟器运行验证.json)
- [启动命令输出](Android启动冒烟.log) / [Activity状态](Android启动Activity.log)
- [首次启动截图](Android首次启动.png) / [UI XML](Android首次启动-UI.xml)
- [网络状态](Android网络状态.log) / [飞行模式值](Android离线状态.txt)
- [本次验证脚本](Android模拟器验证脚本.py)：依赖本机临时 AVD、已签名 APK 和绝对路径；不是通用一键测试工具。原始中间日志位于 JSON 的 `rawEvidenceRoot`，未全部复制进笔记。

App和test副本使用相同临时证书，通过 `apksigner verify`；证书与APK SHA256见JSON。不归档APK、私钥或凭据。脚本结束后专用模拟器和ADB服务已关闭，先前探测遗留的5048端口服务也已单独关闭，未操作默认5037或真实设备。

此前 AVD 创建工具元数据错误、一次无设备安装尝试，以及一次 ADB 端口环境未对齐导致的等待超时均属于调研工具准备问题，不计作 App 测试失败；最终有效执行为 JSON 中的 `emulator-5584` / ADB 5052。
