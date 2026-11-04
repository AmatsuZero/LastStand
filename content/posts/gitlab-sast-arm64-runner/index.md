---
title: "GitLab SAST 在 ARM64 Runner 上的故障复盘"
date: 2026-10-16T15:32:18+08:00
draft: true
tags: ["GitLab", "SAST", "Semgrep", "CI/CD", "ARM64", "安全扫描"]
categories: ["绿联工作笔记"]
---

## 背景与目标

把 Semgrep SAST 接到 iOS 工程的 CI 上，原本的扫描 job 一直跑不通。本文记录从 Rosetta 崩溃到原生 ARM64 镜像上线的全过程，以及其间踩到的十几个坑。结论是：本机 / 流水线显示「非阻断成功」都不算验收通过，真正的完成标准是——正式 job 执行成功、新报告有效、GitLab 解析成功、目标分支配置一致。

## 名词解释

- **SAST（Static Application Security Testing，静态应用安全测试）**：不运行程序，靠扫描源码发现安全缺陷。
- **Semgrep**：一款开源的静态分析 / SAST 引擎，GitLab 官方 SAST analyzer 底层就用的它。
- **Rosetta**：Apple 在 ARM64 macOS 上转译运行 AMD64 二进制的兼容层；转译路径异常时会有看不懂的分配错误。
- **ARM64 / AMD64**：两种 CPU 指令集架构。混用会导致需要转译，转译层出问题是本次故障根源。
- **gl-sast-report.json**：GitLab SAST 的标准报告文件，有官方 schema 校验。

## 最终结果（验收口径）

修复后，正式 semgrep-sast job 切换到固定 digest 的原生 ARM64 镜像。正式 job（Runner 13 上）成功运行；285 条规则扫描 2209 个文件，产生 111 条原始发现；gl-sast-report.json 状态为 success 并通过官方 schema 校验；服务端确认扫描 SUCCEEDED、errors=[]。

需要明确：扫描恢复 **不等于** 111 条发现已修复，也不代表所有语言 / 子模块 / 整条 iOS 流水线都已验收。平台汇总的 102 条与原始 111 条口径不同，不应直接要求二者相等。

## 现象与根因

最初 job 报错：semgrep scan did not complete successfully / engine was killed / <code>rosetta error: could not find free space for allocation size ...</code>。Semgrep 的通用建议是加内存、降并发。但真正有区分度的证据是 Rosetta 的异常分配错误——当时扫描程序运行在 ARM64 宿主上，却要执行 AMD64 二进制，走了转译路径。

所以**根因是跨架构执行链路失败，而不是普通 OOM**。不能仅凭 engine was killed 断言内存不足，也不能把 allocation 里的 free space 理解成磁盘空间不足。对照验证：同一批输入在原生 ARM64 分析器 + 引擎上，2 CPU / 1536 MiB 限制下 exit=0、OOMKilled=false，产生稳定一致的 111 条发现。

<pre class="mermaid">
flowchart TD
  subgraph bad[修复前]
    A1[Mac Studio ARM64] --> A2[Linux ARM64 Docker]
    A2 --> A3[AMD64 分析器/引擎]
    A3 --> A4[Rosetta 转译]
    A4 --> X[引擎异常退出 扫描失败]
  end
  subgraph good[修复后]
    B1[Mac Studio ARM64] --> B2[Linux ARM64 Docker Runner 13]
    B2 --> B3[原生 ARM64 分析器 + Semgrep 引擎]
    B3 --> B4[规则扫描 + 报告转换]
    B4 --> B5[gl-sast-report.json 上传]
    B5 --> Y[GitLab 解析成功]
  end
</pre>

## 修复路线

