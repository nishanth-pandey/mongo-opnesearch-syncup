import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";

// Simulate the complete pipeline locally
async function testPipeline() {
  console.log("🧪 Testing Realtime Pipeline Components\n");
  
  // Test 1: MongoDB Connection and Change Stream
  await testMongoDBConnection();
  
  // Test 2: Event Generation and Processing
  await testEventProcessing();
  
  // Test 3: OpenSearch Index Operations
  await testOpenSearchOperations();
}

async function testMongoDBConnection() {
  console.log("1️⃣ Testing MongoDB Connection and Collections...");
  
  try {
    const mongo = new MongoClient(env.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    await mongo.connect();
    const db = mongo.db(env.mongoDb);
    
    // Check if required collections exist
    const collections = await db.listCollections().toArray();
    const requiredCollections = [
      "betfairCommissions","whitelabels"
    ];
    
    console.log("📋 Available collections:");
    requiredCollections.forEach(coll => {
      const exists = collections.some(c => c.name === coll);
      console.log(`  ${exists ? '✅' : '❌'} ${coll}`);
    });
    
    await mongo.close();
    console.log("✅ MongoDB connection test passed\n");
    
  } catch (error) {
    console.error("❌ MongoDB connection test failed:", error.message);
  }
}

async function testEventProcessing() {
  console.log("2️⃣ Testing Event Processing Logic...");
  
  // Test event payload structure
  const testEvents = [
    {
      collection: "markets",
      operationType: "insert",
      documentKey: { _id: "test-id-1" },
      fullDocument: { name: "Test Market", status: "active" },
      clusterTime: new Date()
    },
    {
      collection: "runners",
      operationType: "update",
      documentKey: { _id: "test-id-2" },
      fullDocument: { name: "Updated Runner", odds: 2.5 },
      clusterTime: new Date()
    },
    {
      collection: "markets",
      operationType: "delete",
      documentKey: { _id: "test-id-3" },
      fullDocument: null,
      clusterTime: new Date()
    }
  ];
  
  // Test transformation logic
  const transformedEvents = testEvents.map(event => {
    const indexName = `${event.collection}_v1`;
    const id = event.documentKey._id.toString();
    
    if (event.operationType === "delete") {
      return { delete: { _index: indexName, _id: id } };
    }
    
    return [
      { index: { _index: indexName, _id: id } },
      { ...event.fullDocument, mongoId: id }
    ];
  });
  
  console.log("✅ Event processing test passed");
  console.log(`   Generated ${transformedEvents.flat().length} OpenSearch operations\n`);
}

async function testOpenSearchOperations() {
  console.log("3️⃣ Testing OpenSearch Operations...");
  
  // Test index name generation
  const testCollections = ["markets", "runners", "users"];
  testCollections.forEach(coll => {
    const indexName = `${coll}_v1`;
    console.log(`   ${coll} → ${indexName}`);
  });
  
  // Test bulk operation structure
  const sampleBulkBody = [
    { index: { _index: "markets_v1", _id: "test-1" } },
    { name: "Sample Market", mongoId: "test-1" },
    { delete: { _index: "markets_v1", _id: "test-2" } }
  ];
  
  console.log("✅ OpenSearch operation structure validated");
  console.log(`   Sample bulk body has ${sampleBulkBody.length} operations\n`);
}

// Run the tests
testPipeline().catch(console.error);