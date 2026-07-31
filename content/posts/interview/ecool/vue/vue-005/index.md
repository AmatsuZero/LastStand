+++
title = "侦听器watch"
date = '2024-10-04T00:00:00+08:00'
lastmod = '2024-12-15T00:00:00+08:00'
draft = true
weight = 5
tags = ["面试", "前端", "Vue", "侦听器watch", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 一、 watch API

我们先看看 watch的使用例子,watch 有多种用法，可以接收多种类型参数:

```javascript
import { reactive, watch } from 'vue'

// 1. 传入getter函数
const state = reactive({ count: 0 }) 
watch(() => state.count, (count, prevCount) => { 
  // 当 state.count 更新，会触发此回调函数 
}) 

// 2. 传入reactive对象
watch(state, (count, prevCount) => { 
  // 当 state.count 更新，会触发此回调函数 
}) 

// 3. 传入ref对象
const stateRef = ref(0) 
watch(stateRef, (count, prevCount) => { 
  // 当 stateRef.value 更新，会触发此回调函数 
}) 

// 4.监听多个数据源，回调函数接受两个数组，分别对应来源数组中的新值和旧值：
watch([fooRef, barRef], ([foo, bar], [prevFoo, prevBar]) => { /* ... */ })
```

从上面的例子可以看到，对于 watch，它能接收的第一个参数类型非常多。

你可以传入一个ref对象、一个响应式对象、一个 getter 函数、甚至是一个数组。

我们在上一篇中知道了`computed对象`其内部是借助了 `effect函数` 创建了一个 `reactiveEffect函数`，在访问`computed对象`的值时，执行其 `runner函数` 求值。

对于`watch`来说，其实它的内部也是借助了`effect函数`来实现，下面请看源码：

```javascript
function watch(source, cb, options) { 
  if ((process.env.NODE_ENV !== 'production') && !isFunction(cb)) { 
    warn(`\`watch(fn, options?)\` signature has been moved to a separate API. ` + 
      `Use \`watchEffect(fn, options?)\` instead. \`watch\` now only ` + 
      `supports \`watch(source, cb, options?) signature.`) 
  } 
  return doWatch(source, cb, options) 
}
```

可以看到，watch方法里就是调用 `doWatch函数`，核心逻辑都藏在`doWtach` 函数里面。我们继续查 `doWatch` 的逻辑

### 1. 处理参数

```javascript
function doWatch(source, cb, { immediate, deep, flush, onTrack, onTrigger } = EMPTY_OBJ) { 
  
  // 当前组件实例 
const instance = currentInstance 
let getter 
if (isArray(source)) { 
  getter = () => source.map(s => { 
    if (isRef(s)) { 
      return s.value 
    } 
    else if (isReactive(s)) { 
      return traverse(s) 
    } 
    else if (isFunction(s)) { 
      return callWithErrorHandling(s, instance, 2 /* WATCH_GETTER */) 
    } 
    else { 
      (process.env.NODE_ENV !== 'production') && warnInvalidSource(s) 
    } 
  }) 
} 
else if (isRef(source)) { 
  getter = () => source.value 
} 
else if (isReactive(source)) { 
  getter = () => source 
  deep = true 
} 
else if (isFunction(source)) { 
  if (cb) { 
    // getter with cb 
    getter = () => callWithErrorHandling(source, instance, 2 /* WATCH_GETTER */) 
  } 
  else { 
    // watchEffect 的逻辑 
  } 
} 
else { 
  getter = NOOP 
  (process.env.NODE_ENV !== 'production') && warnInvalidSource(source) 
} 
if (cb && deep) { 
  const baseGetter = getter 
  getter = () => traverse(baseGetter()) 
} 

  //...
 }
