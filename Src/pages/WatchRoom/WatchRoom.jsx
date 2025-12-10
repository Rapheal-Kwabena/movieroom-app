// src/pages/WatchRoom/WatchRoom.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../components/UI/Button';
import VideoPlayer from '../../components/VideoPlayer/VideoPlayer';
import { useRoomSocket } from '../../hooks/useSocket';
import { getRoomInfo } from '../../utils/api';
import './WatchRoom.css';

// Constants
const MIN_USERNAME_LENGTH = 2;
const MAX_USERNAME_LENGTH = 20;
const SYNC_THROTTLE_MS = 2000;
const ERROR_DISPLAY_TIMEOUT = 5000;

const WatchRoom = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    
    // State for user input
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
    const [roomInfo, setRoomInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [validationError, setValidationError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for chat and UI
    const [newMessage, setNewMessage] = useState('');
    const [spoilerMode, setSpoilerMode] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    
    const chatLogRef = useRef(null);
    const [playerSyncState, setPlayerSyncState] = useState({ currentTime: 0, isPlaying: false });
    const lastProgressBroadcastRef = useRef(0);
    
    // Socket connection (only initialized after authentication)
    const {
        socket,
        isConnected,
        isJoined,
        isHost,
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
                setValidationError('Room not found!');
                setTimeout(() => navigate('/'), 2000);
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
            setPlayerSyncState({ currentTime: newTime, isPlaying: newIsPlaying });
            setCurrentTime(newTime);
            setIsPlaying(newIsPlaying);
        };

        socket.on('movieStateUpdated', handleMovieStateUpdate);

        return () => {
            socket.off('movieStateUpdated', handleMovieStateUpdate);
        };
    }, [socket]);

    // Clear validation error after timeout
    useEffect(() => {
        if (validationError) {
            const timer = setTimeout(() => setValidationError(''), ERROR_DISPLAY_TIMEOUT);
            return () => clearTimeout(timer);
        }
    }, [validationError]);

    // Validation function
    const validateUsername = useCallback((value) => {
        const trimmedValue = value.trim();
        
        if (!trimmedValue) {
            return 'Username is required';
        }
        
        if (trimmedValue.length < MIN_USERNAME_LENGTH) {
            return `Username must be at least ${MIN_USERNAME_LENGTH} characters`;
        }
        
        if (trimmedValue.length > MAX_USERNAME_LENGTH) {
            return `Username must not exceed ${MAX_USERNAME_LENGTH} characters`;
        }
        
        if (!/^[a-zA-Z0-9_-]+$/.test(trimmedValue)) {
            return 'Username can only contain letters, numbers, hyphens, and underscores';
        }
        
        return '';
    }, []);

    // Handle authentication (join room)
    const handleJoinRoom = useCallback(async () => {
        setValidationError('');
        
        const usernameError = validateUsername(username);
        if (usernameError) {
            setValidationError(usernameError);
            return;
        }

        if (roomInfo?.isPrivate && !password.trim()) {
            setValidationError('This room requires a password');
            return;
        }

        setIsSubmitting(true);
        
        // Simulate brief loading (in production, this would wait for actual connection)
        setTimeout(() => {
            setIsAuthModalOpen(false);
            setIsSubmitting(false);
        }, 300);
    }, [username, password, roomInfo, validateUsername]);

    // Handle sending messages
    const handleSendMessage = useCallback(() => {
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage && isJoined) {
            sendMessage(trimmedMessage);
            setNewMessage('');
        }
    }, [newMessage, isJoined, sendMessage]);

    // Handle emoji reactions
    const handleEmojiReaction = useCallback((emoji) => {
        if (isJoined) {
            sendReaction(emoji, Math.floor(currentTime));
        }
    }, [isJoined, currentTime, sendReaction]);

    // Video Player Callbacks (Host only)
    const handleVideoProgress = useCallback((playedSeconds) => {
        setCurrentTime(playedSeconds);
        // REMOVED: Continuous progress broadcasting - only sync on explicit actions
    }, []);

    const handleVideoPlay = useCallback((time) => {
        if (isHost) {
            syncMovieState(time, true);
            setIsPlaying(true);
        }
    }, [isHost, syncMovieState]);

    const handleVideoPause = useCallback((time) => {
        if (isHost) {
            syncMovieState(time, false);
            setIsPlaying(false);
        }
    }, [isHost, syncMovieState]);

    const handleVideoSeek = useCallback((time) => {
        if (isHost) {
            syncMovieState(time, isPlaying);
            setCurrentTime(time);
        }
    }, [isHost, isPlaying, syncMovieState]);

    // Handle sync button (for non-hosts to request sync)
    const handleStartSync = useCallback(() => {
        if (isJoined) {
            requestSync();
        }
    }, [isJoined, requestSync]);

    // Handle creating poll
    const handleCreatePoll = useCallback(() => {
        const question = prompt('Enter poll question:');
        if (question) {
            const optionsInput = prompt('Enter options (comma-separated):');
            if (optionsInput) {
                const options = optionsInput.split(',').map(o => o.trim()).filter(Boolean);
                if (options.length >= 2) {
                    createPoll(question, options);
                } else {
                    alert('Please provide at least 2 options');
                }
            }
        }
    }, [createPoll]);

    // Handle exit room
    const handleExitRoom = useCallback(() => {
        if (confirm('Are you sure you want to leave the room?')) {
            leaveRoom();
            navigate('/');
        }
    }, [leaveRoom, navigate]);

    // Handle invite (copy link with better UX)
    const handleInvite = useCallback(() => {
        const link = window.location.href;
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(link)
                .then(() => {
                    // Show success feedback
                    const btn = document.querySelector('.invite-btn');
                    if (btn) {
                        const originalText = btn.textContent;
                        btn.textContent = '✓ Copied!';
                        btn.style.backgroundColor = '#10b981';
                        setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.backgroundColor = '';
                        }, 2000);
                    }
                })
                .catch((err) => {
                    console.error('Failed to copy:', err);
                    // Fallback: show link in alert
                    prompt('Copy this link to invite others:', link);
                });
        } else {
            // Fallback for browsers without clipboard API
            prompt('Copy this link to invite others:', link);
        }
    }, []);

    // Handle keyboard events
    const handleKeyPress = useCallback((e, action) => {
        if (e.key === 'Enter') {
            action();
        }
    }, []);

    // Memoize emoji list
    const quickEmojis = useMemo(() => ['😆', '😭', '😱', '🔥', '😂'], []);

    // Show loading state
    if (loading) {
        return (
            <div className="watch-room-container loading-state">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 border-4 border-golden-accent border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-header">Loading room...</h2>
                </div>
            </div>
        );
    }

    // Show authentication modal
    if (isAuthModalOpen) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black-night via-slate-grey to-black-night flex items-center justify-center p-4">
                <div className="w-full max-w-lg bg-slate-grey/95 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-golden-accent/20 animate-fadeInUp relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-golden-accent/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-40 h-40 bg-pop-red/10 rounded-full blur-3xl"></div>
                    
                    {/* Header */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-golden-accent to-yellow-500 rounded-full mb-4 shadow-lg">
                            <span className="text-4xl">🎬</span>
                        </div>
                        <h2 className="text-4xl font-header font-bold text-white mb-3 tracking-tight">
                            {roomInfo?.name || 'Join Room'}
                        </h2>
                        
                        {/* Room Status Badges */}
                        <div className="flex items-center justify-center gap-3 mt-5">
                            <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 ${
                                roomInfo?.isPrivate
                                    ? 'bg-gradient-to-r from-pop-red/30 to-red-600/30 text-pop-red border-2 border-pop-red/40'
                                    : 'bg-gradient-to-r from-green-500/30 to-emerald-600/30 text-green-400 border-2 border-green-500/40'
                            }`}>
                                {roomInfo?.isPrivate ? '🔐 Private Room' : '🌍 Public Room'}
                            </span>
                        </div>
                        
                        <div className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-black-night/50 rounded-full border border-white/10">
                            <span className="text-2xl">👥</span>
                            <span className="text-lg font-bold text-golden-accent">{roomInfo?.userCount || 0}</span>
                            <span className="text-ash-silver text-sm">watching</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {validationError && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-pop-red/20 to-red-600/20 border-2 border-pop-red rounded-xl text-pop-red text-sm font-bold text-center animate-shake shadow-lg relative z-10">
                            <span className="text-xl mr-2">⚠️</span>
                            {validationError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleJoinRoom(); }} className="space-y-5 relative z-10">
                        {/* Username Input */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                                <span className="text-lg">👤</span>
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-5 py-4 bg-black-night/80 backdrop-blur-sm border-2 border-white/10 rounded-xl text-white placeholder-ash-silver/50 focus:outline-none focus:border-golden-accent focus:ring-4 focus:ring-golden-accent/20 transition-all shadow-inner hover:border-white/20"
                                disabled={isSubmitting}
                                maxLength={MAX_USERNAME_LENGTH}
                                autoComplete="username"
                                autoFocus
                                aria-label="Username"
                                aria-required="true"
                                aria-invalid={!!validationError}
                            />
                            <p className="mt-2 text-xs text-ash-silver/70 flex items-center justify-between">
                                <span>Letters, numbers, hyphens, underscores only</span>
                                <span className="font-semibold">{username.length}/{MAX_USERNAME_LENGTH}</span>
                            </p>
                        </div>
                        
                        {/* Password Input (Private Rooms Only) */}
                        {roomInfo?.isPrivate && (
                            <div>
                                <label htmlFor="password" className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="text-lg">🔐</span>
                                    Room Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Enter room password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-black-night/80 backdrop-blur-sm border-2 border-white/10 rounded-xl text-white placeholder-ash-silver/50 focus:outline-none focus:border-golden-accent focus:ring-4 focus:ring-golden-accent/20 transition-all shadow-inner hover:border-white/20"
                                    disabled={isSubmitting}
                                    autoComplete="current-password"
                                    aria-label="Room password"
                                    aria-required="true"
                                />
                            </div>
                        )}
                        
                        {/* Join Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-5 bg-gradient-to-r from-golden-accent via-yellow-500 to-golden-accent bg-size-200 bg-pos-0 hover:bg-pos-100 text-black-night font-header font-extrabold text-xl rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-golden-accent/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
                            aria-label="Join room"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Joining Room...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>🎬</span>
                                    <span>JOIN ROOM</span>
                                    <span>→</span>
                                </span>
                            )}
                        </button>
                        
                        {/* Cancel Button */}
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-transparent border-2 border-ash-silver/30 text-ash-silver hover:bg-white/5 hover:border-white/60 hover:text-white font-body font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Cancel and go back"
                        >
                            ← Go Back
                        </button>
                    </form>

                    {/* Help Text */}
                    <p className="mt-8 text-center text-xs text-ash-silver/60 relative z-10">
                        By joining, you agree to follow community guidelines
                    </p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="watch-room-container error-state">
                <div className="text-center">
                    <div className="text-6xl mb-4">❌</div>
                    <h2 className="text-2xl mb-4">Error: {error}</h2>
                    <Button onClick={() => navigate('/')}>Go Home</Button>
                </div>
            </div>
        );
    }

    // Show connecting state
    if (!isConnected || !isJoined) {
        return (
            <div className="watch-room-container connecting-state">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-golden-accent border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-2xl font-header">Connecting to room...</h2>
                    <p className="text-ash-silver">Please wait while we establish connection</p>
                </div>
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
                    <Button variant="secondary" className="invite-btn" onClick={handleInvite}>
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
                            syncState={playerSyncState}
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
                            onKeyPress={(e) => handleKeyPress(e, handleSendMessage)}
                            aria-label="Chat message"
                        />
                        {/* Quick Emoji Buttons */}
                        <div className="quick-emojis">
                            {quickEmojis.map(emoji => (
                                <button 
                                    key={emoji} 
                                    className="emoji-btn" 
                                    onClick={() => handleEmojiReaction(emoji)}
                                    title={`React with ${emoji}`}
                                    aria-label={`React with ${emoji}`}
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
                            aria-label="Request sync from host"
                        >
                            ⏱ Start Sync
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="cta-small-btn"
                            onClick={handleCreatePoll}
                            aria-label="Create poll"
                        >
                            🗳 Create Poll
                        </Button>
                        <Button 
                            variant="secondary" 
                            className="cta-small-btn"
                            disabled
                            title="Coming soon"
                            aria-label="Pin message (coming soon)"
                        >
                            📌 Pin Message
                        </Button>
                        <Button 
                            variant={spoilerMode ? 'pop-red' : 'secondary'} 
                            className="cta-small-btn"
                            onClick={() => setSpoilerMode(!spoilerMode)}
                            aria-label={`Spoilers ${spoilerMode ? 'enabled' : 'disabled'}`}
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