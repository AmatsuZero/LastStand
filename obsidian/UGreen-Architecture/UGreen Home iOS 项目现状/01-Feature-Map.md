# Feature Map

> **快照**：2026-09-12；主仓库 `31e1af1aa`，KMM 子仓库 `7abfcd013`。
> **范围**：`iot/` iOS 宿主、`LocalPods/`、`ugreenhome-shared/`、配网、通知扩展和构建辅助工具。此表描述当前检出源码的**实现与接入证据**，不以旧笔记或目录名称替代运行时证据。

## 阅读方法

- **编入**：iOS 主 Target 使用 `PBXFileSystemSynchronizedRootGroup` 同步 `iot/iot`；排除项只有 `Supporting Files/Info.plist`，因此以下 `iot/iot` 源文件属于主 App 编译输入。证据：`iot/UgreenHome.xcodeproj/project.pbxproj:95-101,421-450`。
- **路由等级**：**R2** = 从应用根或系统回调直接到达；**R1** = 可追至明确的原生/跨端入口；**R0** = 已编入，尚未在本轮将其映射到一个单一外部入口。
- **状态接入**：**K** = KMM 状态/服务；**N** = 原生单例、缓存或服务；**RN** = React Native 会话桥；`—` = 本轮仅确认 UI/资源或无独立状态入口。该字段不是状态所有权结论，详细读写边界见 `04-State-Ownership.md`。
- **没有把目录当成产品功能**：`Resources`、`UGUIKit`、`ServerAPI` 和 `Common` 是横切实现；它们列入地图以说明边界，但不被计为独立用户入口。

## 应用根与主路径

| 路径 | 路由 / 实现 | 状态接入 | 证据 |
|---|---|---|---|
| 应用启动与全局初始化 | `AppDelegate` 先准备 RN、推送，再初始化 KMM KV/主题、原生配置/用户/产品目录，并注册协议同意观察者。 | K + N + RN | `iot/iot/Modules/Lanuch/AppDelegate.swift:35-103` |
| Scene 与根容器 | `SceneDelegate` 把窗口交给 `UGRootViewManager`；后者启动 KMP auth，并把 Shared 根控制器包在原生导航控制器中。 | K + N | `iot/iot/Modules/Lanuch/SceneDelegate.swift:18-30`；`iot/iot/Modules/Root/UGRootViewManager.swift:43-56` |
| Shared 根流程 | KMM Compose 根以 `Launch → Auth/Home` 为导航主线；认证状态变化会 reset 到 Auth 或 Home。 | K | `ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:52-64,100-145,191-231` |
| 首页原生槽位 | iOS KMM 工厂把首页槽位回调给 UIKit `UIViewController`，并提供选择/订阅首页 Tab 的桥接 API。 | K ↔ N | `ugreenhome-shared/app-shared/src/iosMain/kotlin/com/ugreen/app/shared/UGRootViewController.kt:32-77` |
| 登录、登出和 Universal Link | 根管理器订阅原生登录/登出通知；登出清理待处理 Link、重置原生导航栈。Universal Link 解析后进入首页导航栈的扫码/添加设备处理。 | K + N | `iot/iot/Modules/Root/UGRootViewManager.swift:73-120,123-211` |

## 原生功能模块

以下行均位于主 Target 的同步源目录。`R0` 仅表示本轮没有为该聚合目录强行指定唯一入口，不表示代码不可达。

