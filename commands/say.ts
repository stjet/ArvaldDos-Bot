import type { ChatInputCommandInteraction } from "discord.js";

import type { CommandData } from "./index";
import { BotError } from "./error";
import { is_text_channel } from "../guards";

async function run(interaction: ChatInputCommandInteraction) {
  const options = interaction.options;
  const text: string = (await options.get("text")).value as string; //100% this is a string
  const channel = (await options.get("channel")).channel;
  //screw threads, news, announcements and shit, at least for now
  if (is_text_channel(channel)) {
    try {
      await channel.send(text);
    } catch (e) {
      console.log(e);
      throw new BotError("Couldn't send message");
    }
    return await interaction.reply({ content: "Sent", ephemeral: true });
  } else {
    throw new BotError("Must be guild text channel"); //I don't think DM channels are valid to pass in here so no worries there, probably
  }
}

const data: CommandData = {
  name: "say",
  description: "Have the bot say something in a channel",
  ephemeral: true,
  admin_only: true,
  run,
  //
};

export default data;

