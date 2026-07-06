+++
title = "崩溃日志解读"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 24
tags = ["iOS", "性能优化", "稳定性", "崩溃"]
categories = ["iOS开发", "性能优化", "稳定性"]
+++
iOS 崩溃日志（`.ips` / 老版 `.crash`）是排查线上问题的一手证据。它不仅记录了"谁崩了"，更隐藏着**异常类型、终止命名空间、寄存器现场、线程堆栈、二进制映射、资源限额**等多维度事实。看懂每一个字段，才能把"不能复现"的崩溃拆成"寄存器 x0 是 nil 的后果"这种可复现假设。

本文聚焦系统生成的崩溃日志本身：格式演变、`bug_type` 全景、Header/Body 逐字段、Exception Type / Termination Namespace 深度解读、寄存器视角、符号化工具链、实战案例库、自动化脚本。OOM 专用的 JetsamEvent 日志见 [JetsamEvent 日志解读](./JetsamEvent日志解读.md)；崩溃采集与治理方法论见 [崩溃-采集](./崩溃-采集.md)、[崩溃-治理](./崩溃-治理.md)。

---

## 1. `.ips` / `.crash` 格式演变

iOS 的崩溃日志格式几经迭代：

| 时代 | 文件扩展名 | 格式 | 说明 |
|------|-----------|------|------|
| iOS 13 及以前 | `.crash` / `.ips` | 类 plist 纯文本 | Key-Value 混排，人眼可读但难解析 |
| iOS 14+ | `.ips` | **双段 JSON**（Header JSON + Body JSON，以换行分隔） | 机器可解析，字段更标准化 |
| Xcode Organizer 导出 | `.crash` | 纯文本渲染视图 | 由 `.ips` 通过 `CrashReporter.framework` 渲染而来 |

解析规则和 JetsamEvent 完全一致——第一行是 Header JSON，剩余部分是 Body JSON，不能整体 parse。iOS 14+ `.ips` 内容可用 `log show --archive` 或 Xcode Organizer 转为旧式可读文本，但**字段原始数据始终在 JSON 里**。

获取路径：

| 场景 | 路径 |
|------|------|
| 真机 | 设置 → 隐私与安全性 → 分析与改进 → 分析数据，文件名通常是 `<bundleID>-<timestamp>.ips` |
| Xcode | Window → Devices and Simulators → View Device Logs；或 Organizer → Crashes |
| sysdiagnose | 解压后 `crashes_and_spins/*.ips` |
| 线上 | 走 `MetricKit`（`MXCrashDiagnostic`，iOS 14+）或第三方 SDK 上报 |

---

## 2. `bug_type` 全景速查

`bug_type` 是 Header JSON 里最关键的分型字段，**决定了 Body 的字段模型**，必须先读 `bug_type` 再决定怎么解析：

| `bug_type` | 含义 | Body 特征 | 对应文章 |
|-----------|------|-----------|---------|
| `109` | **普通崩溃**（Mach 异常 / Unix 信号 / NSException） | 有 `exception`、`threads`、`usedImages` | 本文 |
| `298` | **JetsamEvent**（内存相关强杀） | 无线程堆栈，有 `memoryStatus`、`processes` | [JetsamEvent 日志解读](./JetsamEvent日志解读.md) |
| `288` | CPU Resource Limit（CPU 超限警告，非崩溃） | `EXC_RESOURCE` 子类为 `CPU` | 本文 §5.5 |
| `211` | **109-fold**：同一 App 多个 `109` 聚合 | 多个崩溃合并 | 解析时拆分成多个 109 处理 |
| `309` | **Watchdog 超时** | 有 `reason`，含 `0x8BADF00D` 字样 | 本文 §6 |
| `385` | Hang Report（卡顿超阈值但未被 Watchdog 杀） | 含主线程采样 | 属于卡顿范畴，不在本文 |

**判定顺序建议**：先读 Header `bug_type`，不是 `109` / `309` / `288` 的直接交给专用解析器（`298` → Jetsam、`385` → Hang）。

---

## 3. Header 段字段详解

```json
{
  "app_name": "MyApp",
  "timestamp": "2025-03-11 22:14:05.00 +0800",
  "app_version": "8.23.0",
  "slice_uuid": "c3e6b3a1-0f2a-4fb2-9c88-aaaa11112222",
  "build_version": "82300",
  "platform": 2,
  "bundleID": "com.example.MyApp",
  "share_with_app_devs": 1,
  "is_first_party": 0,
  "bug_type": "109",
  "os_version": "iPhone OS 17.4 (21E219)",
  "roots_installed": 0,
  "incident_id": "8D2E5A9B-...",
  "name": "MyApp"
}
```

