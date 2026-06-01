+++
title = "Objective-C 关联对象 Associated Objects 作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 13
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime Associated Objects objc-references.mm

# 关联对象 Associated Objects 作用与实现原理

关联对象让调用方在不改类布局、不新增 ivar 的情况下，把一组 `key - value` 挂到任意 Objective-C 对象上。 objc4 的实现不是把字段塞进对象内存，而是用一张运行时全局表保存“对象地址、key、关联值和内存管理策略”的映射。

**入口 API**`objc_setAssociatedObject`\
`objc_getAssociatedObject`

**核心存储**`AssociationsHashMap`\
`ObjectAssociationMap`

**值封装**`ObjcAssociation`\
`policy + value`

**清理时机**`objc_destructInstance`\
`objc_disposeClassPair`

## 目录

1.  [作用与使用边界](#purpose)
2.  [公开 API 与 policy](#api)
3.  [核心结构与字段](#storage)
4.  [set / get / remove 流程](#set-get-remove)
5.  [对象销毁与特殊关联](#lifetime)
6.  [禁止关联对象的场景](#forbidden)
7.  [测试覆盖点](#tests)

<a id="purpose"></a>
## 作用与使用边界

关联对象主要服务于分类、框架扩展、运行时补充状态等场景：调用方只有对象指针和一个稳定 key，就能为对象保存额外值。 这避免了修改类的 ivar 布局，也让分类可以模拟“存储属性”。

### 适合做什么

- 给现有类或分类补充少量状态。
- 把辅助对象、回调 block、缓存值挂到宿主对象。
- 用唯一地址作为 key，避免和其他调用方冲突。

### 不适合做什么

- 高频读写的核心数据结构。
- 需要类型系统和对象布局明确表达的状态。
- 清空他人关联值，尤其是随意调用 `objc_removeAssociatedObjects`。

### 运行时代价

- 每次访问都需要全局关联表查询。
- set / get / remove 通过 `AssociationsManagerLock` 串行保护表。
- 对象析构时可能需要额外释放所有关联值。

**关键结论：**关联对象是“外置 side table”，不是对象内的 ivar。对象只保存一个“可能有 associated objects”的快速标记，真正的 key/value 在全局表里。

<a id="api"></a>
## 公开 API 与 policy

`runtime/runtime.h` 暴露三组 API。set 时传入 `nil` value 表示删除该 key；remove 会移除该对象上几乎所有关联，不建议作为普通删除手段。

```javascript
// runtime/runtime.h：公开的关联对象 API
objc_setAssociatedObject(id object, const void *key, id value,
                         objc_AssociationPolicy policy);

objc_getAssociatedObject(id object, const void *key);

objc_removeAssociatedObjects(id object);
```

| 公开 policy | 数值 | setter 行为 | getter 行为 |
|----|----|----|----|
| `OBJC_ASSOCIATION_ASSIGN` | `0` | unsafe unretained，只保存指针，不 retain/copy。 | 直接返回，不 retain/autorelease。 |
| `OBJC_ASSOCIATION_RETAIN_NONATOMIC` | `1` | 保存前 `objc_retain` 新值。 | 直接返回。 |
| `OBJC_ASSOCIATION_COPY_NONATOMIC` | `3` | 保存前向新值发送 `copy`。 | 直接返回。 |
| `OBJC_ASSOCIATION_RETAIN` | `01401` | 保存前 `objc_retain` 新值。 | 在锁内 retain，出锁后 autorelease，模拟原子 getter 的返回安全性。 |
| `OBJC_ASSOCIATION_COPY` | `01403` | 保存前 `copy` 新值。 | 在锁内 retain，出锁后 autorelease。 |

`objc-references.mm` 会把 policy 拆成低 8 位 setter 行为和高位 getter 行为： `01400` 正好包含 getter retain 和 autorelease 标志。

```text
// runtime/objc-references.mm：扩展后的 policy 位
OBJC_ASSOCIATION_SETTER_ASSIGN      = 0,
OBJC_ASSOCIATION_SETTER_RETAIN      = 1,
OBJC_ASSOCIATION_SETTER_COPY        = 3,
OBJC_ASSOCIATION_GETTER_RETAIN      = (1 << 8),
OBJC_ASSOCIATION_GETTER_AUTORELEASE = (2 << 8),
OBJC_ASSOCIATION_SYSTEM_OBJECT      = _OBJC_ASSOCIATION_SYSTEM_OBJECT;
```

<a id="storage"></a>
## 核心结构与字段

objc4 用两层 `DenseMap` 表示关联关系：第一层按对象指针找对象自己的关联表，第二层按 key 找单个关联值。 对象指针用 `DisguisedPtr<objc_object>` 包装，避免普通内存扫描把这张表误认为强引用来源。

### 宿主对象

`id object`

对象本身不扩容，只在 isa 或类标志中记录“可能有关联对象”。

映射到

### 全局关联表

`AssociationsHashMap`：object → `ObjectAssociationMap`

`ObjectAssociationMap`：key → `ObjcAssociation`

```javascript
// runtime/objc-references.mm：单个关联值的封装
class ObjcAssociation {
    uintptr_t _policy;  // 保存 retain/copy/assign、getter retain/autorelease、system object 等位
    id _value;          // 实际关联值

public:
    void acquireValue();           // set 前按 policy retain 或 copy 新值
    void releaseHeldValue();       // 替换、删除、销毁时释放旧值
    void retainReturnedValue();    // atomic getter 在锁内 retain
    id autoreleaseReturnedValue(); // atomic getter 出锁后 autorelease
};

// runtime/objc-references.mm：两层哈希表
typedef DenseMap<const void *, ObjcAssociation> ObjectAssociationMap;
typedef DenseMap<DisguisedPtr<objc_object>, ObjectAssociationMap> AssociationsHashMap;

class AssociationsManager {
    static ExplicitInitDenseMap<DisguisedPtr<objc_object>, ObjectAssociationMap> _mapStorage;

public:
    AssociationsManager()  { AssociationsManagerLock.lock(); }   // RAII 加锁
    ~AssociationsManager() { AssociationsManagerLock.unlock(); } // 离开作用域解锁
    AssociationsHashMap &get() { return _mapStorage.get(); }
};
```

### `ObjcAssociation`

把值和 policy 放在一起。移动或替换时通过 `swap` 把“旧关联”带出锁外释放。

### `AssociationsManager`

构造时加锁，析构时解锁。所有对全局表的结构性读写都在该锁保护下完成。

### `hasAssociatedObjects`

用于析构和 remove 的快速判断。non-pointer isa 平台记录在 `isa.has_assoc`；否则记录在类的 `RW_INSTANCES_HAVE_ASSOCIATED_OBJECTS`。

<a id="set-get-remove"></a>
## 关键流程：set / get / remove

### set：新增、替换、删除单个 key

**1兼容空输入**`object == nil` 且 `value == nil` 时直接返回。

**2实现类检查**取 `object->getIsa()`，必要时 realize，并检查是否禁止关联对象。

**3锁外持有新值**按 retain/copy policy 先处理新 value，避免在全局锁内执行任意 Objective-C 代码。

**4锁内更新表**value 非空则插入或替换；value 为空则删除该 key，空对象表也一并删除。

**5锁外收尾**首次关联时设置对象标记；替换出来的旧值在锁外 release。

```javascript
// 带注释的精简版 _object_set_associative_reference
void set_association(id object, const void *key, id value, uintptr_t policy) {
    if (!object && !value) return;       // 兼容旧行为：nil + nil 不崩溃

    Class cls = object->getIsa();
    cls->realizeIfNeeded();
    if (cls->forbidsAssociatedObjects()) {
        fatal("class does not allow associated objects");
    }

    ObjcAssociation association{policy, value};
    association.acquireValue();          // retain/copy 新值；不在锁内执行

    bool isFirstAssociation = false;
    {
        AssociationsManager manager;     // 加全局关联表锁
        if (value) {
            // 第一层：按 object 找到或创建 ObjectAssociationMap
            auto refs = associations.try_emplace(object, ObjectAssociationMap{});
            isFirstAssociation = refs.second;

            // 第二层：按 key 插入；若已存在，swap 出旧 association
            auto result = refs.first->second.try_emplace(key, std::move(association));
            if (!result.second) association.swap(result.first->second);
        } else {
            // value == nil 表示清掉这个 key
            auto old = refs.find(key);
            if (old != refs.end()) {
                association.swap(old->second); // 旧值带出锁外释放
                refs.erase(old);
            }
        }
    }

    if (isFirstAssociation) object->setHasAssociatedObjects();
    association.releaseHeldValue();      // 释放被替换或删除的旧值
}
```

### get：查表、按 atomic policy 保护返回值

get 会在锁内复制出 `ObjcAssociation`，如果 policy 要求 getter retain，就在锁内 retain 关联值； 离开锁后再 autorelease 返回。这样可以降低“刚查到值就被另一线程替换释放”的窗口。

```javascript
// 带注释的精简版 _object_get_associative_reference
id get_association(id object, const void *key) {
    ObjcAssociation association{};
    {
        AssociationsManager manager;      // 查表期间持锁
        auto i = associations.find(object);
        if (i != associations.end()) {
            auto j = i->second.find(key);
            if (j != i->second.end()) {
                association = j->second; // 复制 policy/value
                association.retainReturnedValue();
            }
        }
    }
    return association.autoreleaseReturnedValue();
}
```

### remove：删除一个对象上的关联

`objc_removeAssociatedObjects` 不是“删除我的 key”，而是删除该对象上所有普通关联。 runtime.h 明确提醒它主要用于把对象恢复到 pristine state；普通调用方应使用 `objc_setAssociatedObject(object, key, nil, policy)` 清理自己的 key。

**1快速判断**公开 API 先检查 `object` 和 `object->hasAssociatedObjects()`。

**2整表 swap**内部 remove 将该对象的 `ObjectAssociationMap` swap 到局部变量。

**3锁外 release**离开全局锁后遍历释放普通关联值，避免析构副作用重入锁。

<a id="lifetime"></a>
## 对象销毁时清理

实例销毁走 `objc_destructInstance`。在真正释放内存前，runtime 会先做 C++ 析构，再移除关联对象，最后清理 deallocating 状态。 顺序在 `runtime/objc-runtime-new.mm` 中被标注为重要。

```cpp
// runtime/objc-runtime-new.mm：实例销毁的关键顺序
bool cxx = obj->hasCxxDtor();
bool assoc = obj->hasAssociatedObjects();

if (cxx) object_cxxDestruct(obj);
if (assoc) _object_remove_associations(obj, true);
obj->clearDeallocating();
```

动态分配的类也可能被挂关联对象。`objc_disposeClassPair` 在销毁类结构前，会分别清掉类对象和元类对象上的关联： `_object_remove_associations(cls, true)` 与 `_object_remove_associations(cls->ISA(), true)`。

### 系统关联对象：延后释放且普通 remove 保留

`runtime/objc-internal.h` 定义私有标志 `_OBJC_ASSOCIATION_SYSTEM_OBJECT`。 带这个标志的关联在对象 dealloc 时会晚于普通关联释放；如果是显式 `objc_removeAssociatedObjects`，它会被重新插回表中，不被普通 remove 删除。

```objectivec
// 带注释的精简版 _object_remove_associations
void remove_associations(id object, bool deallocating) {
    ObjectAssociationMap refs{};
    {
        AssociationsManager manager;
        auto i = associations.find(object);
        if (i != associations.end()) {
            refs.swap(i->second);          // 把所有关联转移到局部变量

            if (!deallocating) {
                // 普通 objc_removeAssociatedObjects 保留 system object
                for (auto &ref : refs) {
                    if (ref.second.policy() & OBJC_ASSOCIATION_SYSTEM_OBJECT)
                        i->second.insert(ref);
                }
            }
        }
    }

    // 普通关联先释放；system object 在 deallocating 时延后释放
    for (auto &ref : refs) {
        if (ref.second.policy() & OBJC_ASSOCIATION_SYSTEM_OBJECT) later.push_back(&ref.second);
        else ref.second.releaseHeldValue();
    }
    for (auto *ref : later) ref->releaseHeldValue();
}
```

**为什么释放在锁外？**关联值的 `release` / `dealloc` 可能执行任意代码，包括再次设置关联对象。objc4 先把表结构改完，再在锁外释放旧值，减少锁重入和长时间持锁风险。

<a id="forbidden"></a>
## 禁止关联对象的场景

某些类可以通过 class ro 标志 `RO_FORBIDS_ASSOCIATED_OBJECTS` 禁止实例设置关联对象。 类 realize 时，runtime 会把 ro 标志或父类的禁止标志传播到 `RW_FORBIDS_ASSOCIATED_OBJECTS`。 set 时若发现 `objectClass->forbidsAssociatedObjects()` 为真，会直接 `_objc_fatal`。

```cpp
// runtime/objc-runtime-new.mm：realize 时继承/传播禁止标志
if ((ro->flags & RO_FORBIDS_ASSOCIATED_OBJECTS) ||
    (supercls && supercls->forbidsAssociatedObjects())) {
    rw->flags |= RW_FORBIDS_ASSOCIATED_OBJECTS;
}

// runtime/objc-references.mm：set 时检查
if (objectClass->forbidsAssociatedObjects()) {
    _objc_fatal("objc_setAssociatedObject called on instance ...");
}
```

### 普通禁止

`associationForbidden.m` 直接给 `Forbidden` 的 ro flags 加 `RO_FORBIDS_ASSOCIATED_OBJECTS`，设置关联对象应崩溃。

### 动态子类

`associationForbidden2.m` 用 `objc_allocateClassPair` 创建子类，验证父类禁止标志会复制到动态子类。

### 重复类

`associationForbidden4.m` 用 `objc_duplicateClass` 复制禁止类，也应保留禁止关联对象的语义。

**注意：**测试 `associationForbidden3.m` 中源码声明的子类在测试预期里会触发 fatal。文中结论以当前 objc4 源码和这些测试的期望输出为准。

<a id="tests"></a>
## policy retain / copy / assign 的实现细节

setter 行为只看 policy 低 8 位。`OBJC_ASSOCIATION_COPY` 和 `COPY_NONATOMIC` 的低位都是 `3`， 因此 copy 值在释放时也满足 retain 位检查：只要 `_policy & OBJC_ASSOCIATION_SETTER_RETAIN` 非零，就需要 release。

assign 不持有值，删除或销毁关联时也不会 release。它是 unsafe unretained，宿主对象并不会帮你处理悬垂指针。

```objectivec
// runtime/objc-references.mm：值获取和释放策略
void acquireValue() {
    if (!_value) return;
    switch (_policy & 0xFF) {
    case OBJC_ASSOCIATION_SETTER_RETAIN:
        _value = objc_retain(_value);         // retain policy
        break;
    case OBJC_ASSOCIATION_SETTER_COPY:
        _value = objc_msgSend(_value, @selector(copy)); // copy policy
        break;
    }
}

void releaseHeldValue() {
    if (_value && (_policy & OBJC_ASSOCIATION_SETTER_RETAIN))
        objc_release(_value);                 // retain 和 copy 都会释放
}
```

## 对象标记与 isa swizzling

为了让析构路径快速判断“这个对象是否可能有关联对象”，objc4 在首次建立关联后调用 `object->setHasAssociatedObjects()`。 在支持 non-pointer isa 的平台，标志位在 `isa.has_assoc`；否则记录在类的 `RW_INSTANCES_HAVE_ASSOCIATED_OBJECTS`。

```javascript
// runtime/objc-object.h：non-pointer isa 情况
bool hasAssociatedObjects() const {
    if (isTaggedPointer()) return true;
    if (isa().nonpointer) return isa().has_assoc;
    return true;                  // raw isa 对象无法精确跟踪，保守返回 true
}

void setHasAssociatedObjects() {
    if (isTaggedPointer()) return;
    ...
    newisa.has_assoc = true;       // 首次关联后设置 isa 标志
}
```

`test/association.m` 还覆盖了 `object_setClass` 后不丢关联的情况。 在非 non-pointer isa 路径，`objc_object::changeIsa` 会把旧类的 `instancesHaveAssociatedObjects` 标志转录到新类； 对 non-pointer isa，`has_assoc` 随对象 isa 位一起保存。

另外，raw isa 且自定义 retain/release 的对象如果实现 `-_noteAssociatedObjects`，首次建立关联时会收到一次通知。 `test/setAssociatedObjectHook.m` 验证了这个 hook 只在第一次关联时触发，后续新增 key 不重复触发。

## 测试覆盖点

| 测试文件 | 验证点 |
|----|----|
| `test/association.m` | 关联值随对象释放；`object_setClass` 前后不丢关联；`nil object + nil value` 兼容；未初始化类上 set 不重入关联锁；system object 延后释放；动态类和元类销毁时清理关联。 |
| `test/associationForbidden*.m` | 被 `RO_FORBIDS_ASSOCIATED_OBJECTS` 标记的类、其动态子类、源码子类和 duplicate class 设置关联对象时触发 fatal。 |
| `test/setAssociatedObjectHook.m` | raw isa custom retain/release 对象首次关联时调用 `-_noteAssociatedObjects`，第二次关联不重复调用。 |

**阅读源码的主线：**`runtime/runtime.h` 看公开契约，`runtime/objc-runtime.mm` 看 API 到内部函数的转发， `runtime/objc-references.mm` 看表结构和 set/get/remove 实现，`runtime/objc-object.h` 与 `runtime/objc-runtime-new.mm` 看对象标记、析构清理和禁止标志传播。
