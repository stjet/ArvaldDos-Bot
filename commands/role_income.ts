import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder } from "discord.js";

import type { CommandData } from "./index";
import { BotError } from "./common/error";
import type { RoleIncome } from "../db";
import { create_role_income, delete_role_income, get_role_income, get_all_role_income, edit_role_income, get_item } from "../db";
import { gen_action_row, is_admin } from "../util";
import { items_string_to_items } from "./common/common";
import config from "../config.json";

//subcommands: list, create, delete

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const subcommand = options.getSubcommand();
  if (subcommand === "list") {
    const role_incomes = await get_all_role_income();
    function gen_role_incomes_embed(role_incomes: RoleIncome[], page: number, pages: number) {
      let role_income_embed = new EmbedBuilder();
      role_income_embed.setTitle(`Role Incomes (Page ${page}/${pages})`);
      if (Object.keys(role_incomes).length === 0) {
        role_income_embed.setDescription("No role incomes");
      } else {
        role_income_embed.addFields(
          role_incomes
            .slice((page - 1) * 10, page * 10)
            .map(
              (role_income) =>
                ({
                  name: `${role_income.income} ${config.currency} every ${role_income.hours} hour(s)`,
                  value: `<@&${role_income.role}>${ role_income.items ? " (also gives " + role_income.items.map((item) => item[1] + " of `" + item[0] + "`").join(" + ") + ")" : "" }, next: <t:${Math.floor(role_income.last_claim / 1000) + role_income.hours * 60 * 60}:R>`,
                })
            )
        );
      }
      return role_income_embed;
    }
    const pages: number = Math.ceil(role_incomes.length / 10) || 1; //min of 1
    let page = 1;
    const dresp = await interaction.editReply({
      embeds: [ gen_role_incomes_embed(role_incomes, page, pages) ],
      components: [ gen_action_row(page, pages) ],
    });
    while (true) {
      try {
        let dresp_bin = await dresp.awaitMessageComponent({ filter: (bin) => bin.user.id === interaction.user.id, time: 60000 }); //bin = button interaction
        page = Number(dresp_bin.customId);
        await dresp_bin.update({
          embeds: [ gen_role_incomes_embed(role_incomes, page, pages) ],
          components: [ gen_action_row(page, pages) ],
        });
      } catch (_) {
        //errors when people stop pressing the button
        return;
      }
    }
    return await interaction.editReply("```json\n"+JSON.stringify(role_incomes)+"\n```");
  } else if (is_admin(interaction)) {
    const role_id: string = (await options.get("role")).role.id;
    if (subcommand === "create") {
      //hour, income
      const hours: number = (await options.get("hours")).value as number;
      //can be negative or zero
      const income: number = (await options.get("income")).value as number;
      const items_string = (await options.get("items"))?.value as (string | undefined);
      let items;
      if (items_string) {
        items = await items_string_to_items(items_string);
        if (typeof items === "string") throw new BotError(items);
      }
      const already_exists = await get_role_income(role_id);
      if (already_exists) return await interaction.editReply("Role income for that role already exists, delete it first.");
      await create_role_income(role_id, hours, income, items);
      return await interaction.editReply("Created role income");
    } else if (subcommand === "edit") {
      const role_income = await get_role_income(role_id);
      const income: number = (await options.get("income")).value as number;
      const items_string = (await options.get("items"))?.value as (string | undefined);
      let items;
      if (items_string) {
        items = await items_string_to_items(items_string);
        if (typeof items === "string") throw new BotError(items);
      }
      role_income.income = income;
      role_income.items = items;
      await edit_role_income(role_income);
      return await interaction.editReply("Edited role income.");
    } else if (subcommand === "delete") {
      await delete_role_income(role_id);
      return await interaction.editReply("Deleted role income");
    }
  } else {
    throw new BotError("Admin permission needed to run that command");
  }
}

const data: CommandData = {
  name: "role_income",
  description: "View, create, edit, or delete role incomes",
  registered_only: false,
  ephemeral: false,
  admin_only: false, //create, edit, and delete are admin only but checked in this file
  run,
};

export default data;

