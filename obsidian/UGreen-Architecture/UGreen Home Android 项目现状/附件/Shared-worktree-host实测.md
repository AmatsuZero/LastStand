# Shared worktree host 实测

## 基线与隔离

- 本轮仅在 `/private/tmp/ugreenhome-shared-release-1.7.0` 执行 Shared 测试，不包含 iOS 主工程或 Pods。
- 固定分支/提交：`release/1.7.0@3737bbe730e1942d134f6d9f8bf1788e8cd7e31a`；strings：`313160d89cd6985e9bc7ef3d0a976da233feaa25`。未拉取或更新该分支。
- 与此前 `4f36969b` 导出快照不同，结果单列，不能互相覆盖或混算。
- JDK 21.0.7、现有 SDK/Gradle 缓存，`--offline --no-daemon --max-workers=4 -Pugreen.enableIos=false`；未修改业务/测试源码或原 Shared checkout。

## 执行结果

| 调用 | 退出码 / 耗时 | 已生成的 JUnit 报告 | 其他结果 |
|---|---|---|---|
| `testAndroidHostTest -x :feature-ota:testAndroidHostTest` | **1 / 40.81秒** | **151个，151通过** | 同一调用的 `sample:compileAndroidHostTest` 失败，没有 sample 案例执行报告。不能把本次 Gradle 调用记作成功。 |
| `:feature-ota:testAndroidHostTest`，通过独立 init script 排除 `OtaFeatureApiTest` | **1 / 22.56秒** | **273个，271通过、2失败** | 任务设90秒上限，未触发超时。排除类不算通过或 runner skipped。精确耗时以JSON为准。 |
| `:feature-ota:testAndroidHostTest --tests …OtaFeatureApiTest.childPageSnapshot_usesExistingKmpParentCheckFactWithoutAnotherRequest` | **1 / 7.68秒** | **1个失败** | 无筛选 init script，单例复现 host Main dispatcher 问题。 |

三组去重合计 **425个报告案例：422通过、3失败，runner skipped=0**。这不是完整 Shared host 套件：sample 编译阻塞，`OtaFeatureApiTest` 仅选跑1个，其余未运行。之前 `core-util` 的33个host案例已包含在151个中，不重复相加。

`core-secure-package` 的 `AndroidAgeInteropTest` 在 `ugAgeRustHostTests` 未开启时直接返回，因此JUnit“通过”不代表实际执行JNI/age互操作。证据：`core/core-secure-package/src/androidHostTest/kotlin/com/ugreen/core/securepackage/AndroidAgeInteropTest.kt:32-35`。

## 失败定位（源码均以本轮3737bbe7为准）

### 1. sample：旧参数名阻塞测试编译

旧快照中 `sample:compileAndroidMain` 的 unresolved reference 本轮未再出现，业务源码编译已通过。当前阻塞转到 **测试源码编译**：

- `sample/src/commonTest/kotlin/com/ugreen/sample/demo/ota/OtaApiDebugVMTest.kt:62` 调用 `OtaStartCommand(..., allupgrade = true)`。
- `feature-ota/src/commonMain/kotlin/com/ugreen/feature/ota/domain/model/OtaModels.kt:20-23` 实际参数为 `allUpgrade`。

这是命名契约不匹配；当前未更改测试，不能将其算作测试通过。

### 2. OTA Repository：相同时间的帧优先级不符合测试预期

`OtaRepositoryTest.repository_prefersActiveSnapshotWhenConflictingSameSnFramesHaveNoReportTime` 期望 `DOWNLOADING`，实际 `DONE`。

`feature-ota/src/commonMain/kotlin/com/ugreen/feature/ota/data/mapper/OtaMapper.kt:48-59,69-79` 按 `reportTime`、是否属于 `ACTIVE_PHASES` 比较；`ACTIVE_PHASES` 同时含 `DOWNLOADING` 和 `DONE`。测试无reportTime，两帧优先级相同，保留输入中的首个DONE帧。应先确认DONE在该协议中的语义和同时间冲突策略，不能仅为通过测试直接删掉DONE。

### 3. OTA UI：失败文案与测试契约不一致

`OtaUiContractTest.mainSuccessWithFailedChildShowsChildAndOverallFailure` 期望 `INTERRUPTED_RETRY`，实际为 `null`。该例其他状态断言先通过，失败在progressLabel。

`feature-ota/src/commonMain/kotlin/com/ugreen/feature/ota/ui/model/OtaUpgradeUiModel.kt:279-283` 当前仅在单设备升级、总体进度不大于0时设置WAITING，其他情况返回null。因此多设备失败场景不会产生测试期待的重试文案。这是可复现的UI契约差异，尚未替产品确定应改实现还是测试预期。

### 4. OTA public API：测试缺少Main调度器前置条件

单例实际异常链：`Dispatchers.Main` 未配置 → platform Main dispatcher初始化失败 → `android.os.Looper.getMainLooper()` 未mock。

- 测试 `feature-ota/src/commonTest/kotlin/com/ugreen/feature/ota/publicapi/OtaFeatureApiTest.kt:209-224` 创建页面并observe，未配置Main dispatcher。
- `feature-ota/src/commonMain/kotlin/com/ugreen/feature/ota/publicapi/OtaPageSession.kt:117` 默认使用 `Dispatchers.Main`。

`runTest` 不等于自动替换平台Main dispatcher。后续可在隔离测试fixture中验证dispatcher注入，但本轮没有修改测试环境来把原失败改成通过；也不据此推断Android真机缺少Main线程。

## 证据与剩余边界

- [机器汇总、命令及失败栈](Shared-worktree-host实测.json)
- [逐案例CSV](Shared-worktree-host案例.csv)
- [非OTA完整日志](Shared-worktree-host-without-ota.log)
- [OTA筛选运行日志](Shared-worktree-ota-without-public-api.log) / [筛选与超时设置](Shared-worktree-OTA筛选.gradle)
- [public API单例日志](Shared-worktree-ota-public-api-probe.log)

原始XML按每组执行结束立即保存，避免后续同一Gradle task覆盖；临时证据根目录见JSON的`localEvidenceRoot`。本轮未运行Shared device tests、真实账号/IoT联调或覆盖率；没有复跑Android主工程，也未提交或推送本次文档增量。
