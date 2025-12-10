# MovieRoom Hyperbeam Integration Architecture
## Strategy 1: The "Virtual Browser" Model

> **Goal:** Enable synchronized watching of ANY website or streaming service through a shared virtual browser experience, eliminating all platform restrictions.

---

## 🎯 Overview

This architecture represents the ultimate solution for watch-together functionality by using virtual browser technology. Users share a single browser instance running in the cloud, streaming the display to all participants via WebRTC.

### Key Benefits
- ✅ **Universal Compatibility** - Works with ANY website or streaming service
- ✅ **Zero Client-Side Sync Issues** - Everyone sees the exact same pixels
- ✅ **No Maintenance** - No need to update for platform changes
- ✅ **Full Control** - Complete browser functionality available
- ✅ **Cross-Platform** - Works on mobile and desktop

### Limitations
- ⚠️ **High Infrastructure Cost** - $200-2,000+/month at scale
- ⚠️ **Latency Sensitivity** - Requires low-latency infrastructure
- ⚠️ **Single Account** - One subscription shared by all viewers
- ⚠️ **Scaling Complexity** - Requires GPU-optimized VMs

---

## 📐 Architecture Overview

### Option A: Hyperbeam API Integration (Recommended)

**Hyperbeam** is a managed service that provides virtual browser infrastructure as an API. This is the fastest and most reliable path to market.

```
┌─────────────┐      WebRTC      ┌──────────────┐
│   Client    │ ◄──────────────► │  Hyperbeam   │
│  (Browser)  │                   │   Servers    │
└─────────────┘                   └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │   Virtual    │
                                  │   Browser    │
                                  │  (Chromium)  │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Streaming   │
                                  │   Services   │
                                  │ (Netflix etc)│
                                  └──────────────┘
```

### Option B: Self-Hosted Virtual Browser

Build your own infrastructure using open-source tools. Higher complexity but more control.

---

## 🔌 Hyperbeam API Integration

### 1. Architecture Components

```
movieroom-app/
├── server/
│   ├── hyperbeam/
│   │   ├── session-manager.js    # Manages Hyperbeam sessions
│   │   ├── api-client.js         # Hyperbeam API wrapper
│   │   └── webhooks.js           # Handles Hyperbeam events
│   └── server.js                 # Existing server (updated)
├── Src/
│   ├── components/
│   │   └── HyperbeamPlayer/
│   │       ├── HyperbeamPlayer.jsx    # Virtual browser embed
│   │       ├── HyperbeamPlayer.css
│   │       └── HyperbeamControls.jsx  # Custom overlay controls
│   └── pages/
│       └── WatchRoom/
│           └── WatchRoom.jsx     # Updated with Hyperbeam mode
└── .env                          # Add HYPERBEAM_API_KEY
```

### 2. Server-Side Implementation

#### Session Manager

```javascript
// server/hyperbeam/session-manager.js

const HyperbeamAPIClient = require('./api-client');

class HyperbeamSessionManager {
  constructor() {
    this.sessions = new Map(); // roomId -> sessionData
    this.client = new HyperbeamAPIClient(process.env.HYPERBEAM_API_KEY);
  }

  async createSession(roomId, startUrl = 'https://www.netflix.com') {
    try {
      // Create Hyperbeam session
      const session = await this.client.createSession({
        start_url: startUrl,
        kiosk: false, // Allow navigation
        offline_timeout: 60, // Seconds until auto-shutdown when no users
        webhook_url: `${process.env.SERVER_URL}/api/hyperbeam/webhook`,
        control_disable_default: false,
        width: 1280,
        height: 720,
        fps: 30
      });

      // Store session info
      this.sessions.set(roomId, {
        sessionId: session.session_id,
        embedUrl: session.embed_url,
        adminToken: session.admin_token,
        createdAt: new Date(),
        activeUsers: 0
      });

      console.log(`✅ Hyperbeam session created for room ${roomId}`);
      return session;
    } catch (error) {
      console.error('❌ Failed to create Hyperbeam session:', error);
      throw error;
    }
  }

  async terminateSession(roomId) {
    const session = this.sessions.get(roomId);
    if (!session) return;

    try {
      await this.client.terminateSession(session.sessionId, session.adminToken);
      this.sessions.delete(roomId);
      console.log(`🗑️ Hyperbeam session terminated for room ${roomId}`);
    } catch (error) {
      console.error('❌ Failed to terminate Hyperbeam session:', error);
    }
  }

  getSession(roomId) {
    return this.sessions.get(roomId);
  }

  incrementUserCount(roomId) {
    const session = this.sessions.get(roomId);
    if (session) {
      session.activeUsers++;
    }
  }

  decrementUserCount(roomId) {
    const session = this.sessions.get(roomId);
    if (session) {
      session.activeUsers--;
      
      // Auto-terminate if no users
      if (session.activeUsers <= 0) {
        setTimeout(() => {
          if (this.sessions.get(roomId)?.activeUsers <= 0) {
            this.terminateSession(roomId);
          }
        }, 30000); // 30 second grace period
      }
    }
  }
}

module.exports = new HyperbeamSessionManager();
```

