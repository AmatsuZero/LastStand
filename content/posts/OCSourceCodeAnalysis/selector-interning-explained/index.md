+++
title = "objc4 Selector / SEL 注册、唯一化与方法名查找"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 7
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

# Selector / SEL 注册、唯一化与方法名查找

在 objc4 中，`SEL` 的关键价值不是承载一段复杂对象，而是把方法名字符串 “驻留”为全进程唯一的指针。注册、镜像加载 fixup、方法列表排序、方法查找和消息缓存都建立在这个事实上： 同名 selector 最终拥有同一个地址，因此比较 selector 可以退化为一次指针比较。

## 作用

**统一方法名身份** 编译器、Mach-O 镜像、动态注册 API 和运行时内部方法列表都可能产生方法名。selector 唯一化后，同一个方法名只对应一个 `SEL`。

**让查找足够便宜** 方法列表和缓存查找不需要反复比较字符串。命中条件基本都是 `method.name == sel` 或 `bucket.sel == _cmd`。

**支撑 dyld 预优化** 共享缓存中的 selector 可以由 dyld 提供内建唯一值；未优化镜像在 `_read_images` 中被 runtime 修正到唯一值。

对外头文件把 `SEL` 声明为不透明类型：`typedef struct objc_selector *SEL;`。 但在当前实现中，runtime 会把 selector 当成方法名 C 字符串指针使用，`sel_getName()` 直接把 `SEL` 转回 `const char *`。

## 核心结构、函数与字段

|  |  |
|----|----|
| `SEL` | 公开为不透明 selector 指针，实际唯一值是某个方法名字符串的地址。来源：`runtime/objc.h`。 |
| `namedSelectors` | `ExplicitInitDenseSet<const char *>`，保存非 dyld 内建 selector 的唯一字符串指针。来源：`runtime/objc-sel.mm`。 |
| `selLock` | 保护 selector 表。`sel_registerName()` 自行加锁；镜像加载和方法列表 fixup 常在外层持锁后调用 `sel_registerNameNoLock()`。 |
| `_sel_searchBuiltins()` | 在支持预优化时向 dyld 查询共享缓存内建 selector，优先返回 dyld 已唯一化的值。 |
| `sel_registerName()` | 注册并返回 selector；若已存在则返回既有唯一值；会复制传入字符串。 |
| `sel_lookUpByName()` | 只查找，不创建。未注册返回 `NULL`，测试 `test/sel.m` 明确覆盖该行为。 |
| `method_t::name` | 方法条目的 selector 字段。方法列表 fixup 后，这个字段应是唯一化的 `SEL`。 |
| `cache_t` / `bucket_t` | 消息缓存以 `SEL` 为 key，桶保存 `SEL + IMP`，hash 直接来自 selector 地址。 |

## 实现原理

selector interning 的核心是“先按名字查找唯一槽，再把槽里的字符串地址作为 `SEL` 返回”。 对 dyld 共享缓存内建 selector，runtime 先问 dyld；对普通 selector，runtime 使用 `namedSelectors` 保存唯一字符串。

```javascript
// runtime/objc-sel.mm，节选并加注释
static objc::ExplicitInitDenseSet<const char *> namedSelectors;

static SEL __sel_registerName(const char *name, bool shouldLock, bool copy)
{
    // 1. nil 名字没有 selector。
    if (!name) return (SEL)0;

    // 2. 优先查 dyld 共享缓存内建 selector。
    //    这一步让系统库里预优化过的方法名直接复用共享缓存的唯一地址。
    SEL result = _sel_searchBuiltins(name);
    if (result) return result;

    // 3. 进入进程本地 selector 表。DenseSet 用 C 字符串内容判断是否已有同名项。
    conditional_mutex_locker_t lock(selLock, shouldLock);
    auto it = namedSelectors.get().insert(name);

    if (it.second) {
        // 4. 首次出现：根据调用场景决定是否复制 name。
        //    sel_registerName() 传 copy=true，确保临时字符串不会悬空。
        //    某些镜像内字符串可由镜像生命周期保证，可不复制。
        *it.first = (const char *)sel_alloc(name, copy);
    }

    // 5. 返回 set 中保存的唯一字符串地址；这个地址就是 SEL。
    return (SEL)*it.first;
}
```

