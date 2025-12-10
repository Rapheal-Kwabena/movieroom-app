// src/pages/LandingPage/LandingPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import './LandingPage.css';

// Placeholder Component for Trending Carousel (Saves space)
const TrendingRooms = () => (
    <div className="trending-rooms">
        <h2>🔥 Trending Rooms</h2>
        <div className="carousel-container">
            {[1, 2, 3].map(i => (
                <div key={i} className="poster-card">
                    Poster {i}
                    <div className="hover-info">
                        <p>345 Watching</p>
                        <Button variant="secondary">Join</Button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Placeholder Component for Features Strip (Saves space)
const FeaturesStrip = () => (
    <div className="features-strip container">
        <div className="feature-item">💬 Live Chat</div>
        <div className="feature-item">⏱ Sync Start</div>
        <div className="feature-item">😱 Reaction Timeline</div>
        <div className="feature-item">🚫 Spoiler Mode</div>
        <div className="feature-item">🔐 Private Rooms</div>
    </div>
);

const LandingPage = () => {
    const [movieLink, setMovieLink] = useState('');
    const navigate = useNavigate();

    const handleCreateRoom = () => {
        if (!movieLink.trim()) {
            alert('Please paste a movie link to create a room.');
            return;
        }
        // Navigate to Create page, passing the movie link in state
        navigate('/create', { state: { initialLink: movieLink } });
    };

    return (
        <>
            <Navbar />
            <main className="landing-page-content">
                <section className="hero-section container">
                    <h1>Watch Together. No Distance. No Silence.</h1>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Paste Movie Link Here"
                            className="dark-input"
                            value={movieLink}
                            onChange={(e) => setMovieLink(e.target.value)}
                        />
                        <Button onClick={handleCreateRoom}>
                            Create Room
                        </Button>
                    </div>
                </section>
                
                <TrendingRooms />
                <FeaturesStrip />
                
                {/* Minimal Footer placeholder */}
                <footer className="footer">
                    Terms · Support · Social Icons
                </footer>
            </main>
        </>
    );
};

export default LandingPage;