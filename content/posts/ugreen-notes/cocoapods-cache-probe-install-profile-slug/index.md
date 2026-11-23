---
title: "CocoaPods 缓存探测必须复用安装适配器和真实 profile 上下文"
date: 2026-11-23T19:46:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["CocoaPods", "CI/CD", "踩坑", "构建"]
---

## 现象

为固定依赖增加 CocoaPods 下载缓存探测时，独立构造原生 request 的脚本报告缓存缺失。
同一依赖在真实 Pods 安装中能够使用缓存。这个差异会把探测脚本的请求构造方式误判为
缓存内容缺失。

## 已验证成因

CocoaPods 下载缓存的定位依赖 `Request#slug`。真实 Pods 安装会通过项目已有的适配器构造
request，并带入实际安装的 profile 上下文。独立原生 request 没有复用这层适配，面对固定
依赖时产生的 slug 与真实安装路径不一致。

在锁定的 Ruby、Bundler 和 CocoaPods 环境中，用同一份 lock options 对照验证：原始 slug
和实际 profile 上下文得到的 slug 不同，缓存归档包含后者。这证明本例的 missing 结果来自
探测输入与安装输入不一致，而非归档中没有真实安装使用的内容。

## 有效恢复

缓存 validator 应复用 Podfile 安装路径已经使用的 `Request#slug` 适配器，并以真实安装的
profile 上下文构造 probe。验证时将 probe 得到的 slug 与归档条目逐一对照，避免在
standalone 脚本中重新实现 request 规则。

修改 validator 后，由真实 cache reader 运行验证下载、命中和归档读取结果，再确认完整
Pods 安装与锁文件检查。

## 边界

- lock options 相同不保证独立 request 与安装流程得到相同 slug，profile 上下文也是输入的一部分。
- 缓存归档含有目标 slug，只证明归档内容与真实安装构造一致。远端下载、解压和 cache reader
  仍需通过真实流水线分别取证。
- 固定依赖的适配规则应通过既有安装入口复用。新建平行 request 构造逻辑会再次产生漂移风险。
- 本文不把本地 slug 对照视为完整 CI、Pods 安装、编译或制品验收。

## 证据

本地使用项目锁定的 Ruby、Bundler 和 CocoaPods，对同一 lock options 分别计算原始 slug
与带实际安装 profile 的 slug。两者不同，归档中存在后者。validator 调整为复用安装适配器
后，同一流水线在不同 Runner 从真实 NAS 下载并解压约 13 秒，安装前输出
`Restored 24/24 locked Git pods`，随后完成真实 120 个 Pods 安装和锁文件检查。

本文省略项目、合并请求、内部依赖名、归档地址、主机、用户、网络地址和所有凭据。