```

在开头的使用例子中,我们知道watch 第一个参数可以接受不同数据类型的数据，所以`doWatch`函数里首先会对传进来的第一个函数`source`进行格式处理。

1.  如果 source 是 `ref` 对象，创建一个访问 `source.value` 的 `getter` 函数; 
2.  如果 source 是 `reactive` 对象， 则创建一个访问 `source` 的 `getter` 函数，并设置`deep`为 `true`。（watch默认开启了深层侦听） 
3.  如果 source 是 一个`函数`：判断第二个参数`cb`，也就是回调函数是否存在 （1）如果 **存在**，对其进行简单的封装后赋值给getter函数 （2）如果 **不存在**，相当于是和`watchEffect`一样的调用逻辑。 对于 `watchEffect`的处理分支，我们后面再了解。 
4.  如果 source 是一个`数组`，则会循环数组中的元素对数据类型进行判断。 
5.  如果 source 都不满足条件，则会在非生产环境下打印警告。 

> 在处理完参数以后，`getter` 变量就会变成一个标准的 `getter` 函数，这个`getter` 函数会返回一个响应式对象。在后续通过内置的 `effect` 函数创建 `runner` 副作用函数时，执行 `runner`函数也就是执行 `getter`函数进行求值，`getter`函数返回的响应式对象就是`watcher`求值的结果。

6.  如果 `回调函数cb`存在且 `deep` 为`true`的情况下，会将 `getter`函数的结果，也就是返回的响应式对象进行循环遍历，递归地去访问这个响应式对象的每一个子属性。 
7.  我们都知道，收集依赖的前提是访问了对象属性。只有收集了依赖后去修改属性，才会通知对应的依赖更新。所以这里递归访问对象的子属性，就是为了**收集依赖**，收集的依赖就是这个 `watch`内部 的`runner`函数 

```javascript
function traverse(value: unknown, seen: Set<unknown> = new Set()) {
  if (!isObject(value) || seen.has(value)) {
    return value
  }
  seen.add(value)
  if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      traverse(value[i], seen)
    }
  } else if (value instanceof Map) {
    value.forEach((v, key) => {
      // to register mutation dep for existing keys
      traverse(value.get(key), seen)
    })
  } else if (value instanceof Set) {
    value.forEach(v => {
      traverse(v, seen)
    })
  } else {
    for (const key in value) {
      traverse(value[key], seen)
    }
  }
  return value
}
```

谈到递归，我们很容易会想到性能问题。没错，假如侦听的这个响应式对象非常复杂， 层级非常深，那么递归去执行`traverse` 函数会产生一定的性能问题。为了避免出现性能损耗，最好是可以明确地表示侦听的属性：

```javascript
watch(() => state.count.a.b, (newVal, oldVal) => { 
  console.log(newVal) 
}) 
state.count.a.b = 2 
```

### 2. 处理回调函数

`watch`的第二个参数是在发生变化时要调用的`回调函数cb`。这个回调函数接受三个参数：`新值newVal`、`旧值oldVal`，以及一个用于注册副作用清理的回调函数 **~~onInvalidate~~** 。

> 注意： `vue3.4`以及最新版本中已经删除 onInvalidate 这一参数,所以你可以忽略。该回调函数会在副作用下一次重新执行前调用，可以用来清除无效的副作用，例如等待中的异步请求。

```javascript
let cleanup 
// 注册无效回调函数 
const onInvalidate = (fn) => { 
  cleanup = runner.options.onStop = () => { 
    callWithErrorHandling(fn, instance, 4 /* WATCH_CLEANUP */) 
  } 
} 
// 旧值初始值 
let oldValue = isArray(source) ? [] : INITIAL_WATCHER_VALUE /*{}*/ 
// 回调函数 
const applyCb = cb 
  ? () => { 
    // 组件销毁，则直接返回 
    if (instance && instance.isUnmounted) { 
      return 
    } 
    // 求得新值 
    const newValue = runner() 
    if (deep || hasChanged(newValue, oldValue)) { 
      // 执行清理函数 
      if (cleanup) { 
        cleanup() 
      } 
      callWithAsyncErrorHandling(cb, instance, 3 /* WATCH_CALLBACK */, [ 
        newValue, 
        // 第一次更改时传递旧值为 undefined 
        oldValue === INITIAL_WATCHER_VALUE ? undefined : oldValue, 
        onInvalidate 
      ]) 
      // 更新旧值 
      oldValue = newValue 
    } 
  } 
  : void 0 
  
 const runner = effect(getter, {
    lazy: true,
    // so it runs before component update effects in pre flush mode
    computed: true,
    onTrack,
    onTrigger,
    scheduler: applyCb ? () => scheduler(applyCb) : scheduler
  })
