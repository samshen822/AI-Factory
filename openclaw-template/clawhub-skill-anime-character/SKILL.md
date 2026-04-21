---
name: anime_character_creator
description: Turn a rough concept into a full anime character profile (persona, design, arc) and optionally generate a reference portrait.
metadata:
  openclaw:
    os: ["darwin", "linux", "win32"]
    requires:
      bins: []
      config: []
---

# Anime Character Creator

帮用户把一个模糊的设定(一句话、几个关键词、或一张参考图)补全成一份结构化动漫角色卡,必要时调用 OpenClaw 的 image-gen 工具生成立绘。

## When to use

触发本 skill:

- 用户说"帮我设计一个角色 / design a character / 给我一个 xxx 主题的角色"
- 用户提供关键词("冷面剑士" / "会魔法的图书管理员" / "赛博朋克忍者")并希望展开
- 用户发一张参考图,问"按这个风格给我一个新角色"
- 用户想迭代已有角色:"让她更神秘" / "加一个弱点" / "换暗色系"

**不要触发**:

- 用户只是想聊动漫作品 / 问某个设定的问题
- 用户要求仿写真实已存在作品的具名角色(走 Guards 拒绝)

## Workflow

1. **抽取输入**。从用户自然语言里提取已知字段(名字、性别表达、发色、能力...),列出未填字段,**一次性提问补齐**(不要一个一个挤牙膏),允许用户说"你定"。
2. **查重**。读当前 workspace 的 `./characters/` 目录,用 slug(kebab-case)对比是否重名,冲突则加后缀 `-v2` 或征求用户意见。
3. **生成 profile**。按 `templates/CHARACTER.md` 填,维持内部一致:
   - 发色 / 瞳色 / 肤色 / 配色板必须能搭调(同色系或设计感互补)
   - 性格 × 背景 × 弧光 要逻辑闭环(冷漠不是无来由的)
   - 能力 × 弱点 × 代价 必须成对,没有"无代价强者"
4. **写入文件**。保存到 `./characters/<slug>.md`,目录不存在则 `exec` 新建。
5. **可选立绘**。如果用户要求或同意,调用 image-generation:
   - 用 card 里的 `Visual prompt.Positive/Negative/Style tags` 作为输入
   - 保存到 `./characters/portraits/<slug>.png`
   - 在 card 的 Visual 章节插入 `![portrait](portraits/<slug>.png)`
6. **汇报**。展示 Name / Visual 三个关键词 / Personality 核心三词 / 一句话弧光,问用户要不要迭代。

## Iteration

迭代指令 → **只动受影响字段,保持其余不变**:

| 用户指令 | 修改字段 |
| --- | --- |
| "让她更神秘" | Personality.核心性格 + Backstory.出身(模糊化) + Visual prompt(暗调) |
| "加一个致命弱点" | Story.弱点 / 代价 |
| "换成暗色系" | Visual.发色?瞳色? + 配色板 + 标志性服装 + Visual prompt |
| "改名字" | Name + Slug(并改文件名 + 目录里引用) |
| "写一段和 X 的关系" | Story.关系网 |
| "重画立绘" | 重新生成 portrait,旧文件重命名为 `<slug>-v<n>.png` |

每次迭代 **追加一个新 commit**,不 overwrite 上一个版本;依赖 git 追溯而不是版本号字段。

## Output schema

见 `templates/CHARACTER.md`。填完整性检查清单(若某字段用户明确说"留空",允许写 `—`):

- [ ] Core 六项全填
- [ ] Visual 配色板 ≥3 色
- [ ] Personality 核心性格恰好 3 个形容词
- [ ] Story 能力与弱点成对
- [ ] Visual prompt 的 Positive 与 Negative 都有值

## Tools used

- `exec` — 创建 `./characters/` 目录、写 md 文件
- `web_search` (可选) — 查某个流派 / 时代背景 / 设计参考
- `image_generation` (可选) — 生成立绘
- 读取当前 workspace 的 `USER.md` 以尊重用户偏好(NSFW 容忍度、风格倾向、默认语言)

## Guards

- **不生成 18 岁以下角色的性化描述或立绘**。年龄字段若 <18,自动省略体态性化,立绘 prompt 强制追加 `full clothing, modest, no suggestive pose`。
- **不照搬已有作品具名角色**。用户说"给我一个像 XX 的"→ 取气质而非复刻,至少 **3 处显著差异**(名字 / 关键外观 / 能力设定)。在 `Author notes.设计参考` 里只写**流派或作品**,不写具体角色名。
- **真实人物**:礼貌拒绝,改为"我可以基于这个职业 / 气质给你原创一个"。
- **版权提示**:立绘生成前提醒用户,生成风格若高度模仿某工作室(吉卜力 / 京阿尼 / ufotable 等)存在商用风险,建议仅作个人创作参考。

## Example invocation

> **User:** 给我一个赛博朋克忍者,女,银发,会操控记忆
>
> **Agent:** (执行 workflow 1–6,最终输出)
> > ✅ 已创建 `./characters/silverwire-kagura.md`
> >
> > **神楽 シロガネ (Kagura Shirogane)** — 银丝 / 冷灰瞳 / 墨蓝战术服
> > 核心:**克制 · 算计 · 温柔** · 弧光:组织的刀 → 发现自己就是档案 → 把自己从档案里删除
> >
> > 要我渲立绘吗?要不要加一个致命弱点?

## Notes for skill authors

- 本 skill 不持久化在 workspace 外;所有 character 文件都写在**当前 workspace 的 `./characters/`** 下,方便跟某个"作品项目"绑定。
- 想配 agent persona?在 workspace 根手动放一份 `IDENTITY.md` + `SOUL.md`,让 agent 以"动漫角色设计师"身份说话(参考 `openclaw-template/agent-workspace/`)。
- 修改 skill 后需 `/new` 或 `openclaw gateway restart` 生效。
