+++
title = "JetsamEvent 日志解读"
date = '2026-05-03T23:11:47+08:00'
draft = false
weight = 17
tags = ["iOS", "性能优化", "稳定性", "崩溃"]
categories = ["iOS开发", "性能优化", "稳定性"]
+++
JetsamEvent 是 iOS 唯一由系统官方生成、且专门记录"因内存原因终止进程"的日志。它不记录线程堆栈，却完整刻画了**发生强杀那一刻**整机的内存分布——这使它成为 OOM 归因、阈值建模、后台生命周期治理最权威的数据源。

本文聚焦 JetsamEvent 日志本身：存放位置、文件结构、字段含义、`reason` 类型、案例解读、自动化批量解析脚本，以及机型内存上限/iOS 版本差异等实战要点。OOM 监控治理的整体方法论见 [崩溃-治理](./崩溃-治理.md#8-oomout-of-memory崩溃)。

---

## 1. Jetsam 与 JetsamEvent 是什么

iOS 通过 XNU 内核的 `memorystatus` 子系统（俗称 Jetsam）做整机内存管理：

- 前台/后台进程按 Jetsam 优先级排序；
- 当系统整体可用物理页（`vm_page_free_count`）或单个进程 `phys_footprint` 触发阈值时，按优先级杀掉进程；
- 被杀时，内核在 `/var/mobile/Library/Logs/CrashReporter/` 生成 `JetsamEvent-yyyy-MM-dd-HHmmss.ips` 文件，并通过 `DiagnosticsReporting` 暴露给 *设置 → 隐私与安全性 → 分析与改进 → 分析数据*。

需要理解两个关键结论：

1. **JetsamEvent 不是单个进程的崩溃日志，而是整机一次 Jetsam 事件的快照。** 一个文件里往往包含几十个进程条目，只有其中一个（或少数）被真正杀掉；其余进程是作为"当时整机内存画像"被附带记录。
2. **JetsamEvent 不含线程堆栈。** 它的价值在于告诉你"谁占用了多少内存"和"为什么被杀"，而不是"在哪一行代码被杀"。堆栈需要由 App 自己的 Memory Dump / MetricKit 补齐。

---

## 2. 获取方式

| 场景 | 路径 |
|------|------|
| 真机设置页查看 | 设置 → 隐私与安全性 → 分析与改进 → 分析数据，文件名 `JetsamEvent-*.ips` |
| Xcode 连接真机 | Window → Devices and Simulators → 选中设备 → View Device Logs |
| sysdiagnose 包 | 解压后位于 `crashes_and_spins/*.ips` |
| 越狱设备 | `/var/mobile/Library/Logs/CrashReporter/JetsamEvent-*.ips` |
| 自动上报 | App 下次启动时扫描沙盒外的 Apple 日志目录不可行，只能依赖 `MetricKit` 的 `MXCrashDiagnostic`/`MXAppExitMetric`（iOS 14+） |

> ⚠️ iOS 沙盒下 App 无法直接读取 `/var/mobile/Library/Logs/` 的原始 ips 文件，线上规模化采集必须走 MetricKit。JetsamEvent 原始日志主要用于研发期抓真机、或用户反馈场景的手工分析。

---

## 3. 文件整体结构

iOS 14 起 `.ips` 统一为"**双段 JSON**"：

```text
{ header JSON，一行 }
{ body JSON，多行，JSON5 风格 }
```

解析时必须按换行把两段拆开后分别 `JSON.parse`，不能整体当作一个 JSON 解析。

### 3.1 Header 段关键字段

```json
{
  "app_name": "kernel_task",
  "timestamp": "2025-03-11 22:14:05.00 +0800",
  "app_version": "",
  "bug_type": "298",
  "os_version": "iPhone OS 17.4 (21E219)",
  "incident_id": "8D2E...",
  "name": "kernel_task"
}
```

| 字段 | 含义 |
|------|------|
| `bug_type` | `298` 即 JetsamEvent；`109` 是普通崩溃；`288` 是 CPU Resource Limit |
| `os_version` | 内含 build 号，用来定位 Jetsam 行为差异（iOS 14 vs 17） |
| `timestamp` | 事件发生时刻，时区为设备本地时区 |
| `incident_id` | 全系统唯一 ID，用于与 MetricKit 结果交叉对齐 |

**判定 JetsamEvent 的唯一标准是 `bug_type == 298`**，而不是文件名。

### 3.2 Body 段骨架

```json
{
  "crashReporterKey": "...",
  "kernel": "Darwin Kernel Version 23.4.0 ...",
  "product": "iPhone14,5",
  "incident": "...",
  "date": "2025-03-11 22:14:05.00 +0800",
  "build": "21E219",
  "timestamp": 764388845123,
  "genCount": 0,
  "reason": "per-process-limit",
  "pageSize": 16384,
  "largestProcess": "YourApp",
  "memoryStatus": { ... },
  "processes": [ { ... }, { ... } ]
}
```

---

## 4. Body 顶层字段详解

### 4.1 `pageSize`

最关键的一个数。JetsamEvent 里所有内存字段都以 **page**（而不是字节）为单位，真实字节数必须乘以 `pageSize`：

```text
真实占用（字节） = rpages × pageSize
```

| 设备架构 | 典型 pageSize |
|----------|---------------|
| A7~A13（iPhone 5s ~ iPhone 11） | 16384（16 KB） |
| A14+（iPhone 12 及以后） | 16384（16 KB） |
| Apple Silicon iPad | 16384 |
| 模拟器（x86_64） | 4096 |

> 真机 iOS 侧 pageSize 自 A7 起就是 16 KB，但部分模拟器/老设备导出日志仍可能是 4 KB，脚本不要写死。

### 4.2 `reason`

Jetsam 触发的直接原因，是后续归因的主开关。常见取值：

| `reason` | 含义 | 关注点 |
|---------|------|--------|
| `per-process-limit` | 单进程 `phys_footprint` 超过专属限额 | 本进程就是凶手，看 `processes[].reason` |
| `vm-pageshortage` | 系统整体物理页不足，按优先级清理 | 与整机负载/其他进程有关 |
| `fc-thrashing` | 文件缓存颠簸（大文件非顺序读/写） | I/O 行为，典型于视频、数据库 |
| `vnode-limit` | 进程打开 vnode 过多（iOS 15+ ≈ 10000） | fd 泄漏、mmap/dlopen 无上限 |
| `zone-map-exhaustion` | 内核 zone 用尽（内核对象泄漏） | IOKit/驱动/系统服务，App 侧罕见 |
| `disk-space-shortage` | 磁盘空间不足 | 缓存/日志膨胀 |
| `highwater` | 常驻进程跨过 high-water mark | 多用于系统守护进程 |
| `idle-exit` | 后台空闲退出（正常生命周期） | 非异常，和 OOM 无关 |

### 4.3 `largestProcess`

Jetsam 决策时占用最大的进程名。**它不等于"被杀的进程"**——被杀的是 `processes[i].reason` 非空的那一项。两者一致多半是"凶手就是最大头"，不一致则往往意味着前台进程优先级低导致被先清理。

### 4.4 `genCount`

同一个系统启动周期内 Jetsam 的生成计数。连续出现很大的 `genCount` 说明整机长期处于内存压力区间，不是偶发。

---

## 5. `memoryStatus` 整机内存画像

```json
"memoryStatus": {
  "compressorSize": 98256,
  "compressions": 58422199,
  "decompressions": 41203311,
  "zoneMapCap": 2684354560,
  "largestZone": "APFS_4K_OBJS",
  "largestZoneSize": 168820736,
  "pageSize": 16384,
  "uncompressed": 110842,
  "busyBufferCount": 128,
  "memoryPages": {
    "active": 188432,
    "inactive": 120221,
    "free": 3142,
    "speculative": 8221,
    "throttled": 0,
    "wired": 94210,
    "purgeable": 9822,
    "fileBacked": 76540,
    "anonymous": 232113,
    "compressor": 98256
  }
}
```

**读图口诀：**

- **`free` 极小 + `compressor` 很大** → 整机物理内存被榨干，压缩池已经撑起半壁江山，典型的 `vm-pageshortage` 环境。
- **`compressions` / `decompressions` 持续飙升** → 内存颠簸（swap 不停压缩解压），性能与耗电都会受损。
- **`wired` 异常大** → 内核占用偏高，可能是驱动/扩展问题，并非普通 App 可优化。
- **`anonymous`（匿名内存） ≫ `fileBacked`** → 大量 heap/stack/脏页，App 堆内存增长是主因。

**换算成 MB**：`pages × pageSize / 1024 / 1024`。

---

## 6. `processes` 数组——核心证物

数组中每个元素是进程在 Jetsam 时刻的快照，按优先级/内存排序，被杀进程会带 `reason` 字段。

### 6.1 常见字段

```json
{
  "pid": 1234,
  "uuid": "C3E6B3A1-...",
  "name": "YourApp",
  "states": ["frontmost"],
  "priority": 10,
  "rpages": 92160,
  "lifetimeMax": 98231,
  "fds": 128,
  "cpuTime": 42910,
  "idleDelta": 0,
  "genCount": 0,
  "coalition": 27,
  "killDelta": 0,
  "reason": "per-process-limit"
}
```

| 字段 | 含义 | 实战用法 |
|------|------|---------|
| `pid` / `uuid` | 进程 ID / 二进制 UUID | UUID 用来和 dSYM、MetricKit 对齐 |
| `name` | 进程名，不含 bundle id | 需要 bundle id 时对照 `processes[].uuid` ↔ 自家符号表 |
| `states` | 状态数组：`frontmost` / `resume` / `suspended` / `daemon` 等 | 判断 FOOM vs BOOM 的依据 |
| `priority` | Jetsam 优先级，数字越大越容易被杀 | 前台 ≈ 10，后台 ≈ 3；系统守护 < 0 |
| `rpages` | 当前 resident 页数（含 compressed） | `rpages × pageSize` 即 `phys_footprint` |
| `lifetimeMax` | 生命周期内的峰值页数 | 用于推断是否经历过内存尖刺 |
| `fds` | 打开的文件描述符数 | 排查 fd 泄漏、`vnode-limit` |
| `cpuTime` | 累积 CPU 时间（单位：ticks） | 结合 `idleDelta` 识别忙碌进程 |
| `coalition` | coalition 组 ID | **尤其重要**：主 App、`WebContent`、Extension 通常同组 |
| `reason` | 若非空，说明**这个进程是被杀对象** | OOM 归因的主字段 |
| `killDelta` | 相邻 Jetsam 事件的间隔（µs） | 判断是否"雪崩式"连续强杀 |

### 6.2 OOM 阈值反推

当 `reason = per-process-limit` 时：

```text
OOM 阈值（MB） = rpages × pageSize / 1024 / 1024
```

以 `pageSize = 16384`、`rpages = 92160` 为例 → `92160 × 16384 / 1024 / 1024 = 1440 MB`。

这就是该设备 + 该 iOS 版本 + 该前/后台状态下的 OOM 专属阈值。批量解析 100+ 条 JetsamEvent 就能建出一份**机型 × 版本 × 前后台**的阈值矩阵，远比靠"机型常量表"准确。

### 6.3 Coalition 视角

iOS 对 **App 主进程 + WebContent 子进程 + 扩展** 采用 coalition 共享内存账本：**任一成员超标都会影响整组存活**。解读时把同一 `coalition` 的条目拎出来对比：

```text
coalition=27  YourApp          rpages=84000   frontmost
coalition=27  com.apple.WebKit rpages=63000   frontmost   <-- 凶手
coalition=27  YourAppExtension rpages=2100    background
```

上例看起来像 App 吃了 1.3 GB，实则 WebKit 子进程吃掉 1 GB，App 本体仅 1.3 GB 的差额。**如果你的归因只统计主进程，就会错杀结论**。

### 6.4 状态与 FOOM / BOOM 判定

| 被杀进程 `states` | 典型结论 |
|-------------------|---------|
| 含 `frontmost` | FOOM（前台 OOM），用户强感知 |
| 仅 `background` / `suspended` | BOOM（后台 OOM），用户下次启动回到首页 |
| `daemon` | 系统服务而非 App，与用户无关 |
| `frozen` / `suspended` + `reason=vm-pageshortage` | 系统内存紧张导致的后台清理，非本 App 问题 |

---

## 7. `reason` 深度解读

### 7.1 `per-process-limit`

- **语义**：单进程 dirty memory + compressed ≥ 系统给该进程的 `memorystatus_task_limit`。
- **排查方向**：本进程内部。按时间序列看最近几分钟：前台峰值、是否有大图、是否有数据泄漏、是否开了 `com.apple.developer.kernel.increased-memory-limit` 还超标。
- **配套证据**：最好同步拉本地 Memory Dump（存活对象 + 分配堆栈），OOM 归因从此从"猜"变成"查堆栈"。

### 7.2 `vm-pageshortage`

- **语义**：整机物理页不足，触发了"按 Jetsam 优先级清理"的动作，被杀进程不一定是用得最多的。
- **排查方向**：整机视角。重点看 `memoryStatus.memoryPages.free` / `compressor`、同 coalition 的兄弟进程、后台是否残留大块内存。
- **治理方法**：压低后台驻留（图片缓存、视频解码上下文、大数据结构），收到 `UIApplicationDidReceiveMemoryWarningNotification` 时**务必真的释放**。

### 7.3 `fc-thrashing`

- **语义**：File Cache（UBC）颠簸——大量页在 fileBacked 与 compressor / swap 间反复腾挪。
- **典型场景**：
  - 视频录制/播放在主线程大块 read；
  - SQLite/Core Data `WAL` 不断 mmap 大文件；
  - 把大图文件 mmap 后又到处随机访问。
- **治理**：用 `dispatch_io` 做顺序流式 I/O，`mmap` 记得 `madvise(MADV_SEQUENTIAL)` / `MADV_DONTNEED` 主动提示访问模式。

### 7.4 `vnode-limit`

- **语义**：一个进程同时打开的 vnode（文件系统对象）超过系统上限（iOS 15+ 约 10000）。
- **触发**：fd 泄漏、大量 mmap 不 munmap、Database 句柄未关、`dlopen` 无上限、Bundle 频繁枚举文件。
- **排查**：Instruments 的 *File Activity*；自研 hook `open/close/mmap/munmap/dlopen` 记录生命周期。

### 7.5 `zone-map-exhaustion`

- **语义**：内核对象 zone 用尽，通常与 App 无关，由系统服务或驱动泄漏触发；会伴随 `largestZone` 字段定位是哪个 zone。
- **对 App**：自己做不了什么，只能复现 + 给 Apple 提 Feedback。

### 7.6 `disk-space-shortage`

- **语义**：磁盘空间不足，影响整机稳定性。
- **治理**：Cache 目录分级清理、日志文件轮转上限、预留阈值时主动清理并弹提示。

### 7.7 `idle-exit`

- **语义**：后台空闲退出，属于**正常生命周期**，不是 OOM，不要算进崩溃率。

### 7.8 `highwater`

- **语义**：跨越 high-water mark。App Extension（分享扩展、Keyboard、Widget）阈值极低（50–120 MB），极易触发。
- **治理**：扩展侧用流式处理，严控图片解码尺寸；Keyboard 类扩展避免把模型/词表全量载入。

---

## 8. 实战案例解读

### 8.1 片段

```json
{
  "reason": "per-process-limit",
  "pageSize": 16384,
  "largestProcess": "YourApp",
  "processes": [
    {
      "pid": 871,
      "name": "YourApp",
      "uuid": "C3E6B3A1-0F2A-4FB2-9C88-AAAA11112222",
      "states": ["frontmost"],
      "priority": 10,
      "rpages": 92160,
      "lifetimeMax": 93000,
      "fds": 312,
      "cpuTime": 86400,
      "coalition": 27,
      "reason": "per-process-limit"
    },
    {
      "pid": 874,
      "name": "com.apple.WebKit.WebContent",
      "states": ["frontmost"],
      "priority": 10,
      "rpages": 8400,
      "coalition": 27
    }
  ],
  "memoryStatus": {
    "memoryPages": { "free": 1200, "active": 175000, "inactive": 120000, "compressor": 90000 }
  }
}
```

### 8.2 解读步骤

1. **类型**：`reason = per-process-limit` → 确认是**单进程超限**，不是系统整体内存压力。
2. **被杀进程**：`processes[0].reason` 非空 → YourApp 本体被杀。
3. **阈值**：`92160 × 16384 = 1.5 GB`。对比该机型在官方资料/其他日志中的常见阈值，若普遍 ~2 GB，说明当时系统可能已有其他压力动态下调了 limit（看 `memoryPages.free = 1200` 极低，的确吃紧）。
4. **状态**：`states = ["frontmost"]` → FOOM，用户强感知。
5. **Coalition**：同 coalition 内 WebContent 仅 132 MB，和 App 本体 1.5 GB 相比不是主因 → **真正的锅在主进程**。
6. **fds = 312**：并非 vnode 超限级别，可以排除 fd 泄漏。
7. **建议动作**：打开本地 Memory Dump 找峰值对象 → 往往是**全尺寸图片解码**或**无界缓存**；同时建议申请 `com.apple.developer.kernel.increased-memory-limit` 做兜底。

---

## 9. 自动化批量解析

### 9.1 快速拆分（bash + jq）

```bash
#!/bin/bash
# 将 .ips 拆成 header.json / body.json
file="$1"
awk 'NR==1{print > "header.json"; next} {print > "body.json"}' "$file"

jq '.bug_type, .os_version, .timestamp' header.json
jq '{reason, pageSize, largestProcess,
     pages: .memoryStatus.memoryPages,
     killed: [.processes[] | select(.reason != null) | {name, uuid, rpages, states, reason}]}' body.json
```

### 9.2 机型阈值矩阵（Python）

```python
import json, os, re, csv
from collections import defaultdict

def parse_ips(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.read().split('\n', 1)
    header = json.loads(lines[0])
    body = json.loads(lines[1])
    if header.get('bug_type') != '298':
        return None
    killed = [p for p in body.get('processes', []) if p.get('reason')]
    if not killed:
        return None
    page = body.get('pageSize', 16384)
    return {
        'os': header.get('os_version', ''),
        'product': body.get('product', ''),
        'reason': body.get('reason'),
        'killed': [
            {
                'name': k['name'],
                'frontmost': 'frontmost' in k.get('states', []),
                'rpages': k['rpages'],
                'limit_mb': round(k['rpages'] * page / 1024 / 1024, 1),
            }
            for k in killed
        ],
    }

matrix = defaultdict(list)
for root, _, files in os.walk('./jetsam_logs'):
    for f in files:
        if f.startswith('JetsamEvent-') and f.endswith('.ips'):
            r = parse_ips(os.path.join(root, f))
            if not r:
                continue
            for k in r['killed']:
                key = (r['product'], re.search(r'iPhone OS \d+\.\d+', r['os']).group(), k['frontmost'])
                matrix[key].append(k['limit_mb'])

with open('oom_limits.csv', 'w', newline='') as f:
    w = csv.writer(f)
    w.writerow(['product', 'os', 'frontmost', 'samples', 'p50_mb', 'p90_mb', 'max_mb'])
    for (product, os_ver, front), arr in matrix.items():
        arr.sort()
        n = len(arr)
        p50 = arr[n // 2]
        p90 = arr[int(n * 0.9)]
        w.writerow([product, os_ver, front, n, p50, p90, max(arr)])
```

批量跑一段时间就能得到自己的**机型 × iOS × 前后台**阈值表，线上兜底时比网络上零散的"机型限额"更可信。

---

## 10. 常见机型阈值经验值

以下是社区实测 + 本文脚本汇总的一份**常见经验值**，仅用于兜底决策（真实阈值以 `os_proc_available_memory()` 实时值为准）。

| 机型 | 总内存 | 前台 OOM（常驻） | 前台 OOM（iOS 15+ entitlement） |
|------|--------|-----------------|----------------------------------|
| iPhone 8 / X | 2–3 GB | ~1.3 GB | ~1.8 GB |
| iPhone 11 / XS / XR | 4 GB | ~1.8 GB | ~3.0 GB |
| iPhone 12 / 13 / 14 | 4–6 GB | ~2.8 GB | ~3.5–4.0 GB |
| iPhone 15 / 15 Pro | 6–8 GB | ~3.2 GB | ~5.0 GB |
| iPad Pro M1/M2 | 8–16 GB | ~4.5 GB | ~12 GB |
| Extension 通用 | — | 50–120 MB | — |

> iOS 15 起，主 App 可以申请 `com.apple.developer.kernel.increased-memory-limit`（需 Apple 授权的机型、且用户未开启低电量模式等），拉高前台上限；扩展不支持。

---

## 11. iOS 版本差异

| 版本 | 主要变化 |
|------|---------|
| iOS 13 | `os_proc_available_memory()` 新增；JetsamEvent 仍为"类 plist"格式 |
| iOS 14 | 日志统一为双段 JSON（header + body），字段更标准化；引入 `MetricKit` 的 `MXCrashDiagnostic`（`exceptionType=EXC_RESOURCE, subtype=MEMORY`）可线上回收 OOM |
| iOS 15 | 支持 `increased-memory-limit` / `extended-virtual-addressing` entitlement；`vnode-limit` 阈值提高到 10000 |
| iOS 16 | 增加 `MXAppExitMetric`，能区分 `foregroundOOM` / `backgroundOOM` 等退出原因 |
| iOS 17 | `memoryPages` 新增 `anonymous` / `fileBacked` 细分，更利于区分"堆内存" vs "缓存文件" |
| iOS 18 | 压缩器策略进一步激进，`compressor` 占比常态化 > 20% |

---

## 12. 与 MetricKit 的字段映射

线上批量归因的推荐路径是 **MetricKit + 本地 Memory Dump**，JetsamEvent 作为研发/客诉场景的补充证据。两者字段映射如下：

| JetsamEvent 字段 | MetricKit 对应 |
|------------------|----------------|
| `bug_type = 298` | `MXCrashDiagnostic.exceptionType = EXC_RESOURCE` + `subtype = MEMORY` |
| `reason = per-process-limit` | `MXAppExitMetric.cumulativeMemoryResourceLimitExitCount`（iOS 16+） |
| `reason = vm-pageshortage` | `MXAppExitMetric.cumulativeMemoryPressureExitCount`（iOS 16+） |
| `states: frontmost` | `MXAppExitMetric.foregroundExitData` |
| `states: background` | `MXAppExitMetric.backgroundExitData` |
| `rpages × pageSize` | `MXCrashDiagnostic.virtualMemoryRegionInfo`（只在部分崩溃里有） |

**实战建议**：线上采集 `MXAppExitMetric` 拿 OOM 计数 + 前后台分布；研发阶段用 JetsamEvent 拉真机拆阈值；客诉阶段让用户导出 JetsamEvent + App 自己的 Memory Dump 交叉分析。
