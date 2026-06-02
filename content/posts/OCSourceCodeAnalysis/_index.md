+++
title = "OC 源码分析"
date = '2026-06-02T09:00:00+08:00'
draft = false
weight = -100
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime reading guide

# objc4 技术文章索引

这组单页文档围绕 Objective-C runtime 的主干路径展开：从 dyld 加载镜像、类实现化、消息发送和方法缓存， 一直到引用计数、weak、autorelease、关联对象、Protocol、KVC/KVO 与底层哈希容器。

**17**篇单页讲解

**4**推荐阅读阶段

**runtime/**主要源码目录

**test/**行为验证入口

## 推荐阅读路径

如果是第一次系统阅读 objc4，按下面顺序看最容易把机制串起来。

[**1** **先看类如何进入 runtime** 理解 dyld、`read_images`、realize 和 methodize。](./class-realization-explained/) [**2** **再看一次消息如何执行** 从 `objc_msgSend` 快速路径走到慢速查找。](./message-send-explained/) [**3** **补上方法缓存细节** 看清 `cache_t`、`bucket_t`、扩容和 flush。](./method-cache-explained/) [**4** **最后进入对象生命周期** 串起 isa、inline retain count、SideTable 和 dealloc。](./isa-refcount-explained/)

## Runtime 主干机制

这些文章解释对象、类、方法、选择子和协议如何被 runtime 组织起来。

load

### 类加载、read_images 与类实现化

从 dyld 映射镜像到 `readClass`、future class、`realizeClass`、`methodizeClass`。

[阅读文档](./class-realization-explained/)

message

### objc_msgSend 与慢速查找入口

解释 arm64 快速路径、nil/tagged pointer、cache miss、`lookUpImpOrForward` 和 forwarding。

[阅读文档](./message-send-explained/)

cache

### 方法缓存 cache_t / bucket_t

讲清方法缓存的查找、插入、扩容、flush 以及 preoptimized cache。

[阅读文档](./method-cache-explained/)

category

### Category 装载与附加

覆盖未实现类分类暂存、`attachCategories`、方法列表前插、缓存失效和 `+load` 关系。

[阅读文档](./category-loading-explained/)

load method

### +load 调度

解释 `load_images`、`call_load_methods`、类优先于分类、重入处理和锁边界。

[阅读文档](./load-method-explained/)

initialize

### +initialize 懒初始化

拆解父类优先、INITIALIZING/INITIALIZED、并发等待、异常重入和 fork 处理。

[阅读文档](./initialize-method-explained/)

selector

### Selector / SEL 唯一化

说明 selector 注册、镜像加载时 fixup、方法名查找和缓存 hash 的关系。

[阅读文档](./selector-interning-explained/)

protocol

### Protocol 注册与查询

讲解协议读取、去重、remap、`objc_getProtocol`、`class_conformsToProtocol` 和动态注册。

[阅读文档](./protocol-runtime-explained/)

tagged

### Tagged Pointer 对象

从 bit 判断、取类、注册 tag class 到消息发送分流和禁用/混淆测试。

[阅读文档](./tagged-pointer-explained/)

## 对象生命周期与动态能力

这些文章聚焦对象如何被管理、引用、附加额外状态，以及 Foundation 层常见动态特性如何建立在 runtime 上。

memory

### isa、nonpointer isa 与引用计数

连接 isa 初始化、retain/release、SideTable 溢出、dealloc 与 clearDeallocating。

[阅读文档](./isa-refcount-explained/)

weak

### weak 指针实现原理

说明 weak 表、弱引用登记、对象销毁时置 nil，以及常见竞态防护。

[阅读文档](./weak-pointer-explained/)

autorelease

### Autorelease

解释 per-thread pool page、push/pop、返回值优化和池页释放流程。

[阅读文档](./autorelease-explained/)

association

### 关联对象 Associated Objects

覆盖 set/get/remove、retain/copy/assign policy、对象销毁清理和禁止关联场景。

[阅读文档](./associated-objects-explained/)

kvc

### KVC

从字符串 key 到 getter、ivar、collection proxy、undefined key 的完整查找链。

[阅读文档](./kvc-explained/)

kvo

### KVO

解释动态子类、isa-swizzling、setter 包装、通知派发和清理边界。

[阅读文档](./kvo-explained/)

## 底层容器与辅助结构

这些文档帮助理解 runtime 内部表结构的设计取舍。

hash

### hashtable2.mm

讲解 objc4 内部模板哈希表的桶、探测、扩容和删除策略。

[阅读文档](./hashtable2-explained/)

map

### maptable.h / maptable.mm

解释 NXMapTable 的 prototype 回调、开放寻址、重哈希和删除流程。

[阅读文档](./maptable-explained/)

文档均为静态 HTML，可直接从文件系统打开；源码依据主要来自 `runtime/` 与 `test/`。
