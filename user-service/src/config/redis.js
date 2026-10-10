const Redis = require('ioredis');

const logger = require('./logger');

class RedisClient {
    constructor() {
        this.redis = null;
    }

    async connect() {
        try {
            this.redis = new Redis(process.env.REDIS_URL);
            this.redis.on('connect', () => {
                logger.info('Connected to Redis');
            });
            this.redis.on('error', (err) => {
                logger.error(`Redis error: ${err}`);
            });
        } catch (error) {
            logger.error(`Failed to connect to Redis: ${error}`);
        }
    }

    getClient() {
        if (!this.redis) {
            throw new Error('Redis client is not connected. Call connect() first.');
        }
        return this.redis;
    }
}

module.exports = new RedisClient();