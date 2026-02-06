import dotenv from "dotenv";

dotenv.config();

function required(name) {
  if (!process.env[name]) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return process.env[name];
}

export const env = {
  mongoUri: required("MONGO_URI"),
  mongoDb: required("MONGO_DB"),

  opensearchNode: required("OPENSEARCH_NODE"),
  opensearchUser: required("OPENSEARCH_USER"),
  opensearchPass: required("OPENSEARCH_PASS"),

  bulkSize: Number(process.env.BULK_SIZE || 500),
};