| 字段 | 含义 | 实战作用 |
|------|------|---------|
| `bug_type` | 见 §2 | 分流解析器 |
| `app_name` / `bundleID` | 进程名 / Bundle ID | 与自家 App 匹配 |
| `app_version` + `build_version` | 版本号 + build 号 | 对比是否在灰度范围内 |
| `slice_uuid` | 当前切片二进制的 UUID | **符号化的关键**，必须与 dSYM 的 UUID 一致 |
| `os_version` | 系统版本 + build | 排查 iOS 版本专属崩溃 |
| `incident_id` | 崩溃唯一 ID | 与 MetricKit / 后端去重 |
| `platform` | 设备平台码（2 = iOS，4 = tvOS，6 = macOS Catalyst） | 跨端 App 识别 |
| `timestamp` | 崩溃时刻（设备本地时区） | 归因时间线 |

> `slice_uuid` 与 `usedImages[0].uuid` 是同一个值，用于"为这个二进制查对应的 dSYM"。多次构建的同一份代码 UUID 都不一样，**dSYM 丢了就符号化不了**。

---

## 4. Body 段骨架

```json
{
  "uptime": 280000,
  "procLaunch": "2025-03-11 22:10:03.0000 +0800",
  "procRole": "Foreground",
  "version": 2,
  "userID": 501,
  "deployVersion": 210,
  "modelCode": "iPhone14,5",
  "coalitionID": 1572,
  "osVersion": { "train": "iPhone OS", "build": "21E219", "releaseType": "User" },
  "captureTime": "2025-03-11 22:14:05.123 +0800",
  "incident": "...",
  "pid": 871,
  "cpuType": "ARM-64",
  "procName": "MyApp",
  "procPath": "/private/var/containers/Bundle/Application/.../MyApp.app/MyApp",
  "bundleInfo": { "CFBundleShortVersionString": "8.23.0", "CFBundleVersion": "82300", "CFBundleIdentifier": "com.example.MyApp" },
  "storeInfo": { "deviceIdentifierForVendor": "...", "thirdParty": true },
  "parentProc": "launchd",
  "parentPid": 1,
  "coalitionName": "com.example.MyApp",
  "crashReporterKey": "xxxx",
  "responsiblePid": 871,
  "exception": { "codes": "0x0000000000000001, 0x0000000000000010", "rawCodes": [1, 16], "type": "EXC_BAD_ACCESS", "signal": "SIGSEGV", "subtype": "KERN_INVALID_ADDRESS at 0x0000000000000010" },
  "termination": { "flags": 0, "code": 11, "namespace": "SIGNAL", "indicator": "Segmentation fault: 11", "byProc": "exc handler", "byPid": 871 },
  "vmRegionInfo": "0x10 is not in any region. ...",
  "faultingThread": 0,
  "threads": [ ... ],
  "usedImages": [ ... ],
  "sharedCache": { "base": ..., "size": ..., "uuid": "..." },
  "vmSummary": "ReadOnly portion of Libraries: Total=...",
  "legacyInfo": { "threadTriggered": { "queue": "com.apple.main-thread" } },
  "logWritingSignature": "...",
  "trialInfo": { "rollouts": [...], "experiments": [...] },
  "asi": { "libsystem_c.dylib": ["abort() called"] },
  "lastExceptionBacktrace": [ ... ]
}
```

逐字段解读如下：

### 4.1 进程与环境

| 字段 | 说明 |
|------|------|
| `pid` / `parentPid` | 进程/父进程 ID |
| `procRole` | `Foreground` / `Background` / `Non-UI` / `Daemon`；判断 FOOM vs BOOM 的依据 |
| `coalitionID` / `coalitionName` | coalition 组，主 App 与 WebContent、扩展通常同组（见 [JetsamEvent §6.3](./JetsamEvent日志解读.md)） |
| `uptime` | 设备开机到崩溃的秒数 |
| `procLaunch` | 进程启动时刻，`captureTime - procLaunch` 即进程存活时长；≤ 20s 强相关启动崩溃 |
| `responsiblePid` | 真正"负责"这次崩溃的进程，XPC 场景下可能指向调用方 |
| `modelCode` | 设备型号码，如 `iPhone14,5` = iPhone 13 |

### 4.2 `exception` 子对象

```json
"exception": {
  "type": "EXC_BAD_ACCESS",
  "signal": "SIGSEGV",
  "subtype": "KERN_INVALID_ADDRESS at 0x0000000000000010",
  "codes": "0x0000000000000001, 0x0000000000000010",
  "rawCodes": [1, 16]
}
```

| 字段 | 含义 |
|------|------|
| `type` | Mach 异常类型：`EXC_BAD_ACCESS` / `EXC_BAD_INSTRUCTION` / `EXC_CRASH` / `EXC_BREAKPOINT` / `EXC_RESOURCE` / `EXC_GUARD` 等 |
| `signal` | 被 Mach 转换后的 Unix 信号：`SIGSEGV` / `SIGBUS` / `SIGABRT` / `SIGILL` / `SIGTRAP` / `SIGFPE` 等 |
| `subtype` | Mach 子类，形如 `KERN_INVALID_ADDRESS at 0x...`、`POINTER_AUTHENTICATION_FAILURE`、`MEMORY at 0x...`（资源类）|
| `codes` | 两个 64 位十六进制码：`(code0, code1)`，语义随异常类型变化（详见 §5） |
| `rawCodes` | `codes` 的十进制数组形式 |

