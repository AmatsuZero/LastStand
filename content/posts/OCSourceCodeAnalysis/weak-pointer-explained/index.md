+++
title = "Objective-C weak 指针作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 11
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime zeroing weak SideTable weak_table_t

# Objective-C weak 指针：作用与实现原理

`__weak` 的核心价值是“引用对象但不拥有对象”：它不会增加引用计数；当对象开始销毁时，runtime 会把所有指向它的 weak 槽位自动写成 `nil`，避免野指针。这一页按 objc4 源码中的真实路径解释它如何登记、读取、搬迁和清零。

<a id="role"></a>
## 阅读顺序

1.  [weak 解决什么问题](#role)
2.  [运行时数据模型](#model)
3.  [核心类型、字段、方法](#api)
4.  [关键操作流程](#flows)
5.  [带注释源码片段](#snippets)
6.  [一遍记住](#summary)

<a id="model"></a>
## 1. weak 的作用

**不拥有对象**`__weak id x = obj;` 不会 retain `obj`，所以不会延长对象生命周期。

**自动归零**对象销毁时，所有保存该对象地址的 weak 变量会被 runtime 写成 `nil`。

**读时短暂保活**读取 weak 时，runtime 会先尝试 retain，再 autorelease，保证表达式使用期间对象不被并发释放。

**拒绝无效目标**目标正在 dealloc 或类不支持 weak 时，形成 weak 引用会失败或崩溃，取决于入口函数。

**一句话模型：**strong 指针管“拥有关系”，weak 指针管“可观察关系”。delegate、反向引用、缓存回调对象通常适合 weak，因为它们不应该阻止真实所有者释放对象。

<a id="api"></a>
## 2. 运行时数据模型

weak 表不是全局一把大表直接裸用，而是挂在分片的 `SideTable` 上。runtime 用对象地址选择某个 `SideTable`，在该表内维护引用计数辅助信息和 weak 表，并用同一把锁保护它们。

### weak 变量槽位

`__weak id slot` 本质是一个内存地址，例如 `&slot`。weak 表记录的是“哪个槽位正在指向哪个对象”。

→

### SideTables()\[obj\]

按对象地址定位分片。每片有 `slock`、`refcnts`、`weak_table`。写 weak、读 weak、销毁清零都在对应分片锁下完成。

### weak_table_t

以被引用对象 `referent` 为 key 的开放寻址哈希表。

→

### weak_entry_t

一个对象对应一个 entry，entry 内保存所有指向该对象的 weak 槽位地址。

源码入口：`runtime/NSObject-private.h`、`runtime/objc-weak.h`、`runtime/objc-weak.mm`、`runtime/NSObject.mm`、`runtime/objc-object.h`。

<a id="flows"></a>
## 3. 核心类型、关键属性和方法

| 类型 / 方法 | 位置 | 职责 | 关键字段 / 语义 |
|----|----|----|----|
| `SideTable` | `NSObject-private.h` | 对象额外状态的分片容器。 | `slock` 保护本片；`refcnts` 存 side table 引用计数与标志；`weak_table` 存 weak 反向索引。 |
| `weak_table_t` | `objc-weak.h` | 以对象为 key 的 weak 哈希表。 | `weak_entries` 桶数组；`num_entries` 元素数；`mask` 用于取桶；`max_hash_displacement` 限制线性探测距离。 |
| `weak_entry_t` | `objc-weak.h` | 一个被 weak 指向的对象对应一个 entry。 | `referent` 是目标对象；`inline_referrers[4]` 保存少量槽位；超过 4 个后切换到 `referrers` 哈希集合。 |
| `weak_referrer_t` | `objc-weak.h` | weak 槽位地址的包装。 | 类型是 `DisguisedPtr<objc_object *>`，避免内存分析工具把 weak 表里的槽位地址误判成对象内部强引用。 |
| `objc_storeWeak` / `objc_initWeak` | `NSObject.mm` | 编译器写入或初始化 weak 时调用。 | 统一走模板函数 `storeWeak`：注销旧值、登记新值、设置 weakly referenced 标志、最后写入槽位。 |
| `objc_loadWeakRetained` / `objc_loadWeak` | `NSObject.mm` | 读取 weak 时调用。 | 锁住目标对象的 SideTable，确认槽位没变且 entry 存在，然后 `rootTryRetain` 或 `retainWeakReference`。 |
| `weak_register_no_lock` | `objc-weak.mm` | 登记“对象 → weak 槽位”。 | 拒绝正在释放的目标；如果已有 entry 就追加槽位，否则创建 entry 并插入 weak table。 |
| `weak_clear_no_lock` | `objc-weak.mm` | 对象销毁时清空所有 weak 槽位。 | 遍历 entry 中所有 referrer；若槽位仍指向 referent，则写 `nil`；最后删除 entry。 |

<a id="snippets"></a>
## 4. 关键操作流程

### 写入 weak：`weakVar = obj`

**1读旧值**从 `*location` 取出旧对象，按旧对象和新对象分别定位 `SideTable`。

**2按顺序加锁**`SideTable::lockTwo` 用地址顺序锁住旧表和新表，避免两个线程反向赋值造成死锁。

**3校验稳定**如果加锁后 `*location` 已不是刚才读到的旧值，说明并发修改了 weak，解锁后重试。

**4换登记**从旧对象 entry 移除 `location`，再把 `location` 登记到新对象 entry。

**5写槽位**设置对象 weak 标志，最后只在一个地方执行 `*location = newObj`，降低竞争窗口。

### 读取 weak：`id x = weakVar`

**1先看槽位**读 `*location`，nil 或 tagged pointer 可直接返回。

**2锁目标表**用读到的对象地址找到 `SideTable` 并加锁。

**3防并发变化**如果槽位已改变，解锁重试，避免 retain 错对象。

**4确认登记存在**查 `weak_entry_for_referent`，发现异常会触发扫描和诊断。

**5短暂保活**对普通对象调用 `rootTryRetain`；成功后由 `objc_loadWeak` autorelease。

### 对象释放：自动归零发生在哪里

**引用计数到 0**对象进入 dealloc / dispose 路径，runtime 检查它是否曾被 weak 引用。

**进入慢路径**`clearDeallocating` 发现 `isa.weakly_referenced` 或 side table 状态，调用慢路径。

**清 weak 表**`clearDeallocating_slow` 锁住 SideTable，调用 `weak_clear_no_lock`。

**写 nil 并移除 entry**遍历所有 referrer 槽位，把仍指向对象的槽位置 nil，然后从 weak table 删除该对象 entry。

<a id="summary"></a>
## 5. 带详细注释的核心代码片段

### 数据结构：从 SideTable 到 weak_entry_t

```cpp
// runtime/NSObject-private.h
// 每个 SideTable 是一片对象辅助状态。SideTables()[obj] 会按对象地址定位到其中一片。
struct SideTable {
    spinlock_t slock;        // 保护 refcnts 和 weak_table 的锁
    RefcountMap refcnts;     // side table 引用计数，以及 deallocating / weaklyReferenced 标志
    weak_table_t weak_table; // 该分片内的 weak 反向索引：对象 -> 所有 weak 槽位
};

// runtime/objc-weak.h
// weak_referrer_t 存的是 weak 变量本身的地址，比如 &weakVar，而不是 weakVar 的值。
typedef DisguisedPtr<objc_object *> weak_referrer_t;

struct weak_entry_t {
    DisguisedPtr<objc_object> referent; // 被 weak 指向的对象
    union {
        struct {
            weak_referrer_t *referrers; // 超过 4 个 weak 槽位后，使用堆上哈希集合
            uintptr_t out_of_line_ness : 2;
            uintptr_t num_refs : PTR_MINUS_2;
            uintptr_t mask;
            uintptr_t max_hash_displacement;
        };
        struct {
            weak_referrer_t inline_referrers[4]; // 常见少量 weak 引用直接内联保存
        };
    };
};

struct weak_table_t {
    weak_entry_t *weak_entries;        // 以 referent 为 key 的开放寻址表
    size_t num_entries;
    uintptr_t mask;                    // 桶数为 mask + 1，取桶用 hash & mask
    uintptr_t max_hash_displacement;   // 查找时超过最大探测距离即可判定不存在
};
```

### 写入 weak：注销旧值、登记新值、最后写槽位

```objectivec
// runtime/NSObject.mm
// objc_storeWeak、objc_initWeak、objc_destroyWeak 都复用 storeWeak 模板。
// haveOld 表示 location 里是否已经有旧值；haveNew 表示是否要写入新值。
template <HaveOld haveOld, HaveNew haveNew,
          enum CrashIfDeallocating crashIfDeallocating>
static id storeWeak(id *location, objc_object *newObj)
{
retry:
    // 1. 根据旧对象和新对象分别找到 SideTable。
    if (haveOld) {
        oldObj = *location;
        oldTable = &SideTables()[oldObj];
    }
    if (haveNew) {
        newTable = &SideTables()[newObj];
    }

    // 2. 一次锁住旧表和新表。lockTwo 使用固定顺序，避免死锁。
    SideTable::lockTwo<haveOld, haveNew>(oldTable, newTable);

    // 3. 加锁后重新确认旧值没被其他线程改掉；否则释放锁并重试。
    if (haveOld && *location != oldObj) {
        SideTable::unlockTwo<haveOld, haveNew>(oldTable, newTable);
        goto retry;
    }

    // 4. 从旧对象的 weak_entry_t 中删除这个 weak 槽位。
    if (haveOld) {
        weak_unregister_no_lock(&oldTable->weak_table, oldObj, location);
    }

    // 5. 把这个 weak 槽位登记到新对象的 weak_entry_t 中。
    if (haveNew) {
        newObj = (objc_object *)weak_register_no_lock(
            &newTable->weak_table,
            (id)newObj,
            location,
            crashIfDeallocating ? CrashIfDeallocating : ReturnNilIfDeallocating);

        // 6. 标记对象“曾经被 weak 指向”。销毁时靠这个标志决定是否清 weak 表。
        if (!_objc_isTaggedPointerOrNil(newObj)) {
            newObj->setWeaklyReferenced_nolock();
        }

        // 7. 真正写入 weak 变量。源码强调不要在其他地方写 location，否则会制造竞态。
        *location = (id)newObj;
    }

    SideTable::unlockTwo<haveOld, haveNew>(oldTable, newTable);
    callSetWeaklyReferenced((id)newObj); // 解锁后再做可能执行用户代码的 callout
    return (id)newObj;
}
```

### 登记 weak：对象地址作为 key，槽位地址作为 value 集合成员

```objectivec
// runtime/objc-weak.mm
// 这段代码只在调用者已经持有 SideTable 锁时运行，所以函数名带 no_lock。
id weak_register_no_lock(weak_table_t *weak_table,
                         id referent_id,
                         id *referrer_id,
                         WeakRegisterDeallocatingOptions deallocatingOptions)
{
    objc_object *referent = (objc_object *)referent_id;   // 被 weak 指向的对象
    objc_object **referrer = (objc_object **)referrer_id; // weak 变量槽位地址

    // nil 和 tagged pointer 不需要登记。tagged pointer 没有普通对象生命周期问题。
    if (_objc_isTaggedPointerOrNil(referent)) return referent_id;

    // 形成 weak 前必须确认目标还可用：普通对象查 rootIsDeallocating；
    // 自定义引用计数对象走 allowsWeakReference。
    if (deallocatingOptions == ReturnNilIfDeallocating ||
        deallocatingOptions == CrashIfDeallocating) {
        bool deallocating = !referent->ISA()->hasCustomRR()
            ? referent->rootIsDeallocating()
            : !allowsWeakReference(referent, @selector(allowsWeakReference));

        if (deallocating) {
            if (deallocatingOptions == CrashIfDeallocating) _objc_fatal(...);
            return nil;
        }
    }

    // 查找该对象现有 entry：存在就把 referrer 追加进去；不存在就创建 entry。
    weak_entry_t *entry;
    if ((entry = weak_entry_for_referent(weak_table, referent))) {
        append_referrer(entry, referrer);
    } else {
        weak_entry_t new_entry(referent, referrer);
        weak_grow_maybe(weak_table);
        weak_entry_insert(weak_table, &new_entry);
    }

    // 注意：这里不写 *referrer。storeWeak 负责最后一次性写槽位。
    return referent_id;
}
```

### 读取 weak：先 retain 成功，再交给调用者

```objectivec
// runtime/NSObject.mm
// objc_loadWeakRetained 是真正的安全读取；objc_loadWeak 在它基础上 autorelease。
id objc_loadWeakRetained(id *location)
{
retry:
    // 1. 先乐观读取 weak 槽位。nil / tagged pointer 不需要锁。
    id obj = *location;
    if (_objc_isTaggedPointerOrNil(obj)) return obj;

    // 2. 以当前读到的对象定位 SideTable 并加锁。
    SideTable *table = &SideTables()[obj];
    table->lock();

    // 3. 加锁后槽位变了，说明并发 store/clear 发生了；重试。
    if (*location != obj) {
        table->unlock();
        goto retry;
    }

    // 4. weak 表里应当能找到该对象的 entry，否则说明 weak 槽位被非 runtime 手段破坏。
    weak_entry_t *entry = weak_entry_for_referent(&table->weak_table,
                                                  (objc_object *)obj);
    if (entry == NULL) {
        table->unlock();
        weakTableScan();
        _objc_fault_and_log(...);
        return objc_retain(obj);
    }

    // 5. 关键：只有对象尚未 deallocating，tryRetain 才成功。
    // 成功后调用者在当前表达式里拿到的是一个短暂强引用。
    id result = obj;
    if (!obj->ISA()->hasCustomRR()) {
        if (!obj->rootTryRetain()) result = nil;
    } else {
        if (!retainWeakReference(obj, @selector(retainWeakReference))) result = nil;
    }

    table->unlock();
    return result;
}

id objc_loadWeak(id *location)
{
    if (!*location) return nil;
    return objc_autorelease(objc_loadWeakRetained(location));
}
```

### 对象销毁：zeroing weak 的真正落点

```objectivec
// runtime/objc-object.h + runtime/NSObject.mm
// 对象释放到销毁阶段时，如果曾被 weak 指向，就进入慢路径清 weak 表。
inline void objc_object::clearDeallocating()
{
    if (slowpath(!isa().nonpointer)) {
        sidetable_clearDeallocating();
    } else if (slowpath(isa().weakly_referenced || isa().has_sidetable_rc)) {
        clearDeallocating_slow();
    }
}

void objc_object::clearDeallocating_slow()
{
    SideTable& table = SideTables()[this];
    table.lock();
    if (isa().weakly_referenced) {
        weak_clear_no_lock(&table.weak_table, (id)this);
    }
    table.refcnts.erase(this);
    table.unlock();
}

// runtime/objc-weak.mm
// 遍历所有登记过的 weak 槽位，把仍然指向 referent 的槽位写成 nil。
void weak_clear_no_lock(weak_table_t *weak_table, id referent_id)
{
    objc_object *referent = (objc_object *)referent_id;
    weak_entry_t *entry = weak_entry_for_referent(weak_table, referent);
    if (entry == nil) return;

    weak_referrer_t *referrers = entry->out_of_line()
        ? entry->referrers
        : entry->inline_referrers;
    size_t count = entry->out_of_line() ? TABLE_SIZE(entry) : WEAK_INLINE_COUNT;

    for (size_t i = 0; i < count; ++i) {
        objc_object **referrer = referrers[i]; // referrer 是 &weakVar
        if (referrer) {
            if (*referrer == referent) {
                *referrer = nil;              // 这就是 zeroing weak
            } else if (*referrer) {
                REPORT_WEAK_ERROR(...);       // weak 槽位被错误地直接改写
            }
        }
    }

    weak_entry_remove(weak_table, entry);      // 对象已死，删除反向索引
}
```

## 6. 几个容易误解的点

### weak 表保存的是槽位地址

不是保存“对象引用数组”，而是保存 `&weakVar`。对象释放时 runtime 才能反向找到所有变量位置并写 `nil`。

### weak 读取不是普通 load

直接读内存可能拿到即将释放的对象。`objc_loadWeakRetained` 在锁内确认登记存在并 try-retain，成功后才返回。

### 不要绕过 runtime 改 weak 槽位

源码多处诊断“incorrect use of objc_storeWeak() and objc_loadWeak()”。手写内存或 memcpy 破坏登记关系，会导致清零时发现槽位内容不一致。

**关键边界：**`weak_unregister_no_lock` 不会把槽位写 nil，因为 `storeWeak` 需要旧值保持稳定来完成“注销旧登记，再登记新目标，最后写槽位”的原子化流程。真正自动归零只发生在对象销毁清理路径中。

## 一遍记住

**weak 的本质是 runtime 维护的一张反向索引表：**

`被引用对象 referent → 所有保存该对象地址的 weak 变量槽位 &slot`

赋值时更新这张表；读取时从表和引用计数状态确认对象可短暂保活；销毁时沿这张表找到所有槽位并写 nil。

|  |  |
|----|----|
| 赋值 | `objc_storeWeak` → `weak_unregister_no_lock` → `weak_register_no_lock` → `*location = newObj` |
| 读取 | `objc_loadWeak` → `objc_loadWeakRetained` → `rootTryRetain` → autorelease |
| 销毁 | `clearDeallocating` → `clearDeallocating_slow` → `weak_clear_no_lock` → `*referrer = nil` |
| 性能 | 少量 weak 槽位内联保存；大量 weak 槽位切换为哈希集合；对象表和槽位集合都使用开放寻址。 |
