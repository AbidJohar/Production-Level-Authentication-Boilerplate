import mongoose from "mongoose";

const IdentitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  provider: { type: String, enum: ['local', 'google', 'github'], required: true },
  providerId: { type: String, default: null }, // Google/GitHub ID
  password: { type: String, default: null },   // only for local
}, { timestamps: true });

// One user can't have duplicate providers
IdentitySchema.index({ userId: 1, provider: 1 }, { unique: true });

const Identity = mongoose.models.Identity || mongoose.model("Identity", IdentitySchema);
export default Identity;