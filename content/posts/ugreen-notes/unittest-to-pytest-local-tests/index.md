---
title: "本地 Python 单测迁 pytest：named group 隔离 CI、importlib 解同名与契约测试边界"
date: 2026-11-17T17:15:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["踩坑", "构建", "CI/CD", "依赖", "CLI", "debug"]
---

## 现象（symptom）

一个已用 uv 统管的 Python 工具集，测试全是标准库 `unittest`，散落在各模块下（有的在模块根、有的在 `tests/` 子目录），测试入口靠 Makefile 一张硬编码 `<模块>:<发现目录>:<包根>` 映射表驱动。要改成 pytest + 统一目录，且明确"只本地跑、不进 CI"——但 CI 里那些 `uv run` 调用会不会被拖去下载 pytest、同名测试文件会不会冲突、需要真机环境的测试怎么办，都需要先取证而不是照搬常规做法。

## 已验证成因（verified cause）

逐项最小实跑得到：

- **uv 没有 `test` 子命令**：它只有 run/sync/pip；能声明测试配置的是 pytest 的 `[tool.pytest.ini_options]`。pytest 直接兼容 `unittest.TestCase`（最小样例 `1 passed`），98 个测试文件无需重写断言。
- **pytest 写进默认依赖会污染 CI**：CI 里所有 Python 调用都是默认 `uv run`（不带额外 group）。若把 pytest 放进默认 dev 依赖，这些调用会同步它、在无网 runner 上失败。
- **同名测试文件冲突**：不同模块有同名 `test_runner.py`/`test_gitlab.py`，pytest 默认 import mode 按文件名当模块名，一次性收集报 `import file mismatch`。
- **需要真实环境的契约测试不该进本地全集**：个别测试要真实 Pods + Xcode 真编译 Swift/ObjC++ 源码，本机没装就失败——但它是真 bug 修复的回归守护，不能删，只是不属于本地 pytest。

## 有效恢复（effective recovery）

- **pytest 放进 named dependency group**：根 `pyproject.toml` 写 `[dependency-groups] test = ["pytest>=8"]`。实测默认 `uv run`（CI 形式）**不装 pytest**（`ModuleNotFoundError`），只有 `uv run --group test` 才装。这是"本地测试工具不污染 CI"的关键，比写进默认 dev 依赖安全得多。
- **配置集中在 pyproject**：`[tool.pytest.ini_options]` 里声明 `addopts = "--import-mode=importlib"`（解同名冲突）、`pythonpath`（共享源码 + 各模块包根 + 各 `tests/` 目录）、`testpaths`（列各测试目录）。Makefile 入口简化成 `uv run --group test python -m pytest`，删掉硬编码映射表。
- **同名 + 测试间互相 import**：`--import-mode=importlib` 解决同名冲突，但测试之间 `from test_xxx import ...` 的 import 还要能解析——把所有 `tests/` 目录也加进 `pythonpath`。
- **真机契约测试从 testpaths 排除**：测试保留、不删除，由真机 CI/手动跑；在配置里注明"故意不纳入"的理由。

## 边界（boundaries）

- 只适用于"测试本地跑、CI 不跑 Python 单测"的场景；若 CI 也要跑，pytest 必须预置/缓存到 runner，named group 的隔离方式要相应调整（让 CI 显式加 `--group test`）。
- `--import-mode=importlib` 改变了模块导入语义，测试间 import、fixture 引用要重新验证；把所有 tests 目录加 pythonpath 是配套手段。
- 排除契约测试意味着本地 pytest 不是"全部测试"——需要如实标注哪些测试在别处跑，别让人以为集合已经完整。
- "有用但本地跑不了"的判定要基于产品代码与依赖形态是否仍在，而不是"当前失败就删"。

## 证据（evidence）

named group 隔离实测：默认 `uv run python -c "import pytest"` 报 ModuleNotFoundError，`uv run --group test` 装到 pytest 9.2.0。迁移后全量单测 889 passed + 1 skipped、零失败；`--import-mode=importlib` + pythonpath 纳入各 tests 目录后，同名文件冲突与测试间 import 全部消除。被排除的契约测试经核查产品源码与源码形态依赖均仍在，确认非失效。
