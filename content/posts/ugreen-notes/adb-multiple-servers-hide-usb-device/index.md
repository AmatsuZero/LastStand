---
title: "adb devices 看不到已插入的真机：两个 adb server 抢 USB 通道"
date: 2026-11-23T08:47:09+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "debug", "故障", "macOS", "CLI"]
---

## 现象（symptom）

`adb devices` 只列出一个模拟器，预期中的 Android 真机完全不出现——连常见的 `unauthorized` 或 `offline` 都没有。

第一反应是「线没插好 / USB 调试没开 / RSA 授权没点」，但这三种情况各有特征，不能凭印象下结论。

## 排查走过的弯路

**先看物理层，但别只看一个命令。** `system_profiler SPUSBDataType` 在当前环境里没有输出，一度以为设备没插上；改用 `ioreg -p IOUSB -l -w 0` 才看到真机确实挂在 USB Hub 上，厂商、型号、序列号齐全。物理连接正常，排除「没插好」。

**再看日志，而不是猜授权。** adb 日志（`/private/var/folders/.../T/adb.*.log`）里从几天前起就反复出现同一组记录：

```
transport.cpp:1226  <serial>: connection terminated: read failed
usb_libusb.cpp:100  <serial>: read failed: Undefined error: 0
adb_usb_connection.cpp:68  AdbUsbConnection: write terminated: Undefined error: 0
```

这说明 USB adb 通道是「连上即断、循环往复」，而不是「设备从未出现」。如果是未授权，日志和 `adb devices` 会给出 `unauthorized`；如果是 USB 调试关闭，设备根本不会暴露 adb interface。两种猜测都与证据不符。

**最后看进程，才找到真正的差异。** `ps aux | grep '[a]db .*server'` 显示两个 adb server 并存：

```
adb -L tcp:5037 fork-server server ...
adb -L tcp:localhost:5049 fork-server server ... --one-device <serial>
```

第二个是某个端侧验证任务早上启动的专用 server，`--one-device` 表示它只跟踪指定设备。实验结束后它变成孤儿进程（PPID=1、对应实验已无活跃进程），但仍占着 USB 通道。两个 server 争抢同一台设备的 USB interface，transport 因此反复 `read failed`。

## 已验证成因（verified cause）

真机物理连接正常，但**两个 adb server 并存**（其中一个是遗留的 `--one-device` 孤儿 server）导致 USB adb transport 卡死、反复断开，所以默认 server 的 `adb devices` 扫不到它。

模拟器走虚拟 adb 通道，不依赖物理 USB，因此一直正常——这正是容易误判成「真机掉了」的诱因。

## 有效恢复（working fix）

先确认那个 5049 server 的启动实验确实已结束（无相关活跃进程），再收敛成一个 server：

```bash
kill <5049 server pid>
adb kill-server
adb start-server
adb devices -l
```

真机与模拟器立刻同时列出；连续多次枚举稳定，`get-state=device`、`adb shell` 均正常。

## 边界（boundaries）

- `unauthorized` / `offline` 与「完全不出现」是不同故障：前者在授权或协议层，后者在设备枚举层。本文只覆盖后者。
- 清理孤儿 server 前必须确认没有实验在用它。`--one-device` 通常是自动化或测试框架故意启用的隔离 server，误杀会中断正在进行的测试。
- 只做 `adb kill-server && adb start-server` 而不清掉并存的 server，可能再次被抢占；关键是让两个 server 收敛成一个。
- 设备经 USB Hub 连接，但本次证据指向 server 冲突而非 Hub 供电。不要未经取证就归咎线材、Hub 或 USB 调试开关。

## 证据（evidence）

- `ioreg -p IOUSB -l -w 0`：真机的厂商、型号、序列号条目（序列号已泛化）。
- adb 日志：同一序列号从数日前起持续 `connection terminated: read failed` 与 libusb `read failed: Undefined error: 0`。
- `ps aux | grep '[a]db .*server'`：两个 server 的命令行、监听端口与启动时间；5049 server 的 `--one-device <serial>` 参数与孤儿状态。
- 修复前后 `adb devices -l` 输出对比：修复前仅模拟器，修复后真机与模拟器并存，且多次枚举稳定。
