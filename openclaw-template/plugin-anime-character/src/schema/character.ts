import { Type, Static } from "@sinclair/typebox";

export const GenreTag = Type.Union([
  Type.Literal("shounen"),
  Type.Literal("shoujo"),
  Type.Literal("seinen"),
  Type.Literal("josei"),
  Type.Literal("isekai"),
  Type.Literal("cyberpunk"),
  Type.Literal("dark-fantasy"),
  Type.Literal("slice-of-life"),
]);

export const Pronoun = Type.Union([
  Type.Literal("she"),
  Type.Literal("he"),
  Type.Literal("they"),
]);

export const CharacterInput = Type.Object({
  concept: Type.String({ description: "A sentence or keywords describing the character idea." }),
  genre: Type.Optional(GenreTag),
  name: Type.Optional(Type.String({ description: "Preferred name; leave empty to let the tool choose." })),
  pronoun: Type.Optional(Pronoun),
  age: Type.Optional(Type.Integer({ minimum: 0, maximum: 500 })),
  referenceImageUrl: Type.Optional(Type.String({ format: "uri" })),
  notes: Type.Optional(Type.String({ description: "Freeform extra constraints." })),
});

export const Relationship = Type.Object({
  name: Type.String(),
  relation: Type.String(),
});

export const Character = Type.Object({
  slug: Type.String({ pattern: "^[a-z0-9-]+$" }),
  created: Type.String({ format: "date" }),
  genreTags: Type.Array(GenreTag, { minItems: 1 }),

  core: Type.Object({
    displayName: Type.String(),
    reading: Type.String({ description: "Kana + romaji or phonetic reading." }),
    nicknames: Type.Array(Type.String()),
    pronoun: Pronoun,
    apparentAge: Type.String({ description: "e.g. '28 (actually centuries)'." }),
    species: Type.String(),
    occupation: Type.String(),
  }),

  visual: Type.Object({
    height: Type.String(),
    build: Type.String(),
    hair: Type.String(),
    eyes: Type.String(),
    skin: Type.String(),
    outfit: Type.String(),
    palette: Type.Array(Type.String({ pattern: "^#[0-9a-fA-F]{6}$" }), { minItems: 3, maxItems: 5 }),
    signatureGesture: Type.String(),
    marks: Type.String(),
  }),

  personality: Type.Object({
    coreAdjectives: Type.Tuple([Type.String(), Type.String(), Type.String()]),
    speech: Type.String(),
    mbti: Type.Optional(Type.String()),
    likes: Type.Array(Type.String()),
    dislikes: Type.Array(Type.String()),
    fear: Type.String(),
    desire: Type.String(),
  }),

  backstory: Type.Object({
    origin: Type.String(),
    turningPoint: Type.String(),
    present: Type.String(),
  }),

  story: Type.Object({
    relationships: Type.Array(Relationship),
    ability: Type.String(),
    weakness: Type.String({ description: "Concrete cost/weakness paired with ability. Must be non-trivial." }),
    arc: Type.String({ description: "start → mid → end." }),
  }),

  visualPrompt: Type.Object({
    positive: Type.String(),
    negative: Type.String(),
    styleTags: Type.Array(Type.String()),
  }),

  authorNotes: Type.Object({
    intent: Type.String(),
    references: Type.Array(Type.String(), { description: "Genres/works only — never specific existing character names." }),
  }),

  portraitPath: Type.Optional(Type.String()),
});

export type TCharacterInput = Static<typeof CharacterInput>;
export type TCharacter = Static<typeof Character>;
export type TRelationship = Static<typeof Relationship>;
