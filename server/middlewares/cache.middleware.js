import redisClient from '../utility/redisClient.js'; // Use your existing client
import { logger } from '../utility/logger.js';

export const cacheProfile = async (req, res, next) => {
    try {
        const { userId } = req.user; // From authMiddleware
        const cacheKey = `user:profile:${userId}`;

        const cachedData = await redisClient.get(cacheKey);

        if (cachedData) {
            logger.info(`Cache Hit: ${cacheKey}`);
            return res.status(200).json(JSON.parse(cachedData));
        }

        // Intercept the final response to save it to Redis
        res.sendResponse = res.json;
        res.json = (data) => {
            // Save to Redis for 1 hour (3600 seconds)
            redisClient.setEx(cacheKey, 3600, JSON.stringify(data))
                .catch(err => logger.error('Redis Save Error', err));
            
            res.sendResponse(data);
        };

        logger.info(`Cache Miss: ${cacheKey}`);
        next();
    } catch (error) {
        logger.error('Cache Middleware Error', error);
        next(); // Fallback to DB if Redis fails
    }
};