1. **分清平台支持、Runner 执行、扫描器兼容性**：SAST 与 Dependency Scanning 是不同 job，一个成功不能证明另一个正常；管理员接口返回 403 只说明当前账号无权限，不能据此认定实例不支持功能。
2. **保留现有 ARM64 机器，构建原生镜像**：镜像保留官方分析器的扫描与报告转换逻辑——从固定源码提交编译 Linux ARM64 分析器，安装 ARM64 Semgrep，复用官方规则文件。并读取分析器与 semgrep-core 的 ELF 头，确认它们确实是 AArch64 二进制，避免「ARM64 容器里仍然转译 AMD64 引擎」。
3. **本地先验证扫描与报告**：在隔离的临时 Docker daemon 中构建扫描，关闭网络、非 root、限制 CPU / 内存，记录真实退出码与 OOMKilled；清除旧报告后重扫，对比发现 ID / 位置，再做精确 schema 校验。
4. **补齐可选追踪功能的边界**：官方入口除了扫描器，还可能执行 vulnerability-finding tracking 后处理。本次只编译扫描器不算完整保留官方入口；检查到的 tracking-calculator 镜像是 AMD64 且拿不到原生源，因此不宣称等价，而是建立独立的非阻断实验 job，并在入口增加保护：若实例要求可选签名追踪则退出 78。
5. **真实 Runner 暴露实例功能差异**：实验 job 成功拉起镜像，但实例实际下发了 vulnerability_finding_signatures，触发保护退出 78。确认功能取舍后，只在该 job 环境移除这个可选标记，其余功能标记保留，未改实例全局开关。
6. **从独立实验收敛到正式 job**：先在实验 job 验证方案，再把配置移到正式 semgrep-sast 并删除实验 job，最后才标记 MR 就绪合入。

## 踩过的坑（现象 → 根因 → 修复 → 防护）

