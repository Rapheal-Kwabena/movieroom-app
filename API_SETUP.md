# 🔑 API Setup Guide - Free & Open Source Services

Complete guide to setting up all the free APIs used in MovieRoom.

---

## 📋 Quick Overview

| Service | Purpose | Free Tier | Setup Time |
|---------|---------|-----------|------------|
| **Socket.io** | Real-time chat & sync | ✅ Open Source | 0 min (included) |
| **TMDB** | Movie metadata | ✅ 100% Free | 5 min |
| **Cloudinary** | Image hosting | ✅ 25GB Free | 5 min |
| **Supabase** | Database & Auth | ✅ 500MB Free | 10 min |

**Total Cost: $0/month** 🎉

---

## 1️⃣ The Movie Database (TMDB) - 100% FREE

**What it does:** Fetches movie posters, titles, descriptions, and genres automatically.

### Setup Steps:

1. **Create Account**
   - Visit: https://www.themoviedb.org/signup
   - Sign up (completely free)

2. **Get API Key**
   - Go to: https://www.themoviedb.org/settings/api
   - Click "Create" under "Request an API Key"
   - Choose "Developer"
   - Fill in application form:
     - Application Name: `MovieRoom`
     - Application URL: `http://localhost:5173` (or your domain)
     - Application Summary: `Movie watching platform with real-time chat`

3. **Copy API Key**
   - You'll receive an API Key (v3 auth)
   - Copy the key

4. **Add to .env Files**

**Frontend (`.env`):**
```env
VITE_TMDB_API_KEY=your_api_key_here
VITE_TMDB_BASE_URL=https://api.themoviedb.org/3
```

**Backend (`server/.env`):**
```env
TMDB_API_KEY=your_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

### Usage Example:
```javascript
// Search for a movie
const response = await fetch(
  `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=Inception`
);
const data = await response.json();
```

### Free Tier Limits:
- ✅ Unlimited requests
- ✅ Full database access
- ✅ No credit card required
- ⚠️ Requires attribution (link to TMDB)

---

## 2️⃣ Cloudinary - 25GB FREE

**What it does:** Hosts user-uploaded room posters and avatars.

### Setup Steps:

1. **Create Account**
   - Visit: https://cloudinary.com/users/register/free
   - Sign up (no credit card required)

2. **Get Credentials**
   - After signup, go to Dashboard
   - You'll see:
     - Cloud Name
     - API Key
     - API Secret

3. **Create Upload Preset**
   - Go to Settings → Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Name it: `movieroom_uploads`
   - Signing Mode: `Unsigned`
   - Folder: `movieroom`
   - Save

4. **Add to .env Files**

**Frontend (`.env`):**
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=movieroom_uploads
```

**Backend (`server/.env`):**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Usage Example:
```javascript
// Upload image from frontend
const formData = new FormData();
formData.append('file', imageFile);
formData.append('upload_preset', 'movieroom_uploads');

const response = await fetch(
  `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
  { method: 'POST', body: formData }
);
```

### Free Tier Limits:
- ✅ 25GB Storage
- ✅ 25GB Bandwidth/month
- ✅ 25,000 transformations/month
- ✅ No credit card required

---

## 3️⃣ Supabase - 500MB FREE

**What it does:** Persistent database, user authentication, and real-time subscriptions.

### Setup Steps:

1. **Create Account**
   - Visit: https://supabase.com
   - Sign up with GitHub (recommended) or email

2. **Create Project**
   - Click "New Project"
   - Fill in:
     - Name: `movieroom`
     - Database Password: (generate strong password - save it!)
     - Region: Choose closest to you
   - Click "Create new project"
   - Wait 1-2 minutes for setup

3. **Get API Keys**
   - Go to: Settings → API
   - You'll see:
     - **Project URL** (e.g., `https://abc123.supabase.co`)
     - **anon/public key** (for frontend)
     - **service_role key** (for backend - keep secret!)

4. **Create Tables** (Optional for MVP)

