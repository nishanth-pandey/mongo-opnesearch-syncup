import { MongoClient } from "mongodb";

export async function streamChanges({
  mongoUri,
  dbName,
  collections,
  onEvent,
}) {
  const client = new MongoClient(mongoUri);
  await client.connect();

  const db = client.db(dbName);

  for (const collectionName of collections) {
    const collection = db.collection(collectionName);

    const changeStream = collection.watch([], {
      fullDocument: "updateLookup",
    });

    console.log(`Listening to changes on ${collectionName}`);

    for await (const change of changeStream) {
      await onEvent(collectionName, change);
    }
  }
}
