const { client } = require("./client");
const { env } = require("./config");

async function bulkInsert(docs) {
  if (!docs.length) return;

  const body = [];

  for (const doc of docs) {
    body.push({
      index: {
        _index: env.indexName,
        _id: doc.docId,
      },
    });

    body.push(doc);
  }

  const response = await client.bulk({
    refresh: true,
    body,
  });

  if (response.errors) {
    console.error("Bulk errors occurred");

    response.items.forEach((item) => {
      if (item.index?.error) {
        console.error(item.index.error);
      }
    });
  }

  console.log(`Inserted ${docs.length} docs`);
}

module.exports = { bulkInsert };
