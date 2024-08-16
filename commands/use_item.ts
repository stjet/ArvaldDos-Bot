import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { StoreItem, User } from "../db";
import { get_item, sub_item_to_user } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const quantity: number = (await options.get("quantity")).value as number;
  if (quantity <= 0) throw new BotError("Can't use 0 or less of an item");
  const item = await get_item(name);
  if (!item) throw new BotError("Item does not exist");
  if (!item.usable) throw new BotError("That item is not usable");
  if (!(await sub_item_to_user(user.user, name, quantity))) throw new BotError("You did not have enough of that item to use");
  return await interaction.editReply(`Used ${quantity} of \`${name}\``);
}

const data: CommandData = {
  name: "use_item",
  description: "Use an item (subtracts from your items)",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;



