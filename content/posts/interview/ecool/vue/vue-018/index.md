+++
title = "vue路由"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-17T00:00:00+08:00'
draft = true
weight = 18
tags = ["面试", "前端", "Vue", "vue路由", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 从后端路由开始

路由这个概念最先是后端出现的。在以前用模板引擎开发页面时，经常会看到这样

```
http://www.xxx.com/login
```

大致流程可以看成这样：

1.  浏览器发出请求
2.  服务器监听到80端口（或443）有请求过来，并解析url路径
3.  根据服务器的路由配置，返回相应信息（可以是 html 字串，也可以是 json 数据，图片等）
4.  浏览器根据数据包的 Content-Type 来决定如何解析数据

简单来说路由就是用来跟后端服务器进行交互的一种方式，通过不同的路径，来请求不同的资源，请求不同的页面是路由的其中一种功能。

## 前端路由

#### 1. hash 模式

随着 ajax 的流行，异步数据请求交互运行在不刷新浏览器的情况下进行。而异步交互体验的更高级版本就是 SPA —— 单页应用。单页应用不仅仅是在页面交互是无刷新的，连页面跳转都是无刷新的，为了实现单页应用，所以就有了前端路由。 类似于服务端路由，前端路由实现起来其实也很简单，就是匹配不同的 url 路径，进行解析，然后动态的渲染出区域 html 内容。但是这样存在一个问题，就是 url 每次变化的时候，都会造成页面的刷新。那解决问题的思路便是在改变 url 的情况下，保证页面的不刷新。在 2014 年之前，大家是通过 hash 来实现路由，url hash 就是类似于：

```
http://www.xxx.com/#/login
```

这种 #。后面 hash 值的变化，并不会导致浏览器向服务器发出请求，浏览器不发出请求，也就不会刷新页面。另外每次 hash 值的变化，还会触发`hashchange` 这个事件，通过这个事件我们就可以知道 hash 值发生了哪些变化。然后我们便可以监听`hashchange`来实现更新页面部分内容的操作：

```javascript
function matchAndUpdate () {
   // todo 匹配 hash 做 dom 更新操作
}

window.addEventListener('hashchange', matchAndUpdate)
```

#### 2. history 模式

14年后，因为HTML5标准发布。多了两个 API，`pushState` 和 `replaceState`，通过这两个 API 可以改变 url 地址且不会发送请求。同时还有`popstate` 事件。通过这些就能用另一种方式来实现前端路由了，但原理都是跟 hash 实现相同的。用了 HTML5 的实现，单页路由的 url 就不会多出一个#，变得更加美观。但因为没有 # 号，所以当用户刷新页面之类的操作时，浏览器还是会给服务器发送请求。为了避免出现这种情况，所以这个实现需要服务器的支持，需要把所有路由都重定向到根页面。

```javascript
function matchAndUpdate () {
   // todo 匹配路径 做 dom 更新操作
}

window.addEventListener('popstate', matchAndUpdate)
```

## Vue router 实现

我们来看一下`vue-router`是如何定义的：

```javascript
import VueRouter from 'vue-router'
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes: [...]
})

new Vue({
  router
  ...
})
```

可以看出来`vue-router`是通过 `Vue.use`的方法被注入进 Vue 实例中，在使用的时候我们需要全局用到 `vue-router`的`router-view`和`router-link`组件，以及`this.$router/$route`这样的实例对象。那么是如何实现这些操作的呢？

## 造轮子 -- 动手实现一个数据驱动的 router

经过上面的阐述，相信您已经对前端路由以及`vue-router`有了一些大致的了解。那么这里我们为了贯彻无解肥，我们来手把手撸一个下面这样的数据驱动的 `router`：

```javascript
new Router({
  id: 'router-view', // 容器视图
  mode: 'hash', // 模式
  routes: [
    {
      path: '/',
      name: 'home',
      component: '<div>Home</div>',
      beforeEnter: (next) => {
        console.log('before enter home')
        next()
      },
      afterEnter: (next) => {
        console.log('enter home')
        next()
      },
      beforeLeave: (next) => {
        console.log('start leave home')
        next()
      }
    },
    {
      path: '/bar',
      name: 'bar',
      component: '<div>Bar</div>',
      beforeEnter: (next) => {
        console.log('before enter bar')
        next()
      },
      afterEnter: (next) => {
        console.log('enter bar')
        next()
      },
      beforeLeave: (next) => {
        console.log('start leave bar')
        next()
      }
    },
    {
      path: '/foo',
      name: 'foo',
      component: '<div>Foo</div>'
    }
  ]
})
```

#### 思路整理

首先是数据驱动，所以我们可以通过一个`route`对象来表述当前路由状态，比如：

```javascript
current = {
    path: '/', // 路径
    query: {}, // query
    params: {}, // params
    name: '', // 路由名
    fullPath: '/', // 完整路径
    route: {} // 记录当前路由属性
}
```

`current.route`内存放当前路由的配置信息，所以我们只需要监听`current.route`的变化来动态`render`页面便可。

接着我么需要监听不同的路由变化，做相应的处理。以及实现`hash`和`history`模式。

#### 数据驱动

这里我们延用`vue`数据驱动模型，实现一个简单的数据劫持，并更新视图。首先定义我们的`observer`

```javascript
class Observer {
  constructor (value) {
    this.walk(value)
  }

  walk (obj) {
    Object.keys(obj).forEach((key) => {
      // 如果是对象，则递归调用walk，保证每个属性都可以被defineReactive
      if (typeof obj[key] === 'object') {
        this.walk(obj[key])
      }
      defineReactive(obj, key, obj[key])
    })
  }
}

function defineReactive(obj, key, value) {
  let dep = new Dep()
  Object.defineProperty(obj, key, {
    get: () => {
      if (Dep.target) {
        // 依赖收集
        dep.add()
      }
      return value
    },
    set: (newValue) => {
      value = newValue
      // 通知更新，对应的更新视图
      dep.notify()
    }
  })
}

export function observer(value) {
  return new Observer(value)
}
```

再接着，我们需要定义`Dep`和`Watcher`:

```javascript
export class Dep {
  constructor () {
    this.deppend = []
  }
  add () {
    // 收集watcher
    this.deppend.push(Dep.target)
  }
  notify () {
    this.deppend.forEach((target) => {
      // 调用watcher的更新函数
      target.update()
    })
  }
}

Dep.target = null

export function setTarget (target) {
  Dep.target = target
}

export function cleanTarget() {
  Dep.target = null
}

// Watcher
export class Watcher {
  constructor (vm, expression, callback) {
    this.vm = vm
    this.callbacks = []
    this.expression = expression
    this.callbacks.push(callback)
    this.value = this.getVal()

  }
  getVal () {
    setTarget(this)
    // 触发 get 方法，完成对 watcher 的收集
    let val = this.vm
    this.expression.split('.').forEach((key) => {
      val = val[key]
    })
    cleanTarget()
    return val
  }

  // 更新动作
  update () {
    this.callbacks.forEach((cb) => {
      cb()
    })
  }
}
```

到这里我们实现了一个简单的订阅-发布器，所以我们需要对`current.route`做数据劫持。一旦`current.route`更新，我们可以及时的更新当前页面：

```javascript
  // 响应式数据劫持
  observer(this.current)

  // 对 current.route 对象进行依赖收集，变化时通过 render 来更新
  new Watcher(this.current, 'route', this.render.bind(this))
```

恩....到这里，我们似乎已经完成了一个简单的响应式数据更新。其实`render`也就是动态的为页面指定区域渲染对应内容，这里只做一个简化版的`render`:

```javascript
  render() {
    let i
    if ((i = this.history.current) && (i = i.route) && (i = i.component)) {
      document.getElementById(this.container).innerHTML = i
    }
  }
```

## hash 和 history

接下来是`hash`和`history`模式的实现，这里我们可以沿用`vue-router`的思想，建立不同的处理模型便可。来看一下我实现的核心代码：

```javascript
this.history = this.mode === 'history' ? new HTML5History(this) : new HashHistory(this)
```

当页面变化时，我们只需要监听`hashchange`和`popstate`事件，做路由转换`transitionTo`:

```javascript
  /**
   * 路由转换
   * @param target 目标路径
   * @param cb 成功后的回调
   */
  transitionTo(target, cb) {
    // 通过对比传入的 routes 获取匹配到的 targetRoute 对象
    const targetRoute = match(target, this.router.routes)
    this.confirmTransition(targetRoute, () => {
      // 这里会触发视图更新
      this.current.route = targetRoute
      this.current.name = targetRoute.name
      this.current.path = targetRoute.path
      this.current.query = targetRoute.query || getQuery()
      this.current.fullPath = getFullPath(this.current)
      cb && cb()
    })
  }

  /**
   * 确认跳转
   * @param route
   * @param cb
   */
  confirmTransition (route, cb) {
    // 钩子函数执行队列
    let queue = [].concat(
      this.router.beforeEach,
      this.current.route.beforeLeave,
      route.beforeEnter,
      route.afterEnter
    )

    // 通过 step 调度执行
    let i = -1
    const step = () => {
      i ++
      if (i > queue.length) {
        cb()
      } else if (queue[i]) {
        queue[i](step)
      } else {
        step()
      }

    }
    step(i)
  }
}
```

这样我们一方面通过`this.current.route = targetRoute`达到了对之前劫持数据的更新，来达到视图更新。另一方面我们又通过任务队列的调度，实现了基本的钩子函数`beforeEach`、`beforeLeave`、`beforeEnter`、`afterEnter`。 到这里其实也就差不多了，接下来我们顺带着实现几个API吧：

```javascript
  /**
   * 跳转，添加历史记录
   * @param location
   * @example this.push({name: 'home'})
   * @example this.push('/')
   */
  push (location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.router.base, this.current.fullPath)
    })
  }

  /**
   * 跳转，添加历史记录
   * @param location
   * @example this.replaceState({name: 'home'})
   * @example this.replaceState('/')
   */
  replaceState(location) {
    const targetRoute = match(location, this.router.routes)

    this.transitionTo(targetRoute, () => {
      changeUrl(this.router.base, this.current.fullPath, true)
    })
  }

  go (n) {
    window.history.go(n)
  }

  function changeUrl(path, replace) {
    const href = window.location.href
    const i = href.indexOf('#')
    const base = i >= 0 ? href.slice(0, i) : href
    if (replace) {
      window.history.replaceState({}, '', `${base}#/${path}`)
    } else {
      window.history.pushState({}, '', `${base}#/${path}`)
    }
  }
