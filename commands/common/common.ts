import { get_item } from "../../db";

//if return string, that is error message
export async function items_string_to_items(items_string: string): Promise<[string, number][] | string> {
  let items = [];
  for (const item of items_string.split("|")) {
    const parts = item.split(",");
    if (parts.length !== 2) return "Incorrect items format, must be `name,quantity|name,quantity`, etc";
    const quantity = Number(parts[1]);
    if (isNaN(quantity) || Math.floor(quantity) !== quantity) return "Item quantity was not an integer";
    if (!await get_item(parts[0])) return `Item \`${parts[0].replaceAll("`", "\\`")}\` does not exist`;
    items.push([parts[0], quantity]);
  }
  return items;
}

