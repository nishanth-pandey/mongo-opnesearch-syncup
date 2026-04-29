export const mapping = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 1,
  },
  mappings: {
    properties: {
      docId: { type: "keyword" },
      type: { type: "keyword" },

      userId: { type: "keyword" },
      roomId: { type: "keyword" },

      gameType: { type: "keyword" },
      category: { type: "keyword" },

      result: { type: "boolean" },
      rank: { type: "integer" },
      run: { type: "integer" },

      amount: { type: "long" },
      coinType: { type: "keyword" },
      reason: { type: "keyword" },

      entryValue: { type: "integer" },

      timestamp: { type: "date" },
      startedAt: { type: "date" },
      endedAt: { type: "date" },
      settledAt: { type: "date" },
    },
  },
};
