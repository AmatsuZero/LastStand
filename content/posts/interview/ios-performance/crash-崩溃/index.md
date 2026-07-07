+++
title = "崩溃"
date = '2026-05-04T10:37:14+08:00'
draft = false
weight = 23
tags = ["iOS", "性能优化", "稳定性", "崩溃"]
categories = ["iOS开发", "性能优化", "稳定性"]
+++
崩溃是影响App稳定性的最严重问题。当应用发生崩溃时，用户会被强制退出应用，严重影响用户体验和产品口碑。

本系列文章系统性地介绍iOS崩溃的原理、采集方案以及治理策略。

---

## 什么是崩溃

崩溃（Crash）是指应用程序因为异常或错误而被强制终止的现象。从技术角度看，崩溃可以分为以下几类：

| 崩溃类型 | 触发原因 | 典型场景 |
|---------|---------|---------|
| Mach异常 | 底层硬件/内核异常 | 访问无效内存、除零错误 |
| Unix信号 | 系统信号导致进程终止 | SIGABRT、SIGSEGV、SIGBUS |
| NSException | OC层未捕获的异常 | 数组越界、unrecognized selector |
| 内存问题 | OOM或内存损坏 | 内存不足、野指针 |
| Watchdog | 系统监控超时 | 启动超时、后台任务超时 |

---

## 崩溃率指标

崩溃率是衡量App稳定性的核心指标：

```plaintext
崩溃率计算方式：

1. 崩溃用户率（推荐）
   崩溃用户率 = 发生崩溃的用户数 / 总活跃用户数 × 100%

2. 崩溃次数率
   崩溃次数率 = 崩溃次数 / 启动次数 × 100%

3. 崩溃Session率
   崩溃Session率 = 崩溃Session数 / 总Session数 × 100%
```
---

## 崩溃处理的整体架构

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                    崩溃处理架构                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   崩溃发生                           │    │
│  │  Mach异常 / Unix信号 / NSException / OOM             │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   崩溃捕获                           │    │
│  │  • Mach异常处理                                      │    │
│  │  • Signal Handler                                   │    │
│  │  • NSSetUncaughtExceptionHandler                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   信息采集                           │    │
│  │  • 堆栈信息                                          │    │
│  │  • 设备信息                                          │    │
│  │  • 用户上下文                                         │   │
│  │  • 崩溃现场                                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   本地存储                           │    │
│  │  • 写入文件（需要异步安全）                             │    │
│  │  • 避免使用OC/Swift API                              │    │
│  └─────────────────────────────────────────────────────┘    │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   上报分析                           │    │
│  │  • 下次启动时上报                                     │    │
│  │  • 符号化解析                                         │   │
│  │  • 聚合分析                                          │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 文章导航

本系列包含以下文章，建议按顺序阅读：

### 1. 原理篇

理解崩溃的底层原理是有效治理的基础。

- [崩溃-原理]({{< relref "/posts/interview/ios-performance/crash-原理" >}})
  - iOS异常处理机制
  - Mach异常与Unix信号的关系
  - NSException处理流程
  - 崩溃的传递链路

- [崩溃-Mach异常]({{< relref "/posts/interview/ios-performance/crash-Mach异常" >}})
  - Mach内核基础
  - 异常端口机制
  - 常见Mach异常类型
  - 异常处理流程

- [崩溃-信号处理]({{< relref "/posts/interview/ios-performance/crash-信号处理" >}})
  - Unix信号机制
  - 常见崩溃信号
  - Signal Handler注册
  - 信号安全函数

### 2. 采集篇

准确采集崩溃信息是分析和修复的前提。

- [崩溃-采集]({{< relref "/posts/interview/ios-performance/crash-采集" >}})
  - 崩溃捕获方案
  - 堆栈回溯技术
  - 符号化原理
  - 崩溃日志格式

### 3. 治理篇

系统性的治理策略帮助持续降低崩溃率。

- [崩溃-治理]({{< relref "/posts/interview/ios-performance/crash-治理" >}})
  - 常见崩溃类型及修复
  - 防崩溃保护机制
  - 线上监控体系
  - 崩溃分析方法论

