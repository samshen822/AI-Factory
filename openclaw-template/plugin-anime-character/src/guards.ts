export type NsfwPolicy = "strict" | "moderate" | "artistic";

export function applyAgeGuard(
  apparentAgeText: string,
  positive: string,
  negative: string,
  policy: NsfwPolicy,
): { positive: string; negative: string } {
  const age = parseFirstInt(apparentAgeText);
  const minor = age !== undefined && age < 18;

  const hardenedNegative = [
    negative,
    minor ? "nsfw, suggestive, revealing clothing, cleavage, lingerie" : "",
    policy === "strict" ? "nsfw, suggestive" : "",
  ]
    .filter(Boolean)
    .join(", ");

  const hardenedPositive = minor
    ? `${positive}, full clothing, modest outfit, no suggestive pose`
    : positive;

  return { positive: hardenedPositive, negative: hardenedNegative };
}

const REAL_PERSON_PATTERNS: RegExp[] = [
  /real person/i,
  /celebrity/i,
  /actress|actor/i,
  /politician/i,
];

export function checkRealPerson(concept: string): { ok: boolean; reason?: string } {
  for (const p of REAL_PERSON_PATTERNS) {
    if (p.test(concept)) {
      return {
        ok: false,
        reason: "Real-person likenesses aren't supported. Describe a role or vibe and I'll design an original character.",
      };
    }
  }
  return { ok: true };
}

const FAMOUS_NAMED_CHARACTERS: string[] = [
  "rei ayanami",
  "naruto uzumaki",
  "monkey d luffy",
  "son goku",
  "spike spiegel",
];

export function checkNamedCharacterCopycat(
  concept: string,
  name: string | undefined,
): { warnings: string[] } {
  const hay = (concept + " " + (name ?? "")).toLowerCase();
  const warnings: string[] = [];
  for (const n of FAMOUS_NAMED_CHARACTERS) {
    if (hay.includes(n)) {
      warnings.push(
        `"${n}" detected — do not copy. Extract vibe only and introduce >=3 divergences (name, key visual, power/weakness).`,
      );
    }
  }
  return { warnings };
}

export function enforceAbilityWeaknessPairing(ability: string, weakness: string): void {
  if (!ability || ability.trim().length < 3) {
    throw new Error("ability field is empty — regenerate.");
  }
  if (!weakness || weakness.trim().length < 5) {
    throw new Error(
      "ability without a paired weakness/cost — regenerate with an explicit drawback (no cost-less power).",
    );
  }
}

function parseFirstInt(s: string): number | undefined {
  const m = s.match(/\d+/);
  return m ? Number(m[0]) : undefined;
}
