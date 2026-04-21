# Changelog

## [1.0.0] - 2026-04-21

### Added
- Initial plugin release.
- Tool `anime_character.generate`: TypeBox-schemad structured character card with internal-consistency enforcement.
- Tool `anime_character.render_portrait`: portrait render with `none` / `builtin` / `sd-webui` / `novelai` providers.
- Slash commands `/new-character` and `/list-characters`.
- Bundled skill `anime-character-creator` teaches the agent when to call the tools.
- Config schema: `defaultGenre` / `nsfwPolicy` / `portraitProvider` / `portraitProviderEndpoint` / `charactersDir`.
- Guards: real-person rejection, named-character copycat warning, age-aware visual-prompt hardening, ability/weakness pairing.

<!--
Publish:
  pnpm install
  pnpm tsc --noEmit                                    # type-check
  clawhub login                                        # GitHub account ≥1 week
  clawhub package publish your-org/openclaw-anime-character --dry-run
  clawhub package publish your-org/openclaw-anime-character

Install (user side):
  openclaw plugins install clawhub:@your-org/openclaw-anime-character
  openclaw gateway restart
-->
