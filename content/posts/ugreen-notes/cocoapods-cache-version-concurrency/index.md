---
title: "CocoaPods 并发初始化缓存导致 VERSION 与 lock 文件消失"
date: 2026-11-16T18:17:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["CocoaPods", "GitLabRunner", "CI/CD", "踩坑", "构建"]
---

## 现象（symptom）

两个 macOS CI Job 在同一 Runner 账户下同时执行 Pods 安装，其中一个在外部 Git Pod 的预下载阶段失败：

```text
Failed to download '<Pod>': No such file or directory @ apply2files -
<cache>/Pods/External/<Pod>/<slug>.lock
```

另一个 Job 可以继续成功。出错文件属于 CocoaPods 下载缓存，并非项目的 `Podfile.lock`。

## 已验证成因（verified cause）

核对锁定的 CocoaPods 1.17.0 源码：

- `lib/cocoapods/downloader.rb:41` 每次缓存下载均创建一个 `Cache` 对象。
- `lib/cocoapods/downloader/cache.rb:164-171` 的 `ensure_matching_version` 读取 `Pods/VERSION`，不匹配时删除整个缓存根目录，然后用 `open('w')` 写入版本。即使版本已经匹配，仍然重写文件。
- `open('w')` 先截断文件。并发初始化者可以读到空版本，把它当作版本不匹配，执行 `root.rmtree`。目录里的在用缓存锁同时被删除。
- 同文件 `Cache.lock` 的独占锁退出路径在第 134 行调用 `File.delete(lockfile)`，此时可以抛出上述 `apply2files ... .lock` 异常。

两个版本完全相同的进程就可以触发这条竞态，不要求存在显式清缓存命令。单个安装中的并行下载线程也可能参与竞争，但上述实际预下载错误发生在 Analyzer 阶段，不能归咎于后续 `parallel_pod_downloads` 选项本身。

## 有效恢复（effective recovery）

临时目录对照实验验证了两个处理方向：

1. 所有协作者在执行缓存初始化时，先获取同一把跨进程文件锁。锁文件放在 `Pods` 的旁边，不能放在会被 `root.rmtree` 删除的目录里，也不要在释放锁后删除锁文件。下载、解压和编译不需要放入这把初始化锁。
2. 每个并发参与者使用独立缓存根目录，也可以消除本实验中的竞争，但会增加缓存副本。只按 Job 隔离不能防止该 Job 内部下载线程争用同一缓存。

推荐评估“初始化锁 + 按项目和 CocoaPods 版本隔离的缓存目录”。通过 `CP_CACHE_DIR` 指定缓存目录，避免旧版本或未加载修复的其他工程访问同一个根目录。所有访问该目录的安装入口必须加载相同的保护。

候选初始化保护的核心（仅固定版本适配示例，尚未上线）：

```ruby
def ensure_matching_version
  root.parent.mkpath
  File.open("#{root}.init.lock", File::RDWR | File::CREAT, 0o644) do |lock|
    lock.flock(File::LOCK_EX)
    super
  ensure
    lock.flock(File::LOCK_UN)
  end
end
```

此例应在项目管理的适配层通过 `prepend` 加载，并对锁定版本设置兼容性检查；不要直接编辑 Runner 中已安装的 gem。正式实现还需明确锁等待预算、失败输出和回归覆盖。

## 边界（boundaries）

- 文件锁是协作协议，无法阻止不遵守协议的进程执行 `pod cache clean --all` 或删除缓存上层目录。
- 初始化锁本身不阻止另一个 CocoaPods 版本在之后初始化时清空正在使用的缓存，因此需要版本隔离。
- 添加项目和版本命名空间时，要保留 Runner 已配置的缓存存储与清理边界。已有专用 Runner 通过 `CP_CACHE_DIR` 把缓存放在受容量、保留时间控制的目录中；如果新入口忽略该变量，改写到通用 HOME 缓存，数据就会移出专用清理范围。需定义明确的 base 优先级、迁移与重复调用规则，并让 shell 与 Fastlane 入口使用一致的规则；仅保留既有完整路径而跳过版本隔离，也无法满足隔离目标。
- 锁等待预算除了大于零，还必须为有限数值。Ruby 的 `Float("1e309")` 返回正无穷，只有 `positive?` 检查会接受它，令超时 deadline 也成为无穷；应同时检查 `finite?` 并覆盖溢出输入。
- 不要只吞掉 `File.delete` 的 `ENOENT`：缺失锁可能意味着实际缓存内容也已消失。
- `--repo-update` 处理的是 Specs 新鲜度，不处理下载缓存被并发删除的问题。
- 清空整个缓存后重试无法修复这条竞态，还可能影响其他在运行的任务。
- 实际 CI 日志确认了同机并发、相同工具版本和相同异常；缺少删除方堆栈，仍不能排除其他清理程序。SSH 访问当时超时，未检查远端进程或执行清理。
- 下述结果是缓存 API 压力实验，不是完整工程 Pods 安装、Archive 或性能流水线验收。正式变更尚需真实 Runner 并发复跑。
- Job 生命周期重叠不等于 Pods 安装阶段重叠。并发验收要核对真实安装区间，最好通过受控同步屏障稳定触发相同初始化窗口；两次先后成功只能证明顺序运行与缓存复用。

## 证据（evidence）

本机 Ruby 3.4.11、Bundler 4.0.11、CocoaPods 1.17.0，使用项目锁定的 bundle 和真实 `Cache.new` / `Cache.write_lock` API，在临时目录运行。没有下载工程依赖，也未修改真实 CocoaPods 缓存。

先进行 8 线程、1,200 次操作，原始共享缓存出现 39 次异常，其中包含 `cache.rb:134` 的 `.lock` 缺失。

随后使用 2 个进程、各 4 个线程，每组 1,200 次操作：

| 配置 | 异常数 | 其中 apply2files 缺失锁 |
| --- | ---: | ---: |
| 原始共享缓存 | 111 | 32 |
| 共享缓存，所有初始化使用同一文件锁 | 0 | 0 |
| 每个并发参与者独立缓存 | 0 | 0 |

竞态实验的错误数会随调度变化；这些比例不能作为 CI 失败率或性能开销指标。零异常只表明这组局部验证通过。

后续入口审查只读核对了真实专用 Runner 配置：其 `CP_CACHE_DIR` 位于专用维护目录下，没有设置新 helper 的 base 覆盖变量。使用相同配置调用候选 helper 后，输出切换为通用 HOME 缓存，确认它不在专用清理根目录下；没有修改 Runner 或删除真实缓存。另一次成功流水线中，Build 的 Pods 安装在本地时间 18:57:41 完成，单测直到 18:59:24 才开始安装，不能作为并发安装验收。锁等待预算检查则直接复现了 `1e309` 被解析为非有限正数；未启动无限等待进程。

上游对应源码：CocoaPods 仓库 `1.17.0` 标签下的 `lib/cocoapods/downloader/cache.rb`、`lib/cocoapods/downloader.rb`、`lib/cocoapods/config.rb` 与 `lib/cocoapods/installer.rb`。
