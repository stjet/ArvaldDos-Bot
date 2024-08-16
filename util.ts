import type { ChatInputCommandInteraction, GuildMember } from "discord.js";
import type { UpdateResult } from "mongodb";

export function did_update(result: UpdateResult): boolean {
  return result.modifiedCount > 0;
}

export function has_role(interaction: ChatInputCommandInteraction, role_id: string): boolean {
  return (interaction.member as GuildMember).roles.cache.some((r) => r.id === role_id);
}
