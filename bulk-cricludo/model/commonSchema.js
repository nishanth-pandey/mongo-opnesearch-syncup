/**
 * @fileoverview Common Schemas - Reusable sub-schemas for Game model.
 *
 * **Purpose**: Defines shared schemas used as embedded documents in Game model.
 *
 * **Schemas**:
 * - playerSchema: Player data in a game
 * - chatHistorySchema: Chat messages (deprecated, use ChatMessage model)
 * - videoSessionsSchema: Video call sessions
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Player Schema
 *
 * **Purpose**: Embedded in Game.players array to track player state.
 *
 * **Fields**:
 * - userId: Reference to User
 * - userName: Cached username
 * - winnerPrize: Prize if player wins
 * - entryValue: Entry fee paid
 * - socketId: Current socket connection ID
 * - exitAttempt: Remaining disconnect attempts (starts at 2)
 * - isTimerStart: Whether disconnect timer is active
 * - isTimerStartTime: When disconnect timer started
 * - coinType: Currency used (coin/diamond)
 * - profileImage: Cached profile picture
 * - setIndex: Player position index (0-3)
 */
const playerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String },
  winnerPrize: { type: Number },
  entryValue: { type: Number },
  socketId: { type: String },
  exitAttempt: { type: Number, default: 2 },
  isTimerStart: { type: Boolean, default: false },
  isTimerStartTime: { type: Date },
  coinType: { type: String, enum: ["coin", "diamond"], default: "coin" },
  profileImage: { type: String, default: "" },
  setIndex: { type: Number, default: 0 },
  user_type: { type: String, enum: ["public", "private"], default: "public" },
});

// Chat History Schema
const chatHistorySchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String },
  timestamp: { type: Date, default: Date.now },
});

// Video Sessions Schema
const videoSessionsSchema = new Schema({
  player: { type: Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
});

module.exports = {
  playerSchema,
  chatHistorySchema,
  videoSessionsSchema,
};
