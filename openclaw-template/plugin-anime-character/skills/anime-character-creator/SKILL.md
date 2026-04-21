---
name: anime_character_creator
description: Ask the anime-character plugin to generate a structured character card when the user requests a new or iterated anime character.
metadata:
  openclaw:
    os: ["darwin", "linux", "win32"]
    requires:
      bins: []
      config: []
---

# Anime Character Creator (plugin-backed skill)

本 skill 与 `@example/openclaw-anime-character` plugin 一起发布。它只负责告诉 agent **何时**去调用 plugin 暴露的结构化工具,生成和落盘工作由 plugin 完成。

## When to use

- 用户说 "给我一个角色 / design a character / 设计 xxx 主题角色"。
- 用户提供关键词 / 参考图,希望展开。
- 用户要迭代已有角色:"让她更神秘" / "加一个弱点" / "换暗色系"。

**不要触发:** 聊动漫作品的常识问题;要求仿写真实已存在作品的具名角色(plugin 的 guards 会拒,但不要先给错误期望)。

## How

1. 从用户自然语言抽取 `concept` / 可选 `genre` / `name` / `pronoun` / `age` / `notes`,**一次性补问**未填项,允许用户说"你定"。
2. 调 `/new-character <concept>`(slash command),或直接调用 tool `anime_character.generate(input)`。后者返回 schema-valid 的 Character 对象,前者会自动落盘到 `./characters/<slug>.md`。
3. 用户要立绘 → 调 `anime_character.render_portrait({ slug, positive, negative, styleTags })`,结果 PNG 写入 `./characters/portraits/<slug>.png`。
4. 汇报:Name / 配色 / 核心三词 / 一句话弧光。问要不要迭代。

## Iteration

每条迭代指令只改受影响字段:

| 用户说 | 工具调用 |
| --- | --- |
| "让她更神秘" | `anime_character.generate` with `notes: "更模糊的出身,暗调 palette"` + 复用 slug |
| "加一个致命弱点" | 重生成,`notes: "ability 不变,补一个非 trivial weakness"` |
| "换暗色系" | 重生成,`notes: "palette 改冷暗,outfit 跟色"` |
| "重画立绘" | `anime_character.render_portrait`,同 slug,旧 png 按 `-v<n>` 归档 |

每次落盘后建议提示用户 `git commit` 做版本追溯。

## Why this is a plugin, not a pure skill

- **强类型 I/O:** Character schema(TypeBox)→ 模型 tool call 输入输出可校验,不靠自由文本解析。
- **插件级配置:** `defaultGenre` / `nsfwPolicy` / `portraitProvider` 一次配置全局生效。
- **Slash commands:** `/new-character`、`/list-characters` 作为一等命令,绕过 LLM 直接执行。
- **可替换 provider:** 立绘从 builtin 切到 sd-webui / novelai 不动 skill 文本。
- **可被其他 skill 复用:** 比如未来"漫画分镜" skill 可以直接调 `anime_character.generate` 拿结构化结果。