- [崩溃日志解读]({{< relref "/posts/interview/ios-performance/crash-崩溃日志解读" >}})
  - `.ips` 双段 JSON 格式与 `bug_type` 全景
  - `exception` / `termination` / `threads` / `usedImages` 逐字段详解
  - Exception Type 与 Termination Namespace 深度解读
  - 寄存器视角、符号化工具链与实战案例库

- [JetsamEvent 日志解读]({{< relref "/posts/interview/ios-performance/crash-JetsamEvent日志解读" >}})
  - Jetsam 机制与 `.ips` 文件结构
  - `memoryStatus` / `processes` 字段逐项详解
  - `reason` 类型深度解读与排查方向
  - 机型 × iOS 版本 OOM 阈值矩阵与自动化脚本

---

## 常见面试问题

### 1. iOS 崩溃从底层到应用层的完整传递链路是什么？

一次典型崩溃通常不是一开始就表现为 Objective-C 异常或信号，而是从更底层开始逐层传递。CPU 首先检测到非法操作，例如访问无效地址、执行非法指令、除零或断点指令，然后陷入内核态；XNU 内核把硬件异常包装成 Mach 异常，例如 `EXC_BAD_ACCESS`、`EXC_BAD_INSTRUCTION`、`EXC_ARITHMETIC`、`EXC_BREAKPOINT`、`EXC_CRASH`。如果进程、线程或系统注册了 Mach Exception Port，内核会按 Thread -> Task -> Host 的顺序把异常消息发给对应端口；如果没有处理，或者处理器返回失败，异常会继续转换成 Unix 信号，例如 `SIGSEGV`、`SIGBUS`、`SIGILL`、`SIGFPE`、`SIGTRAP`、`SIGABRT`。信号层会调用进程注册的 Signal Handler；如果仍然没有被处理，或处理后恢复默认行为，系统最终终止进程并生成崩溃日志。`NSException` 属于应用层异常，未被 `@catch` 捕获时会先调用 `NSSetUncaughtExceptionHandler` 注册的处理函数，随后通常调用 `abort()`，最终表现为 `EXC_CRASH (SIGABRT)`。

### 2. Mach 异常和 Unix 信号有什么关系？为什么崩溃 SDK 通常两者都捕获？

Mach 异常是 Darwin / iOS 更底层的异常机制，Unix 信号是 BSD 层向进程表达异常或事件的机制。很多崩溃先以 Mach 异常出现，再在未被 Mach 处理器消费时转换成信号：`EXC_BAD_ACCESS` 常对应 `SIGSEGV` 或 `SIGBUS`，`EXC_BAD_INSTRUCTION` 对应 `SIGILL`，`EXC_ARITHMETIC` 对应 `SIGFPE`，`EXC_BREAKPOINT` 对应 `SIGTRAP`，`EXC_CRASH` 常对应 `SIGABRT`。Mach 捕获的优势是时机更早，可以拿到原始异常类型、异常码、线程状态和更多上下文，而且通常由独立异常处理线程接收消息；Signal Handler 的优势是实现相对简单，也能覆盖部分已经转换到 BSD 层的终止。实际 SDK 往往先注册 Mach Exception Handler，再注册 Signal Handler，最后注册 `NSException` Handler：Mach 层负责尽早采集，返回 `KERN_FAILURE` 让异常继续传递；Signal 层作为兜底；`NSException` 层补充异常名、reason 和 `lastExceptionBacktrace` 等应用层信息。这样做的关键是避免重复记录，并正确保存和转发原有处理器。

### 3. Mach Exception Port 的查找顺序和处理流程是怎样的？

Mach 异常通过端口和消息传递。异常发生后，内核会构造包含异常类型、异常码、触发线程、所属 task 等信息的 Mach 消息，并按照 Thread Exception Port、Task Exception Port、Host Exception Port 的顺序查找处理者。线程级端口粒度最细，较少用于普通业务；任务级端口对应整个进程，是 LLDB 和崩溃采集 SDK 常用的位置；主机级端口通常是系统兜底处理程序。处理器收到消息后可以读取触发线程的寄存器状态，例如 ARM64 下的 `pc`、`lr`、`sp`、`fp`，再采集堆栈、镜像列表、异常码等信息。处理完成后需要向内核发送 reply：如果返回 `KERN_SUCCESS`，理论上表示异常已被处理，线程可恢复执行；崩溃采集场景一般不应该吞掉真实崩溃，而是返回失败或转发给原异常端口，让系统继续走信号或终止流程。多个 SDK 同时接入时，要先用 `task_get_exception_ports` 保存旧端口，处理完后转发或放行，否则后注册者会覆盖先注册者，导致其他 SDK 或系统 CrashReporter 拿不到异常。

