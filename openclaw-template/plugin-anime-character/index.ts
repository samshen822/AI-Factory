import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";

import { registerGenerateCharacterCardTool } from "./src/tools/generateCharacterCard";
import { registerRenderPortraitTool } from "./src/tools/renderPortrait";
import { registerNewCharacterCommand } from "./src/commands/newCharacter";
import { registerListCharactersCommand } from "./src/commands/listCharacters";

export default definePluginEntry({
  id: "anime-character",
  register(api) {
    registerGenerateCharacterCardTool(api);
    registerRenderPortraitTool(api);
    registerNewCharacterCommand(api);
    registerListCharactersCommand(api);
  },
});