#### API Client

```javascript
// server/hyperbeam/api-client.js

const axios = require('axios');

class HyperbeamAPIClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://engine.hyperbeam.com/v0';
  }

  async createSession(options) {
    const response = await axios.post(
      `${this.baseUrl}/vm`,
      options,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  }

  async terminateSession(sessionId, adminToken) {
    await axios.delete(
      `${this.baseUrl}/vm/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      }
    );
  }

  async getSessionInfo(sessionId) {
    const response = await axios.get(
      `${this.baseUrl}/vm/${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );
    return response.data;
  }
}

module.exports = HyperbeamAPIClient;
```

#### Server Integration

```javascript
// server/server.js - Add these endpoints

const hyperbeamManager = require('./hyperbeam/session-manager');

// Create room with Hyperbeam session
app.post('/api/rooms/create', async (req, res) => {
  const { movieLink, roomName, isPrivate, password, genreTag, posterImage, useHyperbeam } = req.body;
  
  const newRoomId = generateRoomId();
  
  rooms[newRoomId] = {
    id: newRoomId,
    movieLink,
    name: roomName || 'Untitled Room',
    isPrivate: isPrivate || false,
    password: isPrivate ? password : null,
    genreTag: genreTag || 'General',
    posterImage: posterImage || null,
    users: new Set(),
    host: null,
    messages: [],
    reactions: [],
    syncTime: 0,
    isPlaying: false,
    useHyperbeam: useHyperbeam || false,
    hyperbeamSession: null,
    createdAt: new Date().toISOString()
  };

  // Create Hyperbeam session if requested
  if (useHyperbeam) {
    try {
      const session = await hyperbeamManager.createSession(newRoomId, movieLink);
      rooms[newRoomId].hyperbeamSession = {
        sessionId: session.session_id,
        embedUrl: session.embed_url
      };
    } catch (error) {
      console.error('Failed to create Hyperbeam session:', error);
      return res.status(500).json({ error: 'Failed to create virtual browser session' });
    }
  }
  
  console.log(`✅ Room created: ${newRoomId} - ${roomName} (Hyperbeam: ${useHyperbeam})`);
  res.status(201).json({ 
    success: true,
    roomId: newRoomId,
    room: rooms[newRoomId]
  });
});

// Webhook endpoint for Hyperbeam events
app.post('/api/hyperbeam/webhook', (req, res) => {
  const { event, session_id } = req.body;
  
  console.log(`📡 Hyperbeam webhook: ${event} for session ${session_id}`);
  
  // Handle events (session ended, user joined, etc.)
  if (event === 'session.ended') {
    // Find room with this session and clean up
    for (const [roomId, room] of Object.entries(rooms)) {
      if (room.hyperbeamSession?.sessionId === session_id) {
        console.log(`🗑️ Hyperbeam session ended for room ${roomId}`);
        delete room.hyperbeamSession;
      }
    }
  }
  
  res.status(200).json({ received: true });
});
```

### 3. Client-Side Implementation

#### Hyperbeam Player Component

```jsx
// Src/components/HyperbeamPlayer/HyperbeamPlayer.jsx

import React, { useEffect, useRef, useState } from 'react';
import './HyperbeamPlayer.css';

const HyperbeamPlayer = ({ embedUrl, onReady, onError }) => {
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!embedUrl) return;

    // Initialize Hyperbeam embed
    const iframe = document.createElement('iframe');
    iframe.src = embedUrl;
    iframe.allow = 'autoplay; clipboard-read; clipboard-write';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';

    // Handle load
    iframe.onload = () => {
      setIsLoading(false);
      if (onReady) onReady();
    };

    iframe.onerror = (error) => {
      console.error('Failed to load Hyperbeam:', error);
      if (onError) onError(error);
    };

    containerRef.current.appendChild(iframe);

    return () => {
      if (containerRef.current && iframe.parentNode) {
        containerRef.current.removeChild(iframe);
      }
    };
  }, [embedUrl, onReady, onError]);

  return (
    <div className="hyperbeam-player-container">
      {isLoading && (
        <div className="hyperbeam-loading">
          <div className="spinner"></div>
          <p>Loading virtual browser...</p>
        </div>
      )}
      <div ref={containerRef} className="hyperbeam-embed" />
      
      <div className="hyperbeam-info">
        <span className="hyperbeam-badge">🌐 Virtual Browser</span>
        <span className="hyperbeam-hint">
          Click to interact • First viewer controls the browser
        </span>
      </div>
    </div>
  );
};

export default HyperbeamPlayer;
```

#### Updated WatchRoom Integration

```jsx
// Src/pages/WatchRoom/WatchRoom.jsx - Add Hyperbeam mode

import HyperbeamPlayer from '../../components/HyperbeamPlayer/HyperbeamPlayer';

// In the render section:
<section className="video-section">
  {roomState?.useHyperbeam ? (
    <HyperbeamPlayer
      embedUrl={roomState.hyperbeamSession?.embedUrl}
      onReady={() => console.log('Hyperbeam ready')}
      onError={(err) => console.error('Hyperbeam error:', err)}
    />
  ) : roomState?.movieLink ? (
    <VideoPlayer
      url={roomState.movieLink}
      onProgress={handleVideoProgress}
      onPlay={handleVideoPlay}
      onPause={handleVideoPause}
      onSeek={handleVideoSeek}
      syncState={playerSyncState.current}
      isHost={isHost}
    />
  ) : (
    <div className="embedded-video-player">
      <p>Loading video...</p>
    </div>
  )}
</section>
```

---

## 💰 Cost Analysis

### Hyperbeam Pricing (2024 Estimates)

| Tier | Cost | Included | Best For |
|------|------|----------|----------|
| **Free** | $0 | 100 hours/month | Testing & MVP |
| **Starter** | $0.10/hour | Pay as you go | Early growth |
| **Pro** | $0.08/hour | Volume discounts | Scale |
| **Enterprise** | Custom | Dedicated infrastructure | High volume |

### Monthly Cost Projections

#### Scenario 1: MVP (100 active rooms/month)
- Average session: 2 hours
- Total hours: 200 hours/month
- **Cost: $20/month** (using Free tier)

#### Scenario 2: Growing (500 active rooms/month)
- Average session: 2 hours
- Total hours: 1,000 hours/month
- **Cost: $80-100/month**

#### Scenario 3: Popular (2,000 active rooms/month)
- Average session: 2 hours
- Total hours: 4,000 hours/month
- **Cost: $320-400/month**

#### Scenario 4: Scale (10,000 active rooms/month)
- Average session: 2 hours
- Total hours: 20,000 hours/month
- **Cost: $1,600-2,000/month**

### Cost Optimization Strategies

1. **Session Pooling** - Reuse sessions for multiple consecutive rooms
2. **Auto-Terminate** - Aggressive timeout when no users present
3. **Peak Hours** - Limit concurrent sessions during low-traffic hours
4. **User Limits** - Cap maximum concurrent sessions based on tier
5. **Hybrid Model** - Use Hyperbeam only for premium features

---

## 🏗️ Self-Hosted Alternative

For organizations wanting full control, here's a self-hosted architecture:

### Technology Stack
- **Headless Browser:** Chromium with `puppeteer`
- **Video Streaming:** FFmpeg + WebRTC (via `mediasoup`)
- **Screen Capture:** X11vnc or similar
- **Infrastructure:** Docker + GPU-optimized VMs

### Estimated Self-Hosted Costs

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| GPU VMs (4x) | $800-1,200 | g4dn.xlarge on AWS |
| Load Balancer | $20-40 | Application LB |
| Storage | $10-20 | Minimal |
| Bandwidth | $50-200 | Highly variable |
| **Total** | **$880-1,460** | Plus development time |

**Verdict:** Self-hosting is more expensive and complex. Only consider if:
- You need 10,000+ concurrent sessions
- You have specific compliance requirements
- You want to customize the browser experience heavily

---

## 🚀 Implementation Roadmap

### Phase 1: Integration Setup (Week 1)
- [ ] Sign up for Hyperbeam API access
- [ ] Set up development environment with API key
- [ ] Create basic session management endpoints
- [ ] Test session creation and termination

### Phase 2: MVP Implementation (Week 2-3)
- [ ] Build HyperbeamPlayer component
- [ ] Integrate with existing room creation flow
- [ ] Add "Virtual Browser" option to CreateRoomPage
- [ ] Test basic functionality

### Phase 3: Enhanced Features (Week 4-5)
- [ ] Add session health monitoring
- [ ] Implement auto-reconnect logic
- [ ] Build custom overlay controls
- [ ] Add session analytics

### Phase 4: Optimization (Week 6)
- [ ] Implement session pooling
- [ ] Add aggressive timeout policies
- [ ] Optimize for cost efficiency
- [ ] Load testing and performance tuning

### Phase 5: Polish & Launch (Week 7-8)
- [ ] User documentation for virtual browser mode
- [ ] Error handling and edge cases
- [ ] Monitor usage and costs
- [ ] Gradual rollout to users

---

## 📊 Comparison: Hyperbeam vs. Current Model

| Feature | Current Embed | Hyperbeam |
|---------|--------------|-----------|
| **Platform Support** | YouTube, Vimeo, DailyMotion | ANY website |
| **Netflix Support** | ❌ No | ✅ Yes |
| **Hulu Support** | ❌ No | ✅ Yes |
| **Setup Complexity** | Low | Medium |
| **Monthly Cost** | $20-50 | $20-2,000+ |
| **Sync Accuracy** | ~1-2 seconds | Perfect (same pixels) |
| **Mobile Support** | ✅ Yes | ✅ Yes |
| **Maintenance** | Low | Very Low |
| **Scalability** | High | Medium |

---

## 🔐 Security & Compliance

### Considerations
1. **Credential Handling** - Virtual browser has access to logged-in sessions
2. **Data Privacy** - Hyperbeam may log session activity
3. **Terms of Service** - Streaming services may prohibit this use
4. **DMCA Compliance** - Ensure proper content usage
5. **User Data** - Minimal data should be passed to Hyperbeam

### Recommended Safeguards
- Display clear warnings about session sharing
- Don't encourage password sharing
- Implement session recording opt-out
- Review Hyperbeam's privacy policy with users
- Have clear Terms of Service

---

## 📚 Resources

### Hyperbeam Documentation
- [Hyperbeam API Docs](https://www.hyperbeam.com/docs)
- [API Reference](https://www.hyperbeam.com/docs/api)
- [WebRTC Integration Guide](https://www.hyperbeam.com/docs/webrtc)

### Alternative Services
- **Whereby Embedded** - Video conferencing with screen share
- **Daily.co** - Similar to Whereby
- **Agora** - Real-time engagement platform

### Open Source Alternatives
- **Jitsi** - Self-hosted video conferencing
- **Big Blue Button** - Online learning platform with screen sharing
- **OBS + WebRTC** - Custom streaming solution

---

## 🎯 Recommendation

### For MovieRoom:

1. **Phase 1 (Current):** Perfect and scale the **Embed Model** (Strategy 3)
   - Low cost, proven technology
   - Supports most use cases
   - Already implemented

2. **Phase 2 (6 months):** Develop **Browser Extension** (Strategy 2)
   - Unlocks premium services
   - Moderate development effort
   - Low ongoing costs

3. **Phase 3 (12 months):** Offer **Hyperbeam as Premium** Feature
   - Position as "Premium Virtual Cinema"
   - Charge $5-10/month per user
   - Offset infrastructure costs
   - Ultimate fallback for any unsupported service

### Monetization Strategy
- **Free Tier:** Embed model only
- **Pro Tier ($4.99/mo):** Browser extension access
- **Premium Tier ($9.99/mo):** Hyperbeam virtual browser access
- **Group Plans:** Discounted rates for hosting frequent rooms

---

**Last Updated:** 2025-12-10
**Status:** Architecture Complete - Ready for Future Implementation