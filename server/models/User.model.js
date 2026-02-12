import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },

    //  Single OTP System
    otp: { type: String, default: "" },
    otpExpireAt: { type: Number, default: 0 },
    otpType: { type: String, enum: ["VERIFY_EMAIL", "RESET_PASSWORD", null], default: null },

    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
export default User;
