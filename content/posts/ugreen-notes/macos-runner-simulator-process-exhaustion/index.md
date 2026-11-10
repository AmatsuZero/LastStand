---
title: "macOS CI 无法 fork：模拟器残留、进程配额与任务级清理"
date: 2026-11-10T19:04:38+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "CI/CD", "GitLabRunner", "Xcode", "macOS", "凭证"]
---

## 适用场景与检索词

macOS shell Runner 出现 `fork: Resource temporarily unavailable`、无法创建子进程、`maxUserProcs` 接近上限，且存在大量 Booted iOS Simulator。检索词：`fork`、`RLIMIT_NPROC`、`ulimit -u`、`kern.maxproc`、`launchd_sim`、`simctl`、模拟器泄漏、`after_script`、`DEVELOPER_DIR`、Git 凭据重写。

本文是一次实际故障的脱敏记录。数字是事故快照，不能作为其他机器的默认阈值；不包含内部地址、个人账号、设备 UDID 或认证材料。

## 现象（symptom）

构建无法继续创建进程。故障机器上同时观察到：

| 指标 | 快照 |
| --- | --- |
| 诊断 shell 的 soft / hard 进程限制 | 4000 / 6000 |
| 全机进程数 | 约 4190～4204 |
| 目标用户进程数 | 约 3990～4004 |
| 目标用户 zombie 数 | 0 |
| 内核 `kern.maxproc` | 6000 |
| 内核 `kern.maxprocperuid` | 15000 |
| Booted 模拟器 | 19 |

另一台 Runner 存在相似残留：20 台 Booted 模拟器、用户进程约 4117；但该机 shell soft limit 为 10666，不能把“有大量残留”直接写成“已经撞到进程上限”。该机随后也完成了维护清理：全机进程 **4280 → 533**，用户进程 **4059 → 312**，Booted **20 → 0**。清理前先暂停接单并确认无运行任务，清理后已恢复接单。

## 已验证成因（verified cause）

### 1. 本次瓶颈是进程资源，模拟器残留是主要负载来源

19 台模拟器正常 shutdown 后，第一次机器的全机进程数从 **3978 降至 456**，目标用户进程数从 **3768 降至 246**，Booted 数从 **19 降至 0**。减少的用户进程约占清理前的 93.5%。这是“模拟器运行态占用大量进程”的直接恢复证据。

每台模拟器不只是一个前台应用窗口，还包含 `launchd_sim`、SpringBoard、渲染、系统服务和扩展等进程。`xcodebuild` 结束不会保证这些服务自动退出。本次 zombie 为 0，不能按“父进程没 wait 导致僵尸堆积”处理。

`ulimit -u` 对应进程资源限制 `RLIMIT_NPROC`：限制值随进程/启动链路继承，核算的是同一 UID 下的进程数量。诊断交互 shell 的限制不能自动当成 Runner 服务进程的限制。系统级上限和用户级上限是不同约束，不能只看其中一个。

### 2. 共享 helper 缺少完整的资源所有权和释放路径

修复前的 `ensure_ios_simulator()` 会查找或创建设备、必要时 boot，并返回 destination；这段路径没有与使用者生命周期配对的 shutdown/delete。它还可能复用已有设备，因此不能简单在所有调用结束后无条件删除该 UDID。

本次证据支持“旧 helper 存在生命周期缺口、运行中的旧设备贡献了主要进程负载”。没有逐次创建设备的历史日志，**不声称 19 台设备一定分别来自 19 次任务，也不把并发 create 竞争当成已验证事实**。

## 有效恢复（effective recovery）

### 第一步：在故障 Runner 上采集，而不是在开发机上执行

先核对主机、用户、时间和目标 Runner。可读命令示例：

```bash
id
ulimit -Su
ulimit -Hu
sysctl kern.maxproc kern.maxprocperuid
ps -axo uid=,pid=,ppid=,stat=,comm=
xcode-select -p
# 使用已确认存在的完整 Xcode，不要照抄某个版本路径。
export DEVELOPER_DIR="/Applications/<Xcode>.app/Contents/Developer"
xcrun --find simctl
xcrun simctl list devices booted
```

`<Xcode>` 是占位符，需替换成机器上的实际应用名。接近 fork 上限时避免大量并行命令、管道和命令替换；必要时使用 shell 内建循环读取现成报告。若连诊断都无法启动，可在确认 hard limit 后临时提高**当前诊断 shell**的 soft limit，结束时恢复；这只是救援空间，不能视为给 Runner 服务修复了配置。

