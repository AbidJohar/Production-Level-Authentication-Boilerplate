import { logger } from "../utility/logger.js";
import {
  createTokenPair,
  registerService,
  loginService,
  refreshTokenService,
  logoutService,
  verifyEmailService,
  resendOtpService,
  forgotPasswordService,
  verifyResetOtpService,
  resetPasswordService,
  googleLoginService
} from "../service/auth.service.js";

// ─────────────────────────────────────────────────────────────
//  Cookie Helpers  (pure HTTP concern — belongs in controller)
// ─────────────────────────────────────────────────────────────

const attachAccessCookie = (res, token) =>
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 5 * 60 * 1000, // 5 minutes
    path: "/",
  });

const attachRefreshCookie = (res, token) =>
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 1000 * 60 * 30, // 30 minutes
    path: "/api/v1/auth/refresh",
  });

/**
 * Calls the service to generate + persist tokens,
 * then attaches both as HttpOnly cookies.
 */
const issueTokenCookies = async (res, user) => {
  const { accessToken, refreshToken } = await createTokenPair(user);
  attachAccessCookie(res, accessToken);
  attachRefreshCookie(res, refreshToken);
};

// ─────────────────────────────────────────────────────────────
//  REGISTER
// ─────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  logger.info("hit the register controller...");
  try {
    const result = await registerService(req.body);
     
    // If the service returned a user document, issue tokens
    if (result.user) await issueTokenCookies(res, result.user);

    return res.status(result.status).json(result.body);
  } catch (err) {
    logger.error("Register error:", err.message);
    return res.status(400).json({ success: false, message: err.message || "Failed to register." });
  }
};

// ─────────────────────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  logger.info("hit the login endpoint...");
  try {
    const result = await loginService(req.body);

    if (result.user) await issueTokenCookies(res, result.user);

    return res.status(result.status).json(result.body);
  } catch (err) {
    logger.error("Login error:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Failed to login." });
  }
};
// ─────────────────────────────────────────────────────────────
//  GOOGLE LOGIN
// ─────────────────────────────────────────────────────────────

export const googleLogin = async (req, res) => {
  logger.info("hit the google login endpoint...");
  try {
    const result = await googleLoginService(req.body);
    
    if(result.user) await issueTokenCookies(res, result.user);

    return res.status(result.status).json(result.body);
  } catch (err) {
    logger.error("Login error:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Failed to login." });
  }
};

// ─────────────────────────────────────────────────────────────
//  REFRESH TOKEN
// ─────────────────────────────────────────────────────────────

export const refresh = async (req, res) => {
  logger.info("hit the refresh endpoint...");
  try {
    const result = await refreshTokenService(req.cookies?.refreshToken);

    if (result.user) await issueTokenCookies(res, result.user);

    return res.status(result.status).json(result.body);
  } catch (err) {
    logger.error("Refresh error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to refresh token." });
  }
};

// ─────────────────────────────────────────────────────────────
//  LOGOUT
// ─────────────────────────────────────────────────────────────

export const logout = async (req, res) => {
  logger.info("hit the logout endpoint...");
  try {
    await logoutService(req.cookies?.refreshToken);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    };

    res.clearCookie("accessToken", { ...cookieOptions, path: "/" });
    res.clearCookie("refreshToken", { ...cookieOptions, path: "/api/v1/auth/refresh" });

    return res.status(200).json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    logger.error("Logout error:", err.message);
    return res.status(500).json({ success: false, message: err.message || "Failed to logout." });
  }
};

// ─────────────────────────────────────────────────────────────
//  VERIFY EMAIL OTP
// ─────────────────────────────────────────────────────────────

export const verifyEmail = async (req, res) => {
  try {
    const result = await verifyEmailService(req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  RESEND OTP
// ─────────────────────────────────────────────────────────────

export const resendOtp = async (req, res) => {
  logger.info("resend OTP is hitting..");
  try {
    const result = await resendOtpService(req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  FORGOT PASSWORD
// ─────────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const result = await forgotPasswordService(req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
//  VERIFY RESET OTP
// ─────────────────────────────────────────────────────────────

export const verifyResetOtp = async (req, res) => {
  try {
    const result = await verifyResetOtpService(req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to verify OTP" });
  }
};

// ─────────────────────────────────────────────────────────────
//  RESET PASSWORD
// ─────────────────────────────────────────────────────────────

export const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.body);
    return res.status(result.status).json(result.body);
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};