/**
 * Message Model
 * Represents a message structure for the messaging system
 */

/**
 * Message Class
 * Represents a single message in a room
 */
export class Message {
  /**
   * Creates a new Message instance
   * @param {string} id - Unique message identifier
   * @param {string} roomId - Room ID where message was sent
   * @param {string} userId - User ID of sender
   * @param {string} content - Message content
   * @param {string} type - Message type (text, system, typing_indicator)
   */
  constructor(id, roomId, userId, content, type = 'text') {
    this.id = id;
    this.roomId = roomId;
    this.userId = userId;
    this.content = content;
    this.type = type;
    this.timestamp = new Date();
    this.isEdited = false;
    this.editedAt = null;
  }

  /**
   * Edits the message content
   * @param {string} newContent - New content
   * @returns {Message} Returns self for chaining
   */
  edit(newContent) {
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    return this;
  }

  /**
   * Converts message to JSON representation
   * @returns {Object} Message data
   */
  toJSON() {
    return {
      id: this.id,
      roomId: this.roomId,
      userId: this.userId,
      content: this.content,
      type: this.type,
      timestamp: this.timestamp,
      isEdited: this.isEdited,
      editedAt: this.editedAt,
    };
  }
}

/**
 * System Message Factory
 * Creates special system messages for room events
 */
export class SystemMessage {
  /**
   * Creates a user join message
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID who joined
   * @returns {Message} System message
   */
  static userJoined(roomId, userId) {
    const message = new Message(
      `sysmsg_${Date.now()}_join`,
      roomId,
      'system',
      `${userId} joined the room`,
      'system'
    );
    return message;
  }

  /**
   * Creates a user left message
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID who left
   * @returns {Message} System message
   */
  static userLeft(roomId, userId) {
    const message = new Message(
      `sysmsg_${Date.now()}_leave`,
      roomId,
      'system',
      `${userId} left the room`,
      'system'
    );
    return message;
  }

  /**
   * Creates a room created message
   * @param {string} roomId - Room ID
   * @param {string} roomName - Room name
   * @returns {Message} System message
   */
  static roomCreated(roomId, roomName) {
    const message = new Message(
      `sysmsg_${Date.now()}_create`,
      roomId,
      'system',
      `Room "${roomName}" has been created`,
      'system'
    );
    return message;
  }
}
