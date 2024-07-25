import { REST, Routes } from "discord.js";
import { config } from "dotenv";

config();

//description in two places is annoying but length limits are different (100 vs 1024 [but sum of all chars in embed cannot be >6000])
const commands = [
  {
    name: "help",
    description: "Get a list of commands for this bot",
  },
  {
    name: "say",
    description: "Have bot say something in a channel (admin only)",
    options: [
      {
        type: 3,
        name: "text",
        description: "What the bot should say",
        required: true,
      },
      {
        type: 7,
        name: "channel",
        description: "What guild text channel the bot should say the text in",
        required: true,
      },
    ],
  },
  {
    name: "roll",
    description: "Roll dice",
    options: [
      {
        type: 4,
        name: "dice_num",
        description: "Amount of dice to roll",
        required: true,
      },
      {
        type: 4,
        name: "dice_faces",
        description: "Max value of each dice",
        required: true,
      },
      {
        type: 5,
        name: "show_calc",
        description: "Show the calculations and each dice roll (default: true)",
        required: false,
      },
      {
        type: 5,
        name: "include_zero",
        description: "Make it possible for the dice to roll 0 (default: false)",
        required: false,
      },
    ],
  },
  //economy related
  {
    name: "register_user",
    description: "Register a user so they can participate in the bot economy (admin only)",
    options: [
      {
        type: 6,
        name: "target",
        description: "The user to register",
        required: true,
      },
    ],
  },
  {
    name: "bal",
    description: "Show you or someone else's balance",
    options: [
      {
        type: 6,
        name: "target",
        description: "The user to check the balance of",
        required: false,
      },
    ],
  },
  {
    name: "change_bal",
    description: "Change a user's balance (admin only)",
    options: [
      {
        type: 6,
        name: "target",
        description: "The user to change the balance of",
        required: true,
      },
      {
        type: 4,
        name: "amount",
        description: "Amount to add/subtract",
        required: true,
      },
      {
        type: 5,
        name: "negative_allowed",
        description: "Allow user balance to become negative (default: false)",
        required: false,
      },
    ],
  },
  {
    name: "transfer",
    description: "Send currency to another user",
    options: [
      {
        type: 6,
        name: "target",
        description: "The user to send to",
        required: true,
      },
      {
        type: 4,
        name: "amount",
        description: "Amount to transfer",
        required: true,
      },
    ],
  },
];

(new REST().setToken(process.env.DISCORD_TOKEN)).put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }).then(() => console.log("Finished reloading slash commands"));

