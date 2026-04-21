import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";

import { Character, CharacterInput, type TCharacter, type TCharacterInput } from "../schema/character";
import {
  applyAgeGuard,
  checkNamedCharacterCopycat,
  checkRealPerson,
  enforceAbilityWeaknessPairing,
  type NsfwPolicy,
} from "../guards";

type PluginConfig = {
  defaultGenre?: TCharacter["genreTags"][number];
  nsfwPolicy?: NsfwPolicy;
};

export function registerGenerateCharacterCardTool(api: OpenClawPluginApi) {
  api.registerTool({
    id: "anime_character.generate",
    name: "Generate anime character card",
    description:
      "Turn a rough concept into a structured, internally-consistent anime character card. " +
      "Applies age + copyright guards automatically. Returns a Character object.",
    inputSchema: CharacterInput,
    outputSchema: Character,

    // NOTE: the exact `run` / handler signature is SDK-version-dependent.
    // Consult the `openclaw/plugin-sdk/plugin-entry` types and adjust
    // `ctx.model.generateJson` / `ctx.config` accordingly.
    async run(input: TCharacterInput, ctx): Promise<TCharacter> {
      const realPerson = checkRealPerson(input.concept);
      if (!realPerson.ok) throw new Error(realPerson.reason!);

      const copycat = checkNamedCharacterCopycat(input.concept, input.name);
      copycat.warnings.forEach((w) => ctx.logger?.warn(`[anime-character] ${w}`));

      const config = (ctx.config ?? {}) as PluginConfig;
      const nsfwPolicy: NsfwPolicy = config.nsfwPolicy ?? "strict";
      const genreTags = input.genre ? [input.genre] : [config.defaultGenre ?? ("seinen" as const)];

      const draft = (await ctx.model.generateJson({
        schema: Character,
        system: buildSystemPrompt(nsfwPolicy, copycat.warnings),
        user: buildUserPrompt(input, genreTags),
      })) as TCharacter;

      enforceAbilityWeaknessPairing(draft.story.ability, draft.story.weakness);

      const { positive, negative } = applyAgeGuard(
        draft.core.apparentAge,
        draft.visualPrompt.positive,
        draft.visualPrompt.negative,
        nsfwPolicy,
      );
      draft.visualPrompt.positive = positive;
      draft.visualPrompt.negative = negative;

      draft.genreTags = genreTags;
      draft.created = new Date().toISOString().slice(0, 10);
      draft.slug = draft.slug || slugify(draft.core.displayName);

      return draft;
    },
  });
}

function buildSystemPrompt(policy: NsfwPolicy, copycatWarnings: string[]): string {
  return [
    "You are an anime character designer. Produce a fully consistent Character object matching the provided JSON schema.",
    "Internal consistency rules:",
    "- palette must harmonise with hair/eyes/skin/outfit (same temperature or intentional contrast).",
    "- personality × backstory × arc must form a closed logical loop (no unexplained coldness, etc.).",
    "- ability MUST be paired with a concrete weakness/cost; reject cost-less power.",
    "- `authorNotes.references` may cite genres or works but NEVER specific existing character names.",
    policy === "strict"
      ? "Content: no suggestive content at any age. Under-18 characters: modest clothing only."
      : policy === "moderate"
        ? "Content: tasteful for adult-coded characters. Under-18: modest clothing only."
        : "Content: tasteful nudity allowed for 18+. Under-18: modest clothing only.",
    ...copycatWarnings,
  ].join("\n");
}

function buildUserPrompt(input: TCharacterInput, genreTags: string[]): string {
  return [
    `Concept: ${input.concept}`,
    `Genre tags: ${genreTags.join(", ")}`,
    input.name ? `Preferred name: ${input.name}` : "",
    input.pronoun ? `Pronoun: ${input.pronoun}` : "",
    input.age !== undefined ? `Apparent age: ${input.age}` : "",
    input.referenceImageUrl ? `Reference image: ${input.referenceImageUrl}` : "",
    input.notes ? `User notes: ${input.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "unnamed";
}