```

1. 首先会创建一个 `onInvalidate` 函数用来注册无效回调函数，现在你先不用管这个逻辑，因为它已经在最新版本中被删除了。
2. 接着定义了初始的`value`值，如果监听的`source`是一个数组，初始`oldValue`就是空数组`[]`,否则就为空对象`{}`。
3. 如果有传入`cb回调函数`，那么就会重新构建一个`回调函数applyCb`，在侦听的`source`发生改变时执行`applyCb`的逻辑。
4. 在`applyCb`里面首先会判断如果此时组件已经销毁，那么直接结束，不作任何处理
5. 执行`runner`函数，获得新值`newValue`。执行这个`runner`函数其实就是执行`getter`函数获取新值
6. 最后进行判断，如果是 `deep` 的情况或者新旧值发生了变化，则执行回调函数 `cb`，传入参数 `newValue` 和 `oldValue`。

> 注意，第一次执行的时候旧值的初始值是空数组或者 undefined。执行完回调函数 cb 后，把旧值 oldValue 再更新为 newValue，这是为了下一次的比对

### 3. 处理调度执行

`watch`接收的第三个可选的参数是一个对象，支持以下这些选项：

- **`immediate`**：在侦听器创建时立即触发回调。第一次调用时旧值是 `undefined`。
- **`deep`**：如果源是对象，强制深度遍历，以便在深层级变更时触发回调。参考[深层侦听器](https://cn.vuejs.org/guide/essentials/watchers.html#deep-watchers)。
- **`flush`**：调整回调函数的刷新时机。参考[回调的刷新时机](https://cn.vuejs.org/guide/essentials/watchers.html#callback-flush-timing)及 [`watchEffect()`](https://cn.vuejs.org/api/reactivity-core.html#watcheffect)。

这里我们重点关注 `flush`这个配置值，因为不同的 `flush` 决定了 `watcher` 的执行时机。

```javascript
const invoke = (fn) => fn() 
let scheduler 
if (flush === 'sync') { 
  // 同步 
  scheduler = invoke 
} 
else if (flush === 'pre') { 
  scheduler = job => { 
    if (!instance || instance.isMounted) { 
      // 进入异步队列，组件更新前执行 
      queueJob(job) 
    } 
    else { 
      // 如果组件还没挂载，则同步执行确保在组件挂载前 
      job() 
    } 
  } 
} 
else { 
  // 进入异步队列，组件更新后执行 
  scheduler = job => queuePostRenderEffect(job, instance && instance.suspense) 
} 
```

如果在创建`effect`时，配置了scheduler属性，那么在数据的依赖触发时，也就是执行`trigger`函数中的`run`方法时，并不会直接执行副作用函数，而是执行`scheduler`方法，这就相当于将控制权交了出去。

而传入不同`flush`值，也就会有不同`scheduler`函数，从而实现不同的调度方式，也就是决定了`watcher` 的 执行时机。

1.  当 `flush` 为 `sync` 的时候，表示它是一个同步 `watcher`，即当数据变化时同步执行回调函数。 
2.  当 `flush` 为 `pre` 的时候，回调函数通过 `queueJob` 的方式在组件更新之前执行，如果组件还没挂载，则同步执行确保回调函数在组件挂载之前执行。 
3.  如果没设置 `flush` 或者 `flus`h为 `post`，那么回调函数通过 `queuePostRenderEffect` 的方式在组件更新之后执行。 

> queueJob 和 queuePostRenderEffect 在这里不是重点，所以我们放到后面介绍。总之，你现在要记住，**watcher 的回调函数是通过一定的调度方式执行的。**

### 4. 创建effect函数

接下来就是`watch`实现的核心逻辑了

```javascript
const runner = effect(getter, { 
  // 延时执行 
  lazy: true, 
  // computed effect 可以优先于普通的 effect 先运行，比如组件渲染的 effect 
  computed: true, 
  onTrack, 
  onTrigger, 
  scheduler: applyCb ? () => scheduler(applyCb) : scheduler 
}) 
// 在组件实例中记录这个 effect 
recordInstanceBoundEffect(runner) 
// 初次执行 
if (applyCb) { 
  if (immediate) { 
    applyCb() 
  } 
  else { 
    // 求旧值 
    oldValue = runner() 
  } 
} 
else { 
  // 没有 cb 的情况 
  runner() 
} 
```

1. 通过内置的`effect`函数创建副作用函数`runner`
2. 和`computed对象`一样，在创建的时候配置对象`options`中的`computed`为`true`，表示这是一个`computed effect`，在数据改变，触发依赖更新时执行`trigger函数`，**会优先执行**。
3. 除了`computed`为`true`，`laz`y也为`true`，`runner`就不会在创建之后马上执行。
4. 执行`runner`函数相当于执行`getter`函数，就会访问响应式数据并开依赖收集。
5. 第一次执行`runner`得到的值就是oldValue。
6. 如果配置了`immediate` 为`true`，在创建`watch`的时候就会立刻执行`applyCb函数`，`applyCb函数`里会执行`runner函数`，也会进行依赖收集。

### 5.返回 watch的销毁函数

`watch`还会有一个返回值，这个返回值是一个函数，你可以使用它来销毁侦听器。

```javascript
const unwatch = watch(() => {}) // ...当该侦听器不再需要时 
unwatch();
```

那么问题来了，什么时候会出现需要手动销毁侦听器的场景呢？

答案是在异步创建侦听器的时候。

> 在 `setup()` 或 `<script setup>` 中用同步语句创建的侦听器，会自动绑定到宿主组件实例上，并且会在宿主组件卸载时自动停止。因此，在大多数情况下，你无需关心怎么停止一个侦听器。

> 一个关键点是，侦听器必须用**同步**语句创建：如果用异步回调创建一个侦听器，那么它不会绑定到当前组件上，你必须手动停止它，以防内存泄漏。如下方这个例子：

```javascript
<script setup>
import { watchEffect } from 'vue'

