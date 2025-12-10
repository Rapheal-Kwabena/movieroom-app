// src/pages/ProfilePage/ProfilePage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import './ProfilePage.css';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        username: 'MovieLover123',
        avatar: '🎬',
        bio: 'Movie Lover | Thriller Addict',
        joinedDate: 'December 2024',
        watchHistory: [
            { id: 1, roomName: 'Horror Night', movieTitle: 'The Conjuring', date: '2024-12-08' },
            { id: 2, roomName: 'Comedy Friday', movieTitle: 'Superbad', date: '2024-12-05' },
            { id: 3, roomName: 'Thriller Thursday', movieTitle: 'Se7en', date: '2024-12-01' },
        ],
        favoriteRooms: [
            { id: 1, name: 'Horror Nights', genre: 'Horror', members: 234 },
            { id: 2, name: 'Rom-Com Central', genre: 'Romance', members: 156 },
        ],
        badges: [
            { id: 1, name: 'Horror Lover', icon: '👻', description: 'Watched 10+ horror movies' },
            { id: 2, name: 'All-Night Binger', icon: '🌙', description: 'Watched movies past midnight 5 times' },
            { id: 3, name: 'Super-Commenter', icon: '💬', description: 'Sent 500+ chat messages' },
        ],
        friends: [
            { id: 1, username: 'FilmFanatic', avatar: '🎥' },
            { id: 2, username: 'CinemaKing', avatar: '👑' },
            { id: 3, username: 'MovieBuff', avatar: '🍿' },
        ]
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        username: user.username,
        bio: user.bio,
    });

    const handleEditToggle = () => {
        if (isEditing) {
            // Save changes
            setUser({ ...user, username: editData.username, bio: editData.bio });
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    return (
        <>
            <Navbar />
            <main className="profile-page-content container">
                <div className="profile-header">
                    <div className="profile-avatar-section">
                        <div className="profile-avatar-large">{user.avatar}</div>
                        <div className="profile-info">
                            {isEditing ? (
                                <input
                                    type="text"
                                    name="username"
                                    value={editData.username}
                                    onChange={handleInputChange}
                                    className="edit-input"
                                />
                            ) : (
                                <h1>{user.username}</h1>
                            )}
                            {isEditing ? (
                                <textarea
                                    name="bio"
                                    value={editData.bio}
                                    onChange={handleInputChange}
                                    className="edit-textarea"
                                />
                            ) : (
                                <p className="user-bio">{user.bio}</p>
                            )}
                            <p className="joined-date">Joined {user.joinedDate}</p>
                        </div>
                    </div>
                    <Button onClick={handleEditToggle}>
                        {isEditing ? 'Save Profile' : 'Edit Profile'}
                    </Button>
                </div>

                <div className="profile-content-grid">
                    {/* Watch History Section */}
                    <section className="profile-section">
                        <h2>📽️ Watch History</h2>
                        <div className="history-list">
                            {user.watchHistory.map(item => (
                                <div key={item.id} className="history-item">
                                    <div className="history-info">
                                        <h3>{item.movieTitle}</h3>
                                        <p className="room-name">{item.roomName}</p>
                                    </div>
                                    <span className="history-date">{item.date}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Favorite Rooms Section */}
                    <section className="profile-section">
                        <h2>❤️ Favorite Rooms</h2>
                        <div className="favorites-list">
                            {user.favoriteRooms.map(room => (
                                <div key={room.id} className="favorite-item">
                                    <div className="favorite-info">
                                        <h3>{room.name}</h3>
                                        <p className="genre-tag">{room.genre}</p>
                                    </div>
                                    <span className="members-count">👥 {room.members}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Badges Section */}
                    <section className="profile-section">
                        <h2>🏆 Badges Earned</h2>
                        <div className="badges-grid">
                            {user.badges.map(badge => (
                                <div key={badge.id} className="badge-item" title={badge.description}>
                                    <div className="badge-icon">{badge.icon}</div>
                                    <p className="badge-name">{badge.name}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Friends Section */}
                    <section className="profile-section">
                        <h2>👥 Friends</h2>
                        <div className="friends-list">
                            {user.friends.map(friend => (
                                <div key={friend.id} className="friend-item">
                                    <div className="friend-avatar">{friend.avatar}</div>
                                    <p className="friend-name">{friend.username}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Settings & Logout */}
                <div className="profile-actions">
                    <button className="settings-btn" onClick={() => alert('Settings coming soon!')}>
                        ⚙️ Settings
                    </button>
                    <button className="logout-btn" onClick={() => {
                        if (confirm('Are you sure you want to logout?')) {
                            navigate('/');
                        }
                    }}>
                        🚪 Logout
                    </button>
                </div>
            </main>
        </>
    );
};

export default ProfilePage;