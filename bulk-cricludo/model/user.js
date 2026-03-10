/**
 * @fileoverview User Model - Main user account schema for CricLudo application.
 *
 * **Purpose**: Stores user account information, authentication data, profile details,
 * game statistics, and social features.
 *
 * **Key Features**:
 * - Multi-provider authentication (Google, Apple, Guest, Standard)
 * - Profile management (username, email, profile pictures)
 * - Wallet integration (coins and diamonds)
 * - Game statistics tracking (wins, losses, rating)
 * - Social features (followers, following counts)
 * - Device tracking for multi-device support
 * - IP address logging for security
 *
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: users
 *
 * **Relationships**:
 * - wallet_id → UserWallet (one-to-one)
 * - currency_id → Currency (many-to-one)
 * - nodeRefId → Neo4j user node reference (string)
 *
 * **Indexes**:
 * - followersCount (for leaderboards)
 * - followingCount (for social features)
 *
 * **Status Values**:
 * - "0": Inactive (email not verified)
 * - "1": Active (normal user)
 * - "2": Deleted (soft delete)
 * - "3": Banned/Suspended
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * User Schema
 *
 * **Authentication Fields**:
 * - username: Unique username (required, max 100 chars)
 * - email: Email address for standard login
 * - password: Hashed password (bcrypt)
 * - password_text: Plain text password (for recovery - should be encrypted)
 * - google_id: Google OAuth user ID
 * - apple_id: Apple Sign-In user ID
 * - token: JWT authentication token
 * - email_verify: Email verification timestamp (null = not verified)
 *
 * **Profile Fields**:
 * - profile_pic: User uploaded profile picture (S3 key)
 * - google_pic: Google profile picture URL
 * - mobile_no: Phone number
 * - vip_user: VIP status flag
 * - is_guest: Guest account flag
 *
 * **Device & Session Fields**:
 * - device_code: Unique device identifier
 * - guest_login: Guest login identifier
 * - ip_address: System and browser IP addresses
 * - last_login: Last login timestamp
 *
 * **Wallet & Currency**:
 * - wallet_id: Reference to UserWallet
 * - currency_id: Reference to Currency
 * - balance: User balance (deprecated, use wallet_id)
 *
 * **Game Statistics**:
 * - rating: Performance rating (0-1)
 * - gamesJoined: Total games joined
 * - gamesPlayed: Total games completed
 * - wins: Total wins
 * - losses: Total losses
 *
 * **Social Features**:
 * - followersCount: Number of followers (indexed)
 * - followingCount: Number of users following (indexed)
 * - nodeRefId: Neo4j node element ID for graph queries
 *
 * **Status & Timestamps**:
 * - status: Account status (0=inactive, 1=active, 2=deleted, 3=banned)
 * - createdAt: Account creation timestamp (auto)
 * - updatedAt: Last update timestamp (auto)
 */
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      maxLength: 100,
    },
    email: {
      type: String,
      maxLength: 100,
    },
    apple_id: {
      type: String,
      maxLength: 100,
    },
    password: {
      type: String,
      maxLength: 100,
    },
    google_pic: {
      type: String,
      default: "",
    },
    profile_pic: {
      type: String,
      default: "",
    },
    password_text: {
      type: String,
      maxLength: 100,
    },
    google_id: {
      type: String,
      maxLength: 100,
    },
    mobile_no: {
      type: Number,
      maxLength: 15,
    },
    device_code: {
      type: String,
      maxLength: 100,
    },
    guest_login: {
      type: String,
      maxLength: 100,
    },
    email_verify: {
      type: "date",
      default: null,
      Comment: { date: "verified", null: "not verified" },
    },
    token: {
      type: String,
    },
    vip_user: {
      type: Boolean,
      default: false,
    },
    followersCount: { type: Number, default: 0, index: true },
    followingCount: { type: Number, default: 0, index: true },
    is_guest: {
      type: Boolean,
      default: false,
    },
    currency_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
    },
    wallet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserWallet",
    },
    nodeRefId: {
      type: String,
      default: null,
    },
    balance: {
      type: Number,
      required: false,
      min: 0,
      max: 200000000000,
    },
    ip_address: {
      system_ip: {
        type: String,
        default: null,
      },
      browser_ip: {
        type: String,
        default: null,
      },
    },
    last_login: {
      type: Date,
    },
    rating: { type: Number, default: 0 },
    gamesJoined: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    status: {
      type: String,
      default: "0",
      enum: ["0", "1", "2", "3"], //0-inactive, 1- active, 2- deleted
    },
    lastSpinTime: {
      type: Date,
      required: false,
    },
    user_type: {
      type: String,
      enum: ["private", "public"],
      default: "public",
    },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }, // Enable timestamps
);

// Login history schema
const loginHistorySchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    login_details: [{ type: Object }],
    createDate: "date",
    updatedDate: "date",
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }, // Enable timestamps
);

const UserLoginHistory = mongoose.model("UserLoginHistory", loginHistorySchema);
const User = mongoose.model("User", userSchema);

module.exports = { User, UserLoginHistory };
