---
title: "UG *-bin 重发与 BLFD 踩坑总结"
date: 2026-10-18T13:42:37+08:00
categories: ["绿联工作笔记"]
tags: ["iOS", "CocoaPods", "BLFD", "LibraryEvolution", "GitLabCI"]
aliases: ["/posts/ug-bin-resend-blfd/"]
---

## 适用范围

- 应用：`home/ios/ugreenhome`
- 发布脚本：`home/cicd/ci`
- 组件：`home/ios/components/*`

时间跨度：从开启 `BUILD_LIBRARY_FOR_DISTRIBUTION`（BLFD）开始，到 18 个 `*-bin` 组件重发、真机验证、cicd 收口 MR 为止。

## 0. 什么是 BLFD，为什么要开

BLFD = `BUILD_LIBRARY_FOR_DISTRIBUTION = YES`，是 Swift 的 Library Evolution / Module Stability 开关。开启后，编译器在生成二进制的同时输出一份 `.swiftinterface` 文件，完整描述模块对外暴露的 API。Importer 编译时优先读取 `.swiftinterface`，从而让一个预编译的 Swift 二进制框架可以被不同 Swift / Xcode 版本的 consumer 导入，避免小版本差异导致 ABI 破坏。

UG 的 `*-bin` 组件是通过 CocoaPods 分发的预编译二进制 framework，开发机、Runner CI、本地环境用的 Xcode / Swift 版本不可能完全一致。不开 BLFD 时，Swift 编译器小版本差异就可能让 consumer 在链接 / 运行时出现 `Symbol not found` 或 `dyld: cannot load`。开启后，一次发布即可跨多个 Xcode 版本使用，不用为每个 Xcode / Swift 版本各打一份二进制。

## 1. 基本策略（先记结论）

- `*-bin` 二进制只能由远端 GitLab tag 流水线触发打包，禁止本地 `pod repo push` / 本地打 zip；
- 应用侧依赖切换必须走 git worktree，不要直接推 `feature/1.8.0`；
- Nexus 是 raw 仓库（zip + `.sha256` 侧车文件）；Specs 仓库不变量：同版本 zip 覆盖禁止（cicd MR !35 加固）；
- 远端 tag 流水线用 `UG_COMPONENT_UPSTREAM` 变量覆盖，让 RxRelay / RxCocoa 等从 RxSwift 仓库的 tag 发布。

## 2. BLFD 相关坑

**坑1：module 名 == 顶层类名，swiftinterface 无法被导入（JXSegmentedView）**

`module JXSegmentedView` 里又声明 `class JXSegmentedView`，生成的 `.swiftinterface` 出现自限定引用，依赖方导入时 module / type 歧义，编译失败（不只是告警）。影响：所有 import 它的 `*-bin` 消费者全部坏掉。

处理：该组件不发布 `*-bin`，应用侧回退源码 pod `JXSegmentedView 1.4.1`（UH 系 bin 不引用它，无 resilient 符号风险）。manifest 里标记 `skip: true`。

**坑2：BLFD 的 swiftinterface 必须可独立导入才安全**

之前只在消费者侧红线才发现坏二进制。收口：在 `lib.sh` 加 `verify_swiftinterface_module_collision`，在 stage（xcframework 构建后）确定性拦截——顶层 `class/struct/enum/protocol/typealias` 与 module 同名，或存在 `Module.Module` 自限定引用。这样坏二进制在发布期就被挡下，不会流到 Specs。

**坑3：组件 podspec 前缀不一致（FCUUID）**

原 podspec 用 `spec.` 前缀而非 `s.`，插入的 BLFD 代码块写死了 `s.`，导致 lint / 生成失败。处理：按实际前缀修正后重新打 tag。

## 3. 发布流水线 / 脚本坑

**坑4（根因）：同版本 sha256 不一致**

BLFD 批量重传了 zip，但 `push-spec.sh --resume` 跳过了 spec 更新，导致 Specs 指向旧 / 缺失的 zip，`pod install` 时 sha256 对不上。根因修复：组件版本号 bump（如 `5.7.1 -> 5.7.1.1`），并禁止同版本覆盖（MR !35）。

**坑5：push-spec.sh 两个写入路径都被守卫**

复查结论：`push-spec.sh` 是唯一写 Specs 的路径，已被「已存在即拒绝」预检 + `pod repo push --no-overwrite` 双重保护，同版本覆盖事故不可能再发生（已加注释固化不变量）。

**坑6：glab api 包装只传了 $1**

`api()` 把写操作（POST）静默变成 GET，导致改操作看似成功实际没做。修复：改为 `GLAB api "$@"`。

**坑7：set -e 下 `[ cond ] && echo` 在函数尾部返回 1**

