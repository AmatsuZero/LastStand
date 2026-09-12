# KMP Feature Toolkit 摘要

路径：`/Users/daubert/UGreen/kmp-feature-developer-toolkit`

## 是什么
Role-first 的 KMP Feature **设计 / 生成 / 检查 / 维护** 工具 + AI Skills 工作流。把 Architecture Contract、Code Role、Recipe、物理布局变成可机器校验的资产。

## 解决什么
不是“多生成几个文件”，而是统一：
- 一个 Feature 里什么代码属于什么 Role
- Role 之间允许的依赖方向
- 双端 Composition Root / Adapter 边界
- 生成后的架构检查与验证闭环

## 目标分层（硬方向）
```
App Shell（Android/iOS Host）
  Composition Root → 装配 Repository/Capability/导航/Session
KMP Feature
  Presentation (CMP Screen / UiContract / VM)
  Domain (Model / UseCase / Ports)
  Data (RepoImpl / Remote / Local / Coordinators)
  Assembly (FeatureFactory)
  Platform adapters (androidMain/iosMain)
```
依赖：Presentation → Domain ← Data；Assembly 只接线。

## 硬规则（Accepted ADR 摘要）
- 依赖：`ui → domain ← data`；Domain 零平台 SDK
- **ADR-002**：Shared `FeatureFactory` ≠ App Composition Root；**双端各自拥有 Root**
- **ADR-006**：多 Gradle 源码模块 OK；iOS 默认 **一个 Shared XCFramework** 交付
- **ADR-001/003/005**：Factory 作用域跟宿主导航；Port Main-safe；只在最近阻塞边界阻塞
- **ADR-004**：Domain 显式错误模型；DTO/HTTP/SDK 错误停在 Data

物理布局冻结：`commonMain` = domain/data/presentation/assembly；`androidMain|iosMain` = adapter + assembly。Host Activity/Root 留在 app 模块。

## 成熟度提示
Golden Path = `feature-auth`，**Android-first**；iOS Simulator / 生产宿主证据未齐。iOS CMP Presentation Adapter Recipe/Evidence 仍缺口。

## 明确不覆盖
- RN 容器与动态下发
- 设备 SDK 生产验收 / Composition
- 业务规则裁决、跨 Feature 产品图
- 多 Framework 分包（需未来 ADR）

## 对混合架构的含义
1. KMP 统一面优先 Domain/Data/MVI；双端各自 Composition Root
2. CMP Screen 走 Golden Path；Native/RN 只做 Host，经 Ports 接共享能力
3. 设备 SDK 藏在 `capability-port` + platform adapter
4. RN/动态业务在 Feature Role 合同**之外**，在 Shell 桥接 UseCase/Port
5. Toolkit = Feature 施工规范；**Host 三栈拓扑另写 App Spec**