### 4.3 `termination` 子对象

```json
"termination": {
  "namespace": "SIGNAL",
  "code": 11,
  "indicator": "Segmentation fault: 11",
  "byProc": "exc handler",
  "byPid": 871
}
```

| `namespace` | 含义 | 常见 `code` |
|------------|------|-------------|
| `SIGNAL` | 普通 Unix 信号 | `11` SIGSEGV、`6` SIGABRT、`5` SIGTRAP、`9` SIGKILL |
| `CODESIGNING` | 代码签名失败 | `1` 被 AMFI 拒签 |
| `JETSAM` | 内存强杀 | 见 JetsamEvent |
| `FRONTBOARD` | FrontBoard 杀进程 | `0xBADA5E` = 启动超时、`0x8BADF00D` = Watchdog、`0xDEAD10CC` = 持有系统资源退到后台、`0xC00010FF` = CPU 过热、`0xBAADCA11` = 来电处理失败 |
| `RUNNINGBOARD` | iOS 13+ 后台任务超时 | `0xDEAD10CC` 变体、`0x8BADF00D` 变体 |
| `SPRINGBOARD` | SpringBoard 强杀 | 老版 iOS 遗留 |
| `NAMESPACE_NONE` | 无命名空间（显式 `abort`/`exit`） | 等同 SIGNAL |

**`termination.namespace` 是判定"谁杀的"核心字段**，比 `exception.signal` 更能区分"App 自己崩了"还是"被系统杀了"。

### 4.4 `threads` 数组

```json
"threads": [
  {
    "triggered": true,
    "id": 42813,
    "name": "com.apple.main-thread",
    "queue": "com.apple.main-thread",
    "threadState": {
      "x": [ { "value": 0 }, { "value": 0x1000012d4 }, ... ],
      "pc": { "value": 0x00000001a4d238d0, "symbolLocation": 16, "symbol": "objc_msgSend" },
      "lr": { "value": 0x0000000100001240 },
      "sp": { "value": 0x000000016fdff000 },
      "fp": { "value": 0x000000016fdff010 },
      "cpsr": { "value": 0x60001000 },
      "far": { "value": 0x10 },
      "esr": { "value": 0x92000006, "description": "(Data Abort) byte read Translation fault" },
      "flavor": "ARM_THREAD_STATE64"
    },
    "frames": [
      { "imageOffset": 4816, "symbol": "objc_msgSend", "symbolLocation": 16, "imageIndex": 42 },
      { "imageOffset": 17460, "imageIndex": 0 },
      ...
    ]
  }
]
```

| 字段 | 说明 |
|------|------|
| `triggered` | 是否为崩溃触发线程（对应老格式的 "Crashed Thread"） |
| `name` / `queue` | 线程名 / GCD 队列；`com.apple.main-thread` = 主线程 |
| `threadState` | **仅触发线程有完整寄存器**，其他线程只有 frames |
| `threadState.x[]` | 通用寄存器 `x0 ~ x28`，数组下标即寄存器号 |
| `threadState.pc` | 程序计数器，**崩溃那条指令的地址** |
| `threadState.lr` | 链接寄存器，下一级返回地址；帮忙恢复调用栈 |
| `threadState.sp` / `fp` | 栈指针 / 帧指针 |
| `threadState.far` | **Fault Address Register**，EXC_BAD_ACCESS 时即为被访问的非法地址 |
| `threadState.esr` | Exception Syndrome Register，带人类可读的 `description` |
| `frames[]` | 堆栈帧，`imageOffset + imageIndex` 指向 `usedImages` 数组里的二进制 |

> 关键技巧：符号化时只要 `imageIndex` → `usedImages[index]` 找 UUID 和加载基址，加上 `imageOffset` 就能 `atos -o <dSYM> -l 0 <offset>` 得到源码行号。**`-l 0` 是故意的**，因为 `imageOffset` 已经是"相对基址"的偏移。

### 4.5 `usedImages` 数组

```json
"usedImages": [
  {
    "source": "P",
    "arch": "arm64e",
    "base": 4370939904,
    "size": 1179648,
    "uuid": "c3e6b3a1-0f2a-4fb2-9c88-aaaa11112222",
    "path": "/private/var/containers/Bundle/Application/.../MyApp.app/MyApp",
    "name": "MyApp",
    "CFBundleShortVersionString": "8.23.0",
    "CFBundleVersion": "82300",
    "CFBundleIdentifier": "com.example.MyApp"
  },
  {
    "source": "S",
    "arch": "arm64e",
    "base": 7115022336,
    "size": 262144,
    "uuid": "...",
    "path": "/usr/lib/libobjc.A.dylib",
    "name": "libobjc.A.dylib"
  }
]
```

| 字段 | 含义 |
|------|------|
| `source` | `P` = Process 加载；`S` = 共享缓存里的系统库 |
| `arch` | `arm64` / `arm64e`（带 PAC 指针认证） |
| `base` / `size` | 加载基址 / 镜像大小（字节）|
| `uuid` | 二进制 UUID，**符号化对齐用** |
| `path` / `name` | 镜像路径 / 名称 |
| `CFBundle*` | 仅 App/Framework 有 |

