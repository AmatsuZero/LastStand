+++
title = "启动优化-减少动态库"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 7
tags = ["iOS", "性能优化", "启动"]
categories = ["iOS开发", "性能优化"]
+++
动态库加载是Pre-main阶段的重要组成部分，每个动态库都需要加载、验证签名、进行符号绑定，这些操作会显著影响启动时间。

---

## 问题分析

当App启动时，dyld需要：

1. 分析Mach-O文件的Load Commands，找出依赖的动态库
2. 递归加载所有依赖的动态库
3. 对每个动态库进行签名验证
4. 执行Rebase和Bind操作

动态库数量越多，这些操作的耗时就越长。Apple建议将自定义动态库数量控制在6个以内。关于动态库加载的详细流程，可以参考[Mach-O的链接、装载与库]({{< relref "/posts/interview/ios-basics/Mach-O的链接-装载与库" >}})。

> **关于缓存机制**：
> - **系统动态库**：已被放入 dyld shared cache 中，其加载和符号绑定操作已预先完成，不会影响 App 启动时间
> - **App 动态库**：dyld 3 引入的 Launch Closure 机制会缓存依赖分析、Rebase/Bind 信息等元数据。首次启动（或 App 更新后）会生成缓存，后续启动直接使用
> 
> 但即使有 Launch Closure 缓存，**Rebase/Bind 操作本身仍需执行**（因为 ASLR slide 每次启动都不同），动态库数量越多，这些操作的耗时仍然越长。

```plaintext
App可执行文件
    ├── UIKit.framework
    │     ├── Foundation.framework
    │     │     └── CoreFoundation.framework
    │     └── CoreGraphics.framework
    ├── 自定义Framework A
    │     └── 依赖库...
    └── 自定义Framework B
          └── 依赖库...
```

---

## 优化方案

### 1. 合并动态库

将功能相近的动态库合并为一个：

```plaintext
优化前：
App
├── LibA.framework
├── LibB.framework
├── LibC.framework
├── LibD.framework
└── LibE.framework
(5个动态库，加载耗时约 250ms)

优化后：
App
├── CoreLib.framework (合并 A, B, C)
└── UtilLib.framework (合并 D, E)
(2个动态库，加载耗时约 100ms)
```

### 2. 动态库改为静态库

将非必要的动态库改为静态库，静态库在编译时就会链接到可执行文件中，不需要运行时加载：

| 库类型 | 编译时 | 运行时 | 对启动的影响 |
|-------|-------|-------|------------|
| 动态库 | 记录依赖 | 加载、链接 | 增加启动时间 |
| 静态库 | 合并到可执行文件 | 无额外操作 | 无影响 |

在CocoaPods中配置静态库：

```ruby
# Podfile
use_frameworks! :linkage => :static

# 或者针对特定Pod
pod 'SomePod', :linkage => :static
```

### 3. 使用Swift Package Manager静态链接

SPM默认使用静态链接，这对启动优化是有利的：

```swift
// Package.swift
let package = Package(
    name: "MyPackage",
    products: [
        .library(
            name: "MyLibrary",
            type: .static,  // 明确指定静态库
            targets: ["MyLibrary"]),
    ],
    // ...
)
```

### 4. 移除不再使用的动态库

定期审查项目依赖，移除不再使用的库：

```plaintext
检查步骤：
1. 在Build Phases → Link Binary With Libraries中查看所有链接的库
2. 使用otool -L查看实际链接的动态库
3. 移除未使用的库引用
```

使用命令行检查：

```bash
# 查看App链接的所有动态库
otool -L /path/to/YourApp.app/YourApp
```
