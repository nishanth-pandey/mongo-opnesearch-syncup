import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncGameMatch(SettledGame) {
  console.log("🔥 Syncing game_match docs (dashboard critical)");

  const cursor = SettledGame.find().cursor();

  let batch = [];
  let processed = 0;

  for await (const game of cursor) {
    if (!game.players?.length) continue;

    const doc = {
      docId: `game_${game.roomId}`, // ⭐ SAME ID AS REALTIME
      type: "game_match",

      roomId: game.roomId,
      gameType: game.gameType,
      category: game.category,

      roomCreatedBy: game.roomCreatedBy?.toString(),

      players: game.players.map((p) => ({
        userId: p.userId.toString(),
        userName: p.userName || "",
        winnerPrize: p.winnerPrize || 0,
        entryValue: p.entryValue || 0,
        coinType: p.coinType || "coin",
      })),

      settledAt: game.settledAt,
      timestamp: game.settledAt,
    };

    batch.push(doc);
    processed++;

    if (batch.length >= env.bulkSize) {
      await bulkInsert(batch);
      batch = [];
    }
  }

  if (batch.length) await bulkInsert(batch);

  console.log(`✅ Game_match backfill done: ${processed}`);
}
