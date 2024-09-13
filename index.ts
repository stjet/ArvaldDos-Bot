import { BaseInteraction, Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";

config();

import {} from "./db";
import handle_interaction from "./commands";
import role_income_poll from "./role_income";

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  role_income_poll(client);
  //
});

client.on("interactionCreate", async (interaction: BaseInteraction) => {
  if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
    return await handle_interaction(interaction);
  }
});

setTimeout(() => client.login(process.env.DISCORD_TOKEN), 3500);

