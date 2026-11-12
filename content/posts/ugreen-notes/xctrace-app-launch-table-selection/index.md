---
title: "Instruments 启动分析：区分采样表、实际区间与 App 显示名称"
date: 2026-11-12T21:44:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "CI/CD", "踩坑"]
---

## 现象（symptom）

通过 xctrace 自动分析启动时，只按 `schema=time-profile` 导出可能命中多张表；同一时刻的调用栈出现不同权重，甚至把等待过程算作函数执行成本。另一个问题是按可执行文件名校验 iOS target，会拒绝本来有效的启动录制。

## 已验证成因（verified cause）

在 xctrace 27.2 (27B52) 的 App Launch 模板中，TOC 同时列出 `context-switch-sampling=0, record-waiting-threads=0` 与 `context-switch-sampling=1, record-waiting-threads=1` 的 time-profile 表。仅按 schema 选择时，XML 返回多个 node，部分 node 复用前一节点的 schema 和 ID 定义。将它们直接合并会混入两种统计含义。

实际导出对 weight 的说明明确指出：它是按采样频率赋予样本的统计权重，不是该次函数调用在 CPU 上执行的持续时间。Self 和 Inclusive 也不能当作互不重叠的区间相加。

真机 TOC 的目标进程 name 还可能使用 App 显示名称，而不是可执行文件名。因此名称检查和最终二进制 UUID 检查要分别处理。

## 有效恢复（effective recovery）

- 先导出 TOC，再精确选择 schema 和表属性。CPU 采样查询限定 `context-switch-sampling=0`、`record-waiting-threads=0`；不把上下文切换表合进 CPU 热点。
- 验证列 mnemonic、engineering-type 和引用关系；遇到新结构保留原始 trace，标记人工分析，不能猜列或默默返回零。
- Points of Interest 也可能有多张 os-signpost 表。按 category、目标范围及动态 tracing 属性选择所需表；App 发出的 signpost category 必须与采集配置匹配。
- 函数排名明确写采样权重；任务实际持续时间用配对 signpost 区间或系统区间。线程状态单独报告，静态代码字节数不换算成耗时。
- iOS 接受经实际验证的 App 显示名称，同时继续校验唯一启动目标、构建、dSYM UUID 与同构建 Link Map，不能只凭名字认定身份。

## 边界（boundaries）

这是特定 Xcode 版本和实际录制的观察，不保证未来 schema 不变。命令成功、模板存在或只用手写 JSON 测试，都不能替代真实导出验证。

重装 App 不等于清除了全部 Keychain、SDK 私有持久化或系统缓存。已有测试包上的采集能力校验必须和优化构建、全新安装采样及业务就绪验收分开记录。

## 证据（evidence）

先用定向 macOS sleep 录制确认两类 time-profile 表；再用小型 Swift signpost 程序验证 category、样本关联和成对区间。最后在空闲真机上对已安装测试包做短时启动录制，导出 CPU 采样、dyld 区间、生命周期和线程状态，验证实际 iOS 表结构及显示名称。原始 TOC/导出保留本地，脱敏切片用于解析回归。

上述证据仅证明采集与解析边界，不构成生产性能结论、优化效果证明或全新安装基线。
