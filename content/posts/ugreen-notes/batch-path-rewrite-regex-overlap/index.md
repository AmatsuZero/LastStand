---
title: "批量正则改写 __file__ 路径：多条规则会互相叠加，必须全量测试兜底"
date: 2026-11-17T17:16:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "debug", "CLI", "构建"]
---

## 现象（symptom）

把一批测试文件从模块根搬到下一级 `tests/` 目录后，需要批量把文件里 `Path(__file__)` 的相对定位全部改一层（`parents[2]`→`parents[3]`、`.parent`→`.parent.parent`、`with_name("x")`→`parent.parent / "x"`）。写了个 Python 脚本对几十个文件顺序套用多条正则，跑完全量测试炸出近两百个失败和几十个 collection error。

## 已验证成因（verified cause）

失败不是路径算错，而是**多条正则互相叠加**：其中一条规则把 `.resolve().parents[2]` 的方括号数字加一，另一条把 `.parent`（带负向断言 `(?!\.parent)`）替换成 `.parent.parent`。`.parents` 这个属性名恰好以 `.parent` 开头，于是第二条又把第一条已经处理过的 `parents[3]` 前面再插一个 `.parent`，得到 `Path(__file__).resolve().parent.parents[3]`。

这个路径在目录层级里指向了完全错误的位置（仓库的上一级），表现为测试里 `subprocess.run(..., cwd=错误路径)` 抛 `FileNotFoundError`，或断言读不到文件。28 个文件被这样误改。单次看每条正则都"正确"，叠加后才是灾难。

## 有效恢复（effective recovery）

- 先定位叠加模式：grep 出误改特征（如 `.parent.parents[`），统计影响文件数，确认是叠加而非独立错误。
- 加一条"收尾修正"正则把误产物还原：`.parent.parents[N]` → `.parents[N]`，并复查再无该模式、也无 `.parent.parent.parent` 之类三连。
- **根本原则**：批量路径改写后必须跑全量测试兜底，不能只抽查几个文件；正则之间要么合并成一次 pass、要么确保前一条的输出不会被后一条再次匹配。
- 对 `with_name()` 这类"看似路径、实则不同 API"的写法要单独处理——它返回同目录文件，语义上和 `.parent / x` 等价但写法不同，通用正则容易漏或错配。

## 边界（boundaries）

- 只针对"多规则顺序套用到同一批文本"的场景；单条规则不会有叠加问题。
- 负向断言 `(?!\.parent)` 只能防"紧跟着 .parent"，防不住属性名前缀（`.parents`）这类包含关系。
- 批量改写前先备份（git 跟踪的文件天然可回滚），确认能快速 diff 定位误改；不要在不可回滚的提交上裸跑。

## 证据（evidence）

叠加误改 28 个文件，典型症状 `FileNotFoundError` 指向仓库根目录的上一级；加收尾正则修正后，全量 889 passed + 1 skipped、零失败，与迁移前基线一致，证明修正完整且无残留。该坑与"假重复强抽"同属一类：静态看每一步都合理，只有端到端实跑才暴露。
