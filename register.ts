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
        description: "Amount to add/subtract (negative allowed)",
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
  {
    name: "items",
    description: "See you or someone else's items",
    options: [
      {
        type: 6,
        name: "target",
        description: "The user to check the items of",
        required: false,
      },
    ],
  },
  {
    name: "create_item",
    description: "Create item, cannot be made unbuyable after creation (admin only)",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
      },
      {
        type: 3,
        name: "description",
        description: "Description of the item",
        required: true,
      },
      {
        type: 4,
        name: "price",
        description: "Price of the item (omit to make unbuyable)",
        required: false,
      },
      {
        type: 5,
        name: "usable",
        description: "Whether it can be /use'd (default: true)",
        required: false,
      },
      {
        type: 8,
        name: "required_role",
        description: "Roles that are required to buy this item. /edit_item to add multiple",
        required: false,
      },
      {
        type: 3,
        name: "items",
        description: "Items to give along with role income. In format name,quantity|name,quantity",
        required: false,
      },
      //
    ],
  },
  {
    name: "store",
    description: "See info about all items",
    options: [],
  },
  {
    name: "change_item_balance",
    description: "Add/remove items from a user",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
      {
        type: 4,
        name: "quantity",
        description: "Amount to add/subtract (negative allowed)",
        required: true,
      },
      {
        type: 6,
        name: "target",
        description: "The user to check the items of",
        required: true,
      },
    ],
  },
  {
    name: "buy",
    description: "Buy an item from the store",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
      {
        type: 4,
        name: "quantity",
        description: "Amount of the item to buy",
        required: true,
      },
    ],
  },
  {
    name: "use_item",
    description: "Use an item (subtracts from your items)",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
      {
        type: 4,
        name: "quantity",
        description: "Amount of the item to use",
        required: true,
      },
    ],
  },
  {
    name: "delete_item",
    description: "Delete item from the store and all users (admin only)",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
    ],
  },
  {
    name: "edit_item",
    description: "Create item (admin only)",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
      {
        type: 5,
        name: "delete_existing_roles",
        description: "If true, deletes existing required roles as requirements",
        required: true,
      },
      {
        type: 4,
        name: "price",
        description: "Price of the item",
        required: false,
      },
      {
        type: 3,
        name: "description",
        description: "Description of the item",
        required: false,
      },
      {
        type: 5,
        name: "usable",
        description: "Whether it can be /use'd",
        required: false,
      },
      {
        type: 8,
        name: "required_role",
        description: "Roles that are required to buy this item.",
        required: false,
      },
    ],
  },
  {
    name: "role_income",
    description: "See various role income related actions",
    options: [
      {
        type: 1,
        name: "list",
        description: "List all role incomes",
      },
      {
        type: 1,
        name: "create",
        description: "Create a role income (admin only)",
        options: [
          {
            type: 8,
            name: "role",
            description: "Role to give role income to",
            required: true,
          },
          {
            type: 4,
            name: "hours",
            description: "Number of hours between payouts",
            required: true,
          },
          {
            type: 4,
            name: "income",
            description: "Amount to give per user per payout",
            required: true,
          },
          {
            type: 3,
            name: "items",
            description: "Items to give along with role income. In format name,quantity|name,quantity",
            required: false,
          },
        ],
      },
      {
        type: 1,
        name: "delete",
        description: "Delete a role income (admin only)",
        options: [
          {
            type: 8,
            name: "role",
            description: "Role to give delete",
            required: true,
          },
        ],
      },
    ]
  },
  {
    name: "transfer_item",
    description: "Give a(n) item(s) to another user",
    options: [
      {
        type: 3,
        name: "name",
        description: "Name of the item",
        required: true,
        autocomplete: true,
      },
      {
        type: 6,
        name: "target",
        description: "The user to send to",
        required: true,
      },
      {
        type: 4,
        name: "quantity",
        description: "Amount to transfer",
        required: true,
      },
    ],
  },
];

(new REST().setToken(process.env.DISCORD_TOKEN)).put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands }).then(() => console.log("Finished reloading slash commands"));

