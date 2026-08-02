+++
title = "字节-本地生活-校招 · 第 1 轮 · 二面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "二面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/19"
experienceId = 19
roundId = 20
roundOrder = 1
company = "字节跳动"
date = "2025-06-24T14:45:10.000Z"
+++

> ← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-19/round-19/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-19/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 本轮面试重点考察候选人的项目经验、技术深度和工程化思维。主要包括：
1. 算法编程能力：通过合并有序数组等题目考察基本编程功底
2. 项目经验：深入考察实习期间的技术选型、架构设计等关键决策
3. 微前端技术：重点关注跨应用通信、样式隔离等核心问题
4. AI 应用实践：考察将新技术应用到工程实践中的能力
5. 跨窗口通信：考察复杂场景下的技术方案设计能力

本轮共 15 道题。答案默认折叠，便于先自行作答。

## 1. 将两个升序数组合并为一个升序数组 {#question-subjective-670965696dfe}

### 题目要点

- 数组操作能力
- 双指针算法应用
- 原地修改的实现
- 边界条件处理

<details>
<summary>参考答案</summary>

这道题可以使用双指针从后向前遍历的方法，将较大的数放入nums1的末尾。代码实现如下：

```javascript
function merge(nums1, m, nums2, n) {
  let p1 = m - 1; // nums1的指针
  let p2 = n - 1; // nums2的指针
  let p = m + n - 1; // 合并后数组的指针

  while (p2 >= 0) { // 只要nums2还有元素需要合并
    if (p1 >= 0 && nums1[p1] > nums2[p2]) {
      nums1[p] = nums1[p1];
      p1--;
    } else {
      nums1[p] = nums2[p2];
      p2--;
    }
    p--;
  }
  return nums1;
}
```

算法分析：
1. 时间复杂度：O(m+n)，只需遍历一次
2. 空间复杂度：O(1)，原地修改不需要额外空间
3. 关键点：从后向前遍历避免覆盖nums1中的有效元素

</details>

## 2. 上一段实习在联想主要做的是什么产品？采用了什么技术架构？ {#question-subjective-47494d13dd4e}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 项目描述能力：是否能清晰表达项目背景、目标和价值
- 技术选型能力：是否有合理的技术决策思路
- 架构设计能力：是否理解系统设计的关键点
- 业务理解能力：是否深入理解业务需求和痛点

答题建议：建议从项目背景、技术架构、实现亮点和项目成果四个方面展开。重点说明项目的业务价值和技术特点，展现自己在项目中的贡献和成长。

<details>
<summary>参考答案</summary>

"在联想实习期间，我主要负责一个企业级IT资产管理平台的开发工作。这是一个服务于公司内部的中后台系统，日均活跃用户约2000人，管理着超过10万台设备资产。这个平台的核心价值在于提升IT资产管理效率，降低运维成本。

在技术架构选型上，我们采用了现代化的技术栈。前端基于Vue 3 + TypeScript构建，使用Pinia进行状态管理，基于Element Plus进行组件库的二次封装。构建工具选择了Vite + ESBuild，这个组合在开发体验和构建性能上都表现出色。

为了支持多团队协作开发，我们采用了基于Micro-App的微前端架构。这个方案让我们能够实现多个团队并行开发，同时保持了良好的代码隔离性。我们建立了统一的CI/CD流程，确保了交付质量，并通过自动化测试提高了代码可靠性。

在性能优化方面，我们实施了多项措施。通过路由级别的代码分割和组件懒加载控制首屏加载性能，使用虚拟滚动处理大数据量展示，并通过请求合并与缓存优化数据加载。这些优化让系统在处理大量数据时仍能保持流畅的用户体验。"

</details>

## 3. 联想实习期间主导了组件库设计，具体说明该组件库解决了什么问题？ {#question-subjective-b2ddf051c9de}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 技术决策能力：是否能做出合理的技术选型
- 工程化思维：是否考虑到开发效率和可维护性
- 设计能力：是否有良好的抽象和复用意识
- 落地能力：是否能将方案真正落地实施

答题建议：建议从问题分析、解决方案、具体实现和效果评估四个方面展开。重点说明组件库解决的实际问题和带来的价值。

<details>
<summary>参考答案</summary>

"在组件库项目启动之前，我们团队面临着几个突出的问题。各个业务团队都在重复开发相似的组件，导致代码重复率高、维护成本大。同时，由于缺乏统一的规范，组件的样式和交互不一致，影响了产品的整体体验。另外，文档和示例的缺失也增加了组件使用的学习成本。

