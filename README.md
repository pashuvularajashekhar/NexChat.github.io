# Private Messaging Backend

A production-ready real-time messaging backend built with **Node.js**, **Express.js**, and **Socket.io**. Perfect for building private chat applications with real-time communication, room management, and unique invite links.

## 🚀 Features

- **Real-time Messaging** - Instant message delivery using Socket.io WebSockets
- **Room Management** - Create, join, and manage private rooms with unique IDs
- **Invite System** - Generate shareable invite links with unique codes
- **User Presence** - Track online users and user join/leave events
- **Typing Indicators** - Real-time typing notifications
- **Message History** - Store and retrieve message history per room
- **Graceful Disconnects** - Proper cleanup when users disconnect
- **CORS Support** - Pre-configured for frontend integration
- **Production Ready** - Clean architecture, error handling, and scalability
- **Deployment Ready** - Compatible with Render, Railway, and other platforms

## 📋 Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **UUID** - Unique ID generation
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
.
├── src/
│   ├── config/
│   │   └── environment.js       # Environment configuration
│   ├── models/
│   │   ├── Room.js              # Room data model
│   │   └── Message.js           # Message data model
│   ├── routes/
│   │   └── api.js               # REST API routes
│   ├── socket/
│   │   └── eventHandlers.js     # Socket.io event handlers
│   ├── middleware/
│   │   ├── corsConfig.js        # CORS configuration
│   │   └── errorHandler.js      # Error handling middleware
│   ├── utils/
│   │   └── roomIdGenerator.js   # Utility functions
│   └── index.js                 # Main server file
├── public/
│   └── index.html               # Test client (included)
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore patterns
└── README.md                    # This file
```

## 🏃 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### 2. Installation

```bash
# Clone or download the project
cd devops-project

# Install dependencies
npm install
```

### 3. Configuration

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Default PORT is 3001, FRONTEND_URL is http://localhost:3000
```

### 4. Start Development Server

```bash
# Development mode (with auto-reload)
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:3001`

### 5. Test with Web Client

Open your browser and navigate to:
```
http://localhost:3001
```

A test client is available at the root endpoint for quick testing.

## 📡 API Endpoints

### REST API

All API endpoints are prefixed with `/api`

#### Health Check
```http
GET /api/health
```
Returns server status and uptime.

#### Create Room
```http
POST /api/rooms/create
Content-Type: application/json

{
  "creatorId": "user_123",
  "roomName": "Project Discussion"
}
```

Response:
```json
{
  "success": true,
  "room": {
    "id": "room_...",
    "name": "Project Discussion",
    "creatorId": "user_123",
    "inviteCode": "ABC12345",
    "roomUrl": "http://localhost:3000/room/room_...",
    "inviteLink": "http://localhost:3000/invite/ABC12345"
  }
}
```

#### Get Room Details
```http
GET /api/rooms/:roomId
```

#### Generate Invite Link
```http
POST /api/rooms/:roomId/invite
```

#### Get All Rooms (Admin)
```http
GET /api/rooms
```

#### Server Statistics
```http
GET /api/stats
```

#### Validate Room
```http
GET /api/validate/room/:roomId
```

#### API Documentation
```http
GET /api/docs
```

### WebSocket Events

#### Client → Server

**Join Room**
```javascript
socket.emit('user:join', {
  roomId: 'room_...',
  userId: 'user_123',
  username: 'John Doe'
});
```

**Send Message**
```javascript
socket.emit('message:send', {
  roomId: 'room_...',
  userId: 'user_123',
  content: 'Hello everyone!'
});
```

**Typing Start**
```javascript
socket.emit('typing:start', {
  roomId: 'room_...',
  userId: 'user_123'
});
```

**Typing Stop**
```javascript
socket.emit('typing:stop', {
  roomId: 'room_...',
  userId: 'user_123'
});
```

**Get Users in Room**
```javascript
socket.emit('room:getUsers', {
  roomId: 'room_...'
});
```

**Get Message History**
```javascript
socket.emit('room:getHistory', {
  roomId: 'room_...',
  limit: 50
});
```

#### Server → Client

**Room Joined**
```javascript
socket.on('room:joined', (data) => {
  console.log(data); // { roomId, userId, username, users, userCount, messageHistory }
});
```

**User Joined**
```javascript
socket.on('user:joined', (data) => {
  console.log(data); // { userId, username, userCount, users }
});
```

**User Left**
```javascript
socket.on('user:left', (data) => {
  console.log(data); // { userId, username, userCount, users }
});
```

**Message Received**
```javascript
socket.on('message:received', (message) => {
  console.log(message); // { id, roomId, userId, content, timestamp, username }
});
```

**Typing Indicator**
```javascript
socket.on('typing:indicator', (data) => {
  console.log(data); // { userId, username, isTyping }
});
```

**Error**
```javascript
socket.on('error', (data) => {
  console.error(data); // { message }
});
```

## 🔌 Socket.io Client Example

