---
title: "Runner 磁盘耗尽后，服务端运行中不代表本地任务还活着"
date: 2026-11-13T13:35:02+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "故障", "CI/CD", "GitLabRunner", "macOS"]
---

## 现象（symptom）

macOS shell Runner 的构建任务因 `No space left on device` 退出，自动重试也在空间恢复前
失败。GitLab 仍显示重试任务运行中，远端 trace 停在构建入口，看起来像长时间编译。

## 已验证成因（verified cause）

首次任务的 Python traceback 明确是写任务状态文件时出现 ENOSPC。Runner 服务日志还显示
重试任务本地已以 script_failure 结束，但反复报告 `Failed to read trace buffer bytes`，
其临时 trace 文件写入仍返回 ENOSPC。进程清单已没有该任务的 shell、Python 或编译器；
服务端却仍是 running。空间恢复后旧缓冲仍继续报错，不能把服务端状态当作活跃进程证据。
未通过这些日志推断具体缓冲实现或磁盘最初被哪项工作占满。

另一个已核实的生命周期边界是：Runner 的 `post_build_script` 先于项目 `after_script`
执行。若前者把原始测试资料完整复制到节点备用目录，后者即使只上传小报告，也无法避免
本地重复占用；若提前删除资料，则会破坏尚未开始的报告分析。上传白名单和本地保留策略
因此需要分别控制。

## 有效恢复（effective recovery）

1. 同时查原任务 trace、Runner 服务日志、磁盘容量、进程父子关系和精确工作目录。
2. 在无活跃引用的前提下，仅删除已结束验证的编译中间目录。保留源码、冻结 App、dSYM、
   原始 trace、xcresult 与报告；先记录精确删除清单，不按模糊名称清理整个工作区。
3. 确认本地任务已结束，取消对应残留 Job；只重启该专用 Runner 服务。若 Job 已进入
   canceling 且原执行确定不再存在，再用服务端支持的 force cancel 完成收尾。
4. 在原流水线重试同一提交的 Job，确认新 Job 身份、Runner 在线状态、日志及任务状态
   文件重新推进。不要重复创建定时流水线，也不要把自动重试视为问题已恢复。

长期策略改为默认在分析和 Wiki 发布尝试后，精确清理当前 Job 的原始 trace、XML、
xcresult、截图、符号文件和编译中间目录，保留 JSON、Markdown、JUnit 小报告供 Runner
上传。只有运行前显式设置 `IOS_DEVICE_KEEP_ARTIFACTS=1` 才保存完整本地快照；默认 `0`
不创建快照，其他值拒绝删除。节点 post-build hook 仅负责不被报告消费的通用编译目录，
项目 after-script 负责原始报告生命周期。升级时还要删除旧 hook 已生成的同 Job 快照，
否则新策略仍会留下副本；不能借此清除其他 Job。

## 边界（boundaries）

重启与 force cancel 只针对已证明无本地执行的精确任务和专用服务，不用于仍在采集的
任务，也不广泛 kill 编译器或清理其他 Runner。磁盘恢复、服务恢复、App 构建、真机测试
和 Wiki 发布分别验收；新 Job 开始推进只证明恢复执行能力，不代表测试已成功。

在后续已获授权的容量回收中，暂停专用 Runner 接单并持有维护锁，核对远端终态、
本地构建进程和打开文件后，保留小报告，再删除精确清单中的旧原始资料。该操作实际
释放约 40.57 GiB。源码、依赖缓存、签名配置及其他工作区均不属于此次清理范围。
不应把故障调查时临时保留原始证据，误写成长期默认保留所有大制品。

## 证据（evidence）

保留了首个任务的 ENOSPC traceback、重试任务本地失败和日志缓冲错误、服务端 stale
running 与空进程树的对照。只清理四个精确 Intermediates.noindex 后可用空间约 21 GiB，
冻结产品与测量证据保持。专用服务重启后进程身份更新，原 Job 收尾，再次重试仍绑定
原流水线与同一 merge commit；新 Job 的检出、预检与 daily build 状态恢复推进。

保留策略的真实临时目录与 CLI 回归先失败再通过，覆盖默认删除、显式保留、非法参数、
同 Job 旧快照兼容、符号链接和越界保护。完整脚本测试 648 项通过，服务端 CI lint 与
六项 MR 检查通过，随后确认合入。专用节点固定 hook 已升级，验证其源码摘要一致、
post-build 不再处理报告，节点恢复在线且未暂停。合入后的真实设备任务及上传、删除
闭环仍需单独验收，不能用上述本地和 MR 检查代替。