为了解决这些问题，我们决定基于Element Plus进行二次封装，打造一个统一的组件库。在技术选型上，我们使用Vue 3和TypeScript作为基础，这让我们能够提供完善的类型定义和更好的开发体验。使用Vite和ESBuild构建工具确保了快速的开发和构建效率，而Storybook则为我们提供了优秀的文档和示例展示平台。

在具体实现中，我们特别注重几个关键点。首先是按需加载机制，通过ES Module的tree-shaking和样式按需加载优化，大大减少了最终打包体积。其次是主题定制系统，我们基于CSS变量设计了灵活的主题切换功能，支持包括暗色模式在内的多种主题方案。我们还建立了完善的API设计规范，确保组件接口的一致性和易用性。

这个组件库项目取得了显著的成效。组件的复用率提升了80%，这直接减少了重复开发的工作量。开发效率提升了50%，主要得益于现成组件的直接使用和完善的文档支持。代码量减少了30%，维护成本降低了40%。更重要的是，它为团队建立了统一的开发规范和技术标准，提升了整体的开发质量。"

</details>

## 4. 技术选型为何选择 Vue3 而非 React？ {#question-subjective-c3f9514a8bce}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 技术判断：是否能理性分析技术选型
- 决策能力：是否有清晰的决策标准
- 落地能力：是否考虑实际落地成本
- 前瞻性：是否考虑长期发展

答题建议：建议从选型背景、对比分析、决策理由和实施计划四个方面展开。重点说明选择Vue3的具体原因和考虑因素。

<details>
<summary>参考答案</summary>

"选择Vue3而非React是一个经过深思熟虑的决策。首先，我们需要考虑项目的具体场景。这是一个以表单和数据展示为主的中后台系统，需要高效的开发体验和良好的性能表现。同时，我们团队已经有相当的Vue2技术积累，这也是一个重要的考虑因素。

在技术特性对比方面，Vue3具有几个显著的优势。首先是组合式API，它提供了更好的代码组织方式，特别适合我们这种需要大量复用逻辑的场景。其次是更完善的TypeScript支持，这对于我们构建大型应用和提供类型安全非常重要。另外，Vue3的包体积更小，性能也有明显提升，特别是在大数据量渲染和频繁更新的场景下表现出色。

虽然React生态系统更大，社区更活跃，但考虑到我们的实际情况，Vue3是更合适的选择。它向下兼容Vue2，这意味着我们的迁移成本可控。团队成员对Vue较为熟悉，学习曲线相对平缓。而且Vue3的新特性正好能解决我们在之前项目中遇到的一些技术痛点。

为了确保顺利落地，我们制定了完整的实施计划。首先是渐进式迁移策略，让团队在不影响现有业务的情况下逐步过渡到Vue3。同时，我们组织了系列技术培训，帮助团队快速掌握新特性。我们还建立了最佳实践指南，确保团队在使用新技术时有统一的标准可循。通过这些措施，我们成功实现了技术栈的平稳过渡。"

</details>

## 5. 你们这个是跨团队开发，怎么保证技术方案一致性？遇到的技术冲突如何解决？ {#question-subjective-3fee4fd68ece}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 协作能力：是否有效管理跨团队协作
- 沟通能力：是否能有效传达技术方案
- 推动能力：是否能促进团队达成一致
- 执行力：是否能确保方案落地

答题建议：建议从协作机制、技术规范、工具支持和冲突处理四个方面展开。重点说明如何在跨团队开发中保证技术一致性。

<details>
<summary>参考答案</summary>

"在跨团队开发中，保证技术方案一致性是一个重要挑战。我们通过建立完善的协作机制来应对这个挑战。首先是建立了定期的技术评审会议机制，让各团队能够及时同步技术方案和开发进展。我们实施了严格的代码Review制度，确保代码质量和规范的统一。同时，我们要求及时更新技术文档，保证知识的有效传递。通过定期的技术分享，我们也促进了团队间的经验交流。

在技术规范方面，我们制定了一系列标准文档。这包括详细的编码规范、Git提交规范、组件开发规范和接口设计规范。这些规范文档不仅统一了开发标准，也为新加入的团队成员提供了清晰的指导。

