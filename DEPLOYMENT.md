# 🚀 Vercel Deployment Guide

Complete guide to deploy MovieRoom to Vercel (Frontend) and Railway/Render (Backend).

---

## 📋 Pre-Deployment Checklist

Before deploying, complete [`TESTING_CHECKLIST.md`](TESTING_CHECKLIST.md:1) locally.

### Must-Have:
- [ ] Node.js installed locally
- [ ] `npm install` works without errors
- [ ] Both servers run successfully locally
- [ ] Real-time chat works between two browser windows
- [ ] Video sync works (at least partially)
- [ ] No critical console errors

---

## 🎯 Deployment Architecture

```
Frontend (React + Vite)          Backend (Node.js + Socket.io)
        ↓                                    ↓
    VERCEL                              RAILWAY/RENDER
(Free Tier)                            (Free Tier)
        ↓                                    ↓
https://movieroom.vercel.app      https://movieroom-api.railway.app
        ↓                                    ↓
        └────────── Socket.io ←──────────────┘
```

---

## Part 1: Deploy Backend (Railway) 🚂

Railway offers the best free tier for Socket.io apps.

### Step 1: Create Railway Account

1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. ✅ No credit card required for $5/month free tier

### Step 2: Prepare Backend

**Update `server/.env` for production:**
```env
PORT=4000
NODE_ENV=production
CLIENT_URL=https://movieroom.vercel.app
CORS_ORIGIN=https://movieroom.vercel.app
```

**Ensure `server/package.json` has start script:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Step 3: Deploy to Railway

**Option A: GitHub (Recommended)**
1. Push code to GitHub repository
2. In Railway dashboard: "New Project" → "Deploy from GitHub"
3. Select your repository
4. Railway auto-detects `server/` directory
5. Click "Deploy"

**Option B: Railway CLI**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
cd server
railway init

# Deploy
railway up
```

### Step 4: Configure Environment Variables

In Railway dashboard:
1. Go to your project
2. Click "Variables" tab
3. Add:
   ```
   PORT=4000
   NODE_ENV=production
   CLIENT_URL=https://movieroom.vercel.app
   ```

### Step 5: Get Backend URL

Railway provides a URL like:
```
https://movieroom-api.railway.app
```

**Copy this URL** - you'll need it for frontend deployment.

### Step 6: Test Backend

```bash
curl https://movieroom-api.railway.app/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "MovieRoom Server is running"
}
```

---

## Part 2: Deploy Frontend (Vercel) ▲

### Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign in with GitHub
4. ✅ Free tier includes:
   - 100 GB bandwidth/month
   - Unlimited deployments
   - Custom domains

### Step 2: Prepare Frontend

**Create `.env.production` file in project root:**
```env
VITE_API_URL=https://movieroom-api.railway.app/api
VITE_SOCKET_URL=https://movieroom-api.railway.app
VITE_APP_NAME=MovieRoom
VITE_APP_URL=https://movieroom.vercel.app
```

**Update `vite.config.js` if needed:**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
```

### Step 3: Deploy to Vercel

