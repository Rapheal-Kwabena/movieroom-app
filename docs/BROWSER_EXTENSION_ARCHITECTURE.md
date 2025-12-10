# MovieRoom Browser Extension Architecture
## Strategy 2: The "Teleparty" Model

> **Goal:** Enable synchronized watching on premium streaming services (Netflix, Hulu, Disney+, HBO Max) without requiring a virtual browser infrastructure.

---

## 🎯 Overview

This architecture enables MovieRoom to support premium streaming services by injecting synchronization logic directly into streaming service pages via a browser extension. This approach achieves the "Teleparty" model with minimal infrastructure costs.

### Key Benefits
- ✅ **Low Infrastructure Cost** - Leverages user's own accounts and connections
- ✅ **Native Quality** - Full HD/4K streaming from user's own subscription
- ✅ **Wide Platform Support** - Can support any streaming service
- ✅ **No Video Hosting** - No bandwidth or storage costs

### Limitations
- ⚠️ **Desktop Only** - Browser extensions don't work on mobile
- ⚠️ **Maintenance Required** - Must update when streaming sites change
- ⚠️ **Account Required** - Each user needs their own subscription

---

## 📐 Architecture Components

### 1. Browser Extension Structure

```
movieroom-extension/
├── manifest.json          # Extension configuration
├── background.js          # Service worker for socket connection
├── content/
│   ├── netflix.js        # Netflix-specific injection
│   ├── hulu.js          # Hulu-specific injection
│   ├── disney.js        # Disney+-specific injection
│   ├── hbo.js           # HBO Max-specific injection
│   └── generic.js       # Generic video element handler
├── popup/
│   ├── popup.html       # Extension popup UI
│   ├── popup.js         # Popup logic
│   └── popup.css        # Popup styling
├── icons/
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── utils/
    ├── socket-client.js  # Socket.io client wrapper
    └── dom-utils.js      # DOM manipulation utilities
```

### 2. Core Components

#### **Background Script (Service Worker)**
- Maintains persistent Socket.io connection to MovieRoom server
- Manages room state across all tabs
- Handles authentication and session management
- Broadcasts events between content scripts and server

#### **Content Scripts**
- Injected into streaming service pages
- Detects and controls native video players
- Listens for video events (play, pause, seek, timeupdate)
- Applies sync commands from host

#### **Popup UI**
- Shows current room status
- Allows creating/joining rooms
- Displays connected users
- Provides quick controls

---

## 🔌 Technical Implementation

### Manifest V3 Configuration

```json
{
  "manifest_version": 3,
  "name": "MovieRoom Extension",
  "version": "1.0.0",
  "description": "Watch together on Netflix, Hulu, Disney+, and more",
  "permissions": [
    "storage",
    "tabs",
    "activeTab"
  ],
  "host_permissions": [
    "https://www.netflix.com/*",
    "https://www.hulu.com/*",
    "https://www.disneyplus.com/*",
    "https://play.hbomax.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://www.netflix.com/*"],
      "js": ["content/netflix.js"],
      "run_at": "document_idle"
    },
    {
      "matches": ["https://www.hulu.com/*"],
      "js": ["content/hulu.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "icons/icon-16.png",
      "48": "icons/icon-48.png",
      "128": "icons/icon-128.png"
    }
  }
}
```

### Video Player Detection & Control

#### Netflix Implementation Example