// 它会自动停止
watchEffect(() => {})

// ...这个则不会！
setTimeout(() => {
  watchEffect(() => {})
}, 100)
</script>
```

至于是如何实现的就比较简单了，我们来看下源码：

```javascript
return () => { 
  stop(runner) 
  if (instance) { 
    // 移除组件 effects 对这个 runner 的引用 
    remove(instance.effects, runner) 
  } 
} 
function stop(effect) { 
  if (effect.active) { 
    cleanup(effect) 
    if (effect.options.onStop) { 
      effect.options.onStop() 
    } 
    effect.active = false 
  } 
} 
```

1. 当手动调用`unwatch`的时候，会执行`stop`方法来让`runner`失效
2. `runner`函数里会调用`cleanup`方法清理`runner``的相关依赖

## 二、watch的执行时机

### 1. 同步执行 sync

```javascript
    const state = reactive({
        count: 0,
      })
      watch(
        () => state.count,
        (newValue, oldValue) => {
          console.log(newValue, oldValue)
        },
        { flush: 'sync' },
      )
      const toggle = function () {
        state.count++
        state.count++
        state.count++
      }
      
      // 1 0
      // 2 1
      // 3 2 
```

如果传入的flush值是sync，也就是同步执行，那么数据改变三次，也会打印三次；

