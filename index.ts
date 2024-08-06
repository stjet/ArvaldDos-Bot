import { BaseInteraction, Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";

config();

import {} from "./db";
import handle_interaction from "./commands";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  //
});

client.on("interactionCreate", async (interaction: BaseInteraction) => {
  if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
    return await handle_interaction(interaction);
  }
});

setTimeout(() => client.login(process.env.DISCORD_TOKEN), 3000);

