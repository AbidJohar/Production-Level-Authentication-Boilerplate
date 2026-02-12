import { createClient } from 'redis';
import { logger } from './logger.js';

const redisClient = createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
});

redisClient.on('connect', () => logger.info('Redis: Connecting...'));
redisClient.on('ready', () => logger.info('Redis: Connected and Ready'));
redisClient.on('error', (err) => logger.error('Redis: Connection Error', err));

// Initial connection
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        logger.error('Redis: Initial Connection Failed', err);
    }
})();

export default redisClient;