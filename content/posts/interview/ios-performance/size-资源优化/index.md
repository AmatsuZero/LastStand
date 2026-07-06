+++
title = "包瘦身-资源优化"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 35
tags = ["iOS", "性能优化", "包瘦身"]
categories = ["iOS开发", "性能优化"]
+++
资源文件通常占iOS应用包体积的40-60%，是优化的重要方向。本文介绍各种资源优化手段及其原理。

---

## 图片优化

### Asset Catalog原理

Asset Catalog（`.xcassets`）编译后生成`Assets.car`文件，这是一个优化过的资源容器：

```
编译前：
Images.xcassets/
├── AppIcon.appiconset/
│   ├── icon-60@2x.png
│   └── icon-60@3x.png
├── Logo.imageset/
│   ├── logo@2x.png
│   └── logo@3x.png
└── Contents.json

编译后：
Assets.car  ← 单一文件，包含所有资源
```

**Assets.car的优化**：

- 图片被重新编码，使用更高效的压缩
- 支持App Thinning，按设备分发
- 运行时高效加载（内存映射）

可以使用`assetutil`查看Assets.car内容：

```bash
assetutil --info Assets.car
```

### 图片压缩原理

**PNG压缩原理**：

PNG使用DEFLATE无损压缩，但可以通过以下方式减小体积：

```
原始PNG结构：
┌────────────────┐
│ PNG Header     │
├────────────────┤
│ IHDR (图像信息) │
├────────────────┤
│ IDAT (图像数据) │  ← 压缩的像素数据
├────────────────┤
│ 辅助chunks     │  ← 可以移除
└────────────────┘

优化方向：
1. 移除不必要的chunks（如tEXt、iTXt）
2. 优化DEFLATE压缩参数
3. 减少颜色数量（有损）
4. 使用更高效的滤波器
```

**有损压缩原理（pngquant）**：

```
24位真彩色 → 8位索引色
16,777,216种颜色 → 256种颜色

通过颜色量化算法选择最能代表原图的256种颜色
人眼对颜色变化不敏感，视觉差异很小
体积可减少60-80%
```

### 压缩工具对比

| 工具 | 特点 | 压缩率 | 使用场景 |
|-----|-----|-------|---------|
| ImageOptim | 默认无损，可选有损 | 10-30%（无损） | 通用 |
| TinyPNG | 有损压缩PNG | 60-80% | 对质量要求不高 |
| pngquant | 有损压缩PNG | 60-80% | 批量处理 |
| cwebp | 转换为WebP | 70-90% | iOS 14+ |

```bash
# 使用pngquant压缩
pngquant --quality=65-80 --ext .png --force *.png

# 转换为WebP
cwebp -q 80 input.png -o output.webp
```

### WebP格式

WebP是Google开发的图片格式，支持有损和无损压缩：

```
WebP vs PNG/JPEG：
- 无损WebP比PNG小26%
- 有损WebP比JPEG小25-34%
- 支持透明通道（比PNG小）
- 支持动画（比GIF小）
```

**iOS支持情况**：

- iOS 14+：原生支持WebP
- iOS 14以下：需要使用SDWebImage等库解码

### 矢量图原理

PDF矢量图在Asset Catalog中的处理：

```
# Asset Catalog中设置
Scales = Single Scale
Resizing = Preserve Vector Data
```

**Preserve Vector Data的作用**：

```
不勾选：
PDF → 编译时光栅化为@1x/@2x/@3x PNG → 打包

勾选：
PDF → 保留矢量数据 → 运行时按需光栅化

好处：
- 包体积更小（只有一份矢量数据）
- 支持任意缩放不失真
- 适合简单图形（图标、形状）

坏处：
- 运行时渲染有开销
- 复杂矢量图渲染慢
```

### SF Symbols

iOS 13+可以使用系统提供的SF Symbols替代自定义图标：

```swift
let image = UIImage(systemName: "star.fill")

// 支持配置
let config = UIImage.SymbolConfiguration(pointSize: 24, weight: .bold)
let image = UIImage(systemName: "star.fill", withConfiguration: config)
```

**优势**：

- 零包体积开销（系统提供）
- 自动适配Dynamic Type
- 支持多种渲染模式（单色、多色、层次）
- 4000+图标可用

---

## 音视频优化

### 音频优化

| 格式 | 特点 | 建议 |
|-----|-----|-----|
| AAC | 高压缩率，iOS原生支持 | 推荐使用 |
| MP3 | 兼容性好 | 可以使用 |
| WAV | 无压缩，体积大 | 避免使用 |

```bash
# 使用ffmpeg转换
ffmpeg -i input.wav -c:a aac -b:a 128k output.m4a
```

### 视频优化

- 使用H.265（HEVC）编码
- 降低不必要的分辨率和码率
- 考虑使用网络加载替代本地资源

```bash
# 使用ffmpeg转换为HEVC
ffmpeg -i input.mp4 -c:v libx265 -crf 28 output.mp4
```

---