```

## 常见考点

### **1. 路由的基本概念**

#### **问题：**

1. 什么是路由？Vue Router 是如何工作的？
2. 什么是前端路由和后端路由的区别？

#### **考察点：**

-  **路由的作用**：<br>
  - 根据 URL 的变化加载不同的组件或页面内容。
  - 实现页面的导航和状态管理。
-  **前端路由 vs 后端路由**：<br>
  - **前端路由**：通过监听浏览器地址栏的变化更新视图（如 `hash` 模式或 `history` 模式）。
  - **后端路由**：服务器根据不同的 URL 返回对应的资源。
-  **Vue Router 的实现**：<br>
  - Vue Router 是通过动态组件和 URL 监听实现页面切换的。

---

### **2. 路由模式**

#### **问题：**

1. Vue Router 支持哪些路由模式？它们的区别是什么？
2. 如果项目需要 SEO 优化，应该选择哪种模式？为什么？

#### **考察点：**

-  **模式种类**：<br>
  - **`hash` 模式**：基于 `#` 的 URL，依赖 `location.hash`。不需要服务器配置，适合简单场景。
  - **`history` 模式**：基于 HTML5 的 `history.pushState`，更符合 URL 语义，但需要服务器支持。
  - **`abstract` 模式**：运行于无浏览器环境（如 Node.js 中）。
