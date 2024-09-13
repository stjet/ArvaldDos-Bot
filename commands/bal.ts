import type { ChatInputCommandInteraction } from "discord.js";
import { EmbedBuilder } from "discord.js";

import type { CommandData } from "./index";
import type { User } from "../db";
import config from "../config.json";
import { get_user } from "../db";
import { BotError } from "./common/error";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  const options = interaction.options;
  const target = (await options.get("target"))?.user;
  let bal_embed = new EmbedBuilder();
  let bal_target = target ?? interaction.user;
  let bal_user = target ? await get_user(target.id) : user;
  if (!bal_user) throw new BotError("Target is not registered"); //must be target
  bal_embed.setTitle(`${bal_target.tag}'s Balance`);
  bal_embed.setDescription(`${bal_user.balance} ${ bal_user.balance === 1 ? config.currency : config.currency_plural }`);
  return await interaction.editReply({ embeds: [ bal_embed ] });
}

const data: CommandData = {
  name: "bal",
  description: "Show you or someone else's balance",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
};

export default data;

