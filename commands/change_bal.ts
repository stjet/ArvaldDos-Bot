import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { User } from "../db";
import { get_user, add_balance, sub_balance } from "../db";
import { BotError } from "./error";

async function run(interaction: ChatInputCommandInteraction, _user: User) {
  const options = interaction.options;
  const target_id: string = (await options.get("target")).user.id;
  const amount: number = (await options.get("amount")).value as number;
  const negative_allowed: boolean = ((await options.get("negative_allowed"))?.value ?? false) as boolean;
  let change_user = await get_user(target_id);
  if (!change_user) throw new BotError("Target is not registered");
  if (amount >= 0) {
    await add_balance(target_id, amount);
  } else {
    const success = await sub_balance(target_id, -amount, negative_allowed);
    if (!success) throw new BotError("Failed because would make target balance negative, so `negative_allowed` must be true to do this");
  }
  return await interaction.editReply(`Changed <@${target_id}> balance by ${amount}`);
}

const data: CommandData = {
  name: "change_bal",
  description: "Change a user's balance",
  registered_only: true,
  ephemeral: false,
  admin_only: true,
  run,
};

export default data;

