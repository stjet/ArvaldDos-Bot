import type { ChatInputCommandInteraction } from "discord.js";
import { randomInt } from "crypto";

import type { CommandData } from "./index";
import { BotError } from "./error";

const MAX_DICE: number = 100;
const MAX_FACES: number = 9999;

async function run(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply(); //do these options.get things need to be await?? kinda stupid
  const options = interaction.options;
  const dice_num: number = (await options.get("dice_num")).value as number;
  const dice_faces: number = (await options.get("dice_faces")).value as number;
  const show_calc: boolean = ((await options.get("show_calc"))?.value ?? true) as boolean;
  const include_zero: boolean = ((await options.get("include_zero"))?.value ?? false) as boolean;
  if (dice_num < 1) throw new BotError("Must roll at least 1 dice, obviously");
  //semi-arbitrary limits, discord messages can be max 2000 chars long
  if (dice_num > MAX_DICE) throw new BotError(`Max of ${MAX_DICE} dice`);
  if (dice_faces > 9999) throw new BotError(`Max of ${MAX_FACES} faces`);
  let rolls: number[] = [];
  for (let i = 0; i < dice_num; i++) {
    rolls.push(randomInt(include_zero ? 0 : 1, dice_faces + 1));
  }
  const result: number = rolls.reduce((accum, roll) => accum + roll, 0);
  return await interaction.editReply(`Result: **${result}** ${ show_calc ? `(${ rolls.join(" + ")} = ${result})` : "" }`);
}

const data: CommandData = {
  name: "roll",
  description: "Roll dice",
  ephemeral: false,
  admin_only: false,
  run,
  //
};

export default data;

