+++
title = "阿里-阿里妈妈-实习 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/33"
experienceId = 33
roundId = 40
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T06:04:12.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-33/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-33/round-41/index.md" >}}) →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 13 道题。答案默认折叠，便于先自行作答。

## 1. 实现第一个元素不移动后续元素与左边相隔8px（:not(:first-child） {#question-subjective-9ff563bd8749}

### 题目要点

CSS选择器与布局。

<details>
<summary>参考答案</summary>

要实现第一个元素不移动，后续元素与左边相隔8px，可以使用CSS中的`:not(:first-child)`选择器来选择除第一个元素外的所有同级元素，并为其设置左边距。这在布局中非常有用，可以避免对第一个元素应用不必要的样式。以下是一个示例：<br>

```html
<div class="container">
    <div class="item">Item 1</div>
    <div class="item">Item 2</div>
    <div class="item">Item 3</div>
    <div class="item">Item 4</div>
</div>
```

```css
.container {
    display: flex;
}
.item:not(:first-child) {
    margin-left: 8px;
}
```

 在这个示例中，`.item:not(:first-child)`选择器匹配了所有带有`item`类的元素，除了第一个元素。然后，我们通过`margin-left: 8px`为这些元素设置了左边距，使它们与左边的元素相隔8px。第一个元素不会受到影响，因此不会产生左边距，从而实现了题目要求的布局效果。这种技术在创建水平排列的元素时非常有用，例如导航栏或标签页，可以确保第一个元素与容器的边缘对齐，而后续元素之间保持一致的间距。

</details>

## 2. 写一个防抖 {#question-c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c}

