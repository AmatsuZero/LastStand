+++
title = "耗电-定位与传感器优化"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 12
tags = ["iOS", "性能优化", "耗电"]
categories = ["iOS开发", "性能优化"]
+++
定位是iOS设备上公认的"耗电大户"，GPS冷启动一次动辄十几秒的高功耗；传感器（加速度计、陀螺仪等）虽然单次功耗不高，但高频采样会累积成可观的电量消耗；屏幕则是 **持续** 耗电的模块，其功耗和亮度、刷新率、像素颜色都强相关。本文聚焦这三类问题，给出工程化的优化方案。

---

## 一、定位精度与功耗的关系

iOS通过 `CLLocationManager` 提供定位服务，底层融合了 **GPS、蜂窝基站、WiFi、蓝牙信标** 等多源信号。精度越高，需要开启的硬件越多，功耗越高。

| 精度常量                                      | 精度范围  | 硬件使用                | 典型功耗 |
| ----------------------------------------- | ----- | ------------------- | ---- |
| kCLLocationAccuracyBestForNavigation      | <5m   | GPS + 传感器融合（需插电）     | 极高   |
| kCLLocationAccuracyBest                   | ~10m  | GPS持续               | 高    |
| kCLLocationAccuracyNearestTenMeters       | ~10m  | GPS + WiFi          | 高    |
| kCLLocationAccuracyHundredMeters          | ~100m | WiFi + 基站           | 中    |
| kCLLocationAccuracyKilometer              | ~1km  | WiFi + 基站（低频）       | 低    |
| kCLLocationAccuracyThreeKilometers        | ~3km  | 基站                  | 极低   |

> 注：iOS 14+ 引入的 **ReducedAccuracy** 是用户授权层面的"粗略位置"，通过 `CLAccuracyAuthorization.reducedAccuracy` 体现，而不是 `desiredAccuracy` 常量。即使 App 申请了高精度，只要用户选择了"粗略位置"，系统就只会返回约5公里精度的数据，功耗也随之降到极低。

### 不同业务场景的精度选择

| 业务            | 推荐精度                                                 |
| ------------- | ---------------------------------------------------- |
| 导航            | BestForNavigation（仅使用中 + 插电时）                        |
| 打车、骑行记录       | Best                                                 |
| 外卖、附近的人       | HundredMeters                                        |
| 天气、资讯推荐       | Kilometer 或 ThreeKilometers                          |
| 反欺诈、粗粒度风控     | ReducedAccuracy（尊重隐私 + 省电）                           |

### 常见反例

```swift
// Bad: 所有场景都用Best，页面打开就开，关闭不关
locationManager.desiredAccuracy = kCLLocationAccuracyBest
locationManager.startUpdatingLocation()

// Bad: distanceFilter用kCLDistanceFilterNone，每次都回调
locationManager.distanceFilter = kCLDistanceFilterNone
```

### 正确姿势：按需精度 + 距离过滤

```swift
class WeatherLocationClient: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var completion: ((CLLocation) -> Void)?
    
    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyKilometer
        manager.distanceFilter = 500   // 500米才更新
    }
    
    func requestOnce(_ completion: @escaping (CLLocation) -> Void) {
        self.completion = completion
        manager.requestLocation()  // 一次性定位，完成后自动停止
    }
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locs: [CLLocation]) {
        guard let loc = locs.last else { return }
        completion?(loc)
        completion = nil
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        completion = nil
    }
}
```

`requestLocation()`（iOS 9+）是最省电的一次性定位入口，系统会在获取到满足精度的定位后自动停止硬件。

---

## 二、后台定位的正确使用

### 后台定位的触发方式

```mermaid
flowchart LR
    A["App进入后台"] --> B{是否申请<br/>backgroundMode}
    B -->|否| Stop["定位自动停止"]
    B -->|是| C{使用哪种定位}
    C -->|startUpdatingLocation| Continuous["持续定位<br/>需要allowsBackgroundLocationUpdates=YES<br/>显示蓝色/橙色状态条"]
    C -->|startMonitoringSignificantLocationChanges| Sig["重要位置变化<br/>系统控制唤醒<br/>功耗极低"]
    C -->|startMonitoring(for: region)| Region["区域监控<br/>进出指定区域唤起App"]
    C -->|startMonitoringVisits| Visit["访问监控<br/>到访/离开地点"]
```

### 能效优先的后台定位选择

**优先级：Visits > Region Monitoring > Significant Change > 持续定位**

```swift
// SignificantLocationChange：位置发生500m+变化或切换基站时唤起
manager.startMonitoringSignificantLocationChanges()

// Region Monitoring：进入/离开指定圆形区域时唤起
let region = CLCircularRegion(
    center: center,
    radius: 200,
    identifier: "home"
)
region.notifyOnEntry = true
region.notifyOnExit = true
manager.startMonitoring(for: region)

// Visits：系统判定"有意义的到访"时唤起
manager.startMonitoringVisits()
```

