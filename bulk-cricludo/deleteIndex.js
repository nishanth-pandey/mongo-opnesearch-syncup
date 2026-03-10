import { client } from "./client.js";
import { env } from "./config.js";

async function deleteIndex() {
  try {
    await client.indices.delete({
      index: env.indexName,
    });

    console.log("Index deleted");
  } catch (e) {
    console.log("Index not found");
  }
}

deleteIndex();
