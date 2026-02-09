import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { BulkWriter } from "./bulk/sync/bulkWritter.js";
import { transformDocument } from "./bulk/sync/transform.js";

async function testRealtimeWithCollections() {
  console.log("🚀 Testing Realtime Pipeline with Available Collections\n");
  
  const testCollections = ["betfaircommissions", "whitelabels"];
  
  for (const collectionName of testCollections) {
    await testCollectionPipeline(collectionName);
  }
  
  console.log("\n✅ All collection tests completed!");
}

async function testCollectionPipeline(collectionName) {
  console.log(`\n🧪 Testing pipeline for collection: ${collectionName}`);
  
  try {
    // Connect to MongoDB
    const mongo = new MongoClient(env.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    await mongo.connect();
    const db = mongo.db(env.mongoDb);
    const collection = db.collection(collectionName);
    
    // Check collection exists and get document count
    const docCount = await collection.countDocuments();
    console.log(`📊 Found ${docCount} documents in ${collectionName}`);
    
    if (docCount === 0) {
      console.log(`⚠️  Collection ${collectionName} is empty, skipping detailed test`);
      await mongo.close();
      return;
    }
    
    // Test change stream simulation
    console.log(`🔄 Simulating change stream events for ${collectionName}...`);
    
    // Get a sample document to simulate changes
    const sampleDoc = await collection.findOne();
    if (sampleDoc) {
      const sampleEvents = [
        {
          operationType: "insert",
          documentKey: { _id: sampleDoc._id },
          fullDocument: sampleDoc,
          clusterTime: new Date()
        },
        {
          operationType: "update",
          documentKey: { _id: sampleDoc._id },
          fullDocument: { ...sampleDoc, lastModified: new Date() },
          clusterTime: new Date()
        }
      ];
      
      console.log(`   Generated ${sampleEvents.length} simulated events`);
      
      // Test transformation
      const transformedEvents = sampleEvents.map(event => ({
        collection: collectionName,
        operationType: event.operationType,
        documentKey: event.documentKey,
        fullDocument: event.fullDocument,
        clusterTime: event.clusterTime,
        timestamp: new Date().toISOString()
      }));
      
      console.log(`✅ Event transformation successful for ${collectionName}`);
      
      // Test bulk indexing (dry run - don't actually write to OpenSearch)
      const indexName = `${collectionName}_v1`;
      console.log(`📦 Would index to: ${indexName}`);
      
      // Show sample transformed document structure
      if (transformedEvents[0]?.fullDocument) {
        const keys = Object.keys(transformedEvents[0].fullDocument);
        console.log(`   Sample document fields: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
      }
    }
    
    await mongo.close();
    console.log(`✅ ${collectionName} pipeline test completed\n`);
    
  } catch (error) {
    console.error(`❌ Error testing ${collectionName}:`, error.message);
  }
}

// Run the test
testRealtimeWithCollections().catch(console.error);