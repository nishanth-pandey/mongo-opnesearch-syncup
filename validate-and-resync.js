import { opensearch } from "./bulk/config/opensearch.js";
import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { BulkWriter } from "./bulk/sync/bulkWritter.js";
import { transformDocument } from "./bulk/sync/transform.js";

async function validateAndResync(collectionName) {
  console.log(`Validating and potentially resyncing collection: ${collectionName}\n`);

  const indexName = `${collectionName}_v1`;
  
  try {
    // Check if index exists in OpenSearch
    let indexExists = false;
    try {
      await opensearch.indices.get({ index: indexName });
      indexExists = true;
      console.log(`✅ Index ${indexName} exists`);
    } catch (error) {
      if (error.meta.statusCode === 404) {
        console.log(`❌ Index ${indexName} does not exist`);
        indexExists = false;
      } else {
        throw error;
      }
    }

    if (indexExists) {
      // Get document count from OpenSearch
      const opensearchCountResponse = await opensearch.count({
        index: indexName,
        body: {
          query: {
            match_all: {}
          }
        }
      });
      const opensearchCount = opensearchCountResponse.body.count;
      console.log(`📊 Documents in OpenSearch index: ${opensearchCount}`);

      // Get document count from MongoDB
      const mongo = new MongoClient(env.mongoUri, {
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true
      });
      await mongo.connect();
      
      const db = mongo.db(env.mongoDb);
      const mongoCollection = db.collection(collectionName);
      const mongoCount = await mongoCollection.countDocuments();
      console.log(`📊 Documents in MongoDB collection: ${mongoCount}`);
      
      await mongo.close();

      // Compare counts
      if (opensearchCount === mongoCount) {
        console.log(`✅ Document counts match. Index is up-to-date.`);
        return;
      } else {
        console.log(`⚠️  Document counts don't match (${opensearchCount} vs ${mongoCount}). Initiating resync...`);
      }
    } else {
      console.log(`⚠️  Index doesn't exist. Initiating initial sync...`);
    }

    // Delete existing index if it exists
    if (indexExists) {
      console.log(`🗑️  Deleting existing index: ${indexName}`);
      try {
        await opensearch.indices.delete({ index: indexName });
        console.log(`✅ Index ${indexName} deleted successfully`);
      } catch (error) {
        if (error.meta.statusCode !== 404) {
          console.error(`❌ Error deleting index:`, error.message);
          throw error;
        } else {
          console.log(`ℹ️  Index was already deleted`);
        }
      }
    }

    // Run the sync process
    console.log(`🔄 Starting fresh sync for collection: ${collectionName}`);
    
    const mongo = new MongoClient(env.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    await mongo.connect();
    
    const db = mongo.db(env.mongoDb);
    const collection = db.collection(collectionName);
    
    const writer = new BulkWriter(indexName);
    
    const cursor = collection.find({}, { batchSize: 1000 });
    let processedCount = 0;

    for await (const doc of cursor) {
      const transformed = transformDocument(doc);
      await writer.add(transformed);
      processedCount++;
      
      if (processedCount % 1000 === 0) {
        console.log(`📝 Processed ${processedCount} documents...`);
      }
    }

    await writer.flush();
    await mongo.close();

    console.log(`✅ Fresh sync completed successfully! Processed ${processedCount} documents.`);

    // Final validation
    const finalCountResponse = await opensearch.count({
      index: indexName,
      body: {
        query: {
          match_all: {}
        }
      }
    });
    const finalCount = finalCountResponse.body.count;
    
    console.log(`🎉 Final validation: ${finalCount} documents in OpenSearch index ${indexName}`);
    
  } catch (error) {
    console.error(`❌ Error during validation and resync:`, error.message);
    throw error;
  }
}

// Get collection name from command line arguments
const collectionName = process.argv[2];
if (!collectionName) {
  console.error("Usage: node validate-and-resync.js <collectionName>");
  process.exit(1);
}

validateAndResync(collectionName).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});