| 模块（Swift 文件数） | 覆盖的功能 / 实现边界 | 路由 | 状态接入 | 代表性源码证据 |
|---|---|---:|---|---|
| `Lanuch`、`LaunchScreen` | iOS 启动、场景、启动页资源。 | R2 | K + N | `iot/iot/Modules/Lanuch/AppDelegate.swift:21-103`；`iot/iot/Modules/Lanuch/SceneDelegate.swift:18-41` |
| `Root` | Shared 根容器、外层原生导航栈、登录/登出与 Universal Link 协调。 | R2 | K + N | `iot/iot/Modules/Root/UGRootViewManager.swift:43-56,73-120` |
| `Login` | 原生兼容登录对象与 KMM 认证协调器；Shared 根实际渲染 Auth UI。 | R2 | K + N | `iot/iot/Common/Login/UGKmpAuthCoordinator.swift:1-220`；`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:148-160` |
| `Agreement` | 协议展示与同意；协议资源读取 KMM 环境快照，正文仍由原生内容接口处理。 | R1 | K + N | `iot/iot/Common/Core/Manager/UGAgreementManager.swift:401-442,487-521`；`iot/iot/Modules/Lanuch/AppDelegate.swift:91-93` |
| `Home` | UIKit 首页/卡片、单摄像头视图、模型、服务与 ViewModel；由 Shared 首页原生槽位承载，不等同于 KMM `UGHomeScreen`。 | R1 | N + K | `iot/iot/Modules/Home/Controller/UHHomeViewController.swift:59`；`ugreenhome-shared/app-shared/src/iosMain/kotlin/com/ugreen/app/shared/UGRootViewController.kt:46-60` |
| `AIBase`（291 Swift 文件） | AI Base 首页与设备详情、AI 分析、语音控制、联系人、跨摄像头跟踪、HDMI 设置、人员管理、安全报告、存储、车辆。目录含 `Model/Repository/View/ViewController/ViewModel` 分层。 | R1/R0 | N；部分经 IPC/RTCX | `iot/iot/Modules/AIBase/HomePage/Controllers/Home/UHAIBaseHomeViewController.swift:12`；`iot/iot/Modules/AIBase/PersonManagement/ViewController/UHPersonManagementViewController.swift:12`；`iot/iot/Modules/AIBase/SecurityReport/ViewController/UHSecurityReportViewController.swift:13` |
| `IPC`（805 Swift 文件） | IPC 首页播放器、回放、事件、媒体中心、视频通话、AI 搜索；设备设置包括 AI 检测、音视频、电池、设备信息、分享、存储、网络、通知、OTA、隐私区、访客记录等；另含播放器引擎/渲染和调试。 | R1/R0 | N + K + RN | `iot/iot/Modules/IPC/HomePlayer/ViewModels/UGIPCPlayerViewModel.swift:14`；`iot/iot/Modules/IPC/PlayBack/`、`TabEvent/`、`SettingMain/`、`PlayerArchitecture/`（同属同步主 Target，见项目证据 `project.pbxproj:95-101`） |
| `MessageCenter` | 消息中心列表/模型与服务。 | R0 | N | `iot/iot/Modules/MessageCenter/UGMessageCenterViewController.swift:10` |
| `ApplePush` | 远程通知注册、token 上传和通知处理；系统回调均由 `AppDelegate` 转发。 | R2 | N | `iot/iot/Modules/Lanuch/AppDelegate.swift:37-39,106-123`；`iot/iot/Modules/ApplePush/UHApplePush.swift:10` |
| `SearchDevice` | 扫码/搜索结果、展示和进入添加设备流程。Universal Link 的已确认路径最终调用 `UHScanResultHandler`。 | R1 | N | `iot/iot/Modules/Root/UGRootViewManager.swift:194-211`；`iot/iot/Modules/Common/ScanResultHandler/UHScanResultHandler.swift:10` |
| `OTA` | 原生 OTA 页面、扩展和 KMP 适配；设备设置 RN 可调用原生/KMM OTA 打开路径。 | R1 | K + N + RN | `iot/iot/Modules/OTA/KMP/UGOTAHostCoordinator.swift:9`；`iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsPageDispatcher.swift:304-337` |
| `UserCenter` | 个人资料、客服、管理器、模型与 ViewModel。Shared 根把客服作为宿主回调注入。 | R1 | N + K | `iot/iot/Modules/UserCenter/CustomerService/UHCustomerServiceRouter.swift:11`；`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:52-59,206-211` |
| `ReactNative`（59 Swift 文件） | DeviceSettings RN 模块的容器、离线/远程 bundle 解析、原生服务桥、RN 调试页。实际产品根为 `DeviceSettings`，而非一个独立 RN App。 | R1 | RN + N + K | `iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsRouter.swift:8-30`；`iot/iot/Modules/ReactNative/Common/Core/UHReactNativeBundleResolver.swift:382-424` |
| `Debug` | AI 文本搜索、播放器、清缓存、崩溃钩子、登录提醒、推送、主题/UHKit 调试面板。 | R0 | N | `iot/iot/Modules/Debug/Controllers/UHDebugController.swift:128` |
| `Common`、`UGUIKit` | 公共 UI、扫描结果处理等轻量业务公共层。 | R1/R0 | N | `iot/iot/Modules/Common/ScanResultHandler/UHScanResultHandler.swift:10`；`iot/iot/UGUIKit/Core/UGNavigationController.swift:1` |
| `Common/Core` | BLE/蓝牙连接、RTCX、WebSocket、HTTP、环境/产品/用户/权限/主题/缓存/Keychain、WCDB 等基础实现。不是一个屏幕模块。 | R2/R1 | K + N | `iot/iot/Common/Core/Manager/UGProductManager.swift:69-169,404-428`；`iot/iot/Common/Core/Manager/UGUserManager.swift:94-124,241-302` |
| `ServerAPI` | AIChat、IAP、IPC、录制、SIM 的原生 API 定义；属于服务边界。 | R0 | N | `iot/iot/ServerAPI/IPCAPI/UGIPCVisitAPI.swift:11`（同级还含 AIChat/IAP/Recording/SIM API） |

