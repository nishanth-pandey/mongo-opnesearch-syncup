export const baseMapping = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
  },
  mappings: {
    dynamic: true,
    properties: {
      mongoId: { type: "keyword" },

      userId: { type: "keyword" },
      marketId: { type: "keyword" },
      sportsId: { type: "keyword" },
      matchId: { type: "keyword" },
      eventId: { type: "keyword" },

      status: { type: "keyword" },
      type: { type: "keyword" },
      currency: {
        properties: {
          code: { type: "keyword" },
          value: { type: "double" },
        },
      },

      stake: { type: "double" },
      pl: { type: "double" },
      commission: { type: "double" },
      exposure: { type: "double" },
      prevBalance: { type: "double" },
      postBalance: { type: "double" },

      description: {
        type: "text",
        fields: {
          keyword: { type: "keyword", ignore_above: 256 },
        },
      },

      createdAt: { type: "date" },
      updatedAt: { type: "date" },
    },
  },
};
