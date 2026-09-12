# KMP 与动态下发调研

## 结论（架构裁决候选）

**KMP 不适合作为动态业务下发载体。** 适合作为双端稳定域与（可选）CMP 静态 UI 共享层。动态/运营/高频变更业务应走 **RN 容器**（规划文档亦写明 RN 为主力跨端 + H5 运营；KMP 用于高性能 UI）。

## 证据

### KMP 现状（ugreenhome-shared）
- 产物形态：iOS static framework / Android AAR，进 App 二进制
- Source sets：commonMain + androidMain + iosMain；**无 jsMain / wasm**
- 无 Dynamic Feature / SplitInstall / 可下载 KMP 模块
- `feature-ota` = **设备固件** OTA，不是 App/业务热更新
- CMP UI 随 App 发版，不能热换

若强行用 KMP 做动态下发，需自建：下载、签名、ABI 兼容、Kotlin/Native 动态库加载、商店审核策略——复杂度与风险远高于收益。

### RN 现状
- 模块化 ZIP + manifest（SHA-256）
- Android `:rn-platform` 有远端更新 phase-1（Ed25519 等），生产仍以包内嵌为主
- iOS 宿主接线弱于 Android（feature 分支 / bundle stub）
- 无 CodePush；自建管道更可控

### 团队规划文档表述（平台架构设计与规划）
- 跨端容器：**RN**、**H5（动态运营）**、**KMP（高性能 UI）**
- 阶段一：确立 **RN 为主力**跨端，非核心页（设置等）试运行

## 推荐分工（草案）

| 能力类型 | 载体 | 发版节奏 |
|----------|------|----------|
| 会话/环境/网络/物模型/设备域状态 | KMP commonMain | App 发版 |
| 稳定、强一致、高性能交互 UI | KMP CMP 或 Native | App 发版 |
| 设备面板、设置类、易变业务页 | RN 模块 | 包内嵌 → 远端 ZIP |
| 运营活动、营销页 | H5 容器 | 远端 |

## 混合架构含义
需要一张 **Host Runtime 编排图**：谁拥有导航、Auth、网络、设备事实；RN/KMP/Native 如何订阅同一 DeviceUnifiedState，禁止三套状态机。
