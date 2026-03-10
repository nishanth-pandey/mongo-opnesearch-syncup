/**
 * @fileoverview Follow Model - User follow/following relationships.
 * 
 * **Purpose**: Manages social connections between users.
 * 
 * **Features**:
 * - Follow/unfollow functionality
 * - Request/accept flow (currently defaults to 'accepted')
 * - Unique follower-following pairs
 * - Indexed for fast queries
 * 
 * **Database**: Main MongoDB (dbConnection)
 * **Collection**: follows
 * 
 * **Relationships**:
 * - follower → User (user who follows)
 * - following → User (user being followed)
 * 
 * **Indexes**:
 * - follower (for "who I follow" queries)
 * - following (for "my followers" queries)
 * - {follower, following} unique compound (prevents duplicates)
 * 
 * **Fields**:
 * - follower: User who is following
 * - following: User being followed
 * - status: 'requested' or 'accepted' (currently defaults to 'accepted')
 * - createdAt: When relationship was created
 */

const mongoose = require('mongoose');

/**
 * Follow Schema
 * 
 * **Social Graph**: Updates User.followersCount and User.followingCount
 * when relationships are created/deleted.
 */
const FollowSchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['requested', 'accepted'], default: 'accepted' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

FollowSchema.index({ follower: 1, following: 1 }, { unique: true });

module.exports = mongoose.model('Follow', FollowSchema);
