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

同构建优化包的真实 Link Map 中还观察到 617 行含非法 UTF-8 字节，检查到的行均为符号记录。直接用严格 UTF-8 解码会在进入地址归因前抛出 `UnicodeDecodeError`；这不是 trace、UUID 或构建失败。

线程状态还可能出现“报告几乎都是 Blocked”的展示偏差：实测导出包含从 trace 零点开始的启动前等待，而分析窗口从系统初始化开始。只裁剪终点、按最长若干片段排序，会把启动前等待算入启动，并让大量较短的 Running 区间从表中消失。对原始导出同时裁剪起终点、完整累计后，状态分布与原报告显著不同；不能据原来的片段榜单断言主线程全程阻塞。

## 有效恢复（effective recovery）

- 先导出 TOC，再精确选择 schema 和表属性。CPU 采样查询限定 `context-switch-sampling=0`、`record-waiting-threads=0`；不把上下文切换表合进 CPU 热点。
- 验证列 mnemonic、engineering-type 和引用关系；遇到新结构保留原始 trace，标记人工分析，不能猜列或默默返回零。
- Points of Interest 也可能有多张 os-signpost 表。按 category、目标范围及动态 tracing 属性选择所需表；App 发出的 signpost category 必须与采集配置匹配。
- 函数排名明确写采样权重；任务实际持续时间用配对 signpost 区间或系统区间。线程状态单独报告，静态代码字节数不换算成耗时。
- iOS 接受经实际验证的 App 显示名称，同时继续校验唯一启动目标、构建、dSYM UUID 与同构建 Link Map，不能只凭名字认定身份。
- Link Map 读取使用 `errors="backslashreplace"` 保留非 UTF-8 字节为转义；归因依据数字地址、长度和对象索引，不能依赖解码后的符号名。重叠或折叠区间保留 unknown，也不能因转义处理便认为所有对象路径都已可信。
- 线程状态按系统初始化至选定终点的完整窗口裁剪，再按状态累计并报告区间数、覆盖时间和未观测时间。最长等待区间只能作为另一张定位明细，不能代表状态比例。Blocked 本身不证明死锁或具体锁等待，仍需调用栈和系统事件。
- 脱敏 XML 时保留主线程与不同工作线程的身份关系；把所有线程都替换成 Main Thread 会制造重叠区间和错误归因。重叠状态不重复计时，缺失数据不显示为零。
- main 入口探针和业务就绪事件独立校验。缺少业务终点时保留已匹配的 main 边界；原始导出没有事件时，重新解析无法补齐，报告应解释缺项对哪些指标的影响。

## 边界（boundaries）

这是特定 Xcode 版本和实际录制的观察，不保证未来 schema 不变。命令成功、模板存在或只用手写 JSON 测试，都不能替代真实导出验证。

重装 App 不等于清除了全部 Keychain、SDK 私有持久化或系统缓存。已有测试包上的采集能力校验必须和优化构建、全新安装采样及业务就绪验收分开记录。

## 证据（evidence）

先用定向 macOS sleep 录制确认两类 time-profile 表；再用小型 Swift signpost 程序验证 category、样本关联和成对区间。最后在空闲真机上对已安装测试包做短时启动录制，导出 CPU 采样、dyld 区间、生命周期和线程状态，验证实际 iOS 表结构及显示名称。原始 TOC/导出保留本地，脱敏切片用于解析回归。

上述证据仅证明采集与解析边界，不构成生产性能结论、优化效果证明或全新安装基线。

另一次优化包校验先复现 Link Map 的严格解码失败，再增加含非法字节的符号回归；修复后复用原 trace 成功完成同构建地址归因，无需重复采集。已用 Instruments 界面核对 dyld 区间和符号化调用树。静态对象贡献与运行时镜像来源分别保留，采样权重仍不解释为逐库加载耗时。

2026-11-13 对同一份原始 thread-state 导出复核，确认报告包含分析起点之前的长等待，并且最长区间排序遗漏大量短运行区间。增加覆盖窗口两端、工作线程排除、状态完整累计、重叠拒绝与缺失事件独立性的回归测试；同时根据原始导出修正脱敏样本的主线程/工作线程标记。修正仅重新解析既有证据，没有重新启动 App 或把校验改称全新安装基线。