### AIBase 与 IPC 子地图

为保持可读性，下表展开两个最大目录的业务子域；同一表内的多级目录均属前述主 Target。

| 聚合模块 | 子域 | 实现位置 | 状态/跨端接入 | 源码锚点 |
|---|---|---|---|---|
| AIBase | 首页、设备详情、事件、设置、存储 | `Modules/AIBase/HomePage/`、`Storage/` | 原生仓储/模型；关联 IPC/RTCX | `iot/iot/Modules/AIBase/HomePage/Controllers/Home/UHAIBaseHomeViewController.swift:12` |
| AIBase | AI 分析、语音控制、联系人、跨摄像头跟踪 | `AIAnalysis/`、`AIVoiceControl/`、`Contacts/`、`CrossCameraTracking(CCT)/` | 原生 `Repository`/`ViewModel` | `iot/iot/Modules/AIBase/AIAnalysis/ViewController/UHAIAnalysisViewController.swift:11`；`iot/iot/Modules/AIBase/AIVoiceControl/ViewController/UHAIVoiceControlViewController.swift:15`；`iot/iot/Modules/AIBase/Contacts/ViewController/UHContactsViewController.swift:13` |
| AIBase | HDMI、人员管理、安全报告、车辆 | `HDMISetting/`、`PersonManagement/`、`SecurityReport/`、`Vehicle/` | 原生数据/展示层，部分 IPC 通道 | `iot/iot/Modules/AIBase/HDMISetting/Presentation/ViewController/UHHDMIViewController.swift:13`；`iot/iot/Modules/AIBase/SecurityReport/ViewController/UHSecurityReportViewController.swift:13` |
| IPC | 首页直播、播放器架构、回放、事件播放、媒体中心 | `HomePlayer/`、`PlayerArchitecture/`、`PlayBack/`、`PlayEvent/`、`MediaCenter/` | 原生播放器/RTCX；部分 KMM 事件/设备桥 | `iot/iot/Modules/IPC/HomePlayer/ViewModels/UGIPCPlayerViewModel.swift:14`；`iot/iot/Modules/IPC/PlayBack/Controllers/UGIPCPlayBackController.swift:13` |
| IPC | 事件 Tab、视频通话、AI 搜索 | `TabEvent/`、`VideoCall/`、`AiSearch/` | 原生模型/服务 | `iot/iot/Modules/IPC/TabEvent/Home/Controller/UGIPCEventViewController.swift:16` |
| IPC | 设备设置 | `SettingMain/` 下 AI、音视频、网络、OTA、分享、存储、隐私区、访问记录等目录 | 原生为主；DeviceSettings RN/KMM 分流 | `iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsRouter.swift:8-30` |
| IPC | 公共与调试 | `Common/`、`Debug/` | 缓存、权限、SwiftUI、第三方、调试 | `iot/iot/Modules/IPC/Common/`（编入主 Target 的目录；其具体入口未在本轮单独定位） |

