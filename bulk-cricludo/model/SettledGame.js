/**
 * @fileoverview Settled Game Model - Archive of completed games.
 * 
 * **Purpose**: Stores completed game records for history, statistics,
 * and audit purposes after games are deleted from active Game collection.
 * 
 * **Key Features**:
 * - Permanent record of completed games
 * - Player results and rankings
 * - Game metadata (type, category, creator)
 * - Settlement timestamp
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: settledgames
 * 
 * **Relationships**:
 * - roomCreatedBy → User (game creator)
 * - players[].userId → User (via playerSchema)
 * 
 * **Lifecycle**:
 * 1. Game completes in Game collection
 * 2. Results calculated and coins distributed
 * 3. SettledGame record created
 * 4. Active Game deleted
 * 
 * **Fields**:
 * - roomCreatedBy: User who created the game
 * - roomId: Game room identifier
 * - gameType: classic or cricket
 * - category: online or with_friends
 * - players: Array of player data (from playerSchema)
 * - result: Game outcome with winners and completion time
 * - settledAt: When game was archived
 */

const mongoose = require("mongoose")
const { Schema } = mongoose
const { playerSchema } = require("./commonSchema")

/**
 * Settled Game Schema
 * 
 * **Purpose**: Immutable record of completed games for analytics and history.
 */
const SettledGameSchema = new mongoose.Schema({
   roomCreatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
   roomId: { type: String },
   gameType: { type: String, enum: ["classic", "cricket"] },
   category: { type: String, enum: ["online", "with_friends"] },
   players: [playerSchema],
   result: {
      type: Object,
      completedAt: { type: Date },
   },
   settledAt: { type: Date, default: Date.now },
})

const SettledGame = mongoose.model("SettledGame", SettledGameSchema)

module.exports = SettledGame
