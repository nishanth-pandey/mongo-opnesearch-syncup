# Realtime Sync System Flow - Simple Explanation

## 🎯 **The Big Picture**

This system keeps your MongoDB data synchronized with OpenSearch in **real-time** - meaning when data changes in MongoDB, it automatically appears in OpenSearch within seconds, making it searchable immediately.

## 🔄 **Complete Flow Diagram**

```
MongoDB Database
     ↓ (Data Changes Happen)
Change Streams (Listeners)
     ↓ (Capture Events)
Event Processing & Validation
     ↓ (Send to Queue)
Amazon SQS (Message Queue)
     ↓ (Buffer & Distribute)
Lambda Consumer (Processor)
     ↓ (Batch Process)
OpenSearch Indexing
     ↓ (Immediate Search Available)
Search Queries Work Instantly
```

## 📋 **Step-by-Step Breakdown**

### **1. Something Changes in MongoDB** 💾
- A document gets **created**, **updated**, **replaced**, or **deleted**
- Example: User updates their profile, or a new market is added

### **2. Change Stream Listeners Notice** 👂
- Special "listeners" constantly watch your collections
- They see the change immediately (within milliseconds)
- Currently watching: `betfaircommissions`, `whitelabels`, and other specified collections

### **3. Event Gets Packaged** 📦
- The change is converted into a standardized format
- Package includes: collection name, operation type, document ID, and full document data
- Example package:
  ```json
  {
    "collection": "betfaircommissions",
    "operationType": "update",
    "documentKey": {"_id": "12345"},
    "fullDocument": {"marketName": "Updated Market", ...},
    "timestamp": "2024-01-01T10:00:00Z"
  }
  ```

### **4. Message Goes to Queue** 📨
- Package is sent to **Amazon SQS** (Simple Queue Service)
- Queue acts like a buffer - holds messages safely
- Has **backup protection** (DLQ) for failed messages
- Allows system to handle traffic spikes smoothly

### **5. Consumer Picks Up Messages** 🏭
- **Lambda function** (serverless processor) pulls messages from queue
- Processes multiple messages together for efficiency
- Handles up to 10,000 messages per batch

### **6. Data Gets Indexed** 🔍
- Converts MongoDB format to OpenSearch format
- Performs **bulk operations** for speed
- Updates the search index immediately
- **Idempotent** - safe to process the same message multiple times

### **7. Search Works Immediately** ✅
- Changed data is now searchable in OpenSearch
- No manual refresh needed
- Search results include the latest changes

## ⚡ **Key Features That Make It Reliable**

### **Automatic Recovery** 🛠️
- If any part fails, system automatically restarts
- Lost connections get re-established
- Failed messages go to backup queue for later processing

### **Scalable Processing** 📈
- Can handle thousands of changes per second
- Automatically adjusts to load
- No manual scaling required

### **Data Safety** 🛡️
- **Idempotent** - same event processed multiple times = no duplicates
- **Ordered per document** - changes to same document happen in correct sequence
- **Backup queues** - nothing gets lost

## 🎮 **What You Can Do Now**

### **Start the System:**
```bash
# Start listening for changes
node realtime/producer/index.js
```

### **Watch It Work:**
1. Make a change to a document in MongoDB
2. Watch the console logs show the event being captured
3. See it processed and indexed
4. Search for the updated data in OpenSearch

### **Monitor Health:**
```bash
# Check queue status
node realtime/sqs-setup.js monitor

# Verify indexing worked
node check-indexes.js
```

## 🎯 **Real-World Example**

**Scenario**: A sports betting market gets updated with new odds

1. **MongoDB**: Market document updated with new odds
2. **Change Stream**: Notices the update immediately  
3. **Event Processing**: Packages the change
4. **SQS Queue**: Holds the update message
5. **Lambda Consumer**: Processes the update
6. **OpenSearch**: Indexes the new odds
7. **Search**: Users can immediately search with new odds data

The entire process typically takes **1-3 seconds** from database change to searchable data!