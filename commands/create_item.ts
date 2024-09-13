import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { Items, StoreItem, User } from "../db";
import { create_item, get_item } from "../db";
import { BotError } from "./common/error";
import { items_string_to_items } from "./common/common";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const price = (await options.get("price"))?.value as (number | undefined);
  const description: string = (await options.get("description")).value as string;
  const usable: boolean = ((await options.get("usable"))?.value ?? true) as boolean;
  const items_string = (await options.get("items"))?.value as (string | undefined);
  if (name.includes("`") || name.includes(",") || name.includes("|")) throw new BotError("Item name cannot include the following characters:`|,"); //don't want to escape shit
  //to add multiple roles, people will have to use /edit_item, I guess? augh
  const required_role = (await options.get("required_role"))?.role;
  if (price <= 0) throw new BotError("Price cannot be zero or negative"); //undefined < 0 is false btw
  //name and description char limits (based on discord embed field name/value limits)
  if (name.length > 200) throw new BotError("Item name cannot be more than 256 characters"); //true limit is 256 (still might error if currency name is more than like 50 characters, or price is absurdly huge)
  if (description.length > 900) throw new BotError("Item description cannot be more than 1024 characters"); //true limit is 1024 but we want some margin for other info
  if (await get_item(name)) throw new BotError("Item with that name already exists. Use a different name, or /edit_item or /delete_item");
  let items;
  if (items_string) {
    items = await items_string_to_items(items_string);
    if (typeof items === "string") throw new BotError(items);
  }
  const store_item: StoreItem = {
    name,
    price,
    description,
    roles_required: required_role ? [required_role.id] : [],
    usable,
    items,
  };
  await create_item(store_item);
  return await interaction.editReply("Item created");
}

const data: CommandData = {
  name: "create_item",
  description: "Create item, cannot be made unbuyable after creation",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
};

export default data;

