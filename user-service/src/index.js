//express server is used to handle the requests and responses
const express = require('express');
//cookie-parser is used to parse the cookies from the request
const cookieParser = require('cookie-parser');

//helmet is used to secure the app by setting various HTTP headers
const helmet = require('helmet');

const corsMiddleware = require('./middlewares/cors.middleware');
const requestLogger = require('./middlewares/req.middleware');
const logger = require('./config/logger');

//dotenv is used to load environment variables from a .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });


// we create an instance of express
const app = express();

// we use helmet to secure the app by setting various HTTP headers , its a middleware that helps to protect the app from some well-known web vulnerabilities by setting HTTP headers appropriately
app.use(helmet());

// we use cors to handle cross-origin requests
// app.use(cors());

app.use(corsMiddleware);
app.use(requestLogger);

// we use cookie-parser to parse the cookies from the request
app.use(cookieParser());


// we use express.json() to parse the JSON data from the request body
app.use(express.json());

app.get('/', (req, res) => {
    logger.info('Received request for /');
    res.send('User Service is running');
});

app.use('/auth', require('./routes/auth.route'));

const PORT = process.env.PORT || 3000;

logger.info(`User Service is running in ${process.env.NODE_ENV} mode on port ${PORT}`);

app.listen(PORT, () => {
    logger.info(`User Service is listening on port ${PORT}`);
});



