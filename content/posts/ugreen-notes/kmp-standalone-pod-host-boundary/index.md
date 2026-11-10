---
title: "KMP 独立发布不能隐式依赖 iOS 宿主目录"
date: 2026-11-09T21:00:00+08:00
draft: true
tags: ["Kotlin Multiplatform", "CocoaPods", "CI/CD", "踩坑", "构建"]
categories: ["绿联工作笔记"]
---

## 现象

同一 KMP 库作为 iOS App 子模块可以构建，独立发布 XCFramework 时，设备与模拟器 synthetic Pod 安装同时报“找不到 Swift 宿主 Gemfile”。日志显示 CocoaPods 安装尚未开始，错误来自自定义 pod wrapper。

## 已验证成因

wrapper 从脚本路径向上两层推导 App 根目录，强制要求 `iot/Gemfile`、Ruby 环境脚本和项目 JDK 管理脚本。独立库 checkout 和发布脚本创建的模拟器 worktree 均不含这些宿主文件。

一个任务配置顺序修复还会把潜在问题变为真实回归：旧代码在 Kotlin Pods 配置前设置 executable provider，随后被插件覆盖；改为 Pods 配置后设置时，synthetic install 开始真正使用 wrapper。不能以“wrapper 很早就存在”或“同机器之前成功”排除代码回归，应比较最后成功版本与失败版本的实际任务绑定。

## 有效恢复

将执行上下文分开：无宿主目录的独立 checkout 使用 PATH 上已预置的 CocoaPods，并保留调用方 synthetic Podfile 工作目录、参数、JDK 环境与退出码；存在宿主目录时继续严格检查并使用宿主锁定 Ruby/Bundler/JDK。检测到部分宿主文件缺失不能静默退回全局工具。

wrapper 文件变化还必须触发完整 Release staging 验证，不能仅跑脚本契约测试。

## 边界

此改动不安装工具、不改凭据、不复制 App 文件到构建机。已有 tag 不移动、不重用；修复必须先通过 MR 验证，合入后再创建新版本。工具选择测试通过不代表 XCFramework、签名或发布已通过。

## 证据

真实 wrapper 在独立目录和模拟器 worktree fixture 上先复现相同缺失 Gemfile 错误，修复后通过；App fixture 验证锁定 Bundler、JDK 和调用目录保留，另验证缺 CocoaPods 时失败及子进程退出码传播。本机真实 CocoaPods 版本查询成功。随后远端 macOS Runner 完整 Release 验证通过：设备与模拟器均完成 Release 链接、XCFramework 合并、产物检查、ZIP staging 及最终 Podspec 检查。修复经 MR 自动合入后，创建了递增的新 RC tag；新 tag 的正式发布流水线已启动，其上传与 Specs 发布结果仍需单独验收。
