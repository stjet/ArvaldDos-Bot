import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import type { User } from "../db";
import config from "../config.json";
import { get_user, add_balance, sub_balance } from "../db";
import { BotError } from "./common/error";

async function run(interaction: ChatInputCommandInteraction, user: User) {
  const options = interaction.options;
  const target_id: string = (await options.get("target")).user.id;
  const amount: number = (await options.get("amount")).value as number;
  if (amount <= 0) throw new BotError("Transfer account cannot be zero or negative");
  let trans_user = await get_user(target_id);
  if (!trans_user) throw new BotError("Target is not registered");
  //no checks, baby! well, let db.ts handle it
  const enough_balance = await sub_balance(user.user, amount);
  if (!enough_balance) throw new BotError(`You do not have enough ${config.currency_plural} to transfer that amount`);
  await add_balance(target_id, amount);
  return await interaction.editReply(`<@${user.user}> transferred ${amount} ${ amount === 1 ? config.currency : config.currency_plural } to <@${target_id}>`);
}

const data: CommandData = {
  name: "transfer",
  description: "Send currency to another user",
  registered_only: true,
  ephemeral: false,
  admin_only: false,
  run,
};

export default data;

