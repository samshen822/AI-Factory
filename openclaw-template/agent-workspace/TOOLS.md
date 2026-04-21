# Tools

<!--
  用户维护的工具笔记。记录本 workspace 下常用的工具、可用性说明、已知坑。
  不是自动加载的工具清单,只是提示 agent 如何用好它们。
-->

## 可用工具

| Tool | 用途 | 备注 |
| ---- | ---- | ---- |
| `browser` | 打开网页、抓内容、填表 | 默认 Chromium,headless=false |
| `exec`    | 执行 shell 命令 | 危险命令需确认 |
| `web_search` | 搜索 | 有速率限制 |
| `skills`  | 调用本 workspace / 全局的 skill | 修改 skill 后需 `/new` |

## 自定义约定
- 长任务超过 N 秒先汇报进度。
- 任何 `rm` / `git reset --hard` / 对外推送前必须征得确认。
