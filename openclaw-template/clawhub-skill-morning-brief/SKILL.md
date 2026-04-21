---
name: morning_brief
description: Scan configured sources daily, filter by user interests, output a 3-bullet morning briefing and optionally deliver to a channel.
metadata:
  openclaw:
    os: ["darwin", "linux", "win32"]
    requires:
      bins: []
      config: []
---

# Morning Brief

每天早上把 HN / arXiv / RSS / GitHub Trending 压缩成 3 条值得读的要点,写到本地并可选投递到 IM。

## When to use

- 用户早上说 "给我今天的晨报 / daily brief"。
- 定时触发(cron / gateway 定时器)每日 08:00 自动叫本 skill。
- 用户问 "今天 X 领域有啥新动向"。

**不要触发**:

- 用户要深度综述 / 长篇 research — 那是别的 skill 的事。
- 用户问历史性问题(本 skill 只看当日)。

## Sources

默认扫描(用户可覆盖):

1. Hacker News top 30(`web_fetch` news.ycombinator.com)
2. arXiv 新投稿(按用户领域 tag,如 `cs.AI` / `cs.CL`)
3. 用户订阅的 RSS 列表
4. 可选:GitHub trending(按用户语言偏好)

配置读取优先级:`./brief-config.yml` > workspace 根的 `USER.md` > skill 默认。

## Workflow

1. **建立兴趣向量**。从配置读关键词白名单 + 排除词 + 领域 tag。
2. **并行抓取**。对每个启用的源并行 `web_fetch`,单源 10s 超时,超时的放到 brief 末尾"失败"段。
3. **相关性评分**。对每条候选按"命中关键词数 × tag 匹配 - 排除词命中 × 100"排序。
4. **Top 3(最多 5)补背景**。对选中项可选调 `web_search` 补 1–2 句原文之外的上下文。
5. **写文件**。按 `templates/BRIEF.md` 渲染到 `./briefs/<YYYY-MM-DD>.md`(目录不存在就 `exec mkdir`)。
6. **投递**(可选)。配置了 delivery channel 就调对应 channel tool 发出;未配置则只落盘。
7. **汇报**。一行状态:文件路径 + 投递状态 + 失败源计数(若非零)。

## Iteration

| 用户说 | 行为 |
| --- | --- |
| "重做今天的" | 丢掉本地 `./briefs/<今日>.md` 重新跑,保留旧文件改名 `-v1.md` |
| "加深第 2 条" | 对第 2 条再调一次 `web_search`,重写 summary 与 tags |
| "只要 AI 新闻" | 临时把 interest 收窄到 `{llm, agent, evaluation, rag}`,其他领域跳过 |
| "换 Slack 投递" | 修改当日一次性的 delivery channel,不写入 config |
| "明天也这样" | 把当次修改持久化到 `./brief-config.yml` |

## Config file (optional)

放在 workspace 根,agent 会自动读:

```yaml
# ./brief-config.yml
sources:
  hackernews: true
  arxiv:
    categories: [cs.AI, cs.CL, cs.LG]
  rss:
    - https://example.invalid/feed1.xml
    - https://example.invalid/feed2.xml
  github_trending:
    languages: [TypeScript, Rust]

interests:
  keywords: [llm, prompt, agent, evaluation, rag]
  exclude: [crypto, nft]

delivery:
  channel: telegram        # telegram | slack | discord | none
  to: "@your-handle"
  time: "08:00"
  timezone: "Asia/Shanghai"
```

## Tools used

- `web_fetch` — 抓 HN / RSS / arXiv 页面
- `web_search`(可选)— 为单条补背景
- `exec` — 写 markdown 文件、读 config
- Channel tools(`telegram.send` / `slack.send` / `discord.send` 等) — 投递

## Guards

- **不制造虚假来源**。一条 brief 必须有可点击的 URL 指向原始出处;无法溯源的条目直接丢,不编。
- **不越界扫描**。只读 config 列出的源,不主动发现新源。
- **长度上限**。单篇 brief 正文 ≤ 250 字,每条 bullet ≤ 80 字;超了自动截断并加省略号。
- **失败透明**。某个源抓不到、超时、parse 失败,如实写在 brief 末尾"Scanned sources"段,不伪造成功。
- **不碰付费墙内容**。遇到 paywall 只留标题 + 链接,不强行越墙。

## Example invocation

> **User (08:00 自动触发)**:(无需说话)
>
> **Agent**:
> 今早 3 条:
> 1. [HN #1] OSS agent framework X 发布 tool-call trace 可视化器
> 2. [arXiv 2604.XXXXX] Self-critique loops for code generation, HumanEval +4.2
> 3. [Simon Willison] PDF-OCR 管线里的新 prompt injection 案例
>
> ✅ ./briefs/2026-04-21.md · 投递 telegram@your-handle · 失败源 0

## Notes

- 每天的 brief 独立文件,便于回顾。跨日聚合是另一个 skill 的事(预留 `weekly_brief`)。
- 如果 workspace 跟 git 仓库绑定,每篇 brief 自动被 git 追踪;用 `git log --oneline -- briefs/` 就是你的关注度时间线。