为了提高协作效率，我们搭建了完整的工具链。统一的CI/CD流程确保了交付质量的一致性，自动化测试体系帮助我们及早发现问题。我们使用统一的文档管理平台和问题追踪系统，使得信息共享和问题处理更加高效。

在处理技术冲突时，我们采用了明确的决策机制。对于技术分歧，我们会在技术评审会议上充分讨论，基于数据和实践经验做出决策。我们也建立了清晰的责任边界，明确各团队的职责范围。对于需要升级处理的问题，我们有专门的上报流程。通过定期的复盘会议，我们不断总结经验教训，持续改进协作流程。

这些措施帮助我们显著提升了团队协作效率，降低了沟通成本，提高了代码质量，加快了问题解决速度。更重要的是，它培养了团队间的信任和理解，建立了良好的协作文化。"

</details>

## 6. 提到性能优化指标提升 40%，具体采取了哪些技术手段？ {#question-subjective-fae328a2894c}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 性能意识：是否重视性能优化
- 问题分析：是否能准确定位问题
- 方案设计：是否有系统的优化方案
- 效果验证：是否有量化的优化指标

答题建议：建议从优化背景、具体措施、实施过程和效果验证四个方面展开。重点说明性能优化的具体手段和实际效果。

<details>
<summary>参考答案</summary>

"在项目初期，我们就发现系统在性能方面存在一些问题。通过性能监控和用户反馈，我们识别出几个主要的性能瓶颈：首屏加载时间过长、大数据渲染卡顿、资源加载效率低等。为了系统性地解决这些问题，我们实施了全方位的优化方案。

在首屏加载优化方面，我们采用了多项技术手段。通过路由懒加载，我们实现了按需加载页面组件。结合组件的按需加载和图片懒加载，大大减少了初始加载的资源量。我们还实施了关键资源预加载策略，优先加载核心功能所需的资源。这些优化将首屏加载时间从3秒降至1.8秒。

针对运行时性能，我们重点解决了大数据渲染问题。通过引入虚拟列表技术，我们优化了长列表的渲染性能。对于频繁触发的操作，我们实施了防抖和节流处理。对于复杂的数据处理，我们采用分片处理的方式，避免长时间占用主线程。一些计算密集型的任务，我们转移到Web Worker中执行，有效提升了应用的响应性能。

在资源优化方面，我们采取了多层次的措施。首先是将静态资源部署到CDN，提升资源加载速度。通过配置合适的Gzip压缩策略，减少传输数据量。我们还对图片资源进行了优化，包括格式转换、压缩和响应式加载。通过精细化的缓存策略，我们提高了资源的复用效率。

为了提升用户体验，我们还实施了一些体验优化措施。引入骨架屏减少用户等待时的空白感，实现预加载提升页面切换的流畅度，通过页面预渲染改善首屏体验。这些优化让用户体验评分提升了40%。

这些优化措施取得了显著的效果。除了前面提到的指标改善，我们还观察到CPU占用降低了30%，内存使用减少了25%。最重要的是，这些优化直接提升了用户满意度，得到了业务方的高度认可。"

</details>

## 7. 讲一下联想期间使用的微前端技术 {#question-subjective-8848e9c618bf}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 架构设计：是否理解微前端的核心原理
- 技术实现：是否掌握具体的实现方案
- 工程实践：是否有实际的落地经验
- 问题处理：是否能解决关键技术问题

答题建议：建议从技术选型、架构设计、实现细节和实践经验四个方面展开。重点说明微前端方案的具体实现和解决的问题。

<details>
<summary>参考答案</summary>

"在联想的项目中，我们采用微前端架构来解决大型应用的复杂度问题。这个决策主要基于几个考虑：首先是需要支持多个团队并行开发，其次是要实现不同业务模块的独立部署，最后是要保证各个子应用的技术栈独立性。

在技术选型上，我们选择了基于single-spa的微前端方案，并结合qiankun框架来实现具体的功能。这个方案的优势在于它提供了完善的生命周期管理、样式隔离和JS沙箱机制。我们的基座应用负责公共依赖管理和路由分发，各个子应用则专注于自身业务逻辑的实现。

在具体实现中，我们重点解决了几个关键问题。首先是应用间的通信机制，我们实现了基于发布订阅模式的全局状态管理，既保证了数据的实时性，又维持了应用间的松耦合。其次是样式隔离，通过CSS Modules和动态样式前缀的方式，有效避免了样式冲突。在公共依赖管理上，我们采用了externals配置和运行时共享的方式，既避免了重复加载，又解决了版本冲突问题。

