---
title: "uv 统管 CI 脚本：virtual 包、PYTHONPATH 共享源码与无网 Runner"
date: 2026-11-17T16:28:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "GitLabCI", "依赖", "CLI", "macOS"]
---

## 现象（symptom）

一个大型 iOS 工程有近两百个 Python 工具脚本散落在多个子目录，CI 里以裸 `python3 <script>` 直接调用，解释器版本不可控：本机是新版、Runner 可能是老版本，用到 `tomllib`/`list[]`/`X | None` 等语法时老解释器直接崩。目标是用 uv 锁 Python 版本、用 `pyproject.toml` 划边界、统一调用入口，同时保证无外网的构建 Runner 不受影响。

按常规 uv workspace 思路搭起来后，连撞三处失败：`uv lock` 拒绝解析成员间依赖；`uv run` 触发 setuptools 下载并在无网环境超时；脚本 `import` 共享模块报 `ModuleNotFoundError`。

## 已验证成因（verified cause）

用最小 workspace 在 /tmp 实跑，逐项定位（不是凭文档推断）：

1. **成员互相依赖会要求 build backend**：`ios-ci` 依赖 `tools-common` 作 workspace member 时，uv 报「included as a workspace member, but is missing an entry in `tool.uv.sources`」。补 `tool.uv.sources = { workspace = true }` 后，又要 setuptools 构建，本机连不上包索引时 89s×3 重试超时。
2. **默认会把 project 当可安装包**：`uv run` 默认 build 当前 project；无 `package = false` 时同样触发 setuptools 下载。
3. **`uv run --directory <dir>` 用 root 环境**：不带 PYTHONPATH 时脚本 import 不到共享模块；且 `--directory` 会切 cwd，让 `unittest discover` 的相对路径语义变复杂。对比实测：`uv run --project <abs>` 本身**不改变 cwd**（保持调用方目录），这一点是关键。
4. **Python 不是每次下载**：uv 的托管 Python 持久缓存在 `~/.local/share/uv/python`，下载一次后长期复用（实测同一版本跨数月复用，第二次 `uv run` 仅 0.025s）。
5. **`UV_PYTHON_PREFERENCE=only-system` 有前提**：本机系统只有 3.15、无系统级 3.12 时该设置直接报 `No interpreter found for Python 3.12`；`system` 则优先系统 3.12、找不到回退缓存，两端都能跑。

## 有效恢复（effective recovery）

- 根 `pyproject.toml` 设 `[tool.uv] package = false`：uv 把包当 virtual 包（`uv.lock` 里 `source = { virtual = ... }`），不 build、不下载、纯离线。
- 共享代码**不做 workspace member**，改为纯源码目录 `packages/tools_common/`（目录名必须用下划线，连字符 Python 无法 import），调用时用 `PYTHONPATH=<repo>/Tools/packages` 注入。
- 统一 wrapper：`uv run --project <abs Tools> python "$@"`，注入 PYTHONPATH 但**不 cd**，保留调用方 cwd，使 `../Tools/...`、`build/...` 等既有相对路径语义不变；bootstrap 优先用预置的 Homebrew Python 3.12，设 `UV_PYTHON_PREFERENCE=system`，无网 Job 不下载。
- provision 阶段（镜像/装机）装 uv，**不在 build job 里现装**；uv 是独立二进制，不改动系统 `python3` 指向。
- CI 里几十处调用统一改成经 wrapper 调用；heredoc 用 `wrapper - <<'PY'`。用 `uv run --project` 而非 `--directory`。

## 边界（boundaries）

- 该方案里 uv **只负责锁解释器版本 + 提供统一 venv**，不负责依赖解析/包安装（脚本全是标准库）；workspace member 划分主要是组织/boundary 意义。
- 容器化、HOME 不持久的 Runner 仍需预置 uv + Python 或挂缓存卷，否则可能每次下载。
- wrapper 不 cd 是刻意选择：若改成 cd 到仓库根，会破坏从 `iot/` 出发的 `../Tools/...` 相对路径。
- 「装 uv」这类 provisioning 改动通常不进 CI job 路径；评估是否影响其它版本分支，要看那些分支 include 模板用的是固定 commit 还是 main，以及改动文件是模板还是装机脚本。

## 证据（evidence）

最小 workspace 实跑：补齐成员、改 `package = false`、共享包移出 member 后，`uv lock` 解析出 7 个 virtual 包，`uv run` 离线跑通；wrapper 实测输出锁定的 Python 3.12.14、cwd 保持不变、`import tools_common` 成功、heredoc stdin 模式成功。全量 882 项单测通过。

真实 CI：改造 MR 的 pipeline 六个 job 全绿；打包 job 的 trace 显示 wrapper 被真实调用、`Using CPython 3.12.14 interpreter at: /opt/homebrew/opt/python@3.12/bin/python3.12`（用预置系统 Python、未下载）、heredoc 解析版本号成功、相对路径调用成功。本地原只能标未验证的 bootstrap/版本/路径点，被真实流水线 trace 坐实。