## 配网（Provisioning）

`Provisioning` 是与 `Modules` 同级的主 Target 编译目录，不是 CocoaPod。它包含旧/原生流、`UGDeviceSetupSDK` 桥和统一 SDK 状态机；不能以目录名推断某一条流已替代另一条。

| 子域 | 功能 | 路由/实现 | 状态接入 | 证据 |
|---|---|---|---|---|
| `DeviceConnectNet/BLEConfigNet` | BLE 搜索、选 Wi‑Fi、连接、成功/失败、设备命名、语音配网。 | 原生控制器/VM/视图；成功页可 push KMP 房间设置。 | N + K | `iot/iot/Provisioning/DeviceConnectNet/BLEConfigNet/Controllers/UGDeviceConnectNetSuccessController.swift:670-754` |
| `DeviceConnectNet/APConfigNet` | AP 配网、添加设备、配置网络与失败处理。 | 原生控制器。 | N | `iot/iot/Provisioning/DeviceConnectNet/APConfigNet/Controllers/UGAPAddDeviceController.swift:11` |
| `DeviceConnectNet/Cellular` | SIM 检测、APN、流量套餐、联网向导、充值、失败/成功与 4G 切换。 | 原生控制器/VM/模型。 | N | `iot/iot/Provisioning/DeviceConnectNet/Cellular/Controllers/UHCellularNetworkGuideViewController.swift:11` |
| `DeviceConnectNet/AIBase` | AI Base 添加、绑定 IPC、连接信息、摆放/选择/切换引导。 | 原生控制器/VM。 | N | `iot/iot/Provisioning/DeviceConnectNet/AIBase/Controllers/UHAIBaseAddDeviceViewController.swift:15` |
| `DeviceConnectNet/Common`、`DeviceReset` | 绑定冲突、失败页、通用配网模型/路由、重置引导。 | 原生控制器/辅助器。 | N | `iot/iot/Provisioning/DeviceConnectNet/Common/Helpers/UGProvisionPostGuideStepRouter.swift:13`；`iot/iot/Provisioning/DeviceConnectNet/DeviceReset/Controllers/UGDeviceResetController.swift:14` |
| `DeviceSetupSDKBridge` | 将 AP/BLE Wi‑Fi flow、后端、错误映射、产品序列号与 feature flag 接到外部 SDK。 | 桥接层。 | N | `iot/iot/Provisioning/DeviceSetupSDKBridge/UGDeviceSetupSDKBootstrap.swift:12` |
| `UGProvisionSDK` | 统一配置、状态机、handler registry、能力/流程 registry 和 delegate。 | `UGProvisionSDK` 持有 `UGProvisionManager`。 | N | `iot/iot/Provisioning/UGProvisionSDK/Core/UGProvisionSDK.swift:13-27`；`iot/iot/Provisioning/UGProvisionSDK/Core/UGProvisionManager.swift:13` |
| `dsbridge` | WebView JavaScript bridge（Objective-C）。 | `DWKWebView` / `InternalApis`。 | N | `iot/iot/Provisioning/dsbridge/DWKWebView.m:1` |

## KMM 功能面

### 导出到 iOS `UgreenHomeShared.framework` 的模块

`app-shared` 生成静态 Framework，并逐个 `export` 下列模块；其 `commonMain` 同时以 `api` 引入它们。因此 iOS 可见的框架 API 面以此清单为准。证据：`ugreenhome-shared/app-shared/build.gradle.kts:18-25,35-85`。

