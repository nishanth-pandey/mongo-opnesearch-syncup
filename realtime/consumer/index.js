import { bulkIndex } from "./bulkIndexer.js";

export const handler = async (event) => {
  const records = event.Records.map((r) => JSON.parse(r.body));

  await bulkIndex(records);
};
