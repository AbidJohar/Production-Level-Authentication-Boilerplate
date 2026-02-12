import { Router } from 'express';
import { register, login, logout, verifyEmail, resendOtp, forgotPassword, resetPassword } from '../controllers/auth.controller.js';
import {validate, authSchemas} from '../validators/auth.validator.js';
import {authLimiter } from '../middlewares/rateLimit.js';


const router = Router();


// These endpoints cost you money/resources or create DB entries
router.post('/register', authLimiter, validate(authSchemas.register), register);
router.post('/forget-password', authLimiter, forgotPassword);
router.post('/resend-otp', authLimiter, resendOtp);

// Prevents brute-forcing passwords or OTP codes
router.post('/login', authLimiter, validate(authSchemas.login), login);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/reset-password', authLimiter, resetPassword);

router.get('/logout', logout);


export default router;