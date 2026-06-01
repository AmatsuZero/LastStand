+++
title = "Objective-C KVO 作用与实现原理"
date = '2026-06-01T19:50:12+08:00'
draft = false
weight = 15
tags = ['Objective-C', 'Runtime', '源码分析']
categories = ['iOS开发']
+++

objc4 runtime reading note

# KVO：从“属性变化通知”到 runtime 动态子类

KVO（Key-Value Observing）让一个对象在另一个对象的某个 key path 变化时收到回调。 在这个 objc4 仓库里，Foundation 的 KVO 主体代码不在源码中；但 runtime 暴露了 KVO 需要的关键能力： 复制类、切换对象的 isa、判断 ivar 内存语义，并保证这些操作在初始化、弱引用和并发加载场景下安全。

入口：addObserver 核心：动态子类 通知：will/didChange 底层：objc_duplicateClass

<a id="what"></a>
## 阅读路线

1.  [KVO 解决什么问题](#what)
2.  [实现原理总览](#principle)
3.  [objc4 中的关键支撑](#runtime)
4.  [核心类和关键方法](#classes)
5.  [关键流程](#flows)
6.  [带注释代码片段](#snippets)
7.  [使用边界和排错](#pitfalls)

<a id="principle"></a>
## 1. KVO 的作用：把“状态变化”变成可订阅事件

普通属性赋值只改变对象内部状态，调用者不知道“谁关心这个变化”。KVO 把某个 key path 的变化包装成标准事件： 被观察对象负责发出变化，观察者在 `observeValueForKeyPath:ofObject:change:context:` 中接收。

### 解耦

观察者不需要改写被观察对象的业务代码，只注册感兴趣的 key path。

### 统一格式

变化以 `change` 字典传递，可包含旧值、新值、变化类型等。

### 自动拦截

对 KVC/KVO 兼容的 setter，Foundation 可自动在 setter 前后发通知。

### 手动通知

复杂派生属性或批量变化可用 `willChangeValueForKey:` 和 `didChangeValueForKey:` 明确包围。

一句话理解：KVO 不是“属性自带事件”，而是 Foundation 借助 Objective-C runtime 在对象身上临时安装一层拦截器。

<a id="runtime"></a>
## 2. 实现原理：Foundation 创建隐藏子类，并把对象的 isa 指过去

对某个对象第一次添加 KVO 观察时，Foundation 通常会为该对象的原类复制出一个专用子类，常见运行时类名类似 `NSKVONotifying_OriginalClass`。随后只修改这个对象的 `isa`，让它从“原类实例”变成“隐藏子类实例”。 隐藏子类重写被观察属性的 setter，在真正赋值前后插入通知。

### 注册前

`obj->isa == Person`

调用 `setName:` 直接进入 `Person` 的 setter。

→

### addObserver

Foundation 复制/准备 `NSKVONotifying_Person`，安装 KVO setter、`class`、`dealloc` 等方法。

→

### 注册后

`obj->isa == NSKVONotifying_Person`

同样调用 `setName:`，先进入 KVO setter，再转发到原 setter。

### 发现 key

根据 key path 找 setter 或访问实例变量，确认是否可自动通知。

### 创建通知类

使用 runtime 能力复制原类结构，并追加 KVO 专用方法。

### 切换 isa

只影响被观察的这个对象，不改变同类的其他实例。

### 包围 setter

setter 执行顺序变成 will-change、原 setter、did-change、回调观察者。

<a id="classes"></a>
## 3. objc4 中能看到的 KVO 支撑点

这个仓库没有 Foundation 的 `NSKeyValueObserving` 源码，所以看不到 `addObserver:` 内部完整实现。 但 objc4 明确暴露了 KVO 依赖的底层机制。

| 位置 | 关键代码 | 对 KVO 的意义 |
|----|----|----|
| `runtime/runtime.h` | `objc_duplicateClass` | 头文件注释写明 “Used by Foundation's Key-Value Observing”。这是隐藏通知类的 runtime 根基。 |
| `runtime/objc-runtime-new.mm` | `objc_duplicateClass` 实现 | 复制类数据、方法列表、属性和协议，注册新类，并把它挂到类表和子类链中。 |
| `runtime/objc-class.mm` | `_class_getIvarMemoryManagement` | 注释说明供 KVO 等直接设置 ivar 时判断内存管理语义，避免把 weak 当 strong 写。 |
| `test/02-concurrentcat.m` | `addObserver` 与分类并发加载 | 验证 KVO 动态类化和分类方法加载、retain/release/autorelease 混合并发时 runtime 不崩溃。 |
| `test/initializeVersusWeak.m` | KVO、weak、`+initialize` | 验证 KVO 触发的 `object_setClass()` 和 weak 操作不会因初始化锁、弱表锁交错而死锁。 |

<a id="flows"></a>
## 4. 核心类及其关键属性方法

KVO 的公开 API 在 Foundation，底层类结构在 objc runtime。理解时把它们分成“用户接口层”和“runtime 支撑层”更清楚。

### `NSObject(NSKeyValueObserving)`

**角色：**注册、移除观察者，并接收自动/手动通知入口。

- `addObserver:forKeyPath:options:context:`：建立观察关系。
- `removeObserver:forKeyPath:`：解除观察关系。
- `willChangeValueForKey:`：变化前通知，准备旧值和嵌套计数。
- `didChangeValueForKey:`：变化后通知，生成 change 并回调观察者。

### 观察者对象

**角色：**实现回调，按 key path 和 context 分发业务逻辑。

- `observeValueForKeyPath:ofObject:change:context:`：核心回调。
- `context`：推荐用静态地址区分观察来源，避免只靠字符串。
- `change`：携带 old/new/kind/indexes 等信息，取决于注册 options。

### `NSKVONotifying_*` 隐藏类

**角色：**Foundation 生成的动态通知子类，名字和具体实现不属于稳定公开接口。

- 重写被观察 key 对应 setter。
- 通常重写 `class`，让外部看到的仍像原类。
- 处理释放时的观察状态清理。

### objc runtime 类结构

**角色：**提供动态类复制、方法派发、isa 切换和 ivar 语义查询。

- `objc_duplicateClass`：复制原类，得到 KVO 通知类的基础结构。
- `object_setClass`：把单个对象切到通知类。
- `_class_getIvarMemoryManagement`：判断 ivar 是 strong、weak、unretained 还是 unknown。

<a id="snippets"></a>
## 5. 关键操作流程

### 注册观察

1.  调用 `addObserver:forKeyPath:options:context:`。
2.  Foundation 校验 key path 和自动通知策略。
3.  第一次观察该对象时生成或复用 KVO 通知类。
4.  用 `object_setClass` 切换当前对象的 isa。
5.  记录观察者、key path、options、context。

### 属性赋值

1.  调用 `obj.name = value`，消息派发进入 KVO 子类 setter。
2.  setter 调用 `willChangeValueForKey:`。
3.  再调用原类 setter 或直接写 ivar。
4.  调用 `didChangeValueForKey:`。
5.  Foundation 组装 change 字典并回调观察者。

### 移除观察

1.  调用 `removeObserver:forKeyPath:`。
2.  Foundation 删除对应观察记录。
3.  当对象不再需要 KVO 子类时，可恢复 isa 到原类。
4.  后续 setter 不再被 KVO 拦截。

最容易出错的点：注册和移除必须配对；观察者释放后还留在观察列表里，会导致悬空回调或异常。 现代代码优先使用 token 风格 API（例如 block-based observation）让生命周期更清楚。

<a id="pitfalls"></a>
## 6. 带详细注释的核心代码片段

### 6.1 公开头文件直接说明：这个函数就是给 KVO 用的

`runtime/runtime.h` 把 `objc_duplicateClass` 放在“Adding Classes”区域，并明确警告不要自己调用。 这说明 Foundation KVO 不只是用普通子类，而是需要 runtime 级别的类复制能力。

```javascript
/* runtime/runtime.h */

/**
 * Used by Foundation's Key-Value Observing.
 *
 * @warning Do not call this function yourself.
 */
OBJC_EXPORT Class
objc_duplicateClass(Class original,
                    const char *name,
                    size_t extraBytes);
```

要点：KVO 动态通知类不是源码里提前写好的类，而是 Foundation 运行时生成或准备的类。

### 6.2 复制类：KVO 通知类如何从原类“长出来”

下面摘自 `runtime/objc-runtime-new.mm` 的 `objc_duplicateClass`。 它先确保原类已经 realize，再复制类的读写数据、方法、属性和协议，最后注册到 runtime 类表。

```javascript
/* runtime/objc-runtime-new.mm：删减并加注释 */
Class objc_duplicateClass(Class original, const char *name, size_t extraBytes)
{
    // KVO 修改类结构必须拿 runtimeLock，避免和类加载、分类加载并发冲突。
    mutex_locker_t lock(runtimeLock);

    // 原类必须先完成 realize，类数据结构才完整。
    original->realizeIfNeeded_nolock();
    checkIsKnownClass(original);

    auto orig_rw  = original->data();
    auto orig_rwe = orig_rw->ext();
    auto orig_ro  = orig_rw->ro();

    ASSERT(original->isRealized());
    ASSERT(!original->isMetaClass());

    // 为“原类的同级复制品”分配 class 对象。
    // Foundation 可在这个复制品上安装 KVO setter。
    Class duplicate = alloc_class_for_subclass(original, extraBytes);

    // 复制品使用和原类相同的 metaclass，superclass 也和原类一致。
    duplicate->initClassIsa(original->ISA());
    duplicate->setSuperclass(original->getSuperclass());
    duplicate->cache.initializeToEmpty();

    class_rw_t *rw = objc::zalloc<class_rw_t>();
    rw->flags = (orig_rw->flags | RW_COPIED_RO | RW_REALIZING);

    // 复制原类的可写类数据，再挂到 duplicate 上。
    duplicate->bits.copyRWFrom(original->bits);
    duplicate->setData(rw);

    // 复制只读类数据，并把类名替换成 KVO 想要的新名字。
    // 例如 Foundation 常见命名形态：NSKVONotifying_Person。
    auto ro = orig_ro->duplicate();
    *(char **)&ro->name = strdupIfMutable(name);
    rw->set_ro(ro);

    if (orig_rwe) {
        auto rwe = rw->extAllocIfNeeded();
        rwe->version = orig_rwe->version;
        // 方法列表深拷贝：之后 KVO 可以安全替换或追加 setter。
        orig_rwe->methods.duplicateInto(rwe->methods);
        rwe->properties = orig_rwe->properties;
        rwe->protocols = orig_rwe->protocols;
    } else if (ro->baseMethods) {
        rw->deepCopy(ro);
    }

    // 加入 superclass 的子类链、命名类表和全局类表。
    // 这样消息派发、反射和调试工具才能认识这个类。
    duplicate->chooseClassArrayIndex();
    if (duplicate->getSuperclass()) {
        addSubclass(duplicate->getSuperclass(), duplicate);
    } else {
        addRootClass(duplicate);
    }
    addNamedClass(duplicate, ro->getName());
    addClassTableEntry(duplicate, /*addMeta=*/false);

    duplicate->clearInfo(RW_REALIZING);
    return duplicate;
}
```

### 6.3 直接写 ivar 前，必须知道它是 strong 还是 weak

KVO setter 有时不只是调用原 setter，也可能通过 KVC 路径直接访问 ivar。直接写对象指针时，如果把 weak ivar 当普通指针写， 弱表就不会更新；如果把 unretained 当 strong 写，又会改变生命周期。因此 runtime 给 KVO 提供了判断 ivar 内存语义的 SPI。

```objectivec
/* runtime/objc-class.mm：删减并加注释 */

/***********************************************************************
* _class_getIvarMemoryManagement
* SPI for KVO and others to decide what memory management to use
* when setting instance variables directly.
**********************************************************************/
objc_ivar_memory_management_t
_class_getIvarMemoryManagement(Class cls, Ivar ivar)
{
    // 确保类已 realize，布局、ivar、ARC layout bitmap 才可用。
    cls->realizeIfNeeded();

    ptrdiff_t offset;
    objc_ivar_memory_management_t memoryManagement;

    // 在类层级里查找 ivar，结合 ARC strong/weak layout 判断语义。
    _class_lookUpIvar(cls, ivar, offset, memoryManagement);
    return memoryManagement;
}

static ALWAYS_INLINE
void _object_setIvar(id obj, Ivar ivar, id value, bool assumeStrong)
{
    if (!ivar || _objc_isTaggedPointerOrNil(obj)) return;

    ptrdiff_t offset;
    objc_ivar_memory_management_t memoryManagement;
    _class_lookUpIvar(obj->ISA(), ivar, offset, memoryManagement);

    // unknown 时按调用者策略兜底：KVO 需要非常谨慎地选 strong 或 unretained。
    if (memoryManagement == objc_ivar_memoryUnknown) {
        if (assumeStrong) memoryManagement = objc_ivar_memoryStrong;
        else memoryManagement = objc_ivar_memoryUnretained;
    }

    id *location = (id *)((char *)obj + offset);

    // 关键：weak 要走 objc_storeWeak，strong 要走 objc_storeStrong。
    switch (memoryManagement) {
    case objc_ivar_memoryWeak:       objc_storeWeak(location, value); break;
    case objc_ivar_memoryStrong:     objc_storeStrong(location, value); break;
    case objc_ivar_memoryUnretained: *location = value; break;
    case objc_ivar_memoryUnknown:    _objc_fatal("unknown ivar memory management");
    }
}
```

### 6.4 测试里的 KVO：并发分类加载时持续 add/remove observer

`test/02-concurrentcat.m` 启动多个线程，每个线程反复调用被分类动态加载的方法，同时不断添加和移除 KVO。 这类测试关注的不是 KVO 业务语义，而是 runtime 在“分类方法列表变化 + KVO 动态类化 + 引用计数操作”组合下是否安全。

```javascript
/* test/02-concurrentcat.m：删减并加注释 */
void *threadFun(void *aTargetClassName) {
    Class targetSubclass = objc_getClass((const char *)aTargetClassName);
    id target = [targetSubclass new];

    while (1) {
        [target m0];

        // KVO 注册：Foundation 可能在这里创建/复用通知类，
        // 并把 target 的 isa 切到 KVO 类。
        [target addObserver:target forKeyPath:@"m3" options:0 context:NULL];
        [target addObserver:target forKeyPath:@"m4" options:0 context:NULL];

        // retain/release/autorelease 混入，用来放大并发生命周期问题。
        RETAIN(target);
        [target m1];
        RELEASE_VALUE(target);

        // m2 的实现会手动发送 m4 的 will/did change。
        [target m2];

        // 移除一个观察，再添加另一个观察，反复冲击 KVO 状态表。
        [target removeObserver:target forKeyPath:@"m4"];
        [target addObserver:target forKeyPath:@"m5" options:0 context:NULL];

        [target m3];
        [target m4];
        [target m5];

        [target removeObserver:target forKeyPath:@"m3"];
        [target removeObserver:target forKeyPath:@"m5"];
    }
}
```

### 6.5 手动通知：will 和 did 必须成对包围真实变化

`test/concurrentcat_category.m` 中的 `m2` 没有真正修改属性，只是手动发出 `m4` 的变化通知。 这展示了 KVO 的本质：通知和赋值可以解耦，关键是外层必须正确包围变化区间。

```cpp
/* test/concurrentcat_category.m */
- (void)m2
{
    // 变化前：Foundation 记录旧值、标记该 key 正在变化。
    [self willChangeValueForKey:@"m4"];

    // 真实代码中这里应放实际 mutation，例如：
    // _m4 = newValue;
    // 或者一次批量更新会影响 m4 的派生值。

    // 变化后：Foundation 读取新值，生成 change 字典，回调观察者。
    [self didChangeValueForKey:@"m4"];
}

- (void)observeValueForKeyPath:(NSString *)keyPath
                      ofObject:(id)object
                        change:(NSDictionary *)change
                       context:(void *)context
{
    // 测试中只吞掉回调；业务代码应检查 context/keyPath 后处理。
    (void)keyPath;
    (void)object;
    (void)change;
    (void)context;
}
```

### 6.6 KVO、weak 和 +initialize 的锁顺序

`test/initializeVersusWeak.m` 说明了一个很隐蔽的边界：KVO 注册会触发 `object_setClass()`， weak 读写会碰弱引用表，二者都可能遇到 `+initialize`。runtime 必须避免在持有弱表锁时等待类初始化，否则会死锁。

```cpp
/* test/initializeVersusWeak.m：删减并加注释 */

// 文件头注释给出问题和解法：
// 如果 weak 操作触发 +initialize，可能出现递归 weak 锁，
// 或 weak 锁和 +initialize 锁的锁顺序反转。
// 解法是 object_setClass() 和 objc_storeWeak() 在需要时先完成 +initialize。

void testB()
{
    @autoreleasepool {
        B *obj = [B new];
        strong4 = newAlignedObject(obj);
        weak3 = obj;

        // KVO 注册可能通过 object_setClass() 改变 obj 的 isa。
        // 如果新 isa 对应的类尚未 initialize，runtime 要处理初始化顺序。
        [obj addObserver:obj forKeyPath:@"foo" options:0 context:0];

        // weak load 也可能触发 +initialize。
        // 测试确保这里不会因为 KVO + weak + initialize 组合而死锁。
        [weak3 self];

        [obj removeObserver:obj forKeyPath:@"foo"];
    }
}
```

## 7. 使用边界和排错清单

### 优先观察属性，不要观察实现细节

key path 应表达稳定语义。直接依赖 ivar 名称会让重构变得脆弱。

### 注册和移除必须生命周期对齐

老式 API 中，观察者和被观察者任意一方释放前都要处理观察关系。

### 手动通知必须成对

`willChangeValueForKey:` 和 `didChangeValueForKey:` 中间只能包围对应变化，不要漏调或交叉嵌套。

### 不要依赖真实 isa 或隐藏类名

KVO 会改变对象的 runtime class。业务判断应使用公开行为，不要写死 `NSKVONotifying_*`。

### 回调里用 context 分流

多个父类、子类或组件都观察同一 key 时，只靠 keyPath 字符串容易误处理。

### 理解自动通知的前提

直接改 ivar、绕过 setter、批量修改派生值时，自动 KVO 可能捕捉不到，需要手动通知。

读完后的完整心智模型：`addObserver` 建立观察记录，并可能把单个对象切换到 KVO 动态类； setter 进入动态类后发出 will/did 通知；runtime 负责让类复制、isa 切换、ivar 写入语义、弱引用和初始化顺序保持正确。

代码依据：`runtime/runtime.h`、`runtime/objc-runtime-new.mm`、`runtime/objc-class.mm`、 `test/02-concurrentcat.m`、`test/concurrentcat_category.m`、`test/initializeVersusWeak.m`。 Foundation 的 KVO 主实现不包含在本 objc4 仓库中，文中对 `NSKeyValueObserving` 的流程描述基于这些 runtime 支撑点和公开 KVO 行为推导。
