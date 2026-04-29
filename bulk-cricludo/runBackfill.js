import { connectMongo } from "./backfill.js";

import { syncUserProfiles } from "./syncUserProfiles.js";
import { syncUserStats } from "./syncUserStats.js";
import { syncGameMatches } from "./syncGameMatches.js";
import { syncDailyGameMetrics } from "./syncDailyGameMetrics.js";

import models from "./model/index.js";
import { syncGameMatch } from "./syncGameMatch.js";
import { syncWalletTransactions } from "./syncWalletTransactions.js";

const { User, UserWallet, SettledGame, AnalysisUser, UserTransaction } = models;

async function run() {
  await connectMongo();

  await syncUserProfiles(User);

  await syncUserStats(User, UserWallet, AnalysisUser);

  await syncGameMatch(SettledGame);
  await syncGameMatches(SettledGame);

  await syncWalletTransactions(UserTransaction);

  await syncDailyGameMetrics(SettledGame);

  console.log("Backfill complete");

  process.exit();
}

run();
