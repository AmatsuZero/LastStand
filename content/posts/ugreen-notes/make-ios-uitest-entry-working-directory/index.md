---
title: "Make 转发 iOS UI 测试时的工作目录边界"
date: 2026-11-10T14:45:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["CI/CD", "Xcode", "构建", "踩坑"]
---

## 现象

直接运行仓库内的 UI 测试脚本可以通过，但 `make -C iot uitests` 报
`bash: Tools/ios-ci/run-uitests.sh: No such file or directory`。
仓库根目录的 `make uitests` 则报没有对应 target。

## 已验证成因

`make -C iot` 会让 `CURDIR` 指向宿主工程目录；recipe 再进入该目录后，
仍使用相对于仓库根目录的 `Tools/ios-ci/...`，脚本路径因此多了一层目录。
根 Makefile 也没有将 `uitests` 转发给宿主 Makefile。
这发生在调用构建工具之前，与设备登录态、签名或 XCTest 初始化无关。

## 有效恢复

宿主 recipe 使用明确的脚本路径，例如
`bash "$(IOS_DIR)/../Tools/ios-ci/run-uitests.sh"`。
根 Makefile 将 `uitests` 加入已有转发目标，沿用 `$(MAKE) -C iot`。
用临时工程复制真实 Makefile 和脚本，仅替换设备、构建及报告工具，
实际执行根目录和宿主目录两个 Make 入口，检查测试选择参数及退出码。

## 边界

入口测试通过只证明路径和参数能够传到 runner；完整构建、设备执行及 JUnit
报告仍需分别验证。直接调用脚本的成功记录不能代替 CI 使用的 Make 入口验收。
测试 token 和设备标识无需写入笔记。

## 证据

修复前，同一个行为回归在根目录和宿主目录分别复现上述两种失败。
修复后 runner 与 Make 入口的 14 项测试全部通过；完整 Make 命令已成功进入
真机构建。此记录不把该构建的进行中状态当作设备测试通过证据。
