---
title: "内网 GitLab 私有 group 下建镜像仓：public 被拒 + 新空仓 git push 分支被 pre-receive 拦，须 API 建默认分支"
date: 2026-11-21T10:32:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["GitLab", "CocoaPods", "踩坑", "依赖"]
---

## 现象（symptom）

在内网 GitLab 的一个私有 group（`<内部域名>/<group>`）下用 API 新建开源库的镜像仓，准备给 CocoaPods 私有 specs 用，连撞两堵墙：

1. 创建项目时传 `visibility=public`，返回成功但项目实际是 `private`；再显式 `PUT /projects/:id -F visibility=public` 报：
   `public is not allowed in a private namespace.`
2. 从本地 `git clone --mirror` 好的裸库 `git push --mirror` 到新仓，所有 refs 被 `pre-receive hook declined`；改为只推单个 tag（`refs/tags/<ver>:refs/tags/<ver>`）却成功。但接着想从 tag 建 `main` 分支时又被拒：
   `A default branch (e.g. main) does not yet exist for <group/project> ... Ask a project Owner or Maintainer to create a default branch`。

## 已验证成因（verified cause）

- **group 可见性天花板**：私有 group 下的项目不允许设为 public；项目 visibility 不能高于所属 namespace 的上限。API 创建时用 `visibility=public` 会被静默降级成 private（不报创建失败），后续显式改 public 才给出明确报错。
- **空仓默认分支陷阱**：新建的空项目没有任何分支（HEAD 指向不存在的 ref）。该实例的 pre-receive hook 要求「默认分支必须已存在」才允许 git push 分支/tag 之外的写入，形成先有鸡还是先有蛋的死锁——git push 分支被拦，而默认分支又只能靠分支推送产生。tag 推送不受此限（因为 tag 不是分支），所以 tag 能进。

## 有效恢复（effective recovery）

1. **接受 private**：镜像仓保持 private 即可，不必强求 public。CocoaPods / CI 走凭证注入——利用全局 git `url."https://oauth2:<token>@<内部域名>/<group>/".insteadOf https://<内部域名>/<group>/` 规则，让私有 specs 与 components 的 HTTPS 地址自动带凭证；CI 里用 `POD_GIT_USER/POD_GIT_TOKEN` 的 insteadOf 写法。这与已有 FB 系镜像仓（同样 private）一致。
2. **API 建初始分支**：用 GitLab 文件创建端点一步建立 `main` 默认分支：
   `POST /projects/:id/repository/files/README.md -F branch=main -F 'content=<...>' -F commit_message=...`
   建完 GET `/projects/:id` 确认 `default_branch` 变为 main。
3. **tag 用普通 push（不带 --mirror）**：先 `git config --unset remote.origin.mirror`（否则 `--mirror can't be combined with refspecs`），再 `git push origin <ver>:refs/tags/<ver>`；`git ls-remote --tags` 校验 tag 的 commit SHA 与上游一致。
4. spec 的 `source.git` 指向内网镜像仓 URL、`source.tag` 用该 tag，写好后 `pod ipc spec` 转 JSON、CocoaPods 能解析即可。

## 边界（boundaries）

- 若 group 本身是 public 或 internal，则 public/internal 可见性可用，无需此 workaround；本文只针对私有 group。
- 只推所需 tag（而非 `--mirror` 全量）在大仓/弱网下更稳，也规避 pre-receive 对分支的拦截；但全 history 不会进内网，若需要完整历史得另想办法（且仍会被默认分支规则挡住分支推送）。
- `git ls-remote` 匿名可读不代表 `pod install` 一定能拉——关键看 CocoaPods 实际用的 git 是否带凭证。
- 新 tag 别覆盖已推的旧 tag（旧 tag 可能已被 spec 引用）。

## 证据（evidence）

- `POST /projects` 传 public → 响应 `visibility: private`；`PUT` 改 public → `public is not allowed in a private namespace.`
- `git push --mirror` → 每个 ref `pre-receive hook declined`；单 tag push、`ls-remote --tags` 确认 tag SHA 与上游 GitHub tag 一致。
- `git push origin <ver>:refs/heads/main` → pre-receive 报「A default branch (e.g. main) does not yet exist」；`POST /projects/:id/repository/files/README.md -F branch=main` 后 `default_branch=main`。
- `make pods REPO_UPDATE=1` 成功解析到内网 tag 的 spec 并生成 lock，`make verify-lock` OK。
