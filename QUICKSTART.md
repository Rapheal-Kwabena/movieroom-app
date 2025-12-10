# 🚀 Quick Start Guide - MovieRoom App

## Step-by-Step Setup

### 1️⃣ Install Dependencies

**Install Frontend Dependencies:**
```bash
npm install
```

**Install Backend Dependencies:**
```bash
cd server
npm install
cd ..
```

### 2️⃣ Start the Application

You need **TWO terminal windows** running simultaneously.

#### Terminal 1: Start Backend Server

```bash
cd server
npm run dev
```

✅ You should see:
```
🎬 ================================
🎬 MovieRoom Server is running!
🎬 ================================
🚀 Port: 4000
🌐 URL: http://localhost:4000
```

#### Terminal 2: Start Frontend (React App)

Open a **new terminal** and run:
```bash
npm run dev
```

✅ You should see:
```
  VITE v5.0.8  ready in XXX ms

  ➜  Local:   http://localhost:5173/
```

### 3️⃣ Open the App

Open your browser and navigate to:
```
http://localhost:5173
```

## 🎬 Quick Test Flow

1. **Landing Page** → Paste a movie link (any URL for testing)
2. Click **"Create Room"**
3. **Create Room Page** → Fill in:
   - Room Name: `Test Movie Night`
   - Select Genre: `Horror`
   - Toggle: `Public` or `Private`
4. Click **"CREATE ROOM"**
5. **Join Modal** → Enter username: `TestUser`
6. Click **"Join Room"**
7. **Watch Room** → You're now in the room!
   - Type messages in chat
   - Click emoji buttons to react
   - Click "Start Sync" to test synchronization

## 🧪 Testing Real-Time Features

### Test Chat (Multiple Users)

1. **Open TWO browser windows** side by side
2. In Window 1: Create a room
3. **Copy the room URL** from the address bar
4. In Window 2: Paste and open the same URL
5. Enter a different username
6. **Start chatting!** Messages appear in real-time in both windows

### Test Reactions

- Click any emoji button (😆 😭 😱 🔥 😂)
- Watch the reaction appear on the timeline with timestamp
- Both users see reactions in real-time

### Test Watch Sync

- Click **"⏱ Start Sync"** button
- All users in the room receive a sync notification
- (Note: Actual video sync requires video player integration)

## 🔧 Troubleshooting

### Backend won't start?
```bash
cd server
rm -rf node_modules
npm install
npm run dev
```

### Frontend won't start?
```bash
rm -rf node_modules
npm install
npm run dev
```

### Port already in use?
Change ports in `.env` files:
- Frontend: Change `VITE_SOCKET_URL` and `VITE_API_URL`
- Backend: Change `PORT` in `server/.env`

### Can't connect to server?
Verify these match:
- Backend runs on: `http://localhost:4000`
- Frontend `.env` has: `VITE_API_URL=http://localhost:4000/api`

## 📱 Features to Test

✅ **Working Features:**
- [x] Create public/private rooms
- [x] Real-time chat messaging
- [x] Emoji reactions with timestamps
- [x] Multiple users in same room
- [x] User join/leave notifications
- [x] Room invite links
- [x] Watch sync countdown
- [x] Spoiler mode toggle
- [x] Create polls
- [x] User profiles (Phase 2)

⚠️ **Not Yet Implemented:**
- [ ] Actual video player (placeholder only)
- [ ] Database persistence (in-memory only)
- [ ] User authentication
- [ ] Image upload for room posters

## 🎯 Next Steps

1. **Add Video Player**: Integrate YouTube or custom video player
2. **Add Database**: Replace in-memory storage with MongoDB/PostgreSQL
3. **Add Auth**: Implement user login/signup
4. **Deploy**: Host on Vercel (frontend) + Railway (backend)

---

**Ready to start building? Have fun! 🎬🍿**