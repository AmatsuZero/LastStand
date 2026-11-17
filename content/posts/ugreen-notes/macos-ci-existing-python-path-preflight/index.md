---
title: "macOS CI 已装新版 Python，预检仍命中系统 3.9"
date: 2026-11-17T11:04:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "构建", "CI/CD", "GitLabRunner", "macOS", "依赖"]
---

## 现象（symptom）

同一套编译性能任务在 macOS checkout 与普通工程预检通过后，性能 capability 检查
以 1 退出。App 编译尚未开始，也没有交付包。检查 JSON 只写入 Runner 本地，
日志仅显示 collapsed command，Artifact 又只保留编译后的交付目录，因此无法直接看到原因。

## 已验证成因（verified cause）

在隔离分支运行两个不编译的真实探针，复用原 Ruby 初始化与 Xcode wrapper：

- 一台 Mac 的 `python3` 为 `/usr/bin/python3`，版本 3.9.6，Python capability 为 false。
- 另一台 Mac 默认命中 Homebrew Python 3.12.16，capability 为 true。
- 两台 Xcode 都是 26.5 / 17F42，`xcresulttool get log` 能力均通过。
- 失败的 Mac 实际已装 Homebrew Python 3.12.14；显式使用其 libexec 中的 Python，
  同一检查立即通过。因此缺的是 Job 的 PATH 选择，不是新版 Python 安装。

普通工程预检仅检查 `command -v python3` 存在，不代表满足性能入口的 Python 3.11 最低要求。
工具安装位置、shell 初始化和 Ruby 环境加载后的最终 PATH 必须分别核实，不能凭存在
`.ruby-version` 或某个 Homebrew 安装记录推断实际解释器。

## 有效恢复（effective recovery）

只在性能 Job 的 Ruby 初始化之后，将现有 `/opt/homebrew/opt/python@3.12/libexec/bin`
放到 PATH 前面，再运行性能预检。没有安装、升级 Python，没有修改全局 shell、
系统 Python 或 Runner 配置，也没有将整个 Homebrew bin 前置而影响锁定 Ruby/Bundler。

第三轮真实探针验证两台 Mac 都命中 Python 3.12，各项 capability 为 true，两个 Job success。
正式修复同时在 after_script 打印 capability JSON，并保留小报告 Artifact；
显式组合共享清理逻辑，保留原交付包、always 上传和 30 天留存。

## 边界（boundaries）

- 路径适用于本次实际验收的 Apple Silicon Homebrew 环境；新增 Runner 应先验证安装路径。
- 缺少既有 Python 时仍由预检拒绝，不在业务 CI 中静默下载安装。
- 探针不安装 Pods、不编译 App，也不能当作 Archive、JSON 导出或跨 Runner 分析成功。
- 临时诊断配置只存在于禁止合入的分支，取证后关闭该 MR，正式修复另走小范围 MR。
- 定时开关保持关闭，完整采集需要合入修复后的目标分支再次验收。

## 证据（evidence）

第一轮探针对两台 Runner 的默认解释器做对照，失败 Mac 为 3.9.6；第二轮确认
既有 Python 3.12.14 可以通过同一 Xcode 检查；第三轮只调整 Job PATH，两台均 success。
新增回归先失败后通过，真实 shell 验证 Python 优先级与 Ruby/Bundler 路径保留，
46 项 CI 配置测试通过。候选配置服务端 Lint 无错误和警告，仍只选择 Build、Analyze。

另一个独立 Linux Job 已成功拉取内网固定 digest 镜像并通过 capability 预检；
后续分析失败来自 Mac 未交付数据，不应再次归因于容器镜像缺工具。