```javascript
// content/netflix.js

class NetflixSync {
  constructor() {
    this.player = null;
    this.isHost = false;
    this.isSyncing = false;
    this.detectPlayer();
  }

  detectPlayer() {
    // Netflix uses a custom video player
    const checkPlayer = setInterval(() => {
      const videoPlayer = netflix.appContext.state.playerApp.getAPI().videoPlayer;
      const sessionId = videoPlayer.getAllPlayerSessionIds()[0];
      
      if (sessionId) {
        this.player = videoPlayer.getVideoPlayerBySessionId(sessionId);
        clearInterval(checkPlayer);
        this.attachListeners();
        console.log('✅ Netflix player detected');
      }
    }, 500);
  }

  attachListeners() {
    // Listen for native player events
    this.player.addEventListener('playing', () => {
      if (this.isHost && !this.isSyncing) {
        const currentTime = this.player.getCurrentTime() / 1000;
        this.sendSync({ action: 'play', time: currentTime });
      }
    });

    this.player.addEventListener('pause', () => {
      if (this.isHost && !this.isSyncing) {
        const currentTime = this.player.getCurrentTime() / 1000;
        this.sendSync({ action: 'pause', time: currentTime });
      }
    });

    this.player.addEventListener('seeked', () => {
      if (this.isHost && !this.isSyncing) {
        const currentTime = this.player.getCurrentTime() / 1000;
        this.sendSync({ action: 'seek', time: currentTime });
      }
    });
  }

  sendSync(data) {
    // Send to background script via message passing
    chrome.runtime.sendMessage({
      type: 'SYNC_VIDEO',
      data: data
    });
  }

  applySync(command) {
    this.isSyncing = true;
    
    switch(command.action) {
      case 'play':
        this.player.seek(command.time * 1000);
        this.player.play();
        break;
      case 'pause':
        this.player.seek(command.time * 1000);
        this.player.pause();
        break;
      case 'seek':
        this.player.seek(command.time * 1000);
        break;
    }

    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }
}

// Initialize
const netflixSync = new NetflixSync();

// Listen for sync commands from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'APPLY_SYNC') {
    netflixSync.applySync(message.data);
  } else if (message.type === 'SET_HOST') {
    netflixSync.isHost = message.isHost;
  }
});
```

#### Generic Video Element Handler

```javascript
// content/generic.js

class GenericVideoSync {
  constructor() {
    this.video = null;
    this.isHost = false;
    this.isSyncing = false;
    this.findVideoElement();
  }

  findVideoElement() {
    // Find <video> element on page
    const findVideo = setInterval(() => {
      const videos = document.querySelectorAll('video');
      if (videos.length > 0) {
        this.video = videos[0]; // Use first video element
        clearInterval(findVideo);
        this.attachListeners();
        console.log('✅ Video element detected');
      }
    }, 500);
  }

  attachListeners() {
    this.video.addEventListener('play', () => {
      if (this.isHost && !this.isSyncing) {
        this.sendSync({ action: 'play', time: this.video.currentTime });
      }
    });

    this.video.addEventListener('pause', () => {
      if (this.isHost && !this.isSyncing) {
        this.sendSync({ action: 'pause', time: this.video.currentTime });
      }
    });

    this.video.addEventListener('seeked', () => {
      if (this.isHost && !this.isSyncing) {
        this.sendSync({ action: 'seek', time: this.video.currentTime });
      }
    });
  }

  sendSync(data) {
    chrome.runtime.sendMessage({
      type: 'SYNC_VIDEO',
      data: data
    });
  }

  applySync(command) {
    this.isSyncing = true;
    
    this.video.currentTime = command.time;
    
    if (command.action === 'play') {
      this.video.play();
    } else if (command.action === 'pause') {
      this.video.pause();
    }

    setTimeout(() => {
      this.isSyncing = false;
    }, 1000);
  }
}
```

### Background Service Worker

```javascript
// background.js

import io from 'socket.io-client';

class MovieRoomExtension {
  constructor() {
    this.socket = null;
    this.currentRoom = null;
    this.isHost = false;
  }

  connect(serverUrl = 'http://localhost:4000') {
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to MovieRoom server');
    });

    this.socket.on('roomState', (state) => {
      this.currentRoom = state.roomId;
      this.isHost = state.isHost;
      
      // Notify content script
      this.broadcastToContentScripts({
        type: 'SET_HOST',
        isHost: this.isHost
      });
    });

    this.socket.on('movieStateUpdated', (data) => {
      // Forward sync command to content script
      this.broadcastToContentScripts({
        type: 'APPLY_SYNC',
        data: {
          action: data.isPlaying ? 'play' : 'pause',
          time: data.currentTime
        }
      });
    });
  }

  joinRoom(roomId, username, password) {
    this.socket.emit('joinRoom', { roomId, username, password });
  }

  syncVideo(data) {
    if (this.isHost && this.currentRoom) {
      this.socket.emit('syncMovieState', {
        roomId: this.currentRoom,
        currentTime: data.time,
        isPlaying: data.action === 'play'
      });
    }
  }

  broadcastToContentScripts(message) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Tab doesn't have content script
        });
      });
    });
  }
}

const extension = new MovieRoomExtension();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SYNC_VIDEO') {
    extension.syncVideo(message.data);
  }
});
```

---

## 🚀 Implementation Phases

