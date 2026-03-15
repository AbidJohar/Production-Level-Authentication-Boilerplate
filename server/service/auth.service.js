import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { google } = require('googleapis');
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { logger } from "../utility/logger.js";
import { sendEmail } from "../utility/nodemailer.js";
import { resendOtpTemplate, verifyEmailTemplate } from "../utility/emailTemplates.js";
import { storeOtp, verifyOtp, deleteOtp } from "../utility/otp.js";
import oauth2Client from "../utility/googleClient.js";
import Identity from '../models/Identity.model.js';

const SALT_ROUNDS = 10;

// ─────────────────────────────────────────────────────────────
//  Private Helpers
// ─────────────────────────────────────────────────────────────

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const generateAccessToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_ACESSTOKEN_SECRET, {
        expiresIn: process.env.JWT_ACCESSTOKEN_EXPIRES_IN,
    });

const generateRefreshToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_REFRESHTOKEN_SECRET, {
        expiresIn: process.env.JWT_REFRESHTOKEN_EXPIRES_IN,
    });

// ─────────────────────────────────────────────────────────────
//  Token Service
// ─────────────────────────────────────────────────────────────

export const createTokenPair = async (user) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const hashedRefresh = await bcrypt.hash(refreshToken, SALT_ROUNDS);
    user.refreshToken = hashedRefresh;
    await user.save();

    return { accessToken, refreshToken };
};

// ─────────────────────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────────────────────

export const registerService = async ({ name, email, password }) => {

    const existing = await User.findOne({ email });

    if (existing) {
        if (!existing.isVerified) {
            // User exists but never verified — resend a fresh OTP
            const otp = generateOtp();

            //  Store OTP in Redis (replaces DB fields)
            await storeOtp(existing._id, otp, "VERIFY_EMAIL");

            sendEmail({
                to: email,
                subject: "Your new OTP Code",
                html: resendOtpTemplate(otp),
            })

            return {
                status: 200,
                user: existing,
                body: {
                    success: true,
                    resent: true,
                    message: "OTP resent to your email.",
                    user: {
                        name: existing.name,
                        email: existing.email,
                        isVerified: existing.isVerified,
                    },
                },
            };
        }


        // Check if local identity already exists
        const existingIdentity = await Identity.findOne({
            userId: existing._id,
            provider: 'local'
        });

        if (existingIdentity) {
            return {
                status: 409,
                body: { success: false, message: "Email already in use." },
            };
        }
    }
 

   // New user — create User first (no password here)
    const user = await User.create({ name, email });

    // New user — hash password and create account
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      await Identity.create({
        userId: user._id,
        provider: 'local',
        password: hashedPassword,
    });
    const otp = generateOtp();

    //  OTP goes to Redis with auto-expiry TTL
    await storeOtp(user._id, otp, "VERIFY_EMAIL");
    //  console.log("OTP is stored in redis");


    //  Fire and forget email — response doesn't wait for this
    sendEmail({
        to: email,
        subject: "Your OTP Code",
        html: verifyEmailTemplate(otp),
    });

    return {
        status: 201,
        user,
        body: {
            success: true,
            message: "User registered successfully.",
            user: { name: user.name, email: user.email, isVerified: user.isVerified },
        },
    };
};

// ─────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────

export const loginService = async ({ email, password }) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { status: 401, body: { success: false, message: "Invalid email!" } };
    }

    if (!user.isVerified) {
        return {
            status: 401,
            body: { success: false, message: "Please verify your email before logging in." },
        };
    }

    // Fetch local identity for password
    const identity = await Identity.findOne({ userId: user._id, provider: 'local' });

    if (!identity) {
        // User exists but registered via Google — no local identity
        return {
            status: 401,
            body: { success: false, message: "This account uses Google login. Please sign in with Google." },
        };
    }

    const isMatch = await bcrypt.compare(password, identity.password);
    if (!isMatch) {
        return { status: 401, body: { success: false, message: "Invalid password." } };
    }

    return {
        status: 200,
        user,
        body: {
            success: true,
            message: "Login successful.",
            user: { name: user.name, email: user.email, isVerified: user.isVerified },
        },
    };
};

// ─────────────────────────────────────────────────────────────
//  GOOGLE LOGIN
// ─────────────────────────────────────────────────────────────


export const googleLoginService = async ({ code }) => {
    try {
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
        const { data: userInfo } = await oauth2.userinfo.get();

        console.log("userInfo:",userInfo);
        
        
        // 1. Check if Google identity already exists → returning user
        const existingIdentity = await Identity.findOne({
            provider: 'google',
            providerId: userInfo.id,
        }).populate('userId');
        
        if (existingIdentity) {
            return {
                user: existingIdentity.userId,      // populated User doc
                status: 200,
                body: {
                    success: true,
                    message: "Login successful.",
                    user: {
                        name: existingIdentity.userId.name,
                        email: existingIdentity.userId.email,
                        isVerified: existingIdentity.userId.isVerified,
                    },
                },
            };
        }
        
        // 2. No Google identity — check if email already exists (local user)
        let user = await User.findOne({ email: userInfo.email });
        
        if (!user) {
            // 3. Brand new user — create User
            user = await User.create({
                name: userInfo.name,
                email: userInfo.email,
                isVerified: true,
            });
            console.log("userInfo:",user);
        }

        // 4. Link Google identity to new or existing user
        await Identity.create({
            userId: user._id,
            provider: 'google',
            providerId: userInfo.id,
            password: null,
        });

        return {
            user,
            status: 200,
            body: {
                success: true,
                message: "Login successful.",
                user: { name: user.name, email: user.email, isVerified: user.isVerified },
            },
        };

    } catch (err) {
        console.error("Google login error:", err);
        return {
            status: 500,
            body: { success: false, message: "Internal server error" },
        };
    }
};

