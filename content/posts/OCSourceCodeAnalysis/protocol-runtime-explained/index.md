+++
title = "objc4 Protocol 结构、注册与查询"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 8
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

## 目录

[1. Protocol 的作用](#role) [2. 核心结构](#model) [3. read_images 读取协议](#load) [4. remap 与重复协议](#remap) [5. 查询与 conforms 判断](#query) [6. 动态创建与注册](#dynamic) [7. 测试体现的行为](#tests) [8. 总结](#summary)

## 1. Protocol 的作用

在 objc4 中，`Protocol *` 并不是一个只有名字的轻量句柄，而是运行时管理的一类 Objective-C 对象。 它承载协议名、继承的协议列表、必需/可选方法列表、实例/类属性列表等元数据。类、分类和协议自身都可以引用这些对象。

对外 API 位于 `runtime/runtime.h` 的 “Working with Protocols” 区域，例如 `objc_getProtocol`、`objc_copyProtocolList`、`protocol_conformsToProtocol`、 `protocol_getMethodDescription`、`objc_allocateProtocol` 与 `objc_registerProtocol`。 `runtime/Protocol.mm` 中的 `@implementation Protocol` 则把老式 Objective-C 消息转接到这些 C API。

关键心智模型：编译器把协议写进镜像的 `__objc_protolist` 等段；runtime 在 `_read_images` 中发现并安装协议； 后续所有查询都尽量通过“协议名 =\> 胜出的协议对象”来回到唯一的、当前有效的定义。

## 2. 核心结构

当前实现中的底层结构定义在 `runtime/objc-runtime-new.h`。公开的 `Protocol *` 在实现里经常通过 `newprotocol(p)` 转成 `protocol_t *` 使用。

```javascript
// runtime/objc-runtime-new.h，保留关键字段并加注释
typedef uintptr_t protocol_ref_t;  // 尚未 remap 的 protocol_t *

struct protocol_t : objc_object {
    const char *mangledName;                 // 协议的运行时名字；Swift v1 可能是 mangled 名
    struct protocol_list_t *protocols;       // 该协议继承/组合的其他协议
    method_list_t *instanceMethods;          // @required 实例方法
    method_list_t *classMethods;             // @required 类方法
    method_list_t *optionalInstanceMethods;  // @optional 实例方法
    method_list_t *optionalClassMethods;     // @optional 类方法
    property_list_t *instanceProperties;     // required instance properties
    uint32_t size;                           // 磁盘结构大小；用于判断尾部字段是否存在
    uint32_t flags;                          // fixed-up、canonical 等运行时标志

    // 以下字段不是所有磁盘协议结构都有，访问前必须看 size。
    const char **_extendedMethodTypes;       // 扩展类型编码
    const char *_demangledName;              // Swift demangled 名称缓存
    property_list_t *_classProperties;       // 类属性列表
};

struct protocol_list_t {
    uintptr_t count;                         // 历史原因：count 是指针宽度
    protocol_ref_t list[0];                  // 变长数组；元素可能需要 remap
};
```

### 关键字段与方法

|  |  |
|----|----|
| `mangledName` | 全局协议表的 key。`objc_getProtocol` 先按原名查，再查 dyld 预优化表，再尝试 Swift v1 mangled 等价名。 |
| `protocols` | 协议继承关系。`protocol_conformsToProtocol` 会递归遍历它；`protocol_copyProtocolList` 只复制直接继承项。 |
| 四个方法列表 | 按 required/optional 与 instance/class 分成四组。`protocol_copyMethodDescriptionList` 只返回当前协议直接声明的方法，不包含父协议。 |
| `size` | 兼容小协议或旧 ABI 的关键字段。`protocolSmall.m` 手工构造较小结构，验证访问尾部字段前必须判定字段是否存在。 |
| `flags` | 高位用于 `PROTOCOL_FIXED_UP_*` 与 `PROTOCOL_IS_CANONICAL`，标记是否已修正以及共享缓存中的 canonical 定义。 |

### `Protocol` 类

`runtime/Protocol.h` 只暴露不可直接使用的 `@interface Protocol`； `Protocol.mm` 中 `-conformsTo:`、`-name`、`-isEqual:` 分别调用 `protocol_conformsToProtocol`、`protocol_getName` 与 `protocol_isEqual`。

### `__IncompleteProtocol`

动态创建尚未注册的协议会暂时使用这个类作为 isa。注册后才切换为真正的 `Protocol` 类， 因而 runtime 能用 isa 区分“构造中”和“已注册、不可变”。

## 3. `read_images` 协议读取流程

协议的发现发生在 `_read_images`。它遍历 dyld 传入的镜像信息，从每个 Mach-O header 中取 `protocollist`，逐个交给 `readProtocol`。

```javascript
// runtime/objc-runtime-new.mm，_read_images 中的协议发现逻辑，简化并加注释
for (auto &info : infos) {
    extern objc_class OBJC_CLASS_$_Protocol;
    Class cls = (Class)&OBJC_CLASS_$_Protocol;       // 协议对象注册后的 isa
    NXMapTable *protocol_map = protocols();          // 全局 name => Protocol 映射
    bool isPreoptimized = info.dyldObjCRefsOptimized();

    // 启动阶段可跳过共享缓存的预优化协议：
    // 它们通常已经由 dyld/shared cache 指向 canonical 定义。
    if (launchTime && isPreoptimized) {
        continue;
    }

    bool isBundle = info.hi->isBundle();
    const uint32_t infoIndex = (hCount - 1) - infos.index(&info);

    protocol_t * const *protolist = info.hi->protocollist(&count);
    for (i = 0; i < count; i++) {
        readProtocol(protolist[i], cls, protocol_map,
                     isPreoptimized, isBundle,
                     infoIndex, info.tproEnabled(), makeImageMutable);
    }
}
```

**拿到 `Protocol` 类。** 编译器写出的协议结构在磁盘上还只是数据；读入后 runtime 要把它作为 `Protocol` 对象使用。

**选择全局协议表。** `protocols()` 懒创建 `NXMapTable`，key 是协议名，value 是当前胜出的协议对象。

**处理预优化共享缓存。** 启动时可跳过已预优化镜像；非启动阶段仍要扫描，因为后加载镜像可能影响 canonical 判断。

**逐项调用 `readProtocol`。** 该函数负责去重、isa 初始化、必要时修改共享缓存页，并把协议插入全局表。

### `readProtocol` 的三种结果

```cpp
// readProtocol 的核心分支，伪代码化
oldproto = getProtocol(newproto->mangledName);

if (oldproto) {
    // 已有同名协议，已有定义胜出。
    // 如果当前来自预优化共享缓存且原先以为自己是 canonical，
    // 但实际由非共享缓存定义胜出，就清掉 shared cache canonical 位。
}
else if (headerIsPreoptimized) {
    // 共享缓存已初始化协议对象。
    // runtime 仍把胜出的 cacheproto/newproto 插入协议表，
    // 这样后续非缓存定义可以替换或被 remap 到正确对象。
}
else {
    // 普通镜像的新协议：让镜像可变，初始化 isa 为 Protocol，
    // 必要时急切 fixup，然后插入 name => protocol_t。
    makeImageMutable(objcImageIndex);
    newproto->initIsa(protocol_class);
    insertFn(protocol_map, newproto->mangledName, newproto);
}
```

bundle 镜像使用 `NXMapKeyCopyingInsert`，普通镜像使用 `NXMapInsert`。 源码注释指出这不能完全让可卸载 bundle 的协议安全，但能避免查找无关协议时崩溃。

## 4. remap 与重复协议

ObjC 允许多个镜像出现同名协议。runtime 的策略不是让所有引用都长期保留原始地址，而是用名字找到“活的”协议对象。 `protocol_ref_t` 的注释直接说明它是“`protocol_t *`，但未 remap”。

```cpp
// runtime/objc-runtime-new.mm，保留关键判断并加注释
static ALWAYS_INLINE protocol_t *remapProtocol(protocol_ref_t proto)
{
    // 共享缓存中带 canonical 位的协议已经是应使用的定义。
    if (((protocol_t *)proto)->isCanonical())
        return (protocol_t *)proto;

    // 否则按名字从全局协议表/预优化表重新查找。
    protocol_t *newproto =
        (protocol_t *)getProtocol(((protocol_t *)proto)->mangledName);

    // 找到则返回胜出的 live protocol；找不到才退回原指针。
    return newproto ? newproto : (protocol_t *)proto;
}

static void remapProtocolRef(protocol_t **protoref, ...)
{
    protocol_t *newproto = remapProtocol((protocol_ref_t)*protoref);
    if (*protoref != newproto) {
        makeImageMutable(objcImageIndex);       // 修改镜像中的 @protocol 引用前先让页可写
        withMutableSharedCache(tproEnabled, [&] {
            *protoref = newproto;               // 将引用改到胜出的定义
        });
        UnfixedProtocolReferences++;
    }
}
```

`test/duplicateProtocols.m` 验证了这一点：测试自己定义 `NSCoding` 并让它继承 `NewNSCodingSuperProto`，随后 `dlopen` CoreFoundation。加载后，来自 CoreFoundation 的 `NSSecureCoding` 和 `NSDictionary` 查询 conformance 时，仍应通过 remap 找到测试中的 `NSCoding`，因此 `NSSecureCoding` 和 `NSDictionary` 都能被判断为符合测试定义的上层协议。

因此，不能把 `@protocol(X)` 的原始地址当作跨镜像永久身份。runtime 公开 API 会在关键路径使用 `remapProtocol`，按名字回到当前 canonical 或全局表中的定义。

## 5. 查询与 conforms 判断

### `objc_getProtocol`

`objc_getProtocol` 只是加锁后调用内部 `getProtocol`。内部查找顺序是：全局 map 原名、 dyld/shared cache 预优化表、Swift v1 mangled 等价名的全局 map、Swift v1 mangled 等价名的预优化表。

```javascript
static NEVER_INLINE Protocol *getProtocol(const char *name)
{
    Protocol *result = (Protocol *)NXMapGet(protocols(), name);
    if (result) return result;

    result = getPreoptimizedProtocol(name);
    if (result) return result;

    if (char *swName = copySwiftV1MangledName(name, true)) {
        result = (Protocol *)NXMapGet(protocols(), swName);
        if (!result)
            result = getPreoptimizedProtocol(swName);
        free(swName);
        return result;
    }

    return nullptr;
}
```

`test/protocol.m` 中 `SwiftV1Protocol` 的断言覆盖了这条路径： `objc_getProtocol("Module.SwiftV1Protocol")` 和 mangled 名都能找到同一个协议，而短名 `"SwiftV1Protocol"` 找不到。

### `protocol_conformsToProtocol`

协议符合关系不是比较方法集合，而是比较协议继承图：同名即符合；否则递归查看 `self->protocols`。

```cpp
static bool protocol_conformsToProtocol_nolock(protocol_t *self, protocol_t *other)
{
    if (!self || !other) return NO;

    // 同名协议视为符合，避免重复定义导致指针不同而失败。
    if (strcmp(self->mangledName, other->mangledName) == 0)
        return YES;

    if (self->protocols) {
        for (uintptr_t i = 0; i < self->protocols->count; i++) {
            protocol_t *proto = remapProtocol(self->protocols->list[i]);
            if (other == proto) return YES;
            if (strcmp(other->mangledName, proto->mangledName) == 0) return YES;
            if (protocol_conformsToProtocol_nolock(proto, other)) return YES;
        }
    }

    return NO;
}
```

### `class_conformsToProtocol`

类的符合关系只检查该类自己的协议列表与分类附加的协议；公开的 `class_conformsToProtocol` 不会沿 superclass 链上溯。`test/protocol.m` 里 `SubProp : Super <Proto4>` 不被认为符合 `Proto1`，即使它的父类 `Super` 符合 `Proto1`。

```javascript
static bool _class_conformsToProtocol_unrealized_nolock(Class cls, Protocol *protocol)
{
    protocol_t *target = newprotocol(protocol);
    protocol_array_t protocols;

    // 已实现类从 class_rw_ext / ro 组合后的数据取协议；
    // 未实现类直接从 class_ro_t 的 baseProtocols 取。
    if (cls->isRealized())
        protocols = cls->data()->protocols();
    else
        protocols = protocol_array_t{cls->safe_ro()->baseProtocols};

    for (const auto& protoRef : protocols) {
        protocol_t *p = remapProtocol(protoRef);
        if (p == target || protocol_conformsToProtocol_nolock(p, target))
            return true;
    }

    // 未实现类还会扫描 unattachedCategories，
    // 因为分类可能声明了协议但尚未 attach 到类上。
    return false;
}
```

### 复制列表 API

`class_copyProtocolList` 会 realize 类，然后返回该类直接采用的协议列表，元素经过 `remapProtocol`，数组以 `NULL` 结尾。`objc_copyProtocolList` 除了遍历全局 map，还会扫描 header，把不在 map 中的预优化协议补进结果。 `test/copyProtocolList.m` 验证结果非空、无空洞、包含 libobjc 中的 `NSObject` 协议， 并且动态注册新协议后总数加一。

## 6. 运行时创建与注册协议

动态协议 API 的核心约束是：创建后先处于“构造中”，只能在构造中添加方法、属性和继承协议； 一旦 `objc_registerProtocol` 注册，就切换为 `Protocol` 对象并变为不可变。

```javascript
// 创建：检查重名，分配 protocol_t，isa 设为 __IncompleteProtocol。
Protocol *objc_allocateProtocol(const char *name)
{
    mutex_locker_t lock(runtimeLock);

    if (getProtocol(name))
        return nil;

    protocol_t *result = (protocol_t *)calloc(sizeof(protocol_t), 1);
    result->initProtocolIsa((Class)&OBJC_CLASS_$___IncompleteProtocol);
    result->size = sizeof(protocol_t);
    result->mangledName = strdupIfMutable(name);  // 名字会复制
    return (Protocol *)result;
}

// 注册：只接受 __IncompleteProtocol，切换 isa，插入全局协议表。
void objc_registerProtocol(Protocol *proto_gen)
{
    protocol_t *proto = newprotocol(proto_gen);
    mutex_locker_t lock(runtimeLock);

    if (proto->ISA() == (Class)&OBJC_CLASS_$_Protocol)
        return;                                  // 已注册
    if (proto->ISA() != (Class)&OBJC_CLASS_$___IncompleteProtocol)
        return;                                  // 不是 allocateProtocol 产生的对象

    proto->changeIsa((Class)&OBJC_CLASS_$_Protocol);

    if (getProtocol(proto->mangledName) == nil)
        NXMapKeyCopyingInsert(protocols(), proto->mangledName, proto);
}
```

### 添加成员

```cpp
// 添加继承协议：被修改者必须仍在构造中，addition 必须已注册。
protocol_addProtocol(proto, @protocol(SuperProto));

// 添加方法：按 required/optional 与 instance/class 分流到四个 method_list_t。
protocol_addMethodDescription(proto, @selector(ReqInst0), "@:", YES, YES);
protocol_addMethodDescription(proto, @selector(OptClas0), "@:", NO, NO);

// 添加属性：当前实现支持 required instance/class properties；
// optional property 分支在源码中仍是注释掉的。
objc_property_attribute_t attrs[] = {{"T", "i"}};
protocol_addProperty(proto, "value", attrs, 1, YES, YES);
```

`test/addProtocol.m` 覆盖了动态协议的主要行为：未注册时 `objc_getProtocol` 找不到； 注册后能按名查到；名字、类型编码、属性描述都会复制；添加未注册的协议会失败； 已注册协议再添加协议或方法会被拒绝；同名协议不能再次 allocate。

`class_addProtocol` 是另一条动态路径。它先用 `class_conformsToProtocol` 防重复， 再 realize 类、分配一个只有一个元素的 `protocol_list_t`，attach 到类的 `rwe->protocols`。源码里仍有 `fixme metaclass?` 注释，说明这里只处理类对象的协议列表。

## 7. 测试体现的行为

- `test/protocol.m`：验证协议名、协议继承、类直接符合关系、方法描述递归查找、类协议列表、Swift v1 名称查找。
- `test/duplicateProtocols.m`：验证同名协议在后加载镜像和共享缓存之间通过 remap 指向胜出定义。
- `test/addProtocol.m`：验证动态创建、添加继承协议/方法/属性、注册后的不可变性、重名拒绝和字符串复制。
- `test/copyProtocolList.m`：验证全局协议列表包含预优化协议和动态新增协议，且数组以 `nil` 结尾。
- `test/protocol_copyMethodList.m`：验证复制方法列表只返回当前协议直接声明的方法，不包含父协议声明。
- `test/protocol_copyPropertyList.m`：验证属性列表只返回当前协议直接声明的 required 属性，optional 属性不支持。
- `test/protocolSmall.m`：验证 `size` 字段兼容较小的磁盘协议结构，访问尾部字段必须防御。

## 8. 总结

objc4 的 Protocol runtime 可以概括为四个层次：磁盘上的 `protocol_t` 数据结构、 `_read_images` 阶段的注册和唯一化、查询时的 remap 与递归关系判断、以及 `objc_allocateProtocol`/`objc_registerProtocol` 提供的动态构造入口。

最容易踩错的点有三个：协议身份不应只看原始指针，重复协议需要按名字 remap；`class_conformsToProtocol` 检查的是当前类直接采用的协议而不是父类链；复制方法/属性/协议列表通常只返回直接声明内容，递归行为只出现在 `protocol_getMethodDescription`、`protocol_getProperty` 和 conforms 这类查询路径中。

### 本文主要源码依据

- `runtime/Protocol.mm`
- `runtime/Protocol.h`
- `runtime/objc-runtime-new.mm`
- `runtime/objc-runtime-new.h`
- `runtime/runtime.h`
- `test/protocol.m`
- `test/protocolSmall.m`
- `test/duplicateProtocols.m`
- `test/addProtocol.m`
- `test/copyProtocolList.m`
- `test/protocol_copyMethodList.m`
- `test/protocol_copyPropertyList.m`
