/**
 * API Routes
 * Express routes for REST API endpoints
 */

import express from 'express';
import {
  generateRoomId,
  generateInviteCode,
  generateRoomUrl,
  generateInviteLink,
} from '../utils/roomIdGenerator.js';
import {
  createRoom,
  getRoom,
  getAllRooms,
  getServerStats,
} from '../socket/eventHandlers.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns server status
 */
router.get('/health', asyncHandler(async (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
}));

/**
 * Create New Room
 * POST /api/rooms/create
 * Creates a new private room with unique ID
 */
router.post('/rooms/create', asyncHandler(async (req, res) => {
  const { creatorId, roomName } = req.body;

  if (!creatorId) {
    return res.status(400).json({
      error: 'creatorId is required',
    });
  }

  try {
    const roomId = generateRoomId();
    const inviteCode = generateInviteCode();
    
    // Create room
    const room = createRoom(roomId, creatorId, roomName || 'Private Room');
    room.inviteCode = inviteCode;

    // Generate URLs
    const baseUrl = req.get('origin') || `http://localhost:${process.env.PORT || 3001}`;
    const roomUrl = generateRoomUrl(roomId, baseUrl);
    const inviteLink = generateInviteLink(inviteCode, baseUrl);

    res.status(201).json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        creatorId: room.creatorId,
        createdAt: room.createdAt,
        inviteCode,
        roomUrl,
        inviteLink,
      },
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      error: 'Failed to create room',
    });
  }
}));

/**
 * Get Room Details
 * GET /api/rooms/:roomId
 * Retrieves room information
 */
router.get('/rooms/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
      });
    }

    res.json({
      success: true,
      room: {
        ...room.toJSON(),
        messageCount: room.messages.length,
      },
    });
  } catch (error) {
    console.error('Error getting room:', error);
    res.status(500).json({
      error: 'Failed to get room',
    });
  }
}));

/**
 * Get All Rooms (Admin)
 * GET /api/rooms
 * Returns list of all rooms (requires admin token in production)
 */
router.get('/rooms', asyncHandler(async (req, res) => {
  try {
    const rooms = getAllRooms();
    res.json({
      success: true,
      rooms,
      count: rooms.length,
    });
  } catch (error) {
    console.error('Error getting rooms:', error);
    res.status(500).json({
      error: 'Failed to get rooms',
    });
  }
}));

/**
 * Generate Invite Link
 * POST /api/rooms/:roomId/invite
 * Generates a new invite link for a room
 */
router.post('/rooms/:roomId/invite', asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({
        error: 'Room not found',
      });
    }

    // Generate new invite code
    const inviteCode = generateInviteCode();
    room.inviteCode = inviteCode;

    const baseUrl = req.get('origin') || `http://localhost:${process.env.PORT || 3001}`;
    const inviteLink = generateInviteLink(inviteCode, baseUrl);

    res.json({
      success: true,
      inviteCode,
      inviteLink,
    });
  } catch (error) {
    console.error('Error generating invite:', error);
    res.status(500).json({
      error: 'Failed to generate invite',
    });
  }
}));

/**
 * Server Statistics
 * GET /api/stats
 * Returns server statistics
 */
router.get('/stats', asyncHandler(async (req, res) => {
  try {
    const stats = getServerStats();
    res.json({
      success: true,
      ...stats,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
    });
  }
}));

/**
 * Validate Room ID
 * GET /api/validate/room/:roomId
 * Checks if a room exists
 */
router.get('/validate/room/:roomId', asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  try {
    const room = getRoom(roomId);
    
    res.json({
      success: true,
      exists: !!room,
      roomId,
    });
  } catch (error) {
    console.error('Error validating room:', error);
    res.status(500).json({
      error: 'Failed to validate room',
    });
  }
}));

/**
 * API Documentation
 * GET /api/docs
 * Returns API documentation
 */
router.get('/docs', asyncHandler(async (req, res) => {
  const baseUrl = req.get('origin') || `http://localhost:${process.env.PORT || 3001}`;
  
  res.json({
    title: 'Private Messaging API',
    version: '1.0.0',
    baseUrl: baseUrl + '/api',
    endpoints: {
      'POST /rooms/create': {
        description: 'Create a new private room',
        body: { creatorId: 'string', roomName: 'string (optional)' },
        returns: { room: 'object with roomId, inviteCode, roomUrl, inviteLink' },
      },
      'GET /rooms/:roomId': {
        description: 'Get room details',
        params: { roomId: 'string' },
        returns: { room: 'object' },
      },
      'GET /rooms': {
        description: 'Get all rooms',
        returns: { rooms: 'array' },
      },
      'POST /rooms/:roomId/invite': {
        description: 'Generate new invite link',
        params: { roomId: 'string' },
        returns: { inviteCode: 'string', inviteLink: 'string' },
      },
      'GET /stats': {
        description: 'Get server statistics',
        returns: { roomCount: 'number', totalUsers: 'number', totalMessages: 'number' },
      },
      'GET /validate/room/:roomId': {
        description: 'Validate if room exists',
        params: { roomId: 'string' },
        returns: { exists: 'boolean' },
      },
      'GET /health': {
        description: 'Health check',
        returns: { status: 'string' },
      },
    },
    socketEvents: {
      'user:join': {
        description: 'Join a room',
        data: { roomId: 'string', userId: 'string', username: 'string' },
      },
      'message:send': {
        description: 'Send a message',
        data: { roomId: 'string', userId: 'string', content: 'string' },
      },
      'typing:start': {
        description: 'Emit typing indicator',
        data: { roomId: 'string', userId: 'string' },
      },
      'typing:stop': {
        description: 'Stop typing indicator',
        data: { roomId: 'string', userId: 'string' },
      },
      'room:getUsers': {
        description: 'Get list of users in room',
        data: { roomId: 'string' },
      },
      'room:getHistory': {
        description: 'Get message history',
        data: { roomId: 'string', limit: 'number (optional)' },
      },
    },
  });
}));

export default router;
