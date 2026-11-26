---
title: "GitLab macOS Runner 的 RVM cd 钩子触发 rvm_bash_nounset"
date: 2026-11-26T14:09:07+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "GitLab", "构建"]
---

## 现象

macOS shell Runner 的 Swift Release 编译完成，双架构检查通过。
归档阶段进入输出目录时，job 以 `rvm_bash_nounset: unbound variable`
退出，GitLab 未收到制品。

## 已验证成因

Runner 用 Bash 登录 shell，RVM 在其中把 `cd` 定义成函数。
job 启用 `set -u` 后，普通 `cd` 进入 RVM 路径并读取未定义变量。
同一登录 shell 能直接复现该错误。

## 有效恢复

Swift 打包阶段只需要切换目录。用 `builtin cd dist` 调用 Bash
内建命令，继续保持 `set -euo pipefail`。发布脚本里同样使用
内建命令进入制品目录。

## 边界

`builtin cd` 适用于只做目录切换的 Bash 步骤。依赖目录变化来选
Ruby 或 gemset 的步骤需要保留相应的环境加载逻辑。

## 证据

同一台 Runner 的 Bash 登录 shell 中，`type -t cd` 输出
`function`。启用 `set -u` 后，`cd /private/tmp` 复现错误，
`builtin cd /private/tmp` 成功。