Run this SQL in Supabase SQL Editor:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  movie_link TEXT NOT NULL,
  genre_tag TEXT,
  is_private BOOLEAN DEFAULT FALSE,
  password TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id),
  user_id UUID REFERENCES users(id),
  username TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

5. **Add to .env Files**

**Frontend (`.env`):**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Backend (`server/.env`):**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Usage Example:
```javascript
// Install: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

// Insert a room
const { data, error } = await supabase
  .from('rooms')
  .insert({ name: 'Horror Night', movie_link: 'https://...' });
```

### Free Tier Limits:
- ✅ 500MB Database Space
- ✅ 2GB File Storage
- ✅ 50,000 Monthly Active Users
- ✅ Unlimited API requests
- ✅ No credit card required

---

## 4️⃣ Socket.io - OPEN SOURCE

**What it does:** Real-time chat, user presence, and watch synchronization.

### Setup:

✅ **Already included in the project!** No external account needed.

```bash
# Already installed
cd server
npm install socket.io  # Server
cd ..
npm install socket.io-client  # Client
```

---

## 🚀 Complete Setup Checklist

### Before Starting:
- [ ] Node.js installed (v16+)
- [ ] Code editor (VS Code recommended)
- [ ] Git installed

### API Setup (~20 minutes):
- [ ] TMDB account + API key
- [ ] Cloudinary account + credentials
- [ ] Supabase project + API keys

### Configuration:
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all API keys
- [ ] Copy `server/.env.example` to `server/.env`
- [ ] Fill in server API keys

### Testing:
- [ ] Start backend: `cd server && npm run dev`
- [ ] Start frontend: `npm run dev`
- [ ] Test movie search (TMDB)
- [ ] Test image upload (Cloudinary)
- [ ] Test room creation (Supabase)

---

## 📝 Quick Start (Without External APIs)

Don't want to set up APIs right away? The app works without them!

**1. Basic Setup (No APIs):**
```env
# .env (Frontend)
VITE_API_URL=http://localhost:4000/api
VITE_SOCKET_URL=http://localhost:4000
VITE_APP_NAME=MovieRoom
VITE_APP_URL=http://localhost:5173
```

```env
# server/.env (Backend)
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**2. Start both servers:**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

**What works:**
- ✅ Create rooms (manual movie links)
- ✅ Real-time chat
- ✅ Watch synchronization
- ✅ Reactions
- ✅ Join public rooms

**What doesn't work:**
- ❌ Automatic movie posters
- ❌ Image uploads
- ❌ Persistent database
- ❌ User authentication

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Tier (if needed) |
|---------|-----------|----------------------|
| TMDB | Unlimited FREE | N/A |
| Cloudinary | 25GB FREE | $89/mo for 150GB |
| Supabase | 500MB FREE | $25/mo for 8GB |
| Socket.io | FREE (Self-hosted) | N/A |
| Vercel Hosting | FREE | $20/mo for Pro |

**For hobby/MVP: $0/month** ✅

---

## 🔧 Troubleshooting

### TMDB: "Invalid API Key"
- Check that key is in `.env` file
- Restart dev server after adding
- Verify key at: https://www.themoviedb.org/settings/api

### Cloudinary: "Upload Failed"
- Check upload preset is "unsigned"
- Verify cloud name is correct
- Check browser console for CORS errors

### Supabase: "Connection Error"
- Verify project URL is correct
- Check API key (anon for frontend, service for backend)
- Ensure Supabase project is not paused

### Socket.io: "Can't Connect"
- Verify backend server is running
- Check `VITE_SOCKET_URL` matches backend port
- Look for CORS errors in console

---

## 📖 Next Steps

1. **Set up TMDB first** - It's the easiest and adds the most value
2. **Add Supabase** - Persistent storage is crucial for production
3. **Configure Cloudinary** - Nice-to-have for user uploads
4. **Deploy to Vercel** - Free hosting for your React app

---

**All services are completely free for MVP usage!** 🎉

For questions or issues, check the official documentation:
- [TMDB API Docs](https://developers.themoviedb.org/3)
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Supabase Docs](https://supabase.com/docs)
- [Socket.io Docs](https://socket.io/docs/v4/)