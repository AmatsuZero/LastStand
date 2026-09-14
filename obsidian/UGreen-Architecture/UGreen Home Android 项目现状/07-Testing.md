# Testing

[返回调研总览](00-调研总览.md) · [构建实测](06-Build-Time.md) · [完整测试源码清单](附件/测试源码清单.csv)

> **静态快照与执行结果：2026-09-14。** 本页清点 `/Users/daubert/UGreen/ugreen-home` 与同分支 Shared 隔离导出（commit `4f36969b7894df90af09fe9ae3a2797c8cd117ed`）中的测试配置和源文件；下列 `@Test` 静态计数不是 runner 已发现或已执行的案例数。

## 1. 结论与边界

- Android 主工程存在 **93** 个 Kotlin/Java 测试源文件和 **254** 个静态 `@Test`：`src/test` 为 **72 / 216**，`src/androidTest` 为 **21 / 38**。其中 **29** 个 `ExampleUnitTest` / `ExampleInstrumentedTest` 示例模板文件含 **29** 个注解；排除它们后的静态计数为 **64 文件 / 225 个 `@Test`**。
- `calendarview` 的 `androidTest` 并非只有模板：除 1 个示例外，4 个日历工具测试含 18 个 `@Test`；`app` 另有 `IPCDeviceSettingActivityBackStackTest` 两个仪器化案例，会启动 Activity、写入 DAO 并使用 instrumentation，不能误报为纯本地单测（`app/src/androidTest/java/com/ugreen/home/ui/dev/IPCDeviceSettingActivityBackStackTest.kt:1-102`）。
- Shared `release/1.7.0` 快照有 **74** 个 Kotlin 测试 source-set 文件、**545** 个静态 `@Test`；Android 有关的 `commonTest`、`jvmTest`、`androidHostTest`、`androidDeviceTest` 合计 **72 / 544**。其余 `iosTest` 为 **2 / 1**，只作为 iOS 共用层交叉引用，不在本 Android 正文重复展开。
- Android README 要求主工程与 Shared 分支名称一致（`README.md:75-82`）；故本页以主线程创建的隔离导出 `/private/tmp/ugreen-android-architecture-20260914/shared-release-1.7.0-9q2u2wrq`（含严格 pin 的 strings）作为 Shared 静态基线；不引用旧 iOS 工作树的行号。Shared 仍是主工程的 Composite Build 候选来源而不是 Android 仓库子模块；原工程配置路径状态和替代接入边界见 [调研方案与执行记录](附件/调研方案与执行记录.md)。本节的 Shared 数据只描述该只读提交，**本身不证明原配置路径或可执行性**；同名分支的 Composite Build 配置及具体任务执行证据另见第6节和 Build Time。

静态计数与第6节实际执行结果分开记录。构建/测试命令、退出码和JUnit报告已经取得；App instrumentation 已在隔离模拟器执行，逐案例结果另列；覆盖率报告仍未取得。

## 2. 主工程测试分布

| 模块 | 静态 source-set 清点 |
|---|---|
| `app` | test: 19 文件 / 70 @Test（示例 1 / 1）<br>androidTest: 2 文件 / 3 @Test（示例 1 / 1） |
| `bluetooth` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `calendarview` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 5 文件 / 19 @Test（示例 1 / 1） |
| `camera` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `common` | androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `core/core-device` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `core/core-device-setup` | test: 5 文件 / 13 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `core/core-messaging` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `core/core-ui` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `core/core-util` | test: 2 文件 / 3 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `domain` | test: 6 文件 / 25 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `net` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `qrcode` | test: 1 文件 / 1 @Test（示例 1 / 1）<br>androidTest: 2 文件 / 4 @Test（示例 1 / 1） |
| `repository` | test: 7 文件 / 17 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| `rn-platform` | test: 20 文件 / 70 @Test（示例 0 / 0） |
| `ugreen-media/player-runtime-android` | test: 5 文件 / 10 @Test（示例 1 / 1）<br>androidTest: 1 文件 / 1 @Test（示例 1 / 1） |
| **合计** | `test`: **72 文件 / 216 `@Test`（示例 14 / 14）**<br>`androidTest`: **21 文件 / 38 `@Test`（示例 15 / 15）** |

