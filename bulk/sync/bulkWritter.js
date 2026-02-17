import { env } from "../config/env.js";
import { opensearch } from "../config/opensearch.js";
import { createIndex } from "./createIndex.js";

export class BulkWriter {
  constructor(indexName, collectionName) {
    this.index = indexName;
    this.collectionName = collectionName;
    this.buffer = [];
    this.count = 0;
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;

    await createIndex(opensearch, this.index, this.collectionName);

    await opensearch.indices.putSettings({
      index: this.index,
      body: { settings: { refresh_interval: "-1" } },
    });

    this.initialized = true;
  }

  async add({ id, body }) {
    await this.init();

    this.buffer.push({ index: { _index: this.index, _id: id } }, body);

    this.count++;

    if (this.buffer.length / 2 >= env.bulkSize) {
      await this.flush();
    }
  }

  async flush() {
    if (!this.buffer.length) return;

    const bulkBody = this.buffer;
    this.buffer = [];

    const response = await opensearch.bulk({
      body: bulkBody,
      refresh: false,
    });

    if (response.body?.errors) {
      const errors = response.body.items.filter((i) => i.index?.error);
      console.error(
        "Bulk indexing errors:",
        JSON.stringify(errors.slice(0, 5)),
      );
      throw new Error("Bulk indexing failed");
    }

    console.log(`✅ Indexed ${this.count} documents into ${this.index}`);
  }

  async finish() {
    await this.flush();

    await opensearch.indices.putSettings({
      index: this.index,
      body: { settings: { refresh_interval: "1s" } },
    });

    await opensearch.indices.refresh({ index: this.index });
  }
}
