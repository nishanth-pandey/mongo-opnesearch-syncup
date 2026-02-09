import AWS from "aws-sdk";
import { streamChanges } from "./mongoChangeStream.js";

const sqs = new AWS.SQS();

const QUEUE_URL = process.env.SQS_QUEUE_URL;

// Validate required environment variables
if (!QUEUE_URL) {
  throw new Error("SQS_QUEUE_URL environment variable is required");
}

export const handler = async () => {
  console.log("🚀 Starting realtime producer service");
  console.log(`📡 Connecting to SQS queue: ${QUEUE_URL}`);
  
  await streamChanges({
    mongoUri: process.env.MONGO_URI,
    dbName: process.env.MONGO_DB,
    collections: [
      "markets",
      "runners", 
      "runnermetadatas",
      "users",
      "sportsettlebets",
      "results",
    ],
    onEvent: async (collection, change) => {
      // Validate event payload
      if (!change.operationType || !change.documentKey) {
        console.warn(`⚠️ Invalid event received for collection ${collection}`, change);
        return;
      }

      // Create standardized event payload
      const payload = {
        collection,
        operationType: change.operationType,
        documentKey: change.documentKey,
        fullDocument: change.fullDocument,
        clusterTime: change.clusterTime,
        timestamp: new Date().toISOString(),
        eventId: `${collection}-${change.documentKey._id}-${Date.now()}`
      };

      // Enhanced logging
      console.log(`📋 Event captured: ${collection}.${change.operationType} - ${change.documentKey._id}`);
      
      try {
        // Send to SQS with retry logic
        const result = await sendMessageWithRetry(sqs, {
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(payload),
          MessageAttributes: {
            'Collection': {
              DataType: 'String',
              StringValue: collection
            },
            'OperationType': {
              DataType: 'String', 
              StringValue: change.operationType
            }
          }
        }, 3);

        console.log(`✅ Event sent to SQS: ${result.MessageId}`);
        
      } catch (error) {
        console.error(`❌ Failed to send event to SQS:`, error.message);
        // In production, you might want to implement a dead letter mechanism here
        throw error;
      }
    },
  });
};

async function sendMessageWithRetry(sqsClient, params, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await sqsClient.sendMessage(params).promise();
      if (attempt > 1) {
        console.log(`✅ SQS send succeeded on attempt ${attempt}`);
      }
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ SQS send attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  throw new Error(`Failed to send message after ${maxRetries} attempts: ${lastError.message}`);
}
