+++
title = "腾讯-1年社招-前端面试 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "腾讯", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/77"
experienceId = 77
roundId = 123
roundOrder = 1
company = "腾讯"
date = "2025-09-04T14:50:27.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-77/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-77/round-124/index.md" >}}) →

本轮共 15 道题。答案默认折叠，便于先自行作答。

## 1. 讲一下项目的难点和亮点 {#question-subjective-c3858e222cfb}

### 题目要点

突出解决问题的能力，说明遇到过的复杂问题和优化方案，亮点要体现价值和可扩展性。

<details>
<summary>参考答案</summary>

在大型前端项目中，常见难点在于性能优化和复杂业务的抽象。比如数据量大时页面渲染和交互卡顿，需要通过虚拟列表、懒加载、分片渲染等方式解决；跨端适配和复杂状态管理也是典型难点。亮点可以体现在工程化和架构设计上，例如通过模块化拆分、微前端架构提高可维护性，或通过自动化工具链提升研发效率。

</details>

## 2. 项目的规范是如何制定的，如何执行的 {#question-subjective-b8b956cfe46c}

### 题目要点

强调自动化工具与制度双管齐下，执行靠工具、评审和 CI 流程。

<details>
<summary>参考答案</summary>

前端规范一般从编码规范、组件封装规范、目录结构、Git 提交规范等方面制定。执行时可以依赖工具保障，比如 ESLint + Prettier 自动化格式化，Husky + lint-staged 在提交时校验，CI/CD 流程中增加检测。对组件层面，约定统一的 API 风格和文档，保证多人协作一致性。

</details>

## 3. 说说vue中的diff算法 {#question-7d27dc57-5d95-4e3f-88a7-eb685b7c21e4}

