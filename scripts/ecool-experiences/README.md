# ECool 大厂面经导入器

导入器从已登录的 `https://fe.ecool.fun/experience-list` 同源页面读取 59 份“大厂面经”，并生成：

- `content/posts/frontend/interview-experiences/_index.md`：总目录；
- `experience-<id>/_index.md`：一份面经的父 section bundle；
- `experience-<id>/round-<id>/index.md`：每一轮面试的独立 page bundle。

父页和每轮页面使用 Hugo `relref` 连接。即使两轮都叫“技术面试”，也会通过 `roundOrder` 和稳定的 `roundId` 分开，页面内提供上一轮、下一轮和返回父面经导航。

入口是 `import.mjs` 导出的 `runExperienceImport({ tab, root })`。`tab` 必须来自浏览器连接，并且当前页面必须属于 `fe.ecool.fun`；接口调用通过同源浏览器会话完成，不读取或导出 Cookie。抓取 checkpoint 和接口缓存写入 `.omc/state/`（该目录已被 Git 忽略），用于中断后续跑。
