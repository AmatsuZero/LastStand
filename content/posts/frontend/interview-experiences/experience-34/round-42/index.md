+++
title = "阿里-蚂蚁金服-校招 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "阿里巴巴集团", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/34"
experienceId = 34
roundId = 42
roundOrder = 1
company = "阿里巴巴集团"
date = "2025-06-27T06:05:39.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-34/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-34/round-43/index.md" >}}) →

**本轮要点：** 本次面试主要考察校招生的基础内容

本轮共 21 道题。答案默认折叠，便于先自行作答。

## 1. 数组排序：实现一个函数，对包含数字和字符串的混合数组进行排序，数字在前按升序，字符串在后按字母顺序。 {#question-subjective-086d87101a30}

### 题目要点

JavaScript算法。

<details>
<summary>参考答案</summary>

```javascript
function sortMixedArray(arr) {
    return arr.sort((a, b) => {
        const typeA = typeof a;
        const typeB = typeof b;
        if (typeA !== typeB) {
            return typeA === 'number' ? -1 : 1;
        }
        if (typeA === 'number') {
            return a - b;
        } else {
            return a.localeCompare(b);
        }
    });
}
```

</details>

## 2. 发布订阅模式：实现一个简单的EventEmitter类，包含on, emit, off方法。 {#question-subjective-11d6fb8e8fe1}

### 题目要点

JavaScript设计模式。

<details>
<summary>参考答案</summary>

```javascript
class EventEmitter {
    constructor() {
        this.events = {};
    }
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    emit(event, ...args) {
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                callback(...args);
            });
        }
    }
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}
```

</details>

## 3. lodash.get实现：实现一个类似lodash.get的函数，安全地获取嵌套对象属性。 {#question-subjective-33ea8704520e}

### 题目要点

JavaScript对象操作。

<details>
<summary>参考答案</summary>

```javascript
function get(obj, path, defaultValue) {
    const paths = path.replace(/\[(\w+)\]/g, '.$1').split('.');
    let result = obj;
    for (const key of paths) {
        if (result == null || !(key in result)) {
            return defaultValue;
        }
        result = result[key];
    }
    return result;
}
```

</details>

## 4. DOM/CSS题：用CSS实现一个水平垂直居中的弹窗，并编写JavaScript代码在点击按钮时显示/隐藏它。 {#question-subjective-26c520b752ba}

### 题目要点

CSS布局和JavaScript操作DOM。

<details>
<summary>参考答案</summary>

```html
<button id="toggleModal">Toggle Modal</button>
<div id="modal" class="modal">
    <div class="modal-content">
        <span class="close">&times;</span>
        <p>Modal Content</p>
    </div>
</div>
<style>
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
    }
    .modal-content {
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        position: relative;
    }
    .close {
        position: absolute;
        top: 10px;
        right: 15px;
        cursor: pointer;
    }
</style>
<script>
    const modal = document.getElementById('modal');
    const btn = document.getElementById('toggleModal');
    const closeBtn = document.querySelector('.close');

    btn.onclick = () => {
        modal.style.display = 'flex';
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
</script>

```

</details>

## 5. 为什么要阻止跨域？能举一个具体的潜在安全问题例子吗？ {#question-subjective-917645ba4eb0}

### 题目要点

网络安全。

<details>
<summary>参考答案</summary>

跨域请求默认被浏览器阻止是为了防止恶意网站获取用户在其他网站上的敏感信息。例如，假设一个用户登录了银行网站，然后访问了一个恶意网站。如果没有跨域限制，恶意网站可以发送请求到银行网站的API，获取用户的账户信息或执行交易操作，因为浏览器会自动带上用户的Cookie，导致用户在不知情的情况下遭受攻击。

</details>

## 6. 实际项目中你用过哪些跨域解决方案？它们的适用场景是什么？ {#question-subjective-52d3ebc7f9ba}

### 题目要点

前端开发与网络安全。

<details>
<summary>参考答案</summary>

