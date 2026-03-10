/**
 * @fileoverview Notification Model - User notification system.
 *
 * **Purpose**: Stores user notifications for various app events like
 * game results, friend requests, rewards, and system announcements.
 *
 * **Key Features**:
 * - User-specific and broadcast notifications
 * - Type-based categorization
 * - Read/unread tracking
 * - Status management (active/inactive)
 * - Flexible data payload
 *
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: notifications
 *
 * **Relationships**:
 * - userId → User (notification recipient)
 *
 * **Notification Types** (from NOTIFICATION_TYPES constant):
 * - Game results
 * - Friend requests
 * - Rewards
 * - System announcements
 * - And more (see Constants.js)
 *
 * **Visibility**:
 * - 'user': Visible only to specific user
 * - 'all': Broadcast to all users
 *
 * **Status**:
 * - 0: Inactive/hidden
 * - 1: Active/visible
 *
 * **Fields**:
 * - userId: Recipient user (null for broadcast)
 * - visibility: 'user' or 'all'
 * - type: Notification type (enum from NOTIFICATION_TYPES)
 * - data: Flexible payload object
 * - status: Active (1) or inactive (0)
 * - isRead: Read status flag
 * - createdAt: Creation timestamp (auto)
 */

const mongoose = require("mongoose");
// const { NOTIFICATION_TYPES } = require("../services/Constants");
const NOTIFICATION_TYPES = {
  USER_DISCONNECTED: {
    priority: "high",
    // delay: 10000, --change based on your needs
  },
  DAILY_LOGIN: {
    priority: "low",
    delay: 60000,
  },
  SPIN_REWARD: {
    priority: "low",
    delay: 60000,
  },
  INAPP_NOTIFICATION: {
    priority: "medium",
    delay: 120000,
  },
};

/**
 * Notification Schema
 *
 * **Design**: Flexible data field allows different notification types
 * to store type-specific information without schema changes.
 */
const Notification = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User" },
    visibility: {
      type: String,
      enum: ["user", "all"],
    },
    type: {
      type: String,
      enum: Object.keys(NOTIFICATION_TYPES),
    },
    data: {
      type: Object,
      required: false,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

module.exports = mongoose.model("Notification", Notification);
