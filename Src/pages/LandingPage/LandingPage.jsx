// src/pages/LandingPage/LandingPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import './LandingPage.css';

// Enhanced Trending Rooms Component
const TrendingRooms = () => {
    const navigate = useNavigate();
    const sampleRooms = [
        { id: 1, title: 'Horror Night Marathon', watchers: 345, genre: 'Horror', emoji: '👻' },
        { id: 2, title: 'Action Movie Fest', watchers: 289, genre: 'Action', emoji: '💥' },
        { id: 3, title: 'Romantic Classics', watchers: 156, genre: 'Romance', emoji: '❤️' },
        { id: 4, title: 'Comedy Central', watchers: 412, genre: 'Comedy', emoji: '😂' },
    ];

    return (
        <div className="trending-rooms">
            <h2 className="section-title">🔥 Trending Rooms Right Now</h2>
            <div className="carousel-container">
                {sampleRooms.map(room => (
                    <div key={room.id} className="poster-card">
                        <div className="poster-emoji">{room.emoji}</div>
                        <div className="poster-content">
                            <span className="genre-tag">{room.genre}</span>
                            <h3>{room.title}</h3>
                        </div>
                        <div className="hover-info">
                            <p className="watchers-count">👥 {room.watchers} Watching</p>
                            <Button variant="secondary" onClick={() => navigate('/explore')}>
                                Join Room
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Enhanced Features Strip Component
const FeaturesStrip = () => {
    const features = [
        { icon: '💬', title: 'Live Chat', desc: 'Real-time messaging' },
        { icon: '⏱️', title: 'Perfect Sync', desc: 'Stay in sync' },
        { icon: '😱', title: 'Reactions', desc: 'Express emotions' },
        { icon: '🚫', title: 'Spoiler Mode', desc: 'No spoilers' },
        { icon: '🔐', title: 'Private Rooms', desc: 'Watch privately' },
    ];

    return (
        <div className="features-strip container">
            {features.map((feature, index) => (
                <div key={index} className="feature-item" data-aos="fade-up" data-aos-delay={index * 100}>
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-title">{feature.title}</div>
                    <div className="feature-desc">{feature.desc}</div>
                </div>
            ))}
        </div>
    );
};

const LandingPage = () => {
    const [movieLink, setMovieLink] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleCreateRoom = () => {
        if (!movieLink.trim()) {
            alert('Please paste a movie link to create a room.');
            return;
        }
        navigate('/create', { state: { initialLink: movieLink } });
    };

    const handleExploreRooms = () => {
        navigate('/explore');
    };

    return (
        <>
            <Navbar />
            <main className="landing-page-content">
                {/* Hero Section with Gradient Background */}
                <section className={`hero-section container ${isVisible ? 'fade-in' : ''}`}>
                    <div className="hero-badge">✨ Welcome to MovieRoom</div>
                    <h1 className="hero-title">
                        Watch Together.<br />
                        <span className="gradient-text">No Distance. No Silence.</span>
                    </h1>
                    <p className="hero-subtitle">
                        Experience movies with friends in perfect sync. Chat, react, and create memories together.
                    </p>
                    
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="🎬 Paste Movie Link Here (YouTube, Netflix, etc.)"
                            className="dark-input"
                            value={movieLink}
                            onChange={(e) => setMovieLink(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
                        />
                        <Button onClick={handleCreateRoom} className="create-btn-hero">
                            Create Room
                        </Button>
                    </div>

                    <div className="hero-cta-secondary">
                        <Button variant="secondary" onClick={handleExploreRooms}>
                            🔍 Explore Public Rooms
                        </Button>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="stats-section container">
                    <div className="stat-item">
                        <div className="stat-number">1000+</div>
                        <div className="stat-label">Active Rooms</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">50K+</div>
                        <div className="stat-label">Happy Viewers</div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-number">100%</div>
                        <div className="stat-label">Free to Use</div>
                    </div>
                </section>
                
                <TrendingRooms />
                <FeaturesStrip />
                
                {/* Call to Action Section */}
                <section className="cta-section container">
                    <h2>Ready to Start Watching?</h2>
                    <p>Create your room in seconds and invite your friends</p>
                    <Button onClick={() => navigate('/create')} className="cta-button">
                        Get Started Now
                    </Button>
                </section>
                
                {/* Footer */}
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>🎬 MovieRoom</h3>
                            <p>Watch together, anywhere</p>
                        </div>
                        <div className="footer-links">
                            <a href="#terms">Terms</a>
                            <a href="#privacy">Privacy</a>
                            <a href="#support">Support</a>
                            <a href="#about">About</a>
                        </div>
                        <div className="footer-social">
                            <span>Follow us:</span>
                            <a href="#twitter">🐦</a>
                            <a href="#facebook">📘</a>
                            <a href="#instagram">📷</a>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        © 2024 MovieRoom. Built with ❤️ for movie lovers.
                    </div>
                </footer>
            </main>
        </>
    );
};

export default LandingPage;