### 模板与真实测试的口径

`ExampleUnitTest.*` 与 `ExampleInstrumentedTest.*` 按文件名标作 **AGP/KMP 示例模板**，并仍保留在 CSV，避免“删掉模板”造成清单不完整。其余文件不因名称包含 `Test` 就自动等于业务/集成覆盖：CSV 中没有 `@Test` 的文件标为 **测试辅助/fixture**；含 `@Test` 的文件标为 **测试源码**。注解计数规则为 Kotlin/Java 中行首 `@Test`，不展开参数化、动态生成、继承、忽略或 runner 过滤规则。

完整逐文件路径、来源、source set、语言、静态注解数与模板/辅助分类见 [测试源码清单 CSV](附件/测试源码清单.csv)。CSV 共 **167** 行：Android **93** 行，配套 Shared `release/1.7.0` **74** 行；这是文件清单，不是执行报告。

## 3. Shared：仅保留 Android 相关静态边界

| Shared source set | 文件 | 静态 `@Test` | 模板文件 / 注解 | Android 关系 |
|---|---:|---:|---:|---|
| `commonTest` | 65 | 535 | 0 / 0 | 多平台公共测试；可能进入 Android target，不能由文件数推导实际 Android 执行数 |
| `jvmTest` | 1 | 4 | 0 / 0 | `core-util` 显式启用 JVM（`core/core-util/build.gradle.kts:12-18`）；不是 Android 设备测试 |
| `androidHostTest` | 4 | 3 | 2 / 2 | 主机侧 Android KMP 测试；`feature-ota` 的 mock 环境文件无 `@Test` |
| `androidDeviceTest` | 2 | 2 | 2 / 2 | 设备侧 KMP 测试；`core-net`/`core-database` 显式 `enableAndroidDeviceTest = true` |
| `iosTest` | 2 | 1 | 0 / 0 | iOS-only；仅在 CSV 中保留，以便全量 source-set 追溯 |
| **合计** | **74** | **545** | **4 / 4** | Android 相关四类：**72 文件 / 544 `@Test`** |

- Android KMP device source set 的声明和 AndroidX runner 依赖可见于 `core/core-net/build.gradle.kts:15-20,38-55` 与 `core/core-database/build.gradle.kts:21-26,45-63`。
- `core-secure-package` 对 `testAndroidHostTest` 加入可选 Rust-host 依赖，仅在 `ugAgeRustHostTests` 为真时生效（`core/core-secure-package/build.gradle.kts:201-209`）；这只是 task 配置，不是执行证据。
- 与 iOS 共用层的历史执行及平台测试说明请交叉阅读 [iOS Testing](../UGreen%20Home%20iOS%20项目现状/07-Testing.md)，不得以 iOS 的结果替代 Android/Shared 本轮结果。

## 4. Gradle 测试接入与静态可执行面