这个微前端架构在实践中证明是非常成功的。它让我们能够支持超过10个业务团队的并行开发，显著提升了开发效率。各个子应用可以独立部署，减少了发布风险。同时，通过良好的隔离机制，我们也大大降低了应用间相互影响的可能性。这个方案不仅解决了当前的问题，也为未来的扩展提供了良好的基础。"

</details>

## 8. 微前端通信机制设计 {#question-subjective-ed3e0cb7e1d3}

### 题目要点

- 前端应用间通信的实现方式
- 状态管理和数据同步机制
- 通信安全性和可靠性设计

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
微前端通信需要解决应用间状态共享和事件传递问题，常用基于发布订阅模式实现全局事件总线。

##### 1.2 核心用法 + 示例代码
1. 全局状态共享：
```typescript
// 基座应用
const store = {
  state: reactive({
    user: null
  }),
  setUser(user) {
    this.state.user = user;
  }
};

// 子应用
export async function mount(props) {
  const { shared } = props;
  watch(() => shared.state.user, (newUser) => {
    // 响应状态变化
  });
}
```

2. 事件通信：
```typescript
// 事件总线
class EventBus {
  private events = new Map();

  emit(event: string, data: any) {
    const handlers = this.events.get(event);
    handlers?.forEach(handler => handler(data));
  }

  on(event: string, handler: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(handler);
  }
}
```

##### 1.3 常见误区或面试陷阱
- 滥用全局状态，导致应用耦合度高
- 未考虑通信性能，频繁事件触发
- 忽视内存泄漏，未及时解除事件监听

</details>

## 9. 如何实现 CSS 隔离？样式污染问题？具体解决？ {#question-subjective-499202986688}

### 题目要点

- CSS模块化和隔离技术
- 样式冲突的解决方案
- 工程化实践中的最佳实践

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
CSS隔离主要解决多个应用间样式互相影响的问题，通过作用域隔离或命名空间实现。

##### 1.2 核心用法 + 示例代码
1. CSS Modules：
```javascript
// webpack配置
{
  loader: 'css-loader',
  options: {
    modules: {
      localIdentName: '[path][name]__[local]--[hash:base64:5]'
    }
  }
}

// 使用
import styles from './style.css';
<div className={styles.container}></div>
```

2. Shadow DOM：
```javascript
class CustomElement extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'closed'});
    const style = document.createElement('style');
    style.textContent = `
      .container { color: red; }
    `;
    shadow.appendChild(style);
  }
}
```

3. 动态前缀：
```javascript
// 运行时添加前缀
function addPrefix(styles, prefix) {
  return styles.replace(/([^}{]*){/g, (m, g1) => {
    return g1.split(',')
      .map(selector => `${prefix} ${selector.trim()}`)
      .join(',') + '{';
  });
}
```

##### 1.3 常见误区或面试陷阱
- 过度依赖命名约定，未使用技术手段隔离
- 忽视第三方组件样式隔离
- 未考虑性能影响，如Shadow DOM的性能开销

</details>

## 10. 子应用独立部署时，如何管理公共依赖版本冲突？ {#question-subjective-63322afe5144}

### 题目要点

- 前端依赖管理策略
- 版本冲突解决方案
- 构建优化和性能考量

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
公共依赖管理需要解决重复加载和版本冲突问题，通常通过externals配置和运行时共享实现。

##### 1.2 核心用法 + 示例代码
1. Webpack配置：
```javascript
// 基座应用
const shared = {
  react: {
    singleton: true,
    requiredVersion: '^17.0.0'
  }
};

// 子应用
module.exports = {
  externals: {
    react: 'React'
  },
  shared: {
    react: {
      singleton: true,
      requiredVersion: '^17.0.0'
    }
  }
};
```

