import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { StoreItem, User } from "../db";
import { get_item, add_item_to_user, sub_item_to_user, sub_balance } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";
import { has_role } from "../util";
import config from "../config.json";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const quantity: number = (await options.get("quantity")).value as number;
  if (quantity <= 0) throw new BotError("Can't buy 0 or less of an item. Nice try");
  const item = await get_item(name);
  if (!item) throw new BotError("Item does not exist");
  if (!item.price) throw new BotError("Item is not buyable");
  if (item.roles_required.length > 0) {
    for (const role_id of item.roles_required) {
      if (!has_role(interaction, role_id)) throw new BotError("Missing one of the required roles to buy this item");
    }
  }
  if (item.items) {
    if (!item.items.every((itemm) => user.items[itemm[0]] >= itemm[1])) throw new BotError("Don't have enough of one of the items");
  }
  const total_cost = item.price * quantity;
  if (!(await sub_balance(user.user, total_cost))) throw new BotError("Not enough balance to buy this item");
  if (item.items) {
    for (const itemm of item.items) {
      await sub_item_to_user(user.user, itemm[0], itemm[1] * quantity);
    }
  }
  await add_item_to_user(user.user, item.name, quantity);
  return await interaction.editReply(`Bought ${quantity} of \`${name}\` for ${total_cost} ${ total_cost === 1 ? config.currency : config.currency_plural }${ item.items ? " and other items" : "" }`);
}

const data: CommandData = {
  name: "buy",
  description: "Buy an item from the store",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;


