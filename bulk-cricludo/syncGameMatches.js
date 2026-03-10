import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncGameMatches(SettledGame) {
  console.log("Syncing game matches...");

  const cursor = SettledGame.find().cursor();

  let batch = [];
  let processed = 0;

  for await (const game of cursor) {
    const doc = {
      docId: `game_${game.roomId}`,
      type: "game_match",

      roomId: game.roomId,

      gameType: game.gameType,
      category: game.category,

      entryValue: game.entryValue,
      coinType: game.coinType,

      players: game.players,

      winnerId: game.players?.find((p) => p.rank === 1)?.userId,

      startedAt: game.startedAt,
      settledAt: game.settledAt,
    };

    batch.push(doc);
    processed++;

    if (batch.length >= env.bulkSize) {
      await bulkInsert(batch);
      batch = [];
    }
  }

  if (batch.length) await bulkInsert(batch);

  console.log(`Game matches synced: ${processed}`);
}
