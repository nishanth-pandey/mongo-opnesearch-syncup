/**
 * @fileoverview User Transaction Model - Transaction history for wallet operations.
 * 
 * **Purpose**: Records all wallet transactions for audit trail, user history,
 * and financial tracking.
 * 
 * **Key Features**:
 * - Complete transaction history
 * - Multi-currency support (coin/diamond)
 * - Action categorization (TRANSFER, RECEIVED, EARNED, SPENT)
 * - Reference tracking (from/to user)
 * - Game room association
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: usertransactions
 * 
 * **Relationships**:
 * - userId → User (transaction owner)
 * - referenceId → User (transaction counterparty)
 * 
 * **Transaction Actions**:
 * - TRANSFER: Sent to another user
 * - RECEIVED: Received from another user
 * - EARNED: Won from game or reward
 * - SPENT: Used for entry fee or purchase
 * 
 * **Currency Types**:
 * - coin: Primary game currency
 * - diamond: Premium currency
 * 
 * **Fields**:
 * - userId: User who owns this transaction
 * - amount: Transaction amount (positive or negative)
 * - currencyType: coin or diamond
 * - action: TRANSFER, RECEIVED, EARNED, or SPENT
 * - referenceId: Related user (sender/recipient)
 * - description: Human-readable description
 * - gameRoom: Associated game room ID
 * - timestamp: Transaction time
 * - createdAt, updatedAt: Auto timestamps
 */

const mongoose = require("mongoose")
const { Schema } = mongoose

/**
 * User Transaction Schema
 * 
 * **Audit Trail**: Immutable record of all wallet changes for compliance.
 */
const userTransactionSchema = new mongoose.Schema(
   {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amount: { type: Number },
      currencyType: { type: String, enum: ["coin", "diamond"] },
      action: { type: String, enum: ["TRANSFER", "RECEIVED", "EARNED", "SPENT"] },
      referenceId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // from/to
      description: { type: String },
      gameRoom: { type: String },
      timestamp: { type: Date, default: Date.now },
   },
   { timestamps: true }
)

const UserTransaction = mongoose.model("UserTransaction", userTransactionSchema)

module.exports = UserTransaction