**关键结论：** `sel_isEqual(lhs, rhs)` 等价于 `lhs == rhs`，不是因为 API 偷懒，而是因为注册和 fixup 已经把同名 selector 规约到了同一个指针。

## 关键流程一：sel_registerName

**1. 输入名字**调用者传入 C 字符串，例如 `"foo:"`。

**2. 查 builtins**`_dyld_get_objc_selector()` 可能直接返回共享缓存 selector。

**3. 查本地表**持有 `selLock` 后插入 `namedSelectors`。

**4. 首次分配**新名字通过 `sel_alloc()` 保存稳定字符串。

**5. 返回 SEL**返回唯一字符串地址，后续同名注册拿到同一地址。

```javascript
// runtime/objc-sel.mm，公共 API 包装
SEL sel_registerName(const char *name) {
    return __sel_registerName(name, 1, 1);     // 加锁，并复制字符串
}

SEL sel_registerNameNoLock(const char *name, bool copy) {
    return __sel_registerName(name, 0, copy);  // 调用者已持有 selLock
}

SEL sel_getUid(const char *name) {
    return __sel_registerName(name, 2, 1);     // 现在行为等同于注册
}

SEL sel_lookUpByName(const char *name) {
    if (!name) return (SEL)0;

    SEL result = _sel_searchBuiltins(name);
    if (result) return result;

    mutex_locker_t lock(selLock);
    auto it = namedSelectors.get().find(name);
    return it == namedSelectors.get().end() ? (SEL)0 : (SEL)*it;
}
```

`test/sel.m` 验证了这些边界：`@selector(foo)` 会等于 `sel_registerName("foo")`；`sel_getName(0)` 返回 `"<null selector>"`；`sel_lookUpByName()` 对未注册名字返回 `NULL`，注册后再查返回同一个 `SEL`。

## 关键流程二：read_images 中 selector fixup

编译器会在镜像里留下 `@selector` 引用，也就是 Mach-O 的 selector reference 区域。 runtime 在 `_read_images` 早期统一修正这些引用。源码注释强调这一步必须发生在任何方法列表使用之前， 因为相对方法列表会指向 selRefs，并假定它们已经唯一化。

```javascript
// runtime/objc-runtime-new.mm，_read_images() 中的 @selector fixup
{
    mutex_locker_t lock(selLock);
    for (auto& info : infos) {
        // dyld 已经优化过的镜像可以跳过。
        if (info.dyldObjCRefsOptimized()) continue;

        bool isBundle = info.hi->isBundle();
        SEL *sels = info.hi->selrefs(&count);

        for (i = 0; i < count; i++) {
            // selrefs[i] 可能还只是指向方法名字符串。
            const char *name = sel_cname(sels[i]);

            // 注册并获得全进程唯一 SEL。bundle 场景会复制字符串，避免卸载后悬空。
            SEL sel = sel_registerNameNoLock(name, isBundle);

            if (sels[i] != sel) {
                // 如果镜像中的引用不是唯一值，就把镜像页改为可写并回填唯一 SEL。
                makeImageMutable(infoIndex);
                withMutableSharedCache(info.tproEnabled(), [&] {
                    sels[i] = sel;
                });
            }
        }
    }
}
```

这解释了为什么源码测试可以断言 `@selector(foo) == sel_registerName("foo")`： `@selector(foo)` 在镜像加载时已经被修正成 selector 表中的唯一指针。

## 关键流程三：方法列表唯一化与排序

方法列表中的 `method_t::name` 也需要变成唯一 selector。`fixupMethodList()` 会遍历方法，把原始名字转成唯一 `SEL`，必要时再按 selector 地址排序。排序后，后续方法查找可以用二分查找。

