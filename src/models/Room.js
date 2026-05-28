/**
 * Room Model
 * Manages the structure and data of a chat room
 */

/**
 * Room Class
 * Represents a private chat room
 */
export class Room {
  /**
   * Creates a new Room instance
   * @param {string} id - Unique room identifier
   * @param {string} creatorId - User ID of the room creator
   * @param {string} name - Room name/title
   */
  constructor(id, creatorId, name = 'Private Room') {
    this.id = id;
    this.creatorId = creatorId;
    this.name = name;
    this.createdAt = new Date();
    this.users = new Set(); // Store connected user IDs
    this.messages = []; // Message history
    this.inviteCode = null; // Generated invite code
    this.settings = {
      isPublic: false,
      maxUsers: 100,
      allowHistory: true,
    };
  }

  /**
   * Adds a user to the room
   * @param {string} userId - User ID to add
   * @returns {boolean} True if user was added, false if already present
   */
  addUser(userId) {
    if (this.users.size >= this.settings.maxUsers) {
      return false;
    }
    this.users.add(userId);
    return true;
  }

  /**
   * Removes a user from the room
   * @param {string} userId - User ID to remove
   * @returns {boolean} True if user was removed, false if not found
   */
  removeUser(userId) {
    return this.users.delete(userId);
  }

  /**
   * Gets list of users in the room
   * @returns {string[]} Array of user IDs
   */
  getUsers() {
    return Array.from(this.users);
  }

  /**
   * Checks if a user is in the room
   * @param {string} userId - User ID to check
   * @returns {boolean} True if user is in room
   */
  hasUser(userId) {
    return this.users.has(userId);
  }

  /**
   * Gets the number of users in the room
   * @returns {number} User count
   */
  getUserCount() {
    return this.users.size;
  }

  /**
   * Adds a message to the room history
   * @param {string} userId - User ID of sender
   * @param {string} content - Message content
   * @returns {Object} Message object
   */
  addMessage(userId, content) {
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      content,
      timestamp: new Date(),
    };

    if (this.settings.allowHistory) {
      this.messages.push(message);
      // Keep only the last N messages
      if (this.messages.length > 100) {
        this.messages = this.messages.slice(-100);
      }
    }

    return message;
  }

  /**
   * Gets message history
   * @param {number} limit - Number of messages to retrieve
   * @returns {Object[]} Array of message objects
   */
  getMessageHistory(limit = 50) {
    return this.messages.slice(-limit);
  }

  /**
   * Converts room to JSON representation
   * @returns {Object} Room data
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      creatorId: this.creatorId,
      createdAt: this.createdAt,
      userCount: this.getUserCount(),
      users: this.getUsers(),
      settings: this.settings,
    };
  }
}
