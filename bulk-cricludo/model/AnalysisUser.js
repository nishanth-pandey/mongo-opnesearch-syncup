/**
 * @fileoverview Analytics User Model for tracking user behavior and game statistics.
 * 
 * **Purpose**: Separate analytics database for tracking user activity, game sessions,
 * login history, and performance metrics without impacting main application database.
 * 
 * **Key Features**:
 * - Login/logout session tracking with duration
 * - Game session tracking with start/end times
 * - Activity statistics (daily, weekly, monthly aggregations)
 * - Win rate calculations
 * - Rating system based on performance
 * - Time spent tracking
 * 
 * **Database**: Separate MongoDB connection (analysisDbConnection)
 * **Collection**: analysisData
 * 
 * **Relationships**:
 * - Links to main User model via userId (string reference, not ObjectId)
 * - No direct MongoDB relationships (separate database)
 * 
 * **Indexes**:
 * - userId (unique, primary lookup)
 * - email (user identification)
 * - createdAt (temporal queries)
 * - lastLogin (activity tracking)
 * - rating (leaderboards, descending)
 * - gamesPlayed (leaderboards, descending)
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * Generates period strings for activity aggregation.
 * 
 * **Purpose**: Creates standardized period identifiers for daily, weekly,
 * and monthly activity tracking.
 * 
 * **Format**:
 * - day: "YYYY-MM-DD" (e.g., "2024-01-15")
 * - week: "YYYY-Www" (e.g., "2024-W03")
 * - month: "YYYY-MM" (e.g., "2024-01")
 * 
 * @param {Date} [date=new Date()] - Date to generate periods for
 * @returns {{day: string, week: string, month: string}} Period identifiers
 * 
 * @example
 * const periods = getPeriodStrings(new Date('2024-01-15'));
 * // Returns: { day: '2024-01-15', week: '2024-W03', month: '2024-01' }
 */