### 4.6 其他辅助字段

| 字段 | 说明 |
|------|------|
| `vmRegionInfo` | `far` 地址所在的 VM region 描述，如 `not in any region`、`MALLOC_SMALL`、`__TEXT`——一眼看出是野指针还是只读区越写 |
| `vmSummary` | 进程 VM 统计概要，排查内存类问题 |
| `sharedCache` | dyld 共享缓存基址与 UUID，iOS 16+ 起必填 |
| `asi` | Additional Sub Info，很多系统库（libsystem_c、libdispatch）会写 abort 原因到这里，**排查 SIGABRT 必看** |
| `lastExceptionBacktrace` | **最后一个 NSException 的堆栈**，Objective-C 异常（NSInvalidArgumentException 等）的真正堆栈在这里，而不是 `threads[].frames` |
| `legacyInfo.threadTriggered.queue` | 触发线程所在的 GCD queue，比 thread name 更精确 |
| `trialInfo.experiments` / `rollouts` | Apple 系统实验 ID，iOS 自身灰度导致的崩溃可据此区分 |
| `logWritingSignature` | 用于 CrashReporter 自检 |

---

## 5. Exception Type 深度解读

### 5.1 `EXC_BAD_ACCESS`（SIGSEGV / SIGBUS）

非法访问内存，是最常见的 App 崩溃类型。

| `subtype` | 含义 | 典型根因 |
|-----------|------|---------|
| `KERN_INVALID_ADDRESS at 0x...` | 访问了未映射的地址 | 野指针、over-release、栈溢出 |
| `KERN_PROTECTION_FAILURE at 0x...` | 地址有效但权限不对（只读写、XN 执行非执行） | 写常量字符串、执行数据段 |
| `POINTER_AUTHENTICATION_FAILURE` | arm64e PAC 校验失败 | 指针被篡改（大概率是野指针覆盖）、Swap 实现错 |

`codes` 两位含义（kern_return_t）：

- `code0 = 1`（`EXC_I386_GPFLT` / `KERN_INVALID_ADDRESS`）
- `code1` = 被访问的 fault address（和 `threadState.far` 相等）

**排查步骤**：

1. 看 `subtype` 里的地址：
   - `0x0` / `0x10` / `0x20`：`nil` 上调 `objc_msgSend`，偏移是 isa/成员指针的偏移
   - `0x00000001xxxxxxxx`：随机地址，大概率野指针
   - `0x5555555555555555` / `0xAAAAAAAAAAAAAAAA` 等：内存覆盖标志位
2. 看 `threadState.pc` 所在函数：
   - `objc_msgSend` / `objc_release` / `objc_autoreleasePoolPop`：OC 对象生命周期问题
   - `_swift_release` / `swift_retain`：Swift 引用计数
3. 看 `vmRegionInfo`：是否"not in any region"（野指针）或落在 `__TEXT` / `MALLOC_*` 不同区域

### 5.2 `EXC_CRASH (SIGABRT)`

进程主动 `abort()`，80% 场景是**未捕获的 NSException**。

- 必看 `lastExceptionBacktrace`（OC 异常堆栈）
- 必看 `asi` 里 `libsystem_c.dylib` / `CoreFoundation` 的说明文字，例如：

  ```text
  *** Terminating app due to uncaught exception 'NSInvalidArgumentException',
  reason: '-[__NSCFString objectForKey:]: unrecognized selector sent to instance 0x...'
  ```

- 若 `asi` 无 NSException 但有 Swift：大概率是 `fatalError` / `precondition` / `assert`，见 §5.4
- 若 `asi` 完全空白：可能是主动调用 `abort()`（如 Sentry 抓到 `mach_msg` 自杀），看 `termination.byProc`

### 5.3 `EXC_BAD_INSTRUCTION` (SIGILL)

执行了非法指令。Swift 崩溃大多走这里：

- Swift 强制解包失败（`!` on nil）
- `as!` 强制类型转换失败
- 数组越界（Swift runtime 触发 `Trap`）
- `fatalError` / `preconditionFailure`

对应 `asi` 通常有如 `Fatal error: Unexpectedly found nil while unwrapping an Optional value` 一行。

### 5.4 `EXC_BREAKPOINT` (SIGTRAP)

软件断点。Swift runtime 在遇到 `precondition`、整数溢出（`Int + Int` 越界）、`guard fatalError` 时会 `brk #1` 触发此异常。

- `codes = (0x1, <addr>)`，`addr` 是 `brk` 指令地址
- `asi` 里会带 Swift runtime 的原因字符串
- 调试器连着时也会经常触发，需要结合 `termination.byProc = "exc handler"` 判断是否线上真实崩溃

### 5.5 `EXC_RESOURCE`

**资源超限警告**，可能是崩溃也可能只是警告（取决于子类和 flavor）：

