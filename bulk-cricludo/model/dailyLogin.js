/**
 * @fileoverview Daily Login Models - Daily login reward system.
 * 
 * **Purpose**: Tracks user login streaks and reward history for daily bonus system.
 * 
 * **Models**:
 * - DailyLogin: Current streak tracking
 * - DailyLoginHistory: Historical reward records
 * 
 * **Features**:
 * - Login streak tracking
 * - Multi-currency rewards (coins, diamonds, lives)
 * - Duplicate prevention (unique userId+date index)
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collections**: dailylogins, dailyloginhistories
 */

const mongoose = require("mongoose")
const { Schema, model } = mongoose

/**
 * Daily Login Schema
 * 
 * **Purpose**: Tracks current login streak for each user.
 * 
 * **Fields**:
 * - userId: User reference (unique)
 * - lastLoginDate: Last login timestamp
 * - currentStreak: Consecutive days logged in
 */
// Daily Login Schema
const dailyLoginSchema = new Schema(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", unique: true, required: true },
      lastLoginDate: { type: Date, required: true },
      currentStreak: { type: Number, default: 1 },
   },
   { timestamps: true }
)

// Daily Login History Schema
const dailyLoginHistorySchema = new Schema(
   {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      date: { type: Date, required: true },
      reward: {
         coins: { type: Number, default: 0 },
         diamonds: { type: Number, default: 0 },
         lives: { type: Number, default: 0 },
      },
   },
   { timestamps: true }
)

// Create unique index for userId and date combination
dailyLoginHistorySchema.index({ userId: 1, date: 1 }, { unique: true })

const DailyLogin = model("DailyLogin", dailyLoginSchema)
const DailyLoginHistory = model("DailyLoginHistory", dailyLoginHistorySchema)

module.exports = { DailyLogin, DailyLoginHistory }
