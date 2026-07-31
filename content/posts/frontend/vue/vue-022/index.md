+++
title = "响应式原理"
date = '2024-10-05T00:00:00+08:00'
lastmod = '2024-12-18T00:00:00+08:00'
draft = false
weight = 22
tags = ["面试", "前端", "Vue", "响应式原理", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 什么是响应式系统

在 Vue 中，数据驱动视图是一个非常重要的概念。当数据发生变化时，视图会自动更新，这是因为 Vue 实现了一个响应式系统，通过追踪依赖关系来自动更新视图。

简单来说，响应式系统就是 Vue 能够监听数据变化，并在变化时自动更新 DOM 的核心机制。在 Vue3 中，响应式系统的改进使得响应式数据可以更加高效地更新视图，同时也提升了开发体验和性能。

## Vue2 的响应式原理

在 Vue2 中，响应式原理是通过 Object.defineProperty 来实现的。Vue 会在数据对象上定义 getter 和 setter，来实现数据变化时更新视图的功能。

举个例子，当一个数据对象被定义为响应式时，我们可以通过访问这个对象的属性来触发 get 操作。具体实现如下：

```js
Object.defineProperty(obj, 'foo', {
  get: function() {
    console.log('get foo')
    return obj._foo
  },
  set: function(newVal) {
    console.log('set foo')
    obj._foo = newVal
  }
})
```

在上面的代码中，我们通过 Object.defineProperty 方法来监听对象上的属性 foo，当访问 foo 属性时，会触发 get 操作，并输出日志。同理，当给 foo 属性赋值时，会触发 set 操作，并输出日志。

在 Vue2 中，我们可以通过使用上面的方法来将数据对象中的所有属性转化成响应式的，以实现数据变化时更新视图的功能。

## Vue3 的响应式原理

在 Vue3 中，响应式原理的实现方式和 Vue2 相比，有了相当大的变化。Vue3 直接使用了 ES6 Proxy 对象来拦截对对象的访问操作。Proxy 可以监听到对对象进行的访问、赋值等操作，并在这些操作发生时通知相关依赖以维护响应式系统的更新。

具体来说，当我们将一个数据对象定义为 reactive 对象时，Vue3 将在这个对象上建立一个 Proxy，这个 Proxy 会监视这个对象的所有属性，并收集相关依赖。当一个属性发生变化时，Proxy 会自动通知相关依赖进行更新，从而实现响应式的更新。

举个例子，当一个 reactive 对象中的属性被修改时，会通过 Proxy 的 set 拦截器来通知相关依赖进行更新。具体实现代码如下：

```js
function reactive(target){
    const handlers = {
        get(target, key, receiver){
            let result = Reflect.get(target, key, receiver)
            return typeof result === 'object' ? reactive(result) : result
        },
        set(target, key, value, receiver){
            let oldValue = target[key]
            let result = Reflect.set(target, key, value, receiver)
            if(result && oldValue != value) effect()
            return result
        }
    }
    return new Proxy(target, handlers)
}

let product = reactive({price: 5, quantity: 2})
let total = 0

const effect = () => {
    total = product.price * product.quantity
}

effect()

console.log('before set: ', total)
product.quantity = 3
console.log('after set: ', total)
console.log('quantity: ', product.quantity)
```

运行结果如下：

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/1f4ec6ced9894297aa653934cc2f6737~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

从上面的例子可以看到，当对象的某个属性值被修改了，set 拦截器监听到赋值操作，并对比新旧值是否一样，当值不一致时，会触发effec方法，这里的effect可以理解为更新视图的方法，它产生的作用就像vue中computed。

但上面的例子中可能有两个问题：

1. 类似的effect方法可能有多个，就是针对于上面对象product的属性price影响到的页面节点可能有多个，我们平时开发的时候，可能会定义多个computed属性、watch方法。如果price属性的值被修改了，那么就需要去触发与其相关的影响effect，这时就需要有一个回调方法的集合去存储这些影响effect。

```js
const depsMap = new Map()

function track(key){
    let dep = depsMap.get(key)
    if(!dep){
        depsMap.set(key, (dep = new Set()))
    }

    dep.add(effect)
}

function trigger(key){
    let dep = depsMap.get(key)
    if(dep){
        dep.forEach(effect => {
            effect()
        })
    }
}

let product = { price: 5, quantity: 2 }
let total = 0
let effect = () => {
    total = product.price * product.quantity
}

track('quantity')
effect()  // total = 10
product.quantity = 3
trigger('quantity')
console.log(total)  // total = 15
```

我们定义一个map集合，对象属性作为key，value是set集合，存储对象属性所有的回调方法，当对象属性值被修改时，会调用trigger方法获取属性对应的回调方法集合，循环执行。

2. 在平时的开发过程中，我们肯定有多个对象加入到响应式中，这时就需要一个集合去存储多个对象的响应式回调方法集合。

![](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b20757194a94f0db90ed3d57c9c0876~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

这里我们使用了一个WeakMap集合，对象作为key，depsMap作为value，存储多个对象的响应式回调方法。

> WeakMap是一个键值对的集合，键必须为一个对象，值是任意的，而且键是弱引用，如果没有存在其他引用的情况下，是可以正常地进行垃圾回收，这对内存的使用非常友好，自然而然地性能也提升上去，因此WeakMap正好适用于我们上面的使用场景。

最终的代码如下：

```js
const targetMap = new WeakMap()

function track(target, key){
    let depsMap = targetMap.get(target)
    if(!depsMap){
        targetMap.set(target, (depsMap = new Map()))
    }

    let dep = depsMap.get(key)
    if(!dep){
        depsMap.set(key, (dep = new Set()))
    }

    dep.add(effect)
}

function trigger(target, key){
    const depsMap = targetMap.get(target)
    if(!depsMap) return

    let dep = depsMap.get(key)
    if(dep){
        dep.forEach(effect => {
            effect()
        })
    }
}

function reactive(target){
    const handlers = {
        get(target, key, receiver){
            let result = Reflect.get(target, key, receiver)
            track(target, key)
            return result
        },
        set(target, key, value, receiver){
            let oldValue = target[key]
            let result = Reflect.set(target, key, value, receiver)
            if(result && oldValue != value){
                trigger(target, key)
            }
            return result
        }
    }

    return new Proxy(target, handlers)
}

let product = reactive({price: 5, quantity: 2})
let total = 0

const effect = () => {
    total = product.price * product.quantity
}

effect()

console.log('before set: ', total)
product.quantity = 3
console.log('after set: ', total)
console.log('quantity: ', product.quantity)
```

## 总结

在 Vue3 中，响应式系统的实现方式使用了 ES6 Proxy 对象来拦截数据对象的访问操作，避免了 Vue2 中 Object.defineProperty 无法监听数组变化等问题，使得响应式数据更新更加高效、可预测和易维护。

同时，Vue3 的依赖收集机制也进行了一定的优化，使用基于函数的依赖收集提高了系统的性能，同时也使得开发人员可以更方便地跟踪和定位问题。

最后，Vue3 在响应式原理的改进和优化为我们提供了更加高效、可靠和强大的开发体验。

## 常见考点

### **1. 响应式实现原理**

-  **Vue 2：`Object.defineProperty`**<br>
  - 如何通过 `Object.defineProperty` 劫持对象的属性？
  - 为什么 Vue 2 中的响应式不能监控数组索引和对象新增/删除属性？
  - Vue 2 是如何进行依赖收集和视图更新的？
  - Vue 2 中，`setter` 和 `getter` 是如何工作的？
-  **Vue 3：`Proxy`**<br>
  - 为什么 Vue 3 使用 `Proxy` 代替了 `Object.defineProperty`？
  - `Proxy` 如何处理对象的所有操作（包括新增属性、删除属性等）？
  - Vue 3 中，`get` 和 `set` 方法如何拦截数据的读写？
  - `Proxy` 如何避免了 Vue 2 中的深度递归问题？
  - 通过 `Proxy` 实现的懒加载和高效的依赖追踪。

---

### **2. 数据代理与依赖收集**

- **依赖收集**：<br>
  - Vue 如何实现依赖收集？`Watcher` 和 `Dep` 的角色是什么？
  - 在 Vue 3 中，如何通过 `Effect` 函数收集依赖？
  - 依赖收集与视图更新是如何相互作用的？
  - Vue 如何跟踪每个组件或视图对响应式数据的依赖？
- **视图更新**：<br>
  - 当响应式数据发生变化时，Vue 是如何通知依赖于它的视图进行更新的？
  - Vue 3 中如何通过 `Proxy` 来通知依赖的更新，而不需要手动触发 `set`？

---

### **3. 响应式数据的种类**

-  **`reactive()` 和 `ref()`**：<br>
  - `reactive()` 是如何让对象变得响应式的？与 `ref()` 有什么区别？
  - `ref()` 返回的是一个对象，为什么需要 `.value` 属性来访问和修改其值？
  - 如何在 Vue 3 中处理基本数据类型（例如字符串、数字、布尔值）的响应式？
  - 如何通过 `reactive()` 和 `ref()` 组合使用来处理复杂的数据结构？
-  **对象和数组的响应式**：<br>
  - Vue 3 如何解决 Vue 2 中数组索引和对象新增/删除属性无法响应式更新的问题？
  - 在 Vue 3 中，如何处理嵌套对象的响应式？`Proxy` 是如何递归地处理嵌套对象的？

---

### **4. Vue 3 响应式的性能优化**

-  **懒加载和优化**：<br>
  - Vue 3 如何优化性能，特别是在处理嵌套对象时？为什么 `Proxy` 相比 `Object.defineProperty` 更高效？
  - 如何通过懒加载来减少不必要的依赖收集？
  - 在 Vue 3 中，依赖追踪是如何更加高效的，避免了 Vue 2 中的性能瓶颈？
-  **优化的目标**：<br>
  - 为什么 Vue 3 能够比 Vue 2 更高效地处理大规模的数据和复杂的组件树？
  - `Proxy` 如何支持惰性计算和按需收集依赖？

---

### **5. Vue 2 和 Vue 3 的响应式差异**

- **响应式系统的差异**：<br>
  - Vue 2 和 Vue 3 的响应式系统有何本质区别？
  - 为什么 Vue 3 的响应式系统相较 Vue 2 更加强大和灵活？
  - `Proxy` 如何解决 Vue 2 中的一些限制（如不能响应数组索引、对象新增/删除属性等）？
- **性能差异**：<br>
  - 在处理深度嵌套的数据结构时，Vue 2 和 Vue 3 的性能差异。
  - Vue 3 如何避免了 Vue 2 中的递归性能问题？
  - Vue 3 是如何提高响应式系统在高频更新场景下的性能的？

---

### **6. 响应式的局限性与陷阱**

-  **Vue 2 的局限性**：<br>
  - Vue 2 为什么无法监测数组索引的变化？
  - Vue 2 如何使用 `$set` 和 `$delete` 来处理新增和删除属性的问题？
  - Vue 2 的响应式系统是否存在性能瓶颈，如何优化？
-  **Vue 3 的陷阱**：<br>
  - Vue 3 中是否仍有需要注意的响应式陷阱？
  - 如果手动修改对象的 `__proto__`，Vue 3 是否仍然能监测到这些变化？

---

### **7. 响应式的使用场景**

-  **Vue 3 的 `watch` 和 `computed`**：<br>
  - 如何利用 `watch` 和 `computed` 对响应式数据进行监听与派发操作？
  - Vue 3 中，`computed` 和 `watch` 的工作原理是什么？与 Vue 2 有什么不同？
-  **嵌套对象与数组的处理**：<br>
  - 如何在 Vue 3 中创建一个包含嵌套对象或数组的响应式数据，并确保其变化会反映到视图？
  - 何时选择使用 `reactive()` 还是 `ref()` 来创建响应式数据？

---

### **8. Vue 3 中的其他相关特性**

-  **`readonly()` 和 `shallowReactive()`**：<br>
  - `readonly()` 是如何限制数据修改的？它是如何影响响应式系统的？
  - `shallowReactive()` 是什么？如何使用它避免对嵌套对象的深度代理？
-  **`toRefs()` 和 `toRaw()`**：<br>
  - `toRefs()` 如何将响应式对象转换为普通的引用，方便解构？
  - `toRaw()` 是如何返回原始对象的？何时使用 `toRaw()`？
