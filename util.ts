import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import type { UpdateResult } from "mongodb";

import config from "./config.json";

export function did_update(result: UpdateResult): boolean {
  return result.modifiedCount > 0;
}

export function has_role(interaction: ChatInputCommandInteraction, role_id: string): boolean {
  return (interaction.member as GuildMember).roles.cache.some((r) => r.id === role_id);
}

export function is_admin(interaction: ChatInputCommandInteraction): boolean {
  return has_role(interaction, config.admin_role);
}

//calculate payout
export function calc_role_income_claim(last_claim: number, hours: number, income: number): [number, number] {
  const hours_since = (Date.now() - last_claim) / (60 * 60 * 1000);
  const cycles = Math.floor(hours_since / hours);
  return [cycles * income, cycles];
}

export function gen_action_row(page: number, pages: number) {
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

