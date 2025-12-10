// server/seedRooms.js - Seed sample rooms for testing

const sampleRooms = [
    {
        movieLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        roomName: 'Friday Night Horror Marathon',
        isPrivate: false,
        genreTag: 'Horror',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example2',
        roomName: 'Rom-Com Evening',
        isPrivate: false,
        genreTag: 'Romance',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example3',
        roomName: 'Action Movie Night',
        isPrivate: false,
        genreTag: 'Action',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example4',
        roomName: 'Comedy Central',
        isPrivate: false,
        genreTag: 'Comedy',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example5',
        roomName: 'Thriller Thursday',
        isPrivate: false,
        genreTag: 'Thriller',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example6',
        roomName: 'Drama Club',
        isPrivate: false,
        genreTag: 'Drama',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example7',
        roomName: 'Weekend Movie Fest',
        isPrivate: false,
        genreTag: 'Action',
        posterImage: null,
    },
    {
        movieLink: 'https://www.youtube.com/watch?v=example8',
        roomName: 'Late Night Cinema',
        isPrivate: false,
        genreTag: 'Horror',
        posterImage: null,
    },
];

/**
 * Seed the rooms data structure with sample rooms
 * @param {Object} rooms - The rooms object from server.js
 */
function seedRooms(rooms) {
    console.log('\n🌱 Seeding sample rooms...');
    
    let seedCount = 0;
    
    sampleRooms.forEach((roomData, index) => {
        const roomId = `sample-room-${index + 1}`;
        
        rooms[roomId] = {
            id: roomId,
            movieLink: roomData.movieLink,
            name: roomData.roomName,
            isPrivate: roomData.isPrivate,
            password: null,
            genreTag: roomData.genreTag,
            posterImage: roomData.posterImage,
            users: new Set(),
            messages: [],
            reactions: [],
            syncTime: 0,
            isPlaying: false,
            createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(), // Random time in last 24h
        };
        
        seedCount++;
    });
    
    console.log(`✅ Successfully seeded ${seedCount} sample rooms`);
    console.log('📋 Sample rooms:');
    Object.values(rooms).forEach(room => {
        console.log(`   - ${room.name} (${room.genreTag}) - ID: ${room.id}`);
    });
    console.log('');
}

module.exports = { seedRooms, sampleRooms };