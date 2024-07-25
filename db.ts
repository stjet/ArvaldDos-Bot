import { MongoClient } from "mongodb";

import { did_update } from "./util";

//figure out the options and whatnot later
const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

let store, users, roleincome;

client.connect().then(() => {
  console.log("Connected to the database");
  const db = client.db("db");
  store = db.collection("store");
  users = db.collection("users");
  roleincome = db.collection("roleincome");
  //
});

//db structure types

export interface StoreItem {
  //
};

export interface User {
  user: `${number}`; //discord user id
  balance: number;
  items: Record<string, number>;
  //
};

export interface RoleIncome {
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
  return await users.updateOne({
    user,
    [`items.${item}`]: {
      $gte: amount,
    },
  }, {
    $inc: {
      [`items.${item}`]: -amount,
    },
  });
}

//

