// src/pages/ExplorePage/ExplorePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import { getPublicRooms } from '../../utils/api';
import './ExplorePage.css';

const ExplorePage = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, Action, Horror, etc.

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const publicRooms = await getPublicRooms();
            setRooms(publicRooms);
            setError(null);
        } catch (err) {
            console.error('Error fetching rooms:', err);
            setError('Failed to load rooms. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredRooms = filter === 'all' 
        ? rooms 
        : rooms.filter(room => room.genreTag === filter);

    const handleJoinRoom = (roomId) => {
        navigate(`/room/${roomId}`);
    };

    const genres = ['all', 'Action', 'Horror', 'Drama', 'Romance', 'Comedy', 'Thriller'];

    return (
        <>
            <Navbar />
            <main className="explore-page-content container">
                <div className="explore-header">
                    <h1>🔥 Explore Public Rooms</h1>
                    <p className="explore-subtitle">
                        Join others watching movies right now
                    </p>
                </div>

                {/* Genre Filter */}
                <div className="genre-filter">
                    {genres.map(genre => (
                        <button
                            key={genre}
                            className={`filter-btn ${filter === genre ? 'active' : ''}`}
                            onClick={() => setFilter(genre)}
                        >
                            {genre === 'all' ? '🎬 All' : genre}
                        </button>
                    ))}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Loading rooms...</p>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="error-container">
                        <p className="error-text">⚠️ {error}</p>
                        <Button onClick={fetchRooms}>Retry</Button>
                    </div>
                )}

                {/* Rooms Grid */}
                {!loading && !error && (
                    <>
                        {filteredRooms.length === 0 ? (
                            <div className="no-rooms">
                                <h2>No rooms available</h2>
                                <p>Be the first to create a room!</p>
                                <Button onClick={() => navigate('/create')}>
                                    Create Room
                                </Button>
                            </div>
                        ) : (
                            <div className="rooms-grid">
                                {filteredRooms.map(room => (
                                    <div key={room.id} className="room-card">
                                        <div className="room-card-poster">
                                            {room.posterImage ? (
                                                <img src={room.posterImage} alt={room.name} />
                                            ) : (
                                                <div className="poster-placeholder">
                                                    🎬
                                                </div>
                                            )}
                                        </div>
                                        <div className="room-card-content">
                                            <h3 className="room-card-title">{room.name}</h3>
                                            <div className="room-card-meta">
                                                <span className="genre-badge">{room.genreTag}</span>
                                                <span className="user-count">
                                                    👥 {room.userCount} watching
                                                </span>
                                            </div>
                                            <p className="room-card-time">
                                                Created {new Date(room.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="room-card-actions">
                                            <Button onClick={() => handleJoinRoom(room.id)}>
                                                Join Room
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Refresh Button */}
                {!loading && !error && rooms.length > 0 && (
                    <div className="refresh-container">
                        <button className="refresh-btn" onClick={fetchRooms}>
                            🔄 Refresh Rooms
                        </button>
                    </div>
                )}
            </main>
        </>
    );
};

export default ExplorePage;