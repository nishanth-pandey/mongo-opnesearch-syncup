const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    otp: "string",
    code_expiry: "date",
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } } // Enable timestamps 
);

module.exports = mongoose.model("Otp", taskSchema);