### 2. flush为 pre 或者不传值

```javascript
    const state = reactive({
        count: 0,
      })
      watch(
        () => state.count,
        (newValue, oldValue) => {
          console.log(newValue, oldValue)
        },
        { flush: 'pre' },
      )
      const toggle = function () {
        state.count++
        state.count++
        state.count++
      }
      
      // 3 0 
```

无论`state.count` 改变多少次，回调函数只会执行一次，也就是只打印一次。

```javascript
 let scheduler: (job: () => any) => void
  if (flush === 'sync') {
    scheduler = invoke
  } else if (flush === 'pre') {
    scheduler = job => {
      if (!instance || instance.isMounted) {
        queueJob(job)
      } else {
        // with 'pre' option, the first call must happen before
        // the component is mounted so it is called synchronously.
        job()
      }
    }
  } else {
    scheduler = job => queuePostRenderEffect(job, instance && instance.suspense)
  }
```

可以看到，如果`flush`传值为`pre`或者不传值。分别使用`queueJob`方法和`queuePostRenderEffect`方法来实现。 而对于`queuePostRenderEffect`来说，在不考虑`SUSPENSE`的情况下，就是调用的`queuePostFlushCb`方法来实现：

```javascript
export const queuePostRenderEffect = __FEATURE_SUSPENSE__
  ? queueEffectWithSuspense
  : queuePostFlushCb
```

所以我们来看看`queueJob`方法和`queuePostFlushCb`方法：

```javascript
// 异步任务队列 
const queue = [] 
// 队列任务执行完后执行的回调函数队列 
const postFlushCbs = [] 
function queueJob(job) { 
  if (!queue.includes(job)) { 
    queue.push(job) 
    queueFlush() 
  } 
} 
function queuePostFlushCb(cb) { 
  if (!isArray(cb)) { 
    postFlushCbs.push(cb) 
  } 
  else { 
    // 如果是数组，把它拍平成一维 
    postFlushCbs.push(...cb) 
  } 
  queueFlush() 
} 
```

Vue.js 内部维护了一个 `queue` 数组和一个`postFlushCbs`数组，其中 queue 数组用作异步任务队列， `postFlushCbs` 数组用作异步任务队列执行完毕后的回调函数队列。

执行`queueJob`时会把这个任务 `job` 添加到 `queue` 的队尾，而执行`queuePostFlushCb`时，会把这个 `cb 回调函数`添加到 `postFlushCbs` 的队尾。它们在添加完毕后都执行了 `queueFlush 函数`，我们接着看它的实现：

#### （1）核心逻辑：queueFlush 函数

```javascript
const p = Promise.resolve() 
// 异步任务队列是否正在执行 
let isFlushing = false 
// 异步任务队列是否等待执行 
let isFlushPending = false 
function nextTick(fn) { 
  return fn ? p.then(fn) : p 
} 
function queueFlush() { 
  if (!isFlushing && !isFlushPending) { 
    isFlushPending = true 
    nextTick(flushJobs) 
  } 
} 
```

可以看到，Vue.js 内部还维护了 `isFlushing` 和 `isFlushPending` 变量，用来控制异步任务的刷新逻辑。

在`queueFlush`首次执行时，`isFlushing` 和 `isFlushPending` 都是 `false`，此时会把 `isFlushPending` 设置为 `true`，并且调用 `nextTick(flushJobs)` 去执行队列里的任务。

因为 `isFlushPending` 的控制，这使得即使多次执行 `queueFlush`，也不会多次去执行 `flushJobs`。另外 `nextTick` 在 Vue.js 3.0 中的实现也是非常简单，通过 `Promise.resolve().then` 去异步执行 `flushJobs`。

