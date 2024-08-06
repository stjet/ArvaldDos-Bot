import type { AutocompleteInteraction } from "discord.js";

import { get_all_items } from "../../db";

export async function item_name_autocomplete(interaction: AutocompleteInteraction) {
  return await interaction.respond((await get_all_items()).filter(
    (item) => item.name.startsWith(interaction.options.getFocused(true).value)
  ).map(
    (item) => ({ name: item.name, value: item.name })
  ));
}

