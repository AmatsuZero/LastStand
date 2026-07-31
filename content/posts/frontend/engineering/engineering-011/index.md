+++
title = "前端性能监控"
date = '2025-08-07T00:00:00+08:00'
lastmod = '2025-10-23T00:00:00+08:00'
draft = false
weight = 11
tags = ["面试", "前端", "工程化", "前端性能监控", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 大纲

我们会从以下三个方向来讲解埋点与监控的知识：

- 什么是埋点？什么是监控？
- JS 中实现监控的核心方案
- 写一个“相对”完整的监控实例

## 一、什么是埋点？什么是监控？

在日常沟通中，我们经常会把【埋点】和【监控】放到一起说，但是它们在本质上是有一定的区别的：

### 1. 埋点

埋点主要用于**收集用户行为数据**。在日常开发中，我们会通过 **在前端代码中插入代码或脚本的方式** 来实现埋点功能。

埋点的主要作用就是：**捕获特定用户行为（如点击、浏览、提交表单、页面跳转等）以及关键业务数据（如下单金额、商品类别等）**

在日常开发中，埋点的实现方案大致可以分为以下三大类：

- **手动埋点**：在代码中手动加入记录代码来捕获特定事件。
- **自动埋点**：利用 DOM 事件代理等技术来捕获页面上所有事件，从而减少手动配置。
- **可视化埋点**：通过工具界面标记需要采集的元素和事件，可以不用手写代码。

### 2. 监控

而监控则主要关注 **系统的性能和稳定性**。在日常开发中，我们会通过 **采集页面加载时间、资源请求、错误日志等数据** 的方式来实现前端监控。

监控的主要作用就是：**及时发现并定位页面性能瓶颈或代码异常，目的是为了保障系统不出 bug**

在日常开发中，监控一般需要完成以下三大部分：

- **性能监控**：如：首屏加载时间、页面交互耗时、资源加载耗时等。
- **错误监控**：捕获 JavaScript 错误、网络请求失败、资源加载异常等。
- **用户体验监控**：收集白屏、卡顿等影响用户体验的问题等。

### 区别总结

| 维度 | 前端埋点 | 前端监控 |
| --- | --- | --- |
| 目标 | 捕获用户行为数据 | 监控系统性能、错误、稳定性 |
| 数据类型 | 用户点击、表单提交、页面跳转等 | 页面加载时间、错误日志、卡顿情况等 |
| 实现方式 | 手动埋点、自动埋点、可视化埋点 | 错误捕获、性能指标采集 |
| 核心关注点 | 用户行为、业务数据 | 系统Bug、性能优化 |

## 二、JS 中实现监控的核心方案

根据上面所说，我们知道埋点和监控的目的存在不同，但是它们的思路确是有很多一致性的，其核心都是：**获取关键的数据，发送（上报）给服务端**，依据数据来解决其不同的目的。

所以，无论是埋点也好，还是监控也罢，我们都需要 **获取关键位置数据**。

### 1. 跟踪用户事件（点击、滚动等）

**定义通用跟踪函数（后续事件会通过该函数完成上报）**：`trackEvent` 函数接收事件类型和事件详情，并上报到服务端。

```js
// 用于记录或发送跟踪数据到服务器的函数
function trackEvent(eventType, details) {
    console.log(`Event: ${eventType}`, details); // 在控制台打印事件类型和详情
    // 上报到服务端。
    fetch('/测试接口地址', { method: 'POST', body: JSON.stringify({ eventType, details }) });
}
```

**捕获按钮点击事件**：获取 `id` 为 `myButton` 的按钮，并在其 `click` 事件上添加监听器。在按钮被点击时调用 `trackEvent` 函数，记录点击事件的类型（`button_click`）、按钮 ID 和时间戳。

```js
// 跟踪按钮点击事件
const button = document.getElementById('myButton'); // 获取按钮元素
button.addEventListener('click', function () {
    trackEvent('button_click', { buttonId: 'myButton', timestamp: Date.now() }); // 记录点击事件并添加按钮ID和时间戳
});
```

**捕获页面滚动事件**：在全局 `scroll` 事件上添加监听器，每当页面发生滚动时调用 `trackEvent` 函数，记录滚动事件的类型（`page_scroll`）、页面垂直滚动距离（`scrollY`）和时间戳。

```js
// 跟踪页面滚动事件
window.addEventListener('scroll', function () {
    trackEvent('page_scroll', { scrollY: window.scrollY, timestamp: Date.now() }); // 记录滚动事件并添加滚动位置和时间戳
});
```

### 2. 完成性能监控指标

我们可以使用 `PerformanceAPI`，来检测某些操作需要多长时间。如：页面加载时间和 API 调用耗时的监控:

**页面加载时间监控**：通过 `window.addEventListener('load')` 监听页面加载完成的事件，在页面完全加载后获取当前时间（使用 `performance.now()`），计算出页面加载的总耗时（从页面初始化到加载完成的时间），并通过 `trackEvent` 函数将事件类型、耗时数据等记录下来。

```javascript
// 测量页面加载时间
window.addEventListener('load', function () {
    const pageLoadTime = performance.now(); // 获取页面加载完成后的时间（毫秒）
    trackEvent('page_load', { duration: pageLoadTime }); // 记录页面加载事件，并包含加载耗时数据
});
```

**API 调用耗时监控**：在 `measureApiCallPerformance` 函数中使用 `performance.now()` 获取调用 API 前的开始时间，通过 `fetch` 方法发起网络请求并在响应返回后再次获取时间差，计算 API 请求的总耗时。将 API 耗时和接口地址等信息通过 `trackEvent` 函数记录下来。

```js
// 测量 API 调用的耗时
function measureApiCallPerformance() {
    const start = performance.now(); // 记录 API 调用的开始时间

    fetch('https://api.sunday.com/data')
        .then(response => response.json())
        .then(data => {
            const duration = performance.now() - start; // 计算 API 调用的耗时
            trackEvent('api_call', { duration: duration, endpoint: 'https://api.sunday.com/data' }); // 记录 API 调用事件，并包含耗时和接口地址
        });
}
```

### 3. 进行错误追踪监听

我们可以利用 `window.onerror` 回调或者直接使用一些库（如：`Sentry`）完成错误监听：

**基础错误跟踪**：通过 `window.onerror` 捕获全局 JavaScript 错误。当错误发生时，`window.onerror` 会自动获取错误的详细信息（如错误信息、文件、行号、列号及堆栈信息），并将这些信息通过 `trackEvent` 函数发送到后台，用于后续的错误分析和排查。

```javascript
// 使用 window.onerror 实现基础的错误跟踪
window.onerror = function (message, source, lineno, colno, error) {
    // 捕获 JavaScript 错误信息，并通过 trackEvent 函数记录
    trackEvent('js_error', {
        message: message,      // 错误信息
        source: source,        // 错误发生的文件
        lineno: lineno,        // 错误所在的行号
        colno: colno,          // 错误所在的列号
        error: error ? error.stack : '' // 错误的堆栈信息（如果有）
    });
};
```

**第三方错误跟踪服务（Sentry）**：Sentry 是一个常用的错误监控服务。通过 `dsn` 配置唯一的项目标识，之后可以使用 `Sentry.captureException` 方法捕获并上报自定义错误。这种方式适合用于捕获更多类型的异常并进行详细的错误分析。

```js
// 使用第三方服务 Sentry 进行错误跟踪
Sentry.init({ dsn: 'https://examplePublicKey@o0.ingest.sentry.io/0' }); // 初始化 Sentry
Sentry.captureException(new Error('在这里描述错误内容')); // 捕获并上报自定义错误
```

### 4. 自定义的埋点上报

有时候我们可能还需要进行一些特别要求的数据上报，比如：**跟踪用户在页面特定区域的停留时间**，一共分成三步来做：

1. 当用户的鼠标进入指定区域（ID 为 `sectionId`）时，通过 `mouseenter` 事件记录进入的时间戳 `sectionStartTime`。
2. 当用户的鼠标离开该区域时，通过 `mouseleave` 事件获取当前时间，计算用户在该区域的停留时长 `timeSpent`。
3. 将停留时间和区域标识一起通过 `trackEvent` 函数发送到分析系统，方便后续分析用户在页面不同区域的停留时长

```javascript
// 跟踪用户在页面特定区域的停留时间
let sectionStartTime = 0; // 记录进入区域的时间
const sectionElement = document.getElementById('sectionId'); // 获取目标区域的 DOM 元素

// 当用户鼠标进入该区域时触发
sectionElement.addEventListener('mouseenter', function () {
    sectionStartTime = Date.now(); // 记录进入区域的时间戳
});

// 当用户鼠标离开该区域时触发
sectionElement.addEventListener('mouseleave', function () {
    const timeSpent = Date.now() - sectionStartTime; // 计算停留时间
    trackEvent('time_spent', { section: 'sectionId', duration: timeSpent }); // 上报停留时间和区域标识
});
```

### 5. 局部小总结

通过以上的几个案例，我们可以再次明确：**监控核心就是获取关键的数据，发送（上报）给服务端**

我们只需要 **依照自己的需求**，找到对应的 **事件节点**，获取 **需要上报的数据**，通过接口传递给服务端即可。

> PS：这里需要注意的是 **上报的方式分为：【统一上报】和 【实时上报】** 两大类，这里不去细说。

因此，想要完成监控，那么就需要更加深入的了解关键事件节点，如：浏览器窗口事件、鼠标事件、键盘事件、表单事件 甚至是 DOM 是否可见

## 三、一个完整的表单监控示例

那么接下来咱们就完成一个表单监控示例。他可以监控到 **浏览量、按钮点击量和表单提交量** 等

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>表单行为跟踪示例</title>
    </head>
    <body>
        <!-- 示例表单 -->
        <h1>用户注册表单</h1>
        <form id="registrationForm">
            <label for="username">用户名：</label>
            <input type="text" id="username" name="username" required />
            <br /><br />

            <label for="email">邮箱：</label>
            <input type="email" id="email" name="email" required />
            <br /><br />

            <label for="password">密码：</label>
            <input type="password" id="password" name="password" required />
            <br /><br />

            <button type="button" id="submitButton">注册</button>
        </form>

        <script>
            // 通用跟踪函数：用于记录事件并发送到服务器
            function trackEvent(eventType, details) {
                console.log(`Event: ${eventType}`, details)
                // 将数据发送到分析服务
                fetch('/请求路径', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventType, details })
                })
            }

            // 1. 监控页面浏览量
            window.addEventListener('load', function () {
                trackEvent('page_view', {
                    url: window.location.href,
                    timestamp: Date.now()
                })
            })

            // 2. 监控输入字段聚焦事件
            const inputFields = document.querySelectorAll('#registrationForm input')
            inputFields.forEach((field) => {
                field.addEventListener('focus', function () {
                    trackEvent('input_focus', {
                        fieldName: field.name,
                        timestamp: Date.now()
                    })
                })
            })

            // 3. 监控按钮点击量
            const submitButton = document.getElementById('submitButton')
            submitButton.addEventListener('click', function () {
                trackEvent('button_click', {
                    buttonId: 'submitButton',
                    timestamp: Date.now()
                })

                // 模拟提交表单，调用表单提交处理逻辑
                handleSubmit()
            })

            // 4. 监控表单提交量
            const form = document.getElementById('registrationForm')
            function handleSubmit() {
                // 验证表单是否有效（如果需要可以增加更多验证逻辑）
                if (form.checkValidity()) {
                    trackEvent('form_submit', {
                        formId: 'registrationForm',
                        formData: {
                            username: form.username.value,
                            email: form.email.value,
                            password: form.password.value // 注意：实际场景中避免记录敏感信息
                        },
                        timestamp: Date.now()
                    })

                    // 模拟发送表单数据到服务器
                    fetch('/请求路径', {
                        method: 'POST',
                        body: new FormData(form)
                    })
                        .then((response) => response.json())
                        .then((data) => {
                            console.log('Form submitted successfully', data)
                        })
                } else {
                    alert('请填写完整表单')
                }
            }
        </script>
    </body>
