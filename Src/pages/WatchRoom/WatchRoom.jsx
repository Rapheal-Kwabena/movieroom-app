// src/pages/WatchRoom/WatchRoom.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import { useRoomSocket } from '../../hooks/useSocket';
import { getRoomInfo } from '../../utils/api';
import './WatchRoom.css';

const WatchRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    // State for user input
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
    const [roomInfo, setRoomInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // State for chat and UI
    const [newMessage, setNewMessage] = useState('');
    const [spoilerMode, setSpoilerMode] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHost, setIsHost] = useState(false);
    
    const chatLogRef = useRef(null);
    const playerSyncState = useRef({ currentTime: 0, isPlaying: false });
    
    // Socket connection (only initialized after authentication)
    const {
        socket,
        isConnected,
        isJoined,
        error,
        roomState,
        messages,
        reactions,
        users,
        sendMessage,
        sendReaction,
        syncMovieState,
        requestSync,
        createPoll,
        leaveRoom,
    } = useRoomSocket(
        isAuthModalOpen ? null : roomId,
        username,
        password
    );

    // Fetch room info on mount
    useEffect(() => {
        const fetchRoomInfo = async () => {
            try {
                const info = await getRoomInfo(roomId);
                setRoomInfo(info);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch room info:', err);
                setLoading(false);
                alert('Room not found!');
                navigate('/');
            }
        };

        fetchRoomInfo();
    }, [roomId, navigate]);

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (chatLogRef.current) {
            chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
        }
    }, [messages]);

    // Listen for movie state updates from other users
    useEffect(() => {
        if (!socket) return;

        const handleMovieStateUpdate = ({ currentTime: newTime, isPlaying: newIsPlaying }) => {
            console.log('🎬 Movie state updated:', { newTime, newIsPlaying });
            playerSyncState.current = { currentTime: newTime, isPlaying: newIsPlaying };
            setCurrentTime(newTime);
            setIsPlaying(newIsPlaying);
        };

        socket.on('movieStateUpdated', handleMovieStateUpdate);

        return () => {
            socket.off('movieStateUpdated', handleMovieStateUpdate);
        };
    }, [socket]);

    // Determine if user is host (first to join)
    useEffect(() => {
        if (users.length > 0 && users[0]?.username === username) {
            setIsHost(true);
        }
    }, [users, username]);

    // Handle authentication (join room)
    const handleJoinRoom = () => {
        if (!username.trim()) {
            alert('Please enter a username');
            return;
        }

        if (roomInfo?.isPrivate && !password.trim()) {
            alert('This room requires a password');
            return;
        }

        setIsAuthModalOpen(false);
    };

    // Handle sending messages
    const handleSendMessage = () => {
        if (newMessage.trim() && isJoined) {
            sendMessage(newMessage);
            setNewMessage('');
        }
    };

    // Handle emoji reactions
    const handleEmojiReaction = (emoji) => {
        if (isJoined) {
            // Send reaction with current video timestamp
            sendReaction(emoji, Math.floor(currentTime));
        }
    };

    // Video Player Callbacks (Host only)
    const handleVideoProgress = (playedSeconds) => {
        setCurrentTime(playedSeconds);
        if (isHost) {
            // Broadcast progress periodically (every 2 seconds)
            const now = Date.now();
            if (!window.lastProgressBroadcast || now - window.lastProgressBroadcast > 2000) {
                syncMovieState(playedSeconds, isPlaying);
                window.lastProgressBroadcast = now;
            }
        }
    };

    const handleVideoPlay = (time) => {
        if (isHost) {
            syncMovieState(time, true);
            setIsPlaying(true);
        }
    };

    const handleVideoPause = (time) => {
        if (isHost) {
            syncMovieState(time, false);
            setIsPlaying(false);
        }
    };

    const handleVideoSeek = (time) => {
        if (isHost) {
            syncMovieState(time, isPlaying);
            setCurrentTime(time);
        }
    };

    // Handle sync button (for non-hosts to request sync)
    const handleStartSync = () => {
        if (isJoined) {
            requestSync();
            alert('Requesting sync from host...');
        }
    };

    // Handle creating poll
    const handleCreatePoll = () => {
        const question = prompt('Enter poll question:');
        if (question) {
            const optionsInput = prompt('Enter options (comma-separated):');
            if (optionsInput) {
                const options = optionsInput.split(',').map(o => o.trim());
                createPoll(question, options);
            }
        }
    };

    // Handle exit room
    const handleExitRoom = () => {
        if (confirm('Are you sure you want to leave the room?')) {
            leaveRoom();
            navigate('/');
        }
    };

    // Handle invite (copy link)
    const handleInvite = () => {
        const link = window.location.href;
        navigator.clipboard.writeText(link);
        alert('Room link copied to clipboard!');
    };

    // Show loading state
    if (loading) {
        return (
            <div className="watch-room-container loading-state">
                <h2>Loading room...</h2>
            </div>
        );
    }

    // Show authentication modal
    if (isAuthModalOpen) {
        return (
            <div className="watch-room-container auth-modal-container">
                <div className="auth-modal">
                    <h2>Join Room: {roomInfo?.name}</h2>
                    <p className="room-info">
                        {roomInfo?.isPrivate ? '🔐 Private Room' : '🌍 Public Room'}
                    </p>
                    <p className="room-info">
                        👥 {roomInfo?.userCount || 0} watching
                    </p>
                    
                    <input
                        type="text"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input"
                        onKeyPress={(e) => e.key === 'Enter' && !roomInfo?.isPrivate && handleJoinRoom()}
                    />
                    
                    {roomInfo?.isPrivate && (
                        <input
                            type="password"
                            placeholder="Enter room password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="auth-input"
                            onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
                        />
                    )}
                    
                    <Button onClick={handleJoinRoom}>
                        Join Room
                    </Button>
                    
                    <button className="cancel-btn" onClick={() => navigate('/')}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="watch-room-container error-state">
                <h2>Error: {error}</h2>
                <Button onClick={() => navigate('/')}>Go Home</Button>
            </div>
        );
    }

    // Show connecting state
    if (!isConnected || !isJoined) {
        return (
            <div className="watch-room-container connecting-state">
                <h2>Connecting to room...</h2>
                <div className="spinner"></div>
            </div>
        );
    }

    // Main room interface
    return (
        <main className="watch-room-container">
            {/* Header: Title, Invite, Exit */}
            <header className="watch-room-header">
                <h2>{roomState?.roomName || 'Movie Room'}</h2>
                <div className="user-count">👥 {users.length} watching</div>
                <div className="header-actions">
                    <Button variant="secondary" onClick={handleInvite}>
                        Invite 🔗
                    </Button>
                    <Button variant="secondary" className="exit-btn" onClick={handleExitRoom}>
                        Exit ❌
                    </Button>
                </div>
            </header>

            {/* Main Layout: Video Player + Chat Panel */}
            <div className="content-grid">
                {/* 1. Video Player & Timeline (Large Pane) */}
                <section className="video-section">
                    {roomState?.movieLink ? (
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

                    <div className="reaction-timeline-bar">
                        <span className="timeline-label">🟢 Reactions:</span>
                        {reactions.slice(-10).map((reaction, index) => (
                            <span 
                                key={reaction.id || index} 
                                className="timeline-reaction"
                                title={`${reaction.username} at ${reaction.timestamp}s`}
                            >
                                {reaction.emoji} {reaction.timestamp}s
                            </span>
                        ))}
                    </div>
                </section>

                {/* 2. Chat Panel (Right Side) */}
                <section className="chat-panel">
                    <div className="chat-log" ref={chatLogRef}>
                        {messages.map((msg, index) => (
                            <div key={msg.id || index} className="chat-message">
                                <span className={`chat-user ${msg.username === username ? 'self' : ''}`}>
                                    {msg.username}:
                                </span> 
                                <span className="chat-text">
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                        {messages.length === 0 && (
                            <p className="no-messages">No messages yet. Start chatting!</p>
                        )}
                    </div>

                    {/* Chat Input and Emoji Row */}
                    <div className="chat-input-row">
                        <input
                            type="text"
                            placeholder="Type Message"
                            className="chat-input"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        {/* Quick Emoji Buttons */}
                        <div className="quick-emojis">
                            {['😆', '😭', '😱', '🔥', '😂'].map(emoji => (
                                <button 
                                    key={emoji} 
                                    className="emoji-btn" 
                                    onClick={() => handleEmojiReaction(emoji)}
                                    title={`React with ${emoji}`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA Row: Sync, Poll, Pin, Spoilers */}
                    <div className="cta-row">
                        <Button 
                            variant="secondary" 
                            className="cta-small-btn"
                            onClick={handleStartSync}
                        >
                            ⏱ Start Sync
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="cta-small-btn"
                            onClick={handleCreatePoll}
                        >
                            🗳 Create Poll
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="cta-small-btn"
                            disabled
                            title="Coming soon"
                        >
                            📌 Pin Message
                        </Button>
                        <Button 
                            variant={spoilerMode ? 'pop-red' : 'secondary'} 
                            className="cta-small-btn"
                            onClick={() => setSpoilerMode(!spoilerMode)}
                        >
                            🚫 Spoilers {spoilerMode ? 'ON' : 'OFF'}
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default WatchRoom;