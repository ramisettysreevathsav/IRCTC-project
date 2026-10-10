 const cors = require('cors');

 const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:4000,http://localhost:4001')
     .split(',')
     .map(origin => origin.trim().replace(/^['"]|['"]$/g, ''))
     .filter(Boolean);

 const corsOptions = {
     origin: allowedOrigins,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
     ],
     credentials: true,
 };

 module.exports = cors(corsOptions);