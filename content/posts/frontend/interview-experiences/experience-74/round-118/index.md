+++
title = "字节-国际电商-前端面试 · 第 1 轮 · 一面"
draft = false
weight = 1
tags = ["面试", "前端", "大厂面经", "字节跳动", "一面", "ecool"]
categories = ["前端开发", "面试", "大厂面经"]
source = "https://fe.ecool.fun/experience/74"
experienceId = 74
roundId = 118
roundOrder = 1
company = "字节跳动"
date = "2025-09-02T07:09:39.000Z"
+++

> ← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-74/_index.md" >}}) · 已是最后一轮 →

**本轮要点：** 考察面试者的表达能力、总结归纳能力和个人亮点。

本轮共 17 道题。答案默认折叠，便于先自行作答。

## 1. 自我介绍 {#question-subjective-12b75c445924}

### 题目要点

- **主观型问题，无唯一标准答案。** 面试官主要考察答题者的表达能力、总结归纳能力、沟通技巧以及对自身经历和技术栈的清晰认知。
- 答题时建议围绕"我是谁"、"我做了什么"、"我做得怎么样"和"我为什么选择贵公司"这几个核心点展开，突出个人亮点与岗位匹配度。

<details>
<summary>参考答案</summary>

各位面试官好，我叫[您的姓名]，毕业于[您的学校]，专业是[您的专业]。在校期间，我专注于前端开发方向的学习与实践。在技术栈方面，我熟练掌握 HTML、CSS、JavaScript 基础，并深入学习了 Vue.js 框架，对 Vue 生态系统，如 Vuex、Vue Router 也有实际应用经验。在实习期间，我主要负责[您的项目职责，例如：公司官网前端页面的开发与维护，参与了XX功能模块的重构]。具体工作中，我曾独立负责[具体某个功能或模块]，通过[具体技术或方法]，实现了[具体效果或优化]，比如在[某项目中]实现了[某个功能]，有效提升了用户体验[或业务效率]。我个人对前端技术充满热情，具备良好的学习能力和解决问题的能力，期待能将我的技能和经验应用到贵公司，与团队一同成长。

</details>

## 2. 在学校期间有没有参与过什么技术社团或项目，对你的前端学习有什么帮助？ {#question-subjective-cd610cb03548}

### 题目要点

- **主观型问题，无唯一标准答案。** 面试官主要考察答题者在校期间对技术的热情、主动学习能力、团队协作能力以及将理论知识应用于实践的能力。他们希望了解你如何将课外活动与前端学习结合，并从中获得了哪些成长。
- 答题时建议突出你在社团/项目中承担的角色、遇到的挑战、如何解决问题、学到的技术知识以及对个人成长的影响。

<details>
<summary>参考答案</summary>

在校期间，我积极参与了学校的[例如：创新创业协会或某个技术兴趣小组]。在这些活动中，我曾参与一个[例如：校园兼职平台]的小型项目开发。当时，我们团队面临的挑战是[例如：如何利用有限的资源快速搭建一个具备基本交互功能的前端原型]。我主动承担了前端页面的开发工作，通过自学 Vue.js 的组件化思想和路由管理，将页面拆分为可复用的组件，并实现了前端路由功能。虽然项目规模不大，但它让我第一次有机会将课堂上学习的 HTML、CSS、JavaScript 知识体系化地应用到实际开发中。通过这次经历，我不仅锻炼了独立解决问题的能力，还体会到了团队协作的重要性，比如在开发中与后端同学进行接口联调、与设计师沟通 UI 实现细节等，这对我后续的实习和前端学习都产生了积极的推动作用。

</details>

## 3. 说说你实习项目中遇到的技术难点，以及你是如何解决的？ {#question-subjective-3cf5356e8d84}

### 题目要点

- **主观型问题，无唯一标准答案。** 面试官主要考察答题者对项目实践的深入理解、问题解决能力、技术深度以及学习和复盘能力。他们希望了解你在面对挑战时，如何分析问题、寻找解决方案并最终达成目标。
- 答题时建议围绕"遇到什么难点"、"如何分析与定位问题"、"采用了哪些技术方案"、"解决了什么问题"以及"从中获得了哪些经验和教训"等核心点展开，强调思考过程和技术细节。

<details>
<summary>参考答案</summary>

在我的实习项目中，我曾遇到一个比较棘手的性能问题。我们负责的一个电商列表页面，随着商品数量的增多，首次加载时间变得非常慢，用户体验受到严重影响。通过浏览器开发者工具分析，我发现主要瓶颈在于大量图片资源的加载以及首屏渲染时数据量过大导致的卡顿。

为了解决这个问题，我首先考虑了**图片懒加载**。我引入了一个 `Intersection Observer API` 的实现，使得图片只有在进入用户视口时才开始加载，这显著减少了初始的 HTTP 请求数量和带宽消耗。其次，针对数据量大的问题，我调研并实现了**虚拟列表**。核心思路是只渲染当前可见区域的列表项，并动态计算滚动时的偏移量和渲染范围。这避免了一次性渲染数千个 DOM 节点造成的性能压力。具体实现中，我维护了一个可滚动区域，根据滚动位置动态更新展示的数据索引，并结合 `requestAnimationFrame` 确保滚动动画的流畅性。

经过这些优化措施，页面的首次加载时间从原来的 8 秒降低到了 2 秒以内，列表滚动时的卡顿现象也基本消除。这个过程让我对前端性能优化有了更深层次的理解，特别是如何结合浏览器 API 和数据结构优化来解决实际问题，也锻炼了我分析和解决复杂性能瓶颈的能力。

</details>

## 4. 解释一下 TS 泛型的概念和作用 {#question-subjective-d61a01743b6a}

### 题目要点

- **泛型概念**：面试官想确认面试者对泛型的基本定义、作用和设计目的的理解。
- **泛型作用**：考察泛型在增强代码灵活性、类型安全和重用性方面的具体应用。
- **实际应用**：理解泛型在实际开发中如何应用于函数、接口、类等场景，以及其在大型项目中的价值。

<details>
<summary>参考答案</summary>

1.1 原理说明

- **核心概念定义**：
    泛型（Generics）是指在定义函数、接口或类的时候，不预先指定具体的类型，而是在使用的时候再指定类型的一种特性。它允许你编写出可以适用于多种数据类型的组件或函数，同时保持代码的类型安全性。

- **技术需求或问题出现的原因**：
    在没有泛型的情况下，为了实现代码的通用性，我们可能会使用 `any` 类型。然而，使用 `any` 会丧失 TypeScript 的类型检查优势，导致代码在编译阶段无法发现潜在的类型错误。泛型应运而生，它旨在解决在编写可重用组件时，如何在兼顾灵活性的同时保证类型安全的问题。

- **相关概念之间的联系和区别**：
    - **`any` 与泛型**：`any` 放弃了类型检查，使得代码可以接受任何类型的值，但失去了类型安全性。泛型则是在编写通用代码时提供类型约束，允许在运行时确定具体类型，从而保持类型安全。
    - **函数重载与泛型**：函数重载可以为同一个函数提供多种不同的参数类型签名，但每增加一种类型就需要增加一个重载签名，这在需要处理多种或未知类型时会变得冗余。泛型则通过一个类型参数就能实现对多种类型的支持，代码更加简洁且可维护。

1.2 核心用法 + 示例代码

- **具体使用方式**：泛型可以应用于函数、接口和类，以实现更通用、类型安全的代码。

    - **泛型函数**：
        允许函数处理多种类型的数据，同时保持输入类型和输出类型的一致性。
        ```typescript
        function identity<T>(arg: T): T {
            return arg;
        }

        // 使用示例
        let output1 = identity<string>("myString"); // 类型明确为 string
        let output2 = identity(123); // 类型推断为 number
        ```

    - **泛型接口**：
        定义接口时使用类型参数，使得接口可以描述多种数据结构。
        ```typescript
        interface GenericIdentityFn<T> {
            (arg: T): T;
        }

        function identity<T>(arg: T): T {
            return arg;
        }

        let myIdentity: GenericIdentityFn<number> = identity;
        console.log(myIdentity(456)); // 456
        ```

    - **泛型类**：
        类可以使用泛型来约束其属性或方法的类型。
        ```typescript
        class GenericNumber<T> {
            zeroValue: T;
            add: (x: T, y: T) => T;

            constructor(zero: T, adder: (x: T, y: T) => T) {
                this.zeroValue = zero;
                this.add = adder;
            }
        }

        let myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y);
        console.log(myGenericNumber.add(10, 20)); // 30

        let stringNumeric = new GenericNumber<string>("", (x, y) => x + y);
        console.log(stringNumeric.add("Hello", "TypeScript")); // "HelloTypeScript"
        ```

- **项目中使用场景**：
    - **数据请求**：定义通用的数据返回接口，如 `interface ApiResponse<T> { code: number; message: string; data: T; }`，`T` 可以是不同的业务数据类型。
    - **状态管理**：在 Redux、Vuex 等状态管理库中，定义 `actions`、`mutations` 或 `reducers` 时，可以使用泛型来处理不同模块的状态类型。
    - **UI 组件库**：开发通用的 Table、Select 等组件时，使用泛型可以指定行数据、选项等的数据类型，提高组件的复用性。

- **解决的问题和优势**：
    - **代码重用性**：编写一次代码即可支持多种数据类型，减少重复代码。
    - **类型安全性**：在编译时捕获类型错误，提高代码质量和可维护性。
    - **可读性和可维护性**：通过类型参数明确代码意图，使代码更易于理解和维护。

1.3 常见误区或面试陷阱

- **误区一：泛型就是 `any` 的别名**：
    这是一个常见的误解。泛型和 `any` 都提供了一定程度的通用性，但本质不同。`any` 意味着"可以是任何类型，跳过类型检查"，而泛型意味着"在定义时不确定类型，但在使用时确定类型，并进行类型检查"。泛型是类型安全的，`any` 则不是。

- **误区二：泛型只适用于集合类型**：
    虽然泛型在处理数组、列表等集合类型时非常有用（如 `Array<T>`），但其应用远不止于此。泛型可以应用于任何需要类型参数化的场景，包括但不限于单个值的函数、接口和类，只要能够通过类型参数来提升代码的通用性和类型安全性即可。

- **误区三：滥用泛型导致代码复杂化**：
    虽然泛型功能强大，但过度或不恰当的使用可能会使代码变得难以理解和调试。例如，定义过于复杂的泛型约束或嵌套过深的泛型，会增加代码的认知负担。应在确实需要类型参数化以提升通用性和类型安全性的场景下使用泛型。

- **面试陷阱：泛型约束 (`extends`) 的理解**：
    面试官可能会问到泛型约束，即如何限制泛型类型参数的范围。例如，`function loggingIdentity<T extends Lengthwise>(arg: T): T` 中的 `extends Lengthwise` 表示泛型 `T` 必须满足 `Lengthwise` 接口的约束，即必须包含 `length` 属性。这是确保泛型函数内部可以安全地操作泛型参数的关键，否则在不确定类型参数是否具备某个属性时，操作会报错。

</details>

## 5. 说出 TS 的基本数据类型有哪些，每种类型的特点和使用场景。 {#question-subjective-7005e3d36b39}

### 题目要点

- **基本数据类型**：考察面试者对 TypeScript 核心类型系统的掌握程度，以及与 JavaScript 基本类型的区别。
- **类型特点**：面试官希望了解每种数据类型的使用场景、特性，以及如何在实际开发中正确运用。
- **类型安全性**：通过对基本数据类型的理解，考察面试者对 TypeScript 提供的类型安全机制的认知。

<details>
<summary>参考答案</summary>

1.1 原理说明

TypeScript 是 JavaScript 的超集，它在 JavaScript 的基础上增加了静态类型系统。这意味着在 TypeScript 中，每个变量、函数参数和函数返回值都应该有明确的类型定义。TypeScript 的类型系统旨在提高代码的健壮性、可维护性和可读性，在编译阶段就能发现潜在的类型错误。

TypeScript 的基本数据类型是构建其类型系统的基石，它们与 JavaScript 的基本数据类型相对应，并在此基础上提供了更严格的类型检查。

1.2 核心用法 + 示例代码

TypeScript 的基本数据类型包括：

- **布尔类型 (boolean)**：
    - **特点**：表示逻辑上的真/假，只有 `true` 或 `false` 两个值。
    - **使用场景**：常用于条件判断、状态管理（如 `isLoading`、`isVisible`）。
    - **示例代码**：
        ```typescript
        let isDone: boolean = false;
        if (isDone) {
            console.log("任务已完成");
        }
        ```

