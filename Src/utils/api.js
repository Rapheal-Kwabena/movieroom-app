// API utility for making HTTP requests to the backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Create a new room
 * @param {Object} roomData - Room configuration data
 * @returns {Promise<Object>} - Room creation response with roomId
 */
export const createRoom = async (roomData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(roomData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create room');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
};

/**
 * Get room information
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} - Room data
 */
export const getRoomInfo = async (roomId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to fetch room info');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching room info:', error);
        throw error;
    }
};

/**
 * Get list of public rooms
 * @returns {Promise<Array>} - List of public rooms
 */
export const getPublicRooms = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/rooms`);

        if (!response.ok) {
            throw new Error('Failed to fetch public rooms');
        }

        const data = await response.json();
        return data.rooms;
    } catch (error) {
        console.error('Error fetching public rooms:', error);
        throw error;
    }
};

/**
 * Check server health
 * @returns {Promise<Object>} - Server health status
 */
export const checkServerHealth = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        return await response.json();
    } catch (error) {
        console.error('Error checking server health:', error);
        throw error;
    }
};