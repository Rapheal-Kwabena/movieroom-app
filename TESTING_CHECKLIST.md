# 🧪 Pre-Deployment Testing Checklist

Complete this checklist before deploying to Vercel to ensure everything works correctly.

---

## ✅ Prerequisites

Before testing, ensure you have:
- [ ] Node.js installed (v16 or higher)
- [ ] npm installed
- [ ] Git installed
- [ ] Two browser windows/tabs available for testing

---

## 📦 Installation Test

### 1. Install Frontend Dependencies
```bash
# In project root
npm install
```

**Expected Output:**
```
added XXX packages
```

**Verify Files Created:**
- [ ] `node_modules/` folder exists
- [ ] `package-lock.json` created

### 2. Install Backend Dependencies
```bash
cd server
npm install
cd ..
```

**Expected Output:**
```
added XXX packages
```

**Verify Files Created:**
- [ ] `server/node_modules/` folder exists
- [ ] `server/package-lock.json` created

---

## 🚀 Server Startup Test

### 1. Start Backend Server
```bash
cd server
npm run dev
```

**Expected Output:**
```
🎬 ================================
🎬 MovieRoom Server is running!
🎬 ================================
🚀 Port: 4000
🌐 URL: http://localhost:4000
🎯 Client: http://localhost:5173
🎬 ================================

🌱 Seeding sample rooms...
✅ Successfully seeded 8 sample rooms
📋 Sample rooms:
   - Friday Night Horror Marathon (Horror) - ID: sample-room-1
   - Rom-Com Evening (Romance) - ID: sample-room-2
   ...
```

**Tests:**
- [ ] Server starts without errors
- [ ] Port 4000 is listening
- [ ] 8 sample rooms seeded successfully
- [ ] No error messages in console

### 2. Start Frontend Server (New Terminal)
```bash
# In project root (new terminal)
npm run dev
```

**Expected Output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

**Tests:**
- [ ] Server starts without errors
- [ ] Port 5173 is listening
- [ ] Opens browser automatically (or can open manually)
- [ ] No compilation errors

---

## 🎨 Frontend UI Tests

### Landing Page (`/`)
**URL:** http://localhost:5173

**Visual Checks:**
- [ ] Logo "MOVIEROOM" displays with gold accent
- [ ] Hero section shows: "Watch Together. No Distance. No Silence."
- [ ] Movie link input field visible
- [ ] "Create Room" button visible and styled
- [ ] Navbar shows: Home, Explore Rooms, Sign In, Create Room
- [ ] Page loads without console errors

**Functionality:**
1. [ ] Paste a YouTube link: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. [ ] Click "Create Room" button
3. [ ] Should navigate to `/create` page
4. [ ] Movie link should pre-fill in Create Room form

---

### Explore Page (`/explore`)
**URL:** http://localhost:5173/explore

**Visual Checks:**
- [ ] Title: "🔥 Explore Public Rooms"
- [ ] Genre filter buttons visible (All, Action, Horror, etc.)
- [ ] Room cards display in grid
- [ ] Each card shows: room name, genre tag, user count
- [ ] "Join Room" button on each card

**Functionality:**
1. [ ] Should see 8 sample rooms
2. [ ] Click "Horror" filter → Only horror rooms show
3. [ ] Click "All" filter → All rooms return
4. [ ] Click "Join Room" on any card → Navigate to `/room/[roomId]`

**Expected Room Cards:**
```
Friday Night Horror Marathon (Horror)
Rom-Com Evening (Romance)
Action Movie Night (Action)
Comedy Central (Comedy)
Thriller Thursday (Thriller)
Drama Club (Drama)
Weekend Movie Fest (Action)
Late Night Cinema (Horror)
```

---

### Sign In Page (`/signin`)
**URL:** http://localhost:5173/signin

**Visual Checks:**
- [ ] Title: "🎬 Welcome Back" or "🎬 Create Account"
- [ ] Username input field
- [ ] Password input field
- [ ] "Sign In" button
- [ ] Toggle between Sign In/Sign Up works
- [ ] Social sign-in buttons (Google, GitHub) visible
- [ ] "Continue as Guest" link visible

**Functionality:**
1. [ ] Type username: `TestUser`
2. [ ] Type password: `test123`
3. [ ] Click "Sign In"
4. [ ] Should navigate to home page (`/`)
5. [ ] Click "Sign Up" toggle
6. [ ] Email field appears
7. [ ] Confirm password field appears

---

### Create Room Page (`/create`)
**URL:** http://localhost:5173/create

**Visual Checks:**
- [ ] Title: "Create Your Movie Room"
- [ ] Movie link input (should be pre-filled if came from landing page)
- [ ] Public/Private toggle
- [ ] Room name input (optional)
- [ ] Genre selector (Action, Horror, Drama, Romance, Comedy, Thriller)
- [ ] Poster upload area
- [ ] "CREATE ROOM" button

