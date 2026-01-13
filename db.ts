import { MongoClient } from "mongodb";

import { did_update } from "./util";

//figure out the options and whatnot later
const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

let store, users, role_income;

client.connect().then(() => {
  console.log("Connected to the database");
  const db = client.db("db");
  store = db.collection("store");
  users = db.collection("users");
  role_income = db.collection("role_income");
  //
});

//db structure types

export type Items = Record<string, number>;

export interface StoreItem {
  name: string;
  price?: number; //if no price, not buyable and technically not a store item, but whatever
  description: string;
  roles_required: string[];
  usable: boolean;
  items?: [string, number][];
  //
};

export interface User {
  user: `${number}`; //discord user id
  balance: number;
  items: Items;
  //
};

export interface RoleIncome {
  role: `${number}`; //role id
  hours: number; //every x hours, give income
  income: number;
  last_claim: number;
  items?: [string, number][];
  //
};

//default

const DEFAULT_USER: Omit<User, "user"> = {
  balance: 0,
  items: {},
  //
};

//users collection db functions

export async function add_new_user(user: string) {
  return await users.insertOne({ user, ...DEFAULT_USER });
}

export async function get_user(user: string): Promise<User | undefined> {
  return await users.findOne({ user });
}

export async function get_all_users(): Promise<User[]> {
  return await (await users.find()).toArray();
}

export async function add_balance(user: string, amount: number) {
  return await users.updateOne({ user }, {
    $inc: {
      balance: amount,
    },
  });
}

//if false, not enough balance
export async function sub_balance(user: string, amount: number, negative_allowed: boolean = false): Promise<boolean> {
  let query: any = {
    user,
  };
  if (!negative_allowed) {
    query.balance = {
      $gte: amount,
    };
  }
  return did_update(await users.updateOne(query, {
    $inc: {
      balance: -amount,
    },
  }));
}

export async function add_item_to_user(user: string, item: string, amount: number) {
  return await users.updateOne({ user }, {
    $inc: {
      [`items.${item}`]: amount,
    },
  });
}

export async function sub_item_to_user(user: string, item: string, amount: number): Promise<boolean> {
  return did_update(await users.updateOne({
    user,
    [`items.${item}`]: {
      $gte: amount,
    },
  }, {
    $inc: {
      [`items.${item}`]: -amount,
    },
  }));
}

//to use when admin deletes an item
async function del_item_from_all_users(item: string) {
  return await users.updateMany({
    [`items.${item}`]: {
      $gte: 1,
    },
  }, {
    $set: {
      [`items.${item}`]: 0,
    },
  });
}

//store collection db functions
//so, "Submarine", "submarine", and "suBMARine" are different items. deal with it

export async function get_all_items(): Promise<StoreItem[]> {
  return await (await store.find()).toArray();
}

export async function get_item(item: string): Promise<StoreItem> {
  return await store.findOne({ name: item });
}

export async function create_item(store_item: StoreItem) {
  return await store.insertOne(store_item);
}

//assume name cannot be edited
export async function edit_item(store_item: StoreItem) {
  return await store.replaceOne({ name: store_item.name }, store_item);
}

export async function delete_item(item: string) {
  await del_item_from_all_users(item);
  return await store.deleteOne({ name: item });
}

//role income collection db functions
//actual role income payouts done with setTimeout and setInterval

export async function get_all_role_income(): Promise<RoleIncome[]> {
  return await (await role_income.find()).toArray();
}

export async function get_role_income(role: string): Promise<RoleIncome> {
  return await role_income.findOne({ role });
}

export async function create_role_income(role: string, hours: number, income: number, items?: string[]) {
  return await role_income.insertOne({
    role,
    hours,
    income,
    items,
    last_claim: Date.now(),
  });
}

export async function edit_role_income(role_income: RoleIncome) {
  return await role_income.replaceOne({ role: role_income.role }, role_income);
}

export async function update_role_income_last_claim(role: string) {
  return await role_income.updateOne({ role }, {
    $set: {
      last_claim: Date.now(),
    },
  });
}

export async function delete_role_income(role: string) {
  return await role_income.deleteOne({ role });
}

