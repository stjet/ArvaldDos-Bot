import type { ChatInputCommandInteraction } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import type { CommandData } from "./index";
import type { StoreItem } from "../db";
import config from "../config.json";
import { get_all_items } from "../db";
import { BotError } from "./common/error";

async function run(interaction: ChatInputCommandInteraction) {
  function gen_store_embed(store_items: StoreItem[], page: number, pages: number) {
    let store_embed = new EmbedBuilder();
    store_embed.setTitle(`Store (Page ${page}/${pages})`);
    //
    if (store_items.length === 0) {
      store_embed.setDescription("No items");
    } else {
      //
      store_embed.addFields(
        store_items
          .slice((page - 1) * 10, page * 10)
          .map(
            (store_item: StoreItem) =>
              ({
                name: `${store_item.name} (${store_item.price} ${ store_item.price === 1 ? config.currency : config.currency_plural })`,
                value: `${store_item.description}\nUsable: ${store_item.usable}${ store_item.roles_required.length === 0 ? "" : `\nRoles required: ${store_item.roles_required.map((role_id) => `<@&${role_id}>`).join("")}` }`,
              })
          )
      );
    }
    return store_embed;
  }
  function gen_action_row(page: number, pages: number) {
    let action_row = new ActionRowBuilder<ButtonBuilder>();
    let action_prev = new ButtonBuilder()
      .setCustomId(String(page - 1))
      .setLabel("Prev")
      .setEmoji("⬅️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page - 1 === 0);
    let action_next = new ButtonBuilder()
      .setCustomId(String(page + 1))
      .setLabel("Next")
      .setEmoji("➡️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page + 1 > pages);
    action_row.addComponents(action_prev, action_next);
    return action_row;
  }
  await interaction.deferReply({ ephemeral: true });
  const store_items: StoreItem[] = await get_all_items();
  //list items in items embed, if too many, make sure pagination buttons work
  const pages: number = Math.ceil(store_items.length / 10) || 1; //min of 1
  let page = 1;
  const dresp = await interaction.editReply({
    embeds: [ gen_store_embed(store_items, page, pages) ],
    components: [ gen_action_row(page, pages) ],
  });
  while (true) {
    try {
      let dresp_bin = await dresp.awaitMessageComponent({ filter: (bin) => bin.user.id === interaction.user.id, time: 60000 }); //bin = button interaction
      page = Number(dresp_bin.customId);
      await dresp_bin.update({
        embeds: [ gen_store_embed(store_items, page, pages) ],
        components: [ gen_action_row(page, pages) ],
      });
    } catch (_) {
      //errors when people stop pressing the button
      return;
    }
  }
}

const data: CommandData = {
  name: "store",
  description: "See info about all items",
  registered_only: false,
  ephemeral: true,
  admin_only: false,
  run,
};

export default data;


