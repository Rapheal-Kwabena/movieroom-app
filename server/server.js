// server.js - Main Backend Server for MovieRoom App

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const { seedRooms } = require('./seedRooms');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// =======================================================
// IN-MEMORY DATA STORE (Replace with DB in Production)
// =======================================================
const rooms = {};
const users = {}; // Store user info by socket ID

// Utility Functions
const generateRoomId = () => Math.random().toString(36).substring(2, 15);
const getRoomUsers = (roomId) => rooms[roomId] ? Array.from(rooms[roomId].users).length : 0;

// =======================================================
// HTTP REST ENDPOINTS
// =======================================================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'MovieRoom Server is running' });
});

// Create a new room
app.post('/api/rooms/create', (req, res) => {
    const { movieLink, roomName, isPrivate, password, genreTag, posterImage } = req.body;
    
    if (!movieLink) {
        return res.status(400).json({ error: 'Movie link is required' });
    }

    const newRoomId = generateRoomId();
    
    rooms[newRoomId] = {
        id: newRoomId,
        movieLink,
        name: roomName || 'Untitled Room',
        isPrivate: isPrivate || false,
        password: isPrivate ? password : null,
        genreTag: genreTag || 'General',
        posterImage: posterImage || null,
        users: new Set(),
        host: null, // Track room host (first user to join)
        messages: [],
        reactions: [],
        syncTime: 0,
        isPlaying: true, // Auto-play when host joins
        createdAt: new Date().toISOString()
    };
    
    console.log(`✅ Room created: ${newRoomId} - ${roomName}`);
    res.status(201).json({ 
        success: true,
        roomId: newRoomId,
        room: {
            id: newRoomId,
            name: roomName,
            isPrivate
        }
    });
});

// Get room info (for validation before joining)
app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms[roomId];
    
    if (!room) {
        return res.status(404).json({ error: 'Room not found' });
    }
    
    // Return public info only
    res.json({
        id: room.id,
        name: room.name,
        isPrivate: room.isPrivate,
        genreTag: room.genreTag,
        userCount: getRoomUsers(roomId),
        movieLink: room.movieLink
    });
});