| `subtype` 开头 | 含义 | `bug_type` |
|---------------|------|------------|
| `MEMORY` | 内存超过 `phys_footprint` 限额 | 常同时产生 JetsamEvent（298） |
| `CPU` | CPU 使用超限 | `288`，多数情况下不会杀进程，只是警告 |
| `WAKEUPS` | 单位时间唤醒过多 | 不杀进程，指引优化 |
| `IO` | I/O 过多 | 不杀进程 |
| `THREADS` | 线程数超限 | 少见，扩展类进程可能命中 |

> `EXC_RESOURCE` 本身不一定致命，`bug_type = 288` 的可以在 Xcode Organizer 的 *Disk Writes / Hangs / CPU* 标签页看到，属于**性能预警**而非崩溃。

### 5.6 `EXC_GUARD`

"守护对象"被违规使用。常见子类：

- `GUARD_TYPE_FD`：`close` 了一个被标记守护的 fd（如 libdispatch 内部的 eventfd）
- `GUARD_TYPE_VN` / `GUARD_TYPE_MACH_PORT`：守护 vnode / mach port 被关闭
- `GUARD_TYPE_USER`：`os_unfair_lock` 被非持有方解锁

大多源于 **文件描述符使用混乱**（在错误的线程 close、被 libdispatch 接管的 fd 被业务代码 close）。

### 5.7 快速分类速查表

| 看到这个 | 第一反应 | 下一步 |
|---------|---------|--------|
| `EXC_BAD_ACCESS + KERN_INVALID_ADDRESS at 0x10~0x30` | nil 消息或对象布局越位 | 检查 `pc` 在不在 `objc_msgSend` |
| `EXC_BAD_ACCESS + 0x5555/0xAAAA pattern` | 内存被覆盖 | 开 Address Sanitizer / MallocStackLogging |
| `EXC_CRASH + SIGABRT` | NSException / C++ exception / assert | 看 `lastExceptionBacktrace` + `asi` |
| `EXC_BAD_INSTRUCTION` + Swift 符号 | Swift 强制解包 / fatalError | 看 `asi` 里的 Fatal error |
| `EXC_BREAKPOINT` + Swift | precondition / 整数溢出 | 看 Swift runtime 前 1–2 帧 |
| `EXC_RESOURCE MEMORY` | OOM 预警 | 同时查 JetsamEvent |
| `EXC_GUARD GUARD_TYPE_FD` | fd 被错误 close | 审计 libdispatch / flock 使用 |

---

## 6. Termination Namespace 深度解读

`exception` 负责"技术上发生了什么"，`termination` 负责"最终谁决定杀这个进程"。两者一起看才能定性。

### 6.1 `FRONTBOARD` / `RUNNINGBOARD` 特殊码

iOS 用几个"魔法码"表达各种系统强杀原因，出现在 `termination.code`（或老版日志的 reason 里）：

| 魔法码 | 十进制 | 含义 | 典型原因 |
|--------|-------|------|---------|
| `0x8BADF00D` | 2343432205 | "ate bad food" → **Watchdog 超时** | 启动/挂起/恢复/UIScene 生命周期中主线程卡死 |
| `0xBADA5E` | 12231262 | "bad ass" → **启动超时** 的一种变体 | Launch 阶段未在规定时间内完成 |
| `0xDEAD10CC` | 3735883980 | "dead lock" → **持有系统资源退到后台** | App 后台仍持有 AddressBook/Keychain/CloudKit 资源 |
| `0xC00010FF` | 3221229823 | "cool off" → **CPU/温度过热** | 前台长时间高 CPU，系统温控降频并强杀 |
| `0xBAADCA11` | 3131174417 | "bad call" → **来电/PushKit 处理失败** | PushKit VoIP 收到推送后未在规定时间内接起 |
| `0xBAD22222` | — | VoIP App 后台保活超限 | PushKit 频繁唤起但未通话 |
| `0xDEADFA11` | 3735943697 | **用户强杀**（上滑关闭） | 非本 App 问题，**不应算入崩溃率** |

**实战建议**：采集端解析 `termination.namespace + code` 后做白名单：

- `SIGNAL(9) SIGKILL` + `DEADFA11` → 用户强杀，不上报
- `JETSAM` → 导给 OOM 看板
- `FRONTBOARD 0x8BADF00D` → 导给 Watchdog 看板
- 其余 `FRONTBOARD/RUNNINGBOARD` → 单独"系统强杀"桶

### 6.2 `byProc` / `byPid`

- `byProc = "exc handler"` → 自家进程处理的异常（常规崩溃）
- `byProc = "launchd"` + `byPid = 1` → launchd 杀
- `byProc = "SpringBoard"` / `"backboardd"` → 系统 UI 杀进程
- `byProc = "runningboardd"` → iOS 13+ 生命周期裁判杀

---

## 7. 寄存器视角定位崩溃

触发线程的 `threadState` 是案发现场最精确的证据。按优先级读：

### 7.1 `pc` —— 案发指令

- 对应 `frames[0].imageOffset`，即崩溃发生的那条指令。
- 符号若在 `objc_msgSend` / `_objc_release` / `swift_retain` 等 runtime 库，通常是**消息接收者有问题**，而非 runtime 本身 bug。

