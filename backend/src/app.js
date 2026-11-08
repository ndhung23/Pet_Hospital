const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiters');
const AppError = require('./utils/AppError');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration supporting credentials (cookies)
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

// Body and Cookie parsers
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Global API rate limiter
app.use('/api', apiLimiter);

// Main API routes
app.use('/api', routes);

// 404 handler for undefined endpoints
app.use((req, res, next) => {
  next(new AppError(`Cannot find endpoint ${req.originalUrl} on this server!`, 404));
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
