# Build Time

[返回调研总览](00-调研总览.md) · [测试现状](07-Testing.md)

> 所有构建均在 `/private/tmp/ugreen-android-architecture-20260914/android` 隔离副本执行；Shared 使用与 Android 同名的 `release/1.7.0@4f36969b` 导出，业务源码未修改；原工作树的并发变化及经审批恢复见执行记录。

## 1. 实测结果

| 场景 | 结果 | Wall time |
|---|---|---:|
| `./gradlew projects`（同名 Shared） | 成功；含 Shared Composite Build 与全部 Android modules | 65.51 秒 |
| `clean :app:assembleDomesticDebug --no-build-cache` | **BUILD SUCCESSFUL**；954 actionable tasks，943 executed | **103.89 秒** |
| 单文件变更后 `:app:assembleDomesticDebug --no-build-cache` | **BUILD SUCCESSFUL**；47 tasks executed；`compileDomesticDebugKotlin` 实际执行，文件已还原 | **33.24 秒** |
| 还原源码后 `:app:assembleDomesticDebug :app:assembleDomesticDebugAndroidTest` | **BUILD SUCCESSFUL**；950 tasks，88 executed；用于模拟器验证，不作为 clean/增量性能样本 | **41.22 秒** |

产物为未签名 `com.ugreen.home` domesticDebug APK（minSdk 28，arm64-v8a/armeabi-v7a）；另以临时调研证书签名副本，在 API 36 隔离模拟器完成安装与启动冒烟。未使用生产签名、未发布。产物校验见 [APK产物校验](附件/APK产物校验.json)。

## 2. 分支与路径诊断

- Android README `:75-85` 要求 Android 与 `UgreenHome-Shared` 分支同名。
- 原配置 `../UgreenHome-Shared` 不存在；此前使用 Shared `feature/samzhjiang/explore@96785f44` 时配置失败：`:domain-product` 不存在。该失败是分支不配套的历史诊断。
- 当前基线改用 Shared `release/1.7.0@4f36969b`，包含 `domain-product`，配置检查与主 App 构建均通过。此验证不等于原平级路径已恢复；它证明同名固定提交可被当前 Android 工程解析。

## 3. 环境与缓存口径

Gradle 9.4.1、AGP 9.2.1、Kotlin 2.4.0；Temurin 21.0.7 运行 Gradle；Android SDK 36；domesticDebug。源树的 `.git`、`.gradle`、`build` 排除在复制外；Gradle user cache、init scripts 和镜像复用。故这是隔离源码 + 现有用户缓存样本，不是全冷构建，也不是稳定中位数。

完整命令与摘要见附件：[构建执行记录](附件/构建执行记录.md)、[clean 摘要](附件/clean-build-摘要.log)、[增量摘要](附件/incremental-build-摘要.log)。错误的 Shared 分支和错误 clean task 仅作历史诊断，不计入成功基线。

## 4. 可复现性与误差边界

完整参数见[构建结果](附件/构建结果.json)。Clean 前删除隔离 Shared 生成目录的准备过程不计入103.89秒；Android clean + assemble均在该计时内。使用 `--no-build-cache` 禁止Gradle任务输出缓存恢复，但并未清除用户依赖缓存、Gradle守护进程/JIT影响或系统文件缓存；不与 iOS 数字直接作性能优劣比较。依赖下载准备耗时未单独测量（N/A）。

第一次新复制源码装配228.00秒（915 tasks executed）发生在正式clean基线前；首次误指定Shared根clean task的10.01秒属于调研命令错误。两者均不混入正式clean/incremental基线。该阶段 APK 属于增量实验产物；随后业务文件按字节还原，并重新装配 App 与 AndroidTest（41.22秒）。安装验证使用重新装配后的临时签名副本，不使用旧 marker 产物、不发布；见[Android运行实测](附件/Android运行实测.md)。

证据：[构建环境](附件/构建环境.json)、[增量变更与还原](附件/增量变更与还原.json)、[隔离清理范围](附件/隔离清理范围.json)、[源工程保护校验](附件/源工程保护校验.json)。
