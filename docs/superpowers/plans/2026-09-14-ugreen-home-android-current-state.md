# UGreen Home Android 项目现状 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 参考 iOS 现状笔记，为 Android 主工程建立九篇可追溯的架构、构建与测试基线，并用 iOS Shared 子模块的隔离副本完成 KMP 依赖排查。

**Architecture:** 以 `/Users/daubert/UGreen/ugreen-home` 为 Android 宿主事实源，按 iOS 的 `00`–`08` 维度输出专题文档。Android 文档只保留 Android source set、宿主调用、依赖替换、平台差异和本轮验证；共用 KMP 实现通过 iOS 现状文档交叉引用。构建和测试全部在 `/private/tmp` 隔离副本进行。

**Tech Stack:** Android Gradle Plugin、Gradle/Groovy、Kotlin、Jetpack Compose/ViewBinding、Kotlin Multiplatform Composite Build、React Native runtime、播放器 providers、JVM/Android unit tests、Markdown/Mermaid。

**Spec:** `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/调研方案与执行记录.md`

## Global Constraints

- Android 主工程原配置为 `ugreenHomeSharedPath=../UgreenHome-Shared`，该平级 checkout 不存在；不把路径声明当作现状事实。
- 临时验证从 iOS 仓库 Shared Git 对象库 `/Users/daubert/UGreen/ugreenhome/ugreenhome-shared` 导出与主工程同名 `release/1.7.0` 分支的隔离副本（4f36969b；字符串子模块按313160d8固定提交），优先通过 `-PugreenHomeSharedPath=<path>` 覆盖。
- 不修改 Android 源工程、iOS Shared checkout、依赖锁定、分支或业务代码；不执行发布、上传、依赖升级或破坏性缓存清理。
- 声明依赖、运行时调用、静态测试数量和实际执行结果必须分栏记录。
- 共享 KMP 内容引用 iOS 现状文档，不重复抄录；Android 差异和验证证据必须独立可读。
- 每种构建/测试命令记录配置、variant、退出码、wall time、缓存边界和阻断原因；失败耗时不计为成功基线。

---

### Task 1: 建立快照与证据索引

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/00-调研总览.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/环境与版本快照.json`
- Modify: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/调研方案与执行记录.md`

- [x] 记录 Android HEAD、分支、工作区状态、Gradle/JDK/SDK、Shared HEAD、`ugreen-media` 子模块状态和原配置缺失路径。
- [x] 建立阅读导航与范围/非目标，明确“原配置缺失”与“临时 Shared 集成验证”是不同证据。
- [x] 记录 iOS 现状文档的交叉引用入口及去重规则。
- [x] 检查 JSON 不包含密码、token、签名私钥或私仓凭据。

### Task 2: 盘点 Android 功能、模块与依赖

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/01-Feature-Map.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/02-Module-Dependency-Graph.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/03-Core-Dependencies.md`

- [x] 从 `settings.gradle`、各模块 Gradle 文件和 source set 清点实际模块；标注 `app`、`base`、`rn-platform`、推送/崩溃 provider、播放器、`ugreen-media` 和 Shared Composite Build。
- [x] 从 manifest、Application、主要 Activity/Compose 入口和代表性业务包建立 Feature Map，给出源码路径与行号。
- [x] 分开绘制 Gradle 声明边与源码运行时调用；对 Shared 模块只记录 Android substitution 和调用边，链接 iOS 共享实现说明。
- [x] 展开 Network、Database、Account、Analytics、Navigation；记录三方版本与用途，不逐行审计第三方源码。
- [x] 用 Mermaid 表达主要宿主、KMP、RN、播放器、推送链路，避免把目录名当作用户入口。

### Task 3: 梳理状态与跨模块通信

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/04-State-Ownership.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/05-Feature-Communication.md`

