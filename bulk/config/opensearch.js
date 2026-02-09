import { Client } from "@opensearch-project/opensearch";
import { env } from "./env.js";

export const opensearch = new Client({
  node: env.opensearchNode.replace('/_dashboards', ''), // Remove dashboard path to get actual API endpoint
  auth: {
    username: env.opensearchUser,
    password: env.opensearchPass,
  },
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certificates for dev
  },
});