// Get list of public rooms (for Explore page)
app.get('/api/rooms', (req, res) => {
    const publicRooms = Object.values(rooms)
        .filter(room => !room.isPrivate)
        .map(room => ({
            id: room.id,
            name: room.name,
            genreTag: room.genreTag,
            posterImage: room.posterImage,
            userCount: getRoomUsers(room.id),
            createdAt: room.createdAt
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 20); // Return top 20 rooms
    
    res.json({ rooms: publicRooms });
});

// =======================================================
// SOCKET.IO REAL-TIME EVENTS
// =======================================================

io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.id}`);

    // ===== ROOM MANAGEMENT =====
    
    socket.on('joinRoom', ({ roomId, username, password = null }) => {
        const room = rooms[roomId];
        
        if (!room) {
            return socket.emit('roomError', { message: 'Room not found' });
        }

        // Password validation for private rooms
        if (room.isPrivate && room.password !== password) {
            return socket.emit('roomError', { message: 'Incorrect password' });
        }

        // Store user info
        users[socket.id] = {
            id: socket.id,
            username: username || `Guest_${socket.id.substring(0, 4)}`,
            roomId
        };

        // Add user to room
        socket.join(roomId);
        room.users.add(socket.id);
        
        // Set host if this is the first user
        if (!room.host) {
            room.host = socket.id;
            console.log(`👑 ${users[socket.id].username} is now the host of room ${roomId}`);
        }
        
        const user = users[socket.id];
        const isHost = room.host === socket.id;
        
        // Notify others that user joined
        socket.to(roomId).emit('userJoined', { 
            username: user.username,
            userId: socket.id,
            userCount: getRoomUsers(roomId)
        });
        
        // Send current room state to the joining user
        socket.emit('roomState', {
            roomId: room.id,
            roomName: room.name,
            movieLink: room.movieLink,
            messages: room.messages,
            reactions: room.reactions,
            syncTime: room.syncTime,
            isPlaying: room.isPlaying,
            userCount: getRoomUsers(roomId),
            isHost: isHost,
            hostId: room.host,
            users: Array.from(room.users).map(id => ({
                id,
                username: users[id]?.username || 'Unknown',
                isHost: id === room.host
            }))
        });
        
        console.log(`👤 ${user.username} joined room ${roomId}. Total users: ${getRoomUsers(roomId)}`);
    });

    socket.on('leaveRoom', ({ roomId }) => {
        handleUserLeave(socket, roomId);
    });

    // ===== CHAT MESSAGING =====
    
    socket.on('sendMessage', ({ roomId, text }) => {
        const room = rooms[roomId];
        const user = users[socket.id];
        
        if (!room || !user) return;

        const message = {
            id: Date.now().toString(),
            username: user.username,
            userId: socket.id,
            text,
            timestamp: new Date().toISOString()
        };
        
        room.messages.push(message);
        
        // Broadcast to all users in the room (including sender)
        io.to(roomId).emit('newMessage', message);
        
        console.log(`💬 [${room.name}] ${user.username}: ${text}`);
    });

    // ===== REACTIONS =====
    
    socket.on('sendReaction', ({ roomId, emoji, timestamp }) => {
        const room = rooms[roomId];
        const user = users[socket.id];
        
        if (!room || !user) return;

        const reaction = {
            id: Date.now().toString(),
            emoji,
            timestamp, // Movie timestamp in seconds
            username: user.username,
            userId: socket.id,
            createdAt: new Date().toISOString()
        };
        
        room.reactions.push(reaction);
        
        // Broadcast reaction to all users
        io.to(roomId).emit('newReaction', reaction);
        
        console.log(`😊 [${room.name}] ${user.username} reacted ${emoji} at ${timestamp}s`);
    });

    // ===== WATCH SYNCHRONIZATION =====
    
    socket.on('syncMovieState', ({ roomId, currentTime, isPlaying }) => {
        const room = rooms[roomId];
        const user = users[socket.id];
        
        if (!room || !user) return;

        // CRITICAL FIX: Only allow host to sync
        if (room.host !== socket.id) {
            console.log(`⚠️  [${room.name}] ${user.username} tried to sync but is not host`);
            socket.emit('syncError', {
                message: 'Only the host can control playback'
            });
            return;
        }

        // Update server state
        room.syncTime = currentTime;
        room.isPlaying = isPlaying;

        // Broadcast to all other users in room
        socket.to(roomId).emit('movieStateUpdated', {
            currentTime,
            isPlaying,
            syncedBy: user.username,
            serverTime: Date.now()
        });
        
        console.log(`⏯️  [${room.name}] Host ${user.username} synced: ${isPlaying ? 'Playing' : 'Paused'} at ${currentTime}s`);
    });

    // Request sync (when user joins or reconnects)
    socket.on('requestSync', ({ roomId }) => {
        const room = rooms[roomId];
        
        if (!room) return;

        socket.emit('movieStateUpdated', {
            currentTime: room.syncTime,
            isPlaying: room.isPlaying,
            serverTime: Date.now()
        });
    });

    // ===== POLLS =====
    
    socket.on('createPoll', ({ roomId, question, options }) => {
        const room = rooms[roomId];
        const user = users[socket.id];
        
        if (!room || !user) return;

        const poll = {
            id: Date.now().toString(),
            question,
            options: options.map(opt => ({
                text: opt,
                votes: []
            })),
            createdBy: user.username,
            createdAt: new Date().toISOString()
        };
        
        io.to(roomId).emit('newPoll', poll);
        
        console.log(`📊 [${room.name}] ${user.username} created poll: ${question}`);
    });

    socket.on('votePoll', ({ roomId, pollId, optionIndex }) => {
        // Simplified poll voting - in production, store polls in room data
        const user = users[socket.id];
        
        if (!user) return;

        io.to(roomId).emit('pollVoted', {
            pollId,
            optionIndex,
            userId: socket.id,
            username: user.username
        });
    });

    // ===== DISCONNECT HANDLING =====
    
    socket.on('disconnect', () => {
        const user = users[socket.id];
        
        if (user && user.roomId) {
            handleUserLeave(socket, user.roomId);
        }
        
        delete users[socket.id];
        console.log(`❌ User disconnected: ${socket.id}`);
    });
});

// Helper function to handle user leaving
function handleUserLeave(socket, roomId) {
    const room = rooms[roomId];
    const user = users[socket.id];
    
    if (!room || !user) return;

    const wasHost = room.host === socket.id;
    room.users.delete(socket.id);
    socket.leave(roomId);
    
    // Transfer host to next user if current host leaves
    if (wasHost && room.users.size > 0) {
        const newHostId = Array.from(room.users)[0];
        room.host = newHostId;
        const newHost = users[newHostId];
        
        console.log(`👑 ${newHost?.username || 'Unknown'} is now the host of room ${roomId}`);
        
        // Notify all users about new host
        io.to(roomId).emit('hostChanged', {
            newHostId: newHostId,
            newHostUsername: newHost?.username || 'Unknown'
        });
    }
    
    // Notify others
    socket.to(roomId).emit('userLeft', {
        username: user.username,
        userId: socket.id,
        userCount: getRoomUsers(roomId)
    });
    
    // Clean up empty rooms
    if (room.users.size === 0) {
        console.log(`🗑️  Deleting empty room: ${roomId}`);
        delete rooms[roomId];
    }
    
    console.log(`👋 ${user.username} left room ${roomId}`);
}

// =======================================================
// START SERVER
// =======================================================

server.listen(PORT, () => {
    console.log(`\n🎬 ================================`);
    console.log(`🎬 MovieRoom Server is running!`);
    console.log(`🎬 ================================`);
    console.log(`🚀 Port: ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🎯 Client: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
    console.log(`🎬 ================================\n`);
    
    // Seed sample rooms for testing
    seedRooms(rooms);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});