```javascript
// runtime/objc-runtime-new.mm，fixupMethodList() 核心逻辑
if (!mlist->isUniqued()) {
    mutex_locker_t lock(selLock);

    if (uniquedSelectors != nullptr) {
        // 两阶段路径：第一阶段先收集唯一 SEL，第二阶段只回填 method_t::name。
        for (auto& meth : *mlist) {
            uint32_t index = mlist->indexOfMethod(&meth);
            meth.setName((*uniquedSelectors)[index]);
        }
    } else {
        // 常规路径：直接从方法名注册 selector，并写回方法条目。
        for (auto& meth : *mlist) {
            const char *name = sel_cname(meth.name());
            meth.setName(sel_registerNameNoLock(name, bundleCopy));
        }
    }
}

// 方法列表固定后，按 selector 地址排序，供查找使用。
if (sort && mlist->listKind() != method_t::Kind::small
    && mlist->entsize() == method_t::bigSize) {
    mlist->sortBySELAddress();
}

// 标记已经唯一化和排序。
if (mlist->listKind() != method_t::Kind::small) {
    mlist->setFixedUp();
}
```

`method_getName()` 也体现了这个约束：它断言 `m->name() == sel_registerName(sel_getName(m->name()))`。 换言之，公开返回的 method selector 必须已经是“按名字重新注册也得到同一值”的唯一 selector。

## 关键流程四：查找与比较

selector 唯一化后，查找方法不需要字符串比较。已 fixup 且尺寸符合预期的方法列表走排序路径； 其他列表走线性扫描。两条路径的比较目标都是 selector 地址。

```javascript
// runtime/objc-runtime-new.mm，方法列表查找的比较方式
template<typename T>
ALWAYS_INLINE static int compare(T lhs, T rhs) {
    if ((uintptr_t)lhs > (uintptr_t)rhs) return 1;
    if ((uintptr_t)lhs < (uintptr_t)rhs) return -1;
    return 0;
}

ALWAYS_INLINE static method_t *
findMethodInUnsortedMethodList(SEL sel, const method_list_t *list, const getNameFunc &getName)
{
    for (auto& meth : *list) {
        // selector 已唯一化，所以命中就是一次指针相等。
        if (getName(meth) == sel) return &meth;
    }
    return nil;
}

ALWAYS_INLINE static method_t *
search_method_list_inline(const method_list_t *mlist, SEL sel)
{
    if (mlist->isFixedUp() && mlist->isExpectedSize()) {
        // 已排序列表：按 selector 地址二分查找。
        return findMethodInSortedMethodList(sel, mlist);
    } else {
        // 未排序或特殊列表：线性扫描，仍然比较 SEL 指针。
        return findMethodInUnsortedMethodList(sel, mlist);
    }
}
```

常规消息发送路径先查 cache，miss 后进入 `lookUpImpOrForward()`，在类和父类链上调用 `getMethodNoSuper_nolock(curClass, sel)`。找到 `method_t` 后取出 `IMP`， 再用 `log_and_fill_cache(cls, imp, sel, inst, curClass)` 写入方法缓存。

## 关键流程五：缓存 hash 关系

方法缓存的 key 也是 selector。`objc-cache.mm` 明确说明： “Class points to cache. SEL is key. Cache buckets store SEL+IMP.” hash 函数直接使用 `SEL` 地址。

