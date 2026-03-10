/**
 * @fileoverview App Config Model - Application-wide configuration settings.
 *
 * **Purpose**: Centralized configuration for app features, rewards, emojis,
 * and store links. Typically only one document exists.
 *
 * **Key Features**:
 * - Maintenance mode control
 * - Initial user rewards configuration
 * - Daily bonus system settings
 * - Referral bonus configuration
 * - Emoji marketplace with pricing
 * - App store links (Apple/Google)
 *
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: appconfigs
 *
 * **Usage**:
 * - Fetched by getApkConfig API endpoint
 * - Updated via admin panel
 * - Cached for performance
 *
 * **Configuration Sections**:
 *
 * **App Settings**:
 * - appName: Application name
 * - version: Current app version
 * - maintenanceMode: Disable app access
 * - guestAllowed: Allow guest login
 * - freeUpdate, freeCoin: Feature flags
 *
 * **Rewards**:
 * - initialCons: Coins given on signup
 * - dailyBonusCons, dailyBonusAmount: Daily login rewards
 * - dailyBonusIntervalHours: Hours between bonuses
 * - dailyBonusEnabled: Enable/disable daily bonuses
 * - referralBonusCons: Coins for referrals
 * - referralBonusEnabled: Enable/disable referral system
 * - referralBonusLimitPerUser: Max referrals per user
 *
 * **Emojis**:
 * - emogi[]: Array of purchasable emojis
 *   - id: Unique emoji identifier
 *   - price: Cost in coins or diamonds
 *   - coinType: Currency type (coin/diamond)
 *   - emogiPicUrl: S3 key for static image
 *   - emogiAnimationUrl: S3 key for animation
 *   - order: Display order
 *
 * **Store Links**:
 * - appleStoreConfig: iOS app store settings
 * - googlePlayConfig: Android play store settings
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

/**
 * App Config Schema
 *
 * **Singleton Pattern**: Typically only one document exists in collection.
 * Updates are made in-place rather than creating new documents.
 */
const AppConfigSchema = new Schema(
  {
    appName: { type: String },
    version: { type: String },
    appConfig: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false },
    guestAllowed: { type: Boolean, default: false },
    freeUpdate: { type: Boolean, default: false },
    freeCoin: { type: Boolean, default: false },
    initialCons: { type: Number, default: 0 },
    dailyBonusCons: { type: Number, default: 0 },
    dailyBonusIntervalHours: { type: Number, default: 24 },
    dailyBonusEnabled: { type: Boolean, default: false },
    dailyBonusAmount: { type: Number, default: 0 },
    referralBonusCons: { type: Number, default: 0 },
    referralBonusEnabled: { type: Boolean, default: false },
    referralBonusLimitPerUser: { type: Number, default: 0 },
    emogi: [
      {
        id: { type: String, required: true },
        price: { type: Number },
        coinType: { type: String, enum: ["coin", "diamond"] },
        emogiPicUrl: { type: String, default: "" },
        emogiSpritPicUrl: { type: String, default: "" },
        order: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    appleStoreConfig: {
      isEnabled: { type: Boolean, default: false },
      appId: { type: String, default: "" },
      appUrl: { type: String, default: "" },
    },
    googlePlayConfig: {
      isEnabled: { type: Boolean, default: false },
      appId: { type: String, default: "" },
      appUrl: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AppConfig", AppConfigSchema);
