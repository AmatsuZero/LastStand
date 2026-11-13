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

## 有效恢复（effective recovery）

1. 同时查原任务 trace、Runner 服务日志、磁盘容量、进程父子关系和精确工作目录。
2. 在无活跃引用的前提下，仅删除已结束验证的编译中间目录。保留源码、冻结 App、dSYM、
   原始 trace、xcresult 与报告；先记录精确删除清单，不按模糊名称清理整个工作区。
3. 确认本地任务已结束，取消对应残留 Job；只重启该专用 Runner 服务。若 Job 已进入
   canceling 且原执行确定不再存在，再用服务端支持的 force cancel 完成收尾。
4. 在原流水线重试同一提交的 Job，确认新 Job 身份、Runner 在线状态、日志及任务状态
   文件重新推进。不要重复创建定时流水线，也不要把自动重试视为问题已恢复。

## 边界（boundaries）

重启与 force cancel 只针对已证明无本地执行的精确任务和专用服务，不用于仍在采集的
任务，也不广泛 kill 编译器或清理其他 Runner。磁盘恢复、服务恢复、App 构建、真机测试
和 Wiki 发布分别验收；新 Job 开始推进只证明恢复执行能力，不代表测试已成功。

## 证据（evidence）

保留了首个任务的 ENOSPC traceback、重试任务本地失败和日志缓冲错误、服务端 stale
running 与空进程树的对照。只清理四个精确 Intermediates.noindex 后可用空间约 21 GiB，
冻结产品与测量证据保持。专用服务重启后进程身份更新，原 Job 收尾，再次重试仍绑定
原流水线与同一 merge commit；新 Job 的检出、预检与 daily build 状态恢复推进。
