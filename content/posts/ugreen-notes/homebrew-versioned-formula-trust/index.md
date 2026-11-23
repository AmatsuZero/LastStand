---
title: "Homebrew versioned formula may need its canonical name to pass tap trust"
date: 2026-11-23T00:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "依赖", "CLI", "macOS"]
---

## 现象

Homebrew 7.0.14 在安装某个第三方 tap 的未带版本 formula 名称时，先完成了官方 tap 的添加，却报出 `UntrustedTapError`。错误信息将该名称解析为一个带版本的 canonical formula。

## 已验证成因

tap 中的未带版本 formula 名称是别名，指向带版本的 formula 文件。Homebrew 的信任判断以解析后的 canonical formula 为准。只指定别名时，当前命令没有通过该 trust gate。

## 有效恢复

从错误信息中取出 Homebrew 已解析的 canonical formula 名称，并在下一次安装命令中显式使用它。实测同一版本的 Homebrew 随后打印该 formula 已受信任，并继续到获取阶段。

## 边界

该结论只覆盖 formula 名称与 tap trust 的解析路径。它不证明后续下载、校验、安装、缓存写入或工具运行成功。不要把任意 tap 的名称替换规则外推到其它 formula，先以当前 Homebrew 的解析输出为准。

## 证据

一次复现中，未带版本名称解析到 `tuist/tuist/tuist@4.218.3` 后触发 `UntrustedTapError`。tap 的 `Aliases/tuist` 指向 `../Formula/tuist@4.218.3.rb`。显式使用 `tuist/tuist/tuist@4.218.3` 后，Homebrew 输出 `Trusted formula tuist/tuist/tuist@4.218.3`，并进入获取阶段。
