/**
 * Environment Configuration
 * Centralized configuration management for the application
 * Loads environment variables from .env file if available
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Application Configuration Object
 * @typedef {Object} Config
 * @property {number} port - Server port
 * @property {string} nodeEnv - Node environment (development, production)
 * @property {string} frontendUrl - Frontend URL for CORS
 * @property {string} logLevel - Logging level
 * @property {number} maxRooms - Maximum number of rooms
 * @property {number} maxUsersPerRoom - Maximum users per room
 * @property {number} messageHistoryLimit - Message history limit per room
 */

const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  logLevel: process.env.LOG_LEVEL || 'info',
  maxRooms: parseInt(process.env.MAX_ROOMS || '1000', 10),
  maxUsersPerRoom: parseInt(process.env.MAX_USERS_PER_ROOM || '100', 10),
  messageHistoryLimit: parseInt(process.env.MESSAGE_HISTORY_LIMIT || '100', 10),
};

/**
 * Validates the configuration
 * @throws {Error} If required configuration is missing
 */
const validateConfig = () => {
  const required = ['port', 'nodeEnv'];
  required.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Missing required configuration: ${key}`);
    }
  });
};

// Validate on module load
validateConfig();

export default config;
