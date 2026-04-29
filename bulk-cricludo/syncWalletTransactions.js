import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncWalletTransactions(UserTransaction) {
  console.log("🔥 Syncing wallet_transaction events...");

  const cursor = UserTransaction.find().lean().cursor();

  let batch = [];
  let processed = 0;

  for await (const txn of cursor) {
    if (!txn.userId) continue;

    const userId = txn.userId.toString();

    let coinDelta = 0;
    let diamondDelta = 0;

    // ⭐ DELTA SIGN LOGIC (VERY IMPORTANT)
    const amount = txn.amount || 0;

    const isDebit = txn.action === "SPENT" || txn.action === "TRANSFER";

    const signedAmount = isDebit ? -amount : amount;

    if (txn.currencyType === "coin") {
      coinDelta = signedAmount;
    }

    if (txn.currencyType === "diamond") {
      diamondDelta = signedAmount;
    }

    const doc = {
      docId: `wallet_${txn._id}`,
      type: "wallet_transaction",

      userId,

      coinDelta,
      diamondDelta,

      action: txn.action || "UNKNOWN",
      reason: txn.description || txn.action || "unknown",

      roomId: txn.gameRoom || null,

      referenceUserId: txn.referenceId ? txn.referenceId.toString() : null,

      timestamp: txn.timestamp || txn.createdAt || new Date(),
    };

    batch.push(doc);
    processed++;

    if (batch.length >= env.bulkSize) {
      await bulkInsert(batch);
      batch = [];
      console.log(`Inserted ${processed} wallet txns`);
    }
  }

  if (batch.length) {
    await bulkInsert(batch);
  }

  console.log(`✅ Wallet transaction backfill complete: ${processed}`);
}
