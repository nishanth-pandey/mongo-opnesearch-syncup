import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { BulkWriter } from "./bulk/sync/bulkWritter.js";
import { transformDocument } from "./bulk/sync/transform.js";
import { opensearch } from "./bulk/config/opensearch.js";

async function syncMultipleCollections(collectionNames) {
  console.log(`Starting bulk sync for collections: ${collectionNames.join(', ')}\n`);

  const mongo = new MongoClient(env.mongoUri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });
  await mongo.connect();
  
  const db = mongo.db(env.mongoDb);

  try {
    for (const collectionName of collectionNames) {
      console.log(`\n--- Processing collection: ${collectionName} ---`);
      
      // Check if collection exists
      const collections = await db.listCollections().toArray();
      const collectionExists = collections.some(coll => coll.name === collectionName);
      
      if (!collectionExists) {
        console.log(`❌ Collection '${collectionName}' does not exist in MongoDB`);
        continue;
      }

      const collection = db.collection(collectionName);
      const docCount = await collection.countDocuments();
      console.log(`📊 Found ${docCount} documents in collection '${collectionName}'`);

      // Create index name
      const indexName = `${collectionName}_v1`;
      
      // Delete existing index if it exists
      try {
        await opensearch.indices.get({ index: indexName });
        
        // If we reach here, the index exists, so delete it
        console.log(`🗑️  Deleting existing index: ${indexName}`);
        await opensearch.indices.delete({ index: indexName });
        console.log(`✅ Index ${indexName} deleted`);
      } catch (error) {
        if (error.meta?.statusCode !== 404) {
          console.error(`⚠️  Could not check/delete index ${indexName}:`, error.message);
        } else {
          console.log(`✅ Index ${indexName} does not exist, will create new one`);
        }
      }

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
      
      console.log(`✅ Completed sync for '${collectionName}'. Processed ${processedCount} documents.`);
    }
  } finally {
    await mongo.close();
  }

  console.log('\n🎉 All collections synced successfully!');
}

async function checkExistingIndices(collections) {
  console.log("Checking existing indices...\n");
  
  for (const collectionName of collections) {
    const indexName = `${collectionName}_v1`;
    
    try {
      await opensearch.indices.get({ index: indexName });
      const countResponse = await opensearch.count({
        index: indexName,
        body: {
          query: {
            match_all: {}
          }
        }
      });
      console.log(`📊 Index ${indexName}: ${countResponse.body.count} documents`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log(`❌ Index ${indexName}: Does not exist`);
      } else {
        console.log(`⚠️  Index ${indexName}: Error checking - ${error.message}`);
      }
    }
  }
  console.log('');
}

// Main execution
async function main() {
  // Get collection names from command line arguments or use defaults
  const collectionNames = process.argv.slice(2);
  
  if (collectionNames.length === 0) {
    console.log("Usage: node bulk-multiple-collections.js <collection1> [collection2] [collection3] ...");
    console.log("Example: node bulk-multiple-collections.js markets runners runnermetadatas");
    process.exit(1);
  }

  // First, check existing indices
  await checkExistingIndices(collectionNames);

  // Proceed with sync
  console.log(`🔄 Starting sync for: ${collectionNames.join(', ')}`);
  await syncMultipleCollections(collectionNames);
}

main().catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});