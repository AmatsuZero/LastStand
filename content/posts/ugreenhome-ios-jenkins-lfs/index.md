---
title: "Jenkins iOS Agent 的 Git LFS Checkout 失败排查"
date: 2026-10-22T15:22:27+08:00
draft: true
tags: ["Jenkins", "Git LFS", "iOS", "CI/CD", "launchd", "凭证"]
categories: ["绿联工作笔记"]
---

## 背景

某 iOS 工程把约 132 个 vendored gem（iot/vendor/cache/*.gem）通过 git-filter-repo 迁到了 Git LFS 并 force-push。此前这些 gem 是普通 git blob，checkout 不触发 git-lfs。迁移后，Jenkins 的 iOS agent（由 launchd 拉起、无 GUI 会话）第一次 checkout 到含 LFS 内容的版本，问题才暴露。

为什么会「以前没事、今天突然挂」：① 仓库是最近才引入 LFS 的，以前 checkout 根本不触发 git-lfs；② launchd agent 从一开始就没有 GUI 会话 / 完整 PATH，只是以前没被需要。

## 名词解释

- **Git LFS**：Git 大文件存储，把大文件（此处是 gem 包）存到独立对象存储，工作区 checkout 时通过 smudge 过滤器按需下载。
- **smudge / clean / filter-process**：LFS 的过滤器钩子；checkout 时的 smudge 负责把指针换成真实文件。
- **osxkeychain**：macOS 系统级 Git 凭据助手，从登录钥匙串读凭据；无登录会话的后台进程读不到。
- **credential.helper**：Git 的凭据获取机制；空值会清空下层继承的 helper。

## 现象（错误随修复逐层演进）

| 轮次 | 报错 | 所属层面 |
| --- | --- | --- |
| 1 | git-lfs: command not found | agent PATH 不含 Homebrew |
| 2（手动配 filter 配坏） | filter-process: command not found | filter.lfs.process 配成裸 filter-process |
| 3（改绝对路径后） | failed to get: -60008 | osxkeychain 在 launchd 下读不了登录钥匙串 |
| 4（禁用 osxkeychain 后） | batch response: too many authentication attempts | git-lfs 拿不到 LFS 接口凭据 |

三层报错各不相同，是典型的「修好一层、暴露下一层」。

<pre class="mermaid">
flowchart TD
  A[checkout 触发 LFS] --> B{git-lfs 可执行?}
  B -->|command not found| C[PATH 不含 Homebrew]
  B -->|找到| D{凭据能拿到?}
  D -->|-60008| E[osxkeychain 无 GUI 会话]
  D -->|too many auth| F[smudge 无持久凭据]
</pre>

## 根因分析（三层）

### 3.1 找不到 git-lfs —— launchd 进程 PATH 不含 Homebrew

install-agent-ios.sh 生成的 launchd plist 的 EnvironmentVariables 只有 DEVELOPER_DIR / LANG / LC_ALL（+可选 JAVA_HOME），没有 PATH。launchd 默认 PATH 是 /usr/bin:/bin:/usr/sbin:/sbin，不含 /opt/homebrew/bin（Apple Silicon 的 brew）。checkout 触发 LFS 时 exec 不到 git-lfs。

修复：把 filter.lfs.process / clean / smudge 写成 git-lfs 的绝对路径，彻底绕开 PATH。

### 3.2 failed to get: -60008 —— osxkeychain 在无 GUI 会话读不了钥匙串

macOS 默认 credential.helper=osxkeychain（来自 Xcode 系统级 gitconfig）。launchd 后台服务无登录会话，访问登录钥匙串失败 → -60008。

修复：用空值 credential.helper 把它重置（空值在解析时清空下层继承的 helper）。git config --list 仍会显示系统级那行，但实际不调用。

### 3.3 too many authentication attempts —— LFS 拿不到凭据（最关键）

git lfs logs last 显示 smudge 阶段环境里 GIT_ASKPASS=echo（空操作）、AccessDownload=basic。git fetch 能过：Jenkins GitSCM 在 fetch 阶段注入了真正的 askpass 脚本。但该令牌是每次构建临时注入、构建后即删，未持久化。到 git checkout -f 触发 LFS smudge 时，GIT_ASKPASS=echo 且无 credential helper → git-lfs 拿不到令牌 → GitLab 反复 401 → too many authentication attempts。

核心结论：git fetch 能过但 LFS 下载挂，是因为两者拿凭据的时机 / 来源不同——fetch 有 Jenkins askpass，smudge 没有。

修复：把令牌一次性写入文件式 credential store（chmod 600），让 git-lfs 不依赖 GIT_ASKPASS 也能鉴权。credential.helper 设为：先空值（清 osxkeychain）再 store。

## 修复动作（agent 上，一键脚本）

    GITLFS=/opt/homebrew/bin/git-lfs
    git config --global filter.lfs.process "${GITLFS} filter-process"
    git config --global filter.lfs.clean   "${GITLFS} clean -- %f"
    git config --global filter.lfs.smudge  "${GITLFS} smudge -- %f"

    git config --global --unset-all credential.helper
    git config --global --add credential.helper ""
    git config --global --add credential.helper "store --file=${HOME}/.git-credentials-ci"

    git credential-store --file="${HOME}/.git-credentials-ci" store <<EOF
    protocol=https
    host=gitlab-host
    username=oauth2
    password=<令牌>
    EOF

    chmod 600 "${HOME}/.git-credentials-ci"

令牌来源：agent 用户 gitconfig 的 url.*.insteadof（用户 oauth2），已验证对目标仓库有读权限；脚本自动探测复用（env / 已有 store / netrc / insteadof），探测不到才需提供一次。注意 ~/.gitconfig 里另有一个 host 专用的签名仓库 credential helper，与目标仓库 LFS 无关，勿混。

## 验证

    cd /Users/ugreen001/jenkins-agent-ios/workspace/UgreenHome-iOS/app-source
    git lfs fetch origin      # 成功，不再报 too many authentication attempts
    git lfs logs last         # 确认 GIT_ASKPASS=echo 已不影响（store 优先生效）

之后回 Jenkins 重触发，checkout 通过。

## 长期加固 —— ci MR !73（已合并）

让工具链可复现，重装 / 新机器不再踩：Brewfile 新增 git-lfs，provision 时安装；install-agent-ios.sh 生成的 launchd plist 注入 PATH（含 Homebrew bin/sbin，按 brew --prefix 动态推断，Intel / Apple Silicon 兼容）。

## 后续操作

当前 agent 已可用（绝对路径 filter + credential store 在全局 gitconfig，重启不丢）。把 PATH 固化进 plist（可选、不紧急）：在 agent 上、更新到合并后的 main 后重跑安装。非交互命令：

    cd /opt/ugreen/ci && git fetch origin && git checkout main && git pull --ff-only
    printf '\n\n\n' | JENKINS_URL='https://<Jenkins-Controller 地址>'       JENKINS_SECRET='<mac-agent-ios 节点 Secret>'       bash agent/ios/install-agent-ios.sh

JENKINS_SECRET 预设可跳过 Secret 提问；printf 喂空行满足 URL 提问（脚本 set -e，read 遇 EOF 会中断，故不能 < /dev/null）。

## 经验教训

- launchd / 无界面 agent 两件事：PATH 要显式注入（不读 shell 配置）；凭证不要依赖登录钥匙串（osxkeychain 会 -60008），用文件式 credential store / netrc。
- git fetch ≠ LFS smudge：Jenkins 的 GIT_ASKPASS 只覆盖插件自己跑的 git 命令；LFS smudge 是 checkout 时另起的子进程，拿不到那个临时令牌——需要独立的持久凭据。
- 排错要看错误演进：command not found → -60008 → too many authentication attempts 是同一链路的三层，别被最后一层带偏。
