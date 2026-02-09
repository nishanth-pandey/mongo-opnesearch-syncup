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
  const body = [];

  for (const event of events) {
    const index = `${event.collection}_v1`;
    const id = event.documentKey._id.toString();

    if (event.operationType === "delete") {
      body.push({ delete: { _index: index, _id: id } });
      continue;
    }

    body.push(
      { index: { _index: index, _id: id } },
      { ...event.fullDocument, mongoId: id },
    );
  }

  const response = await client.bulk({ body });

  if (response.errors) {
    throw new Error("Bulk indexing failed");
  }
}
