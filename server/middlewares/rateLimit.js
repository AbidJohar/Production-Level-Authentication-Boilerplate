import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../utility/redisClient.js'

 
//-----------------( Strict Limiter for OTP / Auth (The "Security" Guard))--------------
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 OTP requests per 15 mins
    message: {
        success: false,
        message: 'Too many requests, please try again after 15 minutes.'
    },
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:auth:',
    }),
});

//-----------------( General Limiter for API (The "Traffic" Guard))--------------
export const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 100, // 100 requests per minute
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.sendCommand(args),
        prefix: 'rl:gen:',
    }),
});