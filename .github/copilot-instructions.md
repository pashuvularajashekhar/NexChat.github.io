# Private Messaging Backend - Copilot Instructions

## Project Information

- **Project Type**: Node.js Backend Application
- **Framework**: Express.js + Socket.io
- **Language**: JavaScript (ES Modules)
- **Node Version**: 18+

## Development Workflow

### Quick Commands

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start

# Test the server
curl http://localhost:3001/api/health
```

### File Organization

- `src/index.js` - Main server entry point
- `src/config/` - Configuration files
- `src/models/` - Data models (Room, Message)
- `src/routes/` - Express API routes
- `src/socket/` - Socket.io event handlers
- `src/middleware/` - Express middleware
- `src/utils/` - Utility functions
- `public/` - Static files and test client

## Key Concepts

### Room Model
- Unique ID: `room_<uuid>`
- Contains users (Set), messages (Array), settings
- Auto-cleanup when empty

### User Sessions
- Stored in Map with Socket.io socket ID
- Tracked by userId, username, roomId
- Cleaned up on disconnect

### Socket.io Events
- **user:join** - Join a room
- **message:send** - Send a message
- **typing:start/stop** - Typing indicator
- **room:getUsers** - Get online users
- **disconnect** - Auto-cleanup on disconnect

## Common Tasks

### Adding New Features

1. **Socket Event**: Add handler in `src/socket/eventHandlers.js`
2. **API Endpoint**: Add route in `src/routes/api.js`
3. **Data Model**: Update `src/models/` if needed
4. **Utility**: Add helper in `src/utils/roomIdGenerator.js`

### Debugging

- Check console logs (prefixed with [Socket], [roomId], etc.)
- Enable debug logging: `LOG_LEVEL=debug` in .env
- Test with built-in client at http://localhost:3001

### Testing API

```bash
# Create room
curl -X POST http://localhost:3001/api/rooms/create \
  -H "Content-Type: application/json" \
  -d '{"creatorId":"test_user"}'

# Get API docs
curl http://localhost:3001/api/docs

# Get stats
curl http://localhost:3001/api/stats
```

## Architecture Overview

```
Client (Browser/App)
    ↓
  Socket.io WebSocket Connection
    ↓
Express HTTP Server (port 3001)
    ├── API Routes (/api/...)
    ├── Socket.io Handler
    ├── CORS Middleware
    └── Error Handler
    ↓
In-Memory Data Store
    ├── Rooms (Map)
    └── User Sessions (Map)
```

## Production Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Update `FRONTEND_URL` to production domain
- [ ] Configure `CORS` for production URLs
- [ ] Implement authentication/authorization
- [ ] Add rate limiting
- [ ] Replace in-memory storage with database
- [ ] Set up error logging/monitoring
- [ ] Enable HTTPS/TLS
- [ ] Configure Socket.io adapter (Redis)
- [ ] Set up automated backups

## Performance Optimization

### Current Limitations (In-Memory)
- Max rooms: 1000 (configurable)
- Max users per room: 100
- Message history: Last 100 messages per room

### Database Migration
Replace `Room` storage in `src/socket/eventHandlers.js`:

```javascript
// Current:
const rooms = new Map();

// Production:
import Room from './models/Room.js'; // MongoDB model
// rooms.get(id) → Room.findById(id)
// rooms.set(id, room) → room.save()
```

## Dependencies

- **express**: Web framework
- **socket.io**: Real-time communication
- **cors**: Cross-origin resource sharing
- **uuid**: Unique ID generation
- **dotenv**: Environment variables

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 3001
lsof -i :3001  # macOS/Linux
netstat -ano | findstr :3001  # Windows
```

### CORS Errors
Ensure `FRONTEND_URL` in .env matches client URL

### Socket Connection Fails
- Check server is running
- Verify CORS settings
- Check network/firewall
- Look at browser console

## Next Steps

1. **Deploy**: Push to Render or Railway
2. **Scale**: Implement database + Redis adapter
3. **Secure**: Add authentication layer
4. **Monitor**: Set up error tracking and analytics
5. **Enhance**: Add features like user profiles, room settings

## Resources

- Server starts on: `http://localhost:3001`
- API docs: `http://localhost:3001/api/docs`
- Test client: `http://localhost:3001`
- Health check: `http://localhost:3001/api/health`
