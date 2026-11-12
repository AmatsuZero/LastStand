---
title: "KMP 启动测试：初始化桥接、Pods 模式与性能配置边界"
date: 2026-11-12T17:00:37+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["KotlinMultiplatform", "CocoaPods", "Xcode", "构建", "踩坑"]
---

## 现象（symptom）

为 iOS 启动测试接入离线响应和优化构建时，先后遇到三个独立问题：

1. Kotlin 实现的 `NSURLProtocol` 子类能编译，但被 Foundation 实际创建时，报 `initWithRequest:cachedResponse:client: is not implemented`。
2. 测试源码 Pods 安装成功后，运行生产锁文件校验，再编译测试 App，出现 `cannot find 'UiTestSessionInjectorKt' in scope` 等注入符号缺失。
3. 新增 `StartupProfile` 配置并在测试入口模块映射到 RELEASE 后，Gradle 仍在另一个 CocoaPods 模块的配置阶段因无法识别构建类型而失败。

这三项分别属于 Objective-C 初始化桥接、宿主依赖模式和 Gradle 配置映射，不能混作一个 mock 网络错误。

## 已验证成因（verified cause）

### Objective-C 初始化桥接

此次 Kotlin/Native 2.4.0 测试中，仅声明 Kotlin 构造器并调用 `NSURLProtocol` 父类构造器，没有实现 Foundation 所需的初始化覆盖。需要使用 `ObjCObjectBase.OverrideInit`，且参数名、类型与生成的 Objective-C 初始化接口一致。

正确导入位置是 `kotlinx.cinterop.ObjCObjectBase.OverrideInit`。不能把导入路径或 Swift 侧接口名直接猜成 Kotlin 声明。

### 锁文件校验会重新安装依赖

该宿主的 `verify-lock` 并非只读比较：脚本会更新锁定子模块，并重新安装生产二进制 Pods。测试源码模式使用同名的替代 framework，生产 framework 不导出测试注入 API。

因此，在源码模式安装与测试编译之间插入生产校验，会改变编译实际使用的依赖。Swift 测试宏仍开启，而链接图已回到生产模式，两者不一致便产生符号缺失。

这是当前宿主脚本的行为，不是所有同名锁文件校验工具的通用语义；其他项目应先读实际脚本。

### 自定义 Xcode 配置需要覆盖参与配置的模块

Kotlin CocoaPods 插件默认识别 Debug/Release。新增宿主配置后，只修改入口模块的 `xcodeConfigurationToNativeBuildType` 不足以保证整次 Gradle 调用成功：其他应用了 CocoaPods 插件的子项目也会参与配置，并可能先失败。

## 有效恢复（effective recovery）

Objective-C 测试子类使用如下初始化声明；省略的 protocol 方法仍需按真实测试实现：

```kotlin
import kotlinx.cinterop.ObjCObjectBase.OverrideInit

private class FixtureURLProtocol @OverrideInit constructor(
    request: NSURLRequest,
    cachedResponse: NSCachedURLResponse?,
    client: NSURLProtocolClientProtocol?,
) : NSURLProtocol(request, cachedResponse, client) {
    // 实现 canInitWithRequest、startLoading 等协议行为。
}
```

构建流程先完成生产模式的锁校验和 Release 验证，再通过宿主批准的入口重新安装 UI 测试源码依赖，最后编译性能测试配置。该项目的源码安装入口为 `make -C iot pods UI_TESTS=1 REPO_UPDATE=`。源码安装后，不再插入会切换回生产模式的校验。

自定义配置沿用仓库已有的全局 CocoaPods 映射位置，为所有适用模块补齐 `StartupProfile -> NativeBuildType.RELEASE`；入口模块自身也保持一致。不要把 CocoaPods 扩展误当成 project 顶层扩展，该工程中它挂在 Kotlin 扩展下。

保存实际解析的 Swift/C 优化、Kotlin 构建类型和调试符号配置。仅名为 Profile/Release 不能证明最终产物已优化。源码模式生成的锁文件和编译宏变化不能混入生产锁文件提交。

## 边界（boundaries）

- 此次 `@OverrideInit` 结论来自具体版本和初始化签名，不代表所有 Objective-C 子类都要机械添加同一声明。
- 不用删除测试调用、放宽编译条件或手改锁文件来掩盖依赖模式不一致。
- 普通生产构建应继续缺少测试注入符号、启动记录器和 fixture 资源；专项配置开启测试能力不等于生产包应携带它们。
- 编译、Ktor 传输测试和符号检查不能证明 App 真机离线启动、首次安装状态重置、首页可交互或启动耗时已经验收。

## 证据（evidence）

2026-11-12 的本地实施记录保留了初始化运行时错误、Swift 注入符号缺失及自定义构建类型失败的排查结果。修复后：

- KMP iOS arm64 模拟器测试 4 项通过，其中 3 项覆盖启动 fixture，包含通过实际 Ktor session 解码响应及拒绝未知请求。
- 普通 unsigned Release 构建成功，产物检查未发现启动记录器、测试注入符号和 fixture 资源。
- unsigned `StartupProfile` 的 App 与 UI test target 完成 `build-for-testing`。

以上是已有日志与产物的证据归档，不是本文撰写时重新执行的真机测试；没有记录或推断任何真实启动耗时。

相关基础边界见 [KMP UI 测试替代 framework 的源码预检边界](../kmp-ui-test-source-pod-preflight/)。
