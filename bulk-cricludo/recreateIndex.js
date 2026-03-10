import { client } from "./client.js";
import { env } from "./config.js";
import { mapping } from "./mapping.js";

async function recreate() {
  try {
    await client.indices.delete({ index: env.indexName });
  } catch {}

  await client.indices.create({
    index: env.indexName,
    body: mapping,
  });

  console.log("Index recreated");
}

recreate();
