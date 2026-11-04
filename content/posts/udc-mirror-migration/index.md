---
title: "UDC 镜像仓库迁移踩坑记录"
date: 2026-10-21T13:55:41+08:00
draft: true
tags: ["GitLab", "镜像", "CI/CD", "Nexus", "CocoaPods", "同步"]
categories: ["绿联工作笔记"]
---

## 背景

一次把 UDC 相关仓库从外部 GitLab 源迁到内网 GitLab + Nexus 的迁移，踩了十来个坑。本文把每个坑的「现象 → 根因 → 修复」记下来，方便后续再做类似镜像同步时直接对照。迁移目标是：把外部源（记为 gitlab-cloud）的仓库改写成指向内网 GitLab 的 podspec，并同步 Maven 产物到内网 Nexus。

## 名词解释

- **Pull Mirror（GitLab 原生镜像）**：GitLab 自带的仓库镜像功能，让镜像仓库与上游完全一致。
- **Nexus**：内网私有仓库（Maven / raw 等），用来托管同步过来的二进制与 Maven 产物。
- **Protected 变量**：GitLab CI 变量标记为 Protected 后，只在保护分支 / 标签上注入。
- **members/all**：GitLab 查组成员接口，带 /all 才会包含从父组继承的成员。

## 一、GitLab 原生镜像根本没法用

一开始想直接用 GitLab 自带的 Repository Mirroring（pull mirror），结果它和「改写 podspec URL」的需求天然冲突：原生 pull mirror 会让镜像仓库与上游完全一致，等于把我们在内网侧做的 podspec URL 改写每次同步都覆盖回去。而且源仓库里的 podspec 仍带外部域名，我们用的同步 bot 是源项目的只读成员，push 回源会 403 "not allowed to upload code"——源仓库修不了。

结论：必须用自定义同步脚本（拉上游 → 重做改写 → 推送），不能用原生镜像。

## 二、git push --mirror 被拒（隐藏 ref 问题）

自定义脚本第一次用 git push --mirror 推到内网 GitLab，报 deny updating a hidden ref（针对 origin/HEAD 等隐藏引用）。原因：--mirror 推送所有引用，包括隐藏的，GitLab 拒绝更新隐藏 ref。修复：改用普通推送 git push origin <branch> --force + git push origin --tags -f。手动探测过 create / delete 分支都正常，普通强推没问题，只有 --mirror 这个产物会触发隐藏 ref 拒绝。

## 三、内部 CI Runner 连不上外部源（最致命）

整套「GitLab 定时任务跑同步」的设计最后是栽在网络层。内部共享 CI Runner（android-sdk 镜像）连外部源 443 直接 TCP 建连超时：Failed to connect to gitlab-cloud port 443 after 75009 ms。这是建连阶段就挂，在 TLS / 鉴权之前——不是 DNS、不是 token 问题。本机（带 VPN）用同样 URL 能 git ls-remote 成功；Runner 到内网 GitLab / Nexus 是通的，只有外部源不通（典型白名单 / 出网未放行）。

影响：同步脚本必须「读」外部源，所以 Runner 上跑不了。临时方案：改为本地（带 VPN 的机器）手动执行脚本同步。彻底修复三选一：① 给 CI 网络放行外部源出网 / 白名单；② 给 sync job 注入 HTTPS 代理；③ 在有 VPN 的机器上注册专属 Runner 并打 tag 限定 job。

## 四、Protected CI 变量 + 未保护分支 = 变量注入不进来

第一次跑定时流水线，脚本报 UDC_GC_READ_TOKEN required，还以为是变量没建好。根因：UDC_* 变量设成了 Protected，而当时 release/1.8.0 还没设为保护分支 → 定时流水线拿不到变量。项目已有的 NEXUS_PASSWORD 也是 Protected，同样会缺失。修复：把 release/1.8.0 设为 Protected，变量就正常注入。教训：在保护分支上跑、又依赖 Protected 变量的流水线，务必先确认分支已保护。