### 7.2 `far` —— 被访问的非法地址

- 仅 `EXC_BAD_ACCESS` 有意义。
- `0x0`：消息发给 nil，被访问的是 isa（ABI 下 isa 偏移为 0）
- `0x8` / `0x10` / `0x18` / `0x20` / `0x28`：属性/成员偏移，说明对象已经被 free、但指针还在
- `0xXXXX0000` / `0x5555555555555555`：内存被覆盖的标志，开 MallocStackLogging + Zombie 排查

### 7.3 `x0 ~ x7` —— 入参寄存器

arm64 ABI 前 8 个参数放 `x0 ~ x7`，OC 里有固定语义：

| 寄存器 | OC 消息调用时的含义 |
|--------|---------------------|
| `x0` | `self`（消息接收者） |
| `x1` | `_cmd`（SEL 指针）|
| `x2` | 第一个参数 |
| `x3` | 第二个参数 |
| ... | ... |

案例：`pc` 在 `objc_msgSend`、`x0 = 0` → **这就是 nil 消息的确定性证据**；`x0 = <某野指针>`、`x1` 指向合理的 SEL → 则是**对已释放对象发消息**。

### 7.4 `lr` —— 上一级返回地址

- `frames[0]` 的地址来自 `pc`，`frames[1]` 的地址通常就是 `lr`；
- 当 `frames[1]` 缺失或可疑时，用 `lr` 反查上一级调用者能救回一层堆栈。

### 7.5 `cpsr` / `esr`

- `esr.description` 是 Apple 帮你翻译好的 "Data Abort" / "Instruction Abort" 描述，直接拿去搜。
- `cpsr` 里的 T/F/I 位偶尔有用于判断是否处于中断上下文。

---

## 8. 符号化工具链

符号化的本质：`（frame 的 imageOffset）+（usedImages[i] 的 UUID）→ dSYM → 源码文件:行号`。

### 8.1 必备前置

```bash
# 找 App 对应的 dSYM（按 slice_uuid 或 usedImages[0].uuid 查）
mdfind "com_apple_xcode_dsym_uuids == <UUID 大写>"

# 或者用 dwarfdump 确认 dSYM 与 .ips 的 UUID 一致
dwarfdump --uuid MyApp.app.dSYM
# UUID: C3E6B3A1-0F2A-4FB2-9C88-AAAA11112222 (arm64)  MyApp
```

### 8.2 单帧符号化（`atos`）

从 `frames[i]` 拿 `imageOffset`（十六进制），从 `usedImages[i]` 拿 `name`：

```bash
# -o 指向二进制（App binary 或 dSYM 里的 DWARF 文件都行）
# -arch 与 usedImages.arch 对齐
# -l 0 是关键：imageOffset 已经是相对基址的偏移
atos -o MyApp.app.dSYM/Contents/Resources/DWARF/MyApp \
     -arch arm64 -l 0 0x0000000000004434

# 输出：-[MyViewController loadData] (in MyApp) (MyViewController.m:187)
```

### 8.3 整份崩溃日志符号化

```bash
# iOS 14+ .ips（双段 JSON）
# 1. 用 Xcode 命令行工具 CrashSymbolicator 渲染
/Applications/Xcode.app/Contents/SharedFrameworks/CoreSymbolicationDT.framework/Resources/CrashSymbolicator.py \
    -d MyApp.app.dSYM -o symbolicated.ips crash.ips

# 2. 或者先转成老格式，再用 symbolicatecrash
# 导入 Organizer → 选中 → Show in Finder → 得到 .crash
/Applications/Xcode.app/Contents/SharedFrameworks/DVTFoundation.framework/Versions/A/Resources/symbolicatecrash \
    crash.crash MyApp.app.dSYM > symbolicated.crash
# ⚠️ 需要设置 DEVELOPER_DIR 环境变量：export DEVELOPER_DIR=`xcode-select -p`
```

### 8.4 系统库符号化（可选）

系统库符号表只有在**把崩溃时的设备连过 Xcode**后才会被 Xcode 下载到：

```text
~/Library/Developer/Xcode/iOS DeviceSupport/<版本号 (build)>/Symbols/
```

跨版本、非本人设备的崩溃日志，系统帧只能显示成 `???`。解决办法是保留多台真机、或者拿 sysdiagnose 连一次同版本系统设备。

### 8.5 Bitcode 时代遗留

iOS 14 之前 App Store 曾要求 Bitcode 上传，真实线上二进制由 Apple 重新编译，UUID 与本地 dSYM 不一致。需要从 Xcode Organizer → *Downloads* 下载 *Crashes 对应版本的 dSYMs*，这是和本地构建不同的一份。Xcode 14 起 Bitcode 已废弃，新项目不用担心。

---

## 9. 实战案例解读

### 案例 1：`objc_msgSend` on nil