这些API的精妙之处在于 **系统级融合** —— 苹果能结合iOS全局的位置信号判断，而不需要你自己常驻高精度定位。

### 持续定位的收敛方式

如果业务必须持续后台定位（比如骑行记录、车机轨迹），请尽早收敛：

```swift
class TrackingSession {
    private let manager = CLLocationManager()
    
    func start() {
        manager.desiredAccuracy = kCLLocationAccuracyBest
        manager.distanceFilter = 20
        manager.allowsBackgroundLocationUpdates = true
        manager.pausesLocationUpdatesAutomatically = true  // 系统判定用户静止时自动暂停
        manager.activityType = .fitness                    // 让系统优化电池
        manager.startUpdatingLocation()
    }
    
    func stop() {
        manager.stopUpdatingLocation()
        manager.allowsBackgroundLocationUpdates = false
    }
}
```

关键API：

- `pausesLocationUpdatesAutomatically = true`：让iOS在判断用户停止移动时自动暂停。
- `activityType`：告诉系统这是什么活动（fitness/automotive/airborne/otherNavigation），系统会据此优化。
- `allowsBackgroundLocationUpdates`：必须配合Info.plist的Background Mode: Location才能生效。

---

## 三、定位权限与隐私

从iOS 13开始，权限申请的颗粒度变细：

- **"使用时允许"**：只有前台+ App状态条显示时才能定位。
- **"始终允许"**：后台也可以。
- **"不允许"**。
- **ReducedAccuracy (iOS 14+)**：即使给了精确权限，用户也可以切到"粗略位置"。

建议：

- **默认申请"使用时"权限**，只在必要时再申请"始终"。
- **尊重ReducedAccuracy**：通过 `requestTemporaryFullAccuracyAuthorization(withPurposeKey:)` 临时请求精确定位。

```swift
if manager.accuracyAuthorization == .reducedAccuracy {
    manager.requestTemporaryFullAccuracyAuthorization(withPurposeKey: "Navigation") { error in
        // 用户选择后的回调
    }
}
```

### 定位能效检查清单

- [ ] 是否只在可见页面打开定位？
- [ ] 页面消失是否立即关闭？
- [ ] 精度是否按需最低？
- [ ] distanceFilter是否合理？
- [ ] 能否用Visits/SignificantLocation/Region代替持续定位？
- [ ] 后台定位是否设置了activityType和pausesLocationUpdatesAutomatically？
- [ ] 后台任务完成后是否调用stopUpdatingLocation？
- [ ] 是否尊重用户的ReducedAccuracy选择？

---

## 四、传感器优化

iOS设备有多种运动传感器，通过 `CoreMotion` 框架暴露：

| 传感器/数据              | 典型用途         |
| ------------------ | ------------ |
| Accelerometer      | 摇一摇、姿态       |
| Gyroscope          | 陀螺仪、AR       |
| Magnetometer       | 指南针          |
| Barometer          | 气压/海拔        |
| Device Motion      | 融合数据（推荐使用）   |
| Pedometer          | 计步（系统层优化好）   |
| Motion Activity    | 系统给出的活动分类（低耗） |

### 统一原则：能用融合数据就用融合数据

`CMDeviceMotion` 是苹果对多传感器的融合结果，比直接读raw数据效率更高，也更稳定：

```swift
let motionManager = CMMotionManager()
motionManager.deviceMotionUpdateInterval = 1.0 / 30.0  // 30Hz
motionManager.startDeviceMotionUpdates(to: .main) { motion, error in
    guard let m = motion else { return }
    // attitude, rotationRate, userAcceleration, gravity
}
```

### 采样频率是关键

```swift
// Bad: 100Hz采样，即使视图已经不可见
motionManager.accelerometerUpdateInterval = 0.01
motionManager.startAccelerometerUpdates(to: .main) { ... }

// Good: 按需采样
motionManager.deviceMotionUpdateInterval = 0.2  // 5Hz就够的场景别开更高

// Better: 页面消失时停止
override func viewWillDisappear(_ animated: Bool) {
    super.viewWillDisappear(animated)
    motionManager.stopDeviceMotionUpdates()
}
```

### 用系统能力代替自己采样

- **计步**：使用 `CMPedometer`，系统用专用协处理器（M芯片）处理，几乎不耗电。
- **活动识别**：使用 `CMMotionActivityManager`，系统分类（走路、跑步、驾车等）是长驻的低功耗服务。
- **方向**：使用 `UIDevice.orientation` 或 `CMDeviceMotion.attitude`，比自己读陀螺更准。

---

## 五、屏幕功耗优化

屏幕是iOS设备最持续的耗电模块。根据 [耗电-原理](./耗电-原理.md)，OLED的功耗和像素颜色直接相关。

### OLED友好UI

- **深色模式优先**：纯黑背景的像素几乎不耗电，相比全白界面可省电20%~30%。
- **减少大面积高亮色块**：比如白底App可以考虑提供深色主题。
- **MetricKit验证**：通过 `averagePixelLuminance` 指标量化不同界面的亮度差异。