函数最后一句是 `[ ... ] && echo`，条件为假时整条返回 1，在 `set -e` 下直接退出脚本。修复：改成 `if [ cond ]; then echo; fi`。

**坑8：UG patch tag 在 GitHub 上游不存在**

Moya / RxRelay / RxCocoa 的 UG patch 版本（5.12.2.1 等）GitHub 上游没有，lint 失败。处理：把 spec 的 `:git` 指向 UG 镜像而非 GitHub。

**坑9：并发 specs clone 竞争**

12 条流水线同时 clone 同一个 Specs 仓库，偶发竞争失败。处理：分批重试。

**坑10：应用侧流水线失败，因 revert commit 只留在本地没推**

JXSegmentedView 回退 commit 忘了 push，导致远端流水线 5343 红；补推后 5344 绿。教训：本地验证通过 != 远端有这个 commit，发 MR 前确认已 push。

**坑11：glab api 间歇性空响应**

`rc=0` 但 stdout 为空（快速连续调用时）。批量 python 脚本据此判断会误判。处理：用单次 shell 命令 + grep 复核，别轻信批量循环结果。

**坑12：/dev/stdin 管道被 heredoc 消费函数覆盖**

把内容通过 stdin 喂给一个内部用 heredoc 的函数，heredoc 会覆盖 stdin。处理：改用临时文件传参。

## 4. Git / 工作流坑

**坑13：同一分支不能在两个 worktree 同时检出**

`feature/1.8.0` 已在主 worktree 检出，想在 republish worktree 再 checkout 会报 `already used by worktree`。处理：该分支只能在主 worktree 更新；republish worktree 用独立分支。

**坑14：含子模块的 worktree 不能用 git worktree remove**

报 `working trees containing submodules cannot be moved or removed`。处理：`rm -rf` 工作目录，然后 `git worktree prune`。

**坑15：删掉会话工作目录会让后续所有 Bash 命令失效**

会话的工作目录就是被删的 worktree 路径；`rm -rf` 之后，Bash 工具每次都先 chdir 到该路径失败，所有命令返回空。处理：删之前先确认它不是会话 cwd；若已删，重建该目录即可恢复。

**坑16：MR 合并后远端分支被 GitLab 自动删除**

`git push --delete` 报 `remote ref does not exist`——分支其实已随 MR 合并被自动删。处理：本地残留的 remote-tracking ref 用 `git branch -dr origin/branch` 清掉。

**坑17：fetch / push 到内网 GitLab 间歇性 SSL / 连接重置**

`SSL_ERROR_SYSCALL` / `Connection reset by peer`，多为瞬时；重试即可（`ls-remote` 正常说明网络 / 鉴权是好的）。

## 5. 工具 / REPL 坑

**坑18：git push 的进度输出让 REPL 解析崩溃**

push 的 progress 行里带冒号，REPL JSON 解析报 `Unexpected token ':'`。处理：加 `--no-progress`，或把输出重定向到文件再 cat。

**坑19：glab mr create 内联 heredoc 让 REPL 解析崩溃**

命令里内嵌 heredoc 直接 `Unexpected EOF`。处理：先用文件写 MR 描述，再 `--description "$(cat /tmp/mrdesc.txt)"`。

## 6. 收口 MR 清单

- 应用侧 MR !99（ugreenhome）→ `feature/1.8.0`：17 个 `*-bin` 升 `.1` + JXSegmentedView 回退源码（已合并）；
- cicd MR !35：同版本 zip 覆盖改为硬失败（必须 bump 版本）；
- cicd MR !36（→ main）：BLFD 碰撞守卫 + manifest JXSegmentedView skip + push-spec 不变量注释（已合并）；
- 16 个旧的 library-evolution MR 已关闭；lottie-ios MR !4 已合并（4.6.0.3 tag 对齐）。

## 7. 验证结论

- 18 / 18 `*-bin` 组件经远端 tag 流水线重发，sha256 一致；
- 真机验证通过：UGIconButton 正常渲染、Lottie 正常播放、无 dyld `Symbol-not-found` 崩溃。

## 名词补充

- **Library Evolution / Module Stability**：Swift 通过 `.swiftinterface` 描述模块 API，使消费端能跨编译器版本导入预编译框架的能力；BLFD 即开启该能力的编译开关。
- **resilient 符号**：开启 library evolution 后，module 内部符号可采用 resilient 形式，允许在不破坏二进制兼容的前提下扩展——这也是为何某些组件不能简单回退源码。
- **Nexus raw 仓库 / 侧车文件（sidecar）**：Nexus 的 raw 类型仓库存放任意二进制文件；`.sha256` 侧车文件与 zip 一并上传，供 `pod install` 校验完整性。
- **`--no-overwrite`**：`pod repo push` 的防覆盖选项，配合「已存在即拒绝」预检，确保 Specs 中同一版本指向的制品不可被二次改写。