> 题库原题：[实现 debounce（防抖）函数](https://fe.ecool.fun/topic/c77b5c6f-9fcc-40a6-bbf0-9f412d6ce94c)

### 题目要点

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

<details>
<summary>参考答案</summary>

触发高频时间后n秒内函数只会执行一次,如果n秒内高频时间再次触发,则重新计算时间。

```js
const debounce = (fn, time) => {
  let timeout = null;
  return function() {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      fn.apply(this, arguments);
    }, time);
  }
};

```

防抖常应用于用户进行搜索输入节约请求资源，window触发resize事件时进行防抖只触发一次。

</details>

## 3. 讲讲你的项目难点 {#question-subjective-0b51a6d42592}

### 题目要点

项目经验与问题解决能力。

<details>
<summary>参考答案</summary>

在我参与的一个大型电商平台前端项目中，遇到了多个技术难点。其中一个主要难点是性能优化。由于该平台拥有大量的商品列表和复杂的交互功能，初始页面加载时间过长，用户体验不佳。为了解决这一问题，我们采取了多种优化策略：<br>

    1. 代码分割与懒加载：通过Webpack的代码分割功能，将首屏不需要的代码（如商品详情页、个人中心等）进行懒加载。这显著减少了首屏加载的JavaScript包大小，提升了页面的首次渲染速度。<br>
    2. 图片优化：对所有图片资源进行压缩，并采用WebP格式替代传统的JPEG和PNG格式。同时，实现了图片的懒加载，只有当图片进入视口时才会加载，进一步减少了初始加载时间。<br>
    3. 服务端渲染（SSR）：对于商品列表页，采用Nuxt.js进行服务端渲染。这样可以在首屏加载时直接返回HTML内容，避免浏览器等待JavaScript解析完成后再渲染页面，从而大大缩短了白屏时间。<br>
    4. 缓存策略：通过设置合理的HTTP缓存头（如`Cache-Control`、`ETag`），利用浏览器缓存减少重复请求。同时，引入CDN加速静态资源的加载，降低服务器响应时间。<br>
    5. 性能监测与优化：使用Lighthouse和Chrome DevTools对页面性能进行监测，识别性能瓶颈并进行针对性优化。例如，优化JavaScript执行时间，减少不必要的DOM操作和重绘。<br>
另一个难点是跨浏览器兼容性。由于平台需要支持多种浏览器（包括一些旧版本的浏览器），我们需要确保代码在不同环境中的一致性。为了解决这个问题，我们使用了Babel转译ES6+代码，并引入了Polyfill库来支持旧浏览器的API。同时，对CSS进行了广泛的兼容性测试，使用Autoprefixer添加浏览器前缀，以确保样式在所有目标浏览器中的一致性。通过这些措施，我们成功地提升了项目的性能和兼容性，确保了良好的用户体验。

</details>

## 4. 为什么采取微前端，在性能上会有损失怎么做的？ {#question-subjective-394c6140f207}

### 题目要点

前端架构与性能优化。

<details>
<summary>参考答案</summary>

我们项目采取微前端架构的原因主要有以下几点：<br>

1. 团队独立开发与部署：微前端允许不同的团队独立开发和部署自己的模块，而不会相互影响。这对于大型项目来说非常重要，因为可以加快开发速度并减少集成时的冲突。<br>
2. 技术栈多样性支持：微前端架构允许每个子应用使用不同的技术栈，这在大型企业中非常有用，因为不同的团队可能根据自身需求选择不同的前端框架。<br>
3. 代码复用与共享：微前端可以促进代码的复用，通过共享通用组件和状态管理，减少重复开发。<br>
4. 扩展性与可维护性：微前端架构使项目更容易扩展和维护，因为每个子应用都是独立的，可以单独进行优化和升级。<br>

在性能方面，微前端可能会引入一些开销，因为需要加载多个子应用的代码和资源。为了解决这个问题，我们采取了以下措施：<br>

1. 资源预加载与缓存：通过Webpack的预加载和缓存策略，提前加载关键资源并利用浏览器缓存减少重复请求。<br>
2. 代码分割与共享：通过Webpack的`splitChunks`插件，提取公共代码和第三方库，避免重复加载。<br>
3. 懒加载子应用：只有在用户需要访问某个子应用时，才动态加载其代码和资源，减少初始加载时间。<br>
4. 性能监测与优化：使用Lighthouse等工具定期监测性能指标，确保每个子应用的加载时间都在可接受范围内。通过优化子应用的代码和资源，减少不必要的开销。<br>
5. 通信优化：在主应用和子应用之间采用高效的通信机制，减少数据传输量和通信延迟。

</details>

## 5. 公司项目是在公网上的，对防止攻击做了什么措施呢 {#question-subjective-8c64ce7b39e0}

### 题目要点

网络安全与防护。

<details>
<summary>参考答案</summary>

参考答案：

1. HTTPS加密：所有对外服务均采用HTTPS协议，确保数据在传输过程中的加密和完整性。通过使用有效的SSL/TLS证书，防止中间人攻击和数据窃听。<br>
2. 输入验证与清理：在服务器端对所有用户输入进行严格的验证和清理，防止SQL注入、XSS（跨站脚本攻击）等常见的攻击方式。例如，使用正则表达式验证用户输入的格式，并对特殊字符进行转义。<br>
3. CSRF防护：在每个请求中加入CSRF令牌，并在服务器端验证令牌的有效性，防止跨站请求伪造攻击。确保只有来自我们应用的请求才能执行敏感操作。<br>
4. 限流与防DDoS攻击：在服务器端实现请求限流机制，限制单个IP或用户的请求频率，防止DDoS攻击。使用云服务提供商的DDoS防护功能，抵御大流量攻击。<br>
5. 安全的依赖管理：定期使用工具（如npm audit、yarn audit）检查项目依赖的安全性，及时更新或替换具有已知漏洞的依赖包。<br>
6. 访问控制与认证：实现基于角色的访问控制（RBAC），确保用户只能访问其权限范围内的资源。使用JWT（JSON Web Token）进行用户认证，保护API接口的安全。<br>
7. 日志记录与监控：记录所有关键操作和请求的日志，实时监控系统状态，及时发现和响应异常行为。使用工具（如ELK Stack）进行日志分析和安全审计。<br>
8. Web应用防火墙（WAF）：部署WAF来过滤和监控HTTP请求，自动检测和阻止常见的攻击模式，如SQL注入、XSS、非法路径穿越等。<br>
9. 定期安全审计：定期进行安全审计和渗透测试，发现并修复潜在的安全漏洞。模拟黑客攻击来测试系统的安全性，确保防护措施的有效性。

</details>

## 6. 讲讲前端常见的攻击方式 {#question-subjective-80626afaca3b}

### 题目要点

网络安全意识。

<details>
<summary>参考答案</summary>

1. XSS（跨站脚本攻击）：攻击者通过注入恶意脚本，使其在其他用户的浏览器上执行。这可能导致用户的个人信息泄露、Cookie被窃取或被重定向到恶意网站。例如，攻击者在论坛留言中插入恶意脚本，当其他用户查看该留言时，脚本会在他们的浏览器中执行。<br>
2. CSRF（跨站请求伪造）：攻击者诱导用户在不知情的情况下提交恶意请求，执行未授权的操作。例如，攻击者构造一个恶意表单，当用户访问包含该表单的页面时，表单会自动提交，执行如转账等操作。<br>
3. SQL注入：虽然这主要是后端的安全问题，但前端也可能在某些情况下导致SQL注入攻击。例如，前端在构造SQL查询时未对用户输入进行适当转义，攻击者可以插入恶意SQL代码，篡改或窃取数据库信息。<br>
4. 中间人攻击（Man-in-the-Middle Attack）：攻击者截获用户与服务器之间的通信，窃取或篡改数据。这通常发生在未加密的网络通信中。<br>
5. 点击劫持（Clickjacking）：攻击者通过将不可见的iframe或透明按钮叠加在合法按钮上，诱使用户点击恶意链接或按钮。这可能导致用户在不知情的情况下执行未授权的操作。<br>
6. 重放攻击：攻击者截获用户请求并重新发送，以执行重复操作。例如，截获用户的登录请求并多次发送，可能导致多次登录。<br>
7. DNS劫持：攻击者篡改DNS解析，将用户重定向到恶意网站。<br>
8. 恶意广告注入：攻击者通过广告网络注入恶意广告，传播恶意软件或收集用户信息。

</details>

## 7. 弱网环境下是懒加载好呢还是一次性加载好 {#question-subjective-60197ac42798}

### 题目要点

性能优化策略。

<details>
<summary>参考答案</summary>

在弱网环境下，选择懒加载还是一次性加载需要根据具体场景和需求来决定：<br>

1. 懒加载的优势：<br>
    1. 减少初始加载时间：只加载首屏所需的资源，后续资源在需要时加载，减少用户等待时间。<br>
    2. 节省流量和带宽：用户可能不需要浏览整个页面的所有内容，懒加载可以避免加载不必要的资源，节省用户的流量和服务器的带宽。<br>
    3. 渐进式渲染：页面可以更快地呈现首屏内容，后续内容随着用户滚动逐步加载，提高用户体验。
2. 一次性加载的优势：<br>
    1. 减少HTTP请求次数：通过打包和合并资源，减少请求次数，可能在某些情况下提高加载效率。<br>
    2. 避免重复加载：如果用户需要浏览整个页面的内容，一次性加载可以避免多次网络请求的开销。<br>

在弱网环境下，通常建议优先使用懒加载，因为网络带宽有限且不稳定。懒加载可以确保用户在等待较短时间后即可查看首屏内容，而无需等待整个页面资源加载完成。例如，对于一个内容丰富的新闻网站，用户可能只需要浏览首页的几篇文章，懒加载可以避免加载其他未浏览部分的图片和文本，节省时间和流量。<br>

然而，在某些特定场景下，如果页面内容较少且用户很可能需要浏览所有内容，一次性加载可能更合适。例如，一个包含少量图片和文字的登录页面，一次性加载可以减少复杂的懒加载逻辑，确保页面快速完整地呈现。<br>
总之，在弱网环境下，懒加载通常是更优的选择，因为它可以更好地控制资源加载的时机和顺序，优化用户体验。但具体实现时，还需要根据项目的特点和用户的行为模式进行权衡和测试。

</details>

## 8. 讲一下对前端工程化的理解。 {#question-a823157e-329e-4327-8d39-da935c091f20}

> 题库原题：[说说你对前端工程化的理解](https://fe.ecool.fun/topic/a823157e-329e-4327-8d39-da935c091f20)

### 题目要点

前端工程化通过规范化项目结构、使用现代工具链、自动化常见任务、实施代码质量管理和优化性能，来提高前端开发的效率和质量。

工程化的目标是让开发过程更加可控、可维护，并能够适应不断变化的技术和业务需求。

<details>
<summary>参考答案</summary>

前端工程化是指将前端开发中的设计、开发、测试和部署等环节进行标准化和自动化，以提高开发效率和代码质量，并降低维护成本。

具体而言，前端工程化包括以下方面：

1. 模块化：使用模块化思想可以将复杂的代码拆分成小的可重用的模块，并且使得不同模块之间的依赖关系更加清晰。

2. 自动化构建：通过使用构建工具（如 Gulp、Webpack、Rollup 等），可以自动化地完成代码编译、压缩、打包、转换、优化等任务，从而提高开发效率。

3. 自动化测试：通过使用自动化测试框架和工具（如 Jest、Mocha、Chai、Selenium 等），可以自动化地完成单元测试、集成测试、UI 测试等任务，从而提高代码质量并减少故障。

4. 自动化部署：通过使用自动化部署工具（如 Jenkins、Travis CI、GitLab CI/CD 等），可以自动化地完成代码上传、服务器部署、数据库更新等任务，从而减少手动操作产生的错误和漏洞。

5. 规范化管理：通过使用代码规范（如 ESLint、Stylelint、Prettier 等）和版本控制系统（如 Git），可以规范开发流程和代码风格，提高代码可读性和可维护性。

前端工程化是将前端开发中的设计、开发、测试和部署等环节进行标准化和自动化，以提高开发效率和代码质量，并降低维护成本。

它是一种现代化的开发方式，适用于各种大小项目的开发，并且可以在不断变化的技术环境中保持竞争力。

</details>

## 9. vite有没有写过插件 {#question-subjective-2076701f2c04}

### 题目要点

Vite生态系统与插件开发。

<details>
<summary>参考答案</summary>

以下是一个示例插件的实现，该插件用于在开发服务器启动时输出欢迎信息，并在构建过程中添加自定义的banner：<br>

```javascript
// vite-plugin-welcome.js
const { name, version } = require('./package.json');
module.exports = function welcomePlugin() {
    return {
        name: 'vite-plugin-welcome',
        configureServer(server) {
            server.middleware.use((req, res, next) => {
                if (req.url === '/' && req.method === 'GET') {
                    res.setHeader('Content-Type', 'text/html');
                    res.end(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Welcome</title>
                        </head>
                        <body>
                            <h1>Welcome to ${name} v${version}</h1>
                            <p>Development server is running.</p>
                        </body>
                        </html>
                    `);
                } else {
                    next();
                }
            });
        },
        generateBundle(_, bundle) {
            for (const file in bundle) {
                if (bundle[file].type === 'asset') {
                    bundle[file].source = `
                        /*! ${name} v${version} | MIT License */
                        ${bundle[file].source}
                    `;
                }
            }
        }
    };
}
```

 使用方法：<br>

```javascript
// vite.config.js
const welcomePlugin = require('./vite-plugin-welcome');
export default {
    plugins: [welcomePlugin()]
};
```

这个插件在开发服务器启动时，会拦截根路径（`/`）的请求并返回一个欢迎页面，显示项目的名称和版本号。在构建过程中，它会在每个生成文件的顶部添加一个自定义的banner，包含项目名称和版本号。通过这种方式，插件增强了Vite的功能，提供了额外的开发和构建时的便利。编写Vite插件需要熟悉Vite的API和钩子机制，如`configureServer`、`generateBundle`等，这些钩子允许插件在Vite的构建和开发流程中注入自定义逻辑。

</details>

## 10. 如何用Promise实现并发请求的限流控制？ {#question-subjective-9592487b81ba}

### 题目要点

JavaScript异步控制。

<details>
<summary>参考答案</summary>

要实现并发请求的限流控制，可以使用Promise和队列机制来限制同时进行的请求数量。以下是一个示例实现：<br>

```javascript
class RequestLimiter {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.running = 0;
        this.queue = [];
    }

    async run(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ fn, resolve, reject });
            this.next();
        });
    }

    next() {
        if (this.running < this.maxConcurrency && this.queue.length > 0) {
            const { fn, resolve, reject } = this.queue.shift();
            this.running++;
            Promise.resolve()
                .then(() => fn())
                .then(resolve)
                .catch(reject)
                .finally(() => {
                    this.running--;
                    this.next();
                });
        }
    }
}

