---
title: "Firebase Crashlytics 10.29.0 隐私同意与待传报告边界"
date: 2026-11-21T16:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["iOS", "Crashlytics", "踩坑", "依赖"]
---

## 现象

应用需要在用户同意隐私协议后才记录业务诊断。Crashlytics 关闭自动采集时，崩溃产生的报告仍可能留在本地，之后一次 `sendUnsentReports()` 会处理此前运行留下的全部待传报告。若撤回协议后在同一进程重新同意，SDK 没有按报告或同意周期筛选的公开接口，容易把撤回前的数据与新数据混在一起。

## 已验证成因

锁定的 FirebaseCrashlytics 10.29.0 源码显示，`startWithProfiling` 会先创建当前运行的报告，然后在自动采集关闭时等待一次性 action。`sendUnsentReports` 和 `deleteUnsentReports` 都只 fulfill 同一个 `_reportActionProvided` promise，首次 action 决定本次运行如何处理待传报告。源码位置为 `Crashlytics/Controllers/FIRCLSReportManager.m` 的 `261-269`、`288-360`。

`FIRCLSExistingReportManager` 明确说明，报告转成 GoogleDataTransport 事件并交给 GDT 后，即使 Crashlytics 收集开关关闭，报告仍会上传。这个交接点之后没有撤回能力。源码位置为 `Crashlytics/Controllers/FIRCLSExistingReportManager.h` 的 `37-42`。

自动采集关闭时，SDK 会先创建当前运行的报告，再等待 `send/deleteUnsentReports`。自动采集开启时，SDK 会在启动阶段上传并删除待传报告。公开头文件 `FIRCrashlytics.h` 的 `180-244` 同时说明了这两个 API 的启动语义，以及未调用 action 时报告会继续留在磁盘。

## 有效恢复

把协议同意作为应用层资格位管理，并在 Crashlytics 启动前完成本地状态判断。

- 未同意或撤回成功后，关闭 Crashlytics 收集并调用 `deleteUnsentReports()`，同时停止业务上下文和 non-fatal 写入。
- 同一进程中重新同意时，继续丢弃该次运行的混合报告，不调用 `sendUnsentReports()`。
- 下次干净启动且仍然同意时，先清理此前无法证明获得同意的报告，再恢复新运行的记录。继续同意的下一次启动再发送已确认属于当前同意周期的报告。
- 账号退出只清空用户 ID 和业务上下文，不等同于撤回协议，也不删除当前同意周期的报告。

该策略依赖应用自己的持久化资格位，因为 Firebase 10.29.0 没有按报告筛选、删除完成回调或同意周期标识。清理失败时应保留可观察日志并在下一次启动重试，不能把“调用了删除 API”当成服务端撤回证明。

## 边界

- 已交给 GoogleDataTransport 的事件可能继续上传，应用无法通过 Crashlytics 公开 API 撤回。
- `deleteUnsentReports()` 只适用于自动采集关闭的待传报告。自动采集打开时，SDK 在启动阶段自行处理报告。
- 同一进程撤回后重新同意无法可靠区分一份混合报告中的字段来源，因此必须接受丢弃这份运行报告。
- 该结论针对仓库锁定的 FirebaseCrashlytics `10.29.0`。升级 SDK 后必须重新检查报告 action、GDT 交接和删除语义。
- 本次验证是源码和本地测试替身验证，未把真实报告发送到 Firebase 控制台，也不覆盖 arm64 模拟器收报。

## 证据

- `FirebaseCrashlytics (10.29.0)` 出现在应用 `Podfile.lock` 的依赖和 checksum 清单中。
- `FIRCLSReportManager.m:292-300` 先创建当前运行报告，`FIRCLSReportManager.m:330-355` 在自动采集关闭时等待一次 action，并据此选择上传或删除。
- `FIRCLSExistingReportManager.h:37-42` 记录了 GDT 交接后仍会上传的边界。
- `FIRCrashlytics.h:216-244` 记录了待传报告会留盘、`sendUnsentReports` 与 `deleteUnsentReports` 的公开契约。
- 回归测试覆盖未同意、已同意启动、撤回、重新同意、清理失败和账号退出后的上下文处理。
