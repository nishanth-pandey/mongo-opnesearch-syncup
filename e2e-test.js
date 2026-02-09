import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { BulkWriter } from "./bulk/sync/bulkWritter.js";
import { transformDocument } from "./bulk/sync/transform.js";

async function runEndToEndTest() {
  console.log("🏁 End-to-End Pipeline Test\n");
  
  const testCollection = "betfaircommissions"; // Use the larger collection for better testing
  
  try {
    console.log(`1️⃣ Setting up test environment for ${testCollection}...`);
    
    // Connect to MongoDB
    const mongo = new MongoClient(env.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    await mongo.connect();
    const db = mongo.db(env.mongoDb);
    const collection = db.collection(testCollection);
    
    // Get sample documents
    const sampleDocs = await collection.find().limit(3).toArray();
    console.log(`📊 Retrieved ${sampleDocs.length} sample documents`);
    
    // Create test index
    const indexName = `${testCollection}_test_v1`;
    console.log(`2️⃣ Creating test index: ${indexName}`);
    
    const writer = new BulkWriter(indexName);
    
    // Process sample documents through the pipeline
    console.log("3️⃣ Processing documents through pipeline...");
    for (const doc of sampleDocs) {
      const transformed = transformDocument(doc);
      await writer.add(transformed);
    }
    
    await writer.flush();
    console.log("✅ Documents indexed successfully");
    
    // Clean up - delete test index
    console.log("4️⃣ Cleaning up test index...");
    await deleteTestIndex(indexName);
    
    await mongo.close();
    console.log("✅ End-to-end test completed successfully!");
    
  } catch (error) {
    console.error("❌ End-to-end test failed:", error.message);
    throw error;
  }
}

async function deleteTestIndex(indexName) {
  try {
    const { opensearch } = await import("./bulk/config/opensearch.js");
    await opensearch.indices.delete({ index: indexName });
    console.log(`✅ Test index ${indexName} deleted`);
  } catch (error) {
    if (error.meta?.statusCode !== 404) {
      console.warn(`⚠️  Could not delete test index ${indexName}:`, error.message);
    }
  }
}

// Run the test
runEndToEndTest().catch(error => {
  console.error("Test failed:", error);
  process.exit(1);
});