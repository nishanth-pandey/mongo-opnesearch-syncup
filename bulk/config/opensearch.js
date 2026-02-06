import { Client } from "@opensearch-project/opensearch";
import { env } from "./env.js";

export const opensearch = new Client({
  node: env.opensearchNode,
  auth: {
    username: env.opensearchUser,
    password: env.opensearchPass,
  },
  ssl: {
    rejectUnauthorized: true,
  },
});
