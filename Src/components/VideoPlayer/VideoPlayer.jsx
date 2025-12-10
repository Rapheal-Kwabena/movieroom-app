// src/components/VideoPlayer/VideoPlayer.jsx
import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    const [playing, setPlaying] = useState(isHost); // Auto-play for host
    const [volume, setVolume] = useState(0.8);
    const [muted, setMuted] = useState(false);
    const [played, setPlayed] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [playerReady, setPlayerReady] = useState(false);
    const lastSyncTimeRef = useRef(0);
    const isSyncingRef = useRef(false);

    // Handle external sync commands - ONLY for guest users, never for host
    useEffect(() => {
        // CRITICAL: Host must never sync to room state
        if (isHost) {
            console.log('🎯 Host mode - not syncing');
            return;
        }
        
        // Don't sync if prerequisites not met
        if (!syncState) {
            console.log('⚠️ No sync state available');
            return;
        }
        
        if (!playerRef.current || !playerReady) {
            console.log('⚠️ Player not ready for sync');
            return;
        }
        
        if (seeking) {
            console.log('⚠️ Currently seeking, skipping sync');
            return;
        }

        const currentTime = playerRef.current.getCurrentTime();
        const timeDiff = Math.abs(currentTime - syncState.currentTime);
        const now = Date.now();
        
        // Prevent sync loops: only sync every 500ms minimum
        if (now - lastSyncTimeRef.current < 500) {
            return;
        }
        
        // Always sync play/pause state first for guests
        if (playing !== syncState.isPlaying) {
            console.log(`▶️ Guest syncing play state: ${syncState.isPlaying ? 'Playing' : 'Paused'} (current: ${playing})`);
            setPlaying(syncState.isPlaying);
            lastSyncTimeRef.current = now;
        }
        
        // Only sync time if difference is significant (>2 seconds)
        if (timeDiff > 2) {
            console.log(`🔄 Guest syncing time: ${currentTime.toFixed(1)}s → ${syncState.currentTime.toFixed(1)}s (diff: ${timeDiff.toFixed(1)}s)`);
            playerRef.current.seekTo(syncState.currentTime, 'seconds');
            lastSyncTimeRef.current = now;
        }
    }, [syncState, seeking, playing, playerReady, isHost]);

    const handleProgress = useCallback((state) => {
        if (!seeking) {
            setPlayed(state.played);
            if (onProgress) {
                onProgress(state.playedSeconds);
            }
        }
    }, [seeking, onProgress]);

    const handlePlay = useCallback(() => {
        setPlaying(true);
        // Only broadcast if host
        if (onPlay && isHost) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            console.log(`▶️ Host played at ${currentTime.toFixed(1)}s`);
            onPlay(currentTime);
        }
    }, [onPlay, isHost]);

    const handlePause = useCallback(() => {
        setPlaying(false);
        // Only broadcast if host
        if (onPause && isHost) {
            const currentTime = playerRef.current?.getCurrentTime() || 0;
            console.log(`⏸️ Host paused at ${currentTime.toFixed(1)}s`);
            onPause(currentTime);
        }
    }, [onPause, isHost]);

    const handleSeek = useCallback((time) => {
        setSeeking(false);
        if (onSeek && isHost) {
            console.log(`⏩ Host seeked to ${time.toFixed(1)}s`);
            onSeek(time);
        }
    }, [onSeek, isHost]);

    const handleSeekChange = useCallback((e) => {
        setPlayed(parseFloat(e.target.value));
    }, []);

    const handleSeekMouseDown = useCallback(() => {
        setSeeking(true);
    }, []);

    const handleSeekMouseUp = useCallback((e) => {
        if (!playerRef.current) return;
        
        const duration = playerRef.current.getDuration();
        if (!duration || isNaN(duration)) return;
        
        const newTime = parseFloat(e.target.value) * duration;
        playerRef.current.seekTo(newTime, 'seconds');
        handleSeek(newTime);
    }, [handleSeek]);

    const handleReady = useCallback(() => {
        console.log('🎬 Player ready');
        setPlayerReady(true);
        
        // Auto-start playback for host immediately
        if (isHost) {
            setPlaying(true);
            if (onPlay) {
                // Broadcast playing state immediately
                console.log('👑 Host auto-starting playback');
                onPlay(0);
            }
        }
    }, [isHost, onPlay]);

    const handleError = useCallback((error) => {
        console.error('❌ Player error:', error);
    }, []);

    const toggleMute = () => {
        setMuted(!muted);
    };

    const handleVolumeChange = (e) => {
        setVolume(parseFloat(e.target.value));
    };

    return (
        <div className={`video-player-container ${!isHost ? 'guest-mode' : ''}`}>
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
                    onReady={handleReady}
                    onError={handleError}
                    width="100%"
                    height="100%"
                    controls={false}
                    progressInterval={1000}
                    config={{
                        youtube: {
                            playerVars: {
                                controls: 0, // Disable all YouTube controls
                                disablekb: 1, // Disable keyboard controls
                                fs: 0, // Disable fullscreen
                                modestbranding: 1,
                                rel: 0,
                                showinfo: 0,
                                iv_load_policy: 3
                            },
                            embedOptions: {
                                host: 'https://www.youtube-nocookie.com'
                            }
                        },
                        vimeo: {
                            playerOptions: {
                                byline: false,
                                portrait: false,
                                title: false
                            }
                        }
                    }}
                />
            </div>

            {/* Custom Controls */}
            <div className="player-controls" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                <button
                    className="control-btn"
                    onClick={() => {
                        if (isHost) {
                            setPlaying(!playing);
                        }
                    }}
                    disabled={!isHost}
                    style={{
                        opacity: isHost ? 1 : 0.5,
                        cursor: isHost ? 'pointer' : 'not-allowed',
                        pointerEvents: isHost ? 'auto' : 'none'
                    }}
                    title={isHost ? (playing ? 'Pause' : 'Play') : 'Only host can control playback'}
                >
                    {playing ? '⏸' : '▶'}
                </button>

                <input
                    type="range"
                    min={0}
                    max={1}
                    step="any"
                    value={played}
                    onMouseDown={isHost ? handleSeekMouseDown : undefined}
                    onChange={isHost ? handleSeekChange : undefined}
                    onMouseUp={isHost ? handleSeekMouseUp : undefined}
                    className="seek-bar"
                    disabled={!isHost}
                    style={{ cursor: isHost ? 'pointer' : 'not-allowed', opacity: isHost ? 1 : 0.7 }}
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

                {!isHost && (
                    <span className="sync-indicator" title="You are watching as a guest - host controls playback">
                        👀 Guest Mode
                    </span>
                )}
                {isHost && (
                    <span className="sync-indicator host-indicator" title="You are controlling playback for everyone">
                        👑 Host Controls
                    </span>
                )}
            </div>
        </div>
    );
};

export default VideoPlayer;