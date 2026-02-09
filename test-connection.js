import { MongoClient } from "mongodb";
import { env } from "./bulk/config/env.js";
import { opensearch } from "./bulk/config/opensearch.js";

async function testConnections() {
  console.log("Testing connections...\n");

  // Test MongoDB connection
  try {
    console.log("1. Testing MongoDB connection...");
    const mongo = new MongoClient(env.mongoUri, {
      tls: true,
      tlsAllowInvalidCertificates: true,
      tlsAllowInvalidHostnames: true
    });
    
    await mongo.connect();
    console.log("✅ MongoDB connection successful");
    
    // List collections to verify access
    const db = mongo.db(env.mongoDb);
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections in database`);
    
    await mongo.close();
    console.log("MongoDB connection closed\n");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
  }

  // Test OpenSearch connection
  try {
    console.log("2. Testing OpenSearch connection...");
    const health = await opensearch.cluster.health();
    console.log("✅ OpenSearch connection successful");
    console.log("OpenSearch cluster status:", health.body.status);
    
    // Test basic info
    const info = await opensearch.info();
    console.log("OpenSearch version:", info.body.version.number);
  } catch (error) {
    console.error("❌ OpenSearch connection failed:", error.message);
  }
  
  console.log("\nConnection test completed!");
}

testConnections().catch(console.error);