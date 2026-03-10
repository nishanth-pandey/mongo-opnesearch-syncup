import mongoose from "mongoose";
import { env } from "./config.js";

export async function connectMongo() {
  await mongoose.connect(env.mongo.stag.uri, {
    dbName: env.mongo.stag.db,
  });

  console.log("Mongo connected");
}
