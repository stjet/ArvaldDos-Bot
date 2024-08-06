import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import { get_user, add_new_user } from "../db";
import { BotError } from "./common/error";

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const options = interaction.options;
  const target_id = (await options.get("target")).user.id;
  if (await get_user(target_id)) throw new BotError("Target is already registered");
  await add_new_user(target_id);
  return await interaction.editReply({ content: `Registered <@${target_id}>`, allowedMentions: { users: [] } });
}

const data: CommandData = {
  name: "register_user",
  description: "Register a user so they can participate in the bot economy",
  registered_only: false,
  ephemeral: false,
  admin_only: true,
  run,
};

export default data;