```objectivec
// runtime/objc-cache.mm，selector 地址就是缓存 hash 输入
static inline mask_t cache_hash(SEL sel, mask_t mask)
{
    uintptr_t value = (uintptr_t)sel;
#if SEL_HASH_SHIFT_XOR
    value ^= value >> 7;      // 某些配置下混合高位，降低地址分布问题。
#endif
    return (mask_t)(value & mask);
}

void cache_t::insert(SEL sel, IMP imp, id receiver)
{
    ASSERT(sel != 0 && cls()->isInitialized());

    bucket_t *b = buckets();
    mask_t m = capacity - 1;
    mask_t begin = cache_hash(sel, m);

    for (mask_t i = begin; ; i = cache_next(i, m)) {
        if (b[i].sel() == 0) {
            // 空桶：写入 SEL + IMP。
            b[i].set<Atomic, Encoded>(b, sel, imp, cls());
            return;
        }
        if (b[i].sel() == sel) {
            // 并发场景下可能已有同 selector 条目，直接结束。
            return;
        }
    }
}
```

arm64 消息发送汇编也沿用同一模型：初始桶位置来自 `_cmd & mask`， 桶内命中条件是 `cached_sel == _cmd`，命中后直接调用或返回缓存的 `IMP`。

```asm
// runtime/Messengers.subproj/objc-msg-arm64.s，简化注释
and p12, p1, p11
// p1 是 _cmd，p11 是 cache mask，因此 p12 = _cmd & mask。

add p13, p10, p12, LSL #(1+PTRSHIFT)
// p13 指向初始 bucket。

ldp p17, p9, [x13], #-BUCKET_SIZE
cmp p9, p1
// p9 是 bucket 中的 cached SEL；等于 _cmd 即缓存命中。
```

`test/cache-sel-hash.m` 通过 9 个方法挤过初始 8 桶容量，让缓存扩容并形成较稀疏的分布。 随后它用 `_method_setImplementationRawUnsafe` 把方法列表里的 IMP 换成 trap，但不清缓存； 再次发送消息应命中旧缓存。如果 hash、探测或 selector key 关系错误，就会 miss 到方法列表并调用 trap。

## 指针认证与 signed selector 测试

`test/signedMethodSelectors.m` 不是 selector 注册表测试，而是验证方法列表中的 selector 字段在 arm64e 等 ptrauth 平台上受到签名保护。测试手动把新加方法的 selector 从 `origSel` 改成 `replacementSel`， 然后发送 `replacementSel`，预期在支持 ptrauth calls 的平台崩溃。

```objectivec
// test/signedMethodSelectors.m，意图简化
class_addMethod([TargetClass class], origSel, (IMP)testIMP, "");
Method method = class_getInstanceMethod([TargetClass class], origSel);

// 直接篡改 method_t 的第一个字段 SEL name。
SEL *namePtr = (SEL *)((uintptr_t)method & ~0x3);
namePtr = ptrauth_strip(namePtr, ptrauth_key_process_dependent_data);
*namePtr = replacementSel;

// 如果平台对方法 selector 做了签名校验，这里应该因伪造 selector 失败。
((void (*)(id, SEL))objc_msgSend)(obj, replacementSel);
```

这个测试强调：selector 唯一化解决“名字身份一致性”，而方法列表里的 selector 存储还可能叠加平台级完整性保护。 两者目标不同，但都服务于“用 selector 指针作为可信查找 key”。

## 端到端总结

1.  编译期和镜像中可能存在多个同名方法名字符串或 selector reference。
2.  `sel_registerName()` 和 `_read_images` 把这些名字规约到 dyld 内建 selector 或 `namedSelectors` 中的唯一字符串地址。
3.  方法列表 fixup 把 `method_t::name` 写成唯一 `SEL`，并可按 selector 地址排序。
4.  方法查找用指针相等和地址排序，不做字符串比较。
5.  消息缓存以 `SEL` 地址 hash，桶内也保存 `SEL`，所以 selector 唯一化直接决定 cache key 的正确性。

主要源码依据：`runtime/objc-sel.mm`、`runtime/objc-runtime-new.mm`、 `runtime/objc-runtime.h`、`runtime/runtime.h`、`runtime/objc.h`、 `runtime/objc-cache.mm`、`runtime/Messengers.subproj/objc-msg-arm64.s`、 `test/sel.m`、`test/signedMethodSelectors.m`、`test/cache-sel-hash.m`。