### 4. Signal Handler 为什么要求异步信号安全？哪些操作不能在里面做？

信号可能在任何指令执行期间打断当前线程，例如线程正在 `malloc`、`printf`、Objective-C runtime 或持锁代码中执行时突然收到 `SIGSEGV`。如果 Signal Handler 再调用同一类非重入函数，就可能再次获取已经持有的锁，造成死锁；也可能操作处于半更新状态的数据结构，造成二次崩溃。因此崩溃现场的 Signal Handler 只能做极少量异步信号安全的工作，例如使用预分配缓冲区、写原始地址、调用 `write()`、`open()`、`close()`、`_exit()`、`sigaction()`、`sigprocmask()` 等底层接口。不能调用 `malloc/free/realloc`、`new/delete`、`printf/fprintf/fopen`、`NSLog`、任何 Objective-C 方法、Foundation API、C++ 标准库、异常处理或可能加锁的日志系统。工程上通常在正常运行期预先准备文件路径、mmap 区域和固定大小缓冲区；崩溃时只写入信号编号、故障地址、寄存器和原始 PC 地址；符号化、JSON 拼装、压缩和网络上报都放到下次启动或独立安全阶段完成。

### 5. 为什么 Signal Handler 里推荐使用 `sigaction` 和备用信号栈？

`signal()` 只能拿到信号编号，语义在不同系统上也更弱；`sigaction()` 可以通过 `SA_SIGINFO` 拿到 `siginfo_t`，其中包含 `si_code`、发送者、故障地址 `si_addr` 等关键信息，还可以通过第三个参数拿到 `ucontext_t`，进一步读取崩溃线程的寄存器现场。备用信号栈则用于处理栈溢出类崩溃：如果当前线程因为递归或大栈对象导致原栈空间耗尽，默认情况下 Signal Handler 也需要在同一条栈上执行，可能根本跑不起来；通过 `sigaltstack()` 预先分配备用栈，并在 `sigaction` 中设置 `SA_ONSTACK`，信号处理函数就能在备用栈上执行，提高采集成功率。完整实现还需要保存旧的 `sigaction`，用 `volatile sig_atomic_t` 防止重入，采集完成后恢复原处理器并 `raise(sig)`，让系统继续生成标准崩溃日志。

### 6. `NSException`、Swift Error 和 Swift 运行时崩溃有什么区别？

`NSException` 是 Objective-C 层面的异常，常见于数组越界、字典插入 `nil`、`unrecognized selector`、KVO 使用错误、枚举时修改集合等；它不是普通业务错误处理机制，未捕获时会调用 Uncaught Exception Handler，然后通常 `abort()`，最终在崩溃日志里表现为 `EXC_CRASH (SIGABRT)`，真正的业务堆栈常在 `lastExceptionBacktrace` 和 `asi` 里。Swift 的 `Error` 是显式、可恢复的错误模型，配合 `throw/try/catch` 使用，本身不会导致进程崩溃。Swift 运行时崩溃则来自不可恢复的运行时检查失败，例如强制解包 `nil`、数组越界、`as!` 转换失败、`fatalError()`、`preconditionFailure()` 等。现代 ARM64 真机上，Swift 这类崩溃多表现为 `EXC_BREAKPOINT (SIGTRAP)`，因为运行时会执行 `brk` 指令；模拟器或旧环境中也可能看到 `EXC_BAD_INSTRUCTION (SIGILL)`。排查 Swift 崩溃时要重点看 `asi` 里的 `Fatal error` 文案、Swift runtime 前几帧和符号化后的业务调用点。

### 7. 崩溃采集系统应该采集哪些信息？为什么通常下次启动再上报？

