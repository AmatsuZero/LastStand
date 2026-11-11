---
title: "Bash CI 预检：不要只依赖 set -e 中的 && 链"
date: 2026-11-11T15:25:09+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "构建"]
---

## 现象（symptom）

CI 希望在工具缺失时立即停止，避免继续执行昂贵的构建。下面的预检在 `bash -eu` 下仍可能输出 `build-started`，并以 0 退出：

```bash
if [ "$PIPELINE_KIND" = "push" ]; then
  command -v definitely_missing_scanner >/dev/null && command -v python3 >/dev/null
fi
printf 'build-started\n'
```

## 已验证成因（verified cause）

`set -e` 对 `&&` / `||` 列表存在例外。失败的命令若不是列表最后一项，不能依赖 errexit 自动停止；后续命令仍能覆盖最终退出状态。仅检查 YAML 语法或只运行正常工具链，不会暴露该行为。

## 有效恢复（effective recovery）

给整个前置条件链显式设置失败出口：

```bash
if [ "$PIPELINE_KIND" = "push" ]; then
  command -v definitely_missing_scanner >/dev/null && command -v python3 >/dev/null || {
    echo 'error: missing required build tools' >&2
    exit 1
  }
fi
printf 'build-started\n'
```

回归测试应以受控 PATH 移除扫描器，执行真实预检命令，再接一个写入构建标记的命令。断言进程退出非 0、标记文件不存在；正常路径单独保留验证。

## 边界（boundaries）

这里验证的是 Bash 非交互脚本中上述 AND/OR 列表，不推断其它 Shell 或全部 errexit 场景。显式失败出口用于真正必需的前置条件，不把可选工具缺失升级为错误；没有识别错误类型时也不盲目重试。

## 证据（evidence）

本地以 `/bin/bash -eu -c` 执行缺少扫描器的真实预检。修复前退出 0 且创建构建标记，断言失败；追加显式 `exit 1` 后退出非 0 且无标记，对应 CI 配置回归通过。Shell 语法和 GitLab CI lint 也通过；这些结果不等于真实 Runner 构建验收。
