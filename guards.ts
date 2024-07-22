import type { TextChannel } from "discord.js";
import { ChannelType } from "discord.js";

export function is_text_channel(channel: any): channel is TextChannel {
  return channel.type === ChannelType.GuildText;
}