一份可用于线上定位的崩溃报告至少要包含四类信息。第一类是崩溃本身：异常类型、信号、异常码、故障地址、触发线程、寄存器状态、所有线程的原始调用栈。第二类是符号化所需信息：所有 dyld image 的名称、UUID、加载基址、大小、架构和 slide，因为没有这些信息就无法把地址映射回 dSYM。第三类是环境信息：App 版本、build、bundle id、设备型号、系统版本、前后台状态、内存水位、启动时长、网络状态等。第四类是业务上下文：用户操作面包屑、页面路由、关键接口、实验分组、功能开关、最近日志等。崩溃时立即网络上报成功率很低，因为进程即将终止，运行时和锁状态可能已经损坏；更可靠的做法是在崩溃现场只用异步安全方式把最小必要现场写入本地文件或 mmap，下次启动检测到未上报报告后再解析、压缩、符号化或上传。这样既提高成功率，也避免在崩溃现场做复杂逻辑引发二次崩溃。

### 8. 堆栈回溯的原理是什么？Frame Pointer 回溯和 DWARF 回溯如何取舍？

函数调用时会形成一串栈帧，ARM64 下 `x29` 通常作为 Frame Pointer，指向当前栈帧中保存的上一帧 FP；`x30` 是 Link Register，保存返回地址。基于 Frame Pointer 的回溯就是从当前 `pc` 开始，读取当前 FP 对应栈帧中的返回地址，再沿着 `frame[0]` 找上一帧 FP，循环得到调用链。它实现简单、开销极低，适合崩溃现场和高频采样，但依赖编译器保留帧指针；Release 优化、叶子函数优化、内联函数、栈损坏都可能导致帧链断裂或缺帧。DWARF 回溯依赖 `__eh_frame` 或 Apple 的 `__unwind_info`，根据当前 PC 找到 FDE / compact unwind 信息，计算 CFA 并恢复上一帧寄存器，不要求 FP 链完整，对优化代码更可靠，但实现复杂、解析成本高。生产级 SDK 常用混合策略：先用 FP 快速回溯；发现帧链异常时切到 DWARF / compact unwind；崩溃现场尽量只记录原始 PC，离线再符号化。

### 9. 什么是符号化？`dSYM`、UUID、ASLR、Slide 和 Load Address 分别起什么作用？

符号化就是把崩溃日志中的十六进制地址转换成函数名、文件名和行号。Release 包通常会 strip 掉调试符号，符号信息保存在构建产物对应的 dSYM 中；每次构建都会生成新的 Mach-O UUID，崩溃日志里的 `slice_uuid` 或 `usedImages[].uuid` 必须和 dSYM 的 UUID 完全一致，否则无法正确符号化。ASLR 会让每次启动时镜像加载地址随机偏移，Slide 是实际加载地址相对编译时地址的偏移；崩溃日志中旧格式常给出运行时地址和 Binary Images 的 Load Address，新 `.ips` 里 `frames[].imageOffset` 已经是相对镜像基址的偏移。使用 `atos` 时，如果传的是运行时地址，需要 `-l <Load Address>`；如果传的是 `.ips` 的 `imageOffset`，通常可以 `-l 0`。工程上必须在 CI 发版时自动归档 dSYM，按 UUID 建索引，并上传到崩溃平台；dSYM 丢失时只能尝试从 Xcode Organizer、App Store Connect、CI 产物或崩溃平台找回，实在找不回再用相同 commit 近似重构建做函数级推断。

### 10. iOS 14+ 的 `.ips` 崩溃日志应该如何解析？关键字段有哪些？

iOS 14 以后很多 `.ips` 文件是双段 JSON：第一行是 Header JSON，后续是 Body JSON，不能把整份文件当成一个 JSON 直接解析。解析时首先看 Header 的 `bug_type`，它决定日志类型：`109` 是普通崩溃，`298` 是 JetsamEvent，`309` 常见于 Watchdog，`288` 是 CPU Resource Limit，`385` 是 Hang Report。普通崩溃 Body 中要重点看 `exception`、`termination`、`threads` 和 `usedImages`。`exception.type/signal/subtype/codes` 表示技术层面的异常；`termination.namespace/code/byProc/byPid` 表示最终是谁杀了进程，能区分 App 自身崩溃、系统强杀、Watchdog、用户强杀等；`threads` 里 `triggered` 标识触发线程，`threadState` 包含 `pc`、`lr`、`sp`、`fp`、`far`、`esr` 等寄存器；`usedImages` 提供镜像 UUID、架构、base、size 和 path，是离线符号化的依据。遇到 `EXC_CRASH (SIGABRT)` 时，还要看 `asi` 和 `lastExceptionBacktrace`，因为 Objective-C 未捕获异常的真正业务堆栈往往不在普通线程首帧里。

