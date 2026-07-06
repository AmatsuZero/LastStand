+++
title = "启动优化-二进制重排"
date = '2026-05-08T22:56:38+08:00'
draft = false
weight = 6
tags = ["iOS", "性能优化", "启动"]
categories = ["iOS开发", "性能优化"]
+++
二进制重排是一种通过重新排列二进制文件中函数顺序来减少启动时Page Fault的优化技术。

---

## 基本原理

### Page Fault问题

iOS使用虚拟内存管理，讨论Page Fault时需要先区分两层“内存”：

- **虚拟地址空间**：进程看到的是一段连续的虚拟地址。App启动时，dyld会把Mach-O的`__TEXT`、`__DATA`等段映射到进程的虚拟地址空间里。这里的“映射”只是建立虚拟地址和文件偏移的关系，不代表整段二进制代码已经全部进入物理内存。
- **物理内存**：CPU真正执行代码时，需要对应虚拟页背后有可用的物理页。代码页通常是文件映射页，第一次访问某个尚未驻留在物理内存中的代码页时，会触发Page Fault。内核再从App二进制文件中读取这个页的内容，填充到物理页，并更新页表。

所以，更准确地说：程序代码按页映射到虚拟地址空间；启动过程中实际执行到某个函数时，才会按需把该函数所在的代码页调入物理内存。Page Fault本身不是异常崩溃，而是虚拟内存按需调页的正常机制，只是冷启动时如果触发太多文件读取，会增加启动耗时。

默认情况下，编译器按照链接顺序排列函数，导致启动时调用的函数可能分散在不同的代码页中：

```plaintext
优化前（启动函数分散在不同代码页）：
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Page 1 │ │ Page 2 │ │ Page 3 │ │ Page 4 │
│ func_A │ │ func_X │ │ func_B │ │ func_C │
│ ...    │ │ ...    │ │ ...    │ │ ...    │
└────────┘ └────────┘ └────────┘ └────────┘
启动调用 A→B→C 会触达 Page 1, 3, 4。
如果这些代码页还没有驻留在物理内存中，就可能产生3次Page Fault。
```

### 二进制重排的效果

通过重排，将启动时调用的函数集中排列在相邻的代码页中：

```plaintext
优化后（启动函数集中排列在同一代码页）：
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Page 1 │ │ Page 2 │ │ Page 3 │ │ Page 4 │
│ func_A │ │ func_X │ │ ...    │ │ ...    │
│ func_B │ │ ...    │ │        │ │        │
│ func_C │ │        │ │        │ │        │
└────────┘ └────────┘ └────────┘ └────────┘
启动调用 A→B→C 主要触达 Page 1。
如果 Page 1 尚未驻留在物理内存中，通常只需要为这个代码页产生1次Page Fault。
```

二进制重排并不会减少虚拟地址空间中映射的总页数，也不会让App二进制变小；它优化的是启动路径上的函数布局，让冷启动阶段访问的代码页更集中，从而减少需要从文件调入物理内存的离散页数量。

---

## 实现步骤

### 1. 获取启动时调用的函数列表

有多种方式可以获取启动时调用的函数：

#### 方式1：使用Clang插桩

Clang提供了`-fsanitize-coverage`选项，可以在每个函数入口插入回调。

**编译器配置：**

对于Objective-C和Swift混编项目，需要分别配置：

```plaintext
# Objective-C
Build Settings → Other C Flags:
-fsanitize-coverage=func,trace-pc-guard

# Swift
Build Settings → Other Swift Flags:
-sanitize-coverage=func
-sanitize=undefined
```

**实现回调函数：**

