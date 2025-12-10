// Custom React Hook for Socket.io connection management

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

/**
 * Custom hook to manage Socket.io connection and events
 * @param {string} roomId - Room ID to join (optional)
 * @returns {Object} Socket instance and connection state
 */
export const useSocket = (roomId = null) => {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const socket = socketRef.current;

        // Connection events
        socket.on('connect', () => {
            console.log('✅ Connected to server:', socket.id);
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('🔴 Connection error:', err.message);
            setError('Failed to connect to server');
            setIsConnected(false);
        });

        // Cleanup on unmount
        return () => {
            if (socket) {
                socket.disconnect();
                console.log('🔌 Socket disconnected');
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        error,
    };
};

/**
 * Custom hook specifically for room interactions
 * @param {string} roomId - Room ID
 * @param {string} username - User's username
 * @param {string} password - Room password (if private)
 * @returns {Object} Room state and interaction methods
 */
export const useRoomSocket = (roomId, username, password = null) => {
    const { socket, isConnected, error: connectionError } = useSocket();
    const [roomState, setRoomState] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reactions, setReactions] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        if (!socket || !isConnected || !roomId) return;

        // Join the room
        socket.emit('joinRoom', { roomId, username, password });

        // Listen for room state
        socket.on('roomState', (state) => {
            console.log('📦 Received room state:', state);
            setRoomState(state);
            setMessages(state.messages || []);
            setReactions(state.reactions || []);
            setUsers(state.users || []);
            setIsHost(state.isHost || false);
            setIsJoined(true);
            setError(null);
            
            if (state.isHost) {
                console.log('👑 You are the host of this room');
            }
        });

        // Listen for errors
        socket.on('roomError', ({ message }) => {
            console.error('🔴 Room error:', message);
            setError(message);
            setIsJoined(false);
        });

        // Listen for new messages
        socket.on('newMessage', (message) => {
            console.log('💬 New message:', message);
            setMessages(prev => [...prev, message]);
        });

        // Listen for new reactions
        socket.on('newReaction', (reaction) => {
            console.log('😊 New reaction:', reaction);
            setReactions(prev => [...prev, reaction]);
        });

        // Listen for user joined
        socket.on('userJoined', ({ username: joinedUser, userId, userCount }) => {
            console.log(`👤 ${joinedUser} joined the room`);
            setUsers(prev => [...prev, { id: userId, username: joinedUser }]);
        });

        // Listen for user left
        socket.on('userLeft', ({ username: leftUser, userId, userCount }) => {
            console.log(`👋 ${leftUser} left the room`);
            setUsers(prev => prev.filter(u => u.id !== userId));
        });

        // Listen for host changed
        socket.on('hostChanged', ({ newHostId, newHostUsername }) => {
            console.log(`👑 ${newHostUsername} is now the host`);
            setIsHost(socket.id === newHostId);
            setUsers(prev => prev.map(u => ({
                ...u,
                isHost: u.id === newHostId
            })));
        });

        // Listen for sync errors
        socket.on('syncError', ({ message }) => {
            console.warn('⚠️ Sync error:', message);
            // Don't set global error, just log it
        });

        // Cleanup listeners
        return () => {
            socket.off('roomState');
            socket.off('roomError');
            socket.off('newMessage');
            socket.off('newReaction');
            socket.off('userJoined');
            socket.off('userLeft');
            socket.off('hostChanged');
            socket.off('syncError');
        };
    }, [socket, isConnected, roomId, username, password]);

    // Methods for interacting with the room
    const sendMessage = (text) => {
        if (socket && isJoined) {
            socket.emit('sendMessage', { roomId, text });
        }
    };

    const sendReaction = (emoji, timestamp) => {
        if (socket && isJoined) {
            socket.emit('sendReaction', { roomId, emoji, timestamp });
        }
    };

    const syncMovieState = (currentTime, isPlaying) => {
        if (socket && isJoined) {
            socket.emit('syncMovieState', { roomId, currentTime, isPlaying });
        }
    };

    const requestSync = () => {
        if (socket && isJoined) {
            socket.emit('requestSync', { roomId });
        }
    };

    const createPoll = (question, options) => {
        if (socket && isJoined) {
            socket.emit('createPoll', { roomId, question, options });
        }
    };

    const leaveRoom = () => {
        if (socket && isJoined) {
            socket.emit('leaveRoom', { roomId });
            setIsJoined(false);
        }
    };

    return {
        socket,
        isConnected,
        isJoined,
        isHost,
        error: error || connectionError,
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
    };
};