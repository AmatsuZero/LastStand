---
title: "Xcode Archive 的 Manifest 标题是 Archiving，采集失败须保留原始日志"
date: 2026-11-13T15:24:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "Xcode"]
---

## 现象

真实 unsigned Archive 编译成功，但日志采集返回没有匹配 `archive` action 的
activity log，分析 Job 因缺少输入 metadata 失败。构建 Job 的成功退出不能代表
采集、Artifact 传输和解析链路成功。

## 已验证成因

在 Xcode 26.5 / 17F42 的 macOS Runner 上，用只有一个 Swift 文件的小框架
执行真实 Archive，Manifest 的 `title` 和 `signature` 均为
`Archiving project Probe with scheme Probe`。本机 Xcode 27.2 / 27B52 同样如此。
采集器只接受 `Archive`，因此会拒绝这个合法标题。此前测试中的 `Archive
workspace ...` 是人为构造，不能替代真实格式验证。

首个 App 构建的未匹配日志没有被加入 Artifact，随后被正常 Job cleanup
删除，无法回看其 Manifest 来确认是否还有其他原因。保留下来的文本构建日志
包含成功退出和真实 Swift 诊断输出，但不是原始 activity log 的替代品。

## 有效恢复

将已观察到的 `Archiving` 明确映射为 `archive`，保留 scheme、起止时间、
快照已知 ID 与唯一候选校验；不能改成取最新 mtime 或任意一个日志。
新增真实标题形状的回归测试，先复现失败再修复；修复后的采集器已成功处理
上述 Runner 小框架的真实日志。

同时在匹配失败时，单独保留本次隔离 DerivedData 内的 `.xcactivitylog`、
`LogStoreManifest.plist` 和采集前 snapshot，标为未匹配证据，不伪装成有效输入。
Artifact 只包含这些日志和元数据，不传完整 DerivedData 或构建产物。

## 边界

- 小框架验证修复和格式，不能代替当前 App、目标覆盖或性能开销验收。
- 不依赖跨 Runner 的 DerivedData；分析 Job 只消费成功关联的日志包。
- 保留原始构建退出码，并通过独立采集状态与分析 Job 暴露采集失败。
- 日志保留属于失败兜底，必须在 Runner cleanup 之前完成并上传。
- 本文只验证英文 `Archiving`；没有证据支持放宽其他本地化标题或未知 action。

## 证据

Runner 小框架 Job 约 3.2 秒完成，产生一份 12,483 bytes 的真实压缩 activity
log。Manifest 显示 `IDECommandLineBuildLog`、正确 scheme 和 Apple epoch 起止时间。
标题匹配与失败日志保留两项测试先失败，修复后采集相关 17 项测试通过；
同一真实小框架输入的采集退出码为 0。原始样本保留在私有实验证据中，未公开。
