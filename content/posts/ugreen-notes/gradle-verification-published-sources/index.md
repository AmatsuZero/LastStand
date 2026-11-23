---
title: "Gradle 依赖校验应覆盖 IDE 请求的已发布 sources JAR"
date: 2026-11-23T17:55:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Gradle", "构建", "依赖", "踩坑"]
---

## 现象

Android Studio 导入已能解析已发布的 POM、module 和运行时制品，却在解析源码附件时抛出 `DependencyVerificationException`。构建任务未请求源码包时可以通过，不能据此判断 IDE Sync 可用。

## 已验证成因

启用了 Gradle dependency verification 的私有发布只登记了运行时制品。IDE 通过 Tooling API 额外请求 `-sources.jar`，因此这些已发布附件也必须有独立的 SHA-256 规则。

## 有效恢复

先以已经受信任的 `.module` SHA-256 确认发布元数据未漂移，再从实际仓库下载每个 `-sources.jar`，核对其字节 SHA-256 与 ZIP 完整性。将确认后的哈希按构件写入 `verification-metadata.xml`，不要放宽整个 group 的校验规则。用真实 resolver 显式请求源码附件，分别复现旧元数据失败和更新后通过。

## 边界与证据

对含多个 Kotlin/Native 变体的发布，直接在无属性的 configuration 中请求 `sources@jar` 可能在选择变体时失败。先查看已验证的 `.module` 中 sources 变体的 attributes。实测在 Gradle 9.4.1 中，为两个 iOS 目标分别建立可解析的 configuration，设置 `Category.DOCUMENTATION`、`DocsType.SOURCES`，再把字符串属性 `org.jetbrains.kotlin.native.target` 分别设为发布声明的 `ios_arm64` 和 `ios_simulator_arm64`。按模块坐标解析后，两个 configuration 都选中了对应的源码 JAR，并通过严格摘要校验。

一次 Android Studio Sync 报出了 root 与 Android 两个源码附件，随后对 root、Android 和两个 iOS 变体完成了发布元数据、下载字节和 ZIP 三重核对。旧元数据对 IDE 实际请求的两个附件均失败，加入精确哈希后均通过。此结论只适用于已发布的 sources JAR。本地生成且没有发布来源的中间制品应单独界定信任范围，不能借此扩大对全部附件的豁免。
