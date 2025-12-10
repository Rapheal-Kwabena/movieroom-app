# MovieRoom Server

Backend server for the MovieRoom application using Node.js, Express, and Socket.io.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env` file and adjust settings if needed
   - Default port is 4000
   - Default client URL is http://localhost:5173

3. Start the server:
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## Sample Rooms

The server automatically seeds **8 sample public rooms** on startup for testing:

1. Friday Night Horror Marathon (Horror)
2. Rom-Com Evening (Romance)
3. Action Movie Night (Action)
4. Comedy Central (Comedy)
5. Thriller Thursday (Thriller)
6. Drama Club (Drama)
7. Weekend Movie Fest (Action)
8. Late Night Cinema (Horror)

These rooms are available immediately in the `/explore` page.

## API Endpoints

### REST API

- `GET /api/health` - Server health check
- `POST /api/rooms/create` - Create a new room
- `GET /api/rooms/:roomId` - Get room information
- `GET /api/rooms` - Get list of public rooms

### Socket.io Events

#### Client → Server

- `joinRoom` - Join a room
- `leaveRoom` - Leave a room
- `sendMessage` - Send a chat message
- `sendReaction` - Send a reaction at a timestamp
- `syncMovieState` - Sync movie playback state
- `requestSync` - Request current movie state
- `createPoll` - Create a poll
- `votePoll` - Vote on a poll

#### Server → Client

- `roomError` - Room error notification
- `roomState` - Initial room state
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `newMessage` - New chat message
- `newReaction` - New reaction
- `movieStateUpdated` - Movie state sync update
- `newPoll` - New poll created
- `pollVoted` - Poll vote update

## Architecture

- In-memory data storage (rooms and users)
- Real-time communication via Socket.io
- CORS enabled for React client
- Auto-cleanup of empty rooms