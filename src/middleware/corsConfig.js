/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing for the Express app
 */

import cors from 'cors';
import config from '../config/environment.js';

/**
 * Whitelist of allowed origins
 * In production, add your frontend domain here
 * @type {string[]}
 */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  config.frontendUrl,
];

// Add production URLs if in production
if (config.nodeEnv === 'production') {
  // Add your production domains here
  // allowedOrigins.push('https://yourdomain.com');
  // allowedOrigins.push('https://www.yourdomain.com');
}

/**
 * CORS options configuration
 * @type {Object}
 */
const corsOptions = {
  // Callback to check if origin is allowed
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // Cache preflight for 24 hours
};

/**
 * Socket.io CORS options
 * @type {Object}
 */
export const socketCorsOptions = {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
};

/**
 * Apply CORS middleware to Express app
 * @param {Express.Application} app - Express application
 */
export const applyCors = (app) => {
  app.use(cors(corsOptions));
};

export default corsOptions;
