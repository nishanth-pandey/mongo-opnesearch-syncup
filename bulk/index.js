import { MongoClient } from "mongodb";
import { env } from "./config/env.js";
import { collectionIndexMap } from "./config/opensearch/collectionIndexMap.js";
import { BulkWriter } from "./sync/bulkWritter.js";
import { transformDocument } from "./sync/transform.js";

async function dumpCollection(db, collectionName, indexName) {
  console.log(`\n🚀 Syncing ${collectionName} → ${indexName}`);

  const collection = db.collection(collectionName);
  const writer = new BulkWriter(indexName, collectionName);

  const cursor = collection.find({}, { batchSize: 1000 });

  let count = 0;

  for await (const doc of cursor) {
    const transformed = transformDocument(doc);
    await writer.add(transformed);
    count++;
  }

  await writer.finish();

  console.log(`🎉 ${collectionName} completed. Total docs: ${count}`);
}

async function run() {
  const targetEnv = process.argv[2];

  if (!targetEnv || !collectionIndexMap[targetEnv]) {
    throw new Error("Usage: node index.js <stag | prod>");
  }

  console.log(`🌍 ENV: ${targetEnv}`);

  const mongo = new MongoClient(env.mongo[targetEnv].uri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true,
  });

  await mongo.connect();

  console.log("✅ Connected to MongoDB");

  const db = mongo.db(env.mongo[targetEnv].dbName);

  const mappings = collectionIndexMap[targetEnv];

  for (const [collectionName, indexName] of Object.entries(mappings)) {
    await dumpCollection(db, collectionName, indexName);
  }

  await mongo.close();

  console.log("\n🏁 ALL COLLECTIONS SYNCED SUCCESSFULLY");
}

run().catch((err) => {
  console.error("❌ Bulk sync failed:", err);
  process.exit(1);
});
