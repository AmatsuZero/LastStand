---
name: pod-resource-naming-conflict
description: 排查和解决 CocoaPods 管理的 iOS 项目中 Pod 资源 bundle 命名冲突、Multiple commands produce 错误、Lottie 嵌套资源冲突等问题。
---

# Pod 资源命名冲突排查

## 触发条件

当遇到以下任何一种情况时激活本技能：

- Xcode 构建报错 `Multiple commands produce '.../X.bundle'`
- Pod 库之间资源文件（图片、json、Lottie 动画）命名冲突
- 多个 Pod 同时引入 Lottie 动画资源，运行时加载到错误的动画
- 主工程与 Pod 库存在同名 resource bundle 导致覆盖
- XCFramework 内部 resource bundle 与主工程或其它 Pod 冲突

## 诊断步骤

### 1. 确认冲突范围

在 Xcode Build Log 中搜索 `Multiple commands produce`，找到冲突的具体 bundle 路径：

```
warning: Multiple commands produce '.../DerivedData/.../Build/Products/Debug-iphoneos/XXX.bundle'
```

### 2. 定位冲突源

检查哪些 target 在产出同名 bundle：

```bash
# 进入 DerivedData 产物目录，查看重复的 bundle
find ~/Library/Developer/Xcode/DerivedData -name "*.bundle" | sort | uniq -d

# 在 Pods 目录下搜索 podspec 中的资源声明
grep -r "resource_bundles\|resources" Pods/*/  --include="*.podspec" --include="*.podspec.json"
```

### 3. 检查 podspec 中的资源声明方式

重点区分 `resources` 和 `resource_bundles` 两种声明：

```ruby
# 容易冲突：resources 直接拷贝到 main bundle
s.resources = ['Resources/*.png', 'Resources/Lottie/*.json']

# 推荐：resource_bundles 打包到独立 bundle，避免冲突
s.resource_bundles = {
  'MySDK_Resources' => ['Resources/*.png', 'Resources/Lottie/*.json']
}
```

## 解决方案

### 方案 A：podspec 中使用 resource_bundles + 命名空间前缀

作为 Pod 作者，修改 podspec：

```ruby
# 将 s.resources 改为 s.resource_bundles，并用 Pod 名作为前缀
s.resource_bundles = {
  'XYZSDK_Assets' => ['XYZSDK/Assets/*.png'],
  'XYZSDK_Lottie' => ['XYZSDK/Lottie/*.json'],
}
```

对应的运行时资源访问代码也需要修改：

```objc
// 旧方式（resources）
UIImage *img = [UIImage imageNamed:@"icon"];

// 新方式（resource_bundles）
NSBundle *bundle = [NSBundle bundleForClass:[self class]];
NSURL *url = [bundle URLForResource:@"XYZSDK_Assets" withExtension:@"bundle"];
NSBundle *assetBundle = [NSBundle bundleWithURL:url];
UIImage *img = [UIImage imageNamed:@"icon" inBundle:assetBundle compatibleWithTraitCollection:nil];
```

### 方案 B：Podfile 中通过 post_install hook 解决冲突

如果无法修改 podspec（使用的第三方 Pod），在 Podfile 的 `post_install` 中处理：

```ruby
post_install do |installer|
  # 移除特定 Pod 的直接 resources 引用，改为 resource_bundles
  installer.pods_project.targets.each do |target|
    if target.name == 'ConflictingPod'
      target.build_phases.each do |phase|
        if phase.respond_to?(:name) && phase.name == '[CP] Copy Pods Resources'
          # 过滤掉冲突的资源
          phase.input_paths.select! { |path| !path.include?('Lottie') }
        end
      end
    end
  end
end
```

### 方案 C：Lottie / 嵌套资源冲突专项处理

多个 Pod 各自携带 Lottie 动画资源时，按以下优先级处理：

1. **统一资源管理**：将各 Pod 的 Lottie 动画资源提取到主工程统一管理，各 Pod 通过网络或主工程 bundle 加载
2. **子 Pod 资源重命名**：通过 CocoaPods 的 `resource_bundles` 确保每个 Pod 的 bundle 名全局唯一：
   ```
   PodA → PodA_Lottie.bundle
   PodB → PodB_Lottie.bundle
   ```
3. **运行时加载指定 bundle**：
   ```objc
   // 确保从正确的 bundle 加载 Lottie 动画
   NSBundle *podBundle = [NSBundle bundleForClass:[ThisPodClass class]];
   NSString *bundlePath = [podBundle pathForResource:@"PodA_Lottie" ofType:@"bundle"];
   NSBundle *lottieBundle = [NSBundle bundleWithPath:bundlePath];
   LOTAnimationView *anim = [LOTAnimationView animationNamed:@"animation"
                                                  inBundle:lottieBundle];
   ```

4. **Podfile 中显式排除冲突资源**：
   ```ruby
   # Podfile
   pod 'LottiePod', :path => '../LocalPods/LottiePod', 
       :exclude_files => 'LottiePod/Assets/Lottie/*.json'
   
   # 主工程单独添加 Lottie 资源到 resource_bundles
   ```

### 方案 D：XCFramework 内部 resource bundle 冲突

XCFramework 内嵌 resource bundle 与主工程同名时，Xcode 会在 `BUILT_PRODUCTS_DIR` 产出两份，导致冲突。

**解决**：
- 构建 XCFramework 时确保 bundle 名有足够命名空间前缀
- 消费方在 Podfile 中添加脚本，重命名冲突的 bundle：

```ruby
script_phase = {
  :name => 'Rename Conflicting Bundles',
  :script => <<-SCRIPT
    BUNDLE_PATH="${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Frameworks/XYZSDK.framework/Assets.bundle"
    if [ -d "$BUNDLE_PATH" ]; then
      mv "$BUNDLE_PATH" "${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app/Frameworks/XYZSDK.framework/XYZSDK_Assets.bundle"
    fi
  SCRIPT
}
```

## 预防最佳实践

1. **Pod authors**：
   - 始终使用 `resource_bundles`（而非 `resources`）
   - bundle 名以 Pod 名作为命名空间前缀
   - 资源文件内部命名也建议加前缀

2. **Pod consumers**：
   - 在 Podfile 中审计所有依赖的资源声明：
     ```bash
     grep -A5 "resource" Pods/*/*.podspec | grep -E "(resources|resource_bundles)"
     ```
   - 引入新 Pod 前检查是否有同名 bundle

3. **项目规范**：
   - 在 CODEBUDDY.md 或团队规范中明确资源命名约定
   - CI 中加入资源冲突检测脚本

## 检查清单

- [ ] 确认所有自有 Pod 使用 `resource_bundles` 而非 `resources`
- [ ] 确认所有 bundle 名包含命名空间前缀
- [ ] 确认 Lottie 动画资源未在多个 Pod 中重复携带
- [ ] 确认 XCFramework 内部 bundle 名不与主工程冲突
- [ ] 确认 `post_install` hook 中没有遗留的临时性资源处理逻辑
