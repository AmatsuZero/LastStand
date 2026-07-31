+++
title = "跨域通信"
date = '2024-10-14T00:00:00+08:00'
lastmod = '2024-11-10T00:00:00+08:00'
draft = true
weight = 12
tags = ["面试", "前端", "HTML", "跨域通信", "ecool"]
categories = ["前端开发", "面试"]
source = "https://fe.ecool.fun/knowledge-learn"
+++
## 什么是跨域

在了解跨域之前，我们必须要了解一下同源策略。 跨域问题其实就是浏览器的同源策略造成的。

### 同源策略

同源策略限制了从同一个源加载的文档或脚本如何与另一个源的资源进行交互。这是浏览器的一个用于隔离潜在恶意文件的重要的安全机制。同源指的是：**协议**、**端口号**、**域名**必须一致。

> **跨源资源共享**（[CORS]，或通俗地译为跨域资源共享）是一种基于 [HTTP] 头的机制，该机制通过允许服务器标示除了它自己以外的其他[源] （域、协议或端口），使得浏览器允许这些源访问加载自己的资源。跨源资源共享还通过一种机制来检查服务器是否会允许要发送的真实请求，该机制通过浏览器发起一个到服务器托管的跨源资源的“预检”请求。在预检中，浏览器发送的头中标示有 HTTP 方法和真实请求中会用到的头。

## 为什么会产生跨域