```objc
// 在Build Settings中添加：
// Other C Flags: -fsanitize-coverage=func,trace-pc-guard

// 实现回调函数
// 开启 -fsanitize-coverage=func,trace-pc-guard 后，Clang 会在函数入口插入探针代码。
// 下面两个函数不是业务代码主动调用的，而是插桩代码在运行时自动回调的。
void __sanitizer_cov_trace_pc_guard_init(uint32_t *start, uint32_t *stop) {
    static uint64_t N;

    // start 和 stop 指向当前模块中 guard 数组的起止位置。
    // App 主 Mach-O、动态库、Framework 被加载时，都可能各自触发一次初始化。
    // 如果 guard 数组为空，或者已经初始化过（*start 非 0），直接返回。
    if (start == stop || *start) return;

    // 给每个插桩点分配一个非 0 编号。
    // 后续 __sanitizer_cov_trace_pc_guard 中可以通过 guard 判断该探针是否有效。
    for (uint32_t *x = start; x < stop; x++)
        *x = ++N;
}

void __sanitizer_cov_trace_pc_guard(uint32_t *guard) {
    // guard 为 0 表示该插桩点未启用或已被关闭，不需要记录。
    if (!*guard) return;
    
    // 该函数会在被插桩函数执行时触发。
    // __builtin_return_address(0) 取到当前回调返回后要继续执行的位置，
    // 也就是插桩点附近的 PC 地址，可用来反查当前执行到的函数符号。
    void *PC = __builtin_return_address(0);
    Dl_info info;

    // dladdr 根据 PC 地址查询所在镜像、符号名等信息。
    // info.dli_sname 即当前执行到的函数符号名，可用于生成 order 文件。
    dladdr(PC, &info);
    
    // 记录函数符号
    printf("%s\n", info.dli_sname);
}
```

#### 方式2：使用fishhook

使用fishhook hook objc_msgSend等关键函数，记录调用的方法。

#### 方式3：使用Instruments

System Trace工具可以显示所有的Page Fault和对应的函数。

### 2. 生成order文件

将收集到的函数按调用顺序排列，生成order文件。

**符号命名差异：**

Objective-C和Swift的符号格式不同，需要注意：

```plaintext
# Objective-C符号（可读格式）
-[AppDelegate application:didFinishLaunchingWithOptions:]
-[HomeViewController viewDidLoad]
+[NSObject alloc]

# Swift符号（经过name mangling）
_$s7MyApp14ViewControllerC11viewDidLoadyyF
_$s7MyApp9SomeClassC6doWorkyyF
```

Swift的符号经过了name mangling处理，可以使用`swift demangle`命令还原可读名称：

```bash
$ swift demangle _\$s7MyApp14ViewControllerC11viewDidLoadyyF
# 输出: MyApp.ViewController.viewDidLoad() -> ()
```

**order文件示例：**

```plaintext
# order文件示例
# 启动时最先调用的函数排在最前面
_main
_UIApplicationMain
-[AppDelegate application:didFinishLaunchingWithOptions:]
-[HomeViewController viewDidLoad]
-[HomeViewController viewWillAppear:]
-[HomeTableView reloadData]
_$s7MyApp14ViewControllerC11viewDidLoadyyF
...
```

收集到的符号（无论是Objective-C还是Swift mangled名称）直接写入order文件即可，链接器能够正确识别。

### 3. 配置Order File

在Xcode的Build Settings中配置：

```plaintext
Build Settings → Linking → Order File
设置为: $(SRCROOT)/order_file.txt
```

---

## 完整示例

### 收集启动函数的代码

