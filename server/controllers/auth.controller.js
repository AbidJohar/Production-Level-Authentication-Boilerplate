import bcrypt from "bcryptjs" ;
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { logger } from "../utility/logger.js";
import { sendEmail } from "../utility/nodemailer.js";
import {resendOtpTemplate,verifyEmailTemplate} from '../utility/emailTemplates.js'


const SALT_ROUNDS = 10;

 // -------- Helper Functions ---------

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const attachCookie = (res, token) =>
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });

// ---------- REGISTER ENDPOINT ----------
export const register = async (req, res) => {
  logger.info("hit the register controller...");
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });

    if (existing) {
      if (!existing.isVerified) {
        // Resend a fresh OTP so the user can complete verification
        const otp = generateOtp();
        existing.otp = otp;
        existing.otpExpireAt = Date.now() + 5 * 60 * 1000;
        existing.otpType = "VERIFY_EMAIL";
        await existing.save();

        await sendEmail({
          to: email,
          subject: "Your new OTP Code",
          html: resendOtpTemplate(otp),     // ← clean template call
        });

        const token = generateToken(existing._id);
        attachCookie(res, token);

        return res.status(200).json({
          success: true,
          resent: true,                      // ← frontend can show the right toast
          message: "OTP resent to your email.",
          user: {
            name: existing.name,
            email: existing.email,
            isVerified: existing.isVerified,
          },
        });
      }

      // Account is fully verified — real duplicate
      return res.status(409).json({
        success: false,
        message: "Email already in use.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOtp();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpireAt: Date.now() + 5 * 60 * 1000,
      otpType: "VERIFY_EMAIL",
    });

    await sendEmail({
      to: email,
      subject: "Your OTP Code",
      html: verifyEmailTemplate(otp),        // ← clean template call
    });

    const token = generateToken(user._id);
    attachCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    logger.error("Register error:", err.message);
    return res.status(400).json({
      success: false,
      message: err.message || "Failed to register.",
    });
  }
};

// ---------- LOGIN ENDPOINT ----------

export const login = async (req, res) => {
  logger.info("hit the login endpoint...");
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email!" });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password." });
    }
    
    const token = generateToken(user._id);
    attachCookie(res, token);
    
    return res.json({
      success: true,
      message: "Login successful.",
      user: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    logger.error("Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to login.",
    });
  }
};

// ---------- LOGOUT ENDPOINT ----------

export const logout = async (req, res) => {
  logger.info("hit the logout endpoint...");
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    logger.error("Logout error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to logout.",
    });
  }
};


// ---------- VERIFY EMAIL OTP ----------
export const verifyEmail = async (req, res) => {

  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email, otpType: "VERIFY_EMAIL" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (user.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (user.otpExpireAt < Date.now()) return res.status(400).json({ success: false, message: "OTP expired" });

    user.isVerified = true;
    user.otp = "";
    user.otpExpireAt = 0;
    user.otpType = null;
    await user.save();

    res.json({ success: true, message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- RESEND OTP ----------
export const resendOtp = async (req, res) => {
       logger.info("resend OTP is hitting..");
  try {
    const { email, otpType } = req.body;
    console.log("email and otpTYPE:",email + " " + otpType);

    const user = await User.findOne({ email, otpType: "VERIFY_EMAIL" });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpireAt = Date.now() + 5 * 60 * 1000;
    user.otpType = otpType; // VERIFY_EMAIL or RESET_PASSWORD
    await user.save();

    await sendEmail({ to: email, subject: "Your OTP Code", html: resendOtpTemplate(otp) });

    res.json({ success: true, message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- FORGOT PASSWORD ----------
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpireAt = Date.now() + 5 * 60 * 1000;
    user.otpType = "RESET_PASSWORD";
    await user.save();

    await sendEmail({ to: email, subject: "Reset Password OTP", html: `<h1>${otp}</h1>` });

    res.json({ success: true, message: "OTP sent for password reset" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------- VERIFY RESET PASSWORD OTP ----------
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email, otpType: "RESET_PASSWORD" });
    if (!user) return res.status(404).json({ success: false, message: "User not found or OTP not sent" });

    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    return res.json({
      success: true,
      message: "OTP verified successfully. You can now reset your password."
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to verify OTP" });
  }
};


// ---------- RESET PASSWORD ----------

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email, otpType: "RESET_PASSWORD" });

    // Do NOT reveal whether user exists
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (!user.otpExpireAt || user.otpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }


    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Clear OTP fields safely
    user.otpHash = null;
    user.otpExpireAt = null;
    user.otpType = null;

    await user.save();

    res.json({ success: true, message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

