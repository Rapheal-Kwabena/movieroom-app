# 🎬 MovieRoom - Application Routes

Complete list of all available routes in the MovieRoom application.

## 📋 All Routes

| Route              | Component       | Description                                    | Auth Required |
|--------------------|-----------------|------------------------------------------------|---------------|
| `/`                | LandingPage     | Home page with hero and trending rooms         | ❌            |
| `/explore`         | ExplorePage     | Browse and join public movie rooms             | ❌            |
| `/signin`          | SignInPage      | Sign in or create an account                   | ❌            |
| `/create`          | CreateRoomPage  | Create a new movie room                        | ⚠️ (Guest OK) |
| `/room/:roomId`    | WatchRoom       | Watch movies together in real-time             | ⚠️ (Guest OK) |
| `/profile`         | ProfilePage     | View user profile, history, badges             | ✅            |
| `*` (404)          | NotFoundPage    | Page not found error page                      | ❌            |

## 🏠 Landing Page (`/`)

**Purpose:** Main entry point for the application

**Features:**
- Hero section with movie link input
- Trending rooms carousel
- Features showcase
- Quick navigation to all sections

**Key Actions:**
- Paste movie link → Create Room
- Browse trending rooms
- Navigate to Explore or Sign In

---

## 🔍 Explore Page (`/explore`)

**Purpose:** Discover and join public movie rooms

**Features:**
- Grid view of all public rooms
- Genre filtering (All, Action, Horror, Drama, Romance, Comedy, Thriller)
- Room cards showing:
  - Room name
  - Genre tag
  - User count
  - Creation date
- Real-time room list
- Refresh functionality

**Key Actions:**
- Filter rooms by genre
- Join any public room
- Create new room if none available

**API Endpoints Used:**
- `GET /api/rooms` - Fetch public rooms list

---

## 🔐 Sign In Page (`/signin`)

**Purpose:** User authentication (sign in or sign up)

**Features:**
- Toggle between Sign In and Sign Up modes
- Username, email, password fields
- Password confirmation (Sign Up)
- "Forgot Password" link
- Social sign-in buttons (Google, GitHub - Coming Soon)
- Guest access option
- Feature showcase sidebar

**Key Actions:**
- Sign In with existing account
- Create new account
- Continue as Guest
- Social authentication (planned)

**Storage:**
- localStorage for user session (temporary MVP solution)

---

## ➕ Create Room Page (`/create`)

**Purpose:** Configure and create a new movie room

**Features:**
- Movie link input (required)
- Room visibility toggle (Public/Private)
- Password protection for private rooms
- Custom room name
- Genre tag selector
- Poster image upload area (planned)
- Form validation
- Error handling

**Key Actions:**
- Input movie URL
- Configure room settings
- Create room → Navigate to Watch Room

**API Endpoints Used:**
- `POST /api/rooms/create` - Create new room

**Form Data:**
```javascript
{
  movieLink: string,
  roomName: string,
  isPrivate: boolean,
  password: string | null,
  genreTag: string,
  posterImage: File | null
}
```

---

## 🎬 Watch Room Page (`/room/:roomId`)

**Purpose:** Main movie watching and chat interface

**URL Parameter:**
- `roomId` - Unique room identifier

**Authentication Flow:**
1. Fetch room info
2. Show join modal
3. Enter username (and password if private)
4. Connect to Socket.io
5. Join room and start watching

**Features:**

### Video Section
- Video player area (iframe placeholder)
- Reaction timeline with emoji stamps
- Movie playback status display

### Chat Panel
- Real-time message display
- User identification (you vs others)
- Message input with emoji quick buttons
- Scroll to latest messages

### Interactive Controls
- **⏱ Start Sync** - Synchronize playback for all users
- **🗳 Create Poll** - Create live polls
- **📌 Pin Message** - Highlight important messages (planned)
- **🚫 Spoilers** - Toggle spoiler blur mode

