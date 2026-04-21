---
name: my_skill_name
description: One-line description shown to the agent when deciding whether to invoke this skill.
metadata:
  openclaw:
    os: ["darwin", "linux"]
    requires:
      bins: ["git"]
      config: []
---

# My Skill Name

<!--
  这是 OpenClaw 的 skill 模板文件,同时用于发布到 ClawHub(agent 广场)。
  必填的 frontmatter 字段: name、description
  可选 frontmatter 字段: metadata.openclaw.os / requires.bins / requires.config
  正文用自然语言告诉 agent:什么时候该用这个 skill、如何使用、以及可调用哪些工具。
-->

## When to use

- 当用户...(触发条件 1)时,使用本 skill。
- 当...(触发条件 2)时,也使用本 skill。
- 不要在... 情况下调用(反例,避免误触发)。

## How it works

简述本 skill 的执行步骤。示例:

1. 读取当前工作区的 `<文件>`。
2. 调用 `<tool-name>` 工具进行 `<操作>`。
3. 把结果写回 `<输出位置>` 并汇报给用户。

## Tools used

- `<tool-name-1>` — 用途
- `<tool-name-2>` — 用途

## Example

> **User**: 帮我 xxx
>
> **Agent**: 使用本 skill,依次执行第 1–3 步,最终返回 yyy。

## Notes

- 保持 skill 单一职责:一个 skill 只教 agent 做一件事。
- 在 workspace 级别的 skill 会覆盖全局 skill;修改后需 `/new` 或 `openclaw gateway restart` 生效。
