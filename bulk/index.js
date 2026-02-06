import { MongoClient } from "mongodb";
import { env } from "./config/env.js";
import { BulkWriter } from "./sync/bulkWriter.js";
import { transformDocument } from "./sync/transform.js";

async function run() {
  const collectionName = process.argv[2];
  if (!collectionName) {
    throw new Error("Usage: node index.js <collectionName>");
  }

  console.log(`Starting bulk sync for collection: ${collectionName}`);

  const mongo = new MongoClient(env.mongoUri);
  await mongo.connect();

  const db = mongo.db(env.mongoDb);
  const collection = db.collection(collectionName);

  const indexName = `${collectionName}_v1`;
  const writer = new BulkWriter(indexName);

  const cursor = collection.find({}, { batchSize: 1000 });

  for await (const doc of cursor) {
    const transformed = transformDocument(doc);
    await writer.add(transformed);
  }

  await writer.flush();
  await mongo.close();

  console.log("Bulk sync completed successfully");
}

run().catch((err) => {
  console.error("Bulk sync failed:", err);
  process.exit(1);
});