```json
"exception": { "type": "EXC_BAD_ACCESS", "signal": "SIGSEGV",
               "subtype": "KERN_INVALID_ADDRESS at 0x0000000000000010" },
"threads": [{
  "triggered": true,
  "threadState": {
    "x": [{"value": 0}, {"value": 0x1de8aabcd}, ...],
    "pc": { "value": 0x1a4d238d0, "symbol": "objc_msgSend" }
  },
  "frames": [
    { "imageOffset": 16, "imageIndex": 42 /* libobjc */ },
    { "imageOffset": 17460, "imageIndex": 0 /* MyApp */ }
  ]
}]
```

**解读**：

- `far = 0x10` + `pc` 在 `objc_msgSend` + `x0 = 0` → 100% 确认是 **nil 上调方法**
- `x1 = 0x1de8aabcd` 指向共享缓存只读 `__objc_selrefs`，即 SEL 表，看 `atos -o <libobjc> 0x1de8aabcd` 能反出调的是哪个 SEL（例如 `dataSource`）
- 结合 `frames[1]` 符号化后得知是 `-[MyVC reloadTable]` 调了 `self.dataSource` → 结论：`dataSource` 已释放

### 案例 2：NSException 未捕获

```json
"exception": { "type": "EXC_CRASH", "signal": "SIGABRT", "codes": "0x0000000000000000, 0x0000000000000000" },
"termination": { "namespace": "SIGNAL", "code": 6, "indicator": "Abort trap: 6", "byProc": "exc handler" },
"asi": {
  "libc++abi.dylib": ["terminating with uncaught exception of type NSException"],
  "CoreFoundation": ["*** Terminating app due to uncaught exception 'NSRangeException', reason: '*** -[__NSArrayM objectAtIndex:]: index 5 beyond bounds [0 .. 2]'"]
},
"lastExceptionBacktrace": [
  { "imageOffset": 45320, "imageIndex": 18 /* CoreFoundation */ },
  { "imageOffset": 120384, "imageIndex": 22 /* libobjc */ },
  { "imageOffset": 9212, "imageIndex": 0 /* MyApp */ }
]
```

**解读**：

- `EXC_CRASH + SIGABRT` + `asi` 有 `uncaught exception` 字样 → OC 未捕获异常
- 真实业务堆栈在 `lastExceptionBacktrace` 而不是 `threads`
- `asi` 的 reason 字符串直接告诉你"数组越界：访问第 5 个，但只有 3 个" → 直接去找符号化后的 MyApp 帧即可

### 案例 3：Swift 强制解包

```json
"exception": { "type": "EXC_BREAKPOINT", "signal": "SIGTRAP" },
"asi": {
  "libswiftCore.dylib": ["Fatal error: Unexpectedly found nil while unwrapping an Optional value: file MyApp/MyVC.swift, line 87"]
}
```

**解读**：`asi` 直接包含文件名和行号，无需符号化即可定位。Swift 的 fatalError、precondition 也是这种模式。

### 案例 4：Watchdog 0x8BADF00D

```json
"bug_type": "309",
"exception": { "type": "EXC_CRASH", "signal": "SIGKILL",
               "codes": "0x0000000000000000, 0x0000000000000000",
               "subtype": "LAUNCH_HANG" },
"termination": { "namespace": "FRONTBOARD", "code": 2343432205,
                 "indicator": "<RBSTerminateContext ...>", "byProc": "frontboard", "byPid": 54 }
```

**解读**：

