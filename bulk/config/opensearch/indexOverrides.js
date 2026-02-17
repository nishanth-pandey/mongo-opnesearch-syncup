export const indexOverrides = {
  users: {
    properties: {
      username: { type: "keyword" },
      email: { type: "keyword" },
      exposure: { type: "keyword" },
      twoFactorToken: { type: "keyword" },
    },
  },

  markets: {
    properties: {
      marketName: { type: "text" },
    },
  },
  gapcasinotransactions: {
    properties: {
      description: {
        type: "keyword",
      },
      stake_inr: { type: "double" },
      pl_inr: { type: "double" },
      adjusted_pl: { type: "double" },
    },
  },
};
