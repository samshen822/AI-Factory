# AI-Factory

> Language: **English** · [简体中文](README.zh.md)

Templates and reference implementations for shipping AI agent capabilities
to [OpenClaw](https://openclaw.ai).

OpenClaw does not expose a standalone "agent" publish channel. To ship a
new capability you pick one of two paths — a **skill** (composes existing
tools) or a **plugin** (registers new tools / providers / channels). This
repo demonstrates both by implementing the same anime-character-creator
agent twice, side by side, and ships a second agent (Morning Brief) as a
style contrast.

---

## What's inside

| Path | What it is |
| --- | --- |
| `openclaw-template/agent-workspace/` | Bootstrap files for an OpenClaw workspace — `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `USER.md`, `TOOLS.md`, `BOOTSTRAP.md`. Drop into `~/.openclaw/workspace/` to give your agent a persona. |
| `openclaw-template/clawhub-skill/` | Minimum publishable skill (`SKILL.md` + `CHANGELOG.md`). A blank scaffold to fork. |
| `openclaw-template/clawhub-skill-anime-character/` | A concrete **anime character creator** skill (Path A) — structured output, iteration semantics, content guards. Publishable via `clawhub skill publish`. |
| `openclaw-template/clawhub-skill-morning-brief/` | A **Morning Brief** skill demo (Path A) — scans HN / arXiv / RSS / GitHub Trending daily, filters by user interests, writes a 3-bullet brief and optionally delivers to a channel. |
| `openclaw-template/plugin-anime-character/` | The same anime-character capability as a full **OpenClaw plugin** (Path B) — TypeBox-schemad tools, slash commands, swappable image provider, bundled skill. Publishable via `clawhub package publish`. |
| `src/`, `tests/`, `results.tsv` | A tiny Jest sandbox used to iterate a coverage-driven loop. Kept so the repo doubles as a reproducible demo. |

---

## Two paths to an OpenClaw agent

### Path A — Skill (lightweight)

Use when your capability composes OpenClaw's existing tools (`browser`,
`exec`, `web_search`, `image_generation`, built-in messaging channels).

```bash
mkdir -p ~/.openclaw/workspace/skills/my-skill/
# Write SKILL.md: YAML frontmatter (name + description) + markdown workflow
openclaw gateway restart

# Publish (requires a GitHub account ≥ 1 week old)
clawhub login
clawhub skill publish ./my-skill \
  --slug my-skill --name "My Skill" --version 1.0.0 --tags "latest"
```

Full examples: [`clawhub-skill-anime-character/`](openclaw-template/clawhub-skill-anime-character) (creative) and [`clawhub-skill-morning-brief/`](openclaw-template/clawhub-skill-morning-brief) (utility).

### Path B — Plugin (full SDK)

Use when you need to **register** a new tool, provider, channel, or
agent-harness that OpenClaw does not already supply.

```bash
cd openclaw-template/plugin-anime-character
pnpm install
pnpm tsc --noEmit

clawhub package publish your-org/openclaw-anime-character --dry-run
clawhub package publish your-org/openclaw-anime-character

# User side
openclaw plugins install clawhub:@your-org/openclaw-anime-character
```

Demo: [`openclaw-template/plugin-anime-character/`](openclaw-template/plugin-anime-character)
ships two TypeBox-schemad tools, two slash commands, a bundled skill, and a
config schema driving a swappable image provider (builtin / SD WebUI /
NovelAI).

---

## Agent demos

### Anime character creator

The anime-character capability is implemented **twice** — once as a skill
(Path A) and once as a plugin (Path B) — so the comparison is literal.

- **Input** — a rough concept (e.g. `会记忆魔法的档案管理员`), optional `genre` / `age` / `pronoun` / `notes`, or a reference image URL.
- **Output** — a structured Markdown card at `./characters/<slug>.md` with sections *Core / Visual / Personality / Backstory / Story / Visual prompt / Author notes*. Optional portrait PNG under `./characters/portraits/<slug>.png`.
- **Iteration** — `let her be more mysterious`, `add a fatal weakness`, `switch to a dark palette` — each command only rewrites the affected fields. Each iteration is its own commit; `git log` is the version history.
- **Internal consistency rules** —
  - palette must harmonise with hair / eyes / skin / outfit;
  - personality × backstory × arc must form a closed logical loop;
  - ability must pair with a concrete weakness or cost — no free strength.
- **Guards** —
  - no sexualised description or portrait of a character under 18;
  - real-person likenesses are rejected;
  - named existing characters are rejected (extract vibe with ≥3 divergences in name / key visual / power).

Filled sample card: [`openclaw-template/clawhub-skill-anime-character/examples/asanagi-chikage.md`](openclaw-template/clawhub-skill-anime-character/examples/asanagi-chikage.md).

### Morning Brief

A second Path A demo so you can see the skill pattern applied to an
information-utility task, not just a creative one.

- **Input** — user interests (keyword allowlist + exclusions + domain tags), read from `./brief-config.yml` or `USER.md`. Optional scheduled trigger (e.g. 08:00 daily).
- **Output** — a Markdown brief at `./briefs/<YYYY-MM-DD>.md` with 3–5 top items, each linked to a real source URL. Optional delivery to Telegram / Slack / Discord.
- **Iteration** — `redo today`, `deepen item 2`, `only AI news`, `switch delivery to Slack`.
- **Guards** —
  - no fabricated sources — items without a valid click-through URL are dropped, not invented;
  - no scanning outside the configured source list;
  - body ≤ 250 chars, each bullet ≤ 80 chars;
  - source failures (timeout / parse error / paywall) reported transparently at the end of the brief, not hidden.

Filled sample brief: [`openclaw-template/clawhub-skill-morning-brief/examples/2026-04-21.md`](openclaw-template/clawhub-skill-morning-brief/examples/2026-04-21.md).

---

## Skill vs. Plugin — when to pick which

| Dimension | Skill (Path A) | Plugin (Path B) |
| --- | --- | --- |
| I/O | Free-form markdown instructions | TypeBox-typed tool call, reusable from other skills |
| Config | Re-stated per conversation | Plugin-level (`defaultGenre`, `nsfwPolicy`, etc.) |
| Commands | Natural language triggers | First-class slash commands (`/new-character`) |
| Extending backends | Fixed to built-in tools | Swap providers / channels / harnesses |
| Guard enforcement | Prompt-level | Runtime code (throws on violation) |
| Effort | `SKILL.md` + changelog | `package.json` + manifest + TS entrypoint |

If you can build it in Path A, build it in Path A. Reach for Path B when
typed I/O, reusability across skills, or a new backend is what's actually
blocking you.

---

## The calc sandbox

`src/calc.js` + `tests/*.test.js` is a tiny Jest module used to validate
an autonomous coverage-iteration loop end-to-end. `results.tsv` is the
append-only audit log.

```bash
npm install
npx jest --coverage
```

Commit prefixes follow `scaffold:` / `experiment:` / `autoresearch:` /
`feat:` / `docs:` conventions — history on `main` is the full iteration
record.

---

## Prerequisites

- **Node.js ≥ 18** — for `src/` and the plugin's TypeScript.
- **OpenClaw** — https://openclaw.ai, installed locally.
- **ClawHub CLI** — bundled with OpenClaw; `clawhub login` requires a GitHub account ≥ 1 week old.
- **TypeScript 5 + @sinclair/typebox** — only needed when editing the plugin template.

---

## Repository layout

```
.
├── openclaw-template/
│   ├── agent-workspace/                         # IDENTITY / SOUL / USER / AGENTS / TOOLS / BOOTSTRAP
│   ├── clawhub-skill/                           # generic SKILL.md scaffold
│   ├── clawhub-skill-anime-character/           # Path A reference agent (creative)
│   │   ├── SKILL.md
│   │   ├── CHANGELOG.md
│   │   ├── templates/CHARACTER.md
│   │   └── examples/asanagi-chikage.md
│   ├── clawhub-skill-morning-brief/             # Path A reference agent (utility)
│   │   ├── SKILL.md
│   │   ├── CHANGELOG.md
│   │   ├── templates/BRIEF.md
│   │   └── examples/2026-04-21.md
│   └── plugin-anime-character/                  # Path B reference agent
│       ├── package.json
│       ├── openclaw.plugin.json
│       ├── tsconfig.json
│       ├── index.ts
│       ├── src/{schema,tools,commands,guards.ts}
│       └── skills/anime-character-creator/SKILL.md
├── src/                                         # calc sandbox
├── tests/                                       # Jest tests
├── package.json
└── results.tsv                                  # append-only run log
```

---

## License

MIT.