| 层级 | 静态配置证据 | 可执行面与限制 |
|---|---|---|
| Android 本地单元测试 | 通用 library 约定注入 `testImplementation libs.junit`、`testImplementation libs.kotlinx.coroutines.test`（`baseModuleBuild.gradle:35-42`） | 标准 AGP variant 的 `test<Variant>UnitTest` 任务应由配置生成；App 有 `domestic`、`overseas` 两个 flavor（`app/build.gradle:61-93`），本轮实际执行 App domesticDebug 与 library debug unit test；具体调用和结果见第6节 |
| Android instrumentation | 通用约定使用 `androidx.test.runner.AndroidJUnitRunner`、AndroidX JUnit/Espresso（`baseModuleBuild.gradle:6-11,39-42`）；个别未采用通用脚本的模块也显式配置 runner，例如播放器 runtime（`ugreen-media/player-runtime-android/build.gradle:13-18,93-95`） | 已枚举到 `connectedDomesticDebugAndroidTest` 等任务；本轮采用 assemble + adb install + `am instrument` 在 API36 模拟器运行 App 案例，而非通过 connected task 调度；见[任务枚举](附件/测试任务枚举.md)与第6节 |
| App variant | App 打包 artifact hook 显式跳过名以 `AndroidTest`、`UnitTest` 结尾的 variant（`app/build.gradle:298-302`） | 该跳过仅说明不为测试 variant 注册重命名拷贝任务；不等于禁用测试 |
| Shared KMP public/common | `commonTest` 依赖 `kotlin.test`（如 `core/core-net/build.gradle.kts:38-42`）；`core-util` 开启 JVM | KMP task 名称与 host/target 由实际 Gradle/Kotlin 插件配置决定；本轮仅实际执行 `:core-util:jvmTest`，不把其他 source set 的存在写成执行通过 |
| Shared Android device/host | `core-net`、`core-database` 选择 device source set；secure-package 有可选 host JNI 前置任务 | device/host 测试未运行；本轮 App instrumentation 已在 API 36 隔离模拟器执行，但因 `DatabaseHolder not initialized` 导致 2 个 back-stack 案例失败；JDK/SDK与主App构建已验证，不代表 Shared device/host 测试任务通过 |

主工程还直接纳入已初始化的 `ugreen-media` 模块；其 `player-runtime-android` 贡献 **6 文件 / 11 `@Test`**（`test` 5 / 10、`androidTest` 1 / 1），纳入上表 Android 合计。是否能构建这些 native/播放器依赖，不能由该静态清单推断。

## 5. UI、集成与覆盖率

- **UI/instrumentation：** `app` 的 back-stack 测试使用 `AndroidJUnit4`、`InstrumentationRegistry` 和 `startActivitySync`，有真实测试宿主、数据库状态和 Activity 生命周期需求；`qrcode`、`calendarview` 等也含 `androidTest`。本轮已运行 App 的全部3个 instrumentation 案例（1通过、2初始化失败），并观察首次启动 UI；不代表其他模块或完整 UI 自动化通过。
- **集成：** 文件名中的 `Acceptance`、`Bridge`、`Runtime`、`Policy`、`Flow` 只能说明测试意图，不能自动证明已连接账号、IoT 设备、网络后端或 RN runtime。当前未另发现命名清晰的 Android end-to-end/integration test source set 或报告。
- **覆盖率：** 在两个工程的 Gradle 构建脚本与 properties 中，未静态发现 `jacoco`、`kover`、`testCoverageEnabled`、`enableUnitTestCoverage` 或 `enableAndroidTestCoverage` 配置。本轮执行 Android App、Android root、Shared standalone 三份 `tasks --all`，均退出0，未枚举到任务名以 `jacoco` / `kover` 开头或包含 `coverage` 的任务（见[任务枚举](附件/测试任务枚举.md)）。未新增覆盖率插件或取得报告，覆盖率仍为 **未取得**，而非0%。
- **非 Gradle 测试：** 静态扫描 Android 主工程（排除 `.git`、`.gradle`、`build`、`node_modules`）未发现已跟踪的 Node (`*.test.js`/`*.mjs`) 或 Python (`test_*.py`/`*_test.py`) 测试文件，也未发现 `package.json`、`pyproject.toml`、`pytest.ini`、`tox.ini` 测试入口。因此没有可在不运行 Gradle 的现有纯 Node/Python Android 主工程测试可移交；此结论不外推到 iOS 仓库 Tools。

## 6. 本轮实际执行结果

