# Changelog

## [1.0.0] - 2026-04-21

### Added
- 初始发布。
- 支持 HN / arXiv / RSS / GitHub Trending 每日扫描。
- 关键词白名单 + 排除词过滤,Top 3 摘要。
- 可选 Telegram / Slack / Discord 投递。
- 失败源透明汇报(不伪造成功)。
- 迭代指令:重做 / 加深某条 / 收窄兴趣 / 换投递渠道。

<!--
Publish:
  clawhub login
  clawhub skill publish ./openclaw-template/clawhub-skill-morning-brief \
    --slug morning-brief \
    --name "Morning Brief" \
    --version 1.0.0 \
    --tags "latest,daily,productivity,news"
-->