### 自适应刷新率（ProMotion）

ProMotion屏幕支持10~120Hz自适应。系统默认会根据内容自动降频，但App的主动提示能进一步帮助：

```swift
if #available(iOS 15.0, *) {
    let link = CADisplayLink(target: self, selector: #selector(tick))
    // 静态内容：10~30Hz就够
    link.preferredFrameRateRange = CAFrameRateRange(
        minimum: 10, maximum: 30, preferred: 20
    )
    link.add(to: .main, forMode: .common)
}
```

对应UIView/UIWindow层面：

```swift
if #available(iOS 15.0, *) {
    view.window?.windowScene?.preferredFrameRateRange = 
        CAFrameRateRange(minimum: 10, maximum: 60, preferred: 30)
}
```

### 减少不必要的动画

- 持续的"呼吸动画"、Loading动画 → 用户不可见时暂停。
- 复杂的转场动画 → 弱设备/低电量下降级。
- 视差滚动 → 非关键场景关闭。

### 屏幕常亮（idleTimerDisabled）

`UIApplication.shared.isIdleTimerDisabled = true` 会让屏幕一直不灭，功耗直接翻倍。应该：

- 只在必要场景开启（视频全屏、导航、阅读）。
- 退出场景时立即恢复。
- 考虑只在播放视频/导航中的路径保持常亮。

---

## 六、音视频与相机

### AVAudioSession分类

不同category对能效影响很大：

| Category              | 后台播放 | 录音 | 是否阻塞睡眠 |
| --------------------- | ---- | -- | ------ |
| ambient               | 否    | 否  | 否      |
| soloAmbient (默认)      | 否    | 否  | 否      |
| playback              | 是    | 否  | 是      |
| record                | 是    | 是  | 是      |
| playAndRecord         | 是    | 是  | 是      |
| multiRoute            | 是    | 是  | 是      |

错选了playAndRecord但其实不需要录音，会让音频子系统长期高功耗。

### 视频播放

- **硬解优先**：AVPlayer默认用VideoToolbox硬解，远比软解省电。
- **自适应码率**：HLS/DASH根据网速自动切清晰度，同时也影响GPU渲染功耗。
- **自动暂停不可见视频**：列表中的自动播放，视频完全滑出后立即pause。

### 相机

- **AVCaptureSession要在需要时start、不需要时stop**，不能因为方便而长驻。
- **分辨率和帧率按需选择**：1080p 60fps的功耗远高于720p 30fps。

---

## 七、Haptics与震动

`UIFeedbackGenerator` 和 `CoreHaptics` 的震动反馈虽然体感很好，但高频触发会让 **Taptic Engine** 持续耗电。常见问题：

- ScrollView滚动时每个item都震动。
- 长按列表每秒震一次。

建议：

- Haptic只用于"关键反馈"。
- 用户设置里提供"关闭震动反馈"选项。
- 在低电量模式下禁用非必要Haptic。

---

## 八、适配Low Power Mode

当用户开启低电量模式后，App应该主动降级：

```swift
class EnergyPolicy {
    
    static var isLowPower: Bool {
        ProcessInfo.processInfo.isLowPowerModeEnabled
    }
    
    static func apply() {
        if isLowPower {
            // 降帧率
            ProMotionPolicy.capTo(30)
            // 关闭自动播放
            VideoAutoplayPolicy.disabled = true
            // 降精度定位
            LocationPolicy.accuracy = .kilometer
            // 关闭预加载
            PrefetchPolicy.enabled = false
            // 暂停非必要后台同步
            BackgroundSyncPolicy.paused = true
        }
    }
}

// 监听变化
NotificationCenter.default.addObserver(
    forName: .NSProcessInfoPowerStateDidChange,
    object: nil,
    queue: .main
) { _ in
    EnergyPolicy.apply()
}
```

苹果甚至建议在Low Power Mode下主动展示一个提示："当前处于低电量模式，部分功能已降级"。

---

## 九、小结

| 维度    | 关键优化点                                                                 |
| ----- | --------------------------------------------------------------------- |
| 定位精度  | 能低不高，按需选择Accuracy常量                                                    |
| 后台定位  | Visits/Region/SignificantChange优先，持续定位必须配合activityType和pausesAutomatically |
| 权限    | 默认"使用时"，尊重ReducedAccuracy                                              |
| 传感器   | 用融合数据、降采样率、视图生命周期管理                                                   |
| 屏幕    | 深色模式、ProMotion自适应帧率、关闭常亮                                               |
| 音视频   | 正确的AudioSession分类、硬解、按需start/stop                                      |
| Haptic | 仅用于关键反馈，低电量模式下降级                                                      |
| Low Power Mode | 动态降级预加载/自动播放/后台同步                                                |

下一篇进入 [耗电-治理](./耗电-治理.md)，把前面的知识整合成完整的工程化治理体系。
