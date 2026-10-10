const Redis = require('ioredis');

const logger = require('./logger');

class RedisClient {
    constructor() {
        this.redis = null;
        this.connectPromise = null;
    }

    async connect() {
        if (!process.env.REDIS_URL) {
            throw new Error('REDIS_URL is not configured');
        }

        if (this.redis?.status === 'ready') {
            return this.redis;
        }

        if (this.connectPromise) {
            return this.connectPromise;
        }

        this.redis = new Redis(process.env.REDIS_URL, {
            lazyConnect: true,
            retryStrategy: (attempt) => attempt >= 3 ? null : Math.min(attempt * 200, 1000),
        });
        this.redis.on('connect', () => logger.info('Connected to Redis'));
        this.redis.on('error', (error) => logger.error(`Redis error: ${error.message}`));

        this.connectPromise = this.redis.connect()
            .then(() => this.redis)
            .catch((error) => {
                logger.error(`Failed to connect to Redis: ${error.message}`);
                this.redis.disconnect();
                this.redis = null;
                this.connectPromise = null;
                throw error;
            });

        return this.connectPromise;
    }

    getClient() {
        if (!this.redis || this.redis.status !== 'ready') {
            throw new Error('Redis client is not connected. Call and await connect() first.');
        }
        return this.redis;
    }
}

module.exports = new RedisClient();