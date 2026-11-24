---
title: "原生 Xcode CAS 跨机回放：完整 workspace 的命中分层与传输开销"
date: 2026-11-24T07:50:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "Xcode", "macOS"]
---

## 现象

需要确认原生 Xcode 内容寻址缓存（CAS）在两台物理 Apple silicon Mac 间恢复后，完整
iOS App workspace 的各类编译输入是否真的复用。实验固定为同一提交、相同 Pods 和锁文件，
使用全新的 DerivedData、Xcode 26.5（17F42）和 arm64 iPhoneOS Beta 未签名构建。

两台机器使用不同的实际 Xcode 安装路径。Swift/Clang prefix mapping 与 project prefix
mapping 均已启用，因此本例测试的是这组明确映射配置下的跨机回放，不能把不同 Xcode 路径
直接等同于无法复用。

## 已验证成因

生产端和消费端从空 CAS 开始，首次构建都是 0/2793 命中。消费端恢复 NAS 快照后达到
2708/2793 命中，说明完整 CAS 快照已经被恢复并由部分编译输入复用。

命中需要按语言和输入类别拆分读取：App Objective-C 与 Objective-C++ 等 Clang 源为
44/44，依赖的 Clang 源为 1291/1291，显式模块为 1372/1395，桥接头 PCH 为 1/1。
App 与扩展各自的 Swift compile 动作，以及全部依赖的 Swift 编译与 emit，都没有复用。
Swift 指标不按源码文件计数，不能将这里的 0 命中直接换算成 Swift 文件数量。

## 有效恢复

跨机 replay 应先冻结提交、Pods、锁文件、目标架构、SDK、构建配置和 prefix mapping，
再使用新 DerivedData 分别记录空 CAS、恢复后的 CAS 和各类别编译命中。

本次 CAS 快照为 907,157,589 字节。写端压缩为 47.742 秒、哈希为 0.303 秒、上传为
9.603 秒。消费端下载为 7.734 秒、哈希为 0.342 秒、解压为 3.254 秒。将这些传输和恢复
开销与构建时间一并保留，才能判断一次 replay 的端到端成本。

同一组单轮测量中，消费端冷构建为 339.886 秒，恢复后的热构建为 291.529 秒。该差值是
本次完整实验的观测结果，不能归因于任一单独开关或外推为其他工程的预期收益。

## 边界

- Swift/Clang prefix mapping 和 project prefix mapping 在本例均开启。结果不说明所有项目
  都无需统一 Xcode、workspace 或派生目录路径。
- 实验通过 SSH 定点执行，未覆盖 GitLab Job 调度、Runner 生命周期、实际 release 或签名。
- 不将这次 iOS App workspace 结果外推为 Kotlin Multiplatform、常规磁盘缓存或其他项目的收益。
- 单次冷/热计时不构成稳定性能结论。后续评估需要多轮重复，并分开记录 CAS 命中、传输、解压和
  编译阶段。
- 归档恢复成功与编译器命中是独立证据，必须同时读取恢复记录和构建输出。

## 证据

完整 iOS App workspace 在两台物理 Apple silicon Mac 上，以相同提交、Pods、锁文件和
arm64 iPhoneOS Beta 未签名配置运行。两端空 CAS 均为 0/2793，NAS 恢复后消费端为
2708/2793。Clang App 源、依赖源、显式模块和桥接头 PCH 分别为 44/44、1291/1291、
1372/1395、1/1，Swift compile 与 emit 无复用。快照、压缩、哈希、上传、下载、解压和
单轮冷/热构建时间如上。

本文省略项目、主机、用户、目录、提交、内部网络与存储地址及所有凭据。
