+++
title = "Vue实例挂载"
date = '2024-10-04T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = true
weight = 1
tags = ["面试", "前端", "Vue", "Vue实例挂载", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
### **一、思考**

我们都听过知其然知其所以然这句话

那么不知道大家是否思考过`new Vue()`这个过程中究竟做了些什么？

过程中是如何完成数据的绑定，又是如何将数据渲染到视图的等等

### **一、分析**

首先找到`vue`的构造函数

源码位置：src\core\instance\index.js

```javascript
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}
```

`options`是用户传递过来的配置项，如`data、methods`等常用的方法

`vue`构建函数调用`_init`方法，但我们发现本文件中并没有此方法，但仔细可以看到文件下方定定义了很多初始化方法

```javascript
initMixin(Vue);     // 定义 _init
stateMixin(Vue);    // 定义 $set $get $delete $watch 等
eventsMixin(Vue);   // 定义事件  $on  $once $off $emit
lifecycleMixin(Vue);// 定义 _update  $forceUpdate  $destroy
renderMixin(Vue);   // 定义 _render 返回虚拟dom
```

首先可以看`initMixin`方法，发现该方法在`Vue`原型上定义了`_init`方法

源码位置：src\core\instance\init.js

```javascript
Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    // 合并属性，判断初始化的是否是组件，这里合并主要是 mixins 或 extends 的方法
    if (options && options._isComponent) {
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options)
    } else { // 合并vue属性
      vm.$options = mergeOptions(
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
    }
    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      // 初始化proxy拦截器
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    // 初始化组件生命周期标志位
    initLifecycle(vm)
    // 初始化组件事件侦听
    initEvents(vm)
    // 初始化渲染方法
    initRender(vm)
    callHook(vm, 'beforeCreate')
    // 初始化依赖注入内容，在初始化data、props之前
    initInjections(vm) // resolve injections before data/props
    // 初始化props/data/method/watch/methods
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
    // 挂载元素
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
```

仔细阅读上面的代码，我们得到以下结论：

- 在调用`beforeCreate`之前，数据初始化并未完成，像`data`、`props`这些属性无法访问到
- 到了`created`的时候，数据已经初始化完成，能够访问`data`、`props`这些属性，但这时候并未完成`dom`的挂载，因此无法访问到`dom`元素
- 挂载方法是调用`vm.$mount`方法

`initState`方法是完成`props/data/method/watch/methods`的初始化

源码位置：src\core\instance\state.js

```javascript
export function initState (vm: Component) {
  // 初始化组件的watcher列表
  vm._watchers = []
  const opts = vm.$options
  // 初始化props
  if (opts.props) initProps(vm, opts.props)
  // 初始化methods方法
  if (opts.methods) initMethods(vm, opts.methods)
  if (opts.data) {
    // 初始化data
    initData(vm)
  } else {
    observe(vm._data = {}, true /* asRootData */)
  }
  if (opts.computed) initComputed(vm, opts.computed)
  if (opts.watch && opts.watch !== nativeWatch) {
    initWatch(vm, opts.watch)
  }
}
```

我们和这里主要看初始化`data`的方法为`initData`，它与`initState`在同一文件上

```javascript
function initData (vm: Component) {
  let data = vm.$options.data
  // 获取到组件上的data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  if (!isPlainObject(data)) {
    data = {}
    process.env.NODE_ENV !== 'production' && warn(
      'data functions should return an object:\n' +
      'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
      vm
    )
  }
  // proxy data on instance
  const keys = Object.keys(data)
  const props = vm.$options.props
  const methods = vm.$options.methods
  let i = keys.length
  while (i--) {
    const key = keys[i]
    if (process.env.NODE_ENV !== 'production') {
      // 属性名不能与方法名重复
      if (methods && hasOwn(methods, key)) {
        warn(
          `Method "${key}" has already been defined as a data property.`,
          vm
        )
      }
    }
    // 属性名不能与state名称重复
    if (props && hasOwn(props, key)) {
      process.env.NODE_ENV !== 'production' && warn(
        `The data property "${key}" is already declared as a prop. ` +
        `Use prop default value instead.`,
        vm
      )
    } else if (!isReserved(key)) { // 验证key值的合法性
      // 将_data中的数据挂载到组件vm上,这样就可以通过this.xxx访问到组件上的数据
      proxy(vm, `_data`, key)
    }
  }
  // observe data
  // 响应式监听data是数据的变化
  observe(data, true /* asRootData */)
}
```

仔细阅读上面的代码，我们可以得到以下结论：

- 初始化顺序：`props`、`methods`、`data`
- `data`定义的时候可选择函数形式或者对象形式（组件只能为函数形式）

关于数据响应式在这就不展开详细说明

上文提到挂载方法是调用`vm.$mount`方法

源码位置：/src/platforms/web/entry-runtime-with-compiler.js#L18

```javascript
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  // 获取或查询元素
  el = el && query(el)

  /* istanbul ignore if */
  // vue 不允许直接挂载到body或页面文档上
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    // 存在template模板，解析vue模板文件
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      // 通过选择器获取元素内容
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }
      /**
       *  1.将temmplate解析ast tree
       *  2.将ast tree转换成render语法字符串
       *  3.生成render方法
       */
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        shouldDecodeNewlines,
        shouldDecodeNewlinesForHref,
        delimiters: options.delimiters,
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}
```

阅读上面代码，我们能得到以下结论：

- 不要将根元素放到`body`或者`html`上
- 可以在对象中定义`template/render`或者直接使用`template`、`el`表示元素选择器
- 最终都会解析成`render`函数，调用`compileToFunctions`，会将`template`解析成`render`函数

对`template`的解析步骤大致分为以下几步：

- 将`html`文档片段解析成`ast`描述符
- 将`ast`描述符解析成字符串
- 生成`render`函数

生成`render`函数，挂载到`vm`上后，会再次调用`mount`方法

源码位置：src\platforms\web\runtime\index.js

```javascript
// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // 渲染组件
  return mountComponent(this, el, hydrating)
}
```

调用`mountComponent`渲染组件

```javascript
export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
  vm.$el = el
  // 如果没有获取解析的render函数，则会抛出警告
  // render是解析模板文件生成的
  if (!vm.$options.render) {
    vm.$options.render = createEmptyVNode
    if (process.env.NODE_ENV !== 'production') {
      /* istanbul ignore if */
      if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
        vm.$options.el || el) {
        warn(
          'You are using the runtime-only build of Vue where the template ' +
          'compiler is not available. Either pre-compile the templates into ' +
          'render functions, or use the compiler-included build.',
          vm
        )
      } else {
        // 没有获取到vue的模板文件
        warn(
          'Failed to mount component: template or render function not defined.',
          vm
        )
      }
    }
  }
  // 执行beforeMount钩子
  callHook(vm, 'beforeMount')

  let updateComponent
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
    updateComponent = () => {
      const name = vm._name
      const id = vm._uid
      const startTag = `vue-perf-start:${id}`
      const endTag = `vue-perf-end:${id}`

      mark(startTag)
      const vnode = vm._render()
      mark(endTag)
      measure(`vue ${name} render`, startTag, endTag)

      mark(startTag)
      vm._update(vnode, hydrating)
      mark(endTag)
      measure(`vue ${name} patch`, startTag, endTag)
    }
  } else {
    // 定义更新函数
    updateComponent = () => {
      // 实际调⽤是在lifeCycleMixin中定义的_update和renderMixin中定义的_render
      vm._update(vm._render(), hydrating)
    }
  }
  // we set this to vm._watcher inside the watcher's constructor
  // since the watcher's initial patch may call $forceUpdate (e.g. inside child
  // component's mounted hook), which relies on vm._watcher being already defined
  // 监听当前组件状态，当有数据变化时，更新组件
  new Watcher(vm, updateComponent, noop, {
    before () {
      if (vm._isMounted && !vm._isDestroyed) {
        // 数据更新引发的组件更新
        callHook(vm, 'beforeUpdate')
      }
    }
  }, true /* isRenderWatcher */)
  hydrating = false

  // manually mounted instance, call mounted on self
  // mounted is called for render-created child components in its inserted hook
  if (vm.$vnode == null) {
    vm._isMounted = true
    callHook(vm, 'mounted')
  }
  return vm
}
```

阅读上面代码，我们得到以下结论：

- 会触发`boforeCreate`钩子
- 定义`updateComponent`渲染页面视图的方法
- 监听组件数据，一旦发生变化，触发`beforeUpdate`生命钩子

`updateComponent`方法主要执行在`vue`初始化时声明的`render`，`update`方法

`render`的作用主要是生成`vnode`

源码位置：src\core\instance\render.js

```javascript
// 定义vue 原型上的render方法
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    // render函数来自于组件的option
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
            _parentVnode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
        )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm
        // 调用render方法，自己的独特的render方法， 传入createElement参数，生成vNode
        vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
        handleError(e, vm, `render`)
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
            try {
                vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
            } catch (e) {
                handleError(e, vm, `renderError`)
                vnode = vm._vnode
            }
        } else {
            vnode = vm._vnode
        }
    } finally {
        currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
        if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
            warn(
                'Multiple root nodes returned from render function. Render function ' +
                'should return a single root node.',
                vm
            )
        }
        vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
}
```

`_update`主要功能是调用`patch`，将`vnode`转换为真实`DOM`，并且更新到页面中

源码位置：src\core\instance\lifecycle.js

```javascript
// 定义vue 原型上的render方法
Vue.prototype._render = function (): VNode {
    const vm: Component = this
    // render函数来自于组件的option
    const { render, _parentVnode } = vm.$options

    if (_parentVnode) {
        vm.$scopedSlots = normalizeScopedSlots(
            _parentVnode.data.scopedSlots,
            vm.$slots,
            vm.$scopedSlots
        )
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
        // There's no need to maintain a stack because all render fns are called
        // separately from one another. Nested component's render fns are called
        // when parent component is patched.
        currentRenderingInstance = vm
        // 调用render方法，自己的独特的render方法， 传入createElement参数，生成vNode
        vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
        handleError(e, vm, `render`)
        // return error render result,
        // or previous vnode to prevent render error causing blank component
        /* istanbul ignore else */
        if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
            try {
                vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
            } catch (e) {
                handleError(e, vm, `renderError`)
                vnode = vm._vnode
            }
        } else {
            vnode = vm._vnode
        }
    } finally {
        currentRenderingInstance = null
    }
    // if the returned array contains only a single node, allow it
    if (Array.isArray(vnode) && vnode.length === 1) {
        vnode = vnode[0]
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
        if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
            warn(
                'Multiple root nodes returned from render function. Render function ' +
                'should return a single root node.',
                vm
            )
        }
        vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
}
```

### **三、结论**

- `new Vue`的时候调用会调用`_init`方法<br>
  - 定义 set、get 、delete、watch 等方法
  - 定义 on、off、emit、off等事件
  - 定义 _update、forceUpdate、destroy生命周期
- 调用`$mount`进行页面的挂载
- 挂载的时候主要是通过`mountComponent`方法
- 定义`updateComponent`更新函数
- 执行`render`生成虚拟`DOM`
- `_update`将虚拟`DOM`生成真实`DOM`结构，并且渲染到页面中

## 常见考点

### **1. 生命周期钩子**

#### **问题**：

- Vue 的挂载过程中涉及哪些生命周期钩子？它们的执行顺序是怎样的？
- `beforeCreate` 和 `created` 钩子之间有什么区别？
- `mounted` 钩子中的常见应用场景是什么？

#### **关键点**：

- 知道生命周期的顺序和作用。
- **`beforeCreate`**: 数据未初始化，无法访问 `data` 和 `methods`。
- **`created`**: 响应式数据已可用，但未挂载 DOM。
- **`beforeMount`** 和 **`mounted`**: 掌握挂载前后 DOM 的状态。

---

### **2. 挂载目标**

#### **问题**：

- Vue 实例挂载的目标（`el`）必须满足哪些条件？
- 如果指定的 `el` 元素不存在，会发生什么？
- 如何动态挂载 Vue 实例？

#### **关键点**：

- `el` 必须是一个已存在的 DOM 元素或 CSS 选择器。
- 如果 `el` 不存在，Vue 会创建一个空的 DOM 元素作为挂载点。
- 动态挂载示例：<br>
```javascript
const app = new Vue({
  render: h => h(App)
});
app.$mount('#app');
```

---

### **3. 模板编译**

#### **问题**：

- Vue 挂载时，`template`、`render` 和 `el` 的关系是什么？
- 如果同时提供了 `template` 和 `render`，优先级如何？
- Vue 的模板编译过程是什么样的？

#### **关键点**：

- 优先级：`render` > `template` > `el` 内部的 HTML。
- 运行时版（`vue.runtime.js`）无法直接编译模板，需使用预编译后的 `render` 函数。

---

### **4. 响应式系统初始化**

#### **问题**：

- 挂载过程中，响应式系统在什么时候被初始化？
- `data` 对象在挂载前后有什么变化？
- Vue 是如何保证数据与视图之间的绑定的？

#### **关键点**：

- 数据响应式是在 `beforeCreate` 和 `created` 阶段完成的。
- Vue 使用 `Object.defineProperty` 或 `Proxy`（Vue 3）实现响应式数据绑定。

---

### **5. 挂载前后的 DOM 操作**

#### **问题**：

- 在 `beforeMount` 和 `mounted` 钩子中，DOM 的状态有何不同？
- 为什么不建议在 `created` 钩子中直接操作 DOM？
- Vue 挂载后，如何动态更新 DOM？

#### **关键点**：

- 在 `beforeMount` 阶段，Vue 虚拟 DOM 已生成，但未映射到真实 DOM。
- 在 `mounted` 阶段，真实 DOM 可用，适合进行第三方库的 DOM 操作。

---

### **6. 挂载优化**

#### **问题**：

- Vue 的挂载过程如何影响性能？
- 有哪些优化挂载过程的方法？
- 如何避免挂载过程中出现白屏问题？

#### **关键点**：

- 使用 `v-cloak` 避免模板渲染前的白屏：<br>
```css
[v-cloak] {
  display: none;
}
```
- 优化挂载性能：<br>
  - 减少初始数据体积。
  - 延迟挂载不必要的组件（按需加载）。
  - 使用预渲染或服务端渲染（SSR）。

---

### **7. 实践与问题排查**

#### **问题**：

- 如果挂载后视图未正常渲染，你会如何排查问题？
- 在项目中是否遇到过挂载相关的问题？如何解决？
- 如何挂载多个 Vue 实例到不同的 DOM 节点？

#### **关键点**：

- 排查挂载问题：<br>
  - 检查 `el` 是否存在。
  - 确认 `data` 或模板中是否有语法错误。
- 多实例挂载：<br>
```javascript
new Vue({ el: '#app1' });
new Vue({ el: '#app2' });
```

---

### **8. Vue 3 的挂载变化**

#### **问题**：

- Vue 3 的挂载过程与 Vue 2 有何不同？
- Vue 3 的 `createApp` 方法如何取代 Vue 2 的 `new Vue`？
- Vue 3 是否支持多个应用实例共存？

#### **关键点**：

- Vue 3 使用 `createApp` 创建实例：<br>
```javascript
import { createApp } from 'vue';
const app = createApp(App);
app.mount('#app');
```
- 支持多个应用实例共存，实例之间彼此独立。

---

### **9. 自定义指令与挂载的关系**

#### **问题**：

- 自定义指令（如 `v-focus`）如何与 Vue 挂载过程关联？
- 在自定义指令中，哪个生命周期适合操作 DOM？

#### **关键点**：

- 自定义指令的生命周期（Vue 2 和 3）：<br>
  - `bind`/`beforeMount`：绑定时触发。
  - `inserted`/`mounted`：元素插入 DOM 后触发，适合操作 DOM。

---

### **10. 开放性问题**

#### **问题**：

- Vue 的挂载过程与 React 有何异同？
- 如何在挂载过程中注入异步数据？
- Vue 的挂载机制是否有改进空间？你会如何设计？

#### **关键点**：

- 展现候选人对 Vue 框架的深度理解，以及解决问题的能力。

---

### 面试总结

通过考察 **Vue实例挂载**，可以了解候选人对 Vue 生命周期、响应式系统、模板编译、性能优化等核心机制的掌握情况，特别是在实际项目中如何应用这些知识以解决问题。优秀的候选人应具备扎实的理论基础，并能结合实际经验深入阐述。
