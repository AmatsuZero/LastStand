---
title: "清理临时 worktree 后检查子模块 core.worktree 引用"
date: 2026-11-10T00:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Git", "踩坑", "故障"]
---

## 现象

删除临时宿主与子模块 worktree 后，原宿主的子模块 Git 命令报 `cannot chdir`，指向已删除的临时路径。

## 已验证成因

子模块公共 gitdir 的 `core.worktree` 已被之前的临时集成流程指到临时 checkout。worktree 删除成功并不保证公共配置被自动恢复。此时普通 `git config` 也会在读取命令前因不存在的工作目录而失败。

## 有效恢复

删除前先记录子模块 `.git` 指向、gitdir/config 的 core.worktree 和原宿主状态。遇到错误时，用显式的 `--git-dir=<gitdir> --work-tree=<original-submodule>` 先读取原宿主状态；用 `git config --file <gitdir>/config core.worktree <original-submodule>` 修正唯一字段，再确认原宿主状态逐项相同。

## 边界

只改已验证子模块公共 gitdir 的该字段，不重置源文件/index，不改远端或凭据。不要假设 `git -c core.worktree=...` 能绕过此启动失败；本次仍失败，显式 --work-tree 成功。主工作区脏文件、其他 worktree 和 stash 必须保留。

## 证据

本次先归档源模式生成锁/工程补丁、验收JUnit/xcresult和独有提交bundle，再删除三个临时worktree。原子模块仅该配置指向旧临时路径；修复前后显式原宿主 porcelain 的两项未提交变更一致，Git命令恢复正常。未改业务源码。

## 在子模块的 linked worktree 中合并前核对工作目录

同一类配置问题也可能在目录存在时发生。子模块的公共 `core.worktree` 使用相对路径，linked worktree 继承后，`git rev-parse --show-toplevel` 解析到了公共 gitdir。实测 `git merge` 更新了 linked worktree 的索引，却把合并结果写到了公共 gitdir。普通 `git status` 随后把大量文件列为删除，调用 `git check-ignore` 的发布测试也读错了 `.gitignore`。

进入 linked worktree 后，先核对 `git rev-parse --show-toplevel` 与预期 checkout。发现不一致时，先用 `git --work-tree="$PWD" status` 验证实际文件。仓库已启用 `extensions.worktreeConfig` 时，可以为当前 linked worktree 单独设置路径：

```sh
git --work-tree="$PWD" config --worktree core.worktree "$PWD"
git rev-parse --show-toplevel
git status --short
```

公共 `config` 和其他 worktree 继续使用原有设置。若合并已经写错位置，先逐个确认本次合并生成的文件和真实 checkout 的原始内容，再恢复对应结果。验证时同时检查公共 gitdir 中的残留和主 checkout 的未提交状态。本次修复后，发布测试能正确读取 checkout 的忽略规则，脚本测试套件通过。
