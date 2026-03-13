import { Router } from 'express';
import { register, login, logout,refresh, verifyEmail, resendOtp, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import {validate, authSchemas} from '../validators/auth.validator.js';
import {authLimiter } from '../middlewares/rateLimit.js';
import authMiddleware from '../middlewares/auth.middleware.js';


const router = Router();


// These endpoints cost you money/resources or create DB entries
router.post('/register', validate(authSchemas.register), register);
router.post('/forget-password', authLimiter, forgotPassword);
router.post('/resend-otp', authLimiter, resendOtp);

// Prevents brute-forcing passwords or OTP codes
router.post('/login', authLimiter, validate(authSchemas.login), login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/reset-password', authLimiter, resetPassword);

// Token lifecycle
// NOTE: path MUST match the cookie path set in attachRefreshCookie ("/auth/refresh")
router.post("/refresh", authLimiter, refresh);  
router.get("/logout", logout);


export default router;