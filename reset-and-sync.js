import { opensearch } from "./bulk/config/opensearch.js";
import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { BulkWriter } from "./bulk/sync/bulkWritter.js";
import { transformDocument } from "./bulk/sync/transform.js";

async function resetAndSyncCollection(collectionName) {
  console.log(`\n--- Resetting and syncing collection: ${collectionName} ---`);
  
  const indexName = `${collectionName}_v1`;
  
  // Step 1: Delete existing index if it exists
  try {
    await opensearch.indices.get({ index: indexName });
    console.log(`🗑️  Deleting existing index: ${indexName}`);
    await opensearch.indices.delete({ index: indexName });
    console.log(`✅ Index ${indexName} deleted`);
  } catch (error) {
    if (error.meta?.statusCode === 404) {
      console.log(`✅ Index ${indexName} does not exist, will create new one`);
    } else {
      console.error(`❌ Error checking/deleting index ${indexName}:`, error.message);
      throw error;
    }
  }
  
  // Step 2: Connect to MongoDB and sync the collection
  const mongo = new MongoClient(env.mongoUri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });
  
  try {
    await mongo.connect();
    const db = mongo.db(env.mongoDb);
    const collection = db.collection(collectionName);
    
    // Check if collection exists
    const collections = await db.listCollections().toArray();
    const collectionExists = collections.some(coll => coll.name === collectionName);
    
    if (!collectionExists) {
      throw new Error(`Collection '${collectionName}' does not exist in MongoDB`);
    }
    
    const docCount = await collection.countDocuments();
    console.log(`📊 Found ${docCount} documents in collection '${collectionName}'`);
    
    // Create new BulkWriter for this collection
    const writer = new BulkWriter(indexName);
    
    // Process documents
    const cursor = collection.find({}, { batchSize: 1000 });
    let processedCount = 0;

    for await (const doc of cursor) {
      const transformed = transformDocument(doc);
      await writer.add(transformed);
      processedCount++;
      
      if (processedCount % 5000 === 0) {
        console.log(`📝 Processed ${processedCount}/${docCount} documents in '${collectionName}'...`);
      }
    }

    // Flush remaining documents
    await writer.flush();
    
    console.log(`✅ Completed reset and sync for '${collectionName}'. Processed ${processedCount} documents.`);
    
  } finally {
    await mongo.close();
  }
}

async function resetAndSyncMultiple(collections) {
  console.log(`🔄 Resetting and syncing multiple collections: ${collections.join(', ')}`);
  
  for (const collection of collections) {
    try {
      await resetAndSyncCollection(collection);
    } catch (error) {
      console.error(`❌ Failed to reset and sync collection '${collection}':`, error.message);
      // Continue with other collections
    }
  }
  
  console.log('\n🎉 All collections reset and synced successfully!');
}

// Main execution
const collectionNames = process.argv.slice(2);

if (collectionNames.length === 0) {
  console.log("Usage: node reset-and-sync.js <collection1> [collection2] [collection3] ...");
  console.log("Example: node reset-and-sync.js markets runners runnermetadatas");
  process.exit(1);
}

resetAndSyncMultiple(collectionNames).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});