</html>
```

测试执行结果如下：

![](image-01.webp)

## 常见考点

## 一、性能监控的整体认知

**考察点：**

-  是否理解性能监控与性能优化的区别。 （监控是“量化和发现问题”，优化是“解决问题”）
-  是否能从“用户体验”出发定义性能指标，而不仅是代码层面。
-  是否知道前端性能监控的两大手段：<br>
  1. **RUM（Real User Monitoring）真实用户监控**
  2. **Synthetic Monitoring** 合成监控（如 Lighthouse、Puppeteer 定期检测）

---

## 二、关键性能指标（Core Web Vitals 与传统指标）

**考察点：**

1.  **页面加载类指标**<br>
  - **FP（First Paint）**
  - **FCP（First Contentful Paint）**
  - **LCP（Largest Contentful Paint）**
  - **TTFB（Time To First Byte）**
  - **DomContentLoaded / Load / Fully Loaded**
  - **FID（First Input Delay）**
  - **INP（Interaction to Next Paint）**
  - **CLS（Cumulative Layout Shift）**
  - 是否能解释这些指标代表的含义及优化方向。
2.  **资源加载类指标**<br>
  - JS/CSS 体积、请求耗时、压缩率、缓存命中率
  - 图片资源大小与懒加载情况
3.  **网络层指标**<br>
  - DNS 查询耗时、TCP 建立、SSL 握手、HTTP 请求阶段拆解

---

## 三、性能数据采集方式

**考察点：**

- **Performance API**（`performance.timing`、`performance.getEntriesByType`）
- **PerformanceObserver** 监听指标变化（LCP、FID、CLS 等）
- **Resource Timing API**、**Navigation Timing API**
- 是否了解如何在 SPA 场景中统计页面切换性能（通过路由变化重新计算）
- 是否能区分**页面初次加载**与**二次加载（缓存命中）**性能差异

---

## 四、异常与上报机制

**考察点：**

-  前端性能数据如何**采集、聚合、上报**<br>
  - 异步批量上报机制（`sendBeacon` / `navigator.sendBeacon`）
  - 上报策略（定时、限频、合并）
-  性能数据如何与用户维度或页面维度做关联（userId、sessionId、pageKey）
-  是否考虑埋点 SDK 的轻量化与对性能的反噬影响

---

## 五、监控平台设计与落地

**考察点：**

-  是否了解前端监控平台的组成：<br>
  1. 数据采集 SDK
  2. 数据上报 API
  3. 数据存储与聚合（如 Elasticsearch、ClickHouse）
  4. 数据可视化展示（如 Grafana、ECharts）
-  是否考虑在监控中结合**错误监控**与**白屏监控**
-  是否提到核心指标的报警机制（如 LCP > 4s，自动报警）

---

## 六、性能问题定位与追踪

**考察点：**

-  是否有实际使用过性能分析工具：<br>
  - Chrome Performance、Lighthouse、WebPageTest
  - Sentry Performance、阿里 ARMS、字节 ApmPlus
-  是否能解释如何定位性能瓶颈（CPU、网络、渲染）
-  是否能讲出真实业务场景下的优化闭环：<br>
  - 采集 → 统计 → 报警 → 优化 → 验证 → 回归

---

## 七、进阶与拓展方向

**考察点：**

- 是否理解前端性能与后端接口性能的联动（TTFB 分析）
- 是否了解移动端性能监控（Hybrid、小程序）
- 是否知道 RUM + APM 的一体化监控思路（如前后链路追踪 TraceId）