2. 运行时加载：
```javascript
// 动态加载依赖
async function loadSharedModule(name, version) {
  if (!window.sharedModules[name]) {
    window.sharedModules[name] = await import(
      `https://cdn.example.com/${name}@${version}`
    );
  }
  return window.sharedModules[name];
}
```

##### 1.3 常见误区或面试陷阱
- 简单使用CDN而不考虑版本管理
- 未处理依赖预加载，影响性能
- 忽视运行时兼容性问题

</details>

## 11. 接入 AI 辅助单测能力具体讲讲 {#question-subjective-3061f043b0fe}

### 题目要点

这是一道主观性问题，没有标准答案。面试官主要考察：
- 技术创新能力：是否能合理运用新技术解决实际问题
- 工程化思维：是否考虑到落地实施的完整性
- 技术理解：是否深入理解AI技术的特点和局限
- 实践经验：是否有具体的实施经验和思考

答题建议：建议从背景分析、实施方案、落地过程和效果评估四个方面展开说明。重点突出项目痛点、技术方案、实施过程和最终收益。注意使用数据支撑论述，展现完整的项目实践经验。

<details>
<summary>参考答案</summary>

"在我们的项目开发过程中，单元测试一直是一个让人头疼的问题。开发人员经常需要花费大量时间编写重复性的测试代码，而且容易遗漏边界场景，测试覆盖率普遍不高。为了解决这个问题，我们决定引入AI辅助单测能力。

在技术选型上，我们选择了结合OpenAI GPT和CodeBERT的混合方案。GPT负责理解业务语义和生成测试用例，而CodeBERT则专注于代码分析和测试场景识别。我们搭建了一个完整的测试生成平台，包含代码分析、测试生成、用例优化和执行反馈四个核心模块。

在具体实现中，我们首先通过AST解析提取代码的关键信息，包括函数签名、参数类型、返回值等。同时，我们会分析代码的依赖关系，确定测试范围，并通过注释解析补充业务语义信息。在测试生成阶段，我们采用基于模板的方式生成基础用例，然后通过智能边界值探测和数据模拟策略丰富测试场景。

这个项目取得了显著的成效。测试覆盖率提升了40%，测试用例生成效率提升了80%。更重要的是，AI生成的测试用例帮助我们发现了30多个潜在问题，这些问题在人工编写测试时很容易被忽略。同时，测试代码的维护成本降低了50%，极大地提升了团队的开发效率。"

</details>

## 12. AI 生成测试用例的准确率如何评估？是否需人工修正？ {#question-subjective-62b9bafef0ec}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 质量意识：是否重视测试质量保证
- 评估能力：是否有系统的评估方法
- 优化思维：是否有持续改进的意识
- 实践经验：是否有具体的实践总结

答题建议：建议从评估体系的建立、具体评估方法、人工修正策略和持续优化机制四个方面展开。重点说明如何保证AI生成测试用例的质量，以及人工介入的必要性和时机。

<details>
<summary>参考答案</summary>

"AI生成测试用例的质量评估是一个系统工程，需要从多个维度进行把控。我们主要关注测试用例的语法准确性、逻辑合理性、场景覆盖率以及边界条件测试这四个核心维度。每个维度都有明确的评估标准和量化指标。

在评估方法上，我们采用自动化检测和人工抽检相结合的方式。自动化检测主要通过代码静态分析、测试执行结果和覆盖率统计等技术手段进行。对于自动化难以判断的场景，我们会进行人工抽检，包括随机抽样review、关键场景验证和边界条件检查。

关于人工修正，我们采用分级处理策略。对于P0级别的核心业务场景，必须经过人工确认；对于复杂的边界场景，我们会重点review；而对于常规场景，则采用抽样检查的方式。一旦发现问题，我们会及时标记、优化，并将修正结果反馈到训练系统中。

为了持续提升生成质量，我们建立了完整的优化机制。在模型层面，我们会定期收集错误案例，优化训练数据，调整模型参数。在工具层面，我们不断优化提示模板，增强代码分析能力，完善反馈机制。通过这种闭环的优化体系，AI生成测试用例的质量在不断提升。"

</details>

## 13. 业务收益量化指标 {#question-subjective-1c7886af0c68}

### 题目要点

这是一道主观性问题，面试官主要考察：
- 业务理解：是否理解技术价值转化
- 数据分析：是否有数据思维
- 量化能力：是否能将效果量化
- 价值导向：是否关注实际收益

答题建议：建议从技术指标、效率指标、业务指标和成本收益四个维度展开。重点说明项目带来的具体改善效果，用数据说话，展现项目的实际价值。

<details>
<summary>参考答案</summary>

"在评估项目收益时，我们建立了一个全面的量化指标体系，从技术、效率、业务和成本四个维度进行衡量。这些指标不仅帮助我们证明项目价值，也为后续优化提供了明确的方向。

从技术层面来看，我们在性能和质量上都取得了显著提升。首屏加载时间缩短了40%，API响应速度提升了50%，资源加载优化提升了30%。在代码质量方面，Bug率降低了45%，测试覆盖率提升了35%，整体代码质量提升了25%。这些改进直接影响了用户体验和系统稳定性。

在效率方面，我们观察到了全方位的提升。开发周期缩短了30%，联调时间减少了40%，部署效率提升了50%。特别是在问题处理方面，定位速度提升了60%，修复时间减少了35%，发布流程优化提升了40%。这些改进大大提高了团队的工作效率。

从业务角度看，用户体验和运营效果都有明显改善。用户满意度提升了30%，功能使用率提升了25%，用户留存率提升了15%。在运营数据方面，转化率提升了20%，用户活跃度提升了18%，GMV增长了15%。这些指标直接反映了技术改进对业务的正向影响。

在成本收益方面，我们实现了显著的节省。人力成本降低了30%，资源成本优化了25%，运维成本减少了20%。除了这些直接收益，项目还带来了品牌影响力提升、技术积累沉淀、团队能力提升等间接收益，这些都是项目价值的重要组成部分。"

</details>

## 14. postMessage 如何实现跨窗口通信？ {#question-subjective-48ca2846c8f4}

### 题目要点

- 跨窗口通信机制
- postMessage API使用
- 安全性考虑
- 兼容性处理

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
postMessage是一种安全的跨源通信方法，可以实现窗口间的消息传递，通过指定目标源来控制安全性。

##### 1.2 核心用法 + 示例代码
1. 基本使用：
```javascript
// 发送消息
window.postMessage('Hello', 'http://example.com');

