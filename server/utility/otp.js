import redisClient from "../utility/redisClient.js";

// OTP lives for 5 minutes
const OTP_TTL = 5 * 60; // seconds

// ___________(  Key Builder )________________
const otpKey = (userId, type) => `otp:${userId}:${type}`;

// ___________(  Store OTP  )_________________
// Saves OTP to Redis with 5 min TTL.
// Overwrites any existing OTP for the same user + type.
export const storeOtp = async (userId, otp, type) => {
    // console.log("values inside storeOTP:", userId, " ", otp, " ",type );
      
  await redisClient.set(otpKey(userId, type), String(otp), { EX: OTP_TTL });
   
};

// ____________( Verify OTP )___________________
// Returns: { valid: true } on success
//          { valid: false, reason: "expired" | "invalid" } on failure
export const verifyOtp = async (userId, otp, type) => {
  const stored = await redisClient.get(otpKey(userId, type));

  if (!stored) return { valid: false, reason: "expired" };
  if (stored !== String(otp)) return { valid: false, reason: "invalid" };

  await redisClient.del(otpKey(userId, type));
  return { valid: true };
};


// ______________( Delete OTP )_________________
// Manually invalidate an OTP before it expires naturally
export const deleteOtp = async (userId, type) => {
  await redisClient.del(otpKey(userId, type));
};