import { env } from "../env.js";
import { collectionIndexMap } from "./collectionIndexMap.js";

export const resolveIndexName = (collectionName) => {
  const key = collectionName.toLowerCase();

  const index = collectionIndexMap[env.nodeEnv]?.[key];

  if (!index) {
    throw new Error(
      `Index not configured for ${collectionName} in ${env.nodeEnv}`,
    );
  }

  return index;
};
