+++
title = "包瘦身-分析工具"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 33
tags = ["iOS", "性能优化", "包瘦身"]
categories = ["iOS开发", "性能优化"]
+++
在进行包体积优化之前，首先需要了解如何分析包体积。本文介绍常用的分析工具和Mach-O文件结构。

---

## 查看IPA构成

解压IPA文件分析各部分大小：

```bash
# 解压IPA
unzip -q YourApp.ipa -d ./ipa_content

# 查看各文件大小
find ./ipa_content -type f -exec ls -lh {} \; | sort -k5 -h -r | head -20
```

---

## LinkMap分析

LinkMap文件记录了链接器生成可执行文件的详细信息，可以精确分析二进制大小：

```
# Build Settings中设置
Write Link Map File = YES
Path to Link Map File = $(TARGET_TEMP_DIR)/$(PRODUCT_NAME)-LinkMap-$(CURRENT_VARIANT)-$(CURRENT_ARCH).txt
```

### LinkMap文件结构

```
# Path: /path/to/YourApp
# Arch: arm64

# Object files:
[  0] linker synthesized
[  1] /path/to/ViewController.o
[  2] /path/to/Model.o

# Sections:
# Address   Size        Segment Section
0x100001000 0x00012345  __TEXT  __text
0x100013345 0x00001234  __TEXT  __stubs

# Symbols:
# Address   Size        File  Name
0x100001000 0x00000100  [  1] -[ViewController viewDidLoad]
0x100001100 0x00000050  [  2] -[Model init]
```

### 解析脚本

可以使用脚本解析LinkMap统计各模块大小：

```python
import re
from collections import defaultdict

def parse_linkmap(filepath):
    object_files = {}
    symbols_size = defaultdict(int)
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 解析Object files
    obj_pattern = r'\[\s*(\d+)\]\s+(.+)'
    for match in re.finditer(obj_pattern, content):
        index = int(match.group(1))
        path = match.group(2)
        object_files[index] = path
    
    # 解析Symbols
    sym_pattern = r'0x[0-9A-Fa-f]+\s+(0x[0-9A-Fa-f]+)\s+\[\s*(\d+)\]'
    for match in re.finditer(sym_pattern, content):
        size = int(match.group(1), 16)
        file_index = int(match.group(2))
        if file_index in object_files:
            symbols_size[object_files[file_index]] += size
    
    # 按大小排序输出
    sorted_sizes = sorted(symbols_size.items(), key=lambda x: x[1], reverse=True)
    for path, size in sorted_sizes[:20]:
        print(f"{size/1024:.2f} KB - {path}")

parse_linkmap('YourApp-LinkMap.txt')
```

---

## 第三方工具

### 常用工具

- **Emerge Tools**：提供包体积分析和优化建议
- **bloaty**：Google开源的二进制分析工具
- **size**：macOS自带的二进制大小分析工具

```bash
# 使用size命令
size -m YourApp.app/YourApp
```

### WBBlades

