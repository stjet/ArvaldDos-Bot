import { BaseInteraction, Client, GatewayIntentBits } from "discord.js";
import { config } from "dotenv";

config();

import {} from "./db";
import run from "./commands";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);
  //
});

client.on("interactionCreate", async (interaction: BaseInteraction) => {
  //
  if (interaction.isChatInputCommand()) {
    return await run(interaction);
  }
});

setTimeout(() => client.login(process.env.DISCORD_TOKEN), 3000);

