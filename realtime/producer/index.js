import AWS from "aws-sdk";
import { streamChanges } from "./mongoChangeStream.js";

const sqs = new AWS.SQS();

const QUEUE_URL = process.env.SQS_QUEUE_URL;

export const handler = async () => {
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
      const payload = {
        collection,
        operationType: change.operationType,
        documentKey: change.documentKey,
        fullDocument: change.fullDocument,
        clusterTime: change.clusterTime,
      };

      await sqs
        .sendMessage({
          QueueUrl: QUEUE_URL,
          MessageBody: JSON.stringify(payload),
        })
        .promise();
    },
  });
};
