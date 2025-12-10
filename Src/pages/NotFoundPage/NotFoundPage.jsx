// src/pages/NotFoundPage/NotFoundPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button';
import './NotFoundPage.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <div className="not-found-content">
                <div className="error-code">404</div>
                <h1>Page Not Found</h1>
                <p className="error-message">
                    Oops! The page you're looking for doesn't exist.
                    <br />
                    It might have been moved or deleted.
                </p>
                
                <div className="not-found-illustration">
                    🎬🍿❓
                </div>

                <div className="not-found-actions">
                    <Button onClick={() => navigate('/')}>
                        Go Home
                    </Button>
                    <Button variant="secondary" onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                </div>

                <div className="quick-links">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/">🏠 Home</a></li>
                        <li><a href="/explore">🔍 Explore Rooms</a></li>
                        <li><a href="/create">➕ Create Room</a></li>
                        <li><a href="/profile">👤 Profile</a></li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;