## 五、CI 契约测试挡路

改 .gitlab-ci.yml 加了 sync job，流水线 verify-ios-ci / verify-android-ci 直接挂。仓库里有路由契约测试，断言纯 web 触发只跑 build-ios-xcframework。一开始写裸 rules: - if: $CI_PIPELINE_SOURCE == "web"，导致 sync-udc-mirrors 也出现在 web 触发里，破坏测试。修复：web 触发加变量门控 && $UDC_SYNC_ENABLED == "true"。但凡动 .gitlab-ci.yml 都可能踢到这套契约测试，先有心理准备。

## 六、权限查询要用 members/all（含继承）

查自己在目标组的权限，用 GET /groups/526/members 返回空，差点以为没法建推送 token 只能找人帮忙。实际用 /groups/526/members/all（含从父组继承的成员）发现是继承 Owner，不是直接成员但有权限。于是能自己建 Group Access Token（write_repository）当 UDC_MIRROR_PUSH_TOKEN，不用求人。教训：看「有没有权限操作某组」时，members 直接成员会漏掉继承权限，用 members/all。

## 七、存在两个 Nexus，别用错

Maven 同步时有两个 Nexus 实例，混淆会一直 401。正确：HTTPS 实例（仓库 maven-ugreenhome-release）；错误：旧内网明文 HTTP 实例（拒绝 basic auth → 401）。教训：统一走内网 Nexus 的 HTTPS，使用固定的发布账号。

## 八、clone 报错被 2>/dev/null 吞掉，误判

脚本最初 git clone ... 2>/dev/null，失败时只打印一句 clone failed，看不出是网络还是鉴权，浪费一轮排查。修复：把 stderr 捕获到文件再显示真实错误，才定位到是 TCP 连接超时（网络层）而非 token。教训：CI / 脚本里的失败路径至少要把真实错误输出出来，别静默吞 stderr。

## 九、命令行多行 --description / -m 会搞挂 shell

用 glab mr create --description '多行...' 或 git commit -m '多行' 时，换行把 shell 搞乱，命令没提交成功，得重跑单行版。教训：在 shell 里调 glab、git 时，commit message 和 MR description 一律用单行，或先写临时文件再 --file 读。顺带：glab mr merge 对自己是 405（不能 self-merge），需要人工合入或有合并权限。

## 十、submodule 的 WIP 不能靠 git stash 带走

本地有个 ugreenhome-strings 是子模块（gitlink），切分支 / 建分支前 git stash 不会带它走，差点把同事的改动弄丢或错位。处理：单独 git -C ugreenhome-strings checkout <原分支> 把子模块指针切回，再确认主仓 git status 无意外改动。教训：切分支涉及 submodule 时，stash 不够，要显式处理子模块。

## 当前最终状态

- 定时任务（Pipeline Schedule #2）：已删除。
- sync-udc-mirrors job：MR !36 已合入，rules 改为 when: never（CI 不跑同步）。
- MR !35（Nexus 复用 + 错误输出）：已关闭，未合入。所以 release/1.8.0 脚本仍需显式 export UDC_NEXUS_USER / UDC_NEXUS_PASSWORD。
- 模式：本地（带 VPN）手动执行 scripts/sync-udc-*.sh 同步，直到 Runner 获得外部源出网权限。

本地手动同步命令（token 通过 CI 变量 / 环境变量注入，不在脚本里硬编码）：

    export UDC_GC_READ_TOKEN=<外部源只读令牌>
    export UDC_MIRROR_PUSH_TOKEN=<内网 GitLab 推送令牌>
    export UDC_NEXUS_USER=<Nexus 用户>
    export UDC_NEXUS_PASSWORD=<Nexus 密码>
    ./scripts/sync-udc-ios-mirror.sh   # git -> 内网 GitLab/home/ios
    ./scripts/sync-udc-maven.sh        # maven -> 内网 Nexus

两个脚本均幂等：git 走 tree-diff 跳过未变；maven 走 HEAD 跳过已存在。