### 第二步：暂停接单，核对已有任务，再定向 shutdown

1. 暂停目标 Runner 接收新任务；暂停不会自动结束当前任务。
2. 核对该 Runner 的 running jobs、现存构建/测试进程及用途；若同机有其他 Runner 管理进程，也要一起核对。
3. 将待清理 UDID 保存为清单，限定已确认遗留的设备；同名和 Booted 状态都不足以单独证明“无人使用”。
4. 针对已确认的单台设备执行 `xcrun simctl shutdown <owned-udid>`；复查进程数和设备状态，再恢复接单。

事故恢复采用 shutdown，保留设备数据。不要用全局 `shutdown all`、按进程名广泛 kill、重启 CoreSimulator 服务来代替所有权判断。后面的任务自有临时设备则可以在 shutdown 后 delete，两者的保留策略不同。

### 第三步：区分工具链与脚本错误

- `xcrun: unable to find utility "simctl"`：先核对 `DEVELOPER_DIR` 和完整 Xcode。只有 Command Line Tools 被选中时，也可能找不到 simctl；不能直接推出“模拟器损坏”。优先局部设置环境变量，避免在共享机器全局切换 Xcode。
- 报告文件重定向报 `no such file or directory`：先修复报告路径的创建/存续，确认命令确实执行过。重定向失败可能发生在 simctl 启动前，不能把它记为 shutdown 已执行失败。
- 清理日志成功且进程下降，只证明资源恢复；仍需独立验证原构建。

## 永久修复：给每个 Job 一份可恢复的所有权记录

共享模板修复采用以下边界：

1. 每个任务创建唯一临时设备名，包含 Job 标识和随机后缀；使用具体 UDID 作为 destination。
2. 在 `create` 前先持久化唯一名称；拿到 UDID 后，在 `boot` 前更新记录。记录包括任务标识、设备名、UDID、所选 Xcode 开发目录。
3. 状态文件按 Job 分隔，使用临时文件替换写入。分步写入缩短“创建成功但还没记住设备”的窗口；这不代表 simctl 创建与本地写文件构成了原子事务。
4. 命令包装器用 `EXIT` / `INT` / `TERM` trap 做任务内清理。只处理本次自建设备；外部显式传入的 destination 不纳入所有权。
5. GitLab `after_script` 作为第二层重试：重新读取磁盘状态，恢复 Xcode，再按精确设备身份清理。状态缺失时返回；身份冲突、命令失败或创建结果不明时保留记录，不扩大清理范围。
6. 验证任务标识、唯一名称与 UDID；已确认设备已不存在时可以清除记录。仅有唯一名称、暂未查到设备且创建结果未知时保留记录，因为服务端请求可能仍在处理中。
7. 原命令已失败时保留原失败码；原命令成功但任务内清理失败时，包装器返回失败，不让资源泄漏被绿色任务掩盖。

调用形式如下，路径基于实际共享模板约定：

```bash
# lint 命令不直接接收 xcodebuild destination 参数。
bash "$UG_COMPONENT_SCRIPTS/with-ios-simulator.sh"   bundle exec pod lib lint <Component>.podspec <lint-options>

# 测试命令由包装器追加具体 -destination。
bash "$UG_COMPONENT_SCRIPTS/with-ios-simulator.sh" --destination-argument   xcodebuild test -workspace <Workspace> -scheme <Tests> <test-options>
```

这两段是接口示意，尖括号参数需替换。包装器负责资源生命周期，不替代原有测试结果清单、JUnit、覆盖率或制品校验。

### 为什么不能只加 after_script

GitLab 官方文档明确：`after_script` 在新的 shell 执行，不继承 `script` 中动态 export 的变量；它有独立超时，且自身失败通常不改变前面成功的 Job 退出码。Job 整体超时、Runner 中断、机器掉电时，也不能把它当作必达的 `finally`。

因此使用“命令内 trap + 磁盘所有权记录 + after_script 重试”。`SIGKILL` 无法捕获，服务端创建与本地记账间仍有窗口。这套方案降低泄漏概率并提供恢复线索，不能承诺任意中断下零残留。维护扫描器和超时预算需另行设计，不能宣称本次已实现。

## 模板修复后的消费者审计

