# KMP 与动态下发调研

## 结论（架构裁决）

**不把 KMP/KMM 选作业务动态化主路径。**  
KMP 适合编译期双端复用（Domain/Data/MVI + 可选 CMP）。动态/运营业务走 **RN（主）+ H5（运营）**。

网上「KMP 动态化」多把不同问题混在一起，见下表。

## 网上常见方案 vs 可用性

| 说法 | 实际 | 对本 App |
|------|------|----------|
| Android Dynamic Feature | 商店分发的 split，非热修 | 仅 Android；iOS 无对等模型 |
| 下载 .so / 动态 Framework | 运行时加载原生码 | iOS 审核红线；不可作主方案 |
| Kotlin/JS · Wasm | 另建 target + Web 壳 | 与现网 CMP/iOS Native 主轴分叉，ROI 差 |
| Server-Driven UI | 配置/描述下发 | 可做，但不是「KMP 热更」 |
| KMP 域 + RN/H5 UI | 逻辑发版、UI 动态 | **推荐，与宪法一致** |

## 证据（工程现状）

- 产物：iOS framework / Android AAR，进 App 二进制
- Source sets：commonMain + androidMain + iosMain；无业务热更管道
- `feature-ota` = **设备固件** OTA，不是 App/业务热更新

## 推荐分工

| 能力类型 | 载体 | 发版节奏 |
|----------|------|----------|
| 会话/环境/网络/物模型/设备域状态 | KMP commonMain | App 发版 |
| 稳定、强一致、高性能交互 UI | KMP CMP 或 Native | App 发版 |
| 设备面板、设置类、易变业务页 | RN 模块 | 包内嵌 → 远端 ZIP |
| 运营活动、营销页 | H5 容器 | 远端 |

## 逻辑组件化（防上帝债）

阶段一不强制 iOS 物理拆仓，但必须执行宪法 **§5.0**：能力分包、禁止扩大上帝类、Composition Root 唯一装配、Bridge 收口。物理组件化另开子 Spec。