// ─────────────────────────────────────────────────────────────
//  REFRESH TOKEN
// ─────────────────────────────────────────────────────────────

export const refreshTokenService = async (token) => {
    if (!token) {
        return { status: 401, body: { success: false, message: "No refresh token." } };
    }

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_REFRESHTOKEN_SECRET);
    } catch {
        return {
            status: 401,
            body: { success: false, message: "Invalid or expired refresh token." },
        };
    }

    const user = await User.findById(payload.id);
    if (!user || !user.refreshToken) {
        return {
            status: 401,
            body: { success: false, message: "Session not found. Please log in again." },
        };
    }

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) {
        user.refreshToken = null;
        await user.save();
        return {
            status: 401,
            body: { success: false, message: "Token reuse detected. Please log in again." },
        };
    }

    return {
        status: 200,
        user,
        body: {
            success: true,
            message: "Tokens refreshed.",
            user: { name: user.name, email: user.email, isVerified: user.isVerified },
        },
    };
};

// ─────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────

export const logoutService = async (token) => {
    if (!token) return;

    try {
        const payload = jwt.verify(token, process.env.JWT_REFRESHTOKEN_SECRET);
        const user = await User.findById(payload.id);
        if (user) {
            user.refreshToken = null;
            await user.save();
        }
    } catch {
        // Token already expired — nothing to clean up
    }
};

// ─────────────────────────────────────────────────────────────
//  VERIFY EMAIL
// ─────────────────────────────────────────────────────────────

export const verifyEmailService = async ({ email, otp }) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    // Verify OTP from Redis — auto deleted after success (one-time use)
    const result = await verifyOtp(user._id, otp, "VERIFY_EMAIL");

    if (!result.valid) {
        const messages = {
            expired: "OTP expired. Please request a new one.",
            invalid: "Invalid OTP.",
            locked: "Too many wrong attempts. Please request a new OTP.",
        };
        return { status: 400, body: { success: false, message: messages[result.reason] } };
    }

    user.isVerified = true;
    await user.save();

    return { status: 200, body: { success: true, message: "Email verified successfully" } };
};

// ─────────────────────────────────────────────────────────────
//  RESEND OTP
// ─────────────────────────────────────────────────────────────

export const resendOtpService = async ({ email, otpType }) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    const otp = generateOtp();

    // Overwrites old OTP in Redis — resets TTL and attempt counter
    await storeOtp(user._id, otp, otpType);

    sendEmail({
        to: email,
        subject: "Your OTP Code",
        html: resendOtpTemplate(otp),
    }).catch((err) => logger.error("Email failed:", err));

    return { status: 200, body: { success: true, message: "OTP resent successfully" } };
};

// ─────────────────────────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────

export const forgotPasswordService = async ({ email }) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    const otp = generateOtp();

    // stored under RESET_PASSWORD type — separate from VERIFY_EMAIL
    await storeOtp(user._id, otp, "RESET_PASSWORD");

    sendEmail({
        to: email,
        subject: "Reset Password OTP",
        html: `<h1>${otp}</h1>`,
    }).catch((err) => logger.error("Email failed:", err));

    return { status: 200, body: { success: true, message: "OTP sent for password reset" } };
};

// ─────────────────────────────────────────────────────────────
//  VERIFY RESET OTP
// ─────────────────────────────────────────────────────────────

export const verifyResetOtpService = async ({ email, otp }) => {
    if (!email || !otp) {
        return { status: 400, body: { success: false, message: "Email and OTP are required" } };
    }

    const user = await User.findOne({ email });
    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    const result = await verifyOtp(user._id, otp, "RESET_PASSWORD");

    if (!result.valid) {
        const messages = {
            expired: "OTP expired. Please request a new one.",
            invalid: "Invalid OTP.",
            locked: "Too many wrong attempts. Please request a new OTP.",
        };
        return { status: 400, body: { success: false, message: messages[result.reason] } };
    }

    // Store a verified flag so resetPassword knows OTP was confirmed
    // Use a short 2 min window — user should reset immediately after verifying
    await storeOtp(user._id, "verified", "RESET_PASSWORD_VERIFIED");

    return {
        status: 200,
        body: { success: true, message: "OTP verified. You can now reset your password." },
    };
};

// ─────────────────────────────────────────────────────────────
//  RESET PASSWORD
// ─────────────────────────────────────────────────────────────

export const resetPasswordService = async ({ email, newPassword }) => {
    const user = await User.findOne({ email });
    if (!user) {
        return { status: 404, body: { success: false, message: "User not found" } };
    }

    // Check verified flag — prevents skipping verifyResetOtp step
    const result = await verifyOtp(user._id, "verified", "RESET_PASSWORD_VERIFIED");
    if (!result.valid) {
        return {
            status: 400,
            body: { success: false, message: "OTP not verified or session expired. Please start again." },
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update password in Identity, not User
    await Identity.findOneAndUpdate(
        { userId: user._id, provider: 'local' },
        { password: hashedPassword }
    );

    user.refreshToken = null;
    await user.save();

    // Clean up all reset keys
    await deleteOtp(user._id, "RESET_PASSWORD");
    await deleteOtp(user._id, "RESET_PASSWORD_VERIFIED");

    return { status: 200, body: { success: true, message: "Password reset successfully" } };
};