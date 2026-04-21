import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import type { TCharacter } from "../schema/character";

type PluginConfig = {
  charactersDir?: string;
};

export function registerNewCharacterCommand(api: OpenClawPluginApi) {
  api.registerCommand({
    id: "anime-character.new",
    name: "new-character",
    description: "Create a new anime character card in this workspace.",

    // NOTE: The command arg/ctx shape follows the patterns shown in OpenClaw
    // plugin examples. Verify against the actual SDK `registerCommand` types.
    async run(args, ctx) {
      const concept = (args._ ?? []).join(" ").trim() || (args.concept as string | undefined)?.trim();
      if (!concept) {
        ctx.reply("Usage: /new-character <one-line concept>   e.g. /new-character 会记忆魔法的档案员");
        return;
      }

      const result = (await ctx.tools.call("anime_character.generate", { concept })) as TCharacter;

      const cfg = (ctx.config ?? {}) as PluginConfig;
      const dir = cfg.charactersDir ?? "./characters";
      const path = `${dir}/${result.slug}.md`;

      await ctx.fs.mkdirp(dir);
      await ctx.fs.writeFile(path, renderMarkdown(result));

      ctx.reply(
        [
          `✅ ${result.core.displayName} → ${path}`,
          `   genre: ${result.genreTags.join(", ")}`,
          `   core: ${result.personality.coreAdjectives.join(" · ")}`,
          `   arc: ${result.story.arc}`,
          ``,
          `Next: /list-characters  ·  render portrait with tool anime_character.render_portrait`,
        ].join("\n"),
      );
    },
  });
}

function renderMarkdown(c: TCharacter): string {
  const lines: string[] = [
    `# ${c.core.displayName}`,
    ``,
    `**Slug:** ${c.slug}`,
    `**Created:** ${c.created}`,
    `**Genre tags:** ${c.genreTags.join(", ")}`,
    ``,
    `## Core`,
    `- **Name (发音):** ${c.core.reading}`,
    `- **Nicknames / 别称:** ${c.core.nicknames.join(", ") || "—"}`,
    `- **代词:** ${c.core.pronoun}`,
    `- **年龄 (表观):** ${c.core.apparentAge}`,
    `- **种族 / 物种:** ${c.core.species}`,
    `- **职业 / 所属:** ${c.core.occupation}`,
    ``,
    `## Visual`,
    `- **身高 / 体型:** ${c.visual.height} / ${c.visual.build}`,
    `- **发色 / 发型:** ${c.visual.hair}`,
    `- **瞳色:** ${c.visual.eyes}`,
    `- **肤色:** ${c.visual.skin}`,
    `- **标志性服装:** ${c.visual.outfit}`,
    `- **配色板:** ${c.visual.palette.map((h) => "`" + h + "`").join(" / ")}`,
    `- **标志性动作:** ${c.visual.signatureGesture}`,
    `- **记号 / 伤痕 / 配饰:** ${c.visual.marks}`,
  ];

  if (c.portraitPath) {
    lines.push(``, `![portrait](${c.portraitPath})`);
  }

  lines.push(
    ``,
    `## Personality`,
    `- **核心性格:** ${c.personality.coreAdjectives.join(" · ")}`,
    `- **口癖 / 说话风格:** ${c.personality.speech}`,
  );
  if (c.personality.mbti) lines.push(`- **MBTI 估算:** ${c.personality.mbti}`);
  lines.push(
    `- **喜欢:** ${c.personality.likes.join("、") || "—"}`,
    `- **讨厌:** ${c.personality.dislikes.join("、") || "—"}`,
    `- **恐惧:** ${c.personality.fear}`,
    `- **梦想 / 执念:** ${c.personality.desire}`,
    ``,
    `## Backstory`,
    `- **出身:** ${c.backstory.origin}`,
    `- **转折点:** ${c.backstory.turningPoint}`,
    `- **现状:** ${c.backstory.present}`,
    ``,
    `## Story`,
    `- **关系网:**`,
    ...(c.story.relationships.length
      ? c.story.relationships.map((r) => `  - ${r.name} — ${r.relation}`)
      : ["  - —"]),
    `- **能力 / 武器:** ${c.story.ability}`,
    `- **弱点 / 代价:** ${c.story.weakness}`,
    `- **角色弧光:** ${c.story.arc}`,
    ``,
    `## Visual prompt`,
    `- **Positive:** ${c.visualPrompt.positive}`,
    `- **Negative:** ${c.visualPrompt.negative}`,
    `- **Style tags:** ${c.visualPrompt.styleTags.join(", ")}`,
    ``,
    `## Author notes`,
    `- **创作思路:** ${c.authorNotes.intent}`,
    `- **设计参考:** ${c.authorNotes.references.join(" · ")}`,
    ``,
  );

  return lines.join("\n");
}
