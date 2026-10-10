// Express server: handles HTTP requests/responses
require('dotenv').config({
  path: require('path').resolve(__dirname, '.env'),
});

const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');


// Middlewares
const corsMiddleware = require('./middlewares/cors.middleware');
const requestLogger = require('./middlewares/req.middleware');

// Config / infra
const logger = require('./config/logger');
const redisClient = require('./config/redis');
const prisma = require('./config/prisma');

// Create Express app
const app = express();

// --- Global middleware ---
app.use(helmet());
app.use(corsMiddleware);
app.use(requestLogger);
app.use(cookieParser());
app.use(express.json());

// --- Health / root route ---
app.get('/', (req, res) => {
  logger.info('Received request for /');
  res.send('User Service is running');
});

// --- Routes (mounted after Redis is ready) ---
function registerRoutes() {
  // Auth routes require Redis (for OTP), so we mount them after connect
  const authRoutes = require('./routes/auth.route');
  app.use('/auth', authRoutes);
}

// --- Start server ---
async function startServer() {
  try {
    // 1. Connect to Redis first (auth routes depend on it)
    await redisClient.connect();

    // connect to PostgreSQL (Prisma) - optional, but good to check DB connection at startup
    
    await prisma.$connect();
    logger.info('Connected to PostgreSQL database');

    // 2. Register routes that depend on Redis
    registerRoutes();

    // 3. Start HTTP server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(
        `User Service running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error(`Failed to start User Service: ${error.message}`);
    process.exit(1);
  }
}

startServer();
