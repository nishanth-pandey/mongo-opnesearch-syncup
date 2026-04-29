import { bulkInsert } from "./helpers.js";
import { env } from "./config.js";

export async function syncUserProfiles(User) {
  console.log("Syncing user profiles...");

  const cursor = User.find().cursor();

  let batch = [];
  let processed = 0;

  for await (const user of cursor) {
    const doc = {
      docId: `user_profile_${user._id}`,
      type: "user_profile",

      userId: user._id.toString(),

      username: user.username,
      email: user.email,
      profilePic: user.profile_pic || "",
      isGuest: user.is_guest || false,
      vip_user: user.vip_user || false,

      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    batch.push(doc);
    processed++;

    if (batch.length >= env.bulkSize) {
      await bulkInsert(batch);
      batch = [];
    }
  }

  if (batch.length) await bulkInsert(batch);

  console.log(`User profiles synced: ${processed}`);
}
