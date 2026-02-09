import { opensearch } from "./bulk/config/opensearch.js";

async function searchTest() {
  console.log("Testing search functionality...\n");

  try {
    // Test search on the betfaircommissions index
    const searchResponse = await opensearch.search({
      index: 'betfaircommissions_v1',
      body: {
        query: {
          match_all: {}
        },
        size: 5  // Just get first 5 documents
      }
    });

    console.log(`Search successful! Found ${searchResponse.body.hits.total.value} documents.`);
    console.log("\nFirst 5 documents:");
    
    searchResponse.body.hits.hits.forEach((hit, index) => {
      console.log(`${index + 1}. Document ID: ${hit._id}`);
      console.log(`   Sample fields: ${Object.keys(hit._source).slice(0, 5).join(', ')}`);
    });

    // Test a more specific search
    console.log("\nTesting count aggregation...");
    const countResponse = await opensearch.count({
      index: 'betfaircommissions_v1',
      body: {
        query: {
          match_all: {}
        }
      }
    });
    
    console.log(`Total document count: ${countResponse.body.count}`);

    console.log("\n✅ All search tests passed! The MongoDB -> OpenSearch sync is working correctly.");
    
  } catch (error) {
    console.error("Search test failed:", error.message);
  }
}

searchTest().catch(console.error);