1. **把通用内存提示当成根因**：更直接的证据指向 Rosetta 跨架构异常。修复为分析器与引擎均 ARM64 原生执行；防护是加内存前先分类故障，同时收集镜像架构、二进制架构、容器状态与底层异常。
2. **宿主机能联网，Docker 构建仍超时**：TLS 超时 / EOF，PyPI 大包反复中断。根因是宿主机、Colima VM、daemon、构建容器的代理与网络路径不同，回环地址不能作为 VM 的代理地址。修复是在授权范围内建临时回环隧道与独立 daemon、预下载锁定 wheel；防护是分别验证各层网络、重试有边界、不放宽 TLS / 哈希校验。
3. **构建成功不等于保留官方功能**：把编译后的 Go 分析器误当完整入口。修复是明确 /analyzer 与 /analyzer-binary 职责、增加追踪保护；防护是改造时同步审查 Dockerfile、入口脚本、后处理、功能变量与报告契约。
4. **本地成功，CI 却退出 78**：CI 实例下发了本地没有的可选签名追踪标记。修复是确认后只在目标 job 排除该标记；防护是尽早安排真实 Runner 探针，覆盖实例变量与模板行为。
5. **保护脚本对功能标记格式判断不足**：逗号格式通过，换行 / 等号 / 分号会漏判。修复改为检测完整功能名字面包含并补充边界用例；防护是有上游语义时优先保持一致。
6. **Bash 替换语法可能在 sh 中失败**：<code>${变量//文本/}</code> 在 POSIX shell 下报 Bad substitution。修复用 POSIX printf + sed 并在 /bin/sh 下验证；防护是 CI 前置脚本明确 shell 契约。
7. **精简镜像缺 Git，非 root 缺可写 HOME**：扫描器提示找不到 Git，或建日志目录 PermissionError。修复是用含 Git 的完整运行时镜像、本地非 root 设 HOME=/tmp；防护是验收实际运行时依赖与权限。
8. **ENTRYPOINT / CMD 混淆，旧报告误判**：无 ENTRYPOINT 时多传 run 导致调用错误；旧 SARIF / JSON 残留。修复是按默认 /analyzer run 执行、验收前删已知生成文件；防护是每次验收绑定精确镜像 digest、源码提交与新产物。
9. **schema 校验器退出 0 但内容可能无效**：负向样本输出 Content is invalid 而 CLI 仍返回 0。修复是检查实际校验输出、正向报告必须明确 Content is valid；防护是给校验加负向对照。
10. **本地测试环境错误混入产品故障**：Ruby / Bundler 路径不匹配、代理使 HTTPX 缺 socksio、沙箱内端口绑定失败。修复是用已配置的 Ruby、按需要处理继承代理、授权环境重跑端口测试；防护是把环境错误、已有基线失败与本次回归分开记录。
11. **CI Lint 成功不等于真实 job 会运行**：dry-run push 模拟可能因已有 MR 的 workflow 规则不创建 job。修复是核对模板展开与真实 MR pipeline，用实际 Runner 结果验收；防护是验收顺序固定为配置校验 → 实际执行 → 产物校验 → 服务端解析。
12. **远端镜像与配置可能指向不同修订**：保护脚本修正后下游仍指向旧 digest，靠审查发现。修复是更新到最终 digest 并重跑测试再推送；防护是验收记录同时绑定源码提交、构建配方、镜像 digest 与 App 提交，不用浮动 tag 上线。
13. **上传成功不等于 GitLab 已解析**：产物返回 201 但状态仍为 CREATED。修复是等待并查询 securityReportSummary 确认 SUCCEEDED、errors=[]；防护是报告上传只是中间证据，终态必须查平台解析。
14. **临时 Docker 清理留下网络命名空间**：删临时目录时 exec/netns/default 提示 Device or resource busy。修复是只卸载精确临时挂载再删根目录、关隧道核端口；防护是清理前先确认 DockerRootDir，不对默认 daemon 广泛清理。

## 为什么耗时较长，下次怎么缩短

本次不是单点改 YAML，而是串联了架构兼容、原生镜像构建、网络下载、官方后处理契约与私有实例验收五类问题。流程上可避免的返工包括：较晚发现可选 tracker 契约、真实实例变量较晚进入验证、初期对 ENTRYPOINT / HOME / 旧报告处理不严、镜像更新与 App digest 同步靠审查补漏。

更短的验证闭环建议：① 第一轮就拿全 Runner 架构、镜像与二进制架构、完整底层错误；② 构建前检查完整官方入口与可选后处理，尽早明确功能边界；③ 先做最小原生探针并尽早跑一次真实 Runner；④ 网络故障单独诊断、缓存已校验依赖；⑤ 扫描成功后依次验证新产物、精确 schema、GitLab 解析；⑥ 只保留一次有明确止点的实验，验收后立即收敛到正式 job；⑦ 每阶段结束同步状态、限制与证据。

## 上线后的维护边界

- 当前镜像由工程自行构建维护，不应视为官方完整 ARM64 镜像；升级要重查源码、规则、依赖与后处理兼容性。
- 可选 vulnerability-finding signatures 追踪当前关闭；基础 SAST 扫描与报告解析已验证，不代表完整追踪能力恢复。
- 保留 allow_failure: true，尚未实施按漏洞数量 / 严重级别阻断合并策略。
- 扫描不拉取子模块，本次结果不能当作完整 KMP 子模块覆盖验收。
- 两个 Objective-C 头文件有解析警告，不能宣称完整语言覆盖；SwiftLint 不能替代安全扫描。
- Dependency Scanning 的成功与 SAST 修复分别记录，不能据此宣称所有 iOS 依赖都已完成漏洞匹配。
- 正式 job 引用的远端 digest 是生产依赖，不能作为「测试镜像」清理；本地临时验证资源已清理。

## 追溯（内部标识，叙事用，不附链接）

- 合入 MR：!58（feature/1.8.0，合入提交 2ee3444…）
- 最终流水线：Pipeline 5028
- 正式 SAST 验收 job：11647（Runner 13）
- 实验成功 job：11644
- 追踪功能保护退出的对照 job：11624
- 最终镜像：固定 digest 的原生 ARM64 镜像 semgrep-sast-arm64（由 CI 仓库 docker/semgrep-sast-arm64/ 维护，配套测试 test_semgrep_sast_arm64_image.py）

## 总结

本次失败的主因是：ARM64 宿主上运行 AMD64 的 Semgrep 二进制，经 Rosetta 转译崩溃。日志里的「可能内存不足」是通用提示，并未证实普通 OOM。修复耗时较长还叠加了两个问题：Docker 镜像与 Python 依赖下载不稳定反复超时；原生镜像缺少可选的漏洞签名追踪组件，而实例启用了它，导致首次 CI 验证被保护检查拦下。最终改用原生 ARM64 扫描器，并靠端到端验收确认恢复。
