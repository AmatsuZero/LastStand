+++
title = "Tagged Pointer 对象实现讲解"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 9
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime internals

# Tagged Pointer 对象

Tagged Pointer 是一种“指针即对象”的表示法：对象没有堆内存，类信息和 payload 直接编码在指针位中。objc4 对它提供了创建、取 tag、取 payload、取类、消息发送、禁用和混淆等完整路径。

**目录** [作用](#why) [实现原理](#layout) [核心宏、结构、函数](#symbols) [关键流程](#flows) [测试视角](#tests) [源码依据](#sources)

## 作用

### 减少堆分配

小整数、短字符串、日期、索引路径等小对象可以直接塞进指针。`NSNumber` 的小整数就是典型例子，`test/taggedNSPointers.m` 验证了 `NSNumber numberWithInt:1234` 是 tagged pointer。

### 保留对象语义

虽然指针不指向对象内存，它仍能接收消息、查询类、作为字典 key/value，并通过 Foundation/CF 桥接。运行时把 tag 映射到真实 Class 后，继续走常规方法缓存查找。

### 绕开生命周期表

`test/taggedPointers.m` 验证 retain、release、autorelease、weak store/load 对 tagged pointer 不产生真实引用计数或弱引用表负担。它们本质上是立即值，不需要释放。

**一句话：**Tagged Pointer 把“对象身份”改成“位编码值”。运行时需要做的，是在所有需要对象元数据的地方识别它，并把 tag 翻译成类。

## 实现原理

objc4 在 64 位平台启用 tagged pointer。`runtime/objc-config.h` 中 `SUPPORT_TAGGED_POINTERS` 对 `__LP64__` 为 1；非 64 位平台关闭。tag 标记位在大多数平台使用 MSB，macOS x86_64 使用 LSB。arm64 还使用 split tagged pointer 布局。

### 基本 tag：60-bit payload

tag 0...6 可用，tag 7 保留给扩展表示。

**概念**

tagged 标记

3-bit tag

60-bit payload

在 arm64 split 布局中，标记位是 bit 63，普通 tag 位在低 3 位，因此 `_OBJC_TAG_INDEX_SHIFT` 为 0。

### 扩展 tag：52-bit payload

tag 8...263 可用，tag 264 保留；用 tag 7 进入扩展空间。

**概念**

tagged 标记

0b111

8-bit ext tag

52-bit payload

扩展 tag 增加了可表示的类数量，但 payload 从 60 位降到 52 位。

```text
// runtime/objc-internal.h：tag 空间的语义边界
OBJC_TAG_First60BitPayload = 0;
OBJC_TAG_Last60BitPayload  = 6;
OBJC_TAG_RESERVED_7        = 7;
OBJC_TAG_First52BitPayload = 8;
OBJC_TAG_Last52BitPayload  = 263;
OBJC_TAG_RESERVED_264      = 264;

// arm64 split tagged pointers：标记位在 MSB，普通 tag 在低 3 位。
#define _OBJC_TAG_MASK             (1UL<<63)
#define _OBJC_TAG_INDEX_SHIFT      0
#define _OBJC_TAG_SLOT_SHIFT       0
#define _OBJC_TAG_PAYLOAD_LSHIFT   1
#define _OBJC_TAG_PAYLOAD_RSHIFT   4

// 扩展表示：低 3 位都是 1，扩展 tag 放在高位区间。
#define _OBJC_TAG_EXT_MASK         (_OBJC_TAG_MASK | 0x7UL)
#define _OBJC_TAG_EXT_INDEX_SHIFT  55
#define _OBJC_TAG_EXT_PAYLOAD_LSHIFT 9
#define _OBJC_TAG_EXT_PAYLOAD_RSHIFT 12
```

## 核心宏、结构、函数和关键字段

| 符号 | 位置 | 作用 |
|----|----|----|
| `SUPPORT_TAGGED_POINTERS` | `runtime/objc-config.h` | 编译期总开关。64 位启用，非 64 位关闭。 |
| `OBJC_MSB_TAGGED_POINTERS` / `OBJC_SPLIT_TAGGED_POINTERS` | `runtime/objc-internal.h` | 决定标记位方向和 arm64 split 布局。 |
| `objc_tag_index_t` | `runtime/objc-internal.h` | tag 枚举。0...6 是 60-bit payload，8...263 是 52-bit payload。 |
| `objc_debug_taggedpointer_classes` | `runtime/Messengers.subproj/objc-msg-arm64.s` | 普通 tag 到 Class 的表。arm64 汇编里定义，C++ 里通过 `objc_tag_classes` 使用。 |
| `objc_debug_taggedpointer_ext_classes` | `runtime/Messengers.subproj/objc-msg-arm64.s` | 扩展 tag 到 Class 的表。放在普通表前面，便于消息发送汇编用负索引查表。 |
| `objc_debug_taggedpointer_obfuscator` | `runtime/objc-runtime-new.mm` | 运行时随机混淆值。用于构造和解码 tagged pointer，降低伪造特定对象的可预测性。 |
| `_objc_makeTaggedPointer` | `runtime/objc-internal.h` | 根据 tag 和 payload 组装指针，再做混淆/置换。 |
| `_objc_isTaggedPointer` | `runtime/objc-internal.h` | 只检查标记位，不验证 tag 是否已注册类。 |
| `_objc_getTaggedPointerTag` / `_objc_getTaggedPointerValue` | `runtime/objc-internal.h` | 先解混淆，再取 tag 或 payload；payload 分无符号和有符号两种接口。 |
| `_objc_registerTaggedPointerClass` | `runtime/objc-runtime-new.mm` | 把 tag 注册到 Class，非法 tag 或冲突注册会 fatal。 |
| `objc_object::getIsa()` | `runtime/objc-object.h` | 普通对象读 isa；tagged pointer 通过 class 表取 Class。 |
| `GetTaggedClass` | `runtime/Messengers.subproj/objc-msg-arm64.s` | arm64 消息发送中为 tagged receiver 快速取 Class 的汇编宏。 |

## 关键流程

### 1. 判断 tagged

判断逻辑非常轻：看指针与 `_OBJC_TAG_MASK` 的交集是否等于 mask。这个检查不保证类有效，只说明“位形态像 tagged pointer”。

```javascript
// runtime/objc-internal.h
static inline bool
_objc_isTaggedPointer(const void *ptr)
{
    // MSB tagged 平台：最高位为 1 即视为 tagged。
    // macOS x86_64 等 LSB tagged 平台：最低位为 1。
    return ((uintptr_t)ptr & _OBJC_TAG_MASK) == _OBJC_TAG_MASK;
}

static inline bool
_objc_isTaggedPointerOrNil(const void *ptr)
{
    // 很多运行时路径同时需要快速处理 nil 和 tagged pointer。
    return !ptr || ((uintptr_t)ptr & _OBJC_TAG_MASK) == _OBJC_TAG_MASK;
}
```

### 2. 构造、取 tag、取 payload

### 选择表示

tag 0...6 用普通表示；tag 8...263 用扩展表示。

### 写入位域

设置 tagged 标记、tag 位和 payload 位。

### 混淆

用 obfuscator XOR，split 普通 tag 还会置换。

### 解码

读取时先反向处理混淆和 tag 置换。

### 移位取值

根据普通/扩展表示抽出 tag 或 payload。

```cpp
// runtime/objc-internal.h：构造 tagged pointer 的核心逻辑，省略断言。
static inline void *
_objc_makeTaggedPointer_withObfuscator(objc_tag_index_t tag,
                                       uintptr_t value,
                                       uintptr_t obfuscator)
{
    if (tag <= OBJC_TAG_Last60BitPayload) {
        uintptr_t result =
            _OBJC_TAG_MASK |                              // 1. 标出这是 tagged pointer
            ((uintptr_t)tag << _OBJC_TAG_INDEX_SHIFT) |   // 2. 写入 3-bit 基本 tag
            ((value << _OBJC_TAG_PAYLOAD_RSHIFT) >>
             _OBJC_TAG_PAYLOAD_LSHIFT);                  // 3. 截断并放入 60-bit payload

        return _objc_encodeTaggedPointer_withObfuscator(result, obfuscator);
    } else {
        uintptr_t result =
            _OBJC_TAG_EXT_MASK |                          // 1. 标出扩展 tagged：MSB + 低 3 位全 1
            ((uintptr_t)(tag - OBJC_TAG_First52BitPayload)
                << _OBJC_TAG_EXT_INDEX_SHIFT) |           // 2. 写入 8-bit 扩展 tag
            ((value << _OBJC_TAG_EXT_PAYLOAD_RSHIFT) >>
             _OBJC_TAG_EXT_PAYLOAD_LSHIFT);               // 3. 截断并放入 52-bit payload

        return _objc_encodeTaggedPointer_withObfuscator(result, obfuscator);
    }
}
```

### 3. 取类：从 tag 到 Class

`objc_object::getIsa()` 对普通对象直接读 isa；如果 receiver 是 tagged pointer，则用 pointer 位计算 slot，再查类表。扩展 tagged 的普通 slot 中会放 `__NSUnrecognizedTaggedPointer` 占位类，触发二次查扩展表。

```cpp
// runtime/objc-object.h：对象层面的 Class 获取。
inline Class
objc_object::getIsa() const
{
    if (fastpath(!isTaggedPointer()))
        return ISA(/*authenticated*/true);                // 普通对象：从对象内存读取 isa。

    uintptr_t ptr = (uintptr_t)this;
    uintptr_t slot = (ptr >> _OBJC_TAG_SLOT_SHIFT) &
                     _OBJC_TAG_SLOT_MASK;                 // 基本 tag slot。
    Class cls = objc_tag_classes[slot];

    if (slowpath(cls == (Class)&OBJC_CLASS_$___NSUnrecognizedTaggedPointer)) {
        slot = (ptr >> _OBJC_TAG_EXT_SLOT_SHIFT) &
               _OBJC_TAG_EXT_SLOT_MASK;                   // 扩展 tag slot。
        cls = objc_tag_ext_classes[slot];
    }
    return cls;
}
```

### 4. 注册 tag class

注册是运行时把某个 tag 绑定到某个 Class 的入口。它会处理禁用、非法 tag、重复注册和扩展 tag 占位类。

```cpp
// runtime/objc-runtime-new.mm：注册 Class 到 tagged pointer tag。
void
_objc_registerTaggedPointerClass(objc_tag_index_t tag, Class cls)
{
    if (objc_debug_taggedpointer_mask == 0)
        _objc_fatal("tagged pointers are disabled");      // 运行期禁用后禁止注册。

    auto *slot = classSlotForTagIndex(tag);                // 根据 tag 找普通表或扩展表 slot。
    if (!slot)
        _objc_fatal("tag index %u is invalid", tag);       // tag 7、264 或越界会失败。

    Class oldCls = *slot;
    if (cls && oldCls && cls != oldCls)
        _objc_fatal("tag index %u used for two different classes", tag);

    *slot = cls;                                           // 同类重复注册和注册 nil 允许。

    if (tag < OBJC_TAG_First60BitPayload ||
        tag > OBJC_TAG_Last60BitPayload) {
        auto *extSlot = classSlotForBasicTagIndex(OBJC_TAG_RESERVED_7);
        if (*extSlot == nil)
            *extSlot = (Class)&OBJC_CLASS_$___NSUnrecognizedTaggedPointer;
    }
}
```

### 5. 消息发送分流

arm64 的 `objc_msgSend` 在入口先比较 receiver 和 0。MSB tagged pointer 看起来是负数，因此 `b.le` 同时捕获 nil 和 tagged。nil 返回 0；tagged 用 `GetTaggedClass` 得到 Class，然后回到正常缓存查找。

```asm
// runtime/Messengers.subproj/objc-msg-arm64.s：简化后的关键路径。
_objc_msgSend:
    cmp     p0, #0                         // receiver 与 0 比较。
    b.le    LNilOrTagged                   // 等于 0 是 nil；小于 0 是 MSB tagged pointer。

    ldr     p14, [x0]                      // 普通对象：从对象内存加载 raw isa。
    GetClassFromIsa_p16 p14, 1, x0         // 得到 class。
LGetIsaDone:
    CacheLookup NORMAL, _objc_msgSend, __objc_msgSend_uncached

LNilOrTagged:
    b.eq    LReturnZero                    // nil 消息返回 0。
    GetTaggedClass                         // tagged：从 tag class 表取 class 到 x16。
    b       LGetIsaDone                    // 之后复用普通方法缓存查找。

// GetTaggedClass 的 arm64 split 思路：
and x10, x0, #0x7                          // 低 3 位是 small tag。
asr x11, x0, #55                           // 扩展 tag 形成负索引。
cmp x10, #7
csel x12, x11, x10, eq                     // tag==7 查扩展表，否则查普通表。
ldr x16, [_objc_debug_taggedpointer_classes + x12*8]
```

### 6. 禁用与混淆

### 禁用 tagged pointer

`OBJC_DISABLE_TAGGED_POINTERS=YES` 会让启动流程调用 `disableTaggedPointers()`，把 mask、slot shift、payload shift、ext mask 等调试字段清零。之后 `_objc_taggedPointersEnabled()` 返回 false，注册类会 fatal。

### 禁用 tag 混淆

`OBJC_DISABLE_TAG_OBFUSCATION=YES` 或旧 SDK 链接路径会让 `objc_debug_taggedpointer_obfuscator = 0`。测试据此可直接用固定指针形态取出 tag 0。

```cpp
// runtime/objc-runtime-new.mm：启动期混淆初始化。
static void
initializeTaggedPointerObfuscator(void)
{
    if (!DisableTaggedPointerObfuscation &&
        dyld_program_sdk_at_least(dyld_fall_2018_os_versions)) {
        arc4random_buf(&objc_debug_taggedpointer_obfuscator,
                       sizeof(objc_debug_taggedpointer_obfuscator));
        objc_debug_taggedpointer_obfuscator &= ~_OBJC_TAG_MASK;

#if OBJC_SPLIT_TAGGED_POINTERS
        objc_debug_taggedpointer_obfuscator &=
            ~(_OBJC_TAG_EXT_MASK | _OBJC_TAG_NO_OBFUSCATION_MASK);
        // split 布局还会随机打乱前 7 个普通 tag 的映射。
#endif
    } else {
        objc_debug_taggedpointer_obfuscator = 0;
    }
}
```

## 测试视角

| 测试文件 | 覆盖点 |
|----|----|
| `test/taggedPointers.m` | 构造 tagged pointer、验证 tag/payload、类表 slot、消息发送、结构体返回、浮点返回、关联对象、弱引用、retain/release/autorelease 绕行，以及 split 下 constant CFString raw pointer round trip。 |
| `test/taggedPointersAllClasses.m` | 遍历所有可注册 tag，为空闲 tag 动态创建 Class，发送消息验证每个 tag 的 payload 解码都正确。 |
| `test/taggedNSPointers.m` | 验证 Foundation/CF 中的 `NSNumber` tagged pointer：CF 类型、Class 注册、取 tag、重建指针、集合行为和 selector 响应。 |
| `test/taggedPointersDisabled.m` | 设置 `OBJC_DISABLE_TAGGED_POINTERS=YES` 后，`_objc_taggedPointersEnabled()` 为 false，注册 tag class 触发 “tagged pointers are disabled”。 |
| `test/taggedPointersTagObfuscationDisabled.m` | 设置 `OBJC_DISABLE_TAG_OBFUSCATION=YES` 后，固定形态的指针能直接解出 tag 0，说明 obfuscator 不参与。 |
| `test/badTagClass.m` | 同一 tag 重复注册同一个类和 nil 允许；换成另一个类会 fatal，防止 tag 到 Class 映射歧义。 |
| `test/badTagIndex.m` | 注册 `OBJC_TAG_Last52BitPayload + 1` 即 264 会 fatal，验证 tag 边界。 |

## 源码依据

### 运行时实现

runtime/objc-config.h runtime/objc-internal.h runtime/objc-object.h runtime/objc-runtime-new.mm runtime/Messengers.subproj/objc-msg-arm64.s

### 行为测试

test/taggedPointers.m test/taggedPointersAllClasses.m test/taggedPointersDisabled.m test/taggedPointersTagObfuscationDisabled.m test/taggedNSPointers.m test/badTagClass.m test/badTagIndex.m

**注意：**objc4 注释明确说明 tagged pointer 布局会随 OS/架构变化。业务代码不应依赖具体位布局，应使用公开或 SPI 层提供的表示无关接口。

本文档为单页自包含 HTML，面向 objc4 源码阅读，重点解释 Tagged Pointer 从位布局到消息发送的运行时闭环。