一次审计覆盖 110 个仓库：37 个组件引用共享模板 `main`，其中 36 个无需本地改动；1 个组件覆盖了验证和单测脚本，必须把直接调用 helper 的位置改成包装器。另有 24 个空仓库、49 个使用其他工作流或默认分支无该 CI 的仓库。

审计要检查两个 ref：YAML `include.ref` 和运行时下载脚本的 ref；还要检查 `script`、`after_script` 的本地覆盖。不能只看“include 存在”就判定接入成功。原始主 App 的活跃分支使用独立的临时设备与 `finally` 清理，不能机械套用组件模板修复。

审计边界是默认分支、最近流水线引用与已知活跃 App 分支，不是穷举所有历史分支。已经创建的流水线不会被新模板追溯改写；已发布 tag 不应移动。

## 附带踩坑：有权限却无法 push

此次 API 查询显示当前账号具备受保护分支的推送权限，但 `git push` 被拒绝。原因是全局 `url.*.insteadOf` 为组件 URL 注入另一套认证信息。URL 已带认证时，仅指定 credential helper 仍不足以保证 Git 使用预期账号。

排查时只输出脱敏后的配置键及账号/权限结果；不得打印包含认证信息的 URL、token、credential fill 原始结果或认证 header。

在核实当前 glab 身份和目标权限后，事故处理使用一次性命令忽略全局 Git 配置，并指定 glab helper，推送成功。此方法也会忽略该次命令需要的其他全局配置，使用前应核对代理、证书和签名等依赖；不要把它当成所有机器的固定默认设置，更不能修改分支保护来掩盖凭据问题。

## 边界（boundaries）

- 某个可执行文件名含 `xcodebuild` 不等于真实构建仍在运行；同样，没看到它也不等于模拟器可安全关闭。核对完整命令、任务状态与接单竞态。
- `ps` 与限制值是多时刻、可能不同进程启动链路的观察，不能要求计数严格卡在某一个交互 shell 的 soft limit；重复采样并核对实际服务限制。
- 调高 soft limit 只延后触顶，不能修复不断保留的运行态资源；硬件内存充足也不保证进程配额充足。
- 外部指定的模拟器属于调用方；自动清理只能针对已验证的任务自建设备。
- 清理前后计数、脚本单测、CI Lint、真实构建和发布成功是不同证据层级。

## 证据（evidence）

1. 故障用户进程接近 4000、zombie 为 0，且有 19 台 Booted 设备；另一机器存在 20 台相似设备残留，但尚未触及其已观测到的 soft limit。
2. 第一台机器定向正常 shutdown 后：系统 3978 → 456，用户 3768 → 246，Booted 19 → 0。第二台机器：系统 4280 → 533，用户 4059 → 312，Booted 20 → 0；保留设备数据，恢复接单。两台机器的前后统计均来自操作者回传，不是开发机采样。
3. 旧共享 helper 源码存在启动/复用路径，缺少配对回收；新增所有权 helper、命令包装器和模板 after_script。
4. 共享 CI 本地 285 项 unittest 运行成功，其中 2 项 skipped；生命周期回归用例为 17 项。消费者脚本新增 5 项回归，旧脚本按预期失败，适配后其两套 Python 测试合计 44 项通过。CI Lint 无错误/警告。
5. 消费者提交推到主分支后，远端 SHA 一致；流水线状态 `skipped`，`jobs=[]`。这不属于真实 Runner/Xcode 构建通过证明。
6. 两台 Runner 的清理统计已确认；本次模板修复后的真实 Runner 构建、强杀/掉电下残留治理仍未完成验证。独立复核代理遇到限流，本次没有独立复核完成证据。

### 参考资料

- 本机 macOS `man 2 getrlimit`（`RLIMIT_NPROC` 与限制继承）、`man 2 fork`；Xcode 的 `xcrun simctl help`。
- [GitLab after_script](https://docs.gitlab.com/ci/yaml/#after_script)：独立 shell、超时和退出码边界，需结合实际 Runner 版本。
- [GitLab Runner 脚本超时配置](https://docs.gitlab.com/ci/runners/configure_runners/#set-script-and-after_script-timeouts)。
- [GitLab 跳过流水线](https://docs.gitlab.com/ci/pipelines/#skip-a-pipeline)：`ci.skip` 不跳过 MR pipeline；应核对实际流水线及 Job 列表，不把 skipped 当成测试通过。