**Functionality Test 1: Create Public Room**
1. [ ] Paste movie link: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
2. [ ] Select "Public" (default)
3. [ ] Enter room name: `Test Room Public`
4. [ ] Select genre: `Comedy`
5. [ ] Click "CREATE ROOM"
6. [ ] Should navigate to `/room/[new-room-id]`
7. [ ] Auth modal should appear

**Functionality Test 2: Create Private Room**
1. [ ] Go back to `/create`
2. [ ] Paste movie link
3. [ ] Select "Private"
4. [ ] Password field should appear
5. [ ] Enter password: `test123`
6. [ ] Enter room name: `Test Room Private`
7. [ ] Click "CREATE ROOM"
8. [ ] Should navigate to room page

---

### Watch Room Page (`/room/:roomId`)

#### A. Authentication Modal Test
**First Join:**
1. [ ] Modal shows: "Join Room: [Room Name]"
2. [ ] Shows room type (🔐 Private or 🌍 Public)
3. [ ] Shows user count
4. [ ] Username input field visible

**For Public Room:**
1. [ ] Enter username: `TestHost`
2. [ ] Click "Join Room"
3. [ ] Modal closes
4. [ ] Room interface loads

**For Private Room:**
1. [ ] Enter username: `TestGuest`
2. [ ] Enter password: `wrong_password`
3. [ ] Click "Join Room"
4. [ ] Should show error: "Incorrect password"
5. [ ] Enter correct password
6. [ ] Should join successfully

#### B. Room Interface Test
**Visual Checks:**
- [ ] Room name displays in header
- [ ] User count visible: "👥 1 watching"
- [ ] Invite button visible
- [ ] Exit button visible
- [ ] Video player area displays
- [ ] Reaction timeline bar below video
- [ ] Chat panel on right side
- [ ] Chat input field
- [ ] Quick emoji buttons (😆 😭 😱 🔥 😂)
- [ ] CTA buttons: Start Sync, Create Poll, Pin Message, Spoilers

**Connection Status:**
- [ ] No "Connecting..." screen
- [ ] No error messages
- [ ] Connected successfully

---

## 🎬 Real-Time Features Test

### Test Setup: Two Browser Windows

**Window 1 (Host):**
1. [ ] Open http://localhost:5173/create
2. [ ] Create room with YouTube link
3. [ ] Join as: `Host`

**Window 2 (Guest):**
1. [ ] Copy room URL from Window 1
2. [ ] Paste in Window 2 address bar
3. [ ] Join as: `Guest`

---

### Chat Functionality

**Window 1 (Host):**
1. [ ] Type message: `Hello from host!`
2. [ ] Press Enter or click send
3. [ ] Message appears in chat log
4. [ ] Username shows as `Host:` in gold color

**Window 2 (Guest):**
1. [ ] Should see message: `Host: Hello from host!`
2. [ ] Type reply: `Hi from guest!`
3. [ ] Press Enter
4. [ ] Message appears in own chat

**Window 1 (Host):**
1. [ ] Should receive: `Guest: Hi from guest!`
2. [ ] Messages appear in real-time (< 1 second delay)

**Tests:**
- [ ] Messages sync instantly
- [ ] Both users see all messages
- [ ] Own messages highlighted differently
- [ ] No duplicate messages
- [ ] Chat auto-scrolls to bottom

---

### User Presence

**When Guest Joins:**
- [ ] Window 1 sees user count update: "👥 2 watching"
- [ ] Window 2 sees user count: "👥 2 watching"

**When Guest Leaves:**
1. [ ] Window 2: Click "Exit ❌"
2. [ ] Window 1: User count updates: "👥 1 watching"

---

### Emoji Reactions

**Window 1 (Host):**
1. [ ] Click 😱 emoji button
2. [ ] Should appear in reaction timeline
3. [ ] Format: `😱 [timestamp]s`

**Window 2 (Guest):**
1. [ ] Should see same reaction in timeline
2. [ ] Click 🔥 emoji
3. [ ] Should appear in both windows

**Tests:**
- [ ] Reactions sync between users
- [ ] Timestamp shows correctly
- [ ] Multiple reactions can coexist
- [ ] Reactions persist during session

---

### Video Synchronization (If ReactPlayer works)

**Window 1 (Host - has controls):**
1. [ ] Click Play button ▶
2. [ ] Video starts playing

**Window 2 (Guest - view only):**
1. [ ] Video should automatically start
2. [ ] Playback synced with host
3. [ ] Controls should be disabled (grayed out)

**Window 1 (Host):**
1. [ ] Click Pause button ⏸
2. [ ] Video pauses

**Window 2 (Guest):**
1. [ ] Video should automatically pause
2. [ ] Synced to same timestamp

**Window 1 (Host):**
1. [ ] Drag seek bar to middle of video
2. [ ] Video jumps to new position

**Window 2 (Guest):**
1. [ ] Should automatically jump to same position
2. [ ] Sync maintained

**Tests:**
- [ ] Play/Pause syncs instantly
- [ ] Seek operations sync
- [ ] Guest cannot control playback
- [ ] Guest can control volume/mute
- [ ] Sync indicator shows for guest