### Phase 1: Core Extension (Week 1-2)
- [ ] Set up extension project structure
- [ ] Implement background service worker with Socket.io
- [ ] Create popup UI for room management
- [ ] Build generic video element detector

### Phase 2: Netflix Support (Week 3)
- [ ] Research Netflix player API
- [ ] Implement Netflix-specific content script
- [ ] Test synchronization on Netflix
- [ ] Handle edge cases (loading, buffering)

### Phase 3: Additional Services (Week 4-6)
- [ ] Add Hulu support
- [ ] Add Disney+ support
- [ ] Add HBO Max support
- [ ] Add Amazon Prime Video support

### Phase 4: Polish & Distribution (Week 7-8)
- [ ] Create Chrome Web Store listing
- [ ] Add Firefox support (port to Firefox extension)
- [ ] Write user documentation
- [ ] Submit for review

---

## 🔧 Technical Challenges & Solutions

### Challenge 1: Platform-Specific Player APIs
**Problem:** Each streaming service uses different player implementations.

**Solution:**
- Maintain separate content scripts per platform
- Use platform detection to load appropriate script
- Fallback to generic `<video>` element handling

### Challenge 2: DRM & Content Protection
**Problem:** Streaming services actively block automation and DOM manipulation.

**Solution:**
- Only interact with public player APIs
- Don't attempt to bypass DRM or security
- Focus on controlling existing functionality user already has access to

### Challenge 3: Extension Updates When Sites Change
**Problem:** Streaming sites update frequently, breaking integrations.

**Solution:**
- Use resilient selectors and API detection
- Implement automatic fallback mechanisms
- Set up monitoring to detect breakage quickly
- Maintain version-specific adapters

### Challenge 4: Cross-Browser Compatibility
**Problem:** Chrome, Firefox, Safari use different extension APIs.

**Solution:**
- Build for Manifest V3 (Chrome/Edge)
- Use WebExtension Polyfill for Firefox
- Safari requires separate conversion process

---

## 📊 Cost Analysis

| Component | Cost | Notes |
|-----------|------|-------|
| **Development** | $0 (Internal) | 6-8 weeks development time |
| **Server Infrastructure** | ~$20-50/month | Existing Socket.io server handles this |
| **Chrome Web Store Fee** | $5 (one-time) | Developer registration |
| **Maintenance** | Ongoing | ~4-8 hours/month for updates |
| **Total Monthly** | **~$20-50** | Scales with existing backend |

### Comparison to Alternatives
- **Teleparty (Free):** Our implementation costs similar
- **Virtual Browser (Hyperbeam):** Would cost $2,000-10,000/month
- **Current Embed Model:** $20-50/month (our current solution)

---

## 🎯 Success Metrics

### User Metrics
- Extension installs and active users
- Rooms created per day
- Average session duration
- User retention rate

### Technical Metrics
- Sync accuracy (< 1 second drift)
- Connection stability (> 95% uptime)
- Platform compatibility (support 4+ services)
- Update frequency (breaking changes < 1/month)

---

## 📚 Resources

### Similar Extensions to Study
- [Teleparty](https://www.teleparty.com/) - Market leader
- [Scener](https://scener.com/) - Alternative implementation
- [Twoseven](https://twoseven.xyz/) - Multi-platform support

### Development Tools
- Chrome Extension Developer Guide
- Socket.io Client Documentation
- Browser DevTools for content script debugging
- Extension Manifest V3 Migration Guide

### Platform Documentation
- Netflix Player API (unofficial, reverse-engineered)
- Hulu Video Player Documentation
- Generic HTML5 Video Element API

---

## 🔐 Security & Privacy Considerations

1. **No Credential Storage** - Never store user passwords or cookies
2. **Minimal Permissions** - Only request necessary permissions
3. **Transparent Data** - Clearly document what data is collected
4. **Open Source** - Consider open-sourcing for transparency
5. **Terms Compliance** - Ensure compliance with streaming service ToS

---

## 📝 Next Steps

1. **Proof of Concept** - Build basic Chrome extension with Netflix support
2. **User Testing** - Test with small group of users
3. **Legal Review** - Ensure compliance with streaming service terms
4. **Scale Development** - Add support for additional platforms
5. **Distribution** - Submit to Chrome Web Store and Firefox Add-ons

---

**Last Updated:** 2025-12-10
**Status:** Architecture Complete - Ready for Implementation