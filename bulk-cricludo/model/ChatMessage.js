/**
 * @fileoverview Chat Message Model - Stores game room chat messages.
 * 
 * **Purpose**: Persists chat messages for game rooms, supporting both
 * players and visitors (spectators) with moderation features.
 * 
 * **Key Features**:
 * - Room-based chat (indexed by roomId)
 * - Player and visitor support
 * - Message deletion with tracking
 * - Profile picture caching
 * - Timestamp tracking
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: chatmessages
 * 
 * **Relationships**:
 * - senderId → User (message author)
 * - deletedBy → User (moderator who deleted message)
 * 
 * **Indexes**:
 * - roomId (for efficient room message queries)
 * 
 * **Usage**:
 * - Created via sendMessage socket event
 * - Fetched via fetchChatHistory socket event
 * - Soft deleted via deleteMessage socket event
 * 
 * **Fields**:
 * - roomId: Game room identifier (indexed)
 * - senderId: User who sent the message
 * - username: Cached username for display
 * - message: Message content
 * - isVisitor: Whether sender is a spectator
 * - profilePic: Cached profile picture URL
 * - isDeleted: Soft delete flag
 * - deletedBy: User who deleted the message
 * - timestamp: Message creation time
 */

// models/ChatMessage.js
const mongoose = require("mongoose");

/**
 * Chat Message Schema
 * 
 * **Caching Strategy**: Stores username and profilePic to avoid
 * repeated User lookups when fetching chat history.
 */
const chatMessageSchema = new mongoose.Schema({
  roomId: { type: String, required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  username: String,
  message: String,
  isVisitor: { type: Boolean, default: false },
  profilePic: String,
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
