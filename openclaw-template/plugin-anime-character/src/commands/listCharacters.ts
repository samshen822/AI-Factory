import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";

type PluginConfig = {
  charactersDir?: string;
};

export function registerListCharactersCommand(api: OpenClawPluginApi) {
  api.registerCommand({
    id: "anime-character.list",
    name: "list-characters",
    description: "List all anime characters saved in this workspace.",

    async run(_args, ctx) {
      const cfg = (ctx.config ?? {}) as PluginConfig;
      const dir = cfg.charactersDir ?? "./characters";

      const files: string[] = await ctx.fs.readdir(dir).catch(() => []);
      const cards = files
        .filter((f) => f.endsWith(".md"))
        .map((f) => f.replace(/\.md$/, ""))
        .sort();

      if (cards.length === 0) {
        ctx.reply(`No characters in ${dir} yet. Try /new-character <concept>.`);
        return;
      }

      ctx.reply([`Characters in ${dir}:`, ...cards.map((c) => `- ${c}`)].join("\n"));
    },
  });
}
