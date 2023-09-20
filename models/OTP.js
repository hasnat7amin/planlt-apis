const mongoose = require("mongoose");

const OTPSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    otp: { type: String, required: true },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: Date.now,
        expires: 300 // expires in 5 minutes
    }
  },
  {
    timestamps: true,
    collection: "OTP",
  }
);

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
