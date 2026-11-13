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
解析器、仅凭文件名补分类，或把缺失函数/表达式样本补成零。本次未实现或验证
任何上游修复，也未证实其他 Xcode 版本是否同样受影响。

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
