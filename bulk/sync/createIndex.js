import { buildMapping } from "../config/opensearch/buildMapping.js";

export const createIndex = async (client, indexName, collectionName) => {
  const body = buildMapping(collectionName);

  console.log(`🔥 Deleting index: ${indexName}`);
  await client.indices.delete({ index: indexName }).catch(() => {});

  console.log(`📦 Creating index: ${indexName}`);
  await client.indices.create({
    index: indexName,
    body,
  });
};
