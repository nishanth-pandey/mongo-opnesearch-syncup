import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncUserStats(User, Wallet, AnalysisUser) {
  console.log("Syncing user stats...");

  const cursor = User.find().cursor();

  let batch = [];
  let processed = 0;

  for await (const user of cursor) {
    const wallet = await Wallet.findOne({ userId: user._id });
    const analysis = await AnalysisUser.findOne({ userId: user._id });

    const doc = {
      docId: `user_stats_${user._id}`,
      type: "user_stats",

      userId: user._id.toString(),

      wallet: {
        coin: wallet?.coin || 0,
        diamond: wallet?.diamond || 0,
        lives: wallet?.lives || 0,
      },

      stats: {
        gamesPlayed: analysis?.gamesPlayed || 0,
        wins: analysis?.wins || 0,
        losses: analysis?.losses || 0,
        roomsCreated: analysis?.roomsCreated || 0,
        coinsDistributed: analysis?.coinsDistributed || 0,
        totalPlayTime: analysis?.totalTimeSpent || 0,
      },

      updatedAt: new Date(),
    };

    batch.push(doc);
    processed++;

    if (batch.length >= env.bulkSize) {
      await bulkInsert(batch);
      batch = [];
    }
  }

  if (batch.length) await bulkInsert(batch);

  console.log(`User stats synced: ${processed}`);
}