-  **SEO 相关性**：<br>
  - **`hash` 模式**：URL 不利于 SEO，因为爬虫无法识别 `#` 之后的内容。
  - **`history` 模式**：URL 简洁，可被爬虫索引。

---

### **3. 路由配置**

#### **问题：**

1. 如何定义 Vue 的动态路由？什么是嵌套路由？
2. 路由配置中的 `name` 和 `path` 有什么区别？
3. 路由中的 `props` 有哪些用法？

#### **考察点：**

-  **基本配置**：<br>
  - 静态路由：<br>
```javascript
const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];
```
  - 动态路由：  可通过 `$route.params.id` 获取参数。
```javascript
{ path: '/user/:id', component: User }
```
-  **嵌套路由**：<br>
  - 子路由需要在父路由的 `children` 中配置。<br>
```javascript
{
  path: '/parent',
  component: Parent,
  children: [
    { path: 'child', component: Child }
  ]
}
```
-  **路由 `props`**：<br>
  - 静态值：<br>
```javascript
{ path: '/user/:id', component: User, props: { staticValue: true } }
```
  - 动态解析：<br>
```javascript
{ path: '/user/:id', component: User, props: route => ({ id: route.params.id }) }
```

---

### **4. 导航守卫**

#### **问题：**

1. Vue Router 提供了哪些导航守卫？各自的应用场景是什么？
2. 如何实现登录拦截和权限验证？
3. 如何取消导航操作？