---

### Start Sync Button

**Window 2 (Guest):**
1. [ ] Click "⏱ Start Sync" button
2. [ ] Should show alert: "Requesting sync from host..."
3. [ ] Video should re-sync to host's position

---

### Poll Creation (If implemented)

**Window 1 (Host):**
1. [ ] Click "🗳 Create Poll"
2. [ ] Enter question: `Best movie genre?`
3. [ ] Enter options: `Action, Comedy, Horror`
4. [ ] Submit

**Both Windows:**
- [ ] Poll should appear in chat or UI
- [ ] Both users can vote
- [ ] Vote counts update in real-time

---

### Invite Link

**Either Window:**
1. [ ] Click "Invite 🔗" button
2. [ ] Should show alert: "Room link copied to clipboard!"
3. [ ] Paste link in new browser tab
4. [ ] Should load same room
5. [ ] Can join as different user

---

## 🔍 Console Error Check

### Browser Console (F12)

**No Errors Should Appear For:**
- [ ] Page load
- [ ] Navigation between routes
- [ ] Socket connection
- [ ] Sending messages
- [ ] Video playback

**Acceptable Warnings:**
- React development mode warnings
- React Player library notices

**Check Both Terminals:**

**Backend Terminal:**
- [ ] No uncaught exceptions
- [ ] Socket events logging correctly
- [ ] Room creation logs appear
- [ ] User join/leave logs appear

**Frontend Terminal:**
- [ ] No compilation errors
- [ ] No module not found errors
- [ ] Hot reload working (changes reflect instantly)

---

## 📱 Responsive Design Test

### Mobile View (Chrome DevTools)
1. [ ] Open DevTools (F12)
2. [ ] Click device toolbar (Ctrl+Shift+M)
3. [ ] Select "iPhone 12 Pro"

**Landing Page:**
- [ ] Layout adapts to mobile
- [ ] Buttons stack vertically
- [ ] Text remains readable

**Watch Room:**
- [ ] Video player adapts
- [ ] Chat moves below video
- [ ] Controls remain accessible

---

## ⏱️ Performance Test

### Load Times
- [ ] Landing page loads < 2 seconds
- [ ] Room page loads < 3 seconds
- [ ] Video starts playing < 5 seconds

### Socket Latency
- [ ] Messages appear < 1 second
- [ ] Video sync < 1 second
- [ ] Reactions appear instantly

---

## 🐛 Known Issues to Check

1. **Placeholder Video:**
   - [ ] If YouTube link doesn't play, it's a ReactPlayer config issue
   - [ ] Check browser console for iframe errors
   - [ ] Solution in IMPROVEMENTS.md

2. **Password Storage:**
   - [ ] Plain text (see IMPROVEMENTS.md for fix)
   - [ ] Works for testing
   - [ ] Must hash before production

3. **In-Memory Data:**
   - [ ] Server restart loses all rooms
   - [ ] This is expected for MVP
   - [ ] Integrate database for persistence

---

## ✅ Pre-Deployment Checklist

Before pushing to Vercel:

### Code Quality
- [ ] No console.error() in production code
- [ ] All console.log() are for debugging only
- [ ] No hardcoded URLs (use environment variables)
- [ ] .gitignore includes node_modules, .env

### Environment Variables
- [ ] `.env` and `server/.env` NOT committed to Git
- [ ] `.env.example` files included
- [ ] Vercel environment variables configured

### Documentation
- [ ] README.md is up to date
- [ ] API_SETUP.md explains all integrations
- [ ] IMPROVEMENTS.md lists pending security fixes

### Security
- [ ] Review IMPROVEMENTS.md security section
- [ ] Consider implementing password hashing
- [ ] Consider implementing host-only control

---

## 🚀 If All Tests Pass

You're ready to deploy! Follow `DEPLOYMENT.md` (creating next) for Vercel deployment instructions.

---

## ❌ If Tests Fail

### Common Issues:

**Port Already in Use:**
```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Socket Connection Failed:**
- Check `VITE_SOCKET_URL` in `.env`
- Verify backend is running on port 4000
- Check browser console for CORS errors

**Video Doesn't Load:**
- YouTube links must be public
- Try different video URL
- Check ReactPlayer documentation

---

## 📊 Test Results Template

```
=== MOVIEROOM TEST RESULTS ===
Date: [DATE]
Tester: [NAME]

✅ Installation: PASS/FAIL
✅ Server Startup: PASS/FAIL
✅ Frontend UI: PASS/FAIL
✅ Real-time Chat: PASS/FAIL
✅ Video Sync: PASS/FAIL
✅ User Presence: PASS/FAIL
✅ Reactions: PASS/FAIL
✅ Performance: PASS/FAIL
✅ Responsive: PASS/FAIL

Issues Found:
1. [Issue description]
2. [Issue description]

Ready for Deployment: YES/NO
```

---

**Happy Testing! 🧪**