**Option A: Vercel Dashboard (Easiest)**
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (project root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. Add Environment Variables:
   ```
   VITE_API_URL=https://movieroom-api.railway.app/api
   VITE_SOCKET_URL=https://movieroom-api.railway.app
   VITE_APP_NAME=MovieRoom
   ```

6. Click "Deploy"

**Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? movieroom
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_API_URL production
vercel env add VITE_SOCKET_URL production

# Deploy to production
vercel --prod
```

### Step 4: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as instructed

---

## Part 3: Update CORS Settings

After deploying frontend, update backend CORS:

**In Railway dashboard:**
1. Go to backend project variables
2. Update:
   ```
   CLIENT_URL=https://your-actual-vercel-url.vercel.app
   CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
   ```

3. Redeploy backend

---

## 🧪 Post-Deployment Testing

### Test 1: Frontend Loads
```
Visit: https://your-app.vercel.app
```
- [ ] Landing page loads
- [ ] No console errors
- [ ] Navbar works
- [ ] Styling looks correct

### Test 2: Backend Connection
```
Visit: https://your-app.vercel.app/explore
```
- [ ] Explore page loads
- [ ] Sample rooms visible
- [ ] API calls working

### Test 3: Real-Time Features

**Open two browser windows:**

1. Window 1: Create a room
2. Window 2: Join same room using URL
3. Test:
   - [ ] Chat messages sync
   - [ ] User count updates
   - [ ] Emoji reactions work

### Test 4: Video Playback

1. Create room with YouTube link
2. Join room
3. Test:
   - [ ] Video loads
   - [ ] Controls work (for host)
   - [ ] Sync works between users

---

## 🐛 Troubleshooting

### Issue: "Failed to Connect to Server"

**Symptoms:**
- Frontend loads but shows "Connecting..."
- Console error: `net::ERR_CONNECTION_REFUSED`

**Solutions:**
1. Check backend is running:
   ```bash
   curl https://your-backend.railway.app/api/health
   ```

2. Verify environment variables:
   - `VITE_SOCKET_URL` in Vercel
   - `CLIENT_URL` in Railway

3. Check CORS settings in backend
4. Verify Railway backend is not paused

### Issue: "Socket.io Connection Failed"

**Symptoms:**
- Error: `WebSocket connection failed`
- Chat doesn't work

**Solutions:**
1. Railway automatic WebSocket support
2. Check Railway logs for errors
3. Verify Socket.io version matches
4. Try redeploying both services

### Issue: "Video Doesn't Play"

**Symptoms:**
- Video area is blank
- ReactPlayer error in console

**Solutions:**
1. Check YouTube URL is public
2. Verify ReactPlayer installed:
   ```bash
   npm list react-player
   ```

3. Try different video platform
4. Check browser console for specific error

### Issue: "502 Bad Gateway"

**Symptoms:**
- Backend URL returns 502
- Railway shows app crashed

**Solutions:**
1. Check Railway logs:
   - Click project → Deployments → Logs
2. Common causes:
   - Missing dependencies
   - Port binding error
   - Environment variables missing
3. Verify `package.json` start script
4. Check for uncaught exceptions

### Issue: "Build Failed on Vercel"

**Symptoms:**
- Deployment fails
- Build logs show errors

**Solutions:**
1. Check build logs for specific error
2. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Import path errors
3. Test build locally:
   ```bash
   npm run build
   ```

4. Verify all files committed to Git

---

## 📊 Monitoring & Logs

### View Vercel Logs
```
1. Dashboard → Project → Deployments
2. Click deployment
3. View "Build Logs" and "Function Logs"
```

### View Railway Logs
```
1. Dashboard → Project
2. Click "Deployments"
3. View real-time logs
4. Check for errors on startup
```

### Check Performance
```
1. Vercel Analytics (free)
2. Railway Metrics
3. Browser DevTools → Network tab
```

---

## 💰 Free Tier Limits

### Vercel (Frontend)
- ✅ 100 GB bandwidth/month
- ✅ Unlimited repos
- ✅ Unlimited deployments
- ✅ Custom domains
- ⚠️ No team features

### Railway (Backend)
- ✅ $5 free credit/month
- ✅ ~500 hours runtime
- ✅ Automatic WebSocket support
- ⚠️ Must add credit card after trial

### Alternative: Render.com (Backend)
- ✅ 750 hours/month free
- ✅ No credit card required
- ✅ Auto-deploy from Git
- ⚠️ Apps sleep after 15min inactivity

---

## 🔒 Production Security Checklist

Before making app public:

- [ ] Implement password hashing (see IMPROVEMENTS.md)
- [ ] Add rate limiting
- [ ] Implement host-only video control
- [ ] Add database (Supabase)
- [ ] Set up monitoring/logging
- [ ] Add error tracking (Sentry)
- [ ] Update security headers
- [ ] Enable HTTPS only
- [ ] Add API authentication

---

## 🎯 Custom Domain Setup

### For Vercel (Frontend)

1. Buy domain (Namecheap, GoDaddy, etc.)
2. In Vercel:
   - Project Settings → Domains
   - Add domain: `movieroom.com`
3. Update DNS records:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### For Railway (Backend)

1. Railway provides free subdomain
2. For custom domain:
   - Project Settings → Domain
   - Enter: `api.movieroom.com`
3. Add DNS record:
   ```
   Type: CNAME
   Name: api
   Value: [Railway provides]
   ```

---

## 📈 Scaling Considerations

### When to Upgrade

**Vercel Pro ($20/mo):**
- Bandwidth > 100GB
- Need team features
- Want priority support

**Railway Pro ($20/mo):**
- Need more compute hours
- Multiple environments
- Better performance

**Database Required When:**
- Rooms need to persist
- User accounts needed
- Chat history required
- Watch history tracking

---

## 🎬 Final Deployment Commands

```bash
# 1. Test locally first
npm install
cd server && npm install && cd ..

# 2. Start both servers
cd server && npm run dev &
npm run dev

# 3. Test in browser
# Open: http://localhost:5173
# Create room, test chat, test video

# 4. If all tests pass, deploy!

# Backend (Railway CLI)
cd server
railway up

# Frontend (Vercel CLI)
cd ..
vercel --prod

# 5. Test production URLs
# Visit: https://your-app.vercel.app
```

---

## ✅ Deployment Success Checklist

After deployment:
- [ ] Frontend URL accessible
- [ ] Backend API responds
- [ ] Sample rooms load on /explore
- [ ] Can create new room
- [ ] Real-time chat works
- [ ] Video player loads
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Invite links work
- [ ] All routes accessible

---

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [Socket.io Production](https://socket.io/docs/v4/server-deployment/)

---

## 🆘 Need Help?

1. Check logs (Vercel + Railway)
2. Review IMPROVEMENTS.md for known issues
3. Test locally to isolate problem
4. Check GitHub issues for react-player
5. Verify all environment variables

---

**Your app is ready to go live! 🚀**

Once deployed, share the URL and watch movies together from anywhere in the world! 🎬🍿