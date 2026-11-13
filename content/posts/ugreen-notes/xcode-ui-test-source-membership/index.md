---
title: "Xcode UI 测试文件存在不代表已编入 target"
date: 2026-11-13T08:43:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "CI/CD", "构建", "踩坑"]
---

## 现象（symptom）

专项 UI 测试源码已在仓库中，主机端脚本测试也通过，但检查工程发现 UI target 没有编译这些源码。
仅从文件路径和构建退出码无法确认专项用例实际存在于测试包。

## 已验证成因（verified cause）

App 使用文件系统同步 group，UI target 使用显式 PBXGroup 和 PBXSourcesBuildPhase。
向前者目录增加源码通常会自动参与构建，向后者目录新增文件不会自动建立 target membership。
专项测试与共享配置源码均需加入 UI target；UI runner 不应通过 import App 来复用输入协议。

## 有效恢复（effective recovery）

用项目已锁定的 xcodeproj 读取目标的 source_build_phase.files_references，断言专项源码与共享配置都存在。
先观察回归失败，再补 file reference、build file、group 和 sources membership；完成实际 build-for-testing，
核对 SwiftCompile 输入与有效编译条件，防止只编译了条件宏中的失败分支。

新增专项用例后也要检查默认 scheme。依赖专用参数的测试应由专项入口显式选择；普通 TestAction
可以列入 SkippedTests。冻结专项 xctestrun 时移除 SkipTestIdentifiers 并设置唯一 OnlyTestIdentifiers，
避免普通测试误跑专项，或专项被默认跳过而产生空成功。

## 边界（boundaries）

membership 回归只证明工程配置；unsigned build-for-testing 只证明编译和链接。
两者均不证明签名、设备测试执行、唯一 App 启动或性能数据有效。不要把文件存在性断言当作执行证据。

## 证据（evidence）

2026-11-13，新增工程语义回归先因两份 UI 测试缺失失败，补齐后通过；优化配置的完整 iOS
build-for-testing 成功，编译日志实际包含专项测试、共享配置及内部 profiling 宏。
默认 scheme 的跳过列表也经历独立 RED→GREEN。该验证没有安装或启动 App。
