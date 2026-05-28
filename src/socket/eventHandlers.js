/**
 * Socket.io Event Handlers
 * Manages all real-time communication events
 */

import { Room } from '../models/Room.js';
import { Message, SystemMessage } from '../models/Message.js';
import { sanitizeInput, generateInviteCode } from '../utils/roomIdGenerator.js';

/**
 * Room storage
 * In production, this should be replaced with a database
 * Key: roomId, Value: Room instance
 */
const rooms = new Map();

/**
 * User-to-Room mapping
 * In production, use a database
 * Key: userId, Value: { roomId, socketId, username }
 */
const userSessions = new Map();

/**
 * Socket.io event handler initialization
 * @param {Socket} socket - Socket.io socket instance
 * @param {Object} io - Socket.io instance
 */
export const initializeSocketEvents = (socket, io) => {
  /**
   * USER JOINED EVENT
   * Handles when a user connects
   */
  socket.on('user:join', (data) => {
    try {
      const { roomId, userId, username } = data;

      if (!roomId || !userId || !username) {
        socket.emit('error', { message: 'Invalid join data' });
        return;
      }

      // Get or create room
      let room = rooms.get(roomId);
      if (!room) {
        room = new Room(roomId, userId, 'Private Room');
        rooms.set(roomId, room);
      }

      // Check room capacity
      if (room.getUserCount() >= room.settings.maxUsers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // Add user to room
      const added = room.addUser(userId);
      if (!added) {
        socket.emit('error', { message: 'Failed to join room' });
        return;
      }

      // Store user session
      userSessions.set(userId, {
        roomId,
        socketId: socket.id,
        username: sanitizeInput(username),
        joinedAt: new Date(),
      });

      // Join Socket.io room
      socket.join(roomId);

      // Send join confirmation
      socket.emit('room:joined', {
        roomId,
        userId,
        username,
        users: room.getUsers(),
        userCount: room.getUserCount(),
        messageHistory: room.getMessageHistory(),
      });

      // Notify others in the room
      io.to(roomId).emit('user:joined', {
        userId,
        username,
        userCount: room.getUserCount(),
        users: room.getUsers(),
      });

      // Log event
      console.log(`[${roomId}] User ${userId} (${username}) joined`);
    } catch (error) {
      console.error('Error in user:join:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  /**
   * MESSAGE EVENT
   * Handles incoming messages
   */
  socket.on('message:send', (data) => {
    try {
      const { roomId, userId, content } = data;

      if (!roomId || !userId || !content) {
        socket.emit('error', { message: 'Invalid message data' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      if (!room.hasUser(userId)) {
        socket.emit('error', { message: 'User not in room' });
        return;
      }

      // Add message to room
      const sanitizedContent = sanitizeInput(content);
      const message = room.addMessage(userId, sanitizedContent);

      // Get user session for username
      const userSession = userSessions.get(userId);
      const username = userSession?.username || userId;

      // Broadcast message to room
      io.to(roomId).emit('message:received', {
        ...message.toJSON(),
        username,
      });

      console.log(`[${roomId}] Message from ${userId}: ${sanitizedContent.substring(0, 50)}...`);
    } catch (error) {
      console.error('Error in message:send:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * TYPING INDICATOR EVENT
   * Handles typing notifications
   */
  socket.on('typing:start', (data) => {
    try {
      const { roomId, userId } = data;

      if (!roomId || !userId) {
        return;
      }

      const room = rooms.get(roomId);
      if (!room || !room.hasUser(userId)) {
        return;
      }

      const userSession = userSessions.get(userId);
      const username = userSession?.username || userId;

      // Broadcast typing indicator to others (not the sender)
      socket.to(roomId).emit('typing:indicator', {
        userId,
        username,
        isTyping: true,
      });
    } catch (error) {
      console.error('Error in typing:start:', error);
    }
  });

  /**
   * TYPING STOP EVENT
   * Handles when user stops typing
   */
  socket.on('typing:stop', (data) => {
    try {
      const { roomId, userId } = data;

      if (!roomId || !userId) {
        return;
      }

      const room = rooms.get(roomId);
      if (!room || !room.hasUser(userId)) {
        return;
      }

      socket.to(roomId).emit('typing:indicator', {
        userId,
        isTyping: false,
      });
    } catch (error) {
      console.error('Error in typing:stop:', error);
    }
  });

  /**
   * USER DISCONNECT EVENT
   * Handles when a user disconnects
   */
  socket.on('disconnect', () => {
    try {
      // Find user by socket ID
      let disconnectedUser = null;
      for (const [userId, session] of userSessions.entries()) {
        if (session.socketId === socket.id) {
          disconnectedUser = { userId, ...session };
          break;
        }
      }

      if (disconnectedUser) {
        const { roomId, userId, username } = disconnectedUser;
        const room = rooms.get(roomId);

        if (room) {
          // Remove user from room
          room.removeUser(userId);

          // Notify others
          io.to(roomId).emit('user:left', {
            userId,
            username,
            userCount: room.getUserCount(),
            users: room.getUsers(),
          });

          // Delete empty rooms after 1 hour
          if (room.getUserCount() === 0) {
            setTimeout(() => {
              if (rooms.get(roomId)?.getUserCount() === 0) {
                rooms.delete(roomId);
                console.log(`[${roomId}] Room deleted (empty)`);
              }
            }, 3600000); // 1 hour
          }

          console.log(`[${roomId}] User ${userId} (${username}) disconnected`);
        }

        // Clean up user session
        userSessions.delete(userId);
      }
    } catch (error) {
      console.error('Error in disconnect:', error);
    }
  });

  /**
   * REQUEST USERS EVENT
   * Get list of users in the room
   */
  socket.on('room:getUsers', (data) => {
    try {
      const { roomId } = data;

      if (!roomId) {
        socket.emit('error', { message: 'Room ID required' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const users = room.getUsers().map((userId) => {
        const session = userSessions.get(userId);
        return {
          userId,
          username: session?.username || userId,
          joinedAt: session?.joinedAt,
        };
      });

      socket.emit('room:users', {
        roomId,
        users,
        userCount: room.getUserCount(),
      });
    } catch (error) {
      console.error('Error in room:getUsers:', error);
      socket.emit('error', { message: 'Failed to get users' });
    }
  });

  /**
   * REQUEST MESSAGE HISTORY EVENT
   * Get message history for a room
   */
  socket.on('room:getHistory', (data) => {
    try {
      const { roomId, limit } = data;

      if (!roomId) {
        socket.emit('error', { message: 'Room ID required' });
        return;
      }

      const room = rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      const history = room.getMessageHistory(limit || 50);
      socket.emit('room:history', {
        roomId,
        messages: history.map((msg) => ({
          ...msg.toJSON(),
          username: userSessions.get(msg.userId)?.username || msg.userId,
        })),
      });
    } catch (error) {
      console.error('Error in room:getHistory:', error);
      socket.emit('error', { message: 'Failed to get message history' });
    }
  });

  /**
   * PING EVENT
   * Keep-alive / heartbeat
   */
  socket.on('ping', () => {
    socket.emit('pong');
  });
};

/**
 * Get all rooms (for monitoring/admin)
 * @returns {Object[]} Array of room data
 */
export const getAllRooms = () => {
  return Array.from(rooms.values()).map((room) => room.toJSON());
};

/**
 * Get room by ID
 * @param {string} roomId - Room ID
 * @returns {Room|null} Room instance or null
 */
export const getRoom = (roomId) => {
  return rooms.get(roomId);
};

/**
 * Create a new room
 * @param {string} roomId - Room ID
 * @param {string} creatorId - Creator user ID
 * @param {string} name - Room name
 * @returns {Room} New room instance
 */
export const createRoom = (roomId, creatorId, name = 'Private Room') => {
  const room = new Room(roomId, creatorId, name);
  rooms.set(roomId, room);
  return room;
};

/**
 * Delete a room
 * @param {string} roomId - Room ID
 * @returns {boolean} True if deleted
 */
export const deleteRoom = (roomId) => {
  return rooms.delete(roomId);
};

/**
 * Get user session information
 * @param {string} userId - User ID
 * @returns {Object|null} User session or null
 */
export const getUserSession = (userId) => {
  return userSessions.get(userId) || null;
};

/**
 * Get all active rooms and users count
 * @returns {Object} Server statistics
 */
export const getServerStats = () => {
  let totalUsers = 0;
  let totalMessages = 0;

  rooms.forEach((room) => {
    totalUsers += room.getUserCount();
    totalMessages += room.messages.length;
  });

  return {
    roomCount: rooms.size,
    totalUsers,
    totalMessages,
    activeSessions: userSessions.size,
  };
};
