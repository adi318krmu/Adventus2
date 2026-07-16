import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, lowercase: true },
    hashedOTP: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    purpose: { type: String, enum: ["registration", "email-verification"], required: true },
    createdAt: { type: Date, default: Date.now }
  }
);

// MongoDB TTL index that deletes records once current time exceeds expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OTP", otpSchema);
