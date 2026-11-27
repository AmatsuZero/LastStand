---
title: "真机 XCUITest 与 xctrace 如何确认在测同一个进程和动作窗口"
date: 2026-11-25T15:20:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "踩坑", "CLI"]
---

## 现象

在开发 iPhone 上，App 写出本轮 PID，CoreDevice 能列到该进程，但 Instruments 按 PID 或可执行文件名附加时报告找不到目标。改用 Instruments 启动 App 后，主机收到了采样开始通知，测试 runner 等待另一条设备通知仍超时。

## 已验证成因与边界

这条链路中有三个不同的就绪条件：runner 已安装并准备好、Instruments 已开始采样、被测 App 已就绪。主机收到采样通知不能证明手机 runner 已收到放行信号；进程在 CoreDevice 可见也不能证明本次 Instruments 附加成功。没有证据将失败归因于系统权限或具体的操作系统缺陷。

## 有效恢复

让 Instruments 通过 `--launch -- <bundle-id>` 启动已安装的开发包。先由 runner 在自己的容器写本轮唯一编号；主机等采样开始，再从目标容器读同编号的 PID，核对正在运行的可执行文件。通过 CoreDevice 将含同一编号的放行文件回写 runner 容器，runner 核对内容才操作。最后导出 trace 目录表校验目标 PID。每一步有独立超时，不重用上轮文件。

在 App 中低频记录带本轮编号和设备 uptime 的 signpost。测试附件记录每一步的 uptime。使用同编号、同 PID 的相邻 signpost 在 trace 时间轴插值，仅在两端被锚点夹住、时钟差符合容差时报告动作窗口。没有锚点的整段 CPU 热点只能说明采集期间的活动。

## 证据

两种模板分别执行五秒前台自检，均完成 XCTest、trace 导出和 PID 校验；在各自 trace 上获得约五秒的动作窗口。该自检只验证采样和时间对齐，不代表业务症状复现，也不能用短窗口的整机耗电速率推算 App 功率。

## 补充：相同版本号也要显式安装测试构建

复用已有 `xctestrun` 时，XCTest runner 就绪、Instruments 正常启动 App 并保存 trace，但 App 没写本轮就绪文件。脱离 Instruments 后，CoreDevice 直接启动也复现了这一现象。已安装 App 与测试包版本号相同，版本号不能证实手机上运行的是带分析插桩的构建。未取得原安装包的二进制指纹，无法确认它为什么缺少就绪事件。

在启动 runner 前，通过 CoreDevice 原地安装 `xctestrun` 对应的开发包，保留 App 容器。需要分析手机原有日志时，先复制日志，再安装。不可覆盖的签名或非开发包应作为预检失败，避免通过卸载继续。

原地安装后，真机五秒自检拿到了 App 就绪文件，核对了 PID，并将动作窗口对齐到 trace。真实业务用例随后走到了查找测试设备的步骤，设备选择失败保留为独立的回放阻塞。