> 题库原题：[说说vue中的diff算法](https://fe.ecool.fun/topic/7d27dc57-5d95-4e3f-88a7-eb685b7c21e4)

### 题目要点

`diff`算法是一种高效的比较算法，主要用于比较虚拟`DOM`节点，以确定如何更新真实`DOM`。它具有两个特点：只会在同层级进行比较，不会跨层级比较；在比较的过程中，循环从两边向中间收拢。

在Vue中，`diff`算法用于比较新旧`VNode`节点，以决定如何更新真实`DOM`。

这个过程分为以下几个步骤：

1. **比较新旧`VNode`节点**：如果新旧节点相同，则不做任何操作；如果新旧节点都不存在子节点，则直接结束比较；如果新旧节点都有子节点，则进入`updateChildren`函数比较子节点。
2. **更新子节点**：在`updateChildren`函数中，设置新旧`VNode`的头尾指针，然后从两边向中间比较。如果新旧头尾指针相同，则直接`patchVnode`；如果新旧头尾指针不同，则根据情况调用`patchVnode`、`createElm`创建新节点，或者从哈希表寻找`key`一致的旧`VNode`节点再进行分情况操作。
3. **`patchVnode`方法**：如果新旧节点都有文本节点且不相等，则设置真实`dom`的文本节点为新节点的文本节点；如果旧节点有子节点而新节点没有，则删除旧节点的子节点；如果旧节点没有子节点而新节点有，则将新节点的子节点真实化后添加到旧节点；如果两者都有子节点，则进入`updateChildren`函数比较子节点。

通过`diff`算法，Vue能够高效地比较新旧`VNode`节点，以决定如何更新真实`DOM`，从而提高页面渲染的性能。

<details>
<summary>参考答案</summary>

## 一、是什么

`diff` 算法是一种通过同层的树节点进行比较的高效算法

其有两个特点：
- 比较只会在同层级进行, 不会跨层级比较
- 在diff比较的过程中，循环从两边向中间比较

`diff` 算法的在很多场景下都有应用，在 `vue` 中，作用于虚拟 `dom` 渲染成真实 `dom` 的新旧 `VNode` 节点比较

## 二、比较方式

`diff`整体策略为：深度优先，同层比较

1. 比较只会在同层级进行, 不会跨层级比较

![](https://static.ecool.fun//article/6366ea3c-b5f9-4add-a1d9-8fb1e7b6c726.png)

2. 比较的过程中，循环从两边向中间收拢

![](https://static.ecool.fun//article/66a1b47c-6fd5-4a1a-80a9-a7bbfdf30022.png)

下面举个`vue`通过`diff`算法更新的例子：

新旧`VNode`节点如下图所示：

![](https://static.ecool.fun//article/d64ad3e5-4892-415d-92ce-e5556dd0548e.png)

第一次循环后，发现旧节点D与新节点D相同，直接复用旧节点D作为`diff`后的第一个真实节点，同时旧节点`endIndex`移动到C，新节点的 `startIndex` 移动到了 C

![](https://static.ecool.fun//article/5ff039e0-4bb9-49ee-9921-85a11476131b.png)

第二次循环后，同样是旧节点的末尾和新节点的开头(都是 C)相同，同理，`diff` 后创建了 C 的真实节点插入到第一次创建的 B 节点后面。同时旧节点的 `endIndex` 移动到了 B，新节点的 `startIndex` 移动到了 E

![](https://static.ecool.fun//article/5d753795-ae75-441e-9f57-cc55a62a1a6d.png)

第三次循环中，发现E没有找到，这时候只能直接创建新的真实节点 E，插入到第二次创建的 C 节点之后。同时新节点的 `startIndex` 移动到了 A。旧节点的 `startIndex` 和 `endIndex` 都保持不动

![](https://static.ecool.fun//article/4b863487-0c0b-4993-9222-cc5ce85c4a7b.png)

第四次循环中，发现了新旧节点的开头(都是 A)相同，于是 `diff` 后创建了 A 的真实节点，插入到前一次创建的 E 节点后面。同时旧节点的 `startIndex` 移动到了 B，新节点的` startIndex` 移动到了 B

![](https://static.ecool.fun//article/e88197ab-c05d-4e10-98e9-bf35d87e3ebc.png)

第五次循环中，情形同第四次循环一样，因此 `diff` 后创建了 B 真实节点 插入到前一次创建的 A 节点后面。同时旧节点的 `startIndex `移动到了 C，新节点的 startIndex 移动到了 F

![](https://static.ecool.fun//article/53b186bb-dde2-424b-b331-bfe72e63da8c.png)

新节点的 `startIndex` 已经大于 `endIndex` 了，需要创建 `newStartIdx` 和 `newEndIdx` 之间的所有节点，也就是节点F，直接创建 F 节点对应的真实节点放到 B 节点后面

![](https://static.ecool.fun//article/08429a13-7804-4a75-a0e9-4073600676a4.png)

## 三、原理分析

当数据发生改变时，`set`方法会调用`Dep.notify`通知所有订阅者`Watcher`，订阅者就会调用`patch`给真实的`DOM`打补丁，更新相应的视图

源码位置：src/core/vdom/patch.js

```js
function patch(oldVnode, vnode, hydrating, removeOnly) {
    if (isUndef(vnode)) { // 没有新节点，直接执行destory钩子函数
        if (isDef(oldVnode)) invokeDestroyHook(oldVnode)
        return
    }

    let isInitialPatch = false
    const insertedVnodeQueue = []

    if (isUndef(oldVnode)) {
        isInitialPatch = true
        createElm(vnode, insertedVnodeQueue) // 没有旧节点，直接用新节点生成dom元素
    } else {
        const isRealElement = isDef(oldVnode.nodeType)
        if (!isRealElement && sameVnode(oldVnode, vnode)) {
            // 判断旧节点和新节点自身一样，一致执行patchVnode
            patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly)
        } else {
            // 否则直接销毁及旧节点，根据新节点生成dom元素
            if (isRealElement) {

                if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                    oldVnode.removeAttribute(SSR_ATTR)
                    hydrating = true
                }
                if (isTrue(hydrating)) {
                    if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                        invokeInsertHook(vnode, insertedVnodeQueue, true)
                        return oldVnode
                    }
                }
                oldVnode = emptyNodeAt(oldVnode)
            }
            return vnode.elm
        }
    }
}
```

`patch`函数前两个参数位为`oldVnode` 和 `Vnode` ，分别代表新的节点和之前的旧节点，主要做了四个判断：

- 没有新节点，直接触发旧节点的`destory`钩子
- 没有旧节点，说明是页面刚开始初始化的时候，此时，根本不需要比较了，直接全是新建，所以只调用 `createElm`
- 旧节点和新节点自身一样，通过 `sameVnode` 判断节点是否一样，一样时，直接调用 `patchVnode `去处理这两个节点
- 旧节点和新节点自身不一样，当两个节点不一样的时候，直接创建新节点，删除旧节点

下面主要讲的是`patchVnode`部分

```js
function patchVnode (oldVnode, vnode, insertedVnodeQueue, removeOnly) {
    // 如果新旧节点一致，什么都不做
    if (oldVnode === vnode) {
      return
    }

    // 让vnode.el引用到现在的真实dom，当el修改时，vnode.el会同步变化
    const elm = vnode.elm = oldVnode.elm

    // 异步占位符
    if (isTrue(oldVnode.isAsyncPlaceholder)) {
      if (isDef(vnode.asyncFactory.resolved)) {
        hydrate(oldVnode.elm, vnode, insertedVnodeQueue)
      } else {
        vnode.isAsyncPlaceholder = true
      }
      return
    }
    // 如果新旧都是静态节点，并且具有相同的key
    // 当vnode是克隆节点或是v-once指令控制的节点时，只需要把oldVnode.elm和oldVnode.child都复制到vnode上
    // 也不用再有其他操作
    if (isTrue(vnode.isStatic) &&
      isTrue(oldVnode.isStatic) &&
      vnode.key === oldVnode.key &&
      (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
    ) {
      vnode.componentInstance = oldVnode.componentInstance
      return
    }

    let i
    const data = vnode.data
    if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
      i(oldVnode, vnode)
    }

    const oldCh = oldVnode.children
    const ch = vnode.children
    if (isDef(data) && isPatchable(vnode)) {
      for (i = 0; i < cbs.update.length; ++i) cbs.update[i](oldVnode, vnode)
      if (isDef(i = data.hook) && isDef(i = i.update)) i(oldVnode, vnode)
    }
    // 如果vnode不是文本节点或者注释节点
    if (isUndef(vnode.text)) {
      // 并且都有子节点
      if (isDef(oldCh) && isDef(ch)) {
        // 并且子节点不完全一致，则调用updateChildren
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly)

        // 如果只有新的vnode有子节点
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) nodeOps.setTextContent(elm, '')
        // elm已经引用了老的dom节点，在老的dom节点上添加子节点
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue)

        // 如果新vnode没有子节点，而vnode有子节点，直接删除老的oldCh
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1)

        // 如果老节点是文本节点
      } else if (isDef(oldVnode.text)) {
        nodeOps.setTextContent(elm, '')
      }

      // 如果新vnode和老vnode是文本节点或注释节点
      // 但是vnode.text != oldVnode.text时，只需要更新vnode.elm的文本内容就可以
    } else if (oldVnode.text !== vnode.text) {
      nodeOps.setTextContent(elm, vnode.text)
    }
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.postpatch)) i(oldVnode, vnode)
    }
  }
```

`patchVnode`主要做了几个判断：

- 新节点是否是文本节点，如果是，则直接更新`dom`的文本内容为新节点的文本内容
- 新节点和旧节点如果都有子节点，则处理比较更新子节点
- 只有新节点有子节点，旧节点没有，那么不用比较了，所有节点都是全新的，所以直接全部新建就好了，新建是指创建出所有新`DOM`，并且添加进父节点
- 只有旧节点有子节点而新节点没有，说明更新后的页面，旧节点全部都不见了，那么要做的，就是把所有的旧节点删除，也就是直接把`DOM` 删除

子节点不完全一致，则调用`updateChildren`

```js
function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
    let oldStartIdx = 0 // 旧头索引
    let newStartIdx = 0 // 新头索引
    let oldEndIdx = oldCh.length - 1 // 旧尾索引
    let newEndIdx = newCh.length - 1 // 新尾索引
    let oldStartVnode = oldCh[0] // oldVnode的第一个child
    let oldEndVnode = oldCh[oldEndIdx] // oldVnode的最后一个child
    let newStartVnode = newCh[0] // newVnode的第一个child
    let newEndVnode = newCh[newEndIdx] // newVnode的最后一个child
    let oldKeyToIdx, idxInOld, vnodeToMove, refElm

    // removeOnly is a special flag used only by <transition-group>
    // to ensure removed elements stay in correct relative positions
    // during leaving transitions
    const canMove = !removeOnly

    // 如果oldStartVnode和oldEndVnode重合，并且新的也都重合了，证明diff完了，循环结束
    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      // 如果oldVnode的第一个child不存在
      if (isUndef(oldStartVnode)) {
        // oldStart索引右移
        oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left

      // 如果oldVnode的最后一个child不存在
      } else if (isUndef(oldEndVnode)) {
        // oldEnd索引左移
        oldEndVnode = oldCh[--oldEndIdx]

      // oldStartVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        // patch oldStartVnode和newStartVnode， 索引左移，继续循环
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue)
        oldStartVnode = oldCh[++oldStartIdx]
        newStartVnode = newCh[++newStartIdx]

      // oldEndVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        // patch oldEndVnode和newEndVnode，索引右移，继续循环
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue)
        oldEndVnode = oldCh[--oldEndIdx]
        newEndVnode = newCh[--newEndIdx]

      // oldStartVnode和newEndVnode是同一个节点
      } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
        // patch oldStartVnode和newEndVnode
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldStartVnode.eml移动到oldEndVnode.elm之后
        canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm))
        // oldStart索引右移，newEnd索引左移
        oldStartVnode = oldCh[++oldStartIdx]
        newEndVnode = newCh[--newEndIdx]

      // 如果oldEndVnode和newStartVnode是同一个节点
      } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
        // patch oldEndVnode和newStartVnode
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue)
        // 如果removeOnly是false，则将oldEndVnode.elm移动到oldStartVnode.elm之前
        canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
        // oldEnd索引左移，newStart索引右移
        oldEndVnode = oldCh[--oldEndIdx]
        newStartVnode = newCh[++newStartIdx]

      // 如果都不匹配
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)

        // 尝试在oldChildren中寻找和newStartVnode的具有相同的key的Vnode
        idxInOld = isDef(newStartVnode.key)
          ? oldKeyToIdx[newStartVnode.key]
          : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)

        // 如果未找到，说明newStartVnode是一个新的节点
        if (isUndef(idxInOld)) { // New element
          // 创建一个新Vnode
          createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)

        // 如果找到了和newStartVnodej具有相同的key的Vnode，叫vnodeToMove
        } else {
          vnodeToMove = oldCh[idxInOld]
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !vnodeToMove) {
            warn(
              'It seems there are duplicate keys that is causing an update error. ' +
              'Make sure each v-for item has a unique key.'
            )
          }

          // 比较两个具有相同的key的新节点是否是同一个节点
          //不设key，newCh和oldCh只会进行头尾两端的相互比较，设key后，除了头尾两端的比较外，还会从用key生成的对象oldKeyToIdx中查找匹配的节点，所以为节点设置key可以更高效的利用dom。
          if (sameVnode(vnodeToMove, newStartVnode)) {
            // patch vnodeToMove和newStartVnode
            patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue)
            // 清除
            oldCh[idxInOld] = undefined
            // 如果removeOnly是false，则将找到的和newStartVnodej具有相同的key的Vnode，叫vnodeToMove.elm
            // 移动到oldStartVnode.elm之前
            canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm)

          // 如果key相同，但是节点不相同，则创建一个新的节点
          } else {
            // same key but different element. treat as new element
            createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm)
          }
        }

        // 右移
        newStartVnode = newCh[++newStartIdx]
      }
    }
```

`while`循环主要处理了以下五种情景：

- 当新老 `VNode` 节点的 `start` 相同时，直接 `patchVnode` ，同时新老 `VNode` 节点的开始索引都加 1
- 当新老 `VNode` 节点的 `end`相同时，同样直接 `patchVnode` ，同时新老 `VNode` 节点的结束索引都减 1
- 当老 `VNode` 节点的 `start` 和新 `VNode` 节点的 `end` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldEndVnode` 的后面，同时老 `VNode` 节点开始索引加 1，新 `VNode` 节点的结束索引减 1
- 当老 `VNode` 节点的 `end` 和新 `VNode` 节点的 `start` 相同时，这时候在 `patchVnode` 后，还需要将当前真实 `dom` 节点移动到 `oldStartVnode` 的前面，同时老 `VNode` 节点结束索引减 1，新 `VNode` 节点的开始索引加 1
- 如果都不满足以上四种情形，那说明没有相同的节点可以复用，则会分为以下两种情况：
  - 从旧的 `VNode` 为 `key` 值，对应 `index` 序列为 `value` 值的哈希表中找到与 `newStartVnode` 一致 `key` 的旧的 `VNode` 节点，再进行`patchVnode `，同时将这个真实 `dom `移动到 `oldStartVnode` 对应的真实 `dom` 的前面
  - 调用 `createElm` 创建一个新的 `dom` 节点放到当前 `newStartIdx` 的位置

### 小结

- 当数据发生改变时，订阅者`watcher`就会调用`patch`给真实的`DOM`打补丁
- 通过`isSameVnode`进行判断，相同则调用`patchVnode`方法
- `patchVnode`做了以下操作：
  - 找到对应的真实`dom`，称为`el`
  - 如果都有都有文本节点且不相等，将`el`文本节点设置为`Vnode`的文本节点
  - 如果`oldVnode`有子节点而`VNode`没有，则删除`el`子节点
  - 如果`oldVnode`没有子节点而`VNode`有，则将`VNode`的子节点真实化后添加到`el`
  - 如果两者都有子节点，则执行`updateChildren`函数比较子节点
- `updateChildren`主要做了以下操作：
  - 设置新旧`VNode`的头尾指针
  - 新旧头尾指针进行比较，循环向中间靠拢，根据情况调用`patchVnode`进行`patch`重复流程、调用`createElem`创建一个新节点，从哈希表寻找 `key`一致的`VNode` 节点再分情况操作

</details>

## 4. 有 key 和无 key 时 Diff 行为有何差异？ {#question-subjective-ba989ed51c31}

### 题目要点

有 key 准确复用，无 key 就地复用，容易导致状态问题。

<details>
<summary>参考答案</summary>

有 key 时，diff 会通过 key 精确复用或替换节点，保证最小化操作并保持状态。无 key 时，默认采用“就地复用”的策略，可能导致错误的复用和状态错乱。例如表单输入框在列表更新时，输入值错位。

</details>

## 5. 为什么 key 不建议用 index？ {#question-subjective-26ce90ced94c}

### 题目要点

index 不是稳定标识，推荐用业务唯一 ID。

<details>
<summary>参考答案</summary>

使用 index 时，列表顺序发生变化时，节点复用错误，导致渲染异常或状态丢失。比如在前端渲染一个 todo 列表，删除中间一项后，后面的项 index 改变，但节点被错误复用，造成输入框错位。

</details>

## 6. 虚拟 DOM 的优点 {#question-subjective-53c2377d9f15}

### 题目要点

跨平台抽象、批量更新、优化性能、编程模型友好。

<details>
<summary>参考答案</summary>

抽象层，跨平台（Web、Native、SSR）；通过批量 DOM 更新减少重绘回流；提供 diff 算法优化，避免直接操作真实 DOM 的高成本；更利于状态驱动的编程模型。

</details>

## 7. 哪些场景下真实 DOM 操作更好 {#question-subjective-5dcd7037c8c9}

### 题目要点

简单场景、性能要求极高时直接操作 DOM 更合适。

<details>
<summary>参考答案</summary>

DOM 结构极其简单、更新频繁但局部、无需复杂状态驱动的场景，用原生 DOM 操作可能更快，例如 Canvas 动画、大量节点频繁移动、需要极限性能的场景。

</details>

## 8. Webpack 的 development 和 production 默认优化 {#question-subjective-58c7be118218}

### 题目要点

development 偏向调试体验，production 偏向性能优化。

<details>
<summary>参考答案</summary>

development：启用 HMR、快速增量构建、未压缩代码、详细错误提示和 SourceMap。

production：自动开启 Tree Shaking、代码压缩（Terser）、作用域提升（Scope Hoisting）、默认关闭 HMR、优化模块 ID（ModuleConcatenationPlugin）。

</details>

## 9. Vue 3.0中Treeshaking特性是什么，并举例进行说明？ {#question-c1ee1a9b-5955-4dc1-a89d-2ce7b017616a}

> 题库原题：[Vue 3.0中Treeshaking特性是什么，并举例进行说明？](https://fe.ecool.fun/topic/c1ee1a9b-5955-4dc1-a89d-2ce7b017616a)

### 题目要点

Tree shaking是一种通过消除多余代码来优化项目打包体积的技术，也称为Dead code elimination。它通过在编译阶段利用ES6模块的静态特性，识别并删除未被使用的代码。

Vue3引入了tree shaking特性，使得不使用的功能不会被包含在基础包中，从而减小项目体积和提高执行效率。

在Vue2中，所有功能无论是否使用都会出现在生产代码中，而Vue3则通过模块化实现了按需引入，减少了不必要的代码。

例如，在Vue3项目中，只有当实际使用到`computed`和`watch`等功能时，它们才会被包含在打包文件中，导致文件体积增加。

Tree shaking的作用主要包括减少程序体积、减少执行时间，以及对程序架构进行优化提供了便利。通过这种方式，Vue3为开发者带来了更高效、更友好的开发体验。

<details>
<summary>参考答案</summary>

## 一、是什么

`Tree shaking` 是一种通过清除多余代码方式来优化项目打包体积的技术，专业术语叫 `Dead code elimination`

简单来讲，就是在保持代码运行结果不变的前提下，去除无用的代码

如果把代码打包比作制作蛋糕，传统的方式是把鸡蛋（带壳）全部丢进去搅拌，然后放入烤箱，最后把（没有用的）蛋壳全部挑选并剔除出去

而` treeshaking `则是一开始就把有用的蛋白蛋黄（import）放入搅拌，最后直接作出蛋糕

也就是说 ，`tree shaking` 其实是找出使用的代码

在`Vue2`中，无论我们使用什么功能，它们最终都会出现在生产代码中。主要原因是`Vue`实例在项目中是单例的，捆绑程序无法检测到该对象的哪些属性在代码中被使用到

```js
import Vue from 'vue'

Vue.nextTick(() => {})
```

而`Vue3`源码引入`tree shaking`特性，将全局 API 进行分块。如果您不使用其某些功能，它们将不会包含在您的基础包中

```js
import { nextTick, observable } from 'vue'

nextTick(() => {})
```

## 二、如何做

`Tree shaking`是基于`ES6`模板语法（`import`与`export`），主要是借助`ES6`模块的静态编译思想，在编译时就能确定模块的依赖关系，以及输入和输出的变量

`Tree shaking`无非就是做了两件事：

- 编译阶段利用`ES6 Module`判断哪些模块已经加载
- 判断那些模块和变量未被使用或者引用，进而删除对应代码

下面就来举个例子：

通过脚手架`vue-cli`安装`Vue2`与`Vue3`项目

```c
vue create vue-demo
```

### Vue2 项目

组件中使用`data`属性

```vue
<script>
    export default {
        data: () => ({
            count: 1,
        }),
    };
</script>
```

对项目进行打包，体积如下图

![](https://static.ecool.fun//article/e298c1f6-7390-4d24-a25a-8d93cdb45fec.png)

为组件设置其他属性（`compted`、`watch`）

```js
export default {
    data: () => ({
        question:"",
        count: 1,
    }),
    computed: {
        double: function () {
            return this.count * 2;
        },
    },
    watch: {
        question: function (newQuestion, oldQuestion) {
            this.answer = 'xxxx'
        }
};
```

再一次打包，发现打包出来的体积并没有变化

![](https://static.ecool.fun//article/a6a130d6-001e-4ef4-b347-59cdeb6b2d63.png)

### Vue3 项目

组件中简单使用

```js
import { reactive, defineComponent } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    return {
      state,
    };
  },
});
```

将项目进行打包

![](https://static.ecool.fun//article/b8da6cec-2639-4cda-a399-920d0863ebe5.png)

在组件中引入`computed`和`watch`

```js
import { reactive, defineComponent, computed, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({
      count: 1,
    });
    const double = computed(() => {
      return state.count * 2;
    });

    watch(
      () => state.count,
      (count, preCount) => {
        console.log(count);
        console.log(preCount);
      }
    );
    return {
      state,
      double,
    };
  },
});
```

再次对项目进行打包，可以看到在引入`computer`和`watch`之后，项目整体体积变大了

 ![](https://static.ecool.fun//article/fb53f810-4993-409a-b295-20ae93c11028.png)

## 三、作用

通过`Tree shaking`，`Vue3`给我们带来的好处是：

- 减少程序体积（更小）
- 减少程序执行时间（更快）
- 便于将来对程序架构进行优化（更友好）

</details>

## 10. Webpack 的相关优化 {#question-subjective-84bb4cb3d0a0}

### 题目要点

构建性能优化 + 产物性能优化两方面。

<details>
<summary>参考答案</summary>

利用 SplitChunks 拆包减少重复代码；开启持久化缓存（cache）；使用 Babel 的缓存和 thread-loader 提升构建速度；利用 CDN 分离第三方库；生产模式开启 Scope Hoisting 和 Tree Shaking；针对图片资源使用 image-webpack-loader 等。

</details>

## 11. 说说你对闭包的理解，以及闭包使用场景 {#question-e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848}

> 题库原题：[说说你对闭包的理解，以及闭包使用场景](https://fe.ecool.fun/topic/e9bcc1f4-1b0a-4213-9d3a-8e64c97c7848)

### 题目要点

# 什么是闭包

简单理解就是函数中嵌套函数。我们都知道局部变量我们是无法访问的，但是通过闭包可以做到。

```js
// 正常访问
var lan = 'zh';
function hello(){
  var name = '前端未来';
}
console.log(name)//很明显'undefined'

// 换成闭包
function hello(){
    var name = '前端未来';
    function demo(){
      console.log(name)//打印：前端未来
    }
}
```

# 闭包的应用场景

## 1. 数据封装和隐私

闭包可以用来封装数据和功能，创建具有私有变量和公共接口的模块。

### 应用

- 创建具有私有状态的模块或对象。

## 2. 函数工厂

闭包用于创建返回函数的函数，这些返回的函数可以维持状态。

### 应用

- 生成具有特定配置或状态的函数。

## 3. 柯里化（Currying）

闭包允许将多参数的函数转换成一系列单参数的函数。

### 应用

- 简化函数调用，逐步应用参数。

## 4. 延迟计算

闭包可以用于延迟计算，只在必要时才执行计算。

### 应用

- 实现性能优化，如懒加载。

## 5. 迭代器和生成器

闭包在迭代器和生成器中用于维护状态。

### 应用

- 实现可重复使用的迭代器。

## 6. 异步编程

闭包在异步回调中保持状态，避免在多层嵌套回调中使用额外的参数。

### 应用

- 管理异步操作的状态和结果。

## 7. 事件处理器

闭包可以捕获事件处理器需要的局部变量。

### 应用

- 为事件绑定具有特定状态的处理器。

## 8. 缓存和记忆

闭包可以用来实现缓存逻辑，存储和复用计算结果。

### 应用

- 减少重复计算，提高性能。

## 注意事项

- 闭包可能会导致内存使用增加，因为它们会保持对外部变量的引用。
- 理解闭包的作用域链对于避免意外的行为和内存泄漏很重要。
- 闭包提供了强大的功能，但应谨慎使用，以保持代码的清晰和可维护性。

<details>
<summary>参考答案</summary>

## 一、是什么

一个函数和对其周围状态（lexical environment，词法环境）的引用捆绑在一起（或者说函数被引用包围），这样的组合就是闭包（closure）

也就是说，闭包让你可以在一个内层函数中访问到其外层函数的作用域

在 `JavaScript `中，每当创建一个函数，闭包就会在函数创建的同时被创建出来，作为函数内部与外部连接起来的一座桥梁

下面给出一个简单的例子

```js
function init() {
    var name = "Mozilla"; // name 是一个被 init 创建的局部变量
    function displayName() { // displayName() 是内部函数，一个闭包
        alert(name); // 使用了父函数中声明的变量
    }
    displayName();
}
init();
```

`displayName()` 没有自己的局部变量。然而，由于闭包的特性，它可以访问到外部函数的变量

## 二、使用场景

任何闭包的使用场景都离不开这两点：

- 创建私有变量
- 延长变量的生命周期

> 一般函数的词法环境在函数返回后就被销毁，但是闭包会保存对创建时所在词法环境的引用，即便创建时所在的执行上下文被销毁，但创建时所在词法环境依然存在，以达到延长变量的生命周期的目的

下面举个例子：

在页面上添加一些可以调整字号的按钮

```js
function makeSizer(size) {
  return function() {
    document.body.style.fontSize = size + 'px';
  };
}

var size12 = makeSizer(12);
var size14 = makeSizer(14);
var size16 = makeSizer(16);

document.getElementById('size-12').onclick = size12;
document.getElementById('size-14').onclick = size14;
document.getElementById('size-16').onclick = size16;
```

### 柯里化函数

柯里化的目的在于避免频繁调用具有相同参数函数的同时，又能够轻松的重用

```js
// 假设我们有一个求长方形面积的函数
function getArea(width, height) {
    return width * height
}
// 如果我们碰到的长方形的宽老是10
const area1 = getArea(10, 20)
const area2 = getArea(10, 30)
const area3 = getArea(10, 40)

// 我们可以使用闭包柯里化这个计算面积的函数
function getArea(width) {
    return height => {
        return width * height
    }
}

const getTenWidthArea = getArea(10)
// 之后碰到宽度为10的长方形就可以这样计算面积
const area1 = getTenWidthArea(20)

// 而且如果遇到宽度偶尔变化也可以轻松复用
const getTwentyWidthArea = getArea(20)
```

### 使用闭包模拟私有方法

在`JavaScript`中，没有支持声明私有变量，但我们可以使用闭包来模拟私有方法

下面举个例子：

```js
var Counter = function() {
  var privateCounter = 0;
  function changeBy(val) {
    privateCounter += val;
  }
  return {
    increment: function() {
      changeBy(1);
    },
    decrement: function() {
      changeBy(-1);
    },
    value: function() {
      return privateCounter;
    }
  }
};

var Counter1 = Counter();
var Counter2 = Counter();
console.log(Counter1.value()); /* logs 0 */
Counter1.increment();
Counter1.increment();
console.log(Counter1.value()); /* logs 2 */
Counter1.decrement();
console.log(Counter1.value()); /* logs 1 */
console.log(Counter2.value()); /* logs 0 */
```

上述通过使用闭包来定义公共函数，并令其可以访问私有函数和变量，这种方式也叫模块方式

两个计数器 `Counter1` 和 `Counter2` 是维护它们各自的独立性的，每次调用其中一个计数器时，通过改变这个变量的值，会改变这个闭包的词法环境，不会影响另一个闭包中的变量

### 其他

例如计数器、延迟调用、回调等闭包的应用，其核心思想还是创建私有变量和延长变量的生命周期

## 三、注意事项

如果不是某些特定任务需要使用闭包，在其它函数中创建函数是不明智的，因为闭包在处理速度和内存消耗方面对脚本性能具有负面影响

例如，在创建新的对象或者类时，方法通常应该关联于对象的原型，而不是定义到对象的构造器中。

原因在于每个对象的创建，方法都会被重新赋值

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
  this.getName = function() {
    return this.name;
  };

  this.getMessage = function() {
    return this.message;
  };
}
```

上面的代码中，我们并没有利用到闭包的好处，因此可以避免使用闭包。修改成如下：

```js
function MyObject(name, message) {
  this.name = name.toString();
  this.message = message.toString();
}
MyObject.prototype.getName = function() {
  return this.name;
};
MyObject.prototype.getMessage = function() {
  return this.message;
};
```

</details>

## 12. 说说你对模块化方案的理解，比如 CommonJS、AMD、CMD、ES Module 分别是什么？ {#question-f5f2f81e-c0c8-409e-ba00-3f3428ae535b}

> 题库原题：[说说你对模块化方案的理解，比如 CommonJS、AMD、CMD、ES Module 分别是什么？](https://fe.ecool.fun/topic/f5f2f81e-c0c8-409e-ba00-3f3428ae535b)

### 题目要点

时间轴上，JavaScript 模块系统经历了几个阶段的发展：CommonJS、AMD、CMD 和 ES Module。

以下是每个阶段的简要总结：

#### CommonJS

- **用途**：主要用于服务器端 JavaScript（Node.js），也被 webpack 等工具用于浏览器端的模块打包。
- **特点**：同步或运行时加载，磁盘读取速度快。
- **语法**：
  - 导出：通过 `module.exports` 或 `exports` 暴露模块。
  - 引用：使用 `require('x')`。

#### AMD (Asynchronous Module Definition)

- **用途**：虽然不常用，但它是 CommonJS 在浏览器端的实现。
- **特点**：异步加载，依赖前置。
- **语法**：
  - 导出：通过 `define` 定义模块，并可以指定依赖的其他模块。
  - 引用：使用 `require(['a'], function (a){ a.foo() });`。

#### CMD (Common Module Definition)

- **用途**：根据 CommonJS 和 AMD 实现，优化了加载方式。
- **特点**：异步加载，按需加载/依赖就近。
- **语法**：
  - 导出：通过 `define` 定义模块，并在用到的地方引用依赖。
  - 引用：使用 `var x = require('a'); a.foo();`。

#### ES Module

- **用途**：目前浏览器端的默认标准。
- **特点**：静态编译，编译时就能确定依赖关系，以及输入和输出的变量。
- **语法**：
  - 导出：通过 `export` 或 `export default` 输出模块。
  - 引用：使用 `import`。

#### 注意

- `export default` 在同一个文件中只能存在一个。
- 一个模块中可以同时使用 `export default` 和 `export`。

这些模块系统各有特点，适用于不同的场景。ES Module 作为现代浏览器端的标准，提供了一种更简洁、更易于管理的模块系统。

<details>
<summary>参考答案</summary>

`时间轴：CommonJS --> AMD --> CMD --> ES Module`

### CommonJS

* 常用于：`服务器端`，`node`，`webpack`
* 特点：`同步/运行时加载`，`磁盘读取速度快`
* 语法：<br>

```js
// 1. 导出：通过module.exports或exports来暴露模块
module.exports = {
  attr1,
  attr2
}
exports.attr = xx
```

**注意**<br>
不可以`exports = xxx`，这样写会无效，因为更改了exports的地址，而 `exports` 是 `module.exports` 的引用指向的是同一个内存，模块最后导出的是 `module.exports`<br>

```js
// 2. 引用：require('x')
const xx = require('xx') // 整体重命名
const { attr } = require('xx') // 解构某一个导出
```

### AMD

* 常用于：不常用，`CommonJs的浏览器端实现`
* 特点：<br>
   * `异步加载`：因为面向浏览器端，为了不影响渲染肯定是异步加载<br>
   * `依赖前置`：所有的依赖必须写在最初的依赖数组中，速度快，但是会浪费资源，预先加载了所有依赖不管你是否用到
* 语法：<br>

```js
// 1. 导出：通过define来定义模块
// 如果该模块还依赖其他模块，则将模块的路径填入第一个参数的数组中
define(['x'], function(x){
  function foo(){
      return x.fn() + 1
  }
  return {
      foo: foo
  };
});
// 2. 引用
require(['a'], function (a){
  a.foo()
});
```

### CMD

* 常用于：不常用，`根据CommonJs和AMD实现，优化了加载方式`
* 特点：<br>
   * `异步加载`<br>
   * `按需加载/依赖就近`：用到了再引用依赖，方便了开发，缺点是速度和性能较差
* 语法：<br>

```js
// 1. 导出：通过define来定义模块
// 如果该模块还依赖其他模块，在用到的地方引用即可
define(function(){
  function foo(){
      var x = require('x')
      return x.fn() + 1
  }
  return {
      foo: foo
  };
});
// 2. 引用
var x = require('a');
a.foo();
```

### ES module

* 常用于：`目前浏览器端的默认标准`
* 特点：`静态编译：` 在编译的时候就能确定依赖关系，以及输入和输出的变量
* 语法：<br>

```js
// 1. 导出：通过export 或 export default 输出模块
// 写法1: 边声明，边导出
export var m = 1;
export function m() {};
export class M {};

// 写法2：导出一个接口 export {}，形似导出对象但不是, 本质上是引用集合，最常用的导出方法

export {
  attr1,
  attr2
}

// 写法3：默认导出

export default fn

// 2. 引用
import { x } from 'test.js' // 导出模块中对应的值，必须知道值在模块中导出时的名字
import { x as myx } from 'test.js' // 改名字
import x from 'test.js' // 默认导出的引用方式
```

**注意**<br>

 1. `export default`在同一个文件中只可存在一个（一个模块只能有一个默认输出）<br>
 2. 一个模块中可以同时使用export default 和 export<br>

 ```js
 // 模块 test.js
 var info = {
   name: 'name',
   age: 18
 }
 export default info
 export var name= '海洋饼干'
 export var age = 18

 // 引用
 import person, {name, age as myAge} from 'test.js'
 console.log(person); // { name: 'name', age: 18 }
 console.log(name+ '=' + myAge); // 海洋饼干=18
 ```

</details>

## 13. 分析代码输出，并解释原因 {#question-subjective-59c235f26b31}

```js
console.log(a); // undefined
var a = 10;
let b = 20;
function foo() {
  console.log(b); // ReferenceError
  let b = 30;
}
foo();
```

### 题目要点

var 提升为 undefined；let 存在暂时性死区。

<details>
<summary>参考答案</summary>

console.log(a) 输出 undefined，因为 var a 提升，但赋值在后。

foo 中 console.log(b) 报 ReferenceError，因为 let b 存在暂时性死区（TDZ），访问声明前的 b 会报错。

</details>

## 14. 实现一个九宫格布局 {#question-subjective-8cade045aff8}

要求：1，每个格子边框为1px，相邻边框重叠处仍保持1px（非2px叠加）；2，适配移动端，宽度随屏幕大小等比缩放

### 题目要点

Grid + aspect-ratio，自适应正方形，避免双倍边框。

<details>
<summary>参考答案</summary>

核心思路：利用 calc 保证等分；边框使用 outline 或伪元素避免双倍边框。
```css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border: 1px solid #000;
}
.container div {
  aspect-ratio: 1 / 1;
  border: 1px solid #000;
  margin: -1px 0 0 -1px; /* 保证重叠边框仍为 1px */
}

```

通过 aspect-ratio 保证自适应正方形，适配移动端。

</details>

## 15. 实现一个函数，将数字转换为千分位格式（如1234567 → "1,234,567"）。 {#question-subjective-ae6649020da9}

### 题目要点

可以用正则或 toLocaleString：

<details>
<summary>参考答案</summary>

可以用正则或 toLocaleString：

```js
function format(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

```

输入 1234567 输出 "1,234,567"。

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-77/_index.md" >}}) · [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-77/round-124/index.md" >}}) →
