# AI-Factory

> 语言: [English](README.md) · **简体中文**

给 [OpenClaw](https://openclaw.ai) 做 AI agent 能力的模板与参考实现集合。

OpenClaw 没有独立的 "agent 发布" 渠道。要发一个新能力,你只有两条路 ——
**skill**(组合已有工具)或 **plugin**(注册新工具 / provider / channel)。
本仓库把同一个"动漫角色创作"能力分别用两条路实现了一遍,方便侧边对照;
另外提供一个 Morning Brief(晨报)agent 作为风格对比的第二个 demo。

---

## 仓库内容

| 目录 | 是什么 |
| --- | --- |
| `openclaw-template/agent-workspace/` | OpenClaw workspace 引导文件 — `AGENTS.md`、`SOUL.md`、`IDENTITY.md`、`USER.md`、`TOOLS.md`、`BOOTSTRAP.md`。拷到 `~/.openclaw/workspace/` 就给 agent 一个人格。 |
| `openclaw-template/clawhub-skill/` | 最小可发布的 skill 脚手架(`SKILL.md` + `CHANGELOG.md`),空白模板。 |
| `openclaw-template/clawhub-skill-anime-character/` | 完整的**动漫角色创作** skill(路线 A):结构化输出 + 迭代语义 + 内容护栏。通过 `clawhub skill publish` 发布。 |
| `openclaw-template/clawhub-skill-morning-brief/` | **Morning Brief**(晨报)skill(路线 A):按兴趣扫 HN / arXiv / RSS,生成每日 3 条要点,可选投递 Telegram / Slack / Discord。 |
| `openclaw-template/plugin-anime-character/` | 同一个动漫角色能力的**完整 plugin 版**(路线 B):TypeBox schema 化的 tool、slash 命令、可切换的图像 provider、打包的 skill。通过 `clawhub package publish` 发布。 |
| `src/`、`tests/`、`results.tsv` | 一个极小的 Jest sandbox,用来验证覆盖率驱动的自动迭代回路。保留下来让仓库兼作可复现 demo。 |

---

## OpenClaw agent 的两条路

### 路线 A — Skill(轻量)

当你的能力能用 OpenClaw 已有工具拼出来时用(`browser` / `exec` /
`web_search` / `image_generation` / 内置消息通道)。

```bash
mkdir -p ~/.openclaw/workspace/skills/my-skill/
# 写 SKILL.md:YAML frontmatter(name + description) + markdown workflow
openclaw gateway restart

# 发布(需要 GitHub 账号 ≥ 1 周)
clawhub login
clawhub skill publish ./my-skill \
  --slug my-skill --name "My Skill" --version 1.0.0 --tags "latest"
```

完整示例:[`clawhub-skill-anime-character/`](openclaw-template/clawhub-skill-anime-character) 与 [`clawhub-skill-morning-brief/`](openclaw-template/clawhub-skill-morning-brief)。

### 路线 B — Plugin(完整 SDK)

当你需要**注册**新的 tool / provider / channel / agent-harness 时用。

```bash
cd openclaw-template/plugin-anime-character
pnpm install
pnpm tsc --noEmit

clawhub package publish your-org/openclaw-anime-character --dry-run
clawhub package publish your-org/openclaw-anime-character

# 用户侧
openclaw plugins install clawhub:@your-org/openclaw-anime-character
```

示例:[`plugin-anime-character/`](openclaw-template/plugin-anime-character)
带了两个 TypeBox schema 化的 tool、两个 slash 命令、一个打包的 skill,
还有驱动可切换图像 provider(builtin / SD WebUI / NovelAI)的 config schema。

---

## 两个 agent demo

### 动漫角色创作(Anime Character Creator)

Skill 版与 plugin 版实现同一能力,放在一起做逐项对比。

- **输入**:一句话概念(`会记忆魔法的档案管理员`),可选 `genre` / `age` / `pronoun` / `notes`,或参考图 URL。
- **输出**:结构化 Markdown 卡片,写到 `./characters/<slug>.md`,分 *Core / Visual / Personality / Backstory / Story / Visual prompt / Author notes* 七段。可选立绘 PNG。
- **迭代**:`让她更神秘` / `加一个致命弱点` / `换暗色系` —— 每条指令只改受影响字段。每次迭代独立 commit,`git log` 就是版本历史。
- **内部一致性规则**:
  - 配色板必须与 发色 / 瞳色 / 肤色 / 服装 搭调;
  - 性格 × 背景 × 弧光 必须逻辑闭环;
  - 能力必须配具体弱点或代价 —— 不允许"无代价强者"。
- **护栏**:
  - 不对 18 岁以下角色做性化描述或立绘;
  - 拒绝真实人物仿写;
  - 拒绝已有作品的具名角色(可取气质,但至少 3 处显著差异 —— 名字 / 关键外观 / 能力)。

填好的样例:[`clawhub-skill-anime-character/examples/asanagi-chikage.md`](openclaw-template/clawhub-skill-anime-character/examples/asanagi-chikage.md)。

### Morning Brief(晨报)

每天早上把 HN / arXiv / RSS / GitHub Trending 压缩成 3 条值得读的要点。

- **输入**:用户兴趣(`./brief-config.yml` 或 `USER.md`),可选时间触发。
- **输出**:`./briefs/<YYYY-MM-DD>.md`,可选通过 Telegram / Slack / Discord 投递。
- **迭代**:"重做" / "加深第 2 条" / "只要 AI 新闻" / "换投递渠道"。
- **护栏**:
  - 不造假来源:无法点击溯源的全部丢;
  - 不越界扫描:只读 config 里列出的源;
  - 长度上限 ≤ 250 字 / 条 ≤ 80 字;
  - 失败源透明汇报(不伪装成功)。

填好的样例:[`clawhub-skill-morning-brief/examples/2026-04-21.md`](openclaw-template/clawhub-skill-morning-brief/examples/2026-04-21.md)。

---

## Skill 还是 Plugin?

| 维度 | Skill(路线 A) | Plugin(路线 B) |
| --- | --- | --- |
| I/O | 自由文本 markdown | TypeBox 强类型,其他 skill 可复用 |
| 配置 | 每次对话重述 | 插件级(`defaultGenre` 等) |
| 命令 | 自然语言触发 | 一等 slash 命令(`/new-character`) |
| 扩展后端 | 固定在内置工具 | 可换 provider / channel / harness |
| 护栏执行 | prompt 层约束 | 运行时代码(越界直接 throw) |
| 工作量 | `SKILL.md` + changelog | `package.json` + manifest + TS 入口 |

能用路线 A 的就用路线 A。要强类型 I/O、跨 skill 复用、或者换底层后端时才上路线 B。

---

## Calc sandbox

`src/calc.js` + `tests/*.test.js` 是一个极小的 Jest 模块,用来端到端验证一个覆盖率驱动的自动迭代回路。`results.tsv` 是只追加的审计日志。

```bash
npm install
npx jest --coverage
```

commit 前缀约定:`scaffold:` / `experiment:` / `autoresearch:` / `feat:` / `docs:`。`main` 分支的历史就是完整迭代轨迹。

---

## 先决条件

- **Node.js ≥ 18** —— `src/` 和 plugin 的 TypeScript 需要。
- **OpenClaw** —— https://openclaw.ai,本地安装。
- **ClawHub CLI** —— 随 OpenClaw 捆绑;`clawhub login` 需要 GitHub 账号 ≥ 1 周。
- **TypeScript 5 + @sinclair/typebox** —— 只有改 plugin 模板时需要。

---

## 仓库布局

```
.
├── openclaw-template/
│   ├── agent-workspace/                         # IDENTITY / SOUL / USER / AGENTS / TOOLS / BOOTSTRAP
│   ├── clawhub-skill/                           # 空白 SKILL.md 脚手架
│   ├── clawhub-skill-anime-character/           # 路线 A 参考 agent(创作)
│   │   ├── SKILL.md
│   │   ├── CHANGELOG.md
│   │   ├── templates/CHARACTER.md
│   │   └── examples/asanagi-chikage.md
│   ├── clawhub-skill-morning-brief/             # 路线 A 参考 agent(工具)
│   │   ├── SKILL.md
│   │   ├── CHANGELOG.md
│   │   ├── templates/BRIEF.md
│   │   └── examples/2026-04-21.md
│   └── plugin-anime-character/                  # 路线 B 参考 agent
│       ├── package.json
│       ├── openclaw.plugin.json
│       ├── tsconfig.json
│       ├── index.ts
│       ├── src/{schema,tools,commands,guards.ts}
│       └── skills/anime-character-creator/SKILL.md
├── src/                                         # calc sandbox
├── tests/                                       # Jest 测试
├── package.json
└── results.tsv                                  # 只追加的运行日志
```

---

## 许可

MIT.
