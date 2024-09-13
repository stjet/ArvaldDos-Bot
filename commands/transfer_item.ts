import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { StoreItem, User } from "../db";
import { get_item, get_user, add_item_to_user, sub_item_to_user } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const target_id: string = (await options.get("target")).user.id;
  const quantity: number = (await options.get("quantity")).value as number;
  if (quantity <= 0) throw new BotError("Can't transfer 0 or less of an item");
  let trans_user = await get_user(target_id);
  if (!trans_user) throw new BotError("Target is not registered");
  const item = await get_item(name);
  if (!item) throw new BotError("Item does not exist");
  if (!(await sub_item_to_user(user.user, name, quantity))) throw new BotError("You did not have enough of that item to transfer");
  await add_item_to_user(target_id, item.name, quantity);
  return await interaction.editReply(`Transferred ${quantity} of \`${name}\` to <@${target_id}>`);
}

const data: CommandData = {
  name: "transfer_item",
  description: "Give a(n) item(s) to another user",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;