### 11. 如何根据 Exception Type 快速判断崩溃类型和排查方向？

`EXC_BAD_ACCESS` 通常表示非法内存访问，`subtype` 为 `KERN_INVALID_ADDRESS` 时多是未映射地址、野指针、对象释放后访问或空地址附近偏移；`KERN_PROTECTION_FAILURE` 表示地址存在但权限不对，例如写只读段或执行不可执行内存；arm64e 上的 `POINTER_AUTHENTICATION_FAILURE` 常提示指针被破坏或 PAC 校验失败。`EXC_CRASH (SIGABRT)` 多数是主动 `abort()`，重点看是否为未捕获 `NSException`、C++ exception、断言失败或业务主动终止。`EXC_BAD_INSTRUCTION (SIGILL)` 和 `EXC_BREAKPOINT (SIGTRAP)` 经常与 Swift 运行时 trap、`fatalError`、`precondition`、强制解包、数组越界有关。`EXC_RESOURCE` 是资源超限，`MEMORY` 子类要联动 Jetsam / OOM，`CPU`、`WAKEUPS`、`IO` 很多时候是性能预警而非传统崩溃。`EXC_GUARD` 表示系统守护对象被非法使用，例如错误关闭 fd、Mach Port 或非持有方解锁。真正排查时不能只看 Exception Type，还要结合 `termination.namespace`、触发线程首帧、`far`、`vmRegionInfo`、`asi` 和业务上下文。

### 12. 寄存器在崩溃分析中有什么价值？如何用 `pc`、`lr`、`far`、`x0~x7` 定位问题？

触发线程的寄存器是崩溃现场最接近真相的信息。`pc` 是程序计数器，指向崩溃时正在执行的指令，通常对应 `frames[0]`；如果 `pc` 位于 `objc_msgSend`、`objc_release`、`swift_retain` 等 runtime 函数，问题往往不是系统库本身，而是传入的对象或引用计数状态有问题。`lr` 是链接寄存器，保存上一级返回地址，当调用栈缺帧时可以辅助恢复 `frames[1]`。`far` 是 Fault Address Register，`EXC_BAD_ACCESS` 时表示被访问的非法地址；`0x0`、`0x8`、`0x10`、`0x20` 这类接近 0 的地址通常意味着空对象附近的成员偏移或对象布局异常，随机高地址更像野指针，`0x5555...`、`0xAAAA...` 等模式值常指向内存覆盖。ARM64 ABI 中 `x0~x7` 是前 8 个参数；Objective-C 消息发送里 `x0` 是 `self`，`x1` 是 `_cmd`，`x2` 起是方法参数。给 `nil` 发普通 OC 消息本身通常是安全的，所以看到 `objc_msgSend` 崩溃时，需要结合 `x0` 是否为 0、是否为已释放对象地址、`x1` 是否为合理 selector、`far` 和上一级业务帧综合判断。

### 13. Watchdog 崩溃如何识别和治理？

Watchdog 是 iOS 为保证应用响应性设置的看门狗机制，常见于启动、前后台切换、挂起、终止、后台任务等生命周期阶段超时。日志中常见特征是 `bug_type = 309`，`termination.namespace` 为 `FRONTBOARD`、`RUNNINGBOARD` 或旧系统的 `SPRINGBOARD`，`termination.code` 为 `0x8BADF00D`，有时 `subtype` 会出现 `LAUNCH_HANG`，后台任务超时还可能看到类似 `0xBADA5E47` 的终止码。它不是普通 Mach/Signal 崩溃，很多时候是系统因为主线程长时间不响应而杀进程。治理思路是围绕生命周期关键路径做耗时拆解：启动阶段减少同步 I/O、同步网络、数据库迁移、大量图片解码和主线程初始化；进入后台时及时结束任务、释放系统资源；用 RunLoop 卡顿监控在事故前持续记录主线程堆栈快照；灰度时单独看启动耗时、卡顿率和 Watchdog 数量。Watchdog 还要从 OOM 排除法中单独剥离，否则会把前台卡死误判成 FOOM。

