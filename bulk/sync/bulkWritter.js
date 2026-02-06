import { env } from "../config/env.js";
import { opensearch } from "../config/opensearch.js";

export class BulkWriter {
  constructor(index) {
    this.index = index;
    this.buffer = [];
    this.count = 0;
  }

  async flush() {
    if (this.buffer.length === 0) return;

    const body = this.buffer;
    this.buffer = [];

    const response = await opensearch.bulk({ body });

    if (response.errors) {
      const errors = response.items.filter((i) => i.index?.error);
      console.error("Bulk indexing errors:", errors.slice(0, 5));
      throw new Error("Bulk indexing failed");
    }

    console.log(`Indexed ${this.count} documents`);
  }

  async add({ id, body }) {
    this.buffer.push({ index: { _index: this.index, _id: id } }, body);

    this.count++;

    if (this.buffer.length / 2 >= env.bulkSize) {
      await this.flush();
    }
  }
}