在实际项目中，我使用过以下跨域解决方案：

    - CORS（跨源资源共享）：适用于前后端分离的场景，后端设置响应头允许特定来源的请求。
    - JSONP：适用于只需要GET请求的场景，利用`&lt;script&gt;`标签的特性绕过跨域限制。
    - 代理服务器：适用于复杂请求或需要对请求进行额外处理的场景，前端通过同源的代理服务器转发请求到后端服务。

</details>

## 7. 请解释强缓存和协商缓存的区别，以及相关的HTTP头部。 {#question-subjective-aae2cf5f5e25}

### 题目要点

HTTP缓存机制。

<details>
<summary>参考答案</summary>

强缓存和协商缓存的区别在于缓存的有效期判断方式和使用的HTTP头部：

    - 强缓存：依赖`Cache-Control`和`Expires`头部，直接使用缓存资源，不向服务器发送请求。`Cache-Control`的`max-age`属性指定了资源的有效期，而`Expires`指定了资源过期的具体时间。
    - 协商缓存：依赖`Last-Modified`和`ETag`头部，每次请求都会向服务器发送验证请求。服务器根据`If-Modified-Since`或`If-None-Match`头部判断资源是否更新，若未更新则返回304状态码。

</details>

## 8. 在实际项目中你是如何利用HTTP缓存的？ {#question-subjective-90df2893dfec}

### 题目要点

前端性能优化。

<details>
<summary>参考答案</summary>

在实际项目中，我通过以下方式利用HTTP缓存：

    1. 设置合理的缓存策略：对于静态资源（如图片、CSS、JS），设置较长的`max-age`或`Expires`值，并使用`Cache-Control: public`允许CDN缓存。
    2. 使用ETag：让服务器根据资源的内容生成ETag，客户端通过`If-None-Match`验证资源是否更新。
    3. 缓存 busting：在资源文件名中添加内容哈希值（如`style.[hash].css`），避免缓存未更新的资源。
    4. Service Worker：在PWA项目中，使用Service Worker缓存关键资源，实现离线访问和快速加载。

</details>

## 9. HTTPS是如何保证数据传输安全的？ {#question-subjective-c9468166dc38}

### 题目要点

网络安全。

<details>
<summary>参考答案</summary>

HTTPS通过以下方式保证数据传输安全：

    1. 加密：使用非对称加密（如RSA）协商会话密钥，然后使用对称加密（如AES）加密数据传输，确保数据在传输过程中不被窃取或篡改。
    2. 身份验证：通过数字证书验证服务器的身份，确保用户连接到的是真实的网站。
    3. 完整性保护：使用消息完整性校验（如HMAC）确保数据在传输过程中未被篡改。

</details>

## 10. HTTP/2相比HTTP/1.1有哪些改进？HTTP/3又带来了什么变化？ {#question-subjective-590b202a45ea}

### 题目要点

HTTP协议。

<details>
<summary>参考答案</summary>

HTTP/2相比HTTP/1.1的改进：

    1. 多路复用：允许多个请求和响应同时在一个TCP连接上传输，消除了HTTP/1.1的队头阻塞问题。
    2. 头部压缩：使用HPACK算法压缩HTTP头部，减少传输数据量。
    3. 服务器推送：服务器可以主动推送资源到客户端，无需客户端显式请求。<br>
HTTP/3的变化：
    4. 基于QUIC协议：使用UDP代替TCP，减少连接建立时间，提高性能。
    5. 进一步减少延迟：QUIC协议内置的连接迁移和快速恢复机制，提升了网络切换和不稳定网络下的性能。

</details>

## 11. React中key的作用是什么？如果不加key会有什么问题？ {#question-subjective-40ff975441ea}

### 题目要点

React框架。

<details>
<summary>参考答案</summary>

在React中，`key`的作用是帮助React识别列表中哪些元素发生了变化、添加或删除。它为列表项提供了一个唯一的标识，使得React在更新DOM时能够更高效地进行比较和操作。如果不加`key`，React将使用元素在数组中的索引作为默认的`key`，这可能导致以下问题：

    1. 性能问题：当列表项的顺序发生变化或有项被删除/添加时，React可能无法正确识别哪些元素发生了变化，导致不必要的DOM操作和重新渲染。
    2. 状态问题：对于涉及内部状态的组件，使用索引作为`key`可能造成状态混乱，因为React会根据`key`来重用组件实例。例如，当列表重新排序时，组件的状态可能被错误地保留或丢失。

