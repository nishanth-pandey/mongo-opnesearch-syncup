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
      sessionId: { type: "keyword" },

      username: { type: "keyword" },
      email: { type: "keyword" },

      profilePic: { type: "keyword" },

      gameType: { type: "keyword" },
      category: { type: "keyword" },

      entryValue: { type: "integer" },

      coinType: { type: "keyword" },

      winnerId: { type: "keyword" },

      players: {
        type: "nested",
        properties: {
          userId: { type: "keyword" },
          username: { type: "keyword" },
          rank: { type: "integer" },
          entryValue: { type: "integer" },
          winnerPrize: { type: "integer" },
        },
      },

      wallet: {
        properties: {
          coin: { type: "long" },
          diamond: { type: "long" },
          lives: { type: "integer" },
        },
      },

      stats: {
        properties: {
          gamesPlayed: { type: "integer" },
          wins: { type: "integer" },
          losses: { type: "integer" },
          roomsCreated: { type: "integer" },
          coinsDistributed: { type: "long" },
          totalPlayTime: { type: "long" },
        },
      },

      duration: { type: "long" },

      createdAt: { type: "date" },
      startedAt: { type: "date" },
      endedAt: { type: "date" },
      settledAt: { type: "date" },
      updatedAt: { type: "date" },
    },
  },
};
