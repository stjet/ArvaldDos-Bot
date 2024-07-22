import { Client, BaseInteraction } from "discord.js";
import { config } from "dotenv";

//import db from "./db";
import run from "./commands";

config();

const client = new Client({ intents: [] });

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

setTimeout(() => client.login(process.env.DISCORD_TOKEN), 2000);

