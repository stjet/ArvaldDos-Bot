import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import { delete_item, get_item } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  if (!(await get_item(name))) throw new BotError("No item with that name exists to delete");
  await delete_item(name);
  return await interaction.editReply(`Deleted item \`${name}\``);
}

const data: CommandData = {
  name: "delete_item",
  description: "Delete item from the store and all users",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;

