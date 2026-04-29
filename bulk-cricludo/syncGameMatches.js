import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncGameMatches(SettledGame) {
  console.log("🔥 Syncing game_session_end events from SettledGame");

  const cursor = SettledGame.find().cursor();

  let batch = [];
  let processed = 0;

  for await (const game of cursor) {
    if (!game.players?.length) continue;
    if (!game.result?.length) continue;

    for (const player of game.players) {
      const userId = player.userId.toString();

      const resultRow = game.result.find((r) => r.userId.toString() === userId);

      if (!resultRow) continue;

      const isWin = resultRow.rank === 1;

      batch.push({
        docId: `game_session_end_${game.roomId}_${userId}`,
        type: "game_session_end",

        userId,
        roomId: game.roomId,

        gameType: game.gameType,
        category: game.category,

        result: isWin, // ⭐ BOOLEAN ONLY

        run: resultRow.run || 0,
        wicket: resultRow.wicket || 0,
        over: resultRow.over || 0,

        entryValue: player.entryValue || 0,
        coinType: player.coinType || "coin",

        endedAt: game.settledAt,
        timestamp: game.settledAt,
      });

      processed++;

      if (batch.length >= env.bulkSize) {
        await bulkInsert(batch);
        batch = [];
      }
    }
  }

  if (batch.length) await bulkInsert(batch);

  console.log(`✅ Game session backfill done: ${processed}`);
}
