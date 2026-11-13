---
title: "XCLogParser 报告生成成功不代表现代 SwiftCompile 指标完整"
date: 2026-11-13T12:39:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "Xcode"]
---

## 现象

使用官方 XCLogParser 0.2.50 解析一份真实 iOS 工程 activity log，HTML、
hierarchical JSON、Flat JSON 和 Chrome Trace 都生成成功，但按
`detailStepType == swiftCompilation` 提取不到 Swift 文件编译记录。
日志关联本机 iPhoneOS 27.2 SDK；本机当前 Xcode 为 27.2，历史构建未完整记录
工具链身份，因此不将它作为受控版本对照实验。

## 已验证成因

真实 JSON 中有 2,193 个 `signature` 以 `SwiftCompile ` 开头的 detail step，
全部被分类为 `other`，`architecture` 为空，且 `fetchedFromCache` 为 false。
原始压缩日志解压后，同一任务可见 `SwiftCompile normal arm64 …/A.swift` 和
`builtin-SwiftPerFileCompile A.swift`。不能把这些记录解释为缓存占位。

v0.2.50 的分类器只接受旧的 `CompileSwift ` 前缀；架构正则同样以
`^CompileSwift normal` 开头。`isCompilationStep()` 和 Swift timing 处理入口
依赖 `swiftCompilation` 分类，因此影响不局限于文件列表显示。

源码固定到 commit `d0c3c685d3e32606ef04a21cacf7ab0dfbe19362`：

- [BuildStep.swift:95](https://github.com/MobileNativeFoundation/XCLogParser/blob/d0c3c685d3e32606ef04a21cacf7ab0dfbe19362/Sources/XCLogParser/parser/BuildStep.swift#L95)
- [ParserBuildSteps.swift:77](https://github.com/MobileNativeFoundation/XCLogParser/blob/d0c3c685d3e32606ef04a21cacf7ab0dfbe19362/Sources/XCLogParser/parser/ParserBuildSteps.swift#L77)
- [ParserBuildSteps.swift:374](https://github.com/MobileNativeFoundation/XCLogParser/blob/d0c3c685d3e32606ef04a21cacf7ab0dfbe19362/Sources/XCLogParser/parser/ParserBuildSteps.swift#L374)

## 有效恢复

已验证的处理是给能力验收加明确检查：递归统计 `signature` 为 `SwiftCompile `
而分类仍为 `other` 的步骤，并在结果中标出兼容性缺口。保留原始日志、工具版本、
输入摘要和报告，把“reporter 可运行”与“文件/函数/表达式指标完整”分别验收。
这能阻止误报支持，**并没有修复上游解析器**。

在目标 Xcode 上做受控诊断构建前，先评估并验证上游兼容性修复。不要静默替换
解析器、仅凭文件名补分类，或把缺失函数/表达式样本补成零。初次冒烟没有更换
解析器；后续针对固定候选 diff 的评估见下节。仍未证实生产工具链或其他
Xcode 版本是否同样受影响。

## 后续候选修复评估

同日复核，官方最新发布仍为 0.2.50。公开
[PR #256](https://github.com/MobileNativeFoundation/XCLogParser/pull/256) 与
[PR #259](https://github.com/MobileNativeFoundation/XCLogParser/pull/259) 尚未合并；
后者包含前者，固定 head `3d000ce97454576c53816d521e8b9eb093fd7c07`。
仅将四个源码文件的固定 diff 应用到 0.2.50 临时工作区，未替换 CI 工具。

先只加入上游测试，十二项聚焦测试有六项预期失败；加入源码 diff 后完整
105 项通过。用候选 release binary 回放**同一真实日志**，四个 reporter 仍退出 0，
现代 Swift 分类恢复，但 detail 记录从 2,474 增至 3,514，root duration 保持不变。
按类型、签名、时间、文件 URL 与 cache 状态比较，新增 1,055 个记录身份、
缺少 15 个原身份。新增签名不是已有签名的简单额外拷贝，不能未经分析就称为重复；
也不能因为测试通过就把合成记录直接当成独立、精确的文件编译耗时。

进一步检查单份报告内的 identifier：官方版 2,595 条记录全部唯一；候选 3,635 条
记录只有 3,347 个唯一 ID，288 个 ID 各出现两次，稳定任务字段也相同。
这部分重复有直接证据，但不等于全部记录增删差异都是重复。

官方 `dump` 提取的原始结构中，十六个现代 SwiftCompile section 的当前命令
不含文件路径，而父 section 含四十八个文件引用；候选 guard 仍会进入
parent-command 合成分支。stderr 计数仪表实测这十六处合成 768 步，
仪表前后任务多重集合保持一致。

重复来自既有 `BuildStep+Parser.swift` 的 `moveSwiftStepsToRoot()`：枚举原数组
index，却在已发生删除/追加的另一个数组上按该 index 删除。后续会删除错项，
保留 batch 和其子步骤的额外拷贝。最小单测以两个 batch 各含一个 file，预期
顶层 fileA/fileB，实际 batchB/fileB，递归展开后 fileB 两次，两个断言失败。
这是逻辑单测复现，性能结论仍来自上述真实输入；该阶段先保留失败证据，未替换 CI 工具。

随后在隔离目录评估最小修复：用保持顺序的 flatMap 替换原索引删除循环，
不改解码器、分类器或文件合成规则。复现测试 RED→GREEN，完整 106 项通过。
同一真实输入再次回放后，3,347 条记录的 ID 全部唯一；原始报告中 2,089 个
Swift 叶子文件任务按签名、起止时间、duration、文件 URL 与缓存状态全部保留。
未额外编译 App；四个 reporter 均成功。此补丁只作研究，不进入 CI 工具供应。
对应逻辑 patch SHA256：
`e57c9dca7fb5eb4e7f32f2a07ea6e06bc83a213c6342c655796af338a92d86cb`。

修复重复后 architecture 仍缺失，函数/表达式样本仍为零，父命令合成记录的计时语义
也需单独核实。候选仍未通过本工程完整能力验收，不能据此直接推广。
不自行去重、改计时或补零；先厘清合法合成与错误关联，再决定修复范围。

这段历史尤其需要注意：
[PR #182](https://github.com/MobileNativeFoundation/XCLogParser/pull/182) 曾加入分类，
因 [issue #196](https://github.com/MobileNativeFoundation/XCLogParser/issues/196)
的嵌套步骤和 JSONEncoder 内存问题而由
[PR #199](https://github.com/MobileNativeFoundation/XCLogParser/pull/199) 回退。
新候选同时修改合成 guard，但单样本没有内存爆炸不证明所有规模的输入都安全。

## 边界

- 一个历史日志不证明所有 Xcode 27.2 构建都有同样数据，也不证明 Xcode 26.x 兼容。
- 没有开启 frontend 诊断的历史构建，不能用来验证函数/表达式计时本身。
- 并行任务时间、函数类型检查时间和整体 Build wall time 是不同口径。
- 原始 gzip 小不代表报告小：同一样本约 659 KB gzip 生成约 131 MB JSON、
  208 MB HTML。这是单样本测量，不能当作通用放大倍数。

## 证据

官方 ARM64 发布归档通过固定 SHA256 校验，`xclogparser version` 返回 0.2.50；
四个 reporter 均退出 0。原始日志 SHA256：
`79edfe6de7d221b888c0df11ad45343aacbe2c25b35184b4e78452589f72ebae`。
本文仅记录脱敏结构和公开源码，不发布内部原始日志、路径或报告。