- `bug_type = 309` + `termination.namespace = FRONTBOARD` + `code = 0x8BADF00D`（十进制 2343432205）→ **Watchdog 超时**
- `subtype = LAUNCH_HANG` → 启动阶段 20s 内未完成
- 主线程堆栈常停在 `CFRunLoopServiceMachPort` 或业务同步网络调用；治理见 [崩溃-治理 §场景 4](./崩溃-治理.md#场景4无堆栈记录oom--watchdog--低电量等)

### 案例 5：OOM（EXC_RESOURCE + JetsamEvent 并发）

一个进程 OOM 通常产生**两份**日志：

1. `bug_type = 109`，`exception.type = EXC_RESOURCE`，`subtype = "MEMORY (Fatal) Footprint: ..."` → 有堆栈
2. `bug_type = 298`，JetsamEvent → 无堆栈，但有整机内存画像

实战价值在于把两者按 `incident_id` / `timestamp` 串起来：堆栈从 109 拿，整机归因从 298 拿。详见 [JetsamEvent 日志解读](./JetsamEvent日志解读.md)。

### 案例 6：用户强杀误报

```json
"termination": { "namespace": "SIGNAL", "code": 9, "byProc": "launchd", "byPid": 1 },
"exception":   { "type": "EXC_CRASH", "signal": "SIGKILL", "codes": "0x00000000deadfa11, ..." }
```

`codes` 首位 `0xDEADFA11` + `byProc = launchd` → 用户上滑杀 App。线上应**直接过滤**，否则会把"正常关 App"算成崩溃。

---

## 10. 自动化批量解析脚本

线上崩溃数量巨大，需要脚本做分型、过滤、聚合。

```python
import json, re
from pathlib import Path

def parse_ips(path: Path):
    text = path.read_text(encoding='utf-8')
    lines = text.split('\n', 1)
    if len(lines) < 2:
        return None
    header = json.loads(lines[0])
    body = json.loads(lines[1])

    bug_type = header.get('bug_type')
    result = {
        'file': path.name,
        'incident_id': header.get('incident_id'),
        'bug_type': bug_type,
        'app': header.get('bundleID'),
        'version': header.get('app_version'),
        'build': header.get('build_version'),
        'os': header.get('os_version'),
        'model': body.get('modelCode'),
        'captureTime': body.get('captureTime'),
        'procRole': body.get('procRole'),
    }

    if bug_type == '298':
        result['category'] = 'JetsamEvent'
        result['reason'] = body.get('reason')
        return result

    exc = body.get('exception', {}) or {}
    term = body.get('termination', {}) or {}
    result.update({
        'exc_type': exc.get('type'),
        'signal': exc.get('signal'),
        'subtype': exc.get('subtype'),
        'term_namespace': term.get('namespace'),
        'term_code': term.get('code'),
        'term_indicator': term.get('indicator'),
    })

    # 分类
    result['category'] = classify(result, body)

    # 触发线程首帧
    for th in body.get('threads', []):
        if th.get('triggered'):
            result['faulting_thread'] = th.get('name') or th.get('queue')
            top = (th.get('frames') or [])[:3]
            result['top_frames'] = [
                f"imageIndex={f.get('imageIndex')},offset={hex(f.get('imageOffset', 0))}"
                + (f" {f.get('symbol')}" if f.get('symbol') else '')
                for f in top
            ]
            break

    # NSException
    asi = body.get('asi') or {}
    for lines_ in asi.values():
        for line in lines_:
            if 'uncaught exception' in line.lower() or 'Fatal error' in line:
                result['asi_reason'] = line
                break

    return result

MAGIC_CODES = {
    2343432205: 'Watchdog (0x8BADF00D)',
    12231262:   'Launch hang (0xBADA5E)',
    3735883980: 'Background resource (0xDEAD10CC)',
    3221229823: 'Thermal (0xC00010FF)',
    3131174417: 'PushKit (0xBAADCA11)',
    3735943697: 'User force quit (0xDEADFA11)',
}

def classify(r, body):
    if r['exc_type'] == 'EXC_RESOURCE' and 'MEMORY' in (r['subtype'] or ''):
        return 'OOM'
    if r['term_namespace'] in ('FRONTBOARD', 'RUNNINGBOARD'):
        return MAGIC_CODES.get(r['term_code'], f'SystemKill-{r["term_namespace"]}')
    codes = (body.get('exception') or {}).get('codes', '')
    if 'deadfa11' in codes.lower():
        return 'UserForceQuit'
    if r['exc_type'] == 'EXC_BAD_ACCESS':
        return 'BadAccess'
    if r['exc_type'] == 'EXC_CRASH' and r['signal'] == 'SIGABRT':
        return 'NSException' if r.get('asi_reason') else 'Abort'
    if r['exc_type'] == 'EXC_BREAKPOINT':
        return 'SwiftTrap'
    if r['exc_type'] == 'EXC_BAD_INSTRUCTION':
        return 'BadInstruction'
    return 'Other'

if __name__ == '__main__':
    from collections import Counter
    stats = Counter()
    for p in Path('./crashes').rglob('*.ips'):
        try:
            r = parse_ips(p)
            if r:
                stats[r['category']] += 1
        except Exception as e:
            print('skip', p, e)
    for cat, n in stats.most_common():
        print(f'{cat:24s} {n}')
```

典型输出：

```text
BadAccess                523
NSException              310
UserForceQuit            201   <- 必须从崩溃率里剔除
SwiftTrap                187
Watchdog (0x8BADF00D)    86
OOM                      64
JetsamEvent              58
Thermal (0xC00010FF)     12
```

---

## 11. 与 MetricKit 字段映射

线上规模化采集推荐用 `MXCrashDiagnostic`（iOS 14+），字段和 `.ips` 完全同源：

| `.ips` 字段 | `MXCrashDiagnostic` 属性 |
|-------------|--------------------------|
| `exception.type` | `exceptionType`（NSNumber，Mach 异常编号）|
| `exception.signal` | `signal`（NSNumber，Unix 信号编号）|
| `termination.namespace` + `code` | `terminationReason`（字符串，如 `"Namespace SPRINGBOARD, Code 0x8badf00d"`）|
| `exception.subtype` | `exceptionCode`（仅 Mach code0）|
| `threads` / `frames` | `callStackTree`（JSON，结构略有差异）|
| `usedImages` | `callStackTree.callStacks[].callStackRootFrames.binaryUUID / offsetIntoBinaryTextSegment` |
| `metaData.applicationBuildVersion` | `metaData.applicationBuildVersion` |

自研 SDK 的字段命名建议向 `.ips` 对齐，跨源数据（真机拉取 / MetricKit / PLCrashReporter）就能共用同一套下游 pipeline。
