import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder } from "discord.js";

import type { CommandData } from "./index";
import type { Items, User } from "../db";
import { get_user } from "../db";
import { BotError } from "./common/error";
import { gen_action_row } from "../util";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  function gen_items_embed(items_target, items: Items, page: number, pages: number) {
    let items_embed = new EmbedBuilder();
    items_embed.setTitle(`${items_target.tag} Items (Page ${page}/${pages})`);
    if (Object.keys(items).length === 0) {
      items_embed.setDescription("No items");
    } else {
      items_embed.addFields(
        Object.keys(items)
          .slice((page - 1) * 10, page * 10)
          .map(
            (item_name) =>
              ({
                name: item_name,
                value: String(items[item_name]),
              })
          )
      );
    }
    return items_embed;
  }
  const options = interaction.options;
  const target = (await options.get("target"))?.user;
  let items_target = target ?? interaction.user;
  let items_user = target ? await get_user(target.id) : user;
  if (!items_user) throw new BotError("Target is not registered"); //must be target
  //filter out items which the user owns 0 of, but is in their items record thing
  const items: Items = Object.keys(items_user.items).filter((item) => items_user.items[item] > 0).reduce((accum, item) => {
    accum[item] = items_user.items[item];
    return accum;
  }, {});
  //list items in items embed, if too many, make sure pagination buttons work
  const pages: number = Math.ceil(Object.keys(items).length / 10) || 1; //min of 1
  let page = 1;
  const dresp = await interaction.editReply({
    embeds: [ gen_items_embed(items_target, items, page, pages) ],
    components: [ gen_action_row(page, pages) ],
  });
  while (true) {
    try {
      let dresp_bin = await dresp.awaitMessageComponent({ filter: (bin) => bin.user.id === interaction.user.id, time: 60000 }); //bin = button interaction
      page = Number(dresp_bin.customId);
      await dresp_bin.update({
        embeds: [ gen_items_embed(items_target, items, page, pages) ],
        components: [ gen_action_row(page, pages) ],
      });
    } catch (_) {
      //errors when people stop pressing the button
      return;
    }
  }
}

const data: CommandData = {
  name: "items",
  description: "See you or someone else's items",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
};

export default data;