// 使用示例
const limiter = new RequestLimiter(3); // 设置最大并发数为3
const urls = ['/api/data1', '/api/data2', '/api/data3', '/api/data4', '/api/data5'];

const fetchWithLimit = (url) => {
    return limiter.run(async () => {
        const response = await fetch(url);
        return await response.json();
    });
};

Promise.all(urls.map(fetchWithLimit))
    .then(results => console.log(results))
    .catch(error => console.error(error));
```

在这个实现中，`RequestLimiter`类管理一个请求队列，并限制同时执行的请求数量。`run`方法接受一个异步函数（如fetch请求），将其加入队列并返回一个Promise。当并发数低于限制时，`next`方法从队列中取出一个任务并执行，同时增加并发计数。任务完成后，减少并发计数并调用`next`处理下一个任务。通过这种方式，可以确保同时进行的请求数量不会超过设定的限制，从而避免对服务器造成过大压力。

</details>

## 11. Vue组件生命周期钩子的执行顺序及使用场景（如created与mounted） {#question-cf1e843f-9005-42dc-b204-194dd3d1fc42}

> 题库原题：[说说你对Vue生命周期的理解](https://fe.ecool.fun/topic/cf1e843f-9005-42dc-b204-194dd3d1fc42)

### 题目要点

#### 一、生命周期是什么

生命周期可以通俗地理解为组件从创建、初始化数据、编译模板、挂载到DOM、渲染、更新、销毁等一系列过程。这些生命周期钩子提供了一个时间点，允许开发者执行特定任务，例如数据获取、事件绑定、状态管理等。

#### 二、生命周期有哪些

Vue的生命周期钩子包括以下阶段：

- `beforeCreate`：组件实例被创建之初，`data`和`methods`还未定义。
- `created`：组件实例已经完全创建，`data`和`methods`已经定义，但尚未挂载到DOM上。
- `beforeMount`：组件挂载之前，模板已编译完成，但DOM还未被渲染。
- `mounted`：组件已经挂载到DOM上，`el`选项对应的真实DOM元素已被替换，可以访问和操作DOM元素。
- `beforeUpdate`：组件数据发生变化，即将重新渲染之前。
- `updated`：组件数据更新完成，所有状态都是最新的。
- `beforeDestroy`：组件实例销毁之前，可以清理定时器、解绑事件监听器等。
- `destroyed`：组件实例完全销毁，`data`和`methods`不可访问。
此外，还有特殊的生命周期钩子：
- `activated`：`keep-alive`缓存的组件激活时调用。
- `deactivated`：`keep-alive`缓存的组件停用时调用。
- `errorCaptured`：捕获一个来自子孙组件的错误时调用。

#### 三、生命周期整体流程

Vue的生命周期流程可以分为以下几个阶段：

1. **beforeCreate -> created**：初始化`Vue`实例，进行数据观测。
2. **created**：完成数据观测，属性与方法的运算，`watch`、`event`事件回调的配置。可以调用`methods`中的方法，访问和修改`data`数据触发响应式渲染`dom`，可通过`computed`和`watch`完成数据计算。
3. **created -> beforeMount**：判断是否存在`el`选项，若不存在则停止编译，直到调用`vm.$mount(el)`才会继续编译。
4. **beforeMount -> mounted**：此阶段`vm.el`完成挂载，`vm.$el`生成的`DOM`替换了`el`选项所对应的`DOM`。
5. **mounted**：`vm.el`已完成`DOM`的挂载与渲染。
6. **beforeUpdate**：更新的数据必须是被渲染在模板上的（`el`、`template`、`rende`r之一）。
7. **updated**：完成`view`层的更新。
8. **beforeDestroy**：实例被销毁前调用。
9. **destroyed**：组件实例完全销毁。

#### 四、题外话：数据请求在`created`和`mounted`的区别

`created`钩子在组件实例创建完成时立刻调用，此时页面`DOM`节点还未生成。而`mounted`钩子在页面`DOM`节点渲染完毕后立刻执行。

- `created`更适合用于数据请求，因为它在`mounted`之前调用，可以避免页面闪动。
- `mounted`适合用于页面交互，因为它在页面渲染完毕后调用，可以确保页面已经完全加载。

<details>
<summary>参考答案</summary>

## 一、生命周期是什么<br>

生命周期`（Life Cycle）`的概念应用很广泛，特别是在政治、经济、环境、技术、社会等诸多领域经常出现，其基本涵义可以通俗地理解为“从摇篮到坟墓”`（Cradle-to-Grave）`的整个过程在`Vue`中实例从创建到销毁的过程就是生命周期，即指从创建、初始化数据、编译模板、挂载Dom→渲染、更新→渲染、卸载等一系列过程我们可以把组件比喻成工厂里面的一条流水线，每个工人（生命周期）站在各自的岗位，当任务流转到工人身边的时候，工人就开始工作PS：在`Vue`生命周期钩子会自动绑定 `this` 上下文到实例中，因此你可以访问数据，对 `property` 和方法进行运算这意味着**你不能使用箭头函数来定义一个生命周期方法** \(例如 `created: () => this.fetchTodos()`\)

## 二、生命周期有哪些

Vue生命周期总共可以分为8个阶段：创建前后, 载入前后,更新前后,销毁前销毁后，以及一些特殊场景的生命周期

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 组件实例被创建之初 |
| created | 组件实例已经完全创建 |
| beforeMount | 组件挂载之前 |
| mounted | 组件挂载到实例上去之后 |
| beforeUpdate | 组件数据发生变化，更新之前 |
| updated | 数据数据更新之后 |
| beforeDestroy | 组件实例销毁之前 |
| destroyed | 组件实例销毁之后 |
| activated | keep-alive 缓存的组件激活时 |
| deactivated | keep-alive 缓存的组件停用时调用 |
| errorCaptured | 捕获一个来自子孙组件的错误时被调用 |

## 三、生命周期整体流程

`Vue`生命周期流程图

 ![](https://static.ecool.fun//article/a3ce0701-cd4c-4486-9dfc-4aa32628b63a.png)

#### 具体分析

**beforeCreate -> created**

- 初始化`vue`实例，进行数据观测

**created**

- 完成数据观测，属性与方法的运算，`watch`、`event`事件回调的配置
- 可调用`methods`中的方法，访问和修改data数据触发响应式渲染`dom`，可通过`computed`和`watch`完成数据计算
- 此时`vm.$el` 并没有被创建

**created -> beforeMount**

- 判断是否存在`el`选项，若不存在则停止编译，直到调用`vm.$mount(el)`才会继续编译
- 优先级：`render` > `template` > `outerHTML`
- `vm.el`获取到的是挂载`DOM`的

**beforeMount**

- 在此阶段可获取到`vm.el`
- 此阶段`vm.el`虽已完成DOM初始化，但并未挂载在`el`选项上

**beforeMount -> mounted**

- 此阶段`vm.el`完成挂载，`vm.$el`生成的`DOM`替换了`el`选项所对应的`DOM`

**mounted**

- `vm.el`已完成`DOM`的挂载与渲染，此刻打印`vm.$el`，发现之前的挂载点及内容已被替换成新的DOM

**beforeUpdate**

- 更新的数据必须是被渲染在模板上的（`el`、`template`、`rende`r之一）
- 此时`view`层还未更新
- 若在`beforeUpdate`中再次修改数据，不会再次触发更新方法

**updated**

- 完成`view`层的更新
- 若在`updated`中再次修改数据，会再次触发更新方法（`beforeUpdate`、`updated`）

**beforeDestroy**

- 实例被销毁前调用，此时实例属性与方法仍可访问

**destroyed**

- 完全销毁一个实例。可清理它与其它实例的连接，解绑它的全部指令及事件监听器
- 并不能清除DOM，仅仅销毁实例

**使用场景分析**

| 生命周期 | 描述 |
| :-- | :-- |
| beforeCreate | 执行时组件实例还未创建，通常用于插件开发中执行一些初始化任务 |
| created | 组件初始化完毕，各种数据可以使用，常用于异步数据获取 |
| beforeMount | 未执行渲染、更新，dom未创建 |
| mounted | 初始化结束，dom已创建，可用于获取访问数据和dom元素 |
| beforeUpdate | 更新前，可用于获取更新前各种状态 |
| updated | 更新后，所有状态已是最新 |
| beforeDestroy | 销毁前，可用于一些定时器或订阅的取消 |
| destroyed | 组件已销毁，作用同上 |

## 四、题外话：数据请求在created和mouted的区别

`created`是在组件实例一旦创建完成的时候立刻调用，这时候页面`dom`节点并未生成`mounted`是在页面`dom`节点渲染完毕之后就立刻执行的触发时机上`created`是比`mounted`要更早的两者相同点：都能拿到实例对象的属性和方法讨论这个问题本质就是触发的时机，放在`mounted`请求有可能导致页面闪动（页面`dom`结构已经生成），但如果在页面加载前完成则不会出现此情况建议：放在`create`生命周期当中

</details>

## 12. Vue的双向绑定原理及与React单向数据流的对比 {#question-subjective-099c4e7d3977}

### 题目要点

前端框架数据管理。

<details>
<summary>参考答案</summary>

Vue的双向绑定原理是通过其响应式系统实现的。核心在于`Object.defineProperty`（Vue 2）或Proxy（Vue 3）来劫持对象的属性，当数据变化时，自动更新DOM。Vue在编译模板时，将绑定的DOM元素与数据建立联系，数据变化时，通过观察者模式通知渲染器更新视图。<br>

React采用单向数据流，状态变更通过组件的`setState`方法触发重新渲染。父组件状态变化时，子组件通过`props`接收新数据并更新。这种单向流动确保数据的可预测性和调试便利性。<br>

对比：<br>

1. 开发体验：Vue的双向绑定简化了表单处理等场景，但可能导致数据流向不清晰。React的单向数据流通过显式状态管理和数据传递，使数据流动更透明。<br>
2. 性能：Vue的响应式系统自动跟踪数据变化，适合中小型项目。React通过虚拟DOM和`shouldComponentUpdate`等优化，对大型应用性能更友好。<br>
3. 调试：React的单向数据流便于追踪状态变更来源。Vue的双向绑定可能因隐式数据绑定增加调试难度。<br>
4. 学习曲线：Vue的概念较为直观，适合快速开发。React的单向数据流和组件化思想需要理解状态管理和数据传递，适合构建大型应用。<br>
5. 灵活性：Vue的双向绑定适合快速开发动态表单。React的单向数据流通过Redux、Context API等扩展，适合复杂状态管理。<br>

总之，Vue和React各有优势，Vue适合快速开发中小型项目，React适合构建大型、复杂的单页面应用。

</details>

## 13. 公司主要是react，学习需要多久呢？ {#question-subjective-546c95965e61}

### 题目要点

学习能力和技术迁移。

<details>
<summary>参考答案</summary>

学习React的时间因个人基础、项目需求和投入时间而异。以下是一个大致的学习时间线：<br>

1. 基础语法与组件化（1-2周）：<br>
    1. 掌握JavaScript ES6+语法（如箭头函数、解构赋值、模板字符串等），这些是React开发的基础。<br>
    2. 学习React的基本概念，包括组件、JSX语法、元素渲染、Props和State。通过官方文档和教程（如React官方文档、Codecademy的React课程）进行学习。<br>
    3. 实践：创建简单的组件，如按钮、表单、列表等，理解组件的复用和组合。
2. 状态管理与Hooks（2-3周）：<br>
    1. 深入学习React的状态管理，包括`useState`、`useEffect`等常用Hooks。理解副作用处理、依赖数组的用法。<br>
    2. 学习Context API进行跨组件通信，掌握Provider和Consumer的使用。<br>
    3. 实践：开发一个带有状态管理的简单应用，如待办事项列表、计数器应用。
3. 路由与项目结构（1-2周）：<br>
    1. 学习React Router进行页面导航，掌握`<BrowserRouter>`、`<Route>`、`<NavLink>`等组件的使用。<br>
    2. 理解React项目的文件和文件夹结构，如何组织组件、页面、服务等模块。<br>
    3. 实践：构建一个带有多个页面的项目，如个人博客、电商产品展示页。
4. 高级特性与性能优化（2-3周）：<br>
    1. 掌握React的高级特性，如自定义Hooks、渲染Props、高阶组件。<br>
    2. 学习性能优化技术，包括内存泄漏避免、虚拟化列表、懒加载组件（React.lazy和Suspense）。<br>
    3. 实践：对现有项目进行性能优化，使用React DevTools分析组件树和性能瓶颈。
5. 项目实战与最佳实践（持续学习）：<br>
    1. 参与实际项目开发，应用所学知识解决实际问题。通过阅读开源项目代码、参与社区贡献提升水平。<br>
    2. 学习 advanced state management libraries 如Redux、MobX，根据项目需求选择合适的状态管理方案。<br>
    3. 持续关注React的新特性和社区动态，通过阅读博客、参加技术会议保持技术更新。<br>

如果你已经有一定的前端基础（如HTML、CSS、JavaScript），并且对编程逻辑有基本的了解，通常在1-2个月内可以掌握React的基本开发技能，能够独立开发中等复杂度的项目。然而，要深入掌握React的高级特性和最佳实践，可能需要更长时间的实践和学习。持续的实践和项目经验是提高的关键。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-33/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-33/round-41/index.md" >}}) →