- [x] 追踪登录/登出、首页设备、家庭/设备关系、RN runtime、推送 token、播放器会话和持久化缓存的 owner、读写、订阅、清理。
- [x] 区分 Activity/ViewModel/Repository/Room/DataStore/Shared/KMP state 与单例缓存；记录线程/异步边界可验证部分。
- [x] 产出 producer→consumer 矩阵及至少三条有源码证据的 Mermaid sequence diagram。
- [x] 对共用 KMP 链路引用 iOS 文档，并只补 Android adapter、source set 和宿主入口差异。

### Task 4: 隔离准备并执行构建实测

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/06-Build-Time.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/构建执行记录.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/构建环境.json`

- [x] 在 `/private/tmp` 复制 Android 工程和 iOS Shared 子模块副本，保留必要 Git submodule/资源；确认原工程状态未变。
- [x] 先运行 `./gradlew projects` 与 variant/task 查询，选择一个可用 Debug 主 App variant，记录 flavor、签名和外部服务脚本边界。
- [x] 运行带临时 `-PugreenHomeSharedPath` 的 clean 构建；记录成功或失败、退出码、耗时、依赖准备与缓存命中。
- [x] 仅在 clean 成功后修改一个业务源码文件，运行同副本同 variant 增量构建，验证编译任务实际执行后还原文件。
- [x] 若 clean 因 Shared/API/资源/子模块失败，保留阻断证据，不伪造增量成功基线，并单独说明原配置路径缺失。
- [x] 检查构建产物、日志和快照不泄露密钥；完成后复核 Android/iOS 工作区状态。

### Task 5: 清点并执行测试

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/07-Testing.md`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/测试源码清单.csv`
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/测试执行记录.md`

- [x] 统计 `app/src/test`、`app/src/androidTest`、各 library/KMP source set 的测试文件与案例方法，并区分单元、集成、UI、设备测试。
- [x] 先执行可安全运行的 JVM unit test；设备测试仅在存在可用设备/模拟器且不会连接真实用户 IoT 会话时尝试。
- [x] 记录每套测试的命令、案例数、通过/失败/跳过、退出码、wall time 和覆盖率可用性；源码数量不得写成执行结果。
- [x] 共享 KMP 测试只引用 iOS 文档已确认的共用事实；Android 测试结果单独实测并记录版本差异。

### Task 6: 完成总览、空白痛点与验收

**Files:**
- Create: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/08-Known-Pain-Points.md`
- Modify: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/00-调研总览.md`
- Modify: `obsidian/UGreen-Architecture/UGreen Home Android 项目现状/附件/调研方案与执行记录.md`

- [x] 将主要结论按证据/推断/未验证分级，汇总构建和测试实际结果及边界。
- [x] `08-Known-Pain-Points.md` 只保留标题。
- [x] 检查九篇文档之间的相对链接、源码行号、Shared 去重引用、Mermaid 图和敏感信息。
- [x] 复核 Android 源工程、iOS Shared checkout、子模块状态与调研前一致。
- [x] 运行 `git diff --check`，记录未能执行的验证及精确原因；后续产物不自动提交或推送；保留 LastStand 文档变更供审阅。

## Self-review checklist

- [x] 覆盖设计文档中的 Shared 临时路径、去重引用、隔离构建、实测和源工程保护要求。
- [x] 未发现 TBD/TODO 或未定义接口；本计划只描述文档与命令，不引入产品代码接口。
- [x] 任务依赖顺序明确：快照 → 静态盘点 → 状态通信 → 构建 → 测试 → 汇总验收。

## 执行修正（用户反馈）

- 原 Shared 工作树 feature/samzhjiang/explore 不符合 Android README 的同名分支约定；现按 release/1.7.0 固定提交导出隔离副本，不切换原工作树。旧分支配置失败仅保留为历史诊断。
- 源码调查可并行，构建先配置检查再编译，测试先确认任务与安全边界。源工程不变；本轮没有新建 Git worktree，已批准输出仍落在当前 LastStand 目录。

## 完成口径

任务按“调研并如实记录”验收，不以修复现有产品测试为目标。设备测试未执行，覆盖率未取得；源码保护经历经审批恢复例外，详见执行记录。原平台缺失路径不回写；同分支隔离验证已完成。后续产物不自动提交/推送，不创建或合并产品分支。