### Real-time Updates
- User join/leave notifications
- Live message sync
- Reaction broadcasts
- User count display

**Socket.io Events Used:**

**Client → Server:**
- `joinRoom` - Join the room
- `sendMessage` - Send chat message
- `sendReaction` - React with emoji
- `syncMovieState` - Broadcast playback state
- `createPoll` - Create a poll

**Server → Client:**
- `roomState` - Initial room data
- `newMessage` - New chat message
- `newReaction` - New reaction
- `userJoined` - User joined notification
- `userLeft` - User left notification
- `movieStateUpdated` - Playback sync update

---

## 👤 Profile Page (`/profile`)

**Purpose:** User profile and activity dashboard (Phase 2)

**Features:**

### Profile Header
- Avatar display (emoji-based)
- Username and bio
- Join date
- Edit profile button

### Watch History
- List of previously watched movies
- Room names and dates
- Clickable for replay (planned)

### Favorite Rooms
- Saved/bookmarked rooms
- Genre tags
- Member counts

### Badges & Achievements
- Horror Lover 👻
- All-Night Binger 🌙
- Super-Commenter 💬
- Hover for badge descriptions

### Friends List
- Connected users
- Avatar and username display

### Settings & Actions
- Settings button (planned)
- Logout functionality

**Key Actions:**
- Edit profile information
- View watch history
- Manage favorite rooms
- View earned badges
- Logout

---

## ❌ 404 Not Found Page (`*`)

**Purpose:** Handle invalid routes gracefully

**Features:**
- Large 404 error display
- Friendly error message
- Quick navigation buttons:
  - Go Home
  - Go Back
- Quick links to main sections:
  - Home
  - Explore Rooms
  - Create Room
  - Profile

**Key Actions:**
- Navigate back to home
- Go to previous page
- Access quick links

---

## 🔄 Route Flow Examples

### Creating and Joining a Room

```
1. Landing Page (/)
   ↓ User pastes movie link → "Create Room"
2. Create Room Page (/create)
   ↓ Fill form → "CREATE ROOM"
3. Watch Room (/room/abc123)
   ↓ Modal appears → Enter username → "Join Room"
4. Watch Room Interface
   ↓ User can chat, react, sync
```

### Exploring and Joining Rooms

```
1. Landing Page (/)
   ↓ Click "Explore Rooms"
2. Explore Page (/explore)
   ↓ Browse rooms → Click "Join Room"
3. Watch Room (/room/xyz789)
   ↓ Enter username → Join
4. Watch Room Interface
```

### Authentication Flow

```
1. Any Page
   ↓ Click "Sign In" in navbar
2. Sign In Page (/signin)
   ↓ Sign in or sign up
3. Redirect to Landing Page (/)
   ↓ Now authenticated
```

---

## 🛡️ Protected Routes (Future)

Currently, all routes allow guest access. In production, consider:

| Route          | Access Level              |
|----------------|---------------------------|
| `/`            | Public                    |
| `/explore`     | Public                    |
| `/signin`      | Public only (redirect if logged in) |
| `/create`      | Authenticated + Guest     |
| `/room/:id`    | Authenticated + Guest     |
| `/profile`     | Authenticated only        |

---

## 🚀 Navigation Structure

```
Navbar (Global)
├── Logo → /
├── Home → /
├── Explore Rooms → /explore
├── Sign In → /signin
└── Create Room (Button) → /create

Watch Room Header
├── Room Name (Title)
├── Invite 🔗 (Copy link)
└── Exit ❌ → /

Profile Actions
├── Settings → /profile/settings (planned)
└── Logout → /
```

---

## 📝 Notes

1. **Guest Access:** Most routes support guest usage without authentication
2. **Private Rooms:** Require password to join
3. **Real-time:** Watch rooms use Socket.io for live updates
4. **Responsive:** All routes are mobile-friendly
5. **Error Handling:** Each route includes loading and error states

---

**All routes are now fully implemented and functional! 🎉**