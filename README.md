# 🎬 MovieRoom - Watch Together Chat App

A full-stack web application that allows users to watch movies together in real-time while chatting. Built with React, Node.js, Express, and Socket.io.

## 🌟 Features

### MVP Features
- ✅ **Paste Movie Link & Create Room** - Instantly create a viewing room from any movie link
- ✅ **Public & Private Rooms** - Control who can join your movie sessions
- ✅ **Real-time Chat** - Text-based messaging while watching
- ✅ **Reaction Timeline** - React with emojis at specific movie timestamps
- ✅ **Watch Sync** - Synchronized playback countdown for all viewers
- ✅ **Room Sharing** - Share invite links with friends
- ✅ **Explore Public Rooms** - Discover and join trending movie sessions
- ✅ **Spoiler Protection** - Toggle to blur messages ahead of your progress

### Phase 2 Features
- ✅ **User Profiles** - View watch history, badges, and friends
- ✅ **Live Polls** - Create and vote on polls during movies
- ✅ **Custom Room Themes** - Genre-based room customization

## 🏗️ Project Structure

```
movieroom-app/
├── Src/                          # React Frontend
│   ├── components/
│   │   ├── UI/                   # Reusable components
│   │   ├── Chat/                 # Chat-specific components
│   │   └── Rooms/                # Room-related components
│   ├── pages/
│   │   ├── LandingPage/          # Home page
│   │   ├── CreateRoomPage/       # Room creation
│   │   ├── WatchRoom/            # Main watch interface
│   │   └── ProfilePage/          # User profile
│   ├── hooks/
│   │   └── useSocket.js          # Socket.io connection hook
│   ├── utils/
│   │   └── api.js                # API utility functions
│   ├── styles/
│   │   └── theme.css             # Global theme & colors
│   ├── App.jsx                   # Main router
│   └── main.jsx                  # Entry point
│
├── server/                       # Node.js Backend
│   ├── server.js                 # Main server file
│   ├── package.json              # Server dependencies
│   └── .env                      # Server configuration
│
├── package.json                  # Client dependencies
├── vite.config.js                # Vite configuration
├── index.html                    # HTML entry point
└── README.md                     # This file
```

## 🎨 Design Theme

**Dark Cinema × Gold Accents**

| Color           | Hex Code | Usage                           |
|-----------------|----------|---------------------------------|
| Black Night     | #0D0D0D  | Background / UI Base            |
| Film Slate Grey | #1B1B1B  | Cards / Panels                  |
| Golden Accent   | #E6B10E  | Buttons, highlights, CTAs       |
| Ash Silver      | #C4C4C4  | Secondary text                  |
| Pop Red         | #ED2B2A  | Warnings, spoiler toggle        |

**Typography**
- Headers: Montserrat Bold
- Body: Inter Regular
- Labels: Poppins Light

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
cd movieroom-app
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

### Running the Application

You need to run **both** the frontend and backend servers.

#### 1. Start the Backend Server

```bash
cd server
npm run dev
```

The server will start on `http://localhost:4000`

#### 2. Start the Frontend (in a new terminal)

```bash
npm run dev
```

The React app will start on `http://localhost:5173`

### Configuration

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
```

**Backend (server/.env)**
```env
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 📡 API Endpoints

### REST API

| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | `/api/health`         | Server health check        |
| POST   | `/api/rooms/create`   | Create a new room          |
| GET    | `/api/rooms/:roomId`  | Get room information       |
| GET    | `/api/rooms`          | Get list of public rooms   |

### Socket.io Events

#### Client → Server

| Event             | Description                    |
|-------------------|--------------------------------|
| `joinRoom`        | Join a room                    |
| `leaveRoom`       | Leave a room                   |
| `sendMessage`     | Send a chat message            |
| `sendReaction`    | Send a reaction at timestamp   |
| `syncMovieState`  | Sync movie playback state      |
| `requestSync`     | Request current movie state    |
| `createPoll`      | Create a poll                  |
| `votePoll`        | Vote on a poll                 |

#### Server → Client

| Event              | Description                    |
|--------------------|--------------------------------|
| `roomError`        | Room error notification        |
| `roomState`        | Initial room state             |
| `userJoined`       | User joined notification       |
| `userLeft`         | User left notification         |
| `newMessage`       | New chat message               |
| `newReaction`      | New reaction                   |
| `movieStateUpdated`| Movie state sync update        |
| `newPoll`          | New poll created               |
| `pollVoted`        | Poll vote update               |

## 🎯 User Flow

1. **Landing Page** → User pastes movie link
2. **Create Room** → Configure room settings (public/private, name, genre)
3. **Share Link** → Invite friends via generated room link
4. **Watch Together** → Join room, chat, react, and sync playback
5. **Profile** → View history, badges, and friends (Phase 2)

## 🛠️ Tech Stack

### Frontend
- **React** 18.2 - UI framework
- **React Router** 6.20 - Client-side routing
- **Socket.io Client** 4.6 - Real-time communication
- **Vite** 5.0 - Build tool and dev server

### Backend
- **Node.js** - Runtime environment
- **Express** 4.18 - Web framework
- **Socket.io** 4.6 - WebSocket server
- **CORS** - Cross-origin resource sharing

## 📦 Build for Production

### Frontend
```bash
npm run build
```

The build will be output to the `dist/` directory.

### Backend
```bash
cd server
npm start
```

## 🔮 Future Enhancements

- [ ] Video player integration (YouTube, Netflix embeds)
- [ ] Voice chat rooms
- [ ] AI-powered scene highlights
- [ ] Mobile app (React Native)
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] User authentication (OAuth, JWT)
- [ ] Advanced analytics dashboard
- [ ] Personalized recommendations

## 🐛 Known Issues

- Video player is currently a placeholder (requires iframe integration)
- In-memory data storage (rooms lost on server restart)
- No persistent user authentication yet

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 👥 Contributing

This is a demonstration project. Feel free to fork and customize for your own use.

## 💬 Support

For questions or issues, please create an issue in the repository.

---

**Built with ❤️ for movie lovers everywhere** 🍿🎬