---
title: "Compose UIKit 启动探针：nil 命中不等于真实触摸路径"
date: 2026-11-13T10:22:00+08:00
draft: true
categories: ["绿联工作笔记"]
tags: ["Xcode", "KotlinMultiplatform", "踩坑", "故障"]
---

## 现象（symptom）

优化构建中的首页设备卡片已显示，XCUITest 判断可点击，真实详情导航也能通过，但 App 内启动探针一直没有记录业务 ready。数据绑定代次、可见性、enabled 和点击 handler 均正常，唯一失败项是 `unobscured`。

## 已验证成因（verified cause）

探针使用 `window.hitTest(point, with: nil)`，要求结果为目标 UIControl 或其子视图。实际命中的是 Compose 的 `OverlayInputView`，控件自身的局部 hit test 才命中 UIControl。

Compose Multiplatform **1.11.1** 的 `InputViews.ios.kt` 第 639–672 行对 nil 事件和 touch 事件采用不同路径：nil 查询直接进入父类实现，touch 查询才判断 interop 区域是否应交给下层原生视图。nil 查询失败不能证明控件被实际触摸遮挡。

另有两个原生边界已通过 UIKit 测试确认：`UIEvent()` 的 type 是 -1，不应假设它是 touch 事件；动态创建的 Objective-C 子类可能共享 Swift 父类元数据，`String(describing: type(of:))` 不一定反映 Objective-C 实际类名，检查运行时类身份应使用 `object_getClass` / `NSStringFromClass`。

## 有效恢复（effective recovery）

观察器保留正常 UIKit 命中检查，仅为已核实的 Compose 路由类型增加保守分支：

1. nil 查询先实际命中路由视图，确认目标点在它的交互范围内。
2. 出现额外可见 Compose 路由层、其他覆盖窗口或未知类型时拒绝判定 ready。
3. 使用公开 UIEvent 子类的只读 type 覆盖，构造不含 UITouch、从不派发的路由查询；只查询刚才已命中的路由视图。
4. 路由确认放行后，仍在真实原生视图分支执行 hit test，要求命中目标控件或其子视图。

不要对整个 window 派发或遍历 touch 查询。Compose 对弹层范围之外的 touch 查询可能触发 outside-click 逻辑，观察器不应改变被测页面。不要为了探针把生产 interop 改为 NonCooperative，也不能直接把 `unobscured` 置为 true。

## 边界（boundaries）

这是绑定当前 Compose 版本和视图布局的内部测量适配，未知变化应失败并保留证据。类名只是进入适配分支的条件，不是可交互的充分证明。升级依赖后需要重新核对源码和真机触摸行为。

该修复只证明业务探针可观测，不证明全新安装、无缓存、系统首帧、完整 trace 或每日 CI 已验收。

## 证据（evidence）

2026-11-13，真实优化包 UI 验收先失败：卡片 exists/hittable 通过，ready 为零。修复后同一专项通过 1 项，进入真实 bundled RN 内容，ready 事件恰好一条。独立 UIKit 测试 12 项通过，覆盖协作路由、原生遮挡、Compose 消费触摸、额外弹层、覆盖窗口和未知类型；不以该小型模拟器 harness 冒充完整宿主 App 的模拟器能力。

上游源码：[Compose 1.11.1 InputViews.ios.kt](https://github.com/JetBrains/compose-multiplatform-core/blob/v1.11.1/compose/ui/ui/src/iosMain/kotlin/androidx/compose/ui/window/InputViews.ios.kt#L639)。

Apple 文档：[UIView.hitTest](https://developer.apple.com/documentation/uikit/uiview/hittest(_:with:)) 允许在非事件处理代码中传入 nil，但具体容器仍可能为不同事件类型实现不同路由。

## 补充：就绪信号必须确认事件已写入

后续定时执行出现一次 App ready 事件缺失：同次样本的卡片和真实详情导航均通过，App 探针最后仍报告遮挡。仅凭这个组合不能确定是生命周期竞争还是具体命中分支；相同视图类名也不是根因证据。应保留具体拒绝原因、路由层数量和观察器停止原因，再从新证据定位，不能放宽遮挡规则。

为避免测试在 App 探针完成之前离开首页，专项 UI 在原计时结束后、点击详情前等待同一样本的 `ready:<sample>`，最多十秒。该等待不延长原 UI 耗时，不充当性能事件。

审查进一步发现，记录器的 `mark` 若返回 Void，容量耗尽或停用时会静默拒绝；探针随后仍可能错误发布 ready。已通过真实 UIKit 运行库回归复现：容量一的记录器被 data-bound 占满后，旧实现仍点亮 ready。恢复方式是让 `mark` 只在实际 append 后返回 true；探针收到 false 时保持 pending，并输出固定的 recording_rejected/event_recording_rejected。修复后该回归通过，同时覆盖 disabled/finished 拒绝。最新独立 UIKit 检查十四项、原生记录器等检查三十八项通过。

这个确认协议只证明 ready 信号与事件写入一致，不证明原来那次漏报的生命周期成因已解决；仍需新的签名设备及每日任务证据。报告只发布白名单字段，不上传任意视图 payload。

## 补充：高层窗口存在不等于覆盖目标点

后续一次真实每日采样中，两个失败样本都是唯一启动、卡片 exists/hittable 为真，App 探针却因 `covering_window` 没有发布 ready。原始诊断指向 level 10 的 `UITextEffectsWindow`。旧代码只按同 scene 窗口可见性、alpha 和层级筛选，随后要求候选列表为空，根本没有检查这些窗口是否接收卡片中心的命中。这个证据确认了被拒绝的分支，但尚不能单独证明该系统窗口在目标点实际透传。

通用恢复边界是对每个候选窗口调用 `candidate.hitTest(candidate.convert(point, from: targetWindow), with: nil)`：只有返回 nil 才继续原有目标窗口与 Compose 检查；返回任何视图都仍视为遮挡。不按系统私有类名放行、不隐藏窗口、不发送触摸。坐标必须先转换，不能把目标窗口中的点直接交给另一个窗口。公开查询可被自定义实现重写，不能承诺其内部绝无副作用；nil 查询仍不同于派发真实触摸。

真实 UIKit 回归还揭示一个容易写错的测试前置：普通 UIWindow 即使 root view 的 hit-test 返回 nil，也可能回退返回窗口自身。这不是真正透传，必须继续拒绝；透传窗口测试应使用确实将窗口自身结果转换为 nil 的公开 UIWindow 子类，同时保留“返回窗口自身仍拒绝”的负例。完整干净回归在旧代码上为17项通过、2项失败（目标点透传和窗口位于目标点之外），修复后19项通过；偏移窗口真实拦截、hidden/alpha/equal-level 和原 Compose 门禁均覆盖。第一次小型 harness 缺少新源码依赖造成零测试构建失败，不计作 RED。

报告只发布有界且一致的候选/透传窗口数量，要求整数类型并满足 `0 <= passthrough <= candidate <= 16`；原始窗口查询数组不发布。新增过滤回归先失败、随后全量672项通过。这些是通用 UIKit 与报告契约证据；仍需签名真机实际观察该系统窗口返回值及完整每日复验，不能用单元测试代替自然失败成因的确认。
