import { Client } from "@opensearch-project/opensearch";

const client = new Client({
  node: process.env.OPENSEARCH_NODE.replace('/_dashboards', ''),
  auth: {
    username: process.env.OPENSEARCH_USER,
    password: process.env.OPENSEARCH_PASS,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function bulkIndex(events) {
  if (events.length === 0) {
    console.log("📭 No events to index");
    return;
  }

  console.log(`📤 Bulk indexing ${events.length} events`);
  
  const body = [];
  const operationStats = {
    index: 0,
    delete: 0,
    errors: []
  };

  for (const event of events) {
    const index = `${event.collection}_v1`;
    const id = event.documentKey._id.toString();

    try {
      if (event.operationType === "delete") {
        body.push({ delete: { _index: index, _id: id } });
        operationStats.delete++;
        continue;
      }

      // Validate fullDocument exists for non-delete operations
      if (!event.fullDocument) {
        console.warn(`⚠️ Skipping ${event.operationType} operation - no fullDocument for ${id}`);
        continue;
      }

      body.push(
        { index: { _index: index, _id: id } },
        { 
          ...event.fullDocument, 
          mongoId: id,
          lastModified: event.timestamp || new Date().toISOString()
        }
      );
      operationStats.index++;

    } catch (error) {
      console.error(`❌ Error processing event for ${id}:`, error.message);
      operationStats.errors.push({
        id,
        error: error.message,
        event
      });
    }
  }

  if (body.length === 0) {
    console.log("📭 No valid operations to perform");
    return;
  }

  try {
    console.log(`⚡ Executing bulk operation: ${operationStats.index} index, ${operationStats.delete} delete`);
    
    const response = await client.bulk({ 
      body,
      refresh: 'wait_for' // Ensure changes are immediately searchable
    });

    if (response.errors) {
      const errorItems = response.items.filter(item => 
        item.index?.error || item.delete?.error
      );
      
      console.error(`❌ Bulk indexing completed with ${errorItems.length} errors`);
      
      // Log first few errors for debugging
      errorItems.slice(0, 5).forEach(item => {
        console.error("Error details:", JSON.stringify(item, null, 2));
      });
      
      throw new Error(`Bulk indexing failed with ${errorItems.length} errors`);
    }

    console.log(`✅ Bulk indexing successful: ${operationStats.index} indexed, ${operationStats.delete} deleted`);
    
    // Log any processing errors
    if (operationStats.errors.length > 0) {
      console.warn(`⚠️ Encountered ${operationStats.errors.length} processing errors`);
    }

  } catch (error) {
    console.error(`❌ Bulk indexing failed:`, error.message);
    throw error;
  }
}
