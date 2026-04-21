import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import { Type, type Static } from "@sinclair/typebox";

export const RenderPortraitInput = Type.Object({
  slug: Type.String({ pattern: "^[a-z0-9-]+$" }),
  positive: Type.String(),
  negative: Type.String(),
  styleTags: Type.Array(Type.String()),
  outputPath: Type.Optional(Type.String({ description: "Override default ./<charactersDir>/portraits/<slug>.png" })),
});

export const RenderPortraitOutput = Type.Object({
  path: Type.String(),
  provider: Type.String(),
  bytes: Type.Integer(),
});

type TInput = Static<typeof RenderPortraitInput>;
type TOutput = Static<typeof RenderPortraitOutput>;

type PortraitProvider = "none" | "builtin" | "sd-webui" | "novelai";

type PluginConfig = {
  portraitProvider?: PortraitProvider;
  portraitProviderEndpoint?: string;
  charactersDir?: string;
};

export function registerRenderPortraitTool(api: OpenClawPluginApi) {
  api.registerTool({
    id: "anime_character.render_portrait",
    name: "Render anime character portrait",
    description:
      "Render a portrait for a character using the configured portrait provider " +
      "(none / builtin / sd-webui / novelai). Writes PNG to disk and returns its path.",
    inputSchema: RenderPortraitInput,
    outputSchema: RenderPortraitOutput,

    // NOTE: `ctx.capabilities.imageGenerate`, `ctx.fs.*`, and `ctx.http` are
    // illustrative. Align with the actual SDK surface before shipping.
    async run(input: TInput, ctx): Promise<TOutput> {
      const config = (ctx.config ?? {}) as PluginConfig;
      const provider: PortraitProvider = config.portraitProvider ?? "builtin";
      if (provider === "none") {
        throw new Error("portraitProvider is set to 'none'; enable builtin / sd-webui / novelai first.");
      }

      const outPath = input.outputPath
        ?? `${config.charactersDir ?? "./characters"}/portraits/${input.slug}.png`;

      const bytes: Uint8Array =
        provider === "builtin"
          ? await ctx.capabilities.imageGenerate({
              positive: input.positive,
              negative: input.negative,
              styleTags: input.styleTags,
            })
          : provider === "sd-webui"
            ? await callSdWebui(ctx, config.portraitProviderEndpoint, input)
            : await callNovelAi(ctx, config.portraitProviderEndpoint, input);

      await ctx.fs.mkdirp(dirname(outPath));
      await ctx.fs.writeFile(outPath, bytes);

      return { path: outPath, provider, bytes: bytes.byteLength };
    },
  });
}

async function callSdWebui(
  ctx: any,
  endpoint: string | undefined,
  input: TInput,
): Promise<Uint8Array> {
  if (!endpoint) throw new Error("sd-webui selected but portraitProviderEndpoint is unset.");
  const res = await ctx.http.fetch(`${endpoint.replace(/\/$/, "")}/sdapi/v1/txt2img`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      prompt: [input.positive, ...input.styleTags].filter(Boolean).join(", "),
      negative_prompt: input.negative,
      steps: 28,
      width: 640,
      height: 896,
      sampler_name: "DPM++ 2M Karras",
    }),
  });
  const json = (await res.json()) as { images?: string[] };
  if (!json.images?.[0]) throw new Error("sd-webui returned no image.");
  return base64ToBytes(json.images[0]);
}

async function callNovelAi(
  _ctx: any,
  _endpoint: string | undefined,
  _input: TInput,
): Promise<Uint8Array> {
  throw new Error("novelai provider not implemented — wire /ai/generate-image here.");
}

function base64ToBytes(b64: string): Uint8Array {
  const bin = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function dirname(p: string): string {
  const i = p.lastIndexOf("/");
  return i === -1 ? "." : p.slice(0, i);
}
