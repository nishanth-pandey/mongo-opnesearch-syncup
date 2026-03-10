/**
 * @fileoverview Model Exports - Centralized model exports for the application.
 *
 * **Purpose**: Provides a single import point for all Mongoose models.
 *
 * **Usage**:
 * ```javascript
 * const { User, Game, UserWallet } = require('./models');
 * ```
 *
 * **Exported Models**:
 * - User, UserLoginHistory: User accounts and login history
 * - Otp: OTP verification codes
 * - Currency: Currency configuration (deprecated)
 * - Game: Active game state
 * - UserWallet: User currency balances
 * - Notification: User notifications
 * - UserTransaction: Transaction history
 * - AnalysisUser: Analytics user data
 * - Follow: User follow relationships
 */

const { User, UserLoginHistory } = require("./user");
const Otp = require("./otp");
const Currency = require("./currency");
const Game = require("./game");
const UserWallet = require("./userWallet.js");
const Notification = require("./Notification");
const UserTransaction = require("./userTransaction");
const { AnalysisUser } = require("./AnalysisUser");
const Follow = require("./follow");
const SettledGame = require("./SettledGame");

module.exports = {
  Follow,
  User,
  UserLoginHistory,
  Otp,
  Currency,
  Game,
  UserWallet,
  Notification,
  SettledGame,
  UserTransaction,
  AnalysisUser,
};
