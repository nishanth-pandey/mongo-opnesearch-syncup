import { bulkIndex } from "./bulkIndexer.js";

export const handler = async (event) => {
  console.log(`📥 Consumer received ${event.Records.length} messages from SQS`);
  
  // Extract and validate messages
  const validRecords = [];
  const invalidRecords = [];
  
  for (const record of event.Records) {
    try {
      const payload = JSON.parse(record.body);
      
      // Validate required fields
      if (!payload.collection || !payload.operationType || !payload.documentKey) {
        console.warn(`⚠️ Invalid message structure:`, payload);
        invalidRecords.push(record);
        continue;
      }
      
      validRecords.push({
        messageId: record.messageId,
        receiptHandle: record.receiptHandle,
        payload
      });
      
    } catch (error) {
      console.error(`❌ Failed to parse message:`, error.message);
      invalidRecords.push(record);
    }
  }
  
  if (validRecords.length === 0) {
    console.log("📭 No valid messages to process");
    return {
      batchItemFailures: invalidRecords.map(r => ({ itemIdentifier: r.messageId }))
    };
  }
  
  console.log(`📊 Processing ${validRecords.length} valid messages`);
  
  try {
    // Process valid records
    await bulkIndex(validRecords.map(r => r.payload));
    
    console.log(`✅ Successfully processed ${validRecords.length} messages`);
    
    // Return failed items for retry/redrive
    return {
      batchItemFailures: invalidRecords.map(r => ({ itemIdentifier: r.messageId }))
    };
    
  } catch (error) {
    console.error(`❌ Bulk indexing failed:`, error.message);
    
    // All valid records failed - return them for retry
    return {
      batchItemFailures: validRecords.map(r => ({ itemIdentifier: r.messageId }))
    };
  }
};