</details>

## 12. Class组件和Function组件的主要区别是什么？ {#question-subjective-fbd4fa82f4cb}

### 题目要点

React框架。

<details>
<summary>参考答案</summary>

Class组件和Function组件的主要区别如下：

    1. 定义方式：
        1. Class组件：通过继承`React.Component`定义，包含`render`方法和生命周期钩子。
        2. Function组件：通过函数定义，接受`props`参数并返回JSX。
    2. 状态管理：
        1. Class组件：使用`this.state`管理组件状态，通过`this.setState`更新状态。
        2. Function组件：使用`useState` Hook管理状态。
    3. 生命周期方法：
        1. Class组件：提供生命周期钩子（如`componentDidMount`、`componentDidUpdate`）。
        2. Function组件：使用`useEffect` Hook实现生命周期功能。
    4. 性能优化：
        1. Class组件：通过`shouldComponentUpdate`手动控制渲染。
        2. Function组件：使用`React.memo`和`useMemo`、`useCallback`优化渲染。

</details>

## 13. 在项目中，你通常使用哪些方式实现组件间通信？ {#question-subjective-742eae4362fe}

### 题目要点

前端开发。

<details>
<summary>参考答案</summary>

在项目中，我通常使用以下方式实现组件间通信：

    1. Props和回调函数：父组件向子组件传递数据和方法，子组件通过回调函数向父组件传递事件。
    2. Context API：用于跨层级传递共享状态，避免逐层传递`props`。
    3. Redux或Vuex：在大型项目中，使用全局状态管理库集中管理应用状态。
    4. EventEmitter：通过自定义事件总线实现组件间的解耦通信。
    5. URL参数或路由状态：在路由切换时通过URL参数或路由状态传递数据。

</details>

## 14. useMemo和useCallback的区别和使用场景是什么？ {#question-subjective-c7c77cf871c8}

### 题目要点

React性能优化。

<details>
<summary>参考答案</summary>

`useMemo`和`useCallback`的区别和使用场景如下：

    1. useMemo：
        1. 用途：用于记忆化计算结果，避免在每次渲染时重复计算。
        2. 使用场景：当计算结果依赖于某些`props`或`state`，且计算过程较为复杂时。
        3. 参数：接受一个计算函数和依赖数组，只有当依赖数组中的值变化时，才会重新计算。
    2. useCallback：
        1. 用途：用于记忆化函数，避免在每次渲染时创建新的函数引用。
        2. 使用场景：当子组件依赖父组件的函数作为`props`，且不需要在每次渲染时更新函数引用时。
        3. 参数：接受一个函数和依赖数组，只有当依赖数组中的值变化时，才会返回新的函数引用。

</details>

## 15. useEffect和useLayoutEffect的执行时机有什么不同？ {#question-subjective-c7759f45c223}

### 题目要点

React Hooks。

<details>
<summary>参考答案</summary>

`useEffect`和`useLayoutEffect`的执行时机不同：

    1. useEffect：
        1. 执行时机：在浏览器完成DOM绘制后异步执行。
        2. 适用场景：适用于大多数副作用操作，如数据获取、订阅或手动更改DOM。
    2. useLayoutEffect：
        1. 执行时机：在浏览器绘制之前同步执行。
        2. 适用场景：需要在DOM更新后立即读取和修改DOM节点的场景，以避免视觉突变。

</details>

## 16. 请描述你实习或项目中遇到的一个技术难点，你是如何解决的？ {#question-subjective-a3441b13f7fe}

### 题目要点

问题解决能力。

<details>
<summary>参考答案</summary>

