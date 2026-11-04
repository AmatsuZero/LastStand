---
title: "GitLab macOS Runner 构建成功后卡死 27 分钟排查"
date: 2026-10-19T16:48:13+08:00
tags: ["GitLab", "CI/CD", "macOS", "Runner", "性能排查"]
categories: ["绿联工作笔记"]
---

## 背景与现象

某条 iOS 主工程的 MR 流水线，构建 job 在 <code>Build Succeeded</code> 之后，卡在 <code>Cleaning up project directory and file based variables</code> 约 27 分钟，GitLab 页面一直显示 running（14:57 构建完成，15:24 才上报 success）。编译本身只花了约 8 分钟——卡的是 job 收尾阶段，而且最终自行成功，属于「假死」而非失败。

## 名词解释

- **GitLab Runner**：执行 CI job 的 agent 进程；<code>concurrent</code> 控制同一台机器上能并行跑几个 job。
- **DerivedData**：Xcode 的构建中间产物目录，体积大、文件多。
- **CAS（Content Addressable Storage）**：Xcode 编译缓存，按内容寻址，默认无清理上限。
- **launchd**：macOS 的系统服务管理器，相当于开机自启 + 定时任务（类似 cron，但睡眠错过会自动补跑）。

## 排查过程（逐层排除）

- **磁盘 / inode**：盘仅 66% 使用、300G+ 可用、inode 充足 → 排除磁盘满。
- **日志定位卡点**：日志尾部 <code>Build Succeeded → after_script → Saving cache</code> 全部完成，最后沉默在收尾清理段 → 卡的是 runner 清理，不是编译。
- **自研探针一次采齐**（gitlab-runner-probe.sh）：runner 配置 <code>concurrent = 3</code>；builds 目录 131G（DerivedData 56G + 编译缓存 49G + checkout 22G）；项目 checkout 仅 2.4G / 6 万文件，清理对象本身很小；事发时 load average 16/26/25，空载后回落到 5.65 → 负载与 CI 活动强相关；swap used 1.8G → 内存曾吃紧；删除微基准：6 万小文件 <code>rm -rf</code> 仅 2s → 排除文件系统删除吞吐问题。
- **时间线对齐**：该 job 的清理窗口（14:58–15:24）与同 runner 上另一个 KMP 重构建 job（14:58–15:11）完全重叠。

## 根因定位

**直接原因：同机并发超载。** <code>concurrent=3</code> 下，KMP 链接等重 job 把 CPU / IO / 内存打满（load 25+、动用 swap），收尾清理这种秒级小活被拖成 27 分钟。

已排除：磁盘满、inode 耗尽、APFS 删除吞吐、清理对象过大。

**次生问题**：被取消的 job 不会执行 <code>after_script</code>（里面是 <code>rm -rf DerivedData</code>），孤儿目录持续累积（实测 34GB / 162 个，主要是 MR 的 auto_cancel 机制所致）；Xcode 编译缓存 CAS 无清理上限，49G 且持续增长。

## 修复措施

工具入库（ci 仓库 runner/ 目录）：

- gitlab-runner-probe.sh：探针，一次采齐并发 / 体量 / 磁盘 / 日志 / 删除基准，再遇卡慢不用反复登录排查；
- runner-cleanup.sh：DerivedData 孤儿（>24h）按阈值直删；CAS 过期对象（>7 天）删除前检查近 10 分钟写入新鲜度；默认 dry-run；
- com.ugreen.runner-cleanup.plist：launchd 每天 03:30 定时 --apply，休眠错过自动补跑；
- README.md：背景、用法、待办清单。

<pre class="mermaid">
flowchart LR
  A[launchd 每天 03:30] --> B[runner-cleanup.sh --apply]
  B --> C{检查写入新鲜度}
  C -->|DerivedData 孤儿 >24h| D[直删]
  C -->|CAS >7天 且近10分钟无写入| E[删除过期对象]
  D --> F[释放磁盘]
  E --> F
</pre>

落地效果：首次清理释放 34GB（DerivedData 52.7→18.7GB，剩活跃工作集），21 秒完成；磁盘可用 322→353Gi。孤儿今后由定时任务兜底，不再累积。

开发清理脚本时踩的三个坑（避免重蹈）：

- 用 <code>ps</code> 匹配 <code>gradle</code> 判定「构建中」会误拦空闲 Gradle daemon（常驻数小时），定时任务被永久挡住 → 改为检查目录写入新鲜度；
- DD / CAS 根目录 mtime 会因 job 起停（mkdir/rm）永远「新鲜」→ 写入判定必须 <code>-mindepth 1</code> 只看内部条目；
- <code>find -mtime +N</code> 按整天截断（+1 实际是 >2 天）→ 改用 <code>-mmin</code> 精确按分钟对齐文档语义。

## 遗留待办

- 低峰期将 <code>concurrent</code> 3 → 2，或将 KMP 重构建与 App 构建拆分到不同 runner tag（根治互踩）；
- Spotlight 隐私列表排除 builds 目录（系统设置 → Siri 与聚焦 → 聚焦隐私）；
- 观察 CAS 满 7 天后定时任务首轮自动清理是否正常。

## 经验小结

- 「job 卡 running」先看三件事：runner load、concurrent 配置、builds 目录占用；df 正常不能排除 IO 争抢。
- 判断「卡住」先看日志走到哪一步：<code>Build Succeeded</code> 之后的沉默 = 收尾阶段问题，与代码无关，可放心取消重跑。
- macOS 当 CI runner 的三个默认假设陷阱：Spotlight 会索引构建产物、守护进程常驻、定时任务休眠不补跑（launchd 的 StartCalendarInterval 可补跑，cron 不行）。
