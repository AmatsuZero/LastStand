+++
title = "启动优化-Initializers"
date = '2026-05-02T22:32:27+08:00'
draft = false
weight = 2
tags = ["iOS", "性能优化", "启动"]
categories = ["iOS开发", "性能优化"]
+++
Initializers是指在main函数之前执行的初始化代码，包括C++静态构造函数和`__attribute__((constructor))`标记的函数。这些代码会在Pre-main阶段同步执行，阻塞启动。

---

## 问题分析

以下代码会在main之前执行：

### 1. C++静态构造函数

```cpp
__attribute__((constructor))
static void MyInitializer() {
    // 耗时初始化
    initializeHeavyResource();
}
```

### 2. 全局静态变量的构造函数

```cpp
// 全局静态变量
static std::vector<std::string> globalCache = loadFromDisk();  // 构造函数在main前调用
```

### 3. 非基本类型的全局变量

```cpp
// 非POD类型的全局变量会触发构造函数
static std::string globalString = "Hello";
static MyClass globalObject;
```

---

## 优化方案

### 方案1：延迟初始化

将全局变量改为懒加载模式：

```cpp
// 优化前：全局变量在main前初始化
static std::vector<std::string> globalCache = loadFromDisk();

// 优化后（纯C++方案，适用于 .cpp 文件）：
#include <mutex>
static std::vector<std::string>* getGlobalCache() {
    static std::vector<std::string>* cache = nullptr;
    static std::once_flag onceFlag;
    std::call_once(onceFlag, [&] {
        cache = new std::vector<std::string>();
        *cache = loadFromDisk();
    });
    return cache;
}

// 优化后（ObjC++方案，适用于 .mm 文件）：
static std::vector<std::string>* getGlobalCache() {
    static std::vector<std::string>* cache = nullptr;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        cache = new std::vector<std::string>();
        *cache = loadFromDisk();
    });
    return cache;
}
```

### 方案2：使用Swift懒加载

Swift的懒加载特性可以避免在启动时初始化：

```swift
class ResourceManager {
    // 首次访问时才初始化
    static let shared = ResourceManager()
    
    // 懒加载属性
    lazy var heavyResource: HeavyResource = {
        return HeavyResource()
    }()
    
    private init() {
        // 轻量级初始化
    }
}
```

### 方案3：移除不必要的constructor函数

审查项目中所有`__attribute__((constructor))`的使用，将非必要的初始化延迟：

```cpp
// 优化前：在constructor中执行耗时操作
__attribute__((constructor))
static void setupAnalytics() {
    // 耗时的初始化
    AnalyticsSDK::initialize();
    AnalyticsSDK::setUserID(getUserID());
}

// 优化后：只做轻量级注册，延迟实际初始化
__attribute__((constructor))
static void registerAnalytics() {
    // 只注册，不初始化
    LaunchTaskManager::registerTask([]() {
        AnalyticsSDK::initialize();
        AnalyticsSDK::setUserID(getUserID());
    });
}
```

### 方案4：使用基本类型替代复杂类型

对于全局变量，尽量使用基本类型：

```cpp
// 优化前：使用std::string
static std::string kAPIEndpoint = "https://api.example.com";

// 优化后：使用C字符串
static const char* kAPIEndpoint = "https://api.example.com";
```

### 方案5：使用函数局部静态变量

C++11保证函数局部静态变量的线程安全初始化：

```cpp
// 优化前：全局静态变量
static ExpensiveObject globalObject;

// 优化后：函数局部静态变量，首次调用时才初始化
ExpensiveObject& getGlobalObject() {
    static ExpensiveObject instance;  // 首次调用时初始化
    return instance;
}
```

---

## 如何找出所有Initializers

### 方法1：使用otool分析

```bash
# 查看Mach-O文件中的初始化器
otool -l /path/to/YourApp.app/YourApp | grep -A5 "__mod_init_func"

# 也可直接查看 section 内容（可能位于 __DATA 或 __DATA_CONST 段）
otool -v -s __DATA __mod_init_func /path/to/YourApp.app/YourApp
otool -v -s __DATA_CONST __mod_init_func /path/to/YourApp.app/YourApp
```

### 方法2：使用Instruments

Time Profiler可以显示Pre-main阶段所有函数的调用和耗时。
