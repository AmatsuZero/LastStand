+++
date = '2026-06-16T09:06:27+08:00'
draft = false
title = 'Swift 面试源码系列'
tags = ['Swift', 'iOS', '源码分析', '面试']
categories = ['iOS开发']
weight = -90
+++

# Swift 面试源码系列

这组文章围绕 Swift 语言面试高频问题展开：先给出可以直接用于面试表达的答案，再结合 Swift 源码定位解释背后的实现机制。

## 推荐阅读路径

如果你是为了面试准备，建议按下面顺序阅读：

[**1** **ARC 与内存管理** 理解 Swift 对象生命周期、引用计数、weak/unowned 与 ARC 优化。](./arc-memory-management/)

[**2** **泛型、协议与派发** 串起 Generic Signature、函数派发、Protocol Witness Table、Existential 与动态派发。](./generics-protocol-dispatch/)

[**3** **值语义、COW 与集合** 解释 struct 为什么可以高效复制，以及 Array/String/Dictionary 的存储策略。](./value-semantics-cow-collections/)

[**4** **并发、async/await 与 Actor** 说明 Swift Concurrency 的任务模型、Actor 隔离和 MainActor。](./concurrency-actor-async/)

[**5** **编译流程、Runtime 与元数据** 从 AST、SIL、IRGen 到 Runtime Metadata，建立语言机制的源码地图。](./compiler-runtime/)
