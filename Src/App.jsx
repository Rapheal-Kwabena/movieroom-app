import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Import all your page components
import LandingPage from './pages/LandingPage/LandingPage';
import CreateRoomPage from './pages/CreateRoomPage/CreateRoomPage';
import WatchRoom from './pages/WatchRoom/WatchRoom';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import ExplorePage from './pages/ExplorePage/ExplorePage';
import SignInPage from './pages/SignInPage/SignInPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

function App() {
  return (
    <Routes>
      {/* 1. Landing Page (Home) */}
      <Route path="/" element={<LandingPage />} />

      {/* 2. Explore Public Rooms */}
      <Route path="/explore" element={<ExplorePage />} />

      {/* 3. Sign In / Sign Up */}
      <Route path="/signin" element={<SignInPage />} />

      {/* 4. Create Room Page */}
      <Route path="/create" element={<CreateRoomPage />} />

      {/* 5. Watch Room Interface
          :roomId is a URL parameter to identify the specific room
      */}
      <Route path="/room/:roomId" element={<WatchRoom />} />

      {/* 6. Profile Page (Phase 2 feature) */}
      <Route path="/profile" element={<ProfilePage />} />

      {/* 404 Not Found Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;