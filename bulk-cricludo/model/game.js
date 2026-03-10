/**
 * @fileoverview Game Model - Active game state and room management.
 * 
 * **Purpose**: Stores real-time game state for active games including players,
 * board state, chat, and game progress. Deleted after game completion.
 * 
 * **Key Features**:
 * - Real-time game state tracking
 * - Player management (join, leave, disconnect)
 * - Board state and token positions
 * - Turn management
 * - Chat history
 * - Visitor/spectator support
 * - User blocking
 * - Video session tracking
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: games
 * 
 * **Relationships**:
 * - roomCreatedBy → User (room creator)
 * - currentPlayer → User (whose turn it is)
 * - players[].userId → User (via playerSchema)
 * - blockedUsers[].userId → User (blocked user)
 * - blockedUsers[].blockedBy → User (who blocked them)
 * 
 * **Indexes**:
 * - roomId (unique, for fast lookups)
 * 
 * **Game Types**:
 * - classic: Traditional Ludo rules
 * - cricket: Cricket-themed variant
 * 
 * **Categories**:
 * - online: Public matchmaking
 * - with_friends: Private room
 * 
 * **Coin Types**:
 * - coin: Standard currency
 * - diamond: Premium currency
 * 
 * **Lifecycle**:
 * 1. Created via CreateRoom or JoinRoom
 * 2. Players join until playerLimit reached
 * 3. Game starts (isGameStart = true)
 * 4. Players take turns, state updates
 * 5. Game completes, winners determined
 * 6. Coins distributed
 * 7. SettledGame created
 * 8. Game document deleted
 * 
 * **Fields**:
 * - roomCreatedBy: User who created the room
 * - roomId: Unique room identifier
 * - playerLimit: Max players (2-4)
 * - coinType: Currency used for entry
 * - gameType: classic or cricket
 * - category: online or with_friends
 * - entryValue: Entry fee amount
 * - winnerPrize: Prize pool
 * - totalOver: Total overs (for cricket mode)
 * - isGameStart: Whether game has started
 * - players[]: Array of player data (playerSchema)
 * - currentPlayer: User whose turn it is
 * - gameState: Map of player states (tokens, scores, etc.)
 * - board: Map of board configuration
 * - isBoard: Whether board is active
 * - isPrivate: Private room flag
 * - chatHistory[]: Array of chat messages
 * - newResult: Game results with winners
 * - blockedUsers[]: Array of blocked users
 * - startedAt: Game start timestamp
 * - finishedAt: Game completion timestamp
 * - videoSessions[]: Video call sessions
 * - createdAt, updatedAt: Auto timestamps
 */

const mongoose = require("mongoose")
const { Schema } = mongoose
const { playerSchema, chatHistorySchema, videoSessionsSchema } = require("./commonSchema")

/**
 * Game Schema
 * 
 * **Real-time Updates**: This schema is frequently updated via Socket.IO
 * events. Use atomic operations ($set, $push, $inc) to prevent race conditions.
 * 
 * **State Management**: gameState and board use Map type for flexible
 * storage of player-specific and position-specific data.
 */
const GameSchema = new Schema(
   {
      roomCreatedBy: { type: Schema.Types.ObjectId, ref: "User" },
      roomId: { type: String, unique: true },
      playerLimit: { type: Number },
      coinType: { type: String, enum: ["coin", "diamond"], default: "coin" },
      gameType: { type: String, enum: ["classic", "cricket"] },
      category: { type: String, enum: ["online", "with_friends"] },
      entryValue: { type: Number, default: 0 },
      winnerPrize: { type: Number, default: 0 },
      totalOver: { type: Number, default: 10 },
      isGameStart: { type: Boolean, default: false },
      players: [playerSchema],
      currentPlayer: { type: Schema.Types.ObjectId, ref: "User" },
      gameState: { type: Map, of: Object, default: {} },
      board: { type: Map, of: Object, default: {} },
      isBoard: { type: Boolean, default: true },
      isPrivate: { type: Boolean, default: true },
      chatHistory: [chatHistorySchema],
      newResult: {
         winners: [
            {
               userId: { type: Schema.Types.ObjectId, ref: "User" },
               rank: Number,
               winPrize: Number,
            },
         ],
         completedAt: Date,
      },
      blockedUsers: [
         {
            userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
            blockedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
            timestamp: { type: Date, default: Date.now },
         },
      ],
      startedAt: { type: Date, default: Date.now },
      finishedAt: { type: Date },
      videoSessions: [videoSessionsSchema],
   },
   { timestamps: true }
)

const Game = mongoose.model("Game", GameSchema)

module.exports = Game
