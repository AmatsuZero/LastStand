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
