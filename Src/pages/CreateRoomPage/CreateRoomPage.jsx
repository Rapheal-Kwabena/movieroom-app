// src/pages/CreateRoomPage/CreateRoomPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/UI/Navbar';
import Button from '../../components/UI/Button';
import InputField from '../../components/UI/InputField';
import { createRoom } from '../../utils/api';
import './CreateRoomPage.css';

const genres = ['Action', 'Horror', 'Drama', 'Romance', 'Comedy', 'Thriller'];

const CreateRoomPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isPrivate, setIsPrivate] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        movieLink: '',
        password: '',
        roomName: '',
        genreTag: 'Action',
        posterFile: null,
    });

    // Check if we have an initial movie link from the landing page
    useEffect(() => {
        if (location.state?.initialLink) {
            setFormData(prev => ({
                ...prev,
                movieLink: location.state.initialLink
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(null); // Clear error on input change
    };

    const handleGenreChange = (genre) => {
        setFormData({ ...formData, genreTag: genre });
    };

    const handlePosterUpload = (e) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData({ ...formData, posterFile: file });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Validate movie link
            if (!formData.movieLink.trim()) {
                throw new Error('Movie link is required');
            }

            // Validate password for private rooms
            if (isPrivate && !formData.password.trim()) {
                throw new Error('Password is required for private rooms');
            }

            // Prepare room data
            const roomData = {
                movieLink: formData.movieLink.trim(),
                roomName: formData.roomName.trim() || 'Untitled Room',
                isPrivate,
                password: isPrivate ? formData.password : null,
                genreTag: formData.genreTag,
                posterImage: null, // TODO: Handle image upload in future
            };

            console.log('Creating room with data:', roomData);

            // Call API to create room
            const response = await createRoom(roomData);

            console.log('Room created successfully:', response);

            // Navigate to the newly created room
            if (response.roomId) {
                navigate(`/room/${response.roomId}`);
            } else {
                throw new Error('Failed to get room ID from server');
            }
        } catch (err) {
            console.error('Error creating room:', err);
            setError(err.message || 'Failed to create room. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="create-room-page-content container">
                <div className="back-link" onClick={() => navigate('/')}>
                    &larr; Back
                </div>
                
                <h1 className="page-title">Create Your Movie Room</h1>

                {error && (
                    <div className="error-message">
                        ⚠️ {error}
                    </div>
                )}

                <form className="create-room-form" onSubmit={handleSubmit}>
                    <InputField
                        label="Movie Link"
                        name="movieLink"
                        placeholder="Paste Movie Link Here (YouTube, Netflix, etc.)"
                        value={formData.movieLink}
                        onChange={handleChange}
                        required
                    />

                    {/* Visibility Toggle */}
                    <div className="visibility-toggle">
                        <span className="toggle-label">Room Visibility:</span>
                        <label className={`toggle-option ${!isPrivate ? 'active' : ''}`} onClick={() => setIsPrivate(false)}>
                            Public
                        </label>
                        <label className={`toggle-option ${isPrivate ? 'active' : ''}`} onClick={() => setIsPrivate(true)}>
                            Private 🔐
                        </label>
                    </div>

                    {/* Password Field (Appears only if Private) */}
                    {isPrivate && (
                        <InputField
                            label="Room Password"
                            name="password"
                            type="password"
                            placeholder="Enter a secure password"
                            value={formData.password}
                            onChange={handleChange}
                            required={isPrivate}
                        />
                    )}

                    <div className="customization-box">
                        <h3>Customization (Optional)</h3>
                        <InputField
                            label="Room Name"
                            name="roomName"
                            placeholder="e.g., Friday Night Horror Feast"
                            value={formData.roomName}
                            onChange={handleChange}
                        />

                        {/* Genre Tag Selector */}
                        <div className="genre-selector">
                            <label className="input-label">Genre Tag Selector:</label>
                            <div className="tag-list">
                                {genres.map(genre => (
                                    <span
                                        key={genre}
                                        className={`genre-tag ${formData.genreTag === genre ? 'active-tag' : ''}`}
                                        onClick={() => handleGenreChange(genre)}
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Poster Upload Area */}
                        <div className="poster-upload-area" onClick={() => document.getElementById('poster-upload').click()}>
                            <p className="upload-text">
                                {formData.posterFile ? `File Selected: ${formData.posterFile.name}` : 'Poster Upload Area (Drag or Click Upload)'}
                            </p>
                            <input
                                id="poster-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handlePosterUpload}
                            />
                        </div>
                    </div>
                    
                    <Button type="submit" className="create-btn" disabled={loading}>
                        {loading ? 'CREATING ROOM...' : 'CREATE ROOM'}
                    </Button>
                </form>
            </main>
        </>
    );
};

export default CreateRoomPage;