| 模块 | 功能面 | iOS 接入等级 / 代表性入口 |
|---|---|---|
| `core-database` | 跨端数据库接口与 Room 相关实现 | 已导出；KMM 内部 `AppDeviceModule` 使用 `DatabaseProvider`，当前 iOS 宿主触发未确认：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/device/AppDeviceModule.kt:5,71-164` |
| `core-net` | KMM 网络 holder、拦截器、日志 | 已导出；`AppShared.install` 安装网络客户端：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/AppShared.kt:78-115` |
| `core-ui` | Compose UI、主题、图片等基础 UI | 已导出；Shared 根直接使用主题/Compose UI：`ugreenhome-shared/app-shared/src/iosMain/kotlin/com/ugreen/app/shared/UGRootViewController.kt:37-62` |
| `core-mvi` | MVI 基础 | 已导出；由 feature 依赖（声明边见下一文） |
| `core-util`、`core-logger` | 通用工具、日志 | 已导出；Shared 根记录导航错误：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:100-123` |
| `core-kv`、`core-secure-package` | KV 与安全包 | 已导出；App 启动/Shared install 初始化 KV：`iot/iot/Modules/Lanuch/AppDelegate.swift:52-56`；`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/AppShared.kt:64-68` |
| `core-navigation` | Compose 导航与转场 | 已导出；根 `NavHost` 使用：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:60-64,126-145` |
| `core-player` | KMM 播放相关基础能力 | 已导出；未在本轮定位独立 UIKit factory |
| `domain-env` | 环境配置/资源快照 | 已导出；`AppShared.install` 激活环境资源：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/AppShared.kt:92-115` |
| `device-thing-model` | 设备物模型接口/控制器 | 已导出；KMM 内部 `AppDeviceModule` 创建 `DeviceThingModels`，当前 iOS 宿主触发未确认：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/device/AppDeviceModule.kt:10-11,114-123` |
| `device-biz` | 设备仓储、缓存、设备业务 | 已导出；`DeviceRepository` 实际来自此模块的 `com.ugreen.home.device` 包，而非 `domain/domain-device`：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/device/AppDeviceModule.kt:7-9,117-123` |
| `airtc-appsdk` | AI RTC 应用 SDK 适配 | 已导出；本轮未确认其独立原生页面调用链 |
| `feature-auth` | 认证、启动、协议 UI | 已导出且由 KMM 根调用：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:29-35,141-160` |
| `feature-third-party-services` | 第三方服务授权/深链 | 已导出且根导航消费其事件：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/UGRootScreen.kt:37-40,64-97,163-181`；`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/ThirdPartyServicesDeepLink.kt:16-55` |
| `feature-home-management` | 家/房间/设备房间设置 | 已导出；配网成功页和 RN dispatcher 都有 KMM 房间设置桥，例：`iot/iot/Provisioning/DeviceConnectNet/BLEConfigNet/Controllers/UGDeviceConnectNetSuccessController.swift:670-705`、`iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsPageDispatcher.swift:257-270` |
| `feature-device-event` | 设备事件功能与宿主 ports | 已导出；KMM 内部 `AppDeviceModule.eventHostDependencies()` 组装依赖，当前 iOS 宿主触发未确认：`ugreenhome-shared/app-shared/src/commonMain/kotlin/com/ugreen/app/shared/device/AppDeviceModule.kt:55-69` |
| `feature-ota` | KMM OTA 功能 | 已导出；RN 设备设置可打开 OTA：`iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsPageDispatcher.swift:304-337` |
| `feature-playback` | KMM 回放功能 | 已导出；原生存在事件兼容 adapter，不代表完整回放 UI 已迁移：`iot/iot/Modules/IPC/KMP/UGKmpPlaybackEventLegacyAdapter.swift:1-25` |
| `ugreen-strings-kmp` | KMM 生成字符串 | 通过 `app-shared` 的 `api` 暴露：`ugreenhome-shared/app-shared/build.gradle.kts:74-85` |

### 已纳入 KMM Gradle 工程、但不在 iOS 导出清单的模块

| 模块 | 作用 | 本轮结论 |
|---|---|---|
| `domain-family`、`domain-device` | 域模块 | `ugreenhome-shared/settings.gradle.kts:50-58` 已 include，但不在 `app-shared` 的 `exportedModules`。不得画成 `app-shared → domain-family/domain-device` 的直接依赖。 |
| `detekt-rules-kmp` | 静态检查规则 | 已 include：`ugreenhome-shared/settings.gradle.kts:69`；不是 iOS Framework 业务 API。 |
| `ugreen-strings-android` | Android 生成字符串 | 已 include 且指向 Android 生成目录：`ugreenhome-shared/settings.gradle.kts:71-75`；不导出 iOS。 |
| `sample`、`sample-android` | KMM 示例/Android 示例宿主 | 已 include：`ugreenhome-shared/settings.gradle.kts:79-83`；不是 UgreenHome iOS Target。 |

### 非模块目录与构建产物边界

- `ugreenhome-shared/core/core-udc`、`ugreenhome-shared/feature-udc` 虽存在目录，但**不在** `settings.gradle.kts` 的 `include` 清单中；本次不把它们当作当前 KMM 模块。
- `LocalPods/UGDeviceThing/.build` 是构建产物目录；不作为模块、依赖节点或功能接入证据。
- `ugreenhome-shared/build/`、`.gradle/`、`.kotlin/` 同理均为构建/工具状态，不写入功能 Map。

## React Native 宿主与跨端分流

| 项 | 当前实现 | 证据 |
|---|---|---|
| Runtime 容器 | `UHReactNativeRuntime` local Pod 提供 Runtime、bundle loader、registry、ViewController 和 `MMKVCore`/Lottie 依赖。 | `LocalPods/UHReactNativeRuntime/UHReactNativeRuntime.podspec:3-25`；`LocalPods/UHReactNativeRuntime/Sources/` |
| 产品模块 | `DeviceSettings` 是目前已确认的 RN 模块；原生 router 建控制器后 push。 | `iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsRouter.swift:8-30` |
| Bundle | 默认可从 App `Resources/RNBundle/DeviceSettings.ios.bundle` 取嵌入 bundle，开发配置另可改源。 | `iot/iot/Modules/ReactNative/Common/Core/UHReactNativeBundleResolver.swift:382-424` |
| 网络 | RN bridge 启动 KMP auth，取 `NetworkHolder`；注释和 log 都标示 `transport=kmp`，因此这里不应归为 Moya 请求路径。 | `iot/iot/Modules/ReactNative/Common/Core/NetworkRNBridgeService.swift:226-251` |
| 原生能力回跳 | RN Navigation bridge 可退出/跳转或把 capability 分发给原生；设备设置分发器包含房间设置、OTA 等回跳。 | `iot/iot/Modules/ReactNative/DeviceSettings/Service/NavigationRNBridgeService.swift:52-117`；`iot/iot/Modules/ReactNative/DeviceSettings/Service/DeviceSettingsPageDispatcher.swift:257-337` |

## 扩展、LocalPods、SPM 与工具边界

| 边界 | 内容 | 证据 |
|---|---|---|
| Notification Service Extension | 独立 `NotificationService.appex` Target，由主 App embed；没有 Pods 或 KMM build phase。 | `iot/UgreenHome.xcodeproj/project.pbxproj:452-470`；主 Target 依赖/Embed：`421-440` |
| Unit Test Target | `UgreenHomeTests.xctest` 是 app 的 TestTarget；Podfile 仅继承搜索路径。 | `project.pbxproj:472-492,510-513`；`iot/Podfile:104-107` |
| LocalPods | `UHCore`、`UHFoundation`、`UHKit`、`UHFFmpeg`、`UHPlayerSDK`、`UHReactNativeRuntime` 被主 Pod target 引入。播放器 Pod 声明依赖 FFmpeg、Opus、RTCX。 | `iot/Podfile:81-93`；`LocalPods/UHPlayerSDK/UHPlayerSDK.podspec:51-53` |
| Swift Package | 主 Target 仅声明本地 `UGStrings` product；路径是 `.local-packages/UGStrings`。 | `iot/UgreenHome.xcodeproj/project.pbxproj:445-447,533-535,1578-1589` |
| 工具 | `Tools/configure-local-packages.sh` 配置本地 SPM 入口；`Tools/build-rn-bundle.sh` 与 `Tools/rn-bundle-tool/` 构建/校验 RN bundle；`Tools/国际化/` 和 `Tools/LocalizationImportScripts/` 处理国际化；`import_uhkit_images.py` 处理 UHKit 图片。工具不是 App Runtime 模块。 | `iot/Podfile:5-10`；`Tools/` 目录清单 |
