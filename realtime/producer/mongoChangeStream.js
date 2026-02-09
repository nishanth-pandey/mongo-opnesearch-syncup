import { MongoClient } from "mongodb";

export async function streamChanges({
  mongoUri,
  dbName,
  collections,
  onEvent,
}) {
  const client = new MongoClient(mongoUri, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  });
  await client.connect();

  const db = client.db(dbName);
  const activeStreams = new Set();

  // Start change streams for all collections concurrently
  for (const collectionName of collections) {
    const collection = db.collection(collectionName);
    
    // Configure change stream with proper options
    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'replace', 'delete'] }
        }
      }
    ], {
      fullDocument: "updateLookup",
      fullDocumentBeforeChange: "whenAvailable"
    });

    activeStreams.add(changeStream);
    
    console.log(`🚀 Listening to changes on ${collectionName}`);

    // Handle change stream events
    changeStream.on('change', async (change) => {
      try {
        await onEvent(collectionName, change);
      } catch (error) {
        console.error(`❌ Error processing event for ${collectionName}:`, error.message);
        // Continue processing other events
      }
    });

    // Handle change stream errors
    changeStream.on('error', (error) => {
      console.error(`❌ Change stream error for ${collectionName}:`, error.message);
      activeStreams.delete(changeStream);
      
      // Attempt to restart the stream after a delay
      setTimeout(() => {
        restartChangeStream(collectionName, db, onEvent, activeStreams);
      }, 5000);
    });

    // Handle stream close
    changeStream.on('close', () => {
      console.log(`🔒 Change stream closed for ${collectionName}`);
      activeStreams.delete(changeStream);
    });
  }

  // Graceful shutdown handler
  process.on('SIGTERM', async () => {
    console.log('🛑 Shutting down change streams...');
    for (const stream of activeStreams) {
      await stream.close();
    }
    await client.close();
    process.exit(0);
  });

  // Keep the process alive
  return new Promise((resolve) => {
    // This will keep running indefinitely
  });
}

async function restartChangeStream(collectionName, db, onEvent, activeStreams) {
  try {
    console.log(`🔄 Attempting to restart change stream for ${collectionName}`);
    const collection = db.collection(collectionName);
    
    const changeStream = collection.watch([
      {
        $match: {
          operationType: { $in: ['insert', 'update', 'replace', 'delete'] }
        }
      }
    ], {
      fullDocument: "updateLookup",
      fullDocumentBeforeChange: "whenAvailable"
    });

    activeStreams.add(changeStream);
    
    changeStream.on('change', async (change) => {
      try {
        await onEvent(collectionName, change);
      } catch (error) {
        console.error(`❌ Error processing event for ${collectionName}:`, error.message);
      }
    });

    changeStream.on('error', (error) => {
      console.error(`❌ Change stream error for ${collectionName}:`, error.message);
      activeStreams.delete(changeStream);
      setTimeout(() => restartChangeStream(collectionName, db, onEvent, activeStreams), 5000);
    });

    console.log(`✅ Successfully restarted change stream for ${collectionName}`);
  } catch (error) {
    console.error(`❌ Failed to restart change stream for ${collectionName}:`, error.message);
    setTimeout(() => restartChangeStream(collectionName, db, onEvent, activeStreams), 10000);
  }
}
