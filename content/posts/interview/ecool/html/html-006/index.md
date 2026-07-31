+++
title = "表单控件"
date = '2024-09-25T00:00:00+08:00'
lastmod = '2024-11-06T00:00:00+08:00'
draft = true
weight = 6
tags = ["面试", "前端", "HTML", "表单控件", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 01、`<form>`表单

表单是比较重要的HTML元素，主要作用是向服务端提交数据。比如结合表单元素`input`使用，通过内部的`button`按钮提交（type="submit"）表单数据。

| **元素/属性** | **描述** | **值/备注** |
| --- | --- | --- |
| `<form>` | 表单元素 |  |
|  **action** | 提交表单的目标（服务端）地址url |  |
|  **method** | 提交数据的方式，就是数据传输的方式 | **get**：通过URL提交数据 `url?uname=1&age=2`；**post**，通过HTTP表单数据提交，键值格式。 |
|  **target** | 提交数据时打开action url的方式 | **_self**：当前窗口（默认值）；**_blank**：新窗口 |
|  enctype | 编码类型（encode type），规定了form表单在发送到服务器时候编码方式，不常用。 | **application/x-www-form-urlencoded**：编码所有字符（默认）；**multipart/form-data** ：混合类型， 表单中有文件上传时使用；**text/plain**：纯文体，空格转换为 “+” 加号，不对特殊字符编码 |
| submit() | 提交表单数据，通过js代码调用 |  |
| `<fieldset>` | 表单分组，默认样式：一个框 | 便于表单样式管理的语义化元素 |
|  form | from的id，当`<fieldset>`不在form中时 |  |
|  disabled | 整个分组都不可用 |  |
| `<legend>` | 作为`<fieldset>`的标题，显示在框上 | （legend /ˈledʒənd/ 铭文、图例） |

```html
<style>
    #form fieldset {
        border: 1px solid skyblue;
        padding: 20px 10px;
        border-radius: 5px;
        text-align: center;
        margin: 10px 0px;
    }
    #form fieldset legend {
        font-size: 1em;
        border: 1px solid rgb(236, 175, 43);
        border-radius: 1em;
        padding: 3px 15px;
    }
</style>
<form id="form" action="#" target="_self" method="post">
    <fieldset>
        <legend>登录</legend>
        <input type="text" name="uname" placeholder="请输入用户名" required maxlength="36">
        <input type="password" name="upwd" required maxlength="12" placeholder="输入密码">
        <input type="submit" value="submit-登录">
    </fieldset>
</form>
```

> **📢注意：**`<form>`提交数据时参数名为表单元素的name，因此表单控件须设置name属性。

### ❓get、post区别：

|  | **GET** | **POST** |
| --- | --- | --- |
| **提交方式** | 数据在url的问号`?`后：`url?key=value&key=...` | 数据在请求体中 |
| **编码**enctype | 只有appliacation-x-www-form-urlencoded | 支持多种 |
| **书签/历史** | 可以加入收藏，历史记录、日志会保留数据 | 不可收藏、不会保留数据 |
| **缓存/效率** | 可以被浏览器缓存，效率（速度）更高 | 不可缓存 |
| **数据类型/长度** | 只允许 ASCII 字符，URL长度有限制（2048），不同浏览器不同。 | 类型没有限制，支持二进制数据。长度（几乎）无限制 |
| **安全性** | 安全性更低，数据在URL中容易暴露 | 安全性稍高，不过传输过程也是明文的，不会在浏览记录、日志中存储 |
| **回退/刷新？** | 无副作用（幂等），可重复访问 | 有副作用，数据会被重新提交（不幂等），浏览器一般会提示用户数据会被重新提交 |
| **使用场景** | 获取数据 | 提交数据：添加、修改、删除 |

> **📢因此**：
>
> - 数据有安全性要求的时候，建议用POST并且加密（HTTPS）。
> - **获取数据**（如查询）的的时候，一般用GET；**提交数据**（添加、修改、删除）时一般用POST。

---

## 02、`<input>`表单元素

表单元素 `<input>` 单标签、行内元素，主要用于输入各种类型数据。包含多个表单类型`type`：文本框、复选框、单选框、按钮等。

## input.type

| **input.type/** 属性 | **描述** | **备注** |
| --- | --- | --- |
| text | **文本输入框**（默认），单行文本，不支持换行 | `<input type="text">` |
| password | **密码输入框** |  |
| radio | **单选框**，相同name为一组互斥 | 记得赋值value |
| checkbox | **多选框**，相同name为一组。如选中多个值会提交多个key-value | 记得赋值value |
| number | 数字输入，`step`设置步长 |  |
| hidden | **隐藏框/域**，页面不可见，用于一些逻辑处理 |  |
| button | **普通按钮**，按钮显示`value`值，结合JavaScript事件使用 `<input type="button" value="提交" onclick="">` | 建议用`<button>`元素代替 |
| submit | **表单提交按钮**，在form中有效，直接提交表单数据 | 同`<button>`元素的`submit`模式 |
| reset | **表单重置按钮**，重置表单的数据，form中有效。 |  |
| image | **图片提交按钮**，同submit，**`src`** 设置图片，无图则显示`alt` | height、width设置图片大小 |
| file | **文件选择框**，如多值则value为第一个值，js获取files取多个值 | capture媒体拍摄方式-移动端 |
| accept | 可接受文件类型，多个逗号隔开，`image/png, video/*` | `.jpg,.png,.doc` |
| email | **电子邮箱**，支持邮箱格式验证 | 验证邮箱格式 |
| range | **滑块数字**，用 min 和 max 来设置值的范围，step设置步长 | `list`可设置刻度 |
| search | **搜索框**，和`text`差不多 |  |
| tel | **电话号码**，和`text`差不多，有些终端支持虚拟键盘 | 不验证（不同地区格式不同） |
| url | **URL地址**，和`text`差不多 | 验证url格式 |
| color | **颜色输入控件** |  |
| date | **日期输入**，年月日 |  |
| datetime-local | **日期时间输入**，年月日、时分秒，Chrome/Opera /Edge支持 | yyyy-MM-ddThh:mm |
| month | **年月输入**，输入年份或月份 | `value="2018-05"` |
| time | 时间控件，小时、分 |  |
| week | **年和周数**，用于输入以年和周数组成的日期，支持的不多 |  |

> **📢注意**：
>
> - 一般浏览器对不支持的type，都默认降级为**text**。
> - **文件选择框**如通过表单提交，表单需设置属性`enctype="multipart/form-data"`设置表单数据编码为多种数据组合，同时设置提交方式为post，才可以上传文件（二进制）。

### `<input>` 的常规属性

| **基础属性** | **描述** | **相关type** | **值/备注** |
| --- | --- | --- | --- |
| **name** | **控件名称**（通用属性），表单中须赋值，会作为参数名 |  |  |
| **type** | **表单控件类型** |  |  |
| 详见上表 |  |  |  |
| **value** | `<input>`的值，可设置默认值。 |  |  |
| tabindex | 当前文档的 Tab 导航顺序中的位置 |  |  |
| size | **宽度**，文本框可显示的**字符**宽度，类似css的width |  | 字符数量 |
| min/maxlength | **可输入字符数量**，文本框可输入最少/大字符数量 | 文本输入类 |  |
| readonly | **只读**，不可编辑，IE有光标显示 |  | `true`值可省略 |
| disabled | **不可用**，无光标 |  | 值可省略 |
| **placeholder** | **占位符**/水印，用于输入提示，比较常用 | 文本输入类 |  |
| **checked** | **选中状态** | 单选、多选 | 值可省略 |
| min/max | **最大/小值**，数字、日期值的边界 | 数字、日期 | 大小边界验证 |
| pattern，IE10 | **模式**（正则表达式），用于值的合法性检测 | 文本输入类 | 正则验证 |
| required | **必填**，hidden、image 或者按钮类型无效 |  | 值可省略，必填验证 |
| multiple | 是否**允许多个值**，逗号隔开 | email、file | 布尔值，值可省略 |
| step | **步长**，数字、日期 | 数字、日期 |  |
| list | **候选值**：输入框的候选值列表，`<datalist>`值，显示value | 大多数 |  |
| autocomplete | **自动填充**，设置浏览器的自动填充模式 | 大多数 |  |
| autofocus | 页面加载时**自动聚焦** |  | 布尔值，值可省略 |
| inputmode | **值输入模式**，虚拟键盘，text, tel, url, email, numeric | 文本输入类 |  |
| form | 所属form，值为其id |  |  |
| formaction | 表单提交属性，还有formenctype、formmethod、formnovalidate、formtarget | image、submit |  |

### `<datalist>`数据集合

`<datalist>` 数据集合元素，包含了一组`<option>`元素，提供给文本类`<input>`（`list`属性）使用，作为可选值的数据集。

- 文本、数字输入的候选值，包括text、number、email、url、tel、search等。
- `range`的刻度。

## 03、`<textarea>`多行文本

`<textarea>` 可以输入多行文本，支持换行、空格，行内元素。

| **属性** | **描述** | **值** |
| --- | --- | --- |
| name | 表单提交数据的key |  |
| rows | 文本行数，同css样式的高度 | 整数 |
| cols | 文本列数，同css样式的宽度 | 整数 |

> **`<textarea>`** 还可以使用 `<input>` 中的一些常见属性，如autocomplete、autofocus、disabled、placeholder、readonly，和 required、maxlength等。可使用css样式属性`resize`设置输入框的大小调整方式。

## 04、`<label>` 辅助表单聚焦

`<label>` 是一个文本标签，最主要的使命是辅助表单元素聚焦，点击<label>会让其`for`关联的元素得到焦点，`for`属性值所指的元素`id`就是她的服务客户。因此<label>是表单控件的最佳搭档，点击`label`=等于点击对应元素。<label>是一个双标签，里可以嵌套其他行内元素，如文字、图片、表单元素。

| **属性** | **描述** |
| --- | --- |
| for | 关联的元素id |
| form | `<form>`的id，可以将`<label>`放到form外面了，这就很自由了！ |

```html
<p>
    <label for="uname">
        <span>Name:</span>
        <input id="uname" type="text" name="uname">
        <span title="required">*</span>
    </label>
</p>
<div>
    <label for="username">Name: <span title="required">*</span></label>
    <input id="username" type="text" name="username">
</div>
<label>
    <input type="checkbox" />阅读并同意条款<img src="../res/head-48.gif" width="24px">
</label>
```

> **⭐还有一种简写的方式**：用 label 元素把 input 元素包裹起来，以减少for- id 的使用。

---

## 05、`<button>`按钮

`<button>` 是HTML5的新元素，行内元素，作用和`input-button`的功能基本相同。不同的是他是`双标签`，内部可以自由定义内容，也可以使用伪元素，实现更丰富的按钮效果，所以按钮用他就对了。

| **属性** | **描述** | **值** |
| --- | --- | --- |
| **type** | 按钮的类型 | **button**：普通按钮；**submit**：表单提交按钮；**reset**：表单重置按钮； |
| value | button 的初始值，参数的形式随表单提交 |  |

```html
<button type="button">普通按钮</button>
<button type="submit">提交submit</button>
<button type="reset" style="width:80px;"><img src="../res/sk (13).png"><br/>重置</button>
```

### `<button>`**和**`<input button>`**的区别？**

- `<input>`是单标签，无关闭标签。
- `<button>`的显示内容在标签之间，应用场景更丰富；`<input>`的显示内容在`value`属性上，只支持纯文本。
- `<button>`的鼠标事件里可以直接写代码。

## 06、 `<select/option>`选项

`<select>`选择列表元素，行内元素，有弹出下拉框、选项列表两种模式，`<option>`是他的选项子元素。启用`multiple`或`size>1`时，显示为列表，否则显示为下拉框模式。

| **元素/属性** | **描述** | **值/备注** |
| --- | --- | --- |
| **`<select>`** | 选项控件 |  |
|  required | 必填，表单的通用属性，还有disabled、autofocus、form等 |  |
|  multiple | 多选，显示为列表，不设置该属性则弹出下拉框。 | 值也是multiple，值可省略 |
|  size | 控件显示的选项行数，配合multiple使用 | 整数，默认1 |
|  value/selectedIndex | 选中的值/索引 |  |
| `<option>` | `<select>`的选项子元素 |  |
|  selected | 设置选中 | 值可省略 |
|  value | 选项的值 | 如果没有value，则取标签内容 |
|  disabled | 不可用 |  |
| `<optgroup>` | 选项分组，给`<option>`分组 |  |
|  label | 显示的文本 |  |
|  disabled | 分组都禁用 |  |

```html
<form action="">
    多选multiple：
    <select id="selfruit" name="selfruit" multiple size="4" list="optfruit">
        <optgroup label="热带水果">
            <option value="1">香蕉</option>
            <option value="2">火龙果</option>
        </optgroup>
        <optgroup label="蔬菜">
            <option value="3">绿色蔬菜</option>
            <option value="4">冬瓜</option>
            <option value="4" disabled>男瓜</option>
        </optgroup>
        <option value="5">其他</option>
    </select>
    单选：
    <select name="selsex" size="0" required>
        <option value="" selected>选择性别</option>
        <option value="1">男</option>
        <option value="2">女</option>
        <option value="5">其他</option>
    </select>
    <input type="submit">
</form>
```

## 07、`<progress><meter>`进度计量

两者都可以实现进度的效果，`<progress>`为进度条元素。`<meter>`更为丰富，表示某种计量，适用于温度、重量、金额等量化的可视化展示。

| **属性** | **描述** |
| --- | --- |
| `<progress>` | **进度条** |
|  max | **最大值**，默认为1 |
|  value | **进度值**，不设置则为"不确定"状态，显示为加载中的效果（不同浏览器表现不同） |
| `<meter>` | **进度计量**，显示已知范围的标量值或者分数值。（/ˈmiːtər/ 计量） |
|  value | 值 |
|  min/max | 最小值（默认0），最大值（默认1） |
|  low/high | 低值、高值，用于设置“正常值”的边界区域，以显示不同效果 |
|  optimum | 最优值（ /ˈɑːptɪməm/ ），配合low/high使用，判断当前值是否最优 |
|  form | 关联form表单的id |

```html
<fieldset style="display:inline-block;">
    <legend>Progress</legend>
    progress：<progress value="0.3"></progress><br>
    progress(无value)： <progress></progress><br>
    value溢出： <progress max="100" value="120"></progress>
</fieldset>
<fieldset style="display:inline-block;">
    <legend>Meter</legend>
    普通进度：<meter value="0.2"></meter><br>
    value小于low：<meter value="10" max="60" min="0" optimum="26" low="20" high="30"></meter><br>
    value大于high：<meter value="55" max="60" min="0" optimum="15" low="20" high="30"></meter><br>
    value居中<meter value="25" max="60" min="0" optimum="26" low="20" high="30"></meter>
</fieldset>
```

## 08、表单布局

表单是前端常用的组件，布局必不可少，一个美观、简介的布局尤为重要。一个最小单位的表单输入部件，除了表单元素，还必须考虑标题、错误提示等。对于整个表单还要考虑多个表单输入项的行列排列、对齐。

最基本的HTML表单布局思路：

- **小部件**：用`<div>`或`<p>`包装一个最小的部件，里面包含`<label>`表单项标题、`<input>`、`<span>`提示信息。

```html
<div>
  <label for="uname">姓名：</label>		<!-- 标签 -->
  <input type="text" name="uname" required maxlength="20">	<!-- 表单元素 -->
  <span title="必填">*</span>					 <!-- 作为额外提示，包括输入验证错误的提示信息 -->
</div>
```

- **表单分区**，对于复杂的表单，用`<fieldset>`、标题`<h*>`、分段`<section>`等来分区组织不同类型的内容。
- **表单布局**：借助CSS表格布局、Grid、Flex等工具进行布局。
- **第三方表单组件**：实际项目中都会引入第三方UI组件库，组件库里都会提供更丰富的布局支持。

## 常见考点

1.  **新表单元素**：<br>
  - 了解 HTML5 新增的表单控件类型，如 `date`、`email`、`url`、`tel`、`range`、`color` 等。
2.  **属性与验证**：<br>
  - 讨论表单元素的新属性，例如 `placeholder`、`required`、`pattern`、`min`、`max` 等及其作用。
3.  **自定义验证**：<br>
  - 理解如何使用 JavaScript 自定义表单验证，并处理验证错误。
4.  **表单提交与处理**：<br>
  - 讨论表单的提交方式（GET vs POST），以及如何通过 AJAX 处理表单数据。
5.  **可访问性**：<br>
  - 了解如何提高表单的可访问性，例如使用标签和 ARIA 属性。
6.  **跨浏览器兼容性**：<br>
  - 讨论不同浏览器对新表单控件的支持情况及可能的兼容性问题。