// 接收消息
window.addEventListener('message', (event) => {
  if (event.origin !== 'http://example.com') return;
  console.log(event.data);
});
```

2. 结构化数据：
```javascript
// 发送方
window.postMessage({
  type: 'UPDATE_DATA',
  payload: { id: 1, value: 'test' }
}, targetOrigin);

// 接收方
window.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  switch (type) {
    case 'UPDATE_DATA':
      handleUpdate(payload);
      break;
  }
});
```

##### 1.3 常见误区或面试陷阱
- 使用 '*' 作为targetOrigin，存在安全风险
- 未做消息格式校验
- 忽视浏览器兼容性问题

</details>

## 15. 基于 postMessage 实现跨窗口通信的发布订阅模式，用 TypeScript 定义核心类型 {#question-subjective-239400fae727}

### 题目要点

- TypeScript类型系统应用
- 设计模式实现能力
- 异步通信处理
- 错误处理机制

<details>
<summary>参考答案</summary>

##### 1.1 原理说明
使用发布订阅模式封装postMessage，实现可靠的跨窗口通信机制。

##### 1.2 核心用法 + 示例代码
```typescript
interface Message<T = any> {
  type: string;
  payload: T;
  messageId: string;
  timestamp: number;
}

interface Subscriber<T = any> {
  callback: (data: T) => void;
  once?: boolean;
}

class MessageBus {
  private subscribers = new Map<string, Set<Subscriber>>();
  private pendingMessages = new Map<string, Message>();

  constructor(private targetOrigin: string = '*') {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  publish<T>(type: string, payload: T): string {
    const message: Message<T> = {
      type,
      payload,
      messageId: this.generateId(),
      timestamp: Date.now()
    };

    window.postMessage(message, this.targetOrigin);
    return message.messageId;
  }

  subscribe<T>(type: string, callback: (data: T) => void, once = false): () => void {
    const subscriber: Subscriber<T> = { callback, once };

    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }

    this.subscribers.get(type)!.add(subscriber);

    return () => {
      this.subscribers.get(type)?.delete(subscriber);
    };
  }

  private handleMessage(event: MessageEvent) {
    const message = event.data as Message;
    if (!message || !message.type) return;

    const subscribers = this.subscribers.get(message.type);
    if (!subscribers) return;

    subscribers.forEach(subscriber => {
      subscriber.callback(message.payload);
      if (subscriber.once) {
        subscribers.delete(subscriber);
      }
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}
```

##### 1.3 常见误区或面试陷阱
- 类型定义不严谨，缺少泛型约束
- 未处理消息超时和重试
- 忽视内存泄漏问题
- 未实现错误处理机制

</details>

---

← [第 1 轮]({{< relref "/posts/frontend/interview-experiences/experience-19/round-19/index.md" >}}) · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-19/_index.md" >}}) · 已是最后一轮 →
