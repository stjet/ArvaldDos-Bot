//also: edit_item, delete_item, store, buy, use_item, (admin: /take_item, /add_item)

import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { Items, StoreItem, User } from "../db";
import { create_item, get_item } from "../db";
import { BotError } from "./common/error";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const price: number = (await options.get("price")).value as number;
  const description: string = (await options.get("description")).value as string;
  const usable: boolean = ((await options.get("usable"))?.value ?? true) as boolean;
  if (name.includes("`")) throw new BotError("Item name cannot include the ` character"); //don't want to escape shit
  //to add multiple roles, people will have to use /edit_item, I guess? augh
  const required_role = (await options.get("required_role"))?.role;
  if (price < 0) throw new BotError("Price cannot be negative");
  //name and description char limits (based on discord embed field name/value limits)
  if (name.length > 200) throw new BotError("Item name cannot be more than 256 characters"); //true limit is 256 (still might error if currency name is more than like 50 characters, or price is absurdly huge)
  if (description.length > 900) throw new BotError("Item description cannot be more than 1024 characters"); //true limit is 1024 but we want some margin for other info
  if (await get_item(name)) throw new BotError("Item with that name already exists. Use a different name, or /edit_item or /delete_item");
  const store_item: StoreItem = {
    name,
    price,
    description,
    roles_required: required_role ? [required_role.id] : [],
    usable,
  };
  await create_item(store_item);
  return await interaction.editReply("Item created");
}

const data: CommandData = {
  name: "create_item",
  description: "Create item",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
};

export default data;