| 套件 | 执行 / 通过 / 失败 | Wall time | 结果 |
|---|---:|---:|---|
| Android `:app:testDomesticDebugUnitTest` + `testDebugUnitTest --continue` 聚合 | **216 / 214 / 2** | 41.32 秒 | `IpcSettingPageUiTest`：期望 `OD600_SERIES`、实际 `ID500_SERIES`；`OtaCmpDebugScenariosTest`：期望 `FAILED`、实际 `PROGRESSING`。App 自身70个案例（68通过、2失败）；其他14个模块合计146个全通过。持久证据见下方CSV/JSON，原临时报告在后续clean前已提取。 |
| Shared `:core-util:jvmTest`（release/1.7.0@4f36969b） | **37 / 37 / 0** | 15.08 秒 | 8 suites，0 skipped；只代表 core-util JVM 测试。 |
| App AndroidJUnitRunner，API36 arm64 模拟器 | **3 / 1 / 2** | runner报告0.02秒（非含启动wall time） | 示例 `useAppContext` 通过；两个 back-stack 案例在 `@Before` 和 `@After` 均触发 `DatabaseHolder not initialized`，共4条失败事件，未执行路由断言。 |

App instrumentation 已执行：API 36 隔离模拟器安装临时签名 APK 后运行 3 个案例，1 通过、2 因 `DatabaseHolder not initialized` 失败；同时完成离线启动冒烟（`SplashActivity` → `RootActivity`，`am start -W` 返回成功，等待10秒后仍在 RootActivity 并显示隐私协议页，未点击同意，已归档 UI dump/截图）。Shared Android device test、真机、真实账号/IoT 设备及覆盖率仍未执行。Shared host 已补充执行，结果含失败/超时；其他模块 instrumentation 仅完成可构建的6个 APK。过程与边界见[Android运行实测](附件/Android运行实测.md)；证据见 [Android模拟器运行验证](附件/Android模拟器运行验证.json)、[instrumentation 输出](附件/instrumentation-all.log)。逐案例摘要见 [JUnit执行案例.csv](附件/JUnit执行案例.csv)，套件汇总见 [JUnit套件汇总.json](附件/JUnit套件汇总.json)。静态清单仍为 Android 93 文件/254 注解、Shared 74 文件/545 注解，不替代实际执行结果。

## 7. 追加实测：Shared host 与库模块 instrumentation

补充结果见[补充验证与未完成项](附件/补充验证与未完成项.md)：Shared 非 OTA/sample host 聚合退出0，但仅计入已生成报告的 151 个通过案例；另行 OTA 单例1个失败，两组合计152个（151/1）；全量 host 聚合约15分钟超时，且 sample 编译存在 unresolved reference。OTA 单例因 host JVM 缺少 `Dispatchers.Main` 失败。Android library instrumentation 仅6个测试 APK 构建成功，API36 模拟器运行9个案例，6通过、3因模板包名断言失败；其余模块因资源/JNI冲突未生成 APK。

## 8. Shared worktree 新基线复测

`release/1.7.0@3737bbe7`（strings `313160d8`）仅 Shared worktree，不含 iOS Pods，源码未改；不替代前文 `4f36969b` 历史快照。实际报告：非OTA模块151/151通过（含core-util的33个），但同一调用的sample测试源码编译失败；OTA排除 `OtaFeatureApiTest` 后273个中271通过/2失败；单独public API探针1个失败。去重合计 **425个报告案例：422通过、3失败**，不是完整host套件通过；其中JNI互操作用例的开关未启用，runner记录通过不代表JNI实际验证。见[Shared worktree host 实测](附件/Shared-worktree-host实测.md)。

## 9. 复核边界

测试失败保留原样，不修改业务或测试源码来制造通过；没有取得 coverage report；静态配置扫描与实际任务枚举都未发现相应入口，覆盖率记为未取得而非0%。`adb shell` 退出0及 `INSTRUMENTATION_CODE: -1` 均不代表测试通过；本轮以逐案例状态和 runner 失败报告为准。
