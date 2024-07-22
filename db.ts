import { MongoClient } from "mongodb";

//figure out the options and whatnot later
const client = new MongoClient(process.env.MONGO_CONNECTION_STRING);

let store, users, income;

client.connect().then(() => {
  console.log("Connected to the database");
  //
});