## 字体优化

### 子集化字体

只保留应用中使用的字符，可以大幅减小字体文件大小：

```bash
# 使用pyftsubset（需要安装fonttools）
pip install fonttools

# 提取指定字符
pyftsubset YourFont.ttf --text-file=used_chars.txt --output-file=YourFont-subset.ttf

# 或者指定Unicode范围
pyftsubset YourFont.ttf --unicodes="U+0020-007E,U+4E00-9FFF" --output-file=YourFont-subset.ttf
```

**字体子集化流程**：

```
1. 收集应用中使用的所有字符
   - 扫描代码中的字符串
   - 扫描本地化文件
   - 考虑用户输入的可能字符

2. 生成字符列表文件

3. 使用工具生成子集字体

4. 替换原字体文件

5. 测试所有界面显示正常
```

### 使用系统字体

iOS系统提供了丰富的字体，优先使用系统字体：

```swift
// 系统字体
let font = UIFont.systemFont(ofSize: 16, weight: .medium)

// 系统字体的设计变体
let font = UIFont.systemFont(ofSize: 16, weight: .bold, width: .condensed)

// San Francisco字体（系统默认）
let font = UIFont(name: ".SF Pro Text", size: 16)
```

---

## 本地化资源优化

### 按需加载

将非核心语言资源放到服务器，按需下载：

```swift
// 使用On-Demand Resources
let request = NSBundleResourceRequest(tags: ["japanese"])
request.beginAccessingResources { error in
    // 资源加载完成
}
```

### 精简翻译

- 移除未使用的本地化字符串
- 合并重复的翻译
- 使用脚本检测未使用的key

```bash
# 查找未使用的本地化key
# 1. 提取所有定义的key
grep -r "\".*\" = \"" *.lproj/*.strings | cut -d'"' -f2 > defined_keys.txt

# 2. 在代码中搜索每个key的使用情况
while read key; do
    if ! grep -r "\"$key\"" --include="*.swift" --include="*.m" . > /dev/null; then
        echo "Unused: $key"
    fi
done < defined_keys.txt
```

---

## 资源清理

### 查找未使用的资源

```bash
# 查找未使用的图片
# 1. 列出所有图片资源
find . -name "*.png" -o -name "*.jpg" | while read file; do
    name=$(basename "$file" | sed 's/@2x//' | sed 's/@3x//' | sed 's/\.[^.]*$//')
    if ! grep -r "$name" --include="*.swift" --include="*.m" --include="*.storyboard" --include="*.xib" . > /dev/null; then
        echo "Unused: $file"
    fi
done
```

### 第三方工具

#### FengNiao

[FengNiao](https://github.com/onevcat/FengNiao) 是一个用于清理Xcode项目中未使用图片资源的命令行工具。

**工作原理**：

1. 提取资源文件名（支持imageset、jpg、png、gif、pdf等格式）
2. 使用正则表达式在代码文件中搜索资源引用（支持m、mm、swift、xib、storyboard、plist等）
3. 对比找出未被引用的资源文件

**使用方法**：

```bash
# 在项目目录下执行，扫描未使用的图片资源
fengniao

# 排除第三方库目录
fengniao --project . --exclude Carthage Pods

# 直接删除未使用资源（无需确认）
fengniao --exclude Carthage Pods --force

# 仅列出未使用资源，不删除
fengniao --list-only
```

**集成到Xcode Build Phase**：

可以在Build Phases中添加Run Script，确保每次构建时自动清理：

```bash
fengniao --exclude Carthage Pods --force
```

#### WBBlades

[WBBlades](https://github.com/wuba/WBBlades) 是58同城开源的基于Mach-O的分析工具，支持无用资源检测功能。

**资源检测功能**：

- 检测未使用的图片资源
- 支持ObjC和Swift项目
- 提供GUI界面操作

#### LSUnusedResources

[LSUnusedResources](https://github.com/tinymind/LSUnusedResources) 是一个检测未使用资源的Mac应用，提供图形化界面操作。

**特点**：

- 图形化界面，操作简单
- 支持多种资源类型检测
- 可自定义搜索规则和排除目录

#### ImageOptim

[ImageOptim](https://github.com/ImageOptim/ImageOptim) 是一款开源的图片压缩工具（默认无损，也可配置有损插件流程）。

**特点**：

- 支持PNG、JPEG、GIF等多种格式
- 默认无损压缩，不影响图片质量
- 集成多种压缩算法（如 pngcrush、zopfli；可选 pngquant 有损压缩）
- 提供Mac应用和命令行工具

```bash
# 命令行使用
/Applications/ImageOptim.app/Contents/MacOS/ImageOptim *.png
```

#### Asset Catalog Tinkerer

[Asset Catalog Tinkerer](https://github.com/insidegui/AssetCatalogTinkerer) 用于查看和分析Assets.car文件内容。

**用途**：

- 查看编译后的Assets.car中包含的所有资源
- 分析各资源的大小
- 导出资源文件进行检查
