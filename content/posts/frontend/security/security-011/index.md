+++
title = "跨域资源共享（CORS）"
date = '2024-12-17T00:00:00+08:00'
lastmod = '2025-07-17T00:00:00+08:00'
draft = false
weight = 11
tags = ["面试", "前端", "前端安全", "跨域资源共享（CORS）", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
跨域资源共享（CORS，Cross-Origin Resource Sharing）是浏览器用来放宽同源策略限制的一种机制，是前端跨域请求的主流解决方案。面试时考察点主要围绕它的原理、工作流程、配置细节及相关安全问题。

## 一、CORS 基础概念

- **作用**：允许浏览器从不同源的服务器请求资源，突破同源策略限制。
- **原理**：服务器通过设置特定的 HTTP 响应头，告诉浏览器允许跨域访问。

## 二、CORS 的关键响应头

| 头部 | 说明 |
| --- | --- |
| `Access-Control-Allow-Origin` | 指明允许访问的源，可以是具体域名（如 `https://example.com`）或 `*`（表示允许所有域访问） |
| `Access-Control-Allow-Methods` | 允许的请求方法（GET、POST、PUT、DELETE 等） |
| `Access-Control-Allow-Headers` | 允许请求携带的自定义头部字段 |
| `Access-Control-Allow-Credentials` | 是否允许携带 Cookie 或 HTTP 认证信息，值为 `true` 时允许 |
| `Access-Control-Max-Age` | 预检请求的结果缓存时间，单位秒 |

## 三、CORS 请求分类

### 1. **简单请求**

满足以下条件，浏览器直接发请求：

- 请求方法是 `GET`、`POST`、`HEAD` 中之一。
- 请求头只包含简单头（如 `Accept`, `Content-Type` 仅限 `application/x-www-form-urlencoded`、`multipart/form-data` 或 `text/plain`）。
- 不携带自定义 Cookie、认证信息。

### 2. **预检请求（Preflight）**

- 当请求不满足简单请求条件时，浏览器先发送 `OPTIONS` 请求询问服务器是否允许该跨域请求。
- 服务器响应通过特定头部告诉浏览器是否放行。

## 四、CORS 工作流程

1. 浏览器发送跨域请求。
2. 如果是简单请求，直接带上请求头发送实际请求，服务器返回响应带有 CORS 相关头，浏览器决定是否允许。
3. 如果是非简单请求，浏览器先发 `OPTIONS` 预检请求。
4. 服务器响应预检，决定是否允许后，浏览器再发实际请求。
5. 浏览器根据响应头决定是否允许前端访问响应内容。

## 五、携带 Cookie 的跨域请求

- 默认情况下，跨域请求不发送 Cookie。
- 前端请求时必须设置：`xhr.withCredentials = true` 或 `fetch` 的 `credentials: 'include'`。
- 服务器必须设置：`Access-Control-Allow-Credentials: true`。
- `Access-Control-Allow-Origin` 不能使用 `*`，必须指定具体域名。

## 常见考点

1. CORS 是什么？为什么需要它？
2. 同源策略和 CORS 的关系？
3. 简单请求和预检请求的区别？
4. 预检请求的触发条件有哪些？
5. `Access-Control-Allow-Origin` 设置为 `*` 有什么限制？
6. 如何支持带 Cookie 的跨域请求？
7. CORS 配置中的常用响应头说明。
8. 如何解决跨域请求失败问题？
9. JSONP 和 CORS 的区别？
10. 服务器如何配置支持 CORS？
