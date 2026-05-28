/**
 * Utility Functions for Room ID Generation and URL handling
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique room ID
 * @returns {string} Unique room identifier
 */
export const generateRoomId = () => {
  return `room_${uuidv4()}`;
};

/**
 * Generates a short, shareable invite code
 * Used for creating invite links
 * @returns {string} Invite code (8 characters)
 */
export const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Validates if a room ID is in valid format
 * @param {string} roomId - Room ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidRoomId = (roomId) => {
  return /^room_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(roomId);
};

/**
 * Validates if an invite code is in valid format
 * @param {string} code - Invite code to validate
 * @returns {boolean} True if valid format
 */
export const isValidInviteCode = (code) => {
  return /^[A-Z0-9]{8}$/.test(code);
};

/**
 * Generates a shareable room URL
 * @param {string} roomId - Room ID
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} Complete room URL
 */
export const generateRoomUrl = (roomId, baseUrl = 'http://localhost:3000') => {
  return `${baseUrl}/room/${roomId}`;
};

/**
 * Generates a shareable invite link
 * @param {string} inviteCode - Invite code
 * @param {string} baseUrl - Base URL of the application
 * @returns {string} Complete invite link
 */
export const generateInviteLink = (inviteCode, baseUrl = 'http://localhost:3000') => {
  return `${baseUrl}/invite/${inviteCode}`;
};

/**
 * Extracts room ID from URL
 * @param {string} url - URL string
 * @returns {string|null} Room ID or null if not found
 */
export const extractRoomIdFromUrl = (url) => {
  const match = url.match(/\/room\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

/**
 * Extracts invite code from URL
 * @param {string} url - URL string
 * @returns {string|null} Invite code or null if not found
 */
export const extractInviteCodeFromUrl = (url) => {
  const match = url.match(/\/invite\/([A-Z0-9]{8})/);
  return match ? match[1] : null;
};

/**
 * Sanitizes user input for security
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return '';
  }
  return input
    .trim()
    .substring(0, 5000) // Limit message length
    .replace(/[<>]/g, ''); // Basic HTML tag removal
};

/**
 * Generates a unique user ID
 * Used when user doesn't have authentication
 * @returns {string} Unique user identifier
 */
export const generateUserId = () => {
  return `user_${uuidv4().substring(0, 8)}`;
};

/**
 * Validates user ID format
 * @param {string} userId - User ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidUserId = (userId) => {
  return /^user_[a-z0-9]{8}$/.test(userId);
};
