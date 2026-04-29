import mongoose from "mongoose";
import { env } from "./config.js";

export async function connectMongo() {
  await mongoose.connect(env.mongo.prod.uri, {
    dbName: env.mongo.prod.db,
  });

  console.log("Mongo connected");
}
