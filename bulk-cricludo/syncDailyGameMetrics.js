import { bulkInsert } from "./helpers.js";

export async function syncDailyGameMetrics(SettledGame) {
  console.log("Generating daily game metrics...");

  const stats = await SettledGame.aggregate([
    {
      $group: {
        _id: {
          date: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          gameType: "$gameType",
        },
        games: { $sum: 1 },
        totalEntry: { $sum: "$entryValue" },
      },
    },
  ]);

  const docs = stats.map((s) => ({
    docId: `daily_${s._id.date}_${s._id.gameType}`,
    type: "daily_game_metrics",

    date: s._id.date,
    gameType: s._id.gameType,

    games: s.games,
    totalEntry: s.totalEntry,
  }));

  await bulkInsert(docs);

  console.log("Daily game metrics synced");
}
