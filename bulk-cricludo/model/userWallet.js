/**
 * @fileoverview User Wallet Model - Manages user virtual currency balances.
 *
 * **Purpose**: Tracks user wallet balances for coins, diamonds, and lives.
 *
 * **Currency Types**:
 * - **Coins**: Primary game currency, earned through gameplay
 * - **Diamonds**: Premium currency, purchased or earned through special events
 * - **Lives**: Energy system for game participation
 *
 * **Key Features**:
 * - One-to-one relationship with User model
 * - Unique userId constraint (one wallet per user)
 * - Automatic timestamps for transaction tracking
 * - Default values (0) for all currencies
 *
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: userwallets
 *
 * **Relationships**:
 * - userId → User (one-to-one, required, unique)
 *
 * **Usage**:
 * - Created automatically when user registers
 * - Updated via UserTransaction records
 * - Referenced in User.wallet_id
 *
 * **Fields**:
 * - userId: Reference to User._id (required, unique)
 * - coin: Coin balance (default: 0)
 * - diamond: Diamond balance (default: 0)
 * - lives: Lives/energy balance (default: 0)
 * - createdAt: Wallet creation timestamp (auto)
 * - updatedAt: Last update timestamp (auto)
 */

const { Schema, model } = require("mongoose");

/**
 * User Wallet Schema
 *
 * **Purpose**: Simple balance tracking for user currencies.
 *
 * **Transaction Safety**: Updates should be atomic using $inc operator
 * to prevent race conditions during concurrent transactions.
 */
const userWalletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    coin: { type: Number, default: 0, min: 0 },
    diamond: { type: Number, default: 0, min: 0 },
    lives: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

const UserWallet = model("UserWallet", userWalletSchema);

module.exports = UserWallet;
