/**
 * @fileoverview Game Features Models - Additional game features and social systems.
 *
 * **Purpose**: Defines schemas for extended game features including spectators,
 * friends, lives, challenges, and gifts.
 *
 * **Models**:
 * - SpectatorSession: Spectator viewing sessions
 * - FriendRequest: Friend request management
 * - Friendship: Accepted friendships
 * - Life: User energy/lives system
 * - DailyChallenge: Daily challenge definitions
 * - UserChallenge: User challenge progress
 * - Gift: Gift catalog
 * - UserGift: Gift transactions between users
 *
 * **Database**: Main MongoDB (dbConnection)
 * **Collections**: Various (spectatorsessions, friendrequests, friendships, etc.)
 *
 * **Features**:
 * - Spectator mode for watching games
 * - Friend request/accept flow
 * - Lives refill system with TTL
 * - Daily challenges with rewards
 * - Gift sending between users
 */

const mongoose = require("mongoose");

/**
 * Spectator Session Schema
 *
 * **Purpose**: Tracks users watching games as spectators.
 */
const spectatorSessionSchema = new mongoose.Schema(
  {
    game: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
  },
  { timestamps: true },
);

// const friendRequestSchema = new mongoose = require("mongoose");

// const spectatorSessionSchema = new mongoose.Schema(
//   {
//     game: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     joinedAt: { type: Date, default: Date.now },
//     leftAt: { type: Date },
//   },
//   { timestamps: true },
// );

const friendRequestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    sentAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
  },
  { timestamps: true },
);

const friendshipSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  since: { type: Date, default: Date.now },
});

const lifeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  count: { type: Number, default: 5 },
  updatedAt: { type: Date, default: Date.now },
  nextRefill: { type: Date },
});

lifeSchema.index({ nextRefill: 1 }, { expireAfterSeconds: 0 });

const dailyChallengeSchema = new mongoose.Schema(
  {
    date: { type: Date, unique: true },
    description: String,
    reward: {
      coins: { type: Number, default: 0 },
      lives: { type: Number, default: 0 },
      diamonds: { type: Number, default: 0 },
    },
  },
  { timestamps: true },
);

const userChallengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    challenge: { type: mongoose.Schema.Types.ObjectId, ref: "DailyChallenge" },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

userChallengeSchema.index({ user: 1, challenge: 1 }, { unique: true });

const giftSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true, index: true },

    price: { type: Number, default: 0 },

    coinType: {
      type: String,
      enum: ["coin", "diamond"],
      default: "coin",
      index: true,
    },

    emogiPicUrl: { type: String, default: "" },

    emogiSpritPicUrl: { type: String, default: "" },

    order: { type: Number, default: 0, index: true },

    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

// const mongoose = require("mongoose");

const userGiftSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    gift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 0,
    },

    lastTransferredAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

// one row per gift per user
userGiftSchema.index({ owner: 1, gift: 1 }, { unique: true });

// const userGiftSchema = new mongoose.Schema({
//   from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   gift: { type: mongoose.Schema.Types.ObjectId, ref: 'Gift' },
//   sentAt: { type: Date, default: Date.now },
//   status: { type: String, enum: ['sent', 'opened'], default: 'sent' }
// }, { timestamps: true });

// userGiftSchema.index({ to: 1, sentAt: -1 });
const giftTransferSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    gift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
      required: true,
      index: true,
    },

    quantity: {
      type: Number,
      default: 1,
    },

    type: {
      type: String,
      enum: ["buy", "transfer", "win", "welcome"],
      required: true,
    },
  },
  { timestamps: true },
);

giftTransferSchema.index({ to: 1, createdAt: -1 });

const SpectatorSession = mongoose.model(
  "SpectatorSession",
  spectatorSessionSchema,
);
const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);
const Friendship = mongoose.model("Friendship", friendshipSchema);
const Life = mongoose.model("Life", lifeSchema);
const DailyChallenge = mongoose.model("DailyChallenge", dailyChallengeSchema);
const UserChallenge = mongoose.model("UserChallenge", userChallengeSchema);
const Gift = mongoose.model("Gift", giftSchema);
const UserGift = mongoose.model("UserGift", userGiftSchema);
const GiftTransfer = mongoose.model("GiftTransfer", giftTransferSchema);

module.exports = {
  SpectatorSession,
  FriendRequest,
  Friendship,
  Life,
  DailyChallenge,
  UserChallenge,
  Gift,
  UserGift,
  GiftTransfer,
};
