import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { Items, StoreItem, User } from "../db";
import { edit_item, get_item } from "../db";
import { BotError } from "./common/error";
import { item_name_autocomplete } from "./common/autocompletes";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const name: string = (await options.get("name")).value as string;
  const delete_existing_roles: boolean = (await options.get("delete_existing_roles")).value as boolean;
  const item = await get_item(name);
  if (!item) throw new BotError("No item of that name exists");
  const price = ((await options.get("price"))?.value ?? item.price) as (number | undefined);
  const description: string = ((await options.get("description"))?.value ?? item.description) as string;
  const usable: boolean = ((await options.get("usable"))?.value ?? item.usable) as boolean;
  //to add multiple roles, people will have to use /edit_item, I guess? augh
  const required_role = (await options.get("required_role"))?.role;
  if (price <= 0) throw new BotError("Price cannot be zero or negative");
  //name and description char limits (based on discord embed field name/value limits)
  if (description.length > 900) throw new BotError("Item description cannot be more than 1024 characters"); //true limit is 1024 but we want some margin for other info
  const existing = delete_existing_roles ? [] : item.roles_required;
  const store_item: StoreItem = {
    name,
    price,
    description,
    roles_required: required_role ? [...existing, required_role.id] : existing,
    usable,
  };
  await edit_item(store_item);
  return await interaction.editReply("Item edited");
}

const data: CommandData = {
  name: "edit_item",
  description: "Edit item",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
  autocomplete: item_name_autocomplete, //autocompletes for the "name" option
};

export default data;