function getPeriodStrings(date = new Date()) {
  const iso = date.toISOString();
  const year = date.getUTCFullYear();
  const month = `${year}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  const day = iso.split('T')[0];

  const firstDay = new Date(Date.UTC(year, 0, 1));
  const dayOfYear = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
  const week = `${year}-W${String(Math.ceil((dayOfYear + firstDay.getUTCDay() + 1) / 7)).padStart(2, '0')}`;

  return { day, week, month };
}

/**
 * Login History Sub-Schema
 * 
 * **Purpose**: Tracks individual login/logout sessions with duration and IP tracking.
 * 
 * **Fields**:
 * - loginAt: Session start timestamp (required)
 * - logoutAt: Session end timestamp (null if active)
 * - duration: Session length in milliseconds
 * - ipAddress: System and browser IP addresses
 * - deviceCode: Device identifier
 */
const loginHistorySchema = new Schema({
  loginAt: { type: Date, required: true },
  logoutAt: { type: Date, default: null },
  duration: { type: Number, default: 0 },
  ipAddress: {
    system_ip: String,
    browser_ip: String,
  },
  deviceCode: String,
}, { _id: false });

/**
 * Game Session Sub-Schema
 * 
 * **Purpose**: Tracks individual game sessions from start to completion.
 * 
 * **Fields**:
 * - gameId: Unique game identifier (indexed for queries)
 * - startedAt: Game start timestamp
 * - endedAt: Game end timestamp (null if in progress)
 * - duration: Game length in milliseconds
 * - endReason: How game ended (complete/disconnect/timeout)
 * - gameType: Game mode (classic/cricket)
 * - gameCategory: Game category (online/with_friends)
 */
const gameSessionSchema = new Schema({
  gameId: { type: String, required: true, index: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date, default: null },
  duration: { type: Number, default: 0 },
  endReason: { type: String, default: "complete" },

  gameType: { type: String, default: "unknown" },
  gameCategory: { type: String, default: "unknown" },
}, { _id: false });

/**
 * Activity Statistics Sub-Schema
 * 
 * **Purpose**: Aggregates user activity by time period (daily/weekly/monthly).
 * 
 * **Fields**:
 * - period: Period identifier (e.g., "2024-01-15", "2024-W03", "2024-01")
 * - type: Aggregation type (daily/weekly/monthly)
 * - gamesJoined: Number of games joined in period
 * - gamesPlayed: Number of games completed in period
 * - timeSpent: Total time in milliseconds
 * - wins: Number of wins in period
 * - losses: Number of losses in period
 */
const activitySchema = new Schema({
  period: { type: String, required: true },
  type: { type: String, enum: ['daily', 'weekly', 'monthly'], required: true },
  gamesJoined: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  timeSpent: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
}, { _id: false });

/**
 * Analysis User Schema
 * 
 * **Purpose**: Main analytics schema for tracking comprehensive user behavior.
 * 
 * **Core Fields**:
 * - userId: Reference to main User._id (string, not ObjectId due to separate DB)
 * - username, email, profilePic: User identification
 * - createdAt, lastLogin, lastLogout: Temporal tracking
 * - isActive: User activity status
 * 
 * **Statistics Fields**:
 * - gamesJoined, gamesPlayed: Game participation counters
 * - wins, losses: Performance counters
 * - rating: Calculated performance rating (0-1)
 * - coinsDistributed: Total coins won
 * - totalTimeSpent: Cumulative time in milliseconds
 * 
 * **Nested Arrays**:
 * - loginHistory: Array of login/logout sessions
 * - gameSessions: Array of game sessions
 * - activityStats: Array of period-based aggregations
 */
const analysisUserSchema = new Schema({
  userId: { type: String, required: true, unique: true, index: true },
  username: { type: String, required: true, maxLength: 100 },
  email: { type: String, maxLength: 100 },
  profilePic: { type: String, default: "" },

  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: null },
  lastLogout: { type: Date, default: null },
  isActive: { type: Boolean, default: true },

  gamesJoined: { type: Number, default: 0 },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  coinsDistributed: { type: Number, default: 0 },
  totalTimeSpent: { type: Number, default: 0 },

  loginHistory: [loginHistorySchema],
  gameSessions: [gameSessionSchema],
  activityStats: { type: [activitySchema], default: [] },
}, {
  timestamps: true,
  collection: "analysisData",
});

analysisUserSchema.index({ userId: 1 });
analysisUserSchema.index({ email: 1 });
analysisUserSchema.index({ createdAt: 1 });
analysisUserSchema.index({ lastLogin: 1 });
analysisUserSchema.index({ rating: -1 });
analysisUserSchema.index({ gamesPlayed: -1 });

/**
 * Virtual field: winRate
 * 
 * **Purpose**: Calculates win percentage from wins and losses.
 * 
 * **Formula**: (wins / (wins + losses)) * 100
 * 
 * **Returns**: Win rate as percentage (0-100), or 0 if no games played
 */
analysisUserSchema.virtual("winRate").get(function () {
  const totalGames = this.wins + this.losses;
  return totalGames > 0 ? (this.wins / totalGames) * 100 : 0;
});

analysisUserSchema.methods.updateRating = function () {
  const totalGames = this.wins + this.losses;
  this.rating = totalGames > 0 ? this.wins / totalGames : 0;
  return this.save();
};

analysisUserSchema.methods.addLoginSession = function (loginData) {
  this.loginHistory.push({
    loginAt: loginData.loginAt,
    ipAddress: loginData.ipAddress,
    deviceCode: loginData.deviceCode,
  });
  this.lastLogin = loginData.loginAt;
  return this.save();
};

analysisUserSchema.methods.updateLogoutSession = function (logoutData) {
  const activeSession = this.loginHistory.find((s) => !s.logoutAt);
  if (activeSession) {
    const logoutAt = new Date(logoutData.logoutAt);
    const loginAt = new Date(activeSession.loginAt);
    activeSession.logoutAt = logoutAt;
    activeSession.duration = logoutAt - loginAt;
    this.totalTimeSpent += activeSession.duration;
    this.lastLogout = logoutAt;
  }
  return this.save();
};

analysisUserSchema.methods.startGameSession = function ({ gameId, startedAt }) {
  const existing = this.gameSessions.find((s) => s.gameId === gameId && !s.endedAt);
  if (!existing) {
    this.gameSessions.push({ gameId, startedAt: new Date(startedAt) });
  }
  return this.save();
};

analysisUserSchema.methods.endGameSession = function ({ gameId, endedAt, endReason, gameType, gameCategory }) {
  const session = this.gameSessions.find((s) => s.gameId === gameId && !s.endedAt);
  if (session) {
    const end = new Date(endedAt);
    const start = new Date(session.startedAt);
    session.endedAt = end;
    session.duration = Math.max(0, end - start);
    session.endReason = endReason || session.endReason;
    session.gameType = gameType || session.gameType;
    session.gameCategory = gameCategory || session.gameCategory

    this.totalTimeSpent += session.duration;

    const { day } = getPeriodStrings(end);
    return this.updateActivityStats(day, 'daily', { timeSpent: session.duration }, false);
  }
  return this.save();
};

analysisUserSchema.methods.updateActivityStats = function (period, type, data, updateGlobal = true) {
  const activity = this.activityStats.find(stat => stat.period === period && stat.type === type);

  if (activity) {
    activity.gamesJoined += data.gamesJoined || 0;
    activity.gamesPlayed += data.gamesPlayed || 0;
    activity.timeSpent += data.timeSpent || 0;
    activity.wins += data.wins || 0;
    activity.losses += data.losses || 0;
  } else {
    this.activityStats.push({
      period,
      type,
      gamesJoined: data.gamesJoined || 0,
      gamesPlayed: data.gamesPlayed || 0,
      timeSpent: data.timeSpent || 0,
      wins: data.wins || 0,
      losses: data.losses || 0,
    });
  }

  if (updateGlobal) {
    this.gamesJoined += data.gamesJoined || 0;
    this.gamesPlayed += data.gamesPlayed || 0;
    this.wins += data.wins || 0;
    this.losses += data.losses || 0;
    this.totalTimeSpent += data.timeSpent || 0;
  }

  return this.save();
};

const AnalysisUser = mongoose.model("AnalysisData", analysisUserSchema);

module.exports = { AnalysisUser, getPeriodStrings };
