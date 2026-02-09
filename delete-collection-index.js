import { opensearch } from "./bulk/config/opensearch.js";

async function deleteCollectionIndex(collectionName) {
  if (!collectionName) {
    console.error("Usage: node delete-collection-index.js <collectionName>");
    process.exit(1);
  }

  const indexName = `${collectionName}_v1`;
  
  console.log(`Attempting to delete index: ${indexName}`);
  
  try {
    // Check if the index exists
    try {
      await opensearch.indices.get({ index: indexName });
      console.log(`✅ Index ${indexName} exists and is about to be deleted...`);
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        console.log(`❌ Index ${indexName} does not exist`);
        console.log("Nothing to delete.");
        return;
      } else {
        console.error(`❌ Error checking index existence:`, error.message);
        throw error;
      }
    }

    // Delete the index
    const response = await opensearch.indices.delete({ index: indexName });
    
    if (response.meta.statusCode === 200) {
      console.log(`✅ Index ${indexName} deleted successfully!`);
    } else {
      console.log(`⚠️  Unexpected response when deleting index:`, response);
    }
  } catch (error) {
    console.error(`❌ Error deleting index ${indexName}:`, error.message);
    process.exit(1);
  }
}

// Get collection name from command line arguments
const collectionName = process.argv[2];

deleteCollectionIndex(collectionName).then(() => {
  console.log("Operation completed.");
}).catch(error => {
  console.error("Script failed:", error);
  process.exit(1);
});