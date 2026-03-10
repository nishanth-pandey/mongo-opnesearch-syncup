import { Client } from "@opensearch-project/opensearch";
import { env } from "./config.js";

export const client = new Client({
  node: env.opensearchNode,
  auth: {
    username: env.opensearchUser,
    password: env.opensearchPass,
  },
  ssl: {
    rejectUnauthorized: false,
  },
});
