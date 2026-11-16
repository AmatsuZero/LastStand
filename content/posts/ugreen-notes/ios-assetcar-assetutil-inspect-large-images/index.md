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

1. 解包 IPA 后，对 `.app` 内**所有** `.car`（不按 car 体积、也不按单图大小过滤）跑 `assetutil --info`，按 `Name` 聚合 `SizeOnDisk`，**全量**写回包分析 JSON 对应 bundle 的 `carImages`（含 size / renditions / sha1s）。
2. 当前分支与目标分支基线在**同一处**生成该字段，报告就能按图片名比对大小增长，定位"哪张变大"。
3. **采集全量、告警按变化**：数据层全量入库（实测 5 个 car / 上千张图），保证任一资源日后变大都可检出；告警判定只在「相对基线新增或变大且 ≥2 MiB」时触发，稳定的大资源不重复报。否则用「当前体积 Top N」代替变化判定，会让稳定的大图每次 MR 都出现在报告里，等于「大于阈值就报」的噪音。阈值是噪音过滤，不是告警依据。
4. 关键实现点：
   - 从 `.bundle` 路径取 bundle 名要用 `stem` 而非带后缀的 `name`，否则与包分析 JSON 里的 bundle 名匹配不上，展开会**静默失效**（本地测试捕获到这个坑）。
   - `assetutil` 不在 PATH 时跳过展开、不阻塞主流程。
   - 重复执行要按图片名去重，保证幂等。

## 边界

- `SizeOnDisk` 是 rendition **解包后的落盘字节数**，不是入包体积：car 有压缩与去重，不能拿它解释 IPA 增量。
- 同一 `Name` 的多个 scale / idiom / appearance 变体会合并成一条，这是"一张图"的合理粒度，但不是单个 rendition 的大小。
- 历史基线没有 `carImages` 时，**不应把当前所有图片当成"新增"告警**（否则又变成一次性噪音洪流）；此时跳过图片告警，重建一次基线后才能按图判定新增/变大。
- 图片名是编译后的 imageset 名（源文件常为 pdf/png，如 `cct_home_small` ← `cct_home_small_light.pdf`），来自二进制 Pod bundle，主工程源码里 grep 不到，要报出来源提示，避免开发者白找。
- `assetutil` 仅 macOS 自带；非 macOS 环境需另找解析手段（如第三方 car 解包库）。

## 证据

- 实测 `assetutil --info`：6295 rendition / 808 唯一 Name / `SizeOnDisk` 总和 125.5 MiB vs car 文件 126 MB；真机包共 5 个 car（`UHCommonImages` 126 MiB / `UHCareImages` 3.5 MiB / 3 个小 car），全量展开约 1300 张图。
- 端到端验证告警语义：全量入库后，稳定不变 → 0 告警；新增 9 MB json → 报出；某图变大 5 MB → 报出该图；基线无 car 明细 → 0 图片告警。
- 聚合单测、全量注入（含小图）幂等测试、真实 car 解析测试均通过；bundle 名后缀导致注入失败的问题由测试捕获并修复。
