const logger = require('../config/logger');

const reqMiddleware = (req, res, next) => {
    logger.info(`${req.method} ${req.url}`);
    next();
};

module.exports = reqMiddleware;