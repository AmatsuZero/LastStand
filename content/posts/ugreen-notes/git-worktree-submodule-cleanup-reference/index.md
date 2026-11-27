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

补充边界：该症状可以在 `git worktree add` 完成后立刻出现，不必等到合并——新建的 linked worktree 里所有文件都显示为 ` D`，但磁盘上文件齐全，`git rev-parse --show-toplevel` 指向子模块的公共 gitdir。若公共配置尚未启用 `extensions.worktreeConfig`，先执行 `git config extensions.worktreeConfig true`（写入公共 config，其它 worktree 仍沿用原值），再执行上面的 `git --work-tree="$PWD" config --worktree core.worktree "$PWD"`；随后 `git rev-parse --show-toplevel` 应指向新 worktree、`git status --short` 恢复干净。修复只改工作目录解析，不触碰原子模块的在途改动（podspec 修改、未跟踪文件）；修复前后分别核对原子模块的 `--show-toplevel` 与 porcelain 状态，确认完全未受影响。

## 宿主切分支时的失效子模块 gitfile

另一种现象是宿主 linked worktree 的子模块目录只剩 `.git` 文件，该文件仍指向已不存在的模块 gitdir。启用了 `submodule.recurse=true` 时，`git switch` 可在宿主文件已部分更新后报 `could not reset submodule index`，但 HEAD 仍停在旧分支。此时不要把所有差异当作用户原有修改，也不要认为切换失败就没有文件变更。

本次已在切换前确认隔离工作区干净。恢复时先禁用递归，用旧 HEAD 恢复本次失败切换改动；对新增未跟踪文件逐个比较目标分支 blob 哈希，只有完全相同的本次切换残留才移除。即使设置 `submodule.recurse=false`，切换仍可能检查这个失效 gitfile；在确认该子模块目录只有失效 `.git` 文件、没有源码后，将该文件备份到工作区外，再以禁用递归的方式切换成功。随后两个目标提交 cherry-pick 无冲突，工作区干净，相关 41 项测试通过。

此恢复仅适用于已记录干净基线、残留来源和哈希可证明、子模块目录无真实工作内容的场景。不能对未知脏工作区套用 hard reset 或广泛 clean；不要为修复一个临时工作区而改动主工作区的子模块公共配置。
