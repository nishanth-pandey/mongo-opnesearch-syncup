# Product Requirements Document (PRD)

## 1. Overview

This document defines the requirements for a **MongoDB → OpenSearch Data Sync Service**. The service ensures that selected MongoDB collections are searchable in near real time within OpenSearch, while also supporting a full initial bulk load.

The system is designed for:

* Event-driven architecture
* High reliability and idempotency
* Minimal operational overhead
* Clear separation of concerns

This PRD is written to be consumable by both **human engineers** and **IDE / AI coding agents**.

---

## 2. Goals & Non-Goals

### 2.1 Goals

* Perform a **one-time bulk sync** of MongoDB collections into OpenSearch
* Maintain **near real-time consistency** using MongoDB Change Streams
* Support **insert, update, replace, and delete** operations
* Ensure **idempotent writes** and safe retries
* Scale to millions of documents without memory pressure
* Avoid unnecessary frameworks (no HTTP server required)

### 2.2 Non-Goals

* No bidirectional sync (OpenSearch → MongoDB)
* No full-text search UI or API
* No data transformation beyond indexing needs
* No Kafka or heavy CDC tooling

---

## 3. High-Level Architecture

### 3.1 Components

1. **Bulk Sync CLI Service**

   * Node.js script
   * Streams MongoDB collections
   * Uses OpenSearch Bulk API

2. **Realtime Producer Service**

   * Listens to MongoDB Change Streams
   * Emits change events
   * Runs as a long-lived process (ECS / EC2 / Atlas Trigger)

3. **Queue Layer**

   * Amazon SQS
   * Buffers spikes
   * Enables retries and DLQ

4. **Realtime Consumer Lambda**

   * Consumes SQS messages
   * Batches operations
   * Writes to OpenSearch

---

## 4. Data Scope

### 4.1 Indexed Collections

Only high-value collections are indexed:

* markets
* runners
* runnermetadatas
* users (partial fields only)
* sportsettlebets (partial fields only)
* results

### 4.2 Excluded Collections

The following are explicitly excluded:

* settings
* otps
* ssoids
* roundcounters
* notifications

---

## 5. Bulk Sync Requirements

### 5.1 Functional Requirements

* Accept collection name as CLI argument
* Stream documents using MongoDB cursor
* Convert MongoDB documents to OpenSearch format
* Use MongoDB `_id` as OpenSearch `_id`
* Flush writes in configurable batch sizes
* Fail fast on indexing errors

### 5.2 Non-Functional Requirements

* Must not load entire collection into memory
* Must be restartable
* Must be safe for multi-GB datasets

---

## 6. Realtime Sync Requirements

### 6.1 Change Stream Handling

The system must process the following MongoDB change events:

| MongoDB Event | OpenSearch Action |
| ------------- | ----------------- |
| insert        | index             |
| update        | index (upsert)    |
| replace       | index             |
| delete        | delete            |

`fullDocument: updateLookup` must be enabled.

---

### 6.2 Event Payload Contract

Each emitted event must contain:

* collection (string)
* operationType (string)
* documentKey._id (string)
* fullDocument (object | null)
* clusterTime (timestamp)

This payload is the **single source of truth** between producer and consumer.

---

## 7. Idempotency & Consistency

### 7.1 Idempotency Rules

* MongoDB `_id` maps 1:1 to OpenSearch `_id`
* Reprocessing the same event must be safe
* Writes must overwrite existing documents

### 7.2 Ordering Guarantees

* Ordering is guaranteed per document
* Global ordering is not required

---

## 8. Error Handling & Retries

### 8.1 SQS Retry Strategy

* Max receive count: 5
* Visibility timeout: 60 seconds
* Failed messages go to DLQ

### 8.2 Failure Scenarios

* OpenSearch unavailable
* Mapping conflict
* Malformed document

In all cases, retries must not create duplicates.

---

## 9. Configuration & Secrets

### 9.1 Environment Variables

**MongoDB**

* MONGO_URI
* MONGO_DB

**OpenSearch**

* OPENSEARCH_NODE
* OPENSEARCH_USER
* OPENSEARCH_PASS

**Bulk Sync**

* BULK_SIZE (default: 500)

---

## 10. Security Requirements

* No credentials in source code
* Secrets loaded via environment or secrets manager
* TLS required for MongoDB and OpenSearch

---

## 11. Observability

### 11.1 Logging

* Structured logs (JSON)
* Log collection name and document ID

### 11.2 Metrics

* Bulk sync throughput
* Lambda error count
* SQS backlog size

---

## 12. Operational Playbooks

### 12.1 Reindexing

1. Stop realtime consumer
2. Create new OpenSearch index version
3. Run bulk sync
4. Switch alias
5. Resume realtime sync

### 12.2 Recovery

* Replay from DLQ
* Resume MongoDB Change Stream using resume token

---

## 13. Out of Scope (Explicit)

* Search UI
* API Gateway / Express server
* Complex schema migrations
* Analytics pipelines

---

## 14. Success Criteria

* Bulk sync completes without memory pressure
* Realtime updates appear in OpenSearch within seconds
* No duplicate or missing documents
* System runs unattended in production

---

## 15. Summary

This service is a **lean, event-driven indexing pipeline**. It prioritizes correctness, scalability, and simplicity. Every design choice avoids unnecessary abstraction while remaining production safe.

This PRD should be treated as the **contract** for all implementation work.