下表给出了与 URL [wmq.com/dir/page.ht…](http://wmq.com/dir/page.html) 的源进行对比的示例:

| URL | 是否跨域 | 原因 |
| --- | --- | --- |
| [wmq.com/dir/page.ht…](http://wmq.com/dir/page.html) | 同源 | 完全相同 |
| [wmq.com/dir/inner/a…](http://wmq.com/dir/inner/another.html) | 同源 | 只有路径不同 |
| [wmq.com/secure.html](https://wmq.com/secure.html) | 跨域 | 协议不同 |
| [wmq.com:81/dir/etc.htm…](http://wmq.com:81/dir/etc.html) | 跨域 | 端口不同 ( http:// 默认端口是80) |
| [news.company.com/dir/other.h…](http://news.company.com/dir/other.html) | 跨域 | 主机不同 |

**同源策略：protocol（协议）、domain（域名）、port（端口）三者必须一致。**

**同源政策主要限制了三个方面：**

- 当前域下的 js 脚本不能够访问其他域下的 cookie、localStorage 和 indexDB。
- 当前域下的 js 脚本不能够操作访问操作其他域下的 DOM。
- 当前域下 ajax 无法发送跨域请求。

源政策的目的主要是为了保证用户的信息安全，它只是对 js 脚本的一种限制，并不是对浏览器的限制，对于一般的 img、或者script 脚本请求都不会有跨域的限制，这是因为这些操作都不会通过响应结果来进行可能出现安全问题的操作。

## 有哪些解决跨域的办法

### CORS

**CORS**: 通过设置服务器端的响应头来允许跨域请求。这需要在服务器端进行配置，以允许特定的来源访问资源。例如，在Node.js的Express框架中，可以使用以下代码来设置CORS：

```js
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许所有来源访问
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // 允许的请求头
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许的请求方法
  next();
});

// 其他路由和中间件

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

#### 减少OPTIONS请求次数

在跨域请求中，浏览器会自动处理一些非简单请求的预检流程，这包括"预检请求"（也被称为CORS预检请求）和"OPTIONS请求"。预检请求是发起一个HTTP OPTIONS请求到服务器，以确认目标资源是否支持跨域。这种机制是为了兼容同源策略而产生的，但有时这种额外的请求会导致性能问题。

为了减少这种非必要的 OPTIONS 请求次数，可以采取以下几种方法：

**配置服务器**: 对服务器进行配置以允许来自特定来源的跨域请求。例如，在Node.js的Express框架中，可以使用以下代码来设置CORS响应头：

```js
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许所有来源访问
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // 允许的请求头
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许的请求方法
  next();
});

// 其他路由和中间件

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

```

在这个例子中，我们添加了一个新的响应头`Access-Control-Allow-Methods`，其中包含了`GET, POST, PUT, DELETE`等简单请求方法，这样浏览器对于简单跨域请求就不会再发送预检请求了。

#### CORS中Cookie相关问题

在CORS中，Cookie是一个重要的安全特性。如果服务器端设置了允许跨域请求的响应头，那么客户端就可以在跨域请求中携带Cookie。但是，如果服务器端没有设置允许跨域请求的响应头，那么客户端就无法在跨域请求中携带Cookie。

为了解决这个问题，可以在服务器端设置允许跨域请求的响应头，以允许客户端携带Cookie。例如，在Node.js的Express框架中，可以使用以下代码来设置CORS：

```js
const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // 允许所有来源访问
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Cookie'); // 允许的请求头
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // 允许的请求方法
  next();
});

// 其他路由和中间件

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
```

在这个例子中，我们添加了一个新的响应头`Access-Control-Allow-Headers`，其中包含了`Cookie`。这样，客户端就可以在跨域请求中携带Cookie了。

也就是说上面两个问题的解决方法是一样的，都是通过在服务端设置添加一个新的响应头`Access-Control-Allow-Headers`

### JSONP

**jsonp**的原理就是利用`<script>`标签没有跨域限制，通过`<script>`标签src属性，发送带有callback参数的GET请求，服务端将接口返回数据拼凑到callback函数中，返回给浏览器，浏览器解析执行，从而前端拿到callback函数返回的数据。

1）原生JS实现：

```html
<script>
    var script = document.createElement('script');
    script.type = 'text/javascript';
    // 传参一个回调函数名给后端，方便后端返回时执行这个在前端定义的回调函数
    script.src = 'http://www.domain1.com:8080/login?user=admin&callback=handleCallback';
    document.head.appendChild(script);
    // 回调执行函数
    function handleCallback(res) {
        alert(JSON.stringify(res));
    }
 </script>
```

服务端返回如下（返回时即执行全局函数）：

```js
handleCallback({"success": true, "user": "admin"})
```

2）Vue axios实现：

```js
this.$http = axios;
this.$http.jsonp('http://www.domain2.com:8080/login', {
    params: {},
    jsonp: 'handleCallback'
}).then((res) => {
    console.log(res); 
})
```

后端node.js代码：

```js
var querystring = require('querystring');
var http = require('http');
var server = http.createServer();
server.on('request', function(req, res) {
    var params = querystring.parse(req.url.split('?')[1]);
    var fn = params.callback;
    // jsonp返回设置
    res.writeHead(200, { 'Content-Type': 'text/javascript' });
    res.write(fn + '(' + JSON.stringify(params) + ')');
    res.end();
});
server.listen('8080');
console.log('Server is running at port 8080...');
```

**JSONP的缺点：**

- 具有局限性， 仅支持get方法
- 不安全，可能会遭受XSS攻击

## postMessage 跨域

postMessage是HTML5 XMLHttpRequest Level 2中的API，且是为数不多可以跨域操作的window属性之一，它可用于解决以下方面的问题：

- 页面和其打开的新窗口的数据传递
- 多窗口之间消息传递
- 页面与嵌套的iframe消息传递
- 上面三个场景的跨域数据传递

用法：postMessage(data,origin)方法接受两个参数：

- **data**： html5规范支持任意基本类型或可复制的对象，但部分浏览器只支持字符串，所以传参时最好用JSON.stringify()序列化。
- **origin**： 协议+主机+端口号，也可以设置为"*"，表示可以传递给任意窗口，如果要指定和当前窗口同源的话设置为"/"。

1）a.html：(domain1.com/a.html)

```xml
<iframe id="iframe" src="http://www.domain2.com/b.html" style="display:none;"></iframe>
<script>       
    var iframe = document.getElementById('iframe');
    iframe.onload = function() {
        var data = {
            name: 'aym'
        };
        // 向domain2传送跨域数据
        iframe.contentWindow.postMessage(JSON.stringify(data), 'http://www.domain2.com');
    };
    // 接受domain2返回数据
    window.addEventListener('message', function(e) {
        alert('data from domain2 ---> ' + e.data);
    }, false);
</script>
```

2）b.html：(domain2.com/b.html)

```xml
<script>
    // 接收domain1的数据
    window.addEventListener('message', function(e) {
        alert('data from domain1 ---> ' + e.data);
        var data = JSON.parse(e.data);
        if (data) {
            data.number = 16;
            // 处理后再发回domain1
            window.parent.postMessage(JSON.stringify(data), 'http://www.domain1.com');
        }
    }, false);
</script>
```

### nginx代理跨域

nginx代理跨域，实质和CORS跨域原理一样，通过配置文件设置请求响应头Access-Control-Allow-Origin…等字段。

1）nginx配置解决iconfont跨域

浏览器跨域访问js、css、img等常规静态资源被同源策略许可，但iconfont字体文件(eot|otf|ttf|woff|svg)例外，此时可在nginx的静态资源服务器中加入以下配置。

```ini
location / {
  add_header Access-Control-Allow-Origin *;
}
```

2）nginx反向代理接口跨域

跨域问题：同源策略仅是针对浏览器的安全策略。服务器端调用HTTP接口只是使用HTTP协议，不需要同源策略，也就不存在跨域问题。

实现思路：通过Nginx配置一个代理服务器域名与domain1相同，端口不同）做跳板机，反向代理访问domain2接口，并且可以顺便修改cookie中domain信息，方便当前域cookie写入，实现跨域访问。

nginx具体配置：

```ini
#proxy服务器
server {
    listen       81;
    server_name  www.domain1.com;
    location / {
        proxy_pass   http://www.domain2.com:8080;  #反向代理
        proxy_cookie_domain www.domain2.com www.domain1.com; #修改cookie里域名
        index  index.html index.htm;
        # 当用webpack-dev-server等中间件代理接口访问nignx时，此时无浏览器参与，故没有同源限制，下面的跨域配置可不启用
        add_header Access-Control-Allow-Origin http://www.domain1.com;  #当前端只跨域不带cookie时，可为*
        add_header Access-Control-Allow-Credentials true;
    }
}
```

### nodejs 中间件代理跨域

node中间件实现跨域代理，原理大致与nginx相同，都是通过启一个代理服务器，实现数据的转发，也可以通过设置cookieDomainRewrite参数修改响应头中cookie中域名，实现当前域的cookie写入，方便接口登录认证。

**1）非vue框架的跨域**

使用node + express + http-proxy-middleware搭建一个proxy服务器。

- 前端代码：

```csharp
var xhr = new XMLHttpRequest();
// 前端开关：浏览器是否读写cookie
xhr.withCredentials = true;
// 访问http-proxy-middleware代理服务器
xhr.open('get', 'http://www.domain1.com:3000/login?user=admin', true);
xhr.send();
```

- 中间件服务器代码：

```less
var express = require('express');
var proxy = require('http-proxy-middleware');
var app = express();
app.use('/', proxy({
    // 代理跨域目标接口
    target: 'http://www.domain2.com:8080',
    changeOrigin: true,
    // 修改响应头信息，实现跨域并允许带cookie
    onProxyRes: function(proxyRes, req, res) {
        res.header('Access-Control-Allow-Origin', 'http://www.domain1.com');
        res.header('Access-Control-Allow-Credentials', 'true');
    },
    // 修改响应信息中的cookie域名
    cookieDomainRewrite: 'www.domain1.com'  // 可以为false，表示不修改
}));
app.listen(3000);
console.log('Proxy server is listen at port 3000...');
```

**2）vue框架的跨域**

node + vue + webpack + webpack-dev-server搭建的项目，跨域请求接口，直接修改webpack.config.js配置。开发环境下，vue渲染服务和接口代理服务都是webpack-dev-server同一个，所以页面与代理接口之间不再跨域。

webpack.config.js部分配置：

```yaml
module.exports = {
    entry: {},
    module: {},
    ...
    devServer: {
        historyApiFallback: true,
        proxy: [{
            context: '/login',
            target: 'http://www.domain2.com:8080',  // 代理跨域目标接口
            changeOrigin: true,
            secure: false,  // 当代理某些https服务报错时用
            cookieDomainRewrite: 'www.domain1.com'  // 可以为false，表示不修改
        }],
        noInfo: true
    }
}
```

### document.domain + iframe跨域

此方案仅限主域相同，子域不同的跨域应用场景。实现原理：两个页面都通过js强制设置document.domain为基础主域，就实现了同域。

1）父窗口：(domain.com/a.html)

```ini
<iframe id="iframe" src="http://child.domain.com/b.html"></iframe>
<script>
    document.domain = 'domain.com';
    var user = 'admin';
</script>
```

1）子窗口：(child.domain.com/a.html)

```xml
<script>
    document.domain = 'domain.com';
    // 获取父窗口中变量
    console.log('get js data from parent ---> ' + window.parent.user);
</script>
```

## location.hash + iframe跨域

实现原理：a欲与b跨域相互通信，通过中间页c来实现。 三个页面，不同域之间利用iframe的location.hash传值，相同域之间直接js访问来通信。

具体实现：A域：a.html -> B域：b.html -> A域：c.html，a与b不同域只能通过hash值单向通信，b与c也不同域也只能单向通信，但c与a同域，所以c可通过parent.parent访问a页面所有对象。

1）a.html：(domain1.com/a.html)

```xml
<iframe id="iframe" src="http://www.domain2.com/b.html" style="display:none;"></iframe>
<script>
    var iframe = document.getElementById('iframe');
    // 向b.html传hash值
    setTimeout(function() {
        iframe.src = iframe.src + '#user=admin';
    }, 1000);
    
    // 开放给同域c.html的回调方法
    function onCallback(res) {
        alert('data from c.html ---> ' + res);
    }
</script>
```

2）b.html：(.domain2.com/b.html)

```ini
<iframe id="iframe" src="http://www.domain1.com/c.html" style="display:none;"></iframe>
<script>
    var iframe = document.getElementById('iframe');
    // 监听a.html传来的hash值，再传给c.html
    window.onhashchange = function () {
        iframe.src = iframe.src + location.hash;
    };
</script>
```

3）c.html：([www.domain1.com/c.html](https://link.zhihu.com/?target=http%3A//www.domain1.com/c.html))

```xml
<script>
    // 监听b.html传来的hash值
    window.onhashchange = function () {
        // 再通过操作同域a.html的js回调，将结果传回
        window.parent.parent.onCallback('hello: ' + location.hash.replace('#user=', ''));
    };
</script>
```

### window.name + iframe跨域

window.name属性的独特之处：name值在不同的页面（甚至不同域名）加载后依旧存在，并且可以支持非常长的 name 值（2MB）。

1）a.html：(domain1.com/a.html)

```ini
var proxy = function(url, callback) {
    var state = 0;
    var iframe = document.createElement('iframe');
    // 加载跨域页面
    iframe.src = url;
    // onload事件会触发2次，第1次加载跨域页，并留存数据于window.name
    iframe.onload = function() {
        if (state === 1) {
            // 第2次onload(同域proxy页)成功后，读取同域window.name中数据
            callback(iframe.contentWindow.name);
            destoryFrame();
        } else if (state === 0) {
            // 第1次onload(跨域页)成功后，切换到同域代理页面
            iframe.contentWindow.location = 'http://www.domain1.com/proxy.html';
            state = 1;
        }
    };
    document.body.appendChild(iframe);
    // 获取数据以后销毁这个iframe，释放内存；这也保证了安全（不被其他域frame js访问）
    function destoryFrame() {
        iframe.contentWindow.document.write('');
        iframe.contentWindow.close();
        document.body.removeChild(iframe);
    }
};
// 请求跨域b页面数据
proxy('http://www.domain2.com/b.html', function(data){
    alert(data);
});
```

2）proxy.html：(domain1.com/proxy.html)

中间代理页，与a.html同域，内容为空即可。

3）b.html：(domain2.com/b.html)

```xml
<script>
    window.name = 'This is domain2 data!';
</script>
```

通过iframe的src属性由外域转向本地域，跨域数据即由iframe的window.name从外域传递到本地域。这个就巧妙地绕过了浏览器的跨域访问限制，但同时它又是安全操作。

### WebSocket协议跨域

WebSocket protocol是HTML5一种新的协议。它实现了浏览器与服务器全双工通信，同时允许跨域通讯，是server push技术的一种很好的实现。

原生WebSocket API使用起来不太方便，我们使用Socket.io，它很好地封装了webSocket接口，提供了更简单、灵活的接口，也对不支持webSocket的浏览器提供了向下兼容。

1）前端代码：

```xml
<div>user input：<input type="text"></div>
<script src="https://cdn.bootcss.com/socket.io/2.2.0/socket.io.js"></script>
<script>
var socket = io('http://www.domain2.com:8080');
// 连接成功处理
socket.on('connect', function() {
    // 监听服务端消息
    socket.on('message', function(msg) {
        console.log('data from server: ---> ' + msg); 
    });
    // 监听服务端关闭
    socket.on('disconnect', function() { 
        console.log('Server socket has closed.'); 
    });
});
document.getElementsByTagName('input')[0].onblur = function() {
    socket.send(this.value);
};
</script>
```

### Nodejs socket后台：

```js
var http = require('http');
var socket = require('socket.io');
// 启http服务
var server = http.createServer(function(req, res) {
    res.writeHead(200, {
        'Content-type': 'text/html'
    });
    res.end();
});
server.listen('8080');
console.log('Server is running at port 8080...');
// 监听socket连接
socket.listen(server).on('connection', function(client) {
    // 接收信息
    client.on('message', function(msg) {
        client.send('hello：' + msg);
        console.log('data from client: ---> ' + msg);
    });
    // 断开处理
    client.on('disconnect', function() {
        console.log('Client socket has closed.'); 
    });
});
```

## 常见考点

### 1. **同源策略**

- 什么是同源策略，为什么存在跨域限制？

### 2. **常见的跨域场景**

- 在什么情况下会出现跨域问题？
- 跨域在不同协议、端口、子域名下的表现差异？

### 3. **跨域解决方案**

-  **CORS**（跨域资源共享）  
  - 如何通过 HTTP 头实现跨域？
  - 简单请求与复杂请求的区别？
  - 预检请求（OPTIONS）是什么？
-  **JSONP**  
  - JSONP 如何实现跨域？
  - JSONP 的局限性和安全问题。
-  **代理服务器**  
  - 如何通过代理服务器解决跨域问题？
  - 正向代理与反向代理的区别。
-  **WebSocket**  
  - 为什么 WebSocket 可以跨域？
  - WebSocket 与传统 HTTP 请求的区别。
-  **postMessage**  
  - 什么是 `window.postMessage()`？
  - 如何在不同窗口或 iframe 之间通信？
-  **跨域资源嵌入**  
  - 如何通过 `<script>`、`<img>`、`<iframe>` 标签实现资源加载？
  - 什么场景下可以通过这些标签实现跨域？
-  **服务器端跨域处理**  
  - 如何通过 Nginx 或其他服务器配置实现跨域？
-  **document.domain**  
  - 通过 `document.domain` 实现跨子域名通信的原理。
-  **浏览器同源策略放宽**  
  - 如何在开发环境中临时放宽浏览器的同源策略（如使用浏览器插件）？

### 4. **CORS 的具体应用**

- CORS 的简单请求与复杂请求的区别？
- 允许跨域的 HTTP 头如何设置（如 `Access-Control-Allow-Origin`）？
- `withCredentials` 属性的作用及跨域带 Cookie 的处理？

### 5. **跨域通信的安全性**

- 跨域通信带来的安全风险？
- 如何防止跨域请求中的 CSRF（跨站请求伪造）攻击？

### 6. **浏览器跨域限制的变化**

- 不同浏览器对跨域请求的实现差异？
- 浏览器如何处理跨域资源加载的限制？
