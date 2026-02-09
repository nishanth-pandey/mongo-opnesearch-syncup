import { opensearch } from "./bulk/config/opensearch.js";

async function checkIndexes() {
  console.log("Checking OpenSearch indexes...\n");

  try {
    // Get all indexes
    const response = await opensearch.cat.indices({ format: 'json' });
    
    console.log("Current indexes in OpenSearch:");
    if (response.body && response.body.length > 0) {
      response.body.forEach(index => {
        console.log(`- ${index.index} (health: ${index.health}, docs: ${index['docs.count']}, store: ${index['store.size']})`);
      });
    } else {
      console.log("No indexes found");
    }
    
    // Check for our specific indexes that should have been created
    console.log("\nLooking for betfaircommissions_v1 index specifically...");
    try {
      const mapping = await opensearch.indices.getMapping({
        index: 'betfaircommissions_v1'
      });
      console.log('✅ betfaircommissions_v1 index exists');
      
      const stats = await opensearch.indices.stats({
        index: 'betfaircommissions_v1'
      });
      console.log(`Documents in betfaircommissions_v1: ${stats.body.indices['betfaircommissions_v1'].primaries.docs.count}`);
    } catch (error) {
      console.log('❌ betfaircommissions_v1 index does not exist yet');
    }
    
  } catch (error) {
    console.error("Error checking indexes:", error.message);
  }
}

checkIndexes().catch(console.error);