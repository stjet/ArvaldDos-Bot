import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { Items, StoreItem, User } from "../db";
import { get_item, get_user, add_item_to_user, sub_item_to_user } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const quantity: number = (await options.get("quantity")).value as number;
  const target = (await options.get("target")).user;
  if (!(await get_user(target.id))) throw new BotError("Target is not registered");
  if (!(await get_item(name))) throw new BotError("No such item exists");
  if (quantity < 0) {
    if (!(await sub_item_to_user(target.id, name, -quantity))) throw new BotError("Cannot remove more items from that user's inventory than they actually have");
    return await interaction.editReply(`Removed ${-quantity} of item \`${name}\` to <@${target.id}>`);
  } else {
    await add_item_to_user(target.id, name, quantity);
    return await interaction.editReply(`Added ${quantity} of item \`${name}\` to <@${target.id}>`);
  }
}

const data: CommandData = {
  name: "change_item_balance",
  description: "Add/remove items from a user (admin only)",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;