因为 JavaScript 是单线程执行的，这样的异步设计使你在一个 Tick 内，可以多次执行 `queueJob`或者 `queuePostFlushCb` 去添加任务，也可以保证在宏任务执行完毕后的微任务阶段执行一次 `flushJobs`。

#### （2）执行异步任务队列

接下来就是`flushJobs`的执行了：

```javascript
const getId = (job) => (job.id == null ? Infinity : job.id) 
function flushJobs(seen) { 
  isFlushPending = false 
  isFlushing = true 
  let job 
  if ((process.env.NODE_ENV !== 'production')) { 
    seen = seen || new Map() 
  } 
  // 组件的更新是先父后子 
  // 如果一个组件在父组件更新过程中卸载，它自身的更新应该被跳过 
  queue.sort((a, b) => getId(a) - getId(b)) 
  while ((job = queue.shift()) !== undefined) { 
    if (job === null) { 
      continue 
    } 
    if ((process.env.NODE_ENV !== 'production')) { 
      checkRecursiveUpdates(seen, job) 
    } 
    callWithErrorHandling(job, null, 14 /* SCHEDULER */) 
  } 
  flushPostFlushCbs(seen) 
  isFlushing = false 
  // 一些 postFlushCb 执行过程中会再次添加异步任务，递归 flushJobs 会把它们都执行完毕 
  if (queue.length || postFlushCbs.length) { 
    flushJobs(seen) 
  } 
} 
```

1. 把 `isFlushPending` 重置为 `false`，把 `isFlushing` 设置为 `true` 来表示正在执行异步任务队列
2. 将队列由小到大排序，由于父组件的 `effect id` 比子组件`effect id`小，所以父组件在前，子组件在后。所以就是先更新父组件，再更新子组件，这是符合逻辑的。
3. 这样做还有一个好处就是，如果一个子组件在父组件更新过程中被卸载了，不存在了，那么就可以调到它自身的更新。
4. 最后遍历`queue`，**`checkRecursiveUpdates` 方面是为了处理死循环的情况，当循环次数大于 100 次时，`vue`会抛出错误**。
5. 执行`flushPostFlushCbs`中的回调函数

## 三、watchEffect API

### 1. 使用案例

`watchEffect`的作用是立即运行一个函数，同时响应式地追踪其依赖，并在依赖更改时重新执行。

```javascript
const count = ref(0)

watchEffect(() => console.log(count.value))
// -> 输出 0

count.value++
// -> 输出 1
```

### 2.使用场景

假设这样一个场景：每当 `todoId` 的引用发生变化时使用侦听器来加载一个远程资源：

```javascript
const todoId = ref(1)
const data = ref(null)

watch(
  todoId,
  async () => {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
    )
    data.value = await response.json()
  },
  { immediate: true }
)
```

在这个例子中watch使用了两次`todoId`,一次是作为源，另一次是在回调中。