#### **考察点：**

-  **导航守卫的分类**：<br>
  - **全局守卫**：<br>
    - `beforeEach`：跳转前的全局拦截。
    - `afterEach`：跳转后的全局回调。
  - **路由独享守卫**：通过路由配置的 `beforeEnter`。
  - **组件内守卫**：<br>
    - `beforeRouteEnter`
    - `beforeRouteUpdate`
    - `beforeRouteLeave`
-  **权限验证**：<br>
  - 示例：在 `beforeEach` 中检查是否登录。<br>
```javascript
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    next('/login');
  } else {
    next();
  }
});
```
-  **取消导航**：<br>
  - 调用 `next(false)` 取消导航。

---

### **5. 路由懒加载**

#### **问题：**

1. 什么是路由懒加载？如何实现？
2. 路由懒加载有哪些优点？

#### **考察点：**

-  **实现方式**：<br>
  - 使用动态 `import`：<br>
```javascript
const routes = [
  {
    path: '/about',
    component: () => import('./About.vue')
  }
];
```
-  **优点**：<br>
  - 减少首屏加载时间，按需加载组件。
  - 提高应用性能，尤其适合大型单页应用。

---

### **6. 动态添加与移除路由**

#### **问题：**

1. 如何动态添加路由？有哪些场景需要用到？
2. 动态添加的路由如何移除？

#### **考察点：**

-  **动态添加**：<br>
  - 使用 `router.addRoute`：<br>
```javascript
router.addRoute({
  path: '/new',
  component: NewComponent
});
```
-  **动态移除**：<br>
  - Vue Router 4 提供了 `removeRoute` 方法。
-  **应用场景**：<br>
  - 根据用户权限动态加载路由。
  - 动态模块加载（如微前端场景）。

---

### **7. 编程式导航**

#### **问题：**

1. Vue Router 中如何使用编程式导航实现页面跳转？
2. 如何替代当前页面而不是添加新历史记录？

#### **考察点：**

-  **基本导航**：<br>
  - 使用 `$router.push`：<br>
```javascript
this.$router.push('/home');
```
  - 使用命名路由：<br>
```javascript
this.$router.push({ name: 'home', params: { id: 123 } });
```
-  **替代导航**：<br>
  - 使用 `$router.replace`：<br>
```javascript
this.$router.replace('/login');
```

---

### **8. 滚动行为**

#### **问题：**

1. 如何在页面跳转时实现滚动到顶部？
2. 路由切换后如何保持页面滚动位置？

#### **考察点：**

-  **自定义滚动行为**：<br>
  - 在路由实例中配置 `scrollBehavior`：<br>
```javascript
const router = new VueRouter({
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { x: 0, y: 0 };
    }
  }
});
```
-  **保持位置**：<br>
  - 使用 `savedPosition` 参数保存滚动位置。

---

### **9. 路由的生命周期与性能优化**

#### **问题：**

1. 路由切换时，如何管理组件的创建与销毁？
2. 如何避免路由组件的重复渲染？

#### **考察点：**

-  **组件复用**：<br>
  - 使用 `keep-alive` 缓存路由组件。<br>
```html
<keep-alive>
  <router-view />
</keep-alive>
```
-  **性能优化**：<br>
  - 优化路由懒加载，减少组件首次渲染时间。
  - 减少复杂嵌套路由的层级。

---

### **10. 异常处理**

#### **问题：**

1. 如何处理路由中找不到的页面？
2. 如何统一处理路由导航过程中的错误？

#### **考察点：**

-  **404 页面**：<br>
  - 配置通配路由：<br>
```javascript
{ path: '*', component: NotFound }
```
-  **错误处理**：<br>
  - 捕获导航错误：<br>
```javascript
router.onError(err => {
  console.error('Navigation Error:', err);
});
```
