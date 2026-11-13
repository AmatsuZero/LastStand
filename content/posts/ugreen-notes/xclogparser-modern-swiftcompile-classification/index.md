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

### 真实 CI 详细诊断与报告交付补充

后续在真实 macOS Runner 的 Xcode 26.5 / 17F42 上执行详细诊断 Archive，
两项诊断参数均已注入，文本有真实函数计时，独立表达式输出尚未确认。
官方 0.2.50 的四个 Reporter 成功，但函数和表达式
数组仍为空，38 个 SwiftCompile 步骤仍为 other；文件记录还存在空路径和合成
条目，不能直接拿记录条数当独立文件数。新版工具链实测没有解除能力验收缺口。

进一步用官方 `dump` 解码同一原始日志，得到 8,221 个 section。计时文本中有
93,321 行三列函数输出，其中 88,868 行包含 Swift 文件位置，4,453 行为无效位置；
这些是诊断输出行数，不是唯一函数数或已通过验收的指标。它们分布在 34 个
`SwiftCompile` 和 18 个 `SwiftEmitModule` section，这些 section 的
`commandDetailDesc` 均没有诊断参数；参数位于另外 102 个 `SwiftDriver` section，
其中 101 个 section 的 `text` 为空，另一个只有告警文本，没有计时行。
0.2.50 除分类入口不兼容外，
`SwiftCompilerParser.findRawSwiftTimes()` 还要求参数和输出在同一 section。
因此仅补任务名称分类仍不足以恢复这份输入的函数数据关联。

表达式方面，原始文本没有找到解析器预期的两列计时行；不能称为单纯解析丢失。
固定 Swift 6.3.2 上游源码还提供了一条可验证线索：
[`startExpressionTimer()`](https://github.com/swiftlang/swift/blob/cd8d8ad0019e4e291906b311e0d25d7039cddc9c/lib/Sema/ConstraintSystem.cpp#L179)
仅在表达式超时阈值或慢表达式告警阈值非零时创建计时器，创建时没有检查
`DebugTimeExpressions`；debug 开关只在已有计时器析构时决定是否打印。
两个阈值默认均为零，本次实际命令也未设置对应阈值参数。
这是固定源码与真实日志吻合的解释，但尚未用同一 Apple Runner 编译器做最小对照，
不要宣称已验证恢复表达式输出，也不要将告警阈值直接加到正式构建中。

后续用 Xcode 27.2 / 27B52、Swift 6.4.2 做最小真实 iOS Framework Release
Archive 对照，固定同一个官方 0.2.50 binary。两个 debug 参数单独启用，以及再加
`-warn-long-expression-type-checking=200`，两种配置均构建成功，原始日志均有
3 行函数计时和 6 行表达式计时。JSON、Flat JSON、HTML 均生成成功，但解析后的
函数/表达式条数均为零，两个 `SwiftCompile` 记录仍为 `other`。
这证明在这个真实最小工程中，单独升级 Xcode 27.2 不能恢复这些指标；它不是宿主
App 或另一台 Runner 的验收。27.2 不加告警阈值也产生表达式输出，前述 Swift 6.3.2
源码线索不能泛化到 Swift 6.4.2。保留原始输入和报告，未据此升级 Runner。

该样本原始压缩日志约 4.06 MB，层级 JSON 约 1.20 GB、Flat JSON 约 1.20 GB、
HTML 约 1.62 GB。跨物理 Mac 的分析生成成功后，常规 Artifact 上传返回 413。
生成成功、上传成功和指标正确性是三项不同验收，不按输入 gzip 大小预算输出容量。

probe 的有效交付是把完整报告 gzip 后按最大 32 MiB 分块，使用 Job Token 上传
同一私有项目的 Generic Registry，Artifact 只保留摘要、计时/RSS和校验清单。
真实完整包约 350 MB、11 块，回读后逐块及整体 SHA256 均匹配，HTML index 和
三种 JSON 均存在。两台物理 Mac 的身份摘要不同，同一输入的 Runner 和本机
归一化摘要一致；没有共享 DerivedData，也没有为报告交付再次编译 App。
Registry 包不会自动随 Artifact 到期，推广前必须设计独立保留/清理策略。
这些是单样本链路与容量证据，不构成诊断参数 A/B/C 开销或解析器生产准入。

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