我们可以用 [`watchEffect`](https://cn.vuejs.org/api/reactivity-core.html#watcheffect) 来简化上面的代码。`watchEffect()` 允许我们自动跟踪回调的响应式依赖。上面的侦听器可以重写为：

```javascript
watchEffect(async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
```

这个例子中，回调会立即执行，不需要指定 `immediate: true`。在执行期间，它会自动追踪 `todoId.value` 作为依赖（和计算属性类似）。每当 `todoId.value` 变化时，回调会再次执行。有了 `watchEffect()`，我们不再需要明确传递 `todoId` 作为源值。

对于这种只有一个依赖项的例子来说，`watchEffect()` 的好处相对较小。但是对于有多个依赖项的侦听器来说，使用 `watchEffect()` 可以消除手动维护依赖列表的负担。此外，如果你需要侦听一个嵌套数据结构中的几个属性，`watchEffect()` 可能会比深度侦听器更有效，因为它将只跟踪回调中被使用到的属性，而不是递归地跟踪所有的属性。

### 3.与watch的差异之处

-  侦听的源不同 。`watch API` 可以侦听一个或多个响应式对象，也可以侦听一个 `getter` 函数，而 `watchEffect API` 侦听的是一个普通函数，只要内部访问了响应式对象即可，这个函数并不需要返回响应式对象。 
-  没有回调函数 。`watchEffect API` 没有回调函数，副作用函数的内部响应式对象发生变化后，会再次执行这个副作用函数。 
-  立即执行 。`watchEffect API` 在创建好 `watcher` 后，会立刻执行它的副作用函数，而 `watch API` 需要配置 `immediate` 为 `true`，才会立即执行回调函数。 

### 4. 实现原理

`watchEffect`的实现其实也是通过调用`doWatch`方法，跟`watch`不同的是，第一个参数传入的是`getter`函数，第二个参数`回调函数cb` 为 `null`。

```javascript
export function watchEffect(
  effect: WatchEffect,
  options?: WatchOptionsBase
): WatchStopHandle {
  return doWatch(effect, null, options)
}
```

进入到`doWtach`的方法里，首先对 `getter`函数进行简单封装，`watchEffect` 内部创建的 `runner` 对应的 `scheduler` 对象就是 `scheduler` 函数本身，这样它再次执行时，就会执行这个`scheduler`函数，并且传入 `runner 函数`作为参数，其实就是按照一定的调度方式去执行基于`source`封装的 `getter 函数`。

创建完 `runner` 后就立刻执行了 `runner`，其实就是内部同步执行了基于 `source` 封装的 `getter 函数`。

再具体的流程我们这里就不再继续一一分析了。

### 总结

本篇文章我们学习了`watch`和`watchEffect`的使用方法以及实现原理。其中，`watch` 的内部是如何进行调度执行是我们值得花时间去弄懂的知识点。

相比于计算属性，侦听器更适合用于在数据变化后执行某段逻辑的场景，而计算属性则用于一个数据依赖另外一些数据计算而来的场景。

## 常见考点

### **1. 基础知识**

#### **问题**：

- `watch` 是什么？它的基本作用是什么？
- 使用 `watch` 的语法和基本结构是什么？

#### **考察点**：

- **定义**：  
  - `watch` 是 Vue 提供的一个监听器，用于监听响应式数据的变化，并在变化时执行指定的回调函数。
- **基本语法**：  
  - 简单监听：  
```javascript
watch: {
  message(newVal, oldVal) {
    console.log(`Message changed from ${oldVal} to ${newVal}`);
  }
}
```
  - 深度监听：  
```javascript
watch: {
  data: {
    handler(newVal) {
      console.log('Data changed:', newVal);
    },
    deep: true
  }
}
```

---

### **2. `watch` 和 `computed` 的区别**

#### **问题**：

- `watch` 和计算属性（`computed`）的区别是什么？各自适用于什么场景？
- 是否可以用 `watch` 替代 `computed`，或者反之？

#### **考察点**：

- **区别**：  
  - **`computed`**：声明式地计算新值，并缓存结果；适合派生出新的数据。
  - **`watch`**：命令式地监听数据变化并执行副作用逻辑。
- **适用场景**：  
  - 如果只是处理数据并生成新值，优先使用 `computed`。
  - 如果需要执行异步任务或副作用逻辑（如 API 请求、计时器），适合使用 `watch`。

---

### **3. 深度监听（Deep Watch）**

#### **问题**：

- 如何监听嵌套对象或数组的变化？
- 深度监听可能带来哪些性能问题？如何避免？

#### **考察点**：

- **深度监听的语法**：  
  - 设置 `deep: true`：  
```javascript
watch: {
  nestedObject: {
    handler(newVal) {
      console.log('Nested object changed:', newVal);
    },
    deep: true
  }
}
```
- **性能问题**：  
  - 深度监听会递归遍历对象的每个属性，监听所有层级的变化，可能导致性能开销。
- **优化建议**：  
  - 根据具体需求设计监听逻辑，避免不必要的深度监听。
  - 在特定场景下，使用手动监听某些属性的方式替代深度监听。

---

### **4. Immediate 属性**

#### **问题**：

- `immediate` 属性的作用是什么？
- 在什么场景下需要使用 `immediate`？

#### **考察点**：

- **定义**：  
  - `immediate: true` 可以在监听器初始化时立即触发回调。
  - 示例：  
```javascript
watch: {
  data: {
    handler(newVal) {
      console.log('Data:', newVal);
    },
    immediate: true
  }
}
```
- **使用场景**：  
  - 初始化阶段需要根据数据执行某些逻辑（如根据初始值发起请求或设置页面状态）。

---

### **5. 侦听多数据源**

#### **问题**：

- 如何侦听多个数据源的变化？
- 在监听多个数据时，如何避免回调函数的复杂度？

#### **考察点**：

- **方法一：分开监听**：  
  - 为每个数据源设置单独的监听器：  
```javascript
watch: {
  data1(newVal) {
    console.log('Data1 changed:', newVal);
  },
  data2(newVal) {
    console.log('Data2 changed:', newVal);
  }
}
```
- **方法二：`watch` 数组**：  
  - 通过监听数组中的多个值：  
```javascript
watch: [
  () => this.data1,
  () => this.data2
], ([newData1, newData2]) => {
  console.log('Data1 or Data2 changed:', newData1, newData2);
};
```

---

### **6. 性能问题与优化**

#### **问题**：

- `watch` 是否有性能隐患？如何优化？
- 如果需要监听大量数据或频繁变化的数据，如何避免性能问题？

#### **考察点**：

- **潜在性能隐患**：  
  - 深度监听可能导致过多的资源消耗。
  - 频繁触发的回调函数可能影响应用性能。
- **优化方法**：  
  - 避免不必要的深度监听。
  - 使用节流或防抖优化回调函数：  
```javascript
watch: {
  inputValue: _.debounce(function (newVal) {
    console.log('Value changed:', newVal);
  }, 300)
}
```

---

### **7. 侦听器的生命周期**

#### **问题**：

- 侦听器何时会初始化？
- 如何在组件销毁时取消监听？

#### **考察点**：

- **初始化**：  
  - 侦听器在组件实例化阶段初始化，除非设置了延迟绑定。
- **销毁监听**：  
  - Vue 自动处理组件销毁时的监听器清理。
  - 对于动态绑定的侦听器（如在 `created` 中使用 `$watch`），需要手动清理：  
```javascript
const unwatch = this.$watch('value', newVal => {
  console.log('Value changed:', newVal);
});
// 在需要时调用 unwatch 解除监听
unwatch();
```

---

### **8. 实际场景问题**

#### **问题**：

- 在项目中，你曾经用 `watch` 解决过哪些实际问题？
- 是否遇到过与 `watch` 相关的性能问题？你是如何处理的？

#### **考察点**：

- **场景应用**：  
  - 表单校验：监听表单字段变化并实时校验。
  - 动态请求：根据某个状态值变化实时发起 API 请求。
  - 动态 UI：根据某些数据变化调整页面元素显示。
- **性能问题及解决**：  
  - 示例：在监听复杂对象时优化监听逻辑，或通过节流/防抖减少回调触发次数。

---

### **开放性问题**

- 如果同时使用 `watch` 和 `computed`，你会如何合理分配它们的职责？
- 你认为 `watch` 的优点和局限性分别是什么？

---

### **总结**

`watch` 是 Vue 中用于监听数据变化的重要工具，通过考察候选人在实际场景中对 `watch` 的理解和应用，可以评估其是否具备解决复杂逻辑问题的能力，以及是否能在项目中合理地平衡性能和功能需求。