### 14. OOM 和普通崩溃有什么不同？为什么说 OOM 需要事前监控？

普通崩溃通常有异常类型、信号、触发线程和堆栈，App 还有机会在崩溃处理器中记录部分现场；OOM 是系统的 Jetsam 机制因为进程 `phys_footprint` 超限或整机内存压力过大而直接杀进程，App 在被杀瞬间通常没有执行代码的机会，也不会产生标准线程堆栈。因此 OOM 归因必须依赖事前和事后的证据链。事前要持续记录 `phys_footprint`、`os_proc_available_memory()`、内存压力比例、大内存分配、页面泄漏、图片解码尺寸、缓存规模和关键业务路径；事中在水位达到阈值或收到内存警告时把 Memory Dump 持续落盘；事后下次启动结合未正常退出标记、是否有普通崩溃日志、App/OS 是否升级、是否 Watchdog、是否低电量、上次前后台状态和上次内存水位判断 FOOM / BOOM。iOS 14+ 可以用 MetricKit 辅助获取部分 OOM / 退出原因，研发和客诉场景可以结合 JetsamEvent 原始日志做更精确归因。

### 15. JetsamEvent 日志怎么看？如何根据它判断 OOM 根因？

JetsamEvent 是系统生成的内存强杀快照，`bug_type = 298`，不是单个 App 的崩溃日志，而是一次整机 Jetsam 事件的内存画像。它没有线程堆栈，但有 `reason`、`pageSize`、`memoryStatus` 和 `processes`。第一步看 `reason`：`per-process-limit` 表示单进程超过自己的 `phys_footprint` 限额，重点查本进程；`vm-pageshortage` 表示整机物理页不足，可能是系统按优先级清理；`fc-thrashing` 指文件缓存颠簸；`vnode-limit` 指 vnode / fd 资源过多；`idle-exit` 属于正常后台空闲退出，不应算 OOM。第二步在 `processes` 里找 `reason` 非空的条目，那个才是被杀进程，`largestProcess` 不一定等于被杀对象。第三步用 `rpages × pageSize / 1024 / 1024` 换算当时 footprint，并结合 `states` 判断 FOOM（`frontmost`）还是 BOOM（`background/suspended`）。第四步看 `coalition`，主 App、WebKit 子进程和 Extension 可能共享 coalition 账本，同组兄弟进程也可能是真正大户。最后看 `memoryStatus.memoryPages.free/compressor/anonymous/fileBacked/wired` 判断是 App 堆内存、文件缓存、压缩池还是内核占用压力。

### 16. Memory Dump 在 OOM 治理中解决什么问题？实现时有哪些关键点？

排除法、MetricKit 和 JetsamEvent 能告诉你“可能发生了 OOM”和“当时占用了多少内存”，但不能直接告诉你“哪段代码分配的对象还活着”。Memory Dump 的目标是在运行期持续记录存活对象及其分配堆栈，内存触顶、收到 Memory Warning、进入后台或达到水位阈值时，把存活对象表、堆栈表、镜像列表和内存上下文落盘，下次启动上报分析。典型实现会 hook `malloc_logger` 和 `__syscall_logger` 捕获 `malloc/calloc/realloc/free`、`vm_allocate/mmap` 等分配释放事件，记录 `ptr -> size -> stack_id`；回调里不能再次 malloc 或调用 Foundation，所以要用无锁 ring buffer、预分配结构和异步处理线程。为降低开销，堆栈只记录原始 PC，离线符号化；存活对象表避免节点级 malloc；大量相似堆栈可做后缀压缩；核心数据通过 mmap 落盘，防止 OOM 瞬间丢失。分析时按类名、对象数、总字节、Top 分配堆栈、Caller1 + Caller2 + Category 聚合，重点找大图、无界缓存、页面泄漏、循环引用和单堆栈大分配。

### 17. 常见 Objective-C 崩溃如何防护？防崩溃 SDK 的边界在哪里？