```javascript
// Initialize Socket.io client
const socket = io('http://localhost:3001');

// Join a room
socket.emit('user:join', {
  roomId: 'room_unique_id',
  userId: 'user_123',
  username: 'Alice'
});

// Listen for room joined confirmation
socket.on('room:joined', (data) => {
  console.log('Joined room:', data.roomId);
  console.log('Users in room:', data.users);
});

// Send a message
socket.emit('message:send', {
  roomId: 'room_unique_id',
  userId: 'user_123',
  content: 'Hello, World!'
});

// Receive messages
socket.on('message:received', (message) => {
  console.log(`${message.username}: ${message.content}`);
});

// Handle typing
socket.emit('typing:start', {
  roomId: 'room_unique_id',
  userId: 'user_123'
});

socket.on('typing:indicator', (data) => {
  console.log(`${data.username} is ${data.isTyping ? 'typing' : 'not typing'}`);
});
```

## 🌍 Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS configuration)
FRONTEND_URL=http://localhost:3000

# Application Settings
LOG_LEVEL=debug
MAX_ROOMS=1000
MAX_USERS_PER_ROOM=100
MESSAGE_HISTORY_LIMIT=100
```

### Variable Descriptions

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment (development/production) | development |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `LOG_LEVEL` | Logging level (debug/info/warn/error) | info |
| `MAX_ROOMS` | Maximum rooms allowed | 1000 |
| `MAX_USERS_PER_ROOM` | Max users per room | 100 |
| `MESSAGE_HISTORY_LIMIT` | Messages stored per room | 100 |

## 🚀 Deployment

### Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set environment variables in Render dashboard
5. Deploy!

### Railway

1. Push your code to GitHub
2. Create a new project on Railway
3. Add a service and connect GitHub repo
4. Set environment variables
5. Deploy!

### Environment Setup for Deployment

Update your `.env` for production:

```env
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
LOG_LEVEL=info
```

The PORT will be automatically set by Render/Railway if not specified.

## 🧪 Testing

### Using the Built-in Web Client

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3001`
3. Enter username and room ID
4. Open multiple tabs to test real-time features

### Using cURL

```bash
# Health check
curl http://localhost:3001/api/health

# Create a room
curl -X POST http://localhost:3001/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"creatorId":"user_123","roomName":"Test Room"}'

# Get API documentation
curl http://localhost:3001/api/docs
```

### Using JavaScript/Node.js

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected!');
  socket.emit('user:join', {
    roomId: 'room_test',
    userId: 'user_123',
    username: 'Tester'
  });
});
```

## 📊 Architecture

### Room Management

- Rooms are stored in-memory using a Map
- Each room has a unique ID generated using UUID
- Rooms are automatically deleted when empty after 1 hour
- In production, replace Map with a database (MongoDB, PostgreSQL, etc.)

### User Sessions

- User sessions tracked with Socket.io socket IDs
- Join/leave events broadcast to all room members
- Automatic cleanup on disconnect

### Message Flow

```
Client → Socket.emit() → Server → Room.addMessage() → Broadcast → All Clients
```

### Scalability Notes

For production with multiple server instances:

1. **Replace in-memory storage** with a database:
   - MongoDB for flexible schema
   - PostgreSQL for ACID compliance
   - Redis for caching

2. **Use Socket.io adapters** for clustering:
   - Redis adapter for distributed Socket.io
   - MongoDB adapter as alternative

3. **Implement session management**:
   - Store sessions in distributed cache
   - Enable cross-server communication

Example with Redis adapter:
```javascript
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

const pubClient = createClient();
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

io.adapter(createAdapter(pubClient, subClient));
```

## 🛡️ Security Considerations

### Implemented Features

- ✅ Input sanitization (XSS prevention)
- ✅ Message length limits (5000 chars)
- ✅ CORS configuration
- ✅ Error handling without stack traces in production

### Recommended for Production

- [ ] Authentication/Authorization (JWT tokens)
- [ ] Rate limiting (express-rate-limit)
- [ ] Input validation (joi, zod)
- [ ] HTTPS/TLS encryption
- [ ] Database encryption
- [ ] User/room permissions
- [ ] Audit logging
- [ ] DDoS protection

### Example Authentication Middleware

```javascript
import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License - feel free to use in your projects!

## 📚 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.io Documentation](https://socket.io/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## ❓ Troubleshooting

### Port Already in Use

```bash
# On macOS/Linux
lsof -i :3001
kill -9 <PID>

# On Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### CORS Errors

Check your `.env` FRONTEND_URL matches your client URL:
```env
FRONTEND_URL=http://localhost:3000
```

### Socket.io Connection Issues

- Ensure server is running
- Check browser console for errors
- Verify CORS settings
- Check firewall/network policies

### High Memory Usage

- Limit message history (reduce MESSAGE_HISTORY_LIMIT)
- Implement message cleanup
- Use database instead of in-memory storage

## 🔗 Related Documentation

- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Reference](./docs/API_REFERENCE.md)

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Check Socket.io documentation
4. Open an issue on GitHub

---

**Happy Messaging! 🚀**
#   N e x C h a t . g i t h u b . i o  
 