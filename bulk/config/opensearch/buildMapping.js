import { baseMapping } from "./baseMapping.js";
import { indexOverrides } from "./indexOverrides.js";

export const buildMapping = (collectionName) => {
  const key = collectionName.toLowerCase();
  const override = indexOverrides[key];

  if (!override) return baseMapping;

  return {
    ...baseMapping,
    mappings: {
      ...baseMapping.mappings,
      properties: {
        ...baseMapping.mappings.properties,
        ...override.properties,
      },
    },
  };
};
