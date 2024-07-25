import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { EmbedBuilder } from "discord.js";

import type { User } from "../db";
import { get_user } from "../db";
import { BotError } from "./error";
import config from "../config.json";

import say from "./say";
import roll from "./roll";
import register_user from "./register_user";
import bal from "./bal";
import change_bal from "./change_bal";
import transfer from "./transfer";

export interface CommandData {
  name: string;
  description: string;
  registered_only: boolean; //also means interaction will get deferReply()ed
  ephemeral: boolean;
  admin_only: boolean;
  run: (interaction: ChatInputCommandInteraction, user?: User) => Promise<any>;
};

const commands: CommandData[] = [say, roll, register_user, bal, change_bal, transfer];

function is_admin(interaction: ChatInputCommandInteraction): boolean {
  return (interaction.member as GuildMember).roles.cache.some((r) => r.id === config.admin_role);
}

export default async function run(interaction: ChatInputCommandInteraction) {
  const name = interaction.commandName;

  //help command is "auto-generated"
  if (name === "help") {
    //max of 25 fields per embed, so if too many commands, this section needs a rewrite
    let embeds = [];
    let help_embed = new EmbedBuilder();
    help_embed.setTitle("Help");
    for (const c of commands.filter((c) => !c.admin_only)) {
      help_embed.addFields([{
        name: `/${c.name}`,
        value: c.description,
      }]);
    }
    embeds.push(help_embed);
    if (is_admin(interaction)) {
      let admin_help_embed = new EmbedBuilder();
      admin_help_embed.setTitle("Help (admin only)");
      for (const c of commands.filter((c) => c.admin_only)) {
        admin_help_embed.addFields([{
          name: `/${c.name}`,
          value: c.description,
        }]);
      }
      embeds.push(admin_help_embed);
    }
    return await interaction.reply({ embeds, ephemeral: true });
  }

  const found = commands.find((c) => c.name === name);
  try {
    //admin stuff should be ideally handled by register.ts, but this is a fallback
    if (found.admin_only && !is_admin(interaction)) throw new BotError("Admin permission needed to run that command");
    if (found.registered_only) {
      await interaction.deferReply();
      const user = await get_user(interaction.user.id);
      if (!user) throw new BotError("You must be registered by an admin to use this command");
      await found.run(interaction, user);
      return;
    }
    await found.run(interaction);
    return;
  } catch (e) {
    if (e instanceof BotError) {
      //send error message to that channel
      if (interaction.deferred) {
        return await interaction.editReply(String(e));
      } else {
        return await interaction.reply({ content: String(e), ephemeral: found.ephemeral });
      }
    } else {
      //an actual error
      //console.log(e);
      throw e; //crash it
    }
  }
}