- **数字类型 (number)**：
    - **特点**：表示浮点数、整数、十六进制、二进制和八进制字面量。与 JavaScript 的 `number` 类型相同，都是双精度浮点数。
    - **使用场景**：数值计算、计数器、价格等。
    - **示例代码**：
        ```typescript
        let decimal: number = 6;
        let hex: number = 0xf00d;
        let binary: number = 0b1010;
        let octal: number = 0o744;
        ```

- **字符串类型 (string)**：
    - **特点**：表示文本数据。可以使用单引号 (`'`)、双引号 (`"`) 或模板字符串 (`` ` ``) 定义。
    - **使用场景**：任何文本内容，如用户名、消息、URL等。
    - **示例代码**：
        ```typescript
        let fullName: string = `TypeScript`;
        let sentence: string = `Hello, my name is ${fullName}.`;
        ```

- **数组类型 (Array)**：
    - **特点**：表示同类型元素的有序集合。有两种定义方式：`元素类型[]` 或 `Array<元素类型>`。
    - **使用场景**：存储一系列同类型的数据。
    - **示例代码**：
        ```typescript
        let list1: number[] = [1, 2, 3];
        let list2: Array<string> = ['hello', 'world'];
        ```

- **元组类型 (Tuple)**：
    - **特点**：表示已知元素数量和类型的数组，各元素的类型不必相同。它允许表示一个固定数量的、类型可以不同的值的序列。
    - **使用场景**：当函数返回一个包含不同类型值的固定长度的列表时，或者需要在一个变量中存储一对相关联但类型不同的值时。
    - **示例代码**：
        ```typescript
        let x: [string, number];
        x = ['hello', 10]; // OK
        // x = [10, 'hello']; // Error
        ```

- **枚举类型 (enum)**：
    - **特点**：为一组数值赋予友好的名字。默认从 `0` 开始为元素编号，也可以手动设置。
    - **使用场景**：定义一组具名的常量，提高代码可读性和可维护性，如状态码、角色权限等。
    - **示例代码**：
        ```typescript
        enum Color {Red, Green, Blue}
        let c: Color = Color.Green; // c 的值为 1

        enum Status {Success = 200, NotFound = 404, Error = 500}
        let s: Status = Status.Success;
        console.log(s); // 输出 200
        ```

- **Any 类型 (any)**：
    - **特点**：表示可以是任何类型。当值是来自动态内容（如用户输入或第三方库）时，可能无法确定其类型，此时可以使用 `any`。使用 `any` 会放弃类型检查。
    - **使用场景**：在不确定变量类型时，或者处理第三方库的返回值，或者在迁移旧项目时作为过渡。
    - **示例代码**：
        ```typescript
        let notSure: any = 4;
        notSure = "maybe a string instead";
        notSure = false; // OK, can be a boolean
        ```

- **Void 类型 (void)**：
    - **特点**：表示没有任何类型。通常用于函数没有返回值的情况。
    - **使用场景**：函数的返回值类型，或者声明一个只能赋值为 `undefined` 或 `null` 的变量（在非严格模式下）。
    - **示例代码**：
        ```typescript
        function warnUser(): void {
            console.log("This is my warning message");
        }
        let unusable: void = undefined; // OK
        // let unusable: void = null; // OK, with --strictNullChecks set to false
        ```

- **Null 和 Undefined 类型 (null & undefined)**：
    - **特点**：`null` 和 `undefined` 是 JavaScript 中两个特殊的原始值，在 TypeScript 中也有对应的类型。默认情况下，`null` 和 `undefined` 是所有类型的子类型，即可以将 `null` 和 `undefined` 赋值给其他任何类型。
    - **使用场景**：表示值的缺失或未定义。
    - **示例代码**：
        ```typescript
        let u: undefined = undefined;
        let n: null = null;

        let someValue: string = "hello";
        // someValue = null; // Error if --strictNullChecks is true
        // someValue = undefined; // Error if --strictNullChecks is true
        ```
    - **注意点**：当启用 `--strictNullChecks` 编译选项时，`null` 和 `undefined` 只能赋值给 `void` 和它们各自的类型，或者联合类型（如 `string | null`）。这有助于避免常见的 `null` 或 `undefined` 引用错误。

- **Never 类型 (never)**：
    - **特点**：表示那些永不存在的值的类型。例如，抛出异常的函数或者永不返回的函数表达式。
    - **使用场景**：函数抛出异常或无限循环，类型守卫中排除所有可能类型。
    - **示例代码**：
        ```typescript
        function error(message: string): never {
            throw new Error(message);
        }

        function infiniteLoop(): never {
            while (true) {
                // ...
            }
        }
        ```

- **Object 类型 (object)**：
    - **特点**：表示非原始类型，即除了 `number`, `string`, `boolean`, `symbol`, `null`, `undefined` 之外的类型。
    - **使用场景**：当不确定对象的具体结构，但确定它不是基本类型时。
    - **示例代码**：
        ```typescript
        function create(o: object | null): void {
            // ...
        }

        create({ prop: 0 }); // OK
        create(null); // OK
        // create(42); // Error
        // create("string"); // Error
        ```

- **Symbol 类型 (symbol)**：
    - **特点**：表示唯一的、不可变的值，用作对象属性的键。ES6 新增。
    - **使用场景**：避免属性名冲突，创建私有属性。
    - **示例代码**：
        ```typescript
        let sym1 = Symbol('key');
        let sym2 = Symbol('key');

        console.log(sym1 === sym2); // false

        let obj = {
            [sym1]: "value"
        };
        console.log(obj[sym1]); // "value"
        ```

1.3 常见误区或面试陷阱

- **误区一：混淆 `any` 和 `unknown`**：
    虽然 `any` 和 `unknown` 都可以表示不确定类型，但 `unknown` 更安全。`unknown` 类型的变量不能直接进行任何操作（除了赋值给 `any` 或 `unknown`），除非先进行类型缩小（如类型守卫）。而 `any` 则会跳过所有类型检查。面试官可能会问到这两种类型的区别，以及何时选择 `unknown`。

- **误区二：对 `null` 和 `undefined` 的严格模式理解不清**：
    在没有开启 `--strictNullChecks` 时，`null` 和 `undefined` 可以赋值给任何类型，这容易导致运行时错误。开启严格模式后，它们只能赋值给自身或 `void` 类型，除非是联合类型。这是 TypeScript 避免常见错误的关键特性，面试时可能会考察你对这一模式的理解和实践。

- **误区三：滥用 `any` 导致 TypeScript 失去了意义**：
    频繁使用 `any` 会使 TypeScript 的类型检查形同虚设，失去了其带来的大部分好处。面试官会关注你是否理解何时需要使用 `any`，以及是否会优先考虑更严格的类型定义或泛型来保证类型安全。

- **面试陷阱：`enum` 的反向映射**：
    面试官可能会问到 `enum` 的一个特性：默认情况下，数字枚举会生成反向映射，即可以通过值获取到键。例如 `Color[0]` 会得到 `"Red"`。但字符串枚举则不会。理解这种差异对于编写和调试代码很重要。

- **面试陷阱：元组越界问题**：
    在 TypeScript 中，虽然元组定义了固定长度和类型，但在旧版本或某些特定操作下，仍然可能出现越界访问的情况，并且可以为其赋值。这通常是设计上的"漏洞"或为了兼容性，但面试官可能借此考察你对 TypeScript 类型系统深度的理解。

</details>

## 6. 对于联合类型和类型断言，你是如何理解的？ {#question-subjective-dc0074cd7f42}

### 题目要点

- **联合类型概念**：考察面试者对联合类型的定义、作用和使用场景的理解，包括如何表示一个变量可以是多种类型之一。
- **类型断言概念**：考察面试者对类型断言的定义、作用和使用场景的理解，以及其"相信开发者"的特性。
- **异同与选择**：面试官希望了解面试者对两者区别的清晰认识，以及在不同场景下如何做出正确选择，避免滥用。
- **类型安全**：通过对两者应用边界的理解，考察面试者对 TypeScript 类型安全机制的深层认知。

<details>
<summary>参考答案</summary>

1.1 原理说明

TypeScript 提供了强大的类型系统来增强代码的健壮性和可维护性。在处理变量类型不确定或者需要更灵活的类型表示时，联合类型和类型断言是两个重要的工具。

- **联合类型 (Union Types) 定义**：
    联合类型表示一个值可以是几种类型之一。它使用 `|` 符号连接不同的类型，意味着变量可以是这些类型中的任意一种。例如，`number | string` 表示一个变量既可以是数字，也可以是字符串。联合类型提供了一种类型安全的机制，确保变量在特定时刻只能是预定义类型集合中的一种。

- **类型断言 (Type Assertions) 定义**：
    类型断言用于手动指定一个值的类型。它告诉编译器"相信我，我知道这个变量的真实类型"，通常用于开发者比编译器更了解某个变量类型的情况。类型断言只是在编译时起作用，它不影响运行时的代码，也不会执行特殊的运行时检查。类型断言有两种形式：尖括号语法 (`<Type>value`) 和 `as` 语法 (`value as Type`)。

- **相关概念之间的联系和区别**：
    - **目的不同**：联合类型是声明变量可能具有多种类型中的一种，它是一种类型声明机制，增加了类型的包容性。类型断言是强制指定变量的类型，它是一种类型覆盖机制，在开发者比编译器更了解类型时使用。
    - **安全性不同**：联合类型是类型安全的，编译器会确保你只访问所有联合类型共有的成员，或者在操作前进行类型缩小（如类型守卫）。类型断言则不进行运行时检查，如果断言的类型与实际类型不符，运行时可能会出错，因此它不是完全类型安全的，需要谨慎使用。
    - **编译时行为**：联合类型在编译时提供了类型检查和推断。类型断言在编译时用于帮助编译器理解开发者意图，但不会改变变量的实际类型或执行类型转换。

1.2 核心用法 + 示例代码

- **联合类型的使用方式**：

    - **定义可接受多种类型的变量或参数**：
        ```typescript
        function printId(id: number | string) {
            console.log("Your ID is: " + id);
        }

        printId(101); // OK
        printId("202"); // OK
        // printId(true); // Error: Argument of type 'boolean' is not assignable to parameter of type 'string | number'.
        ```

    - **联合类型中的类型缩小 (Type Narrowing)**：
        当一个变量是联合类型时，你只能访问它们所有类型共有的成员。如果需要访问特定类型的成员，需要进行类型缩小，例如使用 `typeof`、`instanceof` 或 `in` 运算符。
        ```typescript
        function printIdDetailed(id: number | string) {
            if (typeof id === "string") {
                // 在此代码块中，id 的类型被缩小为 string
                console.log(id.toUpperCase());
            } else {
                // 在此代码块中，id 的类型被缩小为 number
                console.log(id.toFixed(2));
            }
        }
        printIdDetailed("hello"); // HELLO
        printIdDetailed(123.456); // 123.46
        ```

- **类型断言的使用方式**：

    - **当你知道一个变量的更具体类型时**：
        例如，从 DOM 获取元素时，`document.getElementById()` 返回 `HTMLElement | null`，但你明确知道它是一个 `HTMLCanvasElement`。
        ```typescript
        // 尖括号语法
        let myCanvas = <HTMLCanvasElement>document.getElementById("my_canvas");

        // as 语法 (推荐在 JSX 中使用，因为尖括号语法会与 JSX 语法冲突)
        let myImage = document.getElementById("my_image") as HTMLImageElement;

        if (myCanvas) {
            let ctx = myCanvas.getContext("2d");
            // ...
        }
        ```

    - **将一个通用类型断言为更具体的类型**：
        当从一个 `any` 或 `unknown` 类型的值转换到更具体的类型时。
        ```typescript
        let someValue: any = "this is a string";
        let strLength: number = (someValue as string).length;
        console.log(strLength); // 16
        ```

- **项目中使用场景**：
    - **联合类型**：API 返回的数据字段可能包含多种类型（如 `string | number`），或者组件的某个属性可以接受多种类型的值。
    - **类型断言**：在处理第三方库、DOM 操作、或者从 `any` 类型转换数据时，当开发者明确知道变量的实际类型但编译器无法推断时，使用类型断言可以避免类型错误。

- **解决的问题和优势**：
    - **联合类型**：提供了类型灵活性，允许一个变量持有多种类型的值，同时保持类型安全，通过类型缩小确保正确访问成员。
    - **类型断言**：解决了编译器无法准确推断类型时的局限性，允许开发者手动覆盖类型，从而能够访问特定类型才有的属性或方法。

1.3 常见误区或面试陷阱

- **误区一：混淆联合类型和交叉类型**：
    - **联合类型 (`|`)**：表示"或"的关系，一个值可以是多种类型中的任意一种。它关注的是类型的**可能性集合**。
    - **交叉类型 (`&`)**：表示"与"的关系，一个值必须同时满足多种类型的所有特征。它关注的是类型的**组合叠加**。
    面试官可能会考察你对这两种概念的清晰区分。

- **误区二：滥用类型断言，将其视为类型转换**：
    类型断言不是类型转换！它不改变数据的运行时类型，只在编译时提供类型信息。如果你断言的类型与实际运行时类型不符，将导致运行时错误。例如，将一个数字断言为字符串，并尝试使用字符串方法，会在运行时报错。
    ```typescript
    let num: any = 123;
    // 运行时会报错：TypeError: num.length is undefined
    // let len = (num as string).length;
    ```

- **误区三：过度依赖类型断言，忽视类型缩小**：
    当可以使用类型守卫（如 `typeof`、`instanceof`、`in` 等）来安全地缩小类型范围时，应优先使用类型守卫而不是类型断言。类型守卫提供了运行时的类型检查，保证了代码的健壮性。类型断言应该作为最后手段，只在你百分之百确定类型且没有其他安全方式时使用。

- **面试陷阱：`as const` 类型断言**：
    面试官可能会问到 `as const`。它是一种特殊的类型断言，用于将字面量类型推断为最窄的常量类型。例如，`let arr = [1, "a"] as const;` 会将 `arr` 推断为 `readonly [1, "a"]` 而不是 `(number | string)[]`，从而禁止对其内容的修改，提供更严格的类型安全。

- **面试陷阱：双重断言 (`<any><Type>value`)**：
    在某些极端情况下，当需要将一个类型断言为与它不兼容的类型时，TypeScript 会报错。这时可以使用双重断言，先断言为 `any`（或 `unknown`），再断言为目标类型。但这非常不推荐，因为它完全绕过了类型检查，几乎总是意味着设计或类型定义存在问题。
    ```typescript
    // let x: string = 'hello';
    // let y: number = <number>x; // Error: Conversion of type 'string' to type 'number' may be a mistake
    // let y: number = <number><any>x; // No error, but unsafe
    ```

</details>

## 7. Vue 的响应式原理 {#question-subjective-d982e21eac78}

### 题目要点

- **核心概念**：考察面试者对 Vue 响应式系统核心机制的理解，包括数据劫持和依赖追踪。
- **实现细节**：面试官想确认面试者对 `Object.defineProperty` 在 Vue 2 中如何实现数据劫持的细节掌握程度。
- **依赖收集与派发更新**：考察对数据变化如何触发视图更新的完整流程的理解。
- **局限性**：理解 Vue 2 响应式系统的已知限制，为后续 Vue 3 的改进做铺垫。

<details>
<summary>参考答案</summary>

1.1 原理说明

Vue.js 的核心特性之一就是其"响应式系统"。这意味着当应用中的数据发生变化时，视图会自动且高效地进行更新。Vue 2.x 版本的响应式原理主要是通过 **`Object.defineProperty`** 结合**发布-订阅模式**来实现的。

- **核心工作机制**：
    当一个 Vue 实例被创建时，Vue 会遍历 `data` 选项中的所有属性，并使用 `Object.defineProperty` 把这些属性全部转换成 `getter/setter`。每个组件实例都对应一个 **`Watcher`** 实例，它会在组件渲染的过程中把"接触"过的数据属性记录为依赖。

    当依赖的 `setter` 方法被调用时，它会通知所有订阅了该属性变化的 `Watcher`，进而促使对应的组件重新渲染。

- **深入解释工作机制**：
    1.  **数据劫持 (Data Observation)**：Vue 在初始化时，会调用 `Observer` 类来遍历 `data` 对象中的所有属性。对于每个属性，通过 `Object.defineProperty` 定义 `getter` 和 `setter`：
        -   **`getter`**：当数据被读取时，会触发 `getter`。此时，如果存在一个激活的 `Watcher`（例如，在组件渲染过程中），这个 `Watcher` 就会被添加到该数据属性的 **`Dep`**（Dependency，依赖收集器）实例中。这就是"依赖收集"的过程。
        -   **`setter`**：当数据被修改时，会触发 `setter`。此时，`setter` 会通知其对应的 `Dep`，告诉它所有已经收集的 `Watcher`，去执行它们的 `update` 方法，从而触发视图更新。这就是"派发更新"的过程。

    2.  **依赖追踪 (Dependency Tracking)**：每个响应式数据属性都有一个与之关联的 `Dep` 实例。这个 `Dep` 实例负责存储所有订阅了该数据变化的 `Watcher`。当 `getter` 被触发时，当前的 `Watcher` (存储在 `Dep.target` 上) 会被添加到该 `Dep` 的订阅者列表中。

    3.  **派发更新 (Notify Observers)**：当数据发生变化时，`setter` 会通知对应的 `Dep`，然后 `Dep` 会遍历其订阅者列表中的所有 `Watcher`，并调用它们的 `update` 方法。`Watcher` 的 `update` 方法会根据不同的情况（如同步更新或异步批处理更新）来重新渲染组件或执行回调。

    4.  **`Watcher` (观察者)**：`Watcher` 是连接数据和视图的桥梁。Vue 中有不同类型的 `Watcher`，最常见的是渲染 `Watcher`（每个组件有一个），它负责收集组件渲染过程中所依赖的数据。当它观察的数据发生变化时，会通知组件重新渲染。

- **为什么会出现这个技术需求**：
    在 MVVM 框架中，实现数据和视图的自动同步是核心需求。传统方式需要手动操作 DOM 更新视图，效率低下且容易出错。响应式系统旨在解决这一问题，通过数据驱动视图，使得开发者可以更专注于业务逻辑，而无需关心复杂的 DOM 操作。

1.2 核心用法 + 示例代码

Vue 2 的响应式系统是自动工作的，开发者通常不需要直接操作 `Object.defineProperty`。你只需要在 `data` 选项中声明数据，Vue 就会使其响应式化。

- **基本响应式数据定义**：
    ```vue
    <template>
      <div>
        <p>{{ message }}</p>
        <button @click="changeMessage">改变消息</button>
      </div>
    </template>

    &lt;script&gt;
    export default {
      data() {
        return {
          message: 'Hello Vue!',
          count: 0
        };
      },
      methods: {
        changeMessage() {
          this.message = 'Hello Vue Reactive!'; // 修改 message 会触发视图更新
        },
        increment() {
          this.count++; // 修改 count 会触发视图更新
        }
      }
    };
    &lt;/script&gt;
    ```

- **数组和对象的特殊处理**：
    由于 `Object.defineProperty` 的限制，Vue 2 无法检测到以下两种情况的变动：
    1.  **对象属性的添加或删除**：直接添加或删除一个对象的属性（例如 `this.someObject.newProperty = 'value'` 或 `delete this.someObject.oldProperty`)不会触发视图更新。
    2.  **数组通过索引直接修改元素或修改数组长度**：例如 `this.myArray[0] = 'new value'` 或 `this.myArray.length = 0` 不会触发视图更新。

    为了解决这些限制，Vue 提供了特定的方法来确保这些操作也是响应式的：
    -   **`Vue.set(object, key, value)` 或 `this.$set(object, key, value)`**：用于向响应式对象添加新属性，并确保新属性也是响应式的。
        ```javascript
        this.$set(this.someObject, 'newProperty', 'value');
        ```
    -   **`Vue.delete(object, key)` 或 `this.$delete(object, key)`**：用于删除对象的属性，并触发更新。
        ```javascript
        this.$delete(this.someObject, 'oldProperty');
        ```
    -   **数组的变异方法**：Vue 劫持了数组的一些原型方法（如 `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`），这些方法会触发视图更新。对于通过索引修改数组元素，可以使用 `Vue.set` 或 `splice` 方法。
        ```javascript
        // 响应式修改数组元素
        this.$set(this.myArray, 0, 'new value');
        // 或者使用 splice
        this.myArray.splice(0, 1, 'new value');
        ```

- **解决的问题和优势**：
    - **声明式渲染**：开发者可以声明式地描述 UI 状态，而无需手动操作 DOM，大大简化了前端开发。
    - **高效更新**：通过依赖追踪，Vue 能够精确知道哪些数据变化影响了哪些组件，从而只更新必要的视图部分，提高了性能。
    - **降低心智负担**：自动响应式系统让开发者能够更专注于业务逻辑，提高开发效率。

1.3 常见误区或面试陷阱

- **误区一：混淆 Vue 2 和 Vue 3 响应式原理**：
    这是最常见的误区。Vue 2 主要依赖 `Object.defineProperty`，而 Vue 3 则转向了 `Proxy`。面试官经常会问到两者的区别和各自的优劣。务必清楚它们在数据劫持方式上的根本不同。

- **误区二：不了解 `Object.defineProperty` 的局限性**：
    很多面试者只知道 Vue 2 使用 `Object.defineProperty`，但对其无法检测到对象属性的添加/删除和数组通过索引修改等局限性不清楚。这会导致在实际开发中遇到视图不更新的问题。因此，需要掌握 `Vue.set` 和 `Vue.delete` 的使用场景。

- **误区三：认为响应式是"深层"的**：
    Vue 2 默认会对 `data` 中的对象进行深层遍历，使其内部所有嵌套属性都成为响应式。但如果数据量非常大，深层遍历可能会导致性能问题。面试官可能会问到如何优化深层响应式数据。

- **面试陷阱：响应式数据的"非侵入性"**：
    Vue 的响应式系统是侵入性的，它通过修改原始数据对象的 `getter/setter` 来实现响应。这意味着原始数据对象被"劫持"了。面试官可能会让你对比 Vue 的响应式与 React 的不可变数据，来考察你对数据处理方式的理解。

- **面试陷阱：异步更新队列 (`nextTick`)**：
    Vue 在数据变化后，不会立即更新 DOM，而是将所有数据变化放入一个异步更新队列，在下一个事件循环"tick"时批量更新 DOM。这是为了性能优化。面试官可能会问到 `this.$nextTick` 的作用和使用场景。
    ```javascript
    // 错误示例：无法立即获取到更新后的DOM内容
    this.message = 'new message';
    console.log(this.$refs.myDiv.textContent); // 可能是旧内容

    // 正确示例：在DOM更新后执行回调
    this.message = 'new message';
    this.$nextTick(() => {
        console.log(this.$refs.myDiv.textContent); // 确保是新内容
    });
    ```

</details>

## 8. Vue3 使用了 Proxy 实现响应式，与 Vue2 的 Object.defineProperty 对比有什么优势 {#question-subjective-b05d7105e820}

### 题目要点

- **核心技术对比**：考察面试者对 Vue 2 (`Object.defineProperty`) 和 Vue 3 (`Proxy`) 两种响应式实现机制的理解。
- **Proxy 的优势**：面试官想确认面试者对 `Proxy` 在解决 `Object.defineProperty` 局限性方面的具体优势的认知。
- **性能与设计**：理解 `Proxy` 带来的性能提升、更优化的设计以及对未来特性的支持。

<details>
<summary>参考答案</summary>

1.1 原理说明

Vue 的响应式系统是其核心魅力之一，它使得数据变化能够自动反映到视图上。在 Vue 2.x 中，响应式系统主要基于 `Object.defineProperty` 实现。然而，`Object.defineProperty` 存在一些固有的局限性。为了克服这些局限性并提供更强大、更高效的响应式能力，Vue 3 全面转向了基于 ES6 的 `Proxy` 对象来实现响应式。

- **`Object.defineProperty` 的局限性回顾**：
    - **无法监听对象属性的添加和删除**：`Object.defineProperty` 只能劫持对象已有的属性。对于在对象创建后新添加的属性，或者通过 `delete` 操作删除的属性，它无法检测到。这导致 Vue 2 必须提供 `$set` 和 `$delete` 这样的特殊 API 来处理这些情况。
    - **无法监听数组的索引赋值和 `length` 变化**：`Object.defineProperty` 无法直接劫持数组通过索引直接修改元素（如 `arr[0] = newValue`）或修改 `length` 属性。Vue 2 通过重写数组原型上的方法（如 `push`, `pop`, `splice` 等）来解决这个问题，但这增加了复杂性。
    - **需要深度遍历**：为了使嵌套对象的所有属性都变为响应式，Vue 2 在初始化时需要递归地遍历 `data` 对象的所有属性，这在数据量大或层级深时会有较大的性能开销。

- **`Proxy` 的工作机制**：
    `Proxy` 对象用于创建一个对象的代理，从而实现对目标对象的各种操作（如属性查找、赋值、枚举、函数调用等）进行拦截和自定义。与 `Object.defineProperty` 只能拦截对象属性的 `getter` 和 `setter` 不同，`Proxy` 可以拦截多达 13 种操作，包括 `get`、`set`、`deleteProperty`、`has`、`ownKeys` 等。

    Vue 3 使用 `Proxy` 创建一个响应式对象时，实际上是代理了整个对象，而不是其单个属性。这意味着它能够追踪到对象的所有操作，包括属性的添加、删除、数组的变动等。

1.2 核心用法 + 示例代码

在 Vue 3 中，你主要通过 `reactive` 和 `ref` API 来创建响应式数据，而底层就是利用了 `Proxy`。

- **Vue 3 `reactive` 使用 `Proxy`**：
    ```typescript
    import { reactive } from 'vue';

    const state = reactive({
      count: 0,
      person: {
        name: 'Alice',
        age: 30
      },
      list: [1, 2, 3]
    });

    // 增加新属性，Vue 3 可以直接检测到并触发更新
    state.person.gender = 'female';
    console.log(state.person.gender); // female

    // 删除属性，Vue 3 可以直接检测到并触发更新
    delete state.person.age;
    console.log(state.person.age); // undefined

    // 直接通过索引修改数组元素，Vue 3 可以直接检测到并触发更新
    state.list[0] = 100;
    console.log(state.list); // [100, 2, 3]

    // 修改数组长度，Vue 3 可以直接检测到并触发更新
    state.list.length = 1;
    console.log(state.list); // [100]
    ```

- **Vue 3 `ref` 也是基于 `Proxy` 实现 (值类型)**：
    虽然 `ref` 主要用于处理原始值，但其内部实现也利用了 `Proxy` 来包裹 `value` 属性，使得对 `ref.value` 的访问和修改也能被拦截。

- **优势对比**：

| 特性 / 对比           | Vue 2 (`Object.defineProperty`)                               | Vue 3 (`Proxy`)                                            |
|-----------------------|---------------------------------------------------------------|------------------------------------------------------------|
| **监听范围**          | 只能劫持对象已有的属性的 `getter/setter`。                     | 代理整个对象，可以监听对象的所有操作（13种）。              |
| **新增/删除属性**     | 无法直接监听，需使用 `$set` / `$delete` 特殊 API。           | 可以直接监听，无需额外 API，操作更自然。                     |
| **数组变化**          | 无法直接监听索引赋值和 `length` 变化，需重写数组原型方法。   | 可以直接监听数组的各种操作，包括索引赋值和 `length` 变化。   |
| **嵌套对象初始化**    | 需要递归深度遍历，初始化时开销大。                         | 惰性代理，只有当访问到嵌套属性时才进行代理，性能更优。     |
| **反射能力**          | 有限，只能拦截 `get` 和 `set`。                               | 提供了更全面的反射能力，可以拦截更多操作，为未来功能扩展提供可能。 |
| **代码简洁性**        | 需要额外的 API 处理特定情况。                               | API 更统一，使用更直观，减少了学习成本。                  |

- **解决的问题**：
    `Proxy` 解决了 `Object.defineProperty` 在监听对象属性增删和数组变动方面的根本性限制，使得 Vue 的响应式系统更加强大、完善和一致。

- **相比其他方案的优势**：
    -   相比 Vue 2，Vue 3 的响应式系统更完整、更符合直觉，消除了原有的"非响应式"陷阱。
    -   `Proxy` 提供了更强大的拦截能力，为 Vue 3 的一些高级特性（如 `readonly`, `shallowReactive`）提供了底层支持。
    -   惰性代理（Lazy Proxy）优化了初始化性能，对于大型嵌套对象，只有在需要时才进行深度响应化，减少了不必要的开销。

1.3 常见误区或面试陷阱

- **误区一：认为 Vue 3 放弃了 `Object.defineProperty`**：
    虽然 Vue 3 主要使用 `Proxy` 实现响应式，但它并没有完全放弃 `Object.defineProperty`。在某些兼容性场景下，或者对于不支持 `Proxy` 的旧浏览器，Vue 3 仍然会回退到 `Object.defineProperty`（尽管 Vue 3 已经不再支持 IE11，所以通常不会遇到这种情况）。面试官可能会借此考察你对 Vue 3 兼容性策略的理解。

- **误区二：不清楚 `Proxy` 的"惰性"特性**：
    Vue 3 的 `Proxy` 是惰性创建的，只有当访问到对象的某个属性时，其内部的嵌套对象才会被递归地代理。这与 Vue 2 初始化时就对所有数据进行深度遍历不同，是 Vue 3 性能提升的关键点之一。面试官可能会让你比较两者的初始化性能。

- **误区三：将 `ref` 和 `reactive` 混为一谈**：
    `reactive` 主要用于处理对象和数组等复杂类型，而 `ref` 则更适用于原始值（primitive values）和非原始值。虽然两者都依赖 `Proxy` 实现响应式，但其设计目的和使用场景略有不同。面试官可能会让你区分两者的使用场景和内部机制。

- **面试陷阱：`Proxy` 的性能开销**：
    虽然 `Proxy` 解决了 `Object.defineProperty` 的许多局限性，但它本身也有一定的性能开销，尤其是在进行大量操作时。面试官可能会问到 `Proxy` 可能带来的性能问题以及 Vue 如何进行优化（例如，通过 WeakMap 缓存代理对象，避免重复代理）。

- **面试陷阱：`Reflect` 的作用**：
    `Proxy` 常常与 `Reflect` 对象一起使用。`Reflect` 提供了一组与 `Proxy` 拦截器方法相对应的方法，使得在代理操作中能够方便地调用默认行为。面试官可能会问到 `Reflect` 在 Vue 3 响应式系统中的作用。

</details>

## 9. 什么是跨域？在项目中你是如何利用代理解决跨域问题的？ {#question-subjective-5b28d68cc7a6}

### 题目要点

- **跨域概念**：考察面试者对浏览器同源策略的理解以及"跨域"产生的原因。
- **跨域解决方案**：考察面试者对常见跨域解决方案的掌握，尤其是代理（Proxy）机制的原理和实际应用。
- **项目实践**：结合实际项目经验，考察面试者解决问题的能力和对工程实践的理解。

<details>
<summary>参考答案</summary>

1.1 原理说明

- **什么是跨域**：
    跨域（Cross-Origin）是指浏览器在执行 JavaScript 脚本时，出于安全考虑，阻止了不同源（Origin）之间的资源交互。这个安全限制被称为**同源策略（Same-Origin Policy）**。

    **同源**是指"协议、域名、端口"三者都相同。只要其中任意一项不同，就被认为是"非同源"，即跨域。例如：
    -   `http://example.com:80/path` 与 `https://example.com:80/path`（协议不同）是跨域。
    -   `http://example.com:80/path` 与 `http://sub.example.com:80/path`（域名不同，子域名也算不同）是跨域。
    -   `http://example.com:80/path` 与 `http://example.com:8080/path`（端口不同）是跨域。

- **跨域产生的原因**：
    同源策略是浏览器最核心的安全策略，它限制了从一个源加载的文档或脚本如何与来自另一个源的资源进行交互。它的主要目的是为了保护用户数据安全，防止恶意网站通过 JavaScript 窃取用户在其他网站上的敏感信息（如 Cookie、LocalStorage、DOM 内容等）。如果没有同源策略，一个恶意网站就可以通过 JavaScript 访问你正在登录的银行网站的数据，造成安全风险。

1.2 核心用法 + 示例代码

解决跨域问题有多种方法，例如 CORS (跨域资源共享)、JSONP、WebSocket、`document.domain + iframe`、`postMessage` 等。在前端项目中，利用**代理（Proxy）**是常见且高效的解决方案之一，尤其适用于开发环境。

- **代理解决跨域的原理**：
    代理的原理是利用了服务器之间没有同源策略限制的特性。当浏览器向前端开发服务器发送一个请求时，如果这个请求的目标是后端 API，前端服务器可以将这个请求转发到真实的后端服务。对于浏览器来说，它始终在与前端服务器（同源）进行通信，因此没有跨域问题。后端服务器将响应返回给前端服务器，前端服务器再将响应转发给浏览器。

    简单来说，就是将跨域请求从"浏览器 -> 跨域后端"的模式，变成了"浏览器 -> 同源前端服务器 -> 跨域后端"的模式，从而绕过了浏览器的同源策略。

- **项目中使用代理解决跨域**：
    在实际前端项目中，我们通常会在开发环境中使用像 `Webpack Dev Server`、`Vite`、`Create React App` 等提供的代理功能来解决跨域问题。这些工具内置了 `http-proxy-middleware` 或类似的功能。

    **示例代码（以 Vue CLI / Webpack Dev Server 为例）**：
    在 `vue.config.js`（或 `webpack.config.js` 的 `devServer` 配置）中进行配置。
    ```javascript
    // vue.config.js
    module.exports = {
      devServer: {
        proxy: {
          '/api': {
            target: 'http://localhost:3000', // 目标后端服务地址
            ws: true, // 是否代理 websockets
            changeOrigin: true, // 开启代理，在请求时，将 Host 请求头设置为 target 的主机。
            pathRewrite: {
              '^/api': '' // 重写路径：将请求路径中的 '/api' 替换为空字符串
            }
          }
        }
      }
    };
    ```

    **解释**：
    -   当浏览器发送一个请求，例如 `http://localhost:8080/api/users`。
    -   `Webpack Dev Server` 监听到这个请求，发现路径匹配 `/api`。
    -   根据配置，它会将这个请求转发到 `http://localhost:3000/users`（`pathRewrite` 将 `/api` 去掉了）。
    -   后端服务器 `http://localhost:3000` 处理请求并返回数据。
    -   `Webpack Dev Server` 收到后端数据后，再将其转发给浏览器。

    对于浏览器而言，它始终认为自己在请求 `http://localhost:8080` 下的资源，因此不会触发同源策略。

- **解决的问题和优势**：
    -   **解决了开发环境的跨域问题**：方便前端开发者在本地模拟后端 API 请求。
    -   **透明性**：对前端代码来说是透明的，无需在每次请求时手动添加跨域头或特殊处理。
    -   **安全性**：因为请求是在服务器端转发的，不会暴露后端服务的真实地址和端口给客户端。
    -   **配置简单**：大多数现代前端构建工具都提供了简单易用的代理配置。

1.3 常见误区或面试陷阱

- **误区一：认为代理能解决生产环境的跨域问题**：
    前端开发服务器的代理只在**开发环境**有效。在生产环境中，前端应用通常是部署在 CDN 或静态服务器上，此时没有前端开发服务器来做代理。生产环境的跨域问题通常需要后端配合，通过配置 CORS (Cross-Origin Resource Sharing) 响应头来解决。

- **误区二：混淆代理和 CORS**：
    代理和 CORS 都是解决跨域的方法，但作用机制不同。
    -   **代理**：绕过浏览器同源策略，由**服务器端**转发请求。
    -   **CORS**：是一种 W3C 标准，允许浏览器向跨源服务器发出 `XMLHttpRequest` 或 Fetch 请求，由**服务器端**在响应头中添加 `Access-Control-Allow-Origin` 等字段来告知浏览器允许跨域访问。
    面试官可能会让你比较两者的异同和适用场景。

- **误区三：`changeOrigin` 参数的理解**：
    `changeOrigin: true` 是代理配置中一个重要的参数。它的作用是将请求头中的 `Host` 字段改为目标 `target` 的 `Host`。如果设置为 `false`，则 `Host` 字段会保持为请求源的 `Host`。这对于某些后端服务来说很重要，因为它们可能依赖 `Host` 字段来判断请求来源。

- **面试陷阱：`pathRewrite` 的作用**：
    `pathRewrite` 用于重写请求路径。例如，`pathRewrite: {'^/api': ''}` 会将 `/api/users` 请求路径重写为 `/users` 再转发给目标服务器。如果后端 API 的路径不包含 `api` 前缀，这个配置是必要的。面试官可能会通过这个点来考察你对代理配置细节的理解。

- **面试陷阱：预检请求 (Preflight Request)**：
    对于一些复杂的 CORS 请求（如 PUT, DELETE 方法，或者带有自定义头的请求），浏览器会先发送一个 `OPTIONS` 请求（预检请求）来询问服务器是否允许该跨域请求。如果服务器允许，才会发送真实的请求。面试官可能会问到预检请求的触发条件和作用。

</details>

## 10. 浏览器的缓存机制有哪些，它们是如何工作的？ {#question-subjective-b12e1692f4eb}

### 题目要点

- **缓存类型**：考察面试者对浏览器缓存机制的全面认知，包括强缓存和协商缓存。
- **工作原理**：面试官想确认面试者对不同缓存机制具体工作流程的理解，包括涉及的 HTTP 请求头和响应头。
- **缓存策略选择**：考察面试者在实际项目中如何根据业务需求选择合适的缓存策略，以及对缓存失效、更新机制的掌握。
- **性能优化**：理解浏览器缓存对于前端性能优化的重要性。

<details>
<summary>参考答案</summary>

1.1 原理说明

浏览器缓存是前端性能优化的重要手段之一，它将用户访问过的页面资源（如 HTML、CSS、JavaScript、图片等）存储在本地，当用户再次访问同一资源时，可以直接从本地加载，从而减少网络请求，提高页面加载速度，减轻服务器压力。

浏览器缓存主要分为两大类：**强缓存（Strong Cache）**和**协商缓存（Negotiation Cache）**。

- **强缓存**：
    - **定义**：当浏览器检查到资源命中强缓存时，不会向服务器发送任何请求，直接从本地缓存中获取资源。它的优先级高于协商缓存。
    - **工作原理**：强缓存的实现依赖于 HTTP 响应头中的两个字段：`Expires` 和 `Cache-Control`。
        -   **`Expires`**：HTTP/1.0 产物，表示资源的过期时间（一个具体的日期和时间）。当浏览器请求资源时，如果当前时间在 `Expires` 之前，则直接使用缓存。它的缺点是受本地时间影响，可能导致客户端与服务器时间不同步而引发问题。
        -   **`Cache-Control`**：HTTP/1.1 产物，优先级高于 `Expires`。它通过设置不同的指令来控制缓存行为：
            -   `max-age=<seconds>`：表示资源在缓存中可以保留的最长时间（相对时间，单位秒）。
            -   `no-cache`：表示客户端缓存资源，但每次使用前都必须向服务器发送验证请求（即进行协商缓存）。
            -   `no-store`：表示不缓存任何内容，每次请求都必须从服务器完整下载。
            -   `public`：表示响应可以被任何缓存（包括客户端和代理服务器）缓存。
            -   `private`：表示响应只能被客户端缓存，不能被代理服务器缓存。

- **协商缓存**：
    - **定义**：当强缓存失效时，浏览器会向服务器发送请求，携带缓存标识，由服务器判断资源是否发生变化。如果资源未发生变化，服务器返回 `304 Not Modified` 状态码，浏览器继续使用本地缓存；如果资源已变化，服务器返回新的资源和 `200 OK` 状态码。
    - **工作原理**：协商缓存的实现依赖于 HTTP 请求头和响应头中的一对字段：
        -   **`Last-Modified` / `If-Modified-Since`**：
            -   `Last-Modified`（响应头）：服务器在首次响应资源时，会返回该资源的最后修改时间。
            -   `If-Modified-Since`（请求头）：浏览器在后续请求同一资源时，会在请求头中携带上次响应的 `Last-Modified` 值，询问服务器资源是否在该时间之后被修改过。
            -   **判断逻辑**：如果服务器判断资源未修改，则返回 `304`；如果已修改，则返回 `200` 及新资源。
        -   **`ETag` / `If-None-Match`**：
            -   `ETag`（响应头）：服务器在首次响应资源时，会返回该资源的唯一标识符（例如，内容的哈希值）。
            -   `If-None-Match`（请求头）：浏览器在后续请求同一资源时，会在请求头中携带上次响应的 `ETag` 值，询问服务器资源的 `ETag` 是否与当前服务器上的 `ETag` 匹配。
            -   **判断逻辑**：如果服务器判断 `ETag` 匹配（资源未修改），则返回 `304`；如果不匹配（资源已修改），则返回 `200` 及新资源。
    - **`ETag` 的优势**：`ETag` 比 `Last-Modified` 更精确，因为它是一个内容的哈希值。即使文件修改时间没变，但内容变了（比如，重新保存但内容没变），`ETag` 也能检测到。同时，它解决了 `Last-Modified` 无法精确到秒的问题。

- **缓存优先级**：
    浏览器在加载资源时，会优先判断强缓存。如果强缓存命中，直接使用；如果强缓存未命中或过期，则进行协商缓存。只有当协商缓存也未命中时（即服务器返回新资源），浏览器才会下载完整资源并更新本地缓存。

1.2 核心用法 + 示例代码

浏览器缓存的实现主要是在服务器端配置 HTTP 响应头。作为前端开发者，我们需要理解这些头字段的作用，并在部署时与后端或运维人员协作配置。

- **强缓存配置示例**：
    -   **使用 `Cache-Control`**：
        ```http
        HTTP/1.1 200 OK
        Content-Type: text/html
        Cache-Control: max-age=3600, public
        ```
        这表示该 HTML 资源可以在客户端和代理服务器缓存 3600 秒（1小时）。在这一小时内，浏览器再次请求此资源时，将直接从本地缓存获取，不发送请求到服务器。

    -   **使用 `Expires`**：
        ```http
        HTTP/1.1 200 OK
        Content-Type: image/jpeg
        Expires: Thu, 01 Dec 2024 16:00:00 GMT
        ```
        这表示该图片资源在格林尼治时间 2024 年 12 月 1 日 16:00:00 之前都是有效的。过期后，浏览器会尝试进行协商缓存。

- **协商缓存配置示例**：
    -   **使用 `Last-Modified` 和 `ETag`**：
        首次请求：
        ```http
        HTTP/1.1 200 OK
        Content-Type: text/css
        Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT
        ETag: "abcdefg"
        ```
        再次请求时，浏览器发送：
        ```http
        GET /styles.css HTTP/1.1
        If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT
        If-None-Match: "abcdefg"
        ```
        如果资源未修改，服务器响应：
        ```http
        HTTP/1.1 304 Not Modified
        ```
        如果资源已修改，服务器响应：
        ```http
        HTTP/1.1 200 OK
        Content-Type: text/css
        Last-Modified: Thu, 22 Oct 2023 08:30:00 GMT
        ETag: "newhashxyz"
        [新的 CSS 内容]
        ```

- **在项目中的实践**：
    -   **静态资源（CSS, JS, 图片）**：通常会设置较长的强缓存时间（如 `max-age=31536000` 一年），并结合文件名哈希（如 `bundle.js?v=hash` 或 `bundle.[hash].js`）来解决更新问题。当文件内容发生变化时，哈希值改变，URL 随之改变，浏览器会将其视为新资源并重新下载，从而避免了旧缓存的问题。
    -   **HTML 文件**：通常不设置强缓存，或者设置很短的强缓存（如 `no-cache` 或 `max-age=0, must-revalidate`），确保每次都能进行协商缓存，从而及时获取到最新的 HTML 结构。
    -   **API 接口**：根据接口数据的实时性要求来决定是否以及如何进行缓存。对于不经常变化的列表数据，可以考虑使用协商缓存。

- **解决的问题和优势**：
    -   **提升用户体验**：减少页面加载时间，特别是首次访问后再次访问的体验。
    -   **降低服务器负载**：减少不必要的 HTTP 请求，降低服务器的带宽和处理压力。
    -   **节省带宽**：减少数据传输量，对用户和服务器都节省了成本。

1.3 常见误区或面试陷阱

- **误区一：混淆 `Expires` 和 `Cache-Control: max-age` 的优先级**：
    `Cache-Control` 是 HTTP/1.1 的规范，而 `Expires` 是 HTTP/1.0 的。当两者同时存在时，`Cache-Control` 的优先级更高。面试时，面试官可能会故意问到这一点。

- **误区二：不理解 `no-cache` 和 `no-store` 的区别**：
    -   `Cache-Control: no-cache`：表示浏览器可以使用缓存，但在使用缓存前必须向服务器验证（协商缓存），以确保资源是最新的。它仍然会进行 HTTP 请求，只是如果资源未变则返回 304。
    -   `Cache-Control: no-store`：表示浏览器和所有中间缓存（代理服务器）都不能存储响应的任何部分，每次请求都必须向服务器完整下载。这是最严格的禁用缓存策略。
    面试官可能会考察你对这两个指令的精确理解。

- **误区三：认为清除浏览器缓存就能解决所有问题**：
    清除浏览器缓存确实能强制获取最新资源，但它清除了所有本地缓存，对于普通用户来说操作成本高。在实际部署中，通过版本号、哈希值更新 URL，或者合理设置缓存策略，才是更优雅和自动化的解决方案。

- **面试陷阱：`User-Agent` 与缓存**：
    一些面试官可能会问到 `Vary` 响应头。`Vary` 头可以告诉代理服务器和客户端，缓存的响应应该基于请求中的哪些头字段。例如，`Vary: User-Agent` 表示如果用户的 `User-Agent` 改变了，即使 URL 相同，也应该重新获取资源。这对于根据设备类型提供不同内容的场景很有用。

- **面试陷阱：CDN 缓存与浏览器缓存**：
    CDN (Content Delivery Network) 也会进行缓存，但它是位于用户和源服务器之间的中间层缓存。CDN 缓存与浏览器缓存是独立的，但它们共同协作，进一步加速资源访问。面试官可能会让你说明两者之间的关系以及如何协同工作。

</details>

## 11. 前端工程性能优化有哪些常见的方法 {#question-subjective-b1dff051e8ae}

### 题目要点

- **性能指标认知**：考察面试者对常见前端性能指标（如 FCP, LCP, CLS 等）的理解，以及如何衡量性能。
- **优化策略广度**：面试官想确认面试者对前端性能优化各类方法的掌握，包括从网络、资源、渲染、代码等多个维度的优化。
- **实际应用**：考察面试者在实际项目中如何运用这些优化方法，并了解其对性能的实际影响。
- **持续优化意识**：体现面试者对性能优化是一个持续过程的认知。

<details>
<summary>参考答案</summary>

1.1 原理说明

前端工程性能优化旨在提升用户体验，减少页面加载时间，提高页面响应速度和流畅度。性能优化是一个系统性的工作，涉及到从资源请求到页面渲染的整个生命周期。优化的核心思想是**减少请求数量、减少资源大小、优化资源加载顺序、提升渲染效率、减少不必要的计算和重排重绘**。

- **性能优化需求出现的原因**：
    随着现代 Web 应用的日益复杂，页面承载的内容和功能越来越多，导致资源体积增大、网络请求增多、JavaScript 执行时间变长，进而影响用户体验。用户对网页加载速度的期望越来越高，缓慢的页面加载会导致用户流失，影响业务转化率。因此，前端性能优化成为衡量一个 Web 应用质量和开发者能力的重要标准。

1.2 核心用法 + 示例代码

前端工程性能优化方法可以从多个维度进行：

- **网络请求优化**：
    -   **资源合并与压缩**：将多个 CSS/JS 文件合并为一个，减少 HTTP 请求数。对 HTML、CSS、JavaScript、图片等资源进行压缩（Gzip 压缩文本，TinyPNG 压缩图片），减小传输体积。
        -   **示例**：在 Webpack 中配置 `MiniCssExtractPlugin` 提取 CSS，`terser-webpack-plugin` 压缩 JS，`image-minimizer-webpack-plugin` 优化图片。
    -   **利用浏览器缓存**：合理设置 HTTP 缓存头（`Cache-Control`, `Expires`, `ETag`, `Last-Modified`），使得静态资源可以被浏览器缓存，减少重复请求。
        -   **示例**：在服务器配置 `Cache-Control: max-age=31536000, public` 用于静态资源。
    -   **使用 CDN (内容分发网络)**：将静态资源部署到 CDN 上，利用 CDN 节点进行内容分发，使用户可以从距离最近的服务器获取资源，减少网络延迟。
    -   **DNS 预解析 (DNS Prefetch)**：提前解析域名，减少 DNS 查询时间。
        -   **示例**：`&lt;link rel="dns-prefetch" href="//example.com"&gt;`
    -   **预连接 (Preconnect)**：提前建立与目标源的连接（DNS 查询、TCP 握手、TLS 协商），减少后续请求的延迟。
        -   **示例**：`&lt;link rel="preconnect" href="https://www.example.com"&gt;`
    -   **预加载 (Preload)**：强制浏览器在页面加载的早期阶段请求关键资源，而不阻塞渲染。
        -   **示例**：`&lt;link rel="preload" href="main.js" as="script"&gt;`
    -   **预获取 (Prefetch)**：指示浏览器在未来某个时间获取用户可能需要的资源，通常在空闲时进行。
        -   **示例**：`&lt;link rel="prefetch" href="next-page.js" as="script"&gt;`
    -   **HTTP/2 或 HTTP/3**：利用多路复用、头部压缩、服务器推送等特性，提高网络传输效率。

- **资源加载优化**：
    -   **按需加载 (Lazy Loading)**：
        -   **图片懒加载**：只加载进入视口（或即将进入视口）的图片，减少首次加载时的图片请求。
            -   **示例**：使用 `loading="lazy"` 属性或 Intersection Observer API。
        -   **组件/路由懒加载**：将不立即需要的组件或页面按需加载，减少首屏渲染时间。
            -   **示例 (Vue)**：`const Foo = () => import('./Foo.vue')`
            -   **示例 (React)**：`const OtherComponent = lazy(() => import('./OtherComponent'));`
    -   **代码分割 (Code Splitting)**：将代码分割成更小的块，按需加载，减少打包体积。
        -   **示例**：Webpack 的 `splitChunks` 配置，或动态 `import()`。
    -   **字体优化**：使用 `font-display: swap` 避免字体阻塞渲染，使用 WOFF2 等更小格式。

- **渲染优化**：
    -   **CSS 优化**：
        -   **CSS 放在头部**：确保 CSS 尽早加载，避免 FOUC (Flash Of Unstyled Content)。
        -   **避免使用 `@import`**：`@import` 会导致额外的 HTTP 请求和阻塞渲染。
        -   **减少 CSS 选择器嵌套**：提高 CSS 解析效率。
        -   **使用 BFC (块级格式化上下文)**：避免不必要的布局计算。
    -   **JavaScript 优化**：
        -   **JS 放在底部或使用 `defer`/`async`**：避免 JS 阻塞 HTML 解析和渲染。
            -   `defer`：脚本会在 HTML 解析完成后执行，并保持执行顺序。
            -   `async`：脚本会在下载完成后立即执行，不保证执行顺序。
        -   **减少 DOM 操作**：频繁的 DOM 操作会导致回流（Reflow）和重绘（Repaint），性能开销大。应批量操作 DOM。
        -   **事件委托**：减少事件监听器的数量，提高性能。
        -   **Web Workers**：将计算密集型任务放到后台线程执行，避免阻塞主线程。
    -   **动画优化**：使用 CSS 动画或 `requestAnimationFrame`，避免使用 `setTimeout`/`setInterval` 进行动画。
    -   **GPU 加速**：利用 `transform`, `opacity` 等 CSS 属性触发 GPU 加速。

- **图片优化**：
    -   **选择合适的图片格式**：JPEG (有损压缩，适用于照片)，PNG (无损压缩，适用于透明背景)，WebP (新一代格式，更高压缩率)。
    -   **图片压缩**：使用工具对图片进行压缩。
    -   **响应式图片**：使用 `srcset` 和 `sizes` 属性，根据设备分辨率和屏幕尺寸提供不同大小的图片。
        -   **示例**：`<img srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w" sizes="(max-width: 600px) 480px, (max-width: 1200px) 800px, 1200px" src="medium.jpg" alt="...">`
    -   **SVG 矢量图**：对于图标和简单图形，使用 SVG 替代位图。

- **代码优化**：
    -   **减少重排 (Reflow) 和重绘 (Repaint)**：尽量避免直接修改 DOM 样式，而是通过添加/移除 CSS 类来改变样式。将多次 DOM 操作合并为一次。
    -   **代码体积优化**：Tree Shaking (摇树优化) 移除未使用的代码，Scope Hoisting 减少模块包裹，代码混淆压缩。
    -   **算法优化**：对于数据处理密集型任务，优化算法复杂度。

1.3 常见误区或面试陷阱

- **误区一：只关注首次加载性能，忽视运行时性能**：
    很多优化集中在页面首次加载速度，但运行时性能（如页面交互流畅度、动画帧率）同样重要。面试官可能会通过一些场景题考察你对运行时性能的优化思路，如大量 DOM 元素的操作优化、复杂动画的性能瓶颈等。

- **误区二：不了解不同缓存策略的适用场景**：
    对 `max-age`, `no-cache`, `no-store` 等 `Cache-Control` 指令，以及 `ETag` 和 `Last-Modified` 的理解不深入，导致在实际项目中无法选择最合适的缓存策略。

- **误区三：过度优化或过早优化**：
    在项目初期就进行大量的性能优化可能会耗费不必要的开发时间。性能优化应该是一个持续的过程，先解决主要瓶颈，再逐步优化。面试官可能会考察你对"性能瓶颈分析"和"投入产出比"的理解。

- **面试陷阱：Web Vitals (核心 Web 指标)**：
    面试官可能会问到 Google 的 Web Vitals，特别是 LCP (最大内容绘制)、FID (首次输入延迟)、CLS (累计布局偏移) 等。这代表了业界对用户体验性能的新关注点，了解这些指标以及如何优化它们是加分项。

- **面试陷阱：SSR (服务器端渲染) 和 CSR (客户端渲染) 对性能的影响**：
    面试官可能会问 SSR 和 CSR 在性能方面的优劣。SSR 有利于首屏加载速度和 SEO，但会增加服务器压力和 TTFB (首字节时间)。CSR 在首次加载时可能较慢，但后续交互流畅。这考察你对不同渲染模式的理解和选择。

</details>

## 12. 在你参与的项目中，有没有进行过性能优化的实际案例，具体是采用了哪些措施，优化效果如何？ {#question-subjective-b784cd3d4559}

### 题目要点

- **主观型问题，无唯一标准答案。** 面试官主要考察答题者对实际项目经验的总结、问题分析能力、解决方案的落地能力，以及对优化效果的量化评估。他们希望了解你如何将理论知识应用于实践，并能清晰地阐述优化前后的对比和具体收益。
- 答题时建议突出"背景与问题"、"分析与定位（如何发现性能瓶颈）"、"采取的优化措施（具体技术方案和细节）"、"优化效果（量化数据和用户体验提升）"以及"个人反思与收获"等核心点，强调真实性和专业性。

<details>
<summary>参考答案</summary>

在我参与的一个企业级后台管理系统中，我曾负责一个复杂数据报表页面的性能优化。起初，这个页面加载非常缓慢，用户反馈卡顿严重，尤其是在数据量大的情况下。通过使用 Chrome DevTools 的 Performance 面板进行分析，我发现主要问题在于：一是页面首次加载时会请求并渲染大量非必要的数据图表；二是图表库在处理大量数据时存在渲染性能瓶颈。

针对这两个问题，我采取了以下优化措施：

首先，我实现了**图表的按需加载和懒渲染**。对于默认不展示的图表模块，我修改了其渲染逻辑，使其在用户点击或滚动到对应区域时才进行数据请求和图表初始化。具体地，我利用 `Intersection Observer API` 监听图表容器是否进入视口，当图表可见时才触发其数据加载和组件渲染。这显著减少了首屏的资源消耗和渲染时间。

其次，针对图表本身的渲染性能，我与团队讨论后决定对数据进行**预聚合和采样**。后端在返回数据时，对于时间范围较长的数据，会根据前端请求的粒度进行初步聚合，减少传输到前端的数据量。前端在接收到大量数据时，也会根据图表展示的密度进行适当的采样，避免图表库绘制过多密集的数据点，从而提升了图表的渲染流畅度。

经过这些优化，报表页面的首次加载时间从平均 15 秒降低到了 5 秒以内，并且在切换数据范围或进行图表交互时，页面的响应速度也得到了显著提升，用户反馈明显改善。这次经历让我更深入地理解了前端性能分析工具的使用，以及如何在实际项目中权衡数据精度与渲染性能，找到最佳的优化点。

</details>

## 13. Vue3 中 ref 和 reactive 的作用和区别，以及它们的使用场景。 {#question-subjective-594ec47dc93d}

### 题目要点

- **核心 API 理解**：考察面试者对 Vue 3 组合式 API 中 `ref` 和 `reactive` 这两个核心响应式 API 的基本概念和作用的理解。
- **使用场景区分**：面试官想确认面试者能否清晰区分两者的适用场景，避免混用或误用。
- **内部机制**：考察对 `ref` 如何处理原始值和对象，以及 `reactive` 如何处理对象的底层机制的认知。
- **响应式原理**：通过对比两者，进一步考察对 Vue 3 基于 `Proxy` 的响应式原理的深入理解。

<details>
<summary>参考答案</summary>

1.1 原理说明

Vue 3 引入了组合式 API (Composition API)，其中 `ref` 和 `reactive` 是构建响应式数据的两个核心函数。它们都旨在使数据变为响应式，即当数据发生变化时，依赖于这些数据的视图会自动更新。然而，它们的设计目的和适用场景略有不同，主要与 JavaScript 的数据类型（原始值和非原始值/对象）相关。

- **`ref` 的概念和作用**：
    - **概念**：`ref` 是一个函数，它接收一个内部值并返回一个响应式且可变的 `ref` 对象。这个 `ref` 对象只有一个 `.value` 属性，当访问或修改 `.value` 属性时，会触发响应式效果。`ref` 可以用来包装任何类型的值，包括原始值（`string`, `number`, `boolean`, `symbol`, `null`, `undefined`）和非原始值（`object`, `array`）。
    - **作用**：主要用于使原始值具备响应式能力。由于 JavaScript 的原始值是按值传递的，直接使用 `reactive` 无法对其进行响应式追踪。`ref` 提供了一个"容器"，将原始值包裹在一个对象中，从而能够利用 Vue 3 的 `Proxy` 机制进行追踪。

- **`reactive` 的概念和作用**：
    - **概念**：`reactive` 是一个函数，它接收一个普通 JavaScript 对象（或数组）并返回一个响应式代理对象。这个代理对象是原始对象的深层响应式副本。当代理对象的属性被访问或修改时，会触发响应式效果。
    - **作用**：主要用于使对象（包括数组）具备响应式能力。它会递归地将对象的所有嵌套属性都转化为响应式。

- **相关概念之间的联系和区别**：
    - **处理类型**：`ref` 主要处理原始值，`reactive` 主要处理对象（包括数组）。
    - **访问方式**：访问 `ref` 创建的响应式数据需要通过 `.value` 属性（在 `template` 中会自动解包，无需 `.value`）；访问 `reactive` 创建的响应式数据直接访问属性即可。
    - **内部实现**：`ref` 内部对于原始值，是将其封装成一个对象 `{ value: originalValue }`，然后对这个对象进行 `reactive` 代理。对于非原始值，`ref` 会直接使用 `reactive` 进行处理。`reactive` 则是直接对传入的对象进行 `Proxy` 代理。
    - **深层响应式**：`reactive` 默认是深层响应式的，即嵌套的对象也会被 `Proxy` 代理。`ref` 包装对象时，如果包装的是对象，也会变成深层响应式（因为内部用了 `reactive`）。

1.2 核心用法 + 示例代码

- **`ref` 的使用方式**：

    - **用于原始值**：
        ```typescript
        import { ref } from 'vue';

        const count = ref(0); // 包装一个数字
        console.log(count.value); // 0
        count.value++; // 修改值，触发响应式
        console.log(count.value); // 1

        const message = ref('Hello'); // 包装一个字符串
        message.value = 'World';
        ```

    - **用于对象**：当 `ref` 包装一个对象时，它会通过 `reactive` 自动将其转换为深层响应式对象。
        ```typescript
        import { ref } from 'vue';

        const user = ref({
          name: 'Alice',
          age: 30
        });

        console.log(user.value.name); // Alice
        user.value.age++; // 修改对象的属性，触发响应式
        console.log(user.value.age); // 31
        ```

    - **在模板中的自动解包**：在 Vue 模板中，访问 `ref` 对象时会自动解包 `.value`，无需手动添加。
        ```vue
        <template>
          <p>Count: {{ count }}</p> <!-- 模板中直接使用 count，而不是 count.value -->
        </template>

        &lt;script setup&gt;
        import { ref } from 'vue';
        const count = ref(0);
        &lt;/script&gt;
        ```

- **`reactive` 的使用方式**：

    - **用于对象或数组**：
        ```typescript
        import { reactive } from 'vue';

        const state = reactive({
          counter: 0,
          user: {
            name: 'Bob'
          },
          items: ['apple', 'banana']
        });

        console.log(state.counter); // 0
        state.counter++; // 修改值，触发响应式
        console.log(state.counter); // 1

        state.user.name = 'Charlie'; // 修改嵌套对象属性，触发响应式
        state.items.push('orange'); // 修改数组，触发响应式
        ```

- **使用场景**：
    -   **何时使用 `ref`**：
        -   当你需要使**原始值**（字符串、数字、布尔值、`null`、`undefined`、`symbol`）具备响应式能力时。
        -   当你需要将一个对象或数组包装成一个可响应式的"引用"，并且可能需要将其作为参数传递给函数或作为组件的属性时，`ref` 提供了一个统一的 `.value` 访问接口。
        -   在组合式 API 中，当你需要在一个函数内部定义并返回一个响应式状态时，`ref` 提供了更好的封装性。
    -   **何时使用 `reactive`**：
        -   当你需要使一个**普通 JavaScript 对象或数组**具备响应式能力时，并且希望它是一个深层响应式对象。
        -   当你有一个复杂的对象结构，并且大部分操作都是针对对象的属性时，`reactive` 更直观方便。
        -   当你希望避免 `.value` 的频繁使用，尤其是在组件内部声明复杂状态时。

- **解决的问题和优势**：
    -   **`ref` 解决了原始值无法直接响应式的问题**：通过将其包裹在对象中，使得对原始值的修改也能被 `Proxy` 拦截。
    -   **`reactive` 提供了更直观的对象响应式**：无需 `.value` 访问，更符合原生 JavaScript 对象操作习惯。
    -   **统一的响应式机制**：两者都基于 Vue 3 的 `Proxy` 实现，提供了更全面、更高效的响应式能力，解决了 Vue 2 `Object.defineProperty` 的局限性（如无法检测属性的增删）。

1.3 常见误区或面试陷阱

- **误区一：在模板外访问 `ref` 时忘记加 `.value`**：
    这是最常见的错误。在 `script` 标签内部或者 JavaScript 逻辑中访问 `ref` 创建的响应式变量时，必须通过 `.value` 来访问或修改其内部值。只有在 Vue 模板中，`ref` 才会自动解包。

- **误区二：将原始值传递给 `reactive`**：
    `reactive` 只能用于对象类型（包括数组）。如果你尝试将原始值（如数字、字符串）传递给 `reactive`，它会直接返回该原始值，而不会使其变为响应式。因此，处理原始值必须使用 `ref`。
    ```typescript
    import { reactive } from 'vue';
    const count = reactive(0); // count 仍然是 0，不是响应式对象
    count++; // count 仍然是 1，但它不是响应式的，视图不会更新
    ```

- **误区三：过度使用 `toRefs` 或 `toRef`**：
    `toRefs` 和 `toRef` 用于将 `reactive` 对象中的属性转换为 `ref` 对象，以解决在解构 `reactive` 对象时失去响应式的问题。然而，并非所有情况下都需要使用它们。过度使用可能导致代码冗余或难以理解。面试官可能会考察你对 `toRefs` 和 `toRef` 的正确理解和使用场景。

- **面试陷阱：`shallowReactive` 和 `shallowRef`**：
    面试官可能会问到 Vue 3 提供的浅层响应式 API：`shallowReactive` 和 `shallowRef`。它们只在第一层进行响应式处理，对于深层嵌套的对象，不会进行递归的响应式转换。这对于优化性能或处理不需要深层响应式的场景很有用。

- **面试陷阱：响应式数据的类型推导**：
    在使用 TypeScript 时，面试官可能会考察你对 `ref` 和 `reactive` 创建的响应式数据的类型推导能力，以及如何为它们添加类型注解。
    ```typescript
    import { ref, reactive } from 'vue';

    const name = ref<string>('Vue'); // 明确指定类型

    interface User { id: number; name: string; }
    const user = reactive<User>({ id: 1, name: 'TypeScript' }); // 明确指定接口类型
    ```

</details>

## 14. 一个前端项目从开发完成到上线，通常需要经过哪些流程？ {#question-subjective-4fdb4be9ed93}

### 题目要点

- **项目生命周期认知**：考察面试者对前端项目从零开始到最终上线的完整生命周期的理解，包括各个阶段的关键任务。
- **工程化实践**：面试官想确认面试者是否了解现代前端开发中的工程化实践，如构建、测试、部署、监控等。
- **团队协作与规范**：考察面试者在项目流程中如何与团队协作，以及对开发规范和质量保障的认知。
- **问题解决能力**：在不同阶段可能遇到的问题及其解决方案的思路。

<details>
<summary>参考答案</summary>

1.1 原理说明

一个前端项目从开发完成到最终上线，并非简单的代码编写和部署，而是一个涉及多阶段、多角色协作的系统性工程。这个流程通常遵循软件开发生命周期 (SDLC) 的一般规律，但在前端领域有其特定的工具和实践。其核心目标是确保代码质量、提高开发效率、保障系统稳定运行并提供良好的用户体验。

- **流程需求出现的原因**：
    随着前端应用的日益复杂和规模化，纯手工的开发和部署方式已无法满足需求。为了提高开发效率、保证代码质量、减少上线风险、实现持续集成和持续交付 (CI/CD)，并最终提供稳定高性能的用户体验，需要一套标准化的流程来规范项目的整个生命周期。

1.2 核心用法 + 示例代码

一个典型的前端项目从开发到上线的流程通常包括以下阶段：

1.  **需求分析与设计**：
    -   **任务**：与产品经理、设计师沟通，明确项目需求、功能点、用户故事、UI/UX 设计稿等。确定技术选型、架构设计、模块划分和接口定义。
    -   **目的**：确保开发方向与产品目标一致，为后续开发奠定基础。
    -   **工具/实践**：需求文档、原型图、UI 设计稿、技术选型讨论、接口文档（如 Swagger/Postman）。

2.  **开发与自测**：
    -   **任务**：前端工程师根据需求和设计进行代码编写，实现页面功能、组件开发、数据交互等。在开发过程中进行单元测试、组件测试，确保代码模块的正确性。
    -   **目的**：实现业务功能，保证代码质量和模块级别的正确性。
    -   **工具/实践**：IDE (VS Code)、版本控制 (Git)、脚手架 (Vue CLI, Create React App)、包管理器 (npm/yarn)、测试框架 (Jest, Vitest, React Testing Library)、代码规范 (ESLint, Prettier)。

3.  **联调与集成测试**：
    -   **任务**：前端代码与后端 API 进行联调，确保数据交互正确。进行集成测试，验证前后端系统之间的协同工作是否正常。
    -   **目的**：验证前后端接口的正确性，确保系统各模块协同工作。
    -   **工具/实践**：Postman/Swagger (API 测试)、抓包工具 (Fiddler/Charles)、浏览器开发者工具。

4.  **构建与打包**：
    -   **任务**：使用构建工具将开发环境的代码（如 TypeScript, JSX/Vue 单文件组件）编译、转译、打包、压缩、优化，生成可部署的生产环境代码（通常是 HTML, CSS, JavaScript 文件）。
    -   **目的**：优化代码体积和加载速度，提高生产环境性能。
    -   **工具/实践**：Webpack, Vite, Rollup。
        -   **示例 (Webpack 打包命令)**：`npm run build` 或 `yarn build`。

5.  **测试 (QA)**：
    -   **任务**：由测试团队进行全面的测试，包括功能测试、兼容性测试、性能测试、安全性测试、用户体验测试等。发现并报告 Bug。
    -   **目的**：发现和修复潜在问题，确保产品质量达到上线标准。
    -   **工具/实践**：Jira (Bug 管理)、Selenium/Cypress (端到端测试)、Lighthouse (性能审计)、Burp Suite (安全测试)。

6.  **预发布与灰度**：
    -   **任务**：将代码部署到预发布环境（与生产环境配置一致），进行最终验证。对于重要功能或大型改动，可能先进行灰度发布（将新版本代码逐步发布给部分用户），观察运行情况，确保稳定性。
    -   **目的**：在真实环境下验证代码，将上线风险降到最低。
    -   **工具/实践**：预发布服务器、灰度发布平台、监控系统、日志分析工具。

7.  **发布与部署**：
    -   **任务**：将验证通过的代码部署到生产环境，供所有用户访问。可能涉及到 CDN 更新、负载均衡配置等。
    -   **目的**：将产品正式上线，供用户使用。
    -   **工具/实践**：CI/CD 工具 (Jenkins, GitLab CI/CD, GitHub Actions)、Nginx (部署静态文件，配置反向代理)、云服务平台 (AWS S3, 阿里云 OSS)。

8.  **监控与维护**：
    -   **任务**：项目上线后，持续对应用进行性能监控、错误监控和日志收集，及时发现和解决线上问题。根据用户反馈和数据分析进行迭代优化和新功能开发。
    -   **目的**：保障线上应用稳定运行，持续优化产品，提升用户满意度。
    -   **工具/实践**：Sentry (错误监控)、Prometheus/Grafana (性能监控)、ELK Stack (日志管理)、Google Analytics (用户行为分析)。

- **解决的问题和优势**：
    -   **提高效率**：流程化和自动化减少了手动操作和等待时间。
    -   **保障质量**：各个阶段的测试和验证机制确保了代码质量和产品稳定性。
    -   **降低风险**：通过分阶段发布和监控，及时发现和解决问题，降低上线风险。
    -   **促进协作**：明确的流程和职责划分有利于团队成员之间的协作。

1.3 常见误区或面试陷阱

- **误区一：只关注开发阶段，忽视测试、部署和监控的重要性**：
    有些面试者可能只熟悉代码编写，对测试、发布和线上监控的理解不足。面试官希望看到你对整个流程的宏观把握，以及对每个环节价值的认知。

- **误区二：不了解 CI/CD 在前端项目中的作用**：
    持续集成 (CI) 和持续交付/部署 (CD) 是现代前端工程的重要组成部分。CI/CD 自动化了构建、测试和部署流程，提高了效率和可靠性。不了解或不提及 CI/CD 可能被认为对工程化实践认知不足。

- **误区三：将所有优化都堆积到最后阶段**：
    性能优化、安全考虑等应该贯穿于项目的整个生命周期，而不是等到上线前才临时抱佛脚。例如，代码规范和单元测试应该在开发阶段就执行。

- **面试陷阱：版本回滚策略**：
    面试官可能会问到项目上线后，如果出现严重问题，如何进行版本回滚。这考察你对发布风险的认识和应急处理能力。通常，通过 CI/CD 工具可以快速回滚到上一个稳定版本。

- **面试陷阱：前端部署的演进 (SSR, SSG, Edge Computing)**：
    除了传统的静态文件部署，面试官可能会问到 SSR (服务器端渲染)、SSG (静态站点生成) 或 Edge Computing (边缘计算) 等新的部署模式及其优缺点。这考察你对前端部署趋势的了解。

</details>

## 15. 你用过 React 吗？如果有，请讲一个你自己用 React 实现的小需求 {#question-subjective-af2002be258b}

### 题目要点

- **主观型问题，无唯一标准答案。** 面试官主要考察答题者对 React 框架的实际使用经验、组件化思想的理解、状态管理和副作用处理等核心概念的掌握。他们希望了解你如何将 React 应用于具体业务场景，并能清晰阐述实现过程和遇到的问题。
- 答题时建议围绕"需求背景"、"技术选型（为何选择 React）"、"核心功能实现（组件设计、状态管理、副作用处理等）"、"遇到的挑战与解决方案"以及"个人体会与收获"等核心点展开，强调实践经验和思考。

<details>
<summary>参考答案</summary>

在我的一个个人项目中，我用 React 实现了一个简单的"待办事项列表"（Todo List）应用。这个需求虽然基础，但能很好地体现 React 的核心思想。

项目背景是我想构建一个轻量级的工具来管理日常任务。我选择 React 是因为它推崇组件化和声明式 UI，这与我希望构建可复用、易于维护的应用的理念相符。核心功能包括：添加待办事项、标记事项完成/未完成、删除事项。

在实现上，我设计了几个主要组件：`App`（作为根组件）、`TodoForm`（用于添加新事项）和 `TodoList`（用于展示事项列表）。`TodoList` 内部又包含了 `TodoItem` 组件。状态管理方面，我使用了 React 的 `useState` Hook 来管理待办事项数组。例如，`const [todos, setTodos] = useState([])` 用来存储所有待办事项。当用户在 `TodoForm` 中输入并提交新事项时，我会调用 `setTodos` 更新 `todos` 状态，触发 `TodoList` 和 `TodoItem` 的重新渲染。标记完成和删除事项也是类似，通过传递给子组件的 props 函数来更新父组件的 `todos` 状态。

在开发过程中，我遇到的一个小挑战是如何在 `TodoItem` 组件中高效地更新或删除特定事项。一开始我尝试直接修改数组，但发现这不符合 React 的不可变数据原则，会导致视图不更新。后来我理解到应该通过 `map` 或 `filter` 等方法返回一个新的数组，然后用 `setTodos` 来更新状态，例如 `setTodos(prevTodos => prevTodos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo))`。这让我更深入地理解了 React 的状态更新机制和不可变数据的重要性。

通过这个小项目，我不仅巩固了 React 的基础知识，包括组件的生命周期（虽然 Hooks 改变了概念，但其背后的原理相通）、Props 和 State 的传递，也加深了对函数式组件和 Hooks 的理解和应用。它让我体会到 React 在构建复杂 UI 时的灵活性和高效性。

</details>

## 16. 以下代码的输出结果是什么？请详细解释。如果将 setTimeout 的回调函数中的内容改为多个 then 回调，输出结果会有什么变化？ {#question-subjective-6b5817bda60c}

### 题目要点

- **JavaScript 事件循环 (Event Loop)**：考察面试者对 JavaScript 运行时机制的深入理解，包括同步任务、异步任务、任务队列（宏任务队列和微任务队列）以及事件循环的执行顺序。
- **宏任务与微任务**：面试官想确认面试者对 `setTimeout` (宏任务) 和 `Promise.then` (微任务) 的分类及其执行优先级的认知。
- **Promise 链式调用**：考察对 Promise 链式调用中 `.then` 回调的执行时机和顺序的理解。
- **异步编程思维**：通过具体的代码示例，考察面试者对 JavaScript 异步编程的核心概念的掌握。

<details>
<summary>参考答案</summary>

1.1 原理说明

JavaScript 是一门单线程语言，这意味着它一次只能执行一个任务。为了处理耗时操作（如网络请求、定时器），避免阻塞主线程，JavaScript 引入了**事件循环 (Event Loop)** 机制。事件循环负责调度同步任务和异步任务的执行。

- **事件循环的基本概念**：
    事件循环是一个持续运行的进程，它不断检查两个任务队列：**宏任务队列 (Macrotask Queue)** 和 **微任务队列 (Microtask Queue)**。当主线程空闲时，事件循环会首先清空微任务队列，然后从宏任务队列中取出一个任务执行，如此循环往复。

- **宏任务 (Macrotasks)**：
    -   包括：`script` (整体代码), `setTimeout`, `setInterval`, `setImmediate` (Node.js), I/O, UI rendering 等。
    -   特点：每次事件循环只会从宏任务队列中取出一个任务执行。

- **微任务 (Microtasks)**：
    -   包括：`Promise.then`, `Promise.catch`, `Promise.finally`, `MutationObserver`, `process.nextTick` (Node.js)。
    -   特点：在当前宏任务执行完成后，下一个宏任务开始之前，会清空所有微任务。微任务具有更高的优先级。

- **执行顺序**：
    1.  执行主线程的同步代码。
    2.  执行过程中遇到的宏任务（如 `setTimeout`）会被放入宏任务队列。
    3.  执行过程中遇到的微任务（如 `Promise.then`）会被放入微任务队列。
    4.  当主线程的同步代码执行完毕后，立即检查微任务队列，并执行所有微任务。
    5.  微任务队列清空后，从宏任务队列中取出一个任务执行。
    6.  执行完这个宏任务后，再次检查并清空微任务队列。
    7.  重复步骤 5-6，直到所有任务执行完毕。

1.2 核心用法 + 示例代码

- **原代码输出结果及解释**：
    ```javascript
    console.log('start');
    setTimeout(() => {
        console.log('setTimeout');
    }, 0);
    Promise.resolve().then(() => {
        console.log('promise1');
    }).then(() => {
        console.log('promise2');
    });
    console.log('end');
    ```

    **输出结果**：
    ```
    start
    end
    promise1
    promise2
    setTimeout
    ```

    **解释**：
    1.  `console.log('start')`：同步任务，立即执行，输出 `start`。
    2.  `setTimeout(() => { console.log('setTimeout'); }, 0)`：`setTimeout` 是宏任务，即使延迟为 0，也会被放入宏任务队列，等待下一个事件循环周期执行。
    3.  `Promise.resolve().then(() => { console.log('promise1'); })`：`Promise.resolve()` 会立即变为 resolved 状态。其后的 `.then` 回调是微任务，被放入微任务队列。
    4.  `.then(() => { console.log('promise2'); })`：这个 `.then` 是前一个 `.then` 的链式调用，它会在前一个微任务执行完毕后，作为一个新的微任务被放入微任务队列。
    5.  `console.log('end')`：同步任务，立即执行，输出 `end`。
    6.  **主线程同步代码执行完毕**。此时微任务队列中有 `promise1` 的回调和 `promise2` 的回调，宏任务队列中有 `setTimeout` 的回调。
    7.  **清空微任务队列**：首先执行 `promise1` 的回调，输出 `promise1`。然后 `promise1` 的回调返回的 Promise 被 resolved，触发 `promise2` 的回调进入微任务队列并立即执行（因为当前仍在清空微任务队列），输出 `promise2`。
    8.  **清空微任务队列完毕**。此时事件循环从宏任务队列中取出一个任务（即 `setTimeout` 的回调）执行，输出 `setTimeout`。

- **如果将 `setTimeout` 的回调函数中的内容改为多个 `then` 回调，输出结果会有什么变化？**
    原代码：
    ```javascript
    console.log('start');
    setTimeout(() => {
        console.log('setTimeout'); // 单个宏任务回调
    }, 0);
    Promise.resolve().then(() => {
        console.log('promise1');
    }).then(() => {
        console.log('promise2');
    });
    console.log('end');
    ```

    修改后：将 `setTimeout` 的回调改为多个 `then` 回调。这实际上是将宏任务内部转换为一系列微任务。这需要构造一个 Promise 链。例如：
    ```javascript
    console.log('start');
    setTimeout(() => {
        // setTimeout 内部的宏任务，现在它又调度了微任务
        Promise.resolve().then(() => {
            console.log('setTimeout-promise1');
        }).then(() => {
            console.log('setTimeout-promise2');
        });
    }, 0);
    Promise.resolve().then(() => {
        console.log('promise1');
    }).then(() => {
        console.log('promise2');
    });
    console.log('end');
    ```

    **输出结果**：
    ```
    start
    end
    promise1
    promise2
    setTimeout-promise1
    setTimeout-promise2
    ```

    **解释**：
    1.  `start` 和 `end` 同步执行，先输出 `start`，再输出 `end`。
    2.  第一个 `Promise.resolve().then(...).then(...)` 的微任务链（`promise1`, `promise2`）会在当前宏任务（即主线程同步代码）执行完毕后立即执行。
    3.  `setTimeout` 的回调仍然是一个宏任务，它会等待当前的微任务队列清空后，在下一个事件循环周期中被执行。
    4.  当 `setTimeout` 的宏任务被执行时，它内部又创建了一个 `Promise.resolve().then(...).then(...)` 的微任务链（`setTimeout-promise1`, `setTimeout-promise2`）。
    5.  这个新创建的微任务链会在 `setTimeout` 这个宏任务执行完毕后，立即被清空执行。因此，`setTimeout-promise1` 会在 `setTimeout-promise2` 之前输出。

    **总结变化**：`setTimeout` 内部的 `then` 回调虽然是微任务，但它们是在 `setTimeout` 这个宏任务被执行之后才进入微任务队列的。因此，它们会在主 Promise 链的微任务全部执行完毕之后，才会被执行。核心仍然是：**在一个宏任务执行完毕后，会清空当前所有微任务，再执行下一个宏任务。**

1.3 常见误区或面试陷阱

- **误区一：混淆宏任务和微任务的执行时机**：
    很多面试者不清楚在一个事件循环周期内，微任务是优先于下一个宏任务执行的。错误的认为 `setTimeout` 只要设置为 `0` 就会立即执行，或者 `Promise.then` 会比 `setTimeout` 后执行。理解"当前宏任务执行完后立即清空微任务队列"是关键。

- **误区二：认为 `Promise` 的回调都是异步的**：
    `Promise` 的构造函数是同步执行的，但其 `.then`、`.catch`、`.finally` 等回调是异步的微任务。面试官可能会通过 `new Promise()` 内部的 `console.log` 来考察你对这点的理解。
    ```javascript
    console.log(1);
    new Promise(resolve => {
        console.log(2);
        resolve();
    }).then(() => {
        console.log(3);
    });
    console.log(4);
    // 输出：1, 2, 4, 3
    ```

- **误区三：不了解 `process.nextTick` (Node.js) 的优先级**：
    在 Node.js 环境中，`process.nextTick` 的优先级比 `Promise.then` 的微任务更高。它会在当前事件循环的"立即"阶段执行，早于其他所有微任务。如果面试环境是 Node.js，这可能是一个陷阱。

- **面试陷阱：`async/await` 的执行顺序**：
    `async/await` 是基于 Promise 和 Generator 实现的语法糖。`await` 关键字会暂停 `async` 函数的执行，并等待 Promise 解析。`await` 后面的代码会被放入微任务队列。面试官可能会用 `async/await` 结合 `setTimeout` 或 `Promise` 来考察你对事件循环更复杂的理解。

- **面试陷阱：DOM 渲染与事件循环**：
    DOM 渲染（UI rendering）也是一个宏任务。通常，浏览器会在一个宏任务执行完毕，并且微任务队列清空后，才进行一次渲染。理解这一点对于避免页面卡顿（如频繁修改 DOM 导致多次重排重绘）很重要。面试官可能会问到 `requestAnimationFrame` 的作用以及它与事件循环的关系。

</details>

## 17. 给定一个二叉树 root ，返回其最大深度。 {#question-subjective-c4c816b6bfc8}

### 题目要点

- **二叉树基础**：考察面试者对二叉树基本概念的理解，包括节点、根节点、叶子节点等。
- **深度优先搜索 (DFS) 或广度优先搜索 (BFS)**：面试官想确认面试者能否运用这两种常见的图/树遍历算法来解决问题。
- **递归与迭代**：考察面试者对递归思想的掌握，以及能否将递归解决方案转换为迭代解决方案。
- **问题分解与边界条件**：考察面试者如何将复杂问题分解为子问题，并考虑空树、单节点树等边界情况。

<details>
<summary>参考答案</summary>

1.1 原理说明

求解二叉树的最大深度，本质上是找到从根节点到任意叶子节点的最长路径上的节点数量。这是一个经典的二叉树遍历问题，可以通过**深度优先搜索 (DFS)** 或**广度优先搜索 (BFS)** 来解决。

- **DFS 思想**：
    DFS 策略会尽可能深地探索树的每个分支。对于最大深度问题，DFS 的核心思想是递归。一个节点的深度等于其子树的最大深度加一。因此，我们可以通过递归地计算左子树和右子树的最大深度，然后取两者中的较大值，再加上当前节点本身（深度加一），就是当前树的最大深度。当遇到空节点时，深度为 0。

- **BFS 思想**：
    BFS 策略会逐层探索树的节点。对于最大深度问题，BFS 的核心思想是层序遍历。我们可以从根节点开始，一层一层地遍历树。每遍历完一层，深度就加一。当遍历到最后一层（所有叶子节点都在这一层被访问到）时，当前的层数就是最大深度。

1.2 核心用法 + 示例代码

这里提供两种常见的实现方式：递归 (DFS) 和迭代 (BFS)。

- **方法一：深度优先搜索 (DFS) - 递归实现**

    - **核心思想**：对于任意节点，其最大深度等于其左右子树的最大深度中的较大值加 1。递归的终止条件是当前节点为 `null`，此时深度为 0。
    - **示例代码**：
        ```javascript
        /**
         * Definition for a binary tree node.
         * function TreeNode(val, left, right) {
         *     this.val = (val===undefined ? 0 : val)
         *     this.left = (left===undefined ? null : left)
         *     this.right = (right===undefined ? null : right)
         * }
         */
        /**
         * @param {TreeNode} root
         * @return {number}
         */
        function maxDepth(root) {
            // 边界条件：如果当前节点为空，则深度为 0
            if (root === null) {
                return 0;
            }

            // 递归计算左子树的最大深度
            let leftDepth = maxDepth(root.left);
            // 递归计算右子树的最大深度
            let rightDepth = maxDepth(root.right);

            // 当前树的最大深度是左右子树最大深度中的较大值 + 1 (当前节点)
            return Math.max(leftDepth, rightDepth) + 1;
        }

        // 示例用法（题目示例）
        // 构造二叉树: [3,9,20,null,null,15,7]
        // 注意：这里需要一个辅助函数来构造二叉树，或者手动创建节点
        class TreeNode {
            constructor(val, left = null, right = null) {
                this.val = val;
                this.left = left;
                this.right = right;
            }
        }

        // 手动构造题目中的二叉树
        const root = new TreeNode(3);
        root.left = new TreeNode(9);
        root.right = new TreeNode(20);
        root.right.left = new TreeNode(15);
        root.right.right = new TreeNode(7);

</details>

---

← 已是第一轮 · [返回本次面经]({{< relref "/posts/frontend/interview-experiences/experience-74/_index.md" >}}) · 已是最后一轮 →