[WBBlades](https://github.com/wuba/WBBlades) 是58同城开源的基于Mach-O的综合分析工具，提供多种包体积分析能力。

**主要功能**：

| 功能 | 说明 |
|-----|-----|
| 无用类检测 | 支持ObjC和Swift，分析Mach-O中的类引用关系 |
| 无用协议检测 | 检测未被实现或引用的协议 |
| 无用资源检测 | 检测未使用的图片等资源文件 |
| 包大小分析 | 分析各模块对包体积的贡献 |
| 崩溃解析 | 支持dSYM符号化和GPT辅助分析 |

**工作原理**：

WBBlades通过解析Mach-O文件结构，分析以下关键Section：

```
__DATA.__objc_classlist  → 所有定义的ObjC类
__DATA.__objc_classrefs  → 所有被引用的ObjC类
__DATA.__objc_selrefs    → 所有被引用的方法选择器
__DATA.__objc_protolist  → 所有定义的协议
```

通过对比定义和引用，找出未使用的类、方法和协议。

**特点**：

- 支持ObjC和Swift混编项目
- 提供GUI应用和命令行工具
- 无需源码，直接分析二进制文件
- 支持静态库（.a）和动态库（.dylib/.framework）分析

### APPAnalyze

[APPAnalyze](https://github.com/helele90/APPAnalyze) 是京东云技术团队开发的iOS应用包分析工具。

**主要功能**：

| 功能 | 说明 |
|-----|-----|
| 未使用类检测 | 支持ObjC，Swift需开启配置 |
| 未使用方法检测 | 检测ObjC未使用的方法 |
| 未使用属性检测 | 检测ObjC未使用的属性 |
| 未使用资源检测 | 检测未使用的imageset和其他资源 |
| 大资源检测 | 检测超过指定大小的资源文件 |
| +load方法检测 | 检测调用+load方法的类 |
| 包体积数据生成 | 生成各模块的包体积数据报告 |

**使用方式**：

```bash
# 基础使用
/Users/Test/APPAnalyzeCommand -ipa /path/to/YourApp.app --output /path/to/output

# 使用配置文件
/Users/Test/APPAnalyzeCommand -ipa /path/to/YourApp.app -config /path/to/config.json --output /path/to/output
```

**特点**：

- 支持组件化工程扫描，细化到每个模块的包体积问题
- 可配置的检测规则，支持过滤和自定义
- 误报率低，扫描质量高
- 可集成到CI流水线自动发现问题

### MachOView

[MachOView](https://github.com/gdbinit/MachOView) 是一款用于查看和分析Mach-O文件结构的可视化工具。

**主要功能**：

- 可视化展示Mach-O文件的完整结构
- 查看Header、Load Commands、Segments、Sections等
- 分析符号表、字符串表等内容
- 帮助开发者深入理解二进制文件组成

### Asset Catalog Tinkerer

[Asset Catalog Tinkerer](https://github.com/insidegui/AssetCatalogTinkerer) 用于查看和提取Xcode资产目录（Assets.car）内容。

**主要功能**：

- 查看Assets.car中的所有资源
- 提取图片资源
- 分析资源占用情况
- 帮助识别冗余或过大的资源

### bloaty

[bloaty](https://github.com/google/bloaty) 是Google开源的二进制文件大小分析工具。

**主要功能**：

- 分析二进制文件各部分的大小
- 支持多种二进制格式（包括Mach-O）
- 提供详细的大小分解报告
- 支持对比两个版本的大小差异

```bash
# 安装
brew install bloaty

# 分析Mach-O文件
bloaty YourApp.app/YourApp

# 对比两个版本
bloaty new_version -- old_version
```

### Emerge Tools

[Emerge Tools](https://www.emergetools.com/) 是一个商业化的包体积分析平台，提供：

- 自动化包体积分析
- 历史趋势追踪
- PR集成，检测每次提交的体积变化
- 优化建议

### Sentry Size Analysis（Beta）

[Sentry Size Analysis](https://docs.sentry.io/platforms/apple/guides/ios/size-analysis/) 是Sentry提供的包大小分析功能（目前为Beta版本），帮助在预发布阶段监控应用体积，防止意外的体积增长影响用户。

**主要功能**：

| 功能 | 说明 |
|-----|-----|
| 包大小监控 | 追踪每次构建的安装大小变化 |
| CI集成 | 支持Fastlane插件和Sentry CLI上传 |
| 版本对比 | 自动对比当前构建与基准构建的差异 |
| Insights优化建议 | 提供具体的优化方向和预估节省空间 |

**支持的上传格式**：

- XCArchive（推荐）
- IPA

**Insights优化建议**：

Sentry的[Insights功能](https://docs.sentry.io/platforms/apple/guides/ios/size-analysis/insights/)会自动分析包内容并提供优化建议：

| Insight类型 | 检测内容 |
|------------|---------|
| Strip Debug Symbols | 检测可移除的调试符号 |
| Duplicate Files | 检测重复文件 |
| Image Optimization | 检测可优化的PNG/JPEG/HEIC图片 |
| Alternate Icon Optimization | 检测可优化的备用图标 |
| Loose Images | 检测应移入Asset Catalog的散落图片 |
| String Localization | 检测可压缩的本地化字符串 |
| Main Binary Export Metadata | 检测可移除的导出符号信息 |

---

## Mach-O文件结构

理解Mach-O文件结构是进行二进制优化的基础。Mach-O（Mach Object）是macOS/iOS上的可执行文件格式。

> 更详细的Mach-O介绍请参考：[Mach-O的链接、装载与库]({{< relref "/posts/interview/ios-basics/Mach-O的链接-装载与库" >}})

### 基本结构

```
┌─────────────────────────────┐
│         Header              │  ← 文件类型、CPU架构、Load Commands数量
├─────────────────────────────┤
│      Load Commands          │  ← 描述各Segment的位置和大小
├─────────────────────────────┤
│       __PAGEZERO            │  ← 空指针陷阱区（不占文件空间）
├─────────────────────────────┤
│         __TEXT              │  ← 代码段（只读、可执行）
│    ├── __text               │     机器码（ObjC和Swift）
│    ├── __stubs              │     符号桩
│    ├── __stub_helper        │     桩辅助代码
│    ├── __cstring            │     C字符串常量
│    ├── __objc_methname      │     ObjC方法名
│    ├── __swift5_typeref     │     Swift类型引用字符串
│    └── __swift5_reflstr     │     Swift反射字符串
├─────────────────────────────┤
│      __DATA_CONST           │  ← 运行时常量（iOS 13+）
│    ├── __got                │     非延迟绑定符号指针
│    ├── __objc_classlist     │     ObjC类列表
│    ├── __objc_protolist     │     ObjC协议列表
│    ├── __swift5_proto       │     Swift协议描述符
│    └── __swift5_types       │     Swift类型描述符
├─────────────────────────────┤
│         __DATA              │  ← 数据段（可读写）
│    ├── __la_symbol_ptr      │     延迟绑定符号指针
│    ├── __objc_classrefs     │     ObjC类引用
│    ├── __objc_selrefs       │     ObjC方法选择器引用
│    ├── __data               │     初始化的全局变量
│    └── __swift5_fieldmd     │     Swift字段元数据
├─────────────────────────────┤
│       __LINKEDIT            │  ← 链接信息
│    ├── Symbol Table         │     符号表
│    ├── String Table         │     字符串表
│    └── Code Signature       │     代码签名
└─────────────────────────────┘
```

**iOS 13+的__DATA段拆分**：

iOS 13之前，`__DATA`段混合了"启动后不再修改的数据"和"运行时会修改的数据"。iOS 13+将其拆分为：

- `__DATA_CONST`：启动时写入，之后变为只读，可在多进程间共享
- `__DATA`：运行时可能修改的数据
- `__DATA_DIRTY`：一定会被写入的数据，单独分页以优化COW

### 各段对包体积的影响

**ObjC相关Section**：

| Segment/Section | 内容 | 优化方向 |
|-----------------|-----|---------|
| `__TEXT.__text` | 编译后的机器码 | 编译器优化、删除无用代码 |
| `__TEXT.__cstring` | C字符串常量 | 减少字符串使用、去重 |
| `__TEXT.__objc_methname` | ObjC方法名 | 减少方法数量 |
| `__DATA.__objc_classlist` | ObjC类定义 | 减少类数量 |
| `__DATA.__objc_const` | ObjC常量（方法列表等） | 减少方法、属性数量 |
| `__LINKEDIT` | 符号表、签名 | Strip符号 |

**Swift相关Section**：

Swift 5引入了稳定的ABI，其元数据存储在以`__swift5_`开头的Section中：

| Segment/Section | 内容 | 说明 |
|-----------------|-----|-----|
| `__TEXT.__swift5_typeref` | 类型引用字符串 | 类型名称的mangled字符串 |
| `__TEXT.__swift5_reflstr` | 反射字符串 | 属性名、枚举case名等 |
| `__DATA_CONST.__swift5_proto` | 协议描述符 | Swift协议的元数据 |
| `__DATA_CONST.__swift5_types` | 类型描述符 | struct/class/enum的元数据 |
| `__DATA.__swift5_fieldmd` | 字段元数据 | 属性的类型和偏移信息 |
| `__DATA.__swift5_assocty` | 关联类型 | 协议关联类型信息 |
| `__DATA.__swift5_protos` | 协议一致性 | 类型遵循协议的记录 |

**Swift元数据的体积影响**：

Swift的反射和泛型特性需要大量元数据支持，这些Section可能占用较多空间。优化方向：

- 减少public类型和属性（减少导出的元数据）
- 使用`@frozen`标记不会改变的struct（减少运行时元数据）
- 避免过度使用泛型（减少类型特化产生的代码膨胀）

### 查看Mach-O文件类型

```bash
# 查看文件类型
$ file YourApp.app/YourApp
Mach-O 64-bit executable arm64

# 常见的Mach-O类型
MH_EXECUTE    # 可执行文件（App的主二进制）
MH_DYLIB      # 动态库（.dylib, .framework）
MH_OBJECT     # 目标文件（.o，静态库中的单元）
MH_BUNDLE     # Bundle（插件）
```

### 查看各段大小

可以使用`size`命令查看各段大小：

```bash
size -l -m YourApp.app/YourApp

# 输出示例：
# Segment __TEXT: 12582912 (vmaddr 0x100000000 fileoff 0)
#     Section __text: 8234567
#     Section __stubs: 12345
#     Section __objc_methname: 234567
# Segment __DATA: 2097152
#     Section __objc_classlist: 12345
#     ...
```

### 使用otool查看详细信息

```bash
# 查看Mach-O头信息
otool -h YourApp

# 查看Load Commands
otool -l YourApp

# 查看ObjC类列表
otool -v -s __DATA __objc_classlist YourApp

# 查看ObjC类引用
otool -v -s __DATA __objc_classrefs YourApp

# 查看selector引用
otool -v -s __DATA __objc_selrefs YourApp
```

### 使用nm查看符号

```bash
# 查看所有符号
nm YourApp

# 只查看未定义符号（外部依赖）
nm -U YourApp

# 查看已定义符号（排除未定义项）
nm YourApp | grep -v " U "

# 查看ObjC类符号
nm YourApp | grep "_OBJC_CLASS_\\$" | grep -v " U "
```