```objc
// LaunchFunctionCollector.m

#import <Foundation/Foundation.h>
#import <dlfcn.h>

// 说明：早期资料常见 OSAtomic 队列写法，但该 API 已弃用
// 这里使用串行队列保护符号数组，便于理解且兼容新系统
static dispatch_queue_t symbolQueue;
static NSMutableArray<NSString *> *symbolList;
static BOOL isCollecting = NO;

// Clang SanitizerCoverage 的初始化回调。
// 每个被插桩的 Mach-O 镜像都会有一段 guard 数组，start/stop 是这段数组的范围。
void __sanitizer_cov_trace_pc_guard_init(uint32_t *start, uint32_t *stop) {
    static uint64_t N;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        symbolQueue = dispatch_queue_create("com.awesomeios.symbol.collector", DISPATCH_QUEUE_SERIAL);
        symbolList = [NSMutableArray array];
    });

    // 避免重复初始化；guard 已经有值说明这一段插桩点已经处理过。
    if (start == stop || *start) return;

    // 将每个 guard 设置为唯一的非 0 值，表示该插桩点可被追踪。
    for (uint32_t *x = start; x < stop; x++)
        *x = ++N;
}

// Clang 在函数入口插入的探针会回调到这里。
// 本例只在启动阶段打开 isCollecting，因此只收集启动路径上的函数。
void __sanitizer_cov_trace_pc_guard(uint32_t *guard) {
    if (!isCollecting) return;
    
    // 取插桩点附近的 PC 地址，再通过 dladdr 反查函数符号。
    // 这些符号按调用顺序去重后，就可以写入 order_file.txt 给链接器使用。
    void *PC = __builtin_return_address(0);
    Dl_info info;
    dladdr(PC, &info);
    const char *symbol = info.dli_sname;
    if (!symbol) return;

    dispatch_async(symbolQueue, ^{
        [symbolList addObject:@(symbol)];
    });
}

// 开始收集
void startCollecting(void) {
    isCollecting = YES;
}

// 停止收集并导出
void stopAndExport(void) {
    isCollecting = NO;
    
    NSMutableArray<NSString *> *symbols = [NSMutableArray array];
    NSMutableSet *seen = [NSMutableSet set];

    dispatch_sync(symbolQueue, ^{
        for (NSInteger i = symbolList.count - 1; i >= 0; i--) {  // 反转顺序
            NSString *symbol = symbolList[i];
            if (![seen containsObject:symbol]) {
                [seen addObject:symbol];
                [symbols addObject:symbol];
            }
        }
    });
    
    // 导出到文件
    NSString *content = [symbols componentsJoinedByString:@"\n"];
    NSString *path = [NSTemporaryDirectory() stringByAppendingPathComponent:@"order_file.txt"];
    [content writeToFile:path atomically:YES encoding:NSUTF8StringEncoding error:nil];
    
    NSLog(@"Order file exported to: %@", path);
}
```

### 使用方式

```objc
// 在main函数最开始调用
int main(int argc, char * argv[]) {
    startCollecting();
    
    @autoreleasepool {
        return UIApplicationMain(argc, argv, nil, NSStringFromClass([AppDelegate class]));
    }
}

// 在首帧渲染完成后停止收集
- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        stopAndExport();
    });
}
```

---

## 优化效果验证

在Instruments的System Trace中查看Page Fault数量。

dyld 4（iOS 16+）已移除 `DYLD_PRINT_STATISTICS` 和 `DYLD_PRINT_STATISTICS_DETAILS` 环境变量（其他 `DYLD_PRINT_*` 变量仍可用），建议使用以下方式验证：

1. **Instruments App Launch模板**：查看启动各阶段耗时
2. **System Trace**：观察Page Fault数量变化
3. **MetricKit**：收集线上启动性能数据

---

## Objective-C与Swift的兼容性

二进制重排对Objective-C和Swift语言都生效，原因如下：

1. **链接阶段工作**：二进制重排是在链接阶段操作编译后的机器码，而非源代码
2. **统一的二进制格式**：无论是Objective-C还是Swift，最终都会编译成Mach-O二进制文件
3. **链接器通用支持**：Order File机制是链接器层面的功能，对两种语言都适用

**混编项目注意事项：**

- 确保C Flags和Swift Flags都添加了插桩参数
- `dladdr`获取的Swift符号是mangled后的名称，直接写入order文件即可
- 使用System Trace验证Page Fault的方式对两种语言都适用

---

## 注意事项

1. **维护成本**：order文件需要定期更新，每次代码变更都可能需要重新生成
2. **CI/CD集成**：可以在CI流程中自动生成order文件
3. **主要优化冷启动**：热启动时相关代码页可能已经驻留在物理内存或文件缓存中，文件读取成本明显降低，二进制重排的收益会变小
4. **大型App收益更明显**：代码量大、启动路径复杂的App优化效果更显著
5. **混编项目配置**：Objective-C和Swift需要分别配置插桩参数
