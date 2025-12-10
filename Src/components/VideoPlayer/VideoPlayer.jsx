// src/components/VideoPlayer/VideoPlayer.jsx
import React, { useRef, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import './VideoPlayer.css';

const VideoPlayer = ({ 
    url, 
    onProgress, 
    onPlay, 
    onPause, 
    onSeek,
    syncState,
    isHost = false 
}) => {
    const playerRef = useRef(null);
    const [playing, setPlaying] = useState(false);
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);

    // Handle external sync commands
    useEffect(() => {
        if (syncState && playerRef.current && !seeking) {
            const currentTime = playerRef.current.getCurrentTime();
            const timeDiff = Math.abs(currentTime - syncState.currentTime);
            
            // Only sync if difference is significant (>1 second)
            if (timeDiff > 1) {
                playerRef.current.seekTo(syncState.currentTime, 'seconds');
            }
            
            setPlaying(syncState.isPlaying);
        }
    }, [syncState, seeking]);

    const handleProgress = (state) => {
        if (!seeking) {
            setPlayed(state.played);
            if (onProgress && isHost) {
                onProgress(state.playedSeconds);
            }
        }
    };

    const handlePlay = () => {
        setPlaying(true);
        if (onPlay && isHost) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            onPlay(currentTime);
        }
    };

    const handlePause = () => {
        setPlaying(false);
        if (onPause && isHost) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            onPause(currentTime);
        }
    };

    const handleSeek = (time) => {
        setSeeking(false);
        if (onSeek && isHost) {
            onSeek(time);
        }
    };

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseDown = () => {
        setSeeking(true);
    };

    const handleSeekMouseUp = (e) => {
        const newTime = parseFloat(e.target.value) * playerRef.current.getDuration();
        playerRef.current.seekTo(newTime, 'seconds');
        handleSeek(newTime);
    };

    const toggleMute = () => {
        setMuted(!muted);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div className="video-player-container">
            <div className="player-wrapper">
                <ReactPlayer
                    ref={playerRef}
                    url={url}
                    playing={playing}
                    volume={volume}
                    muted={muted}
                    onProgress={handleProgress}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    width="100%"
                    height="100%"
                    controls={false}
                    config={{
                        youtube: {
                            playerVars: { 
                                showinfo: 0,
                                modestbranding: 1
                            }
                        }
                    }}
                />
            </div>

            {/* Custom Controls */}
            <div className="player-controls">
                <button 
                    className="control-btn" 
                    onClick={() => setPlaying(!playing)}
                    disabled={!isHost}
                >
                    {playing ? '⏸' : '▶'}
                </button>

                <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={played}
                    onMouseDown={handleSeekMouseDown}
                    onChange={handleSeekChange}
                    onMouseUp={handleSeekMouseUp}
                    className="seek-bar"
                    disabled={!isHost}
                />

                <button className="control-btn" onClick={toggleMute}>
                    {muted ? '🔇' : '🔊'}
                </button>

                <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="volume-bar"
                />

                {!isHost && <span className="sync-indicator">🔄 Synced</span>}
            </div>
        </div>
    );
};

export default VideoPlayer;