常见 OC 崩溃包括数组 / 字符串越界、字典插入 `nil`、`unrecognized selector`、KVO 重复移除或释放前未移除、可变集合多线程读写、野指针、枚举时修改集合等。防护方式可以分为业务修复和运行时兜底：业务层应做边界检查、参数校验、生命周期管理、线程同步和 Swift 可选安全访问；兜底层可以用 Method Swizzling 给 `NSArray`、`NSMutableDictionary`、`NSString` 等类族添加安全方法，对消息转发提供空实现桩对象，对 KVO 做 proxy 封装，记录异常但避免进程退出。边界在于防护不是根因修复：吞掉越界可能隐藏数据错误，消息转发兜底可能让业务状态继续污染，Swizzling 私有类族有系统版本兼容风险，多 SDK swizzle 顺序也可能冲突。因此线上防护要谨慎灰度，所有被拦截的问题必须上报，按影响用户数治理；核心链路宁可失败可见，也不要无声吞错导致资金、数据或状态错误。

### 18. 线上崩溃治理应该看哪些指标？如何做聚合、报警、灰度和回滚？

稳定性指标优先看崩溃用户率，即发生崩溃的用户数 / 活跃用户数，因为它比崩溃次数率更能反映用户受影响面；同时可以辅助看崩溃次数率、Session 崩溃率、FOOM / BOOM、Watchdog、启动崩溃率、新增崩溃数和版本分布。聚合时不要只按完整堆栈字符串，要提取崩溃类型、信号、异常码、触发线程 top N 帧、相对地址、业务版本和设备维度生成稳定 fingerprint；对 `UserForceQuit`、`idle-exit`、部分系统强杀要过滤或单独归类。报警要区分总崩溃率超过阈值、新版本新增高频崩溃、特定机型 / 系统集中爆发、灰度版本相对基线劣化。修复流程应是：发现 -> 符号化 -> 定位根因 -> 修复和回归 -> 小流量灰度 -> 观察崩溃率、用户反馈和新类型 -> 扩大灰度 -> 全量。iOS 不能依赖传统动态代码热修复，合规手段主要是服务端功能开关、配置降级、接口绕行、关闭实验、紧急发版和 App Store 加急审核。

### 19. 如果拿到的崩溃日志没有符号或 dSYM 丢失，应该怎么办？

有地址但未符号化时，先从日志 Header、`usedImages` 或 Binary Images 找到 App 二进制 UUID、架构和 Load Address，再用 `dwarfdump --uuid` 校验本地或平台上的 dSYM 是否匹配；匹配后用 `atos`、`symbolicatecrash`、Xcode Organizer 或崩溃平台重新符号化。如果 dSYM 丢失，第一优先级是找回：查 Xcode Archives、CI/CD 构建产物、内部 dSYM 仓库、App Store Connect 下载的 dSYM（尤其历史 Bitcode 版本）、Firebase / Bugly / Sentry 等平台存档。确认找不回时，仍可做兜底分析：用崩溃地址减 Load Address 得到相对偏移，在相同 release tag、相同编译参数下重构建一份近似 dSYM 做函数级定位；符号化系统库帧反推业务入口；结合面包屑、路由日志、接口日志、版本分布和机型分布缩小范围；按崩溃类型 + top 地址指纹聚合高频问题。长期机制是 CI 每次 Archive 后自动上传和归档 dSYM，按 UUID 建索引，发版前校验所有架构和动态库符号是否齐全。

### 20. 调试器会如何影响崩溃捕获和崩溃表现？

LLDB 本身会在 Task 级别注册 Mach 异常端口，因此调试状态下异常通常先被调试器截获，再由调试器决定是否停止、通知或传递给进程。这会带来几个现象：断点类 `EXC_BREAKPOINT` 在线上是崩溃，在调试器下可能只是停住；Watchdog 在调试时可能被系统放宽或禁用，启动超时不一定复现；调试器、Zombie、Sanitizer 会改变内存布局和释放行为，野指针可能消失或变成更早暴露；LLDB 的信号处理策略也会影响自定义 Signal Handler 是否执行。排查时可以用 `process handle` 查看和修改信号策略，例如让某些信号继续传递给进程。崩溃 SDK 也应检测是否被调试，避免和 LLDB 抢异常端口；本地复现时要区分“调试器下的停顿”和“脱离调试器后的真实线上终止”。
