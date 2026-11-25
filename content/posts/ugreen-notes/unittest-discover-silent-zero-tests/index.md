---
title: "unittest discover 静默跑 0 项：测试迁到子目录后入口没跟着改"
date: 2026-11-25T15:00:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "CI/CD", "构建", "CLI", "debug"]
---

## 现象（symptom）

执行 `python3 -m unittest discover -s Tools/ios-ci -p "test_*.py"` 退出码为 0，输出却是 `Ran 0 tests in 0.000s` / `NO TESTS RAN`。同一条命令在项目早期版本中正常，测试文件迁移到 `Tools/ios-ci/tests/` 子目录后开始静默漏跑。因为退出码 0、没有报错，很容易被当成"测试通过"。

## 已验证成因（verified cause）

- 测试文件位于 `Tools/ios-ci/tests/` 子目录，被测模块位于 `Tools/ios-ci/` 包根。Python 3 的 `unittest discover` 默认只递归可被导入的包目录；`tests/` 没有 `__init__.py`，从 `Tools/ios-ci` 起步不会深入该子目录，于是收集到 0 项。
- 把起点改成 `Tools/ios-ci/tests` 后能收集到 825 项，但出现 5 个 `ModuleNotFoundError`（如 `No module named 'app_size_new_resources'`）——被测模块在上一级目录，不在 `sys.path`。
- 再设 `PYTHONPATH=<repo>/Tools/ios-ci` 后，850 项全部被发现并通过（1 skipped）。
- 本机 Homebrew Python（3.15）未安装 pytest；项目测试虽已迁 pytest 并放在 named dependency group 中，但本机退回 `unittest discover` 时仍是唯一可用入口。

## 有效恢复（effective recovery）

```
export PYTHONPATH="$PWD/Tools/ios-ci${PYTHONPATH:+:$PYTHONPATH}"
python3 -m unittest discover -s Tools/ios-ci/tests -p "test_*.py"
```

要点：起点必须是测试文件所在的 `tests/` 目录，`PYTHONPATH` 必须指向被测模块所在的包根，两者缺一不可。把修正后的命令写进本地开发约定，避免旧命令继续被复用。

## 边界（boundaries）

- 本例针对"测试在 `tests/` 子目录、被测模块在上一级包根"的布局；若测试与模块同目录，`-s` 直接指向该目录即可，不需要额外 `PYTHONPATH`。
- 给 `tests/` 加 `__init__.py` 也能让从上一级 discover 递归进去，但会改变导入语义，不如显式指定起点加 `PYTHONPATH` 清晰。
- `Ran 0 tests` 不等于"无失败即通过"：本地脚本或 CI 若靠退出码判断，应把 0 项测试视为失败，至少断言收集数量大于 0。
- 项目已迁 pytest 时优先用项目约定入口；本文只适用于本机没装 pytest、退回 unittest 的情况。

## 证据（evidence）

同一 checkout 三次实跑对比：

- `-s Tools/ios-ci`：`Ran 0 tests in 0.000s`、退出码 0。
- `-s Tools/ios-ci/tests`：收集 825 项，5 个 `ModuleNotFoundError`（被测模块无法导入）。
- `-s Tools/ios-ci/tests` + `PYTHONPATH=$PWD/Tools/ios-ci`：`Ran 850 tests`、`OK (skipped=1)`。