在一个电商平台的前端项目中，我遇到了性能瓶颈的问题。随着商品数量的增加，页面的加载时间和交互响应时间显著增加，用户体验变差。为了解决这个问题，我采取了以下措施：

    1. 代码分割和懒加载：将首屏不需要的代码进行懒加载，减少初始加载的包大小。
    2. 图片优化：对所有图片资源进行压缩，并采用WebP格式替代传统的JPEG和PNG格式。同时，实现了图片的懒加载。
    3. 服务端渲染（SSR）：对于商品列表页，采用Nuxt.js进行服务端渲染，减少首屏加载时间。
    4. 缓存策略：通过设置合理的HTTP缓存头和引入CDN加速静态资源的加载。
    5. 性能监测与优化：使用Lighthouse和Chrome DevTools对页面性能进行监测，识别性能瓶颈并进行针对性优化。

</details>

## 17. 在接口安全性和可靠性方面，你做过哪些具体工作？ {#question-subjective-4e64799e0e95}

### 题目要点

接口设计与安全。

<details>
<summary>参考答案</summary>

在接口安全性和可靠性方面，我做了以下工作：

    1. 输入验证：对所有接口的输入参数进行严格的验证和清理，防止SQL注入、XSS等攻击。
    2. 身份验证和授权：实现JWT令牌验证，确保每个请求都来自授权用户。
    3. 限流和防DDoS攻击：在服务器端实现请求限流机制，防止接口被恶意调用。
    4. 错误处理和日志记录：对接口的异常情况进行详细记录，便于问题追踪和调试。
    5. 接口文档：使用Swagger等工具生成接口文档，明确接口的使用规范和限制。

</details>

## 18. 你是否有参与过后端监控相关的开发？具体做了什么？ {#question-subjective-37b1db039604}

### 题目要点

全栈开发能力。

<details>
<summary>参考答案</summary>

是的，我参与过后端监控相关的开发工作。主要负责实现了以下功能：

    1. 性能指标监控：通过在代码中埋点，收集接口响应时间、错误率等性能指标，并使用Prometheus和Grafana进行可视化展示。
    2. 日志收集与分析：使用ELK Stack（Elasticsearch, Logstash, Kibana）收集和分析应用日志，实现对异常日志的实时告警。
    3. 健康检查接口：开发了用于检查服务状态的健康检查接口，确保服务的高可用性。

</details>

## 19. 如何监听History API的变化（如pushState, replaceState）？ {#question-subjective-91301896b04a}

### 题目要点

前端开发。

<details>
<summary>参考答案</summary>

可以通过以下方式监听History API的变化：

```javascript
const HistoryApiHandler = {
    listen(callback) {
        const historyState = {
            onPopstate: null,
            onPushState: null,
            onReplaceState: null
        };

        // 监听popstate事件
        window.addEventListener('popstate', () => {
            if (historyState.onPopstate) {
                historyState.onPopstate();
            }
        });

        // 替换原生pushState和replaceState方法
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function(state) {
            const result = originalPushState.apply(this, arguments);
            if (historyState.onPushState) {
                historyState.onPushState(state);
            }
            return result;
        };

        history.replaceState = function(state) {
            const result = originalReplaceState.apply(this, arguments);
            if (historyState.onReplaceState) {
                historyState.onReplaceState(state);
            }
            return result;
        };

        return historyState;
    }
};

// 使用示例
const handler = HistoryApiHandler.listen();
handler.onPopstate = () => console.log('popstate triggered');
handler.onPushState = (state) => console.log('pushState triggered with state:', state);
handler.onReplaceState = (state) => console.log('replaceState triggered with state:', state);
```

</details>

## 20. 你对Node.js的了解程度如何？是否有相关开发经验？ {#question-subjective-439b763a674c}

### 题目要点

Node.js开发能力。

<details>
<summary>参考答案</summary>

我对Node.js有较深入的了解，并有实际项目的开发经验。熟悉Node.js的事件驱动、非阻塞I/O模型和异步编程模式。开发过RESTful API服务、Web服务器和命令行工具。例如，使用Express框架构建API服务，处理数据库操作和用户认证。

</details>

## 21. 英语怎么样？ {#question-subjective-4aaebc6f6841}

### 题目要点

语言能力。

<details>
<summary>参考答案</summary>

我的英语水平能够满足日常的技术交流和文档阅读需求。能够流畅地阅读和理解英文的技术文档、论文和书籍。在团队协作中，可以使用英语进行书面沟通和简单的口头交流。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-34/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-34/round-43/index.md" >}}) →
