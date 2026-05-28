/**
 * Main Server File
 * Initializes and starts the Node.js/Express/Socket.io server
 */

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import config from './config/environment.js';
import { applyCors, socketCorsOptions } from './middleware/corsConfig.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { initializeSocketEvents, getServerStats } from './socket/eventHandlers.js';
import apiRoutes from './routes/api.js';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Create Express Application
 */
const app = express();

/**
 * Create HTTP Server
 */
const httpServer = createServer(app);

/**
 * Create Socket.io Instance
 */
const io = new Server(httpServer, socketCorsOptions);

/**
 * ==========================================
 * MIDDLEWARE SETUP
 * ==========================================
 */

// Apply CORS
applyCors(app);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(dirname(__dirname) + '/public'));

/**
 * ==========================================
 * ROUTE SETUP
 * ==========================================
 */

/**
 * Root Route
 * GET /
 */
app.get('/', (req, res) => {
  res.json({
    name: 'Private Messaging Backend',
    version: '1.0.0',
    description: 'Real-time private messaging with Socket.io',
    status: 'running',
    documentation: '/api/docs',
  });
});

/**
 * API Routes
 * All API endpoints are prefixed with /api
 */
app.use('/api', apiRoutes);

/**
 * ==========================================
 * SOCKET.IO SETUP
 * ==========================================
 */

/**
 * Socket.io Connection Handler
 * Triggered when a client connects via WebSocket
 */
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Initialize all socket events for this client
  initializeSocketEvents(socket, io);

  /**
   * Socket Disconnect Handler
   * (Also handled in eventHandlers.js)
   */
  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });

  /**
   * Socket Error Handler
   */
  socket.on('error', (error) => {
    console.error(`[Socket] Error on ${socket.id}:`, error);
  });
});

/**
 * ==========================================
 * ERROR HANDLING
 * ==========================================
 */

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

/**
 * ==========================================
 * SERVER START
 * ==========================================
 */

/**
 * Start the Server
 */
const PORT = config.port;

const server = httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🚀 Private Messaging Server Started                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

📊 Server Information:
  - Port: ${PORT}
  - Environment: ${config.nodeEnv}
  - Frontend URL: ${config.frontendUrl}

🔗 Endpoints:
  - HTTP Server: http://localhost:${PORT}
  - WebSocket: ws://localhost:${PORT}
  - API Documentation: http://localhost:${PORT}/api/docs
  - Health Check: http://localhost:${PORT}/api/health

📝 Quick Start:
  1. Create a room: POST /api/rooms/create
  2. Join via WebSocket with: user:join event
  3. Send messages with: message:send event
  4. See full docs at: /api/docs

🔧 Features:
  ✓ Real-time messaging
  ✓ Unique room IDs
  ✓ Invite links
  ✓ Typing indicators
  ✓ Online users tracking
  ✓ Message history
  ✓ Graceful disconnects

═══════════════════════════════════════════════════════════════
  `);
});

/**
 * Graceful Shutdown
 * Handle process termination signals
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

/**
 * Unhandled Promise Rejection Handler
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

/**
 * Unhandled Exception Handler
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

/**
 * Export for testing
 */
export { app, httpServer, io };
