---
title: "iOS Assets.car 大资源定位：assetutil 展开到具体图片"
date: 2026-11-16T15:29:35+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "macOS", "构建"]
---

## 现象

包体积预检把某个资源 bundle 报成单个 `Assets.car`（百 MB 级），只能说"这个 bundle 大"，答不出"哪张图片变大"。该 bundle 由外部 Pod 以编译好的二进制资源包引入，主工程源码树里没有原始 `xcassets`，MR 源 diff 也检不出具体图片。

## 已验证成因

asset catalog 编译期会把一个 bundle 里所有 imageset 合并成单个 `.car`，包分析工具的 JSON 对 bundle 只能给出 `files: [{name: Assets.car, size: ...}]`，看不到内部条目。

macOS 自带的 `assetutil --info <Assets.car>` 输出 JSON 数组，每个 rendition 含 `AssetType`、`Name`、`RenditionName`、`SizeOnDisk`、`SHA1Digest`。实测某真实 car：6295 个 rendition、808 个唯一 `Name`，`SizeOnDisk` 聚合 125.5 MiB，与 126 MB 的 car 文件体积吻合。说明按 `Name` 聚合可以还原"每张图多大"，`SHA1Digest` 还能判断同一张图内容是否变化。

## 有效恢复

1. 解包 IPA 后，对 `.app` 内 ≥2 MiB 的 `.car` 跑 `assetutil --info`，按 `Name` 聚合 `SizeOnDisk`，结果写回包分析 JSON 对应 bundle 的 `carImages`（含 size / renditions / sha1s）。
2. 当前分支与目标分支基线在**同一处**生成该字段，报告就能按图片名比对大小增长，定位"哪张变大"。
3. 关键实现点：
   - 从 `.bundle` 路径取 bundle 名要用 `stem` 而非带后缀的 `name`，否则与包分析 JSON 里的 bundle 名匹配不上，展开会**静默失效**（本地测试捕获到这个坑）。
   - `assetutil` 不在 PATH 时跳过展开、不阻塞主流程；只落库 ≥ 阈值的图片条目，避免 JSON 膨胀。
   - 重复执行要按图片名去重，保证幂等。

## 边界

- `SizeOnDisk` 是 rendition **解包后的落盘字节数**，不是入包体积：car 有压缩与去重，不能拿它解释 IPA 增量。
- 同一 `Name` 的多个 scale / idiom / appearance 变体会合并成一条，这是"一张图"的合理粒度，但不是单个 rendition 的大小。
- 历史基线没有 `carImages` 时，当前图片只能展示体积、不能判"新增"，需重建一次基线才能完整比对。
- `assetutil` 仅 macOS 自带；非 macOS 环境需另找解析手段（如第三方 car 解包库）。

## 证据

- 实测 `assetutil --info`：6295 rendition / 808 唯一 Name / `SizeOnDisk` 总和 125.5 MiB vs car 文件 126 MB。
- 真实 car 端到端跑通后，报告从单行整体大小变成列出十余张具体图片及各自大小。
- 聚合单测、注入幂等测试、真实 car 解析测试均通过；bundle 名后缀导致注入失败的问题由测试捕获并修复。
