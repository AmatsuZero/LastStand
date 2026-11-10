---
title: "KMP UI 测试替代 framework 的源码预检边界"
date: 2026-11-10T10:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["KotlinMultiplatform", "CocoaPods", "CI/CD", "构建", "踩坑"]
---

## 现象

宿主为 UI 自动化切换到独立 KMP 测试 framework 后，首次源码 Pod 安装失败：
Gradle 配置的嵌套 strings 项目目录不存在。补齐目录后又遇到
`Could not find method androidLibrary()`，位置在新增的测试辅助模块。

## 已验证成因

源码模式为保护开发者选择的 shared HEAD，跳过了整个 submodule update，
同时漏掉 shared 内钉住的嵌套 strings submodule。
新增测试辅助模块则使用了 Android multiplatform library DSL，但没有应用对应 plugin。
这两项发生在 Gradle 配置与 Pod 安装阶段，不能归因于 XCUITest、设备或签名。

## 有效恢复

源码预检先对 shared 仓库执行指定路径的 `submodule update --init <strings-submodule>`，
不对宿主执行会重置 shared gitlink 的 update。
测试辅助模块补上项目版本目录中已有的 Android multiplatform library plugin。
随后通过宿主批准的 make 入口重新生成 podspec、dummy framework 并安装 Pods。

另一个集成边界是 JDK：源码模式的开关扩展后，Pod build settings 与 Xcode wrapper
也需要识别测试模式。只改 Podfile 的源码路径不足以保证 Xcode 后续能编译 KMP。

## 边界

- 普通二进制构建继续无 JDK；只在显式源码模式准备 JDK。
- 测试替代 framework 保持原有 pod/framework 名，需要同时保留生产公开 API。
- 普通 Test 配置可能已包含业务测试宏，应使用独立的 UI 注入编译开关。
- Pod 安装通过不证明完整 framework 编译、Swift 导出名、签名或真机执行通过。
- 测试凭据通过环境传递，不写入命令参数、日志或笔记。

## 证据

本地复现了缺嵌套目录和缺 plugin 两个配置错误；修复后源码安装通过
（89 个依赖、118 个 Pods）。脚本回归覆盖嵌套初始化顺序、失败早退、保留 shared HEAD、
测试模式的模块选择与 JDK 注入。该证据仅覆盖构建接入前置，不是设备 UI 验收。

## 传递导出的额外失败

为了保留生产 framework 的 API，直接开启 `transitiveExport = true` 会扩大导出范围。
本次生成的头文件额外导出了 ZXing 的非泛型 `Result`，宿主原有的
`Result<Value, Error>` 因此报 `cannot specialize non-generic type 'Result'`。

有效恢复是让生产与测试 framework 复用同一份显式模块清单，测试 framework
再额外导出 App 和注入模块。原有 26 个生产导出模块保持一致，重新编译后
头文件从约 11.3 MB 降至约 4.1 MB，保留宿主 API 和测试方法，不再声明冲突的 `Result`。
这比在许多业务文件中追加 `Swift.Result` 更直接地修复了导出边界。

首次跑源码模式还要检查分支基线：旧 shared 分支可能落后于宿主依赖的公开 API，
而其嵌套 strings 版本也可能缺少宿主已使用的扩展。应核对提交与 API，
合入对应 release 基线后重验，不能为编译通过而删掉宿主业务参数或伪造扩展。

## 独立 XCTest target 的继承设置

新增的纯 Swift UI test target 可能从 project 级配置继承 App 的
`SWIFT_OBJC_BRIDGING_HEADER`。即使没有链接 App Pods，Swift 的依赖扫描也会先读取该 header，
随后报某个 App Pod 头文件不存在。
应在测试 target 的每个配置显式设置 `SWIFT_OBJC_BRIDGING_HEADER = ""`，
沿用独立测试 target 的边界；不要为消除报错把整套 App Pods 加进 runner。
本次回归确认修复前依赖扫描失败，修复后 unsigned `build-for-testing` 包含 App 和 runner 通过。
