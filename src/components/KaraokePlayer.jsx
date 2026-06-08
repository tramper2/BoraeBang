import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipForward, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// Memoized container to prevent React from reconciling and destroying the YouTube iframe
const YoutubePlayerContainer = React.memo(() => {
  return (
    <div 
      id="boraebang-yt-player" 
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    ></div>
  );
});

export default function KaraokePlayer({
  currentSong,
  tempo,
  volume,
  isMuted,
  isVerse1Mode,
  onControlAction, // callbacks
  onSongEnded,
  onPlayerReadyState // to send player status back to App
}) {
  const playerRef = useRef(null);
  const iframeWrapperId = 'boraebang-yt-player';
  const [playerLoaded, setPlayerLoaded] = useState(false);
  const [digitalTime, setDigitalTime] = useState('');
  
  // Score screen states
  const [showScore, setShowScore] = useState(false);
  const [score, setScore] = useState(0);
  const [scoreMsg, setScoreMsg] = useState('');

  // 1. Digital Clock for Standby Screen
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setDigitalTime(`${hrs}:${mins}:${secs}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // 2. Load YouTube IFrame API script
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
      
      window.onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    } else {
      initPlayer();
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize YT Player
  const initPlayer = () => {
    if (playerRef.current) return;

    try {
      playerRef.current = new window.YT.Player(iframeWrapperId, {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: {
          autoplay: 1,
          controls: 0, // Hide controls for noraebang authenticity
          disablekb: 1,
          fs: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          origin: window.location.origin
        },
        events: {
          onReady: (event) => {
            setPlayerLoaded(true);
            onPlayerReadyState(true);
            event.target.setVolume(volume);
            if (isMuted) event.target.mute();
          },
          onStateChange: (event) => {
            // Check state changes
            // YT.PlayerState.ENDED = 0
            if (event.data === window.YT.PlayerState.ENDED) {
              triggerScoreScreen();
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to init YT player:', err);
    }
  };

  // 3. Sync player video with currentSong
  useEffect(() => {
    if (!playerLoaded || !playerRef.current) return;

    if (currentSong && currentSong.videoId) {
      // Load and play the song
      playerRef.current.loadVideoById({
        videoId: currentSong.videoId,
        startSeconds: 0
      });
      // Apply tempo
      playerRef.current.setPlaybackRate(tempo);
      setShowScore(false);
    } else {
      // No song playing, stop/cue empty
      playerRef.current.stopVideo();
    }
  }, [currentSong, playerLoaded]);

  // 4. Sync playback controls (tempo, volume, mute)
  useEffect(() => {
    if (playerRef.current && playerLoaded) {
      playerRef.current.setPlaybackRate(tempo);
    }
  }, [tempo, playerLoaded]);

  useEffect(() => {
    if (playerRef.current && playerLoaded) {
      playerRef.current.setVolume(volume);
    }
  }, [volume, playerLoaded]);

  useEffect(() => {
    if (playerRef.current && playerLoaded) {
      if (isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
      }
    }
  }, [isMuted, playerLoaded]);

  // 5. Check time for Verse 1 Mode & custom interlude jump
  useEffect(() => {
    if (!playerLoaded || !playerRef.current || !currentSong) return;

    const interval = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          const currentTime = playerRef.current.getCurrentTime();
          const duration = playerRef.current.getDuration();
          
          if (duration > 0) {
            // Verse 1 mode: Stop song when it reaches 60%
            if (isVerse1Mode && currentTime >= duration * 0.6) {
              playerRef.current.stopVideo();
              triggerScoreScreen();
            }
          }
        }
      } catch (e) {
        // Ignore iframe API errors
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerse1Mode, currentSong, playerLoaded]);

  // Handle score display at the end of song
  const triggerScoreScreen = () => {
    const randomScore = Math.floor(Math.random() * (100 - 85 + 1)) + 85;
    let msg = '참 잘 부르셨어요!';
    if (randomScore >= 98) msg = '🎉 천상의 목소리! 완벽합니다! 🎉';
    else if (randomScore >= 95) msg = '🎤 가수 뺨치는 실력이네요! 대박! 🎤';
    else if (randomScore >= 90) msg = '👍 멋진 가창력입니다! 한 번 더 도전?';
    
    setScore(randomScore);
    setScoreMsg(msg);
    setShowScore(true);

    // Show score for 4 seconds, then skip to next song
    setTimeout(() => {
      setShowScore(false);
      onSongEnded(); // Call App.jsx to load next song in queue
    }, 4500);
  };

  // Expose remote action handlers
  useEffect(() => {
    const handleRemoteAction = (action) => {
      if (!playerRef.current || !playerLoaded) return;
      
      try {
        switch (action) {
          case 'play':
            playerRef.current.playVideo();
            break;
          case 'pause':
            playerRef.current.pauseVideo();
            break;
          case 'skip':
            // Instead of skipping instantly, show score first!
            if (currentSong) {
              triggerScoreScreen();
            }
            break;
          case 'restart':
            playerRef.current.seekTo(0, true);
            playerRef.current.playVideo();
            break;
          case 'skipInterlude':
            const currTime = playerRef.current.getCurrentTime();
            playerRef.current.seekTo(currTime + 30, true);
            break;
          default:
            break;
        }
      } catch (err) {
        console.error('Remote action handler error:', err);
      }
    };

    // Listen to custom action event triggered by App
    window.addEventListener('boraebang-control', (e) => {
      if (e.detail && e.detail.action) {
        handleRemoteAction(e.detail.action);
      }
    });

    return () => {
      window.removeEventListener('boraebang-control', handleRemoteAction);
    };
  }, [currentSong, playerLoaded]);

  return (
    <div className="crt-screen crt-flicker" style={playerScreenStyle}>
      {/* Target iframe element wrapper managed by React for visibility */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: currentSong ? 'block' : 'none',
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        <YoutubePlayerContainer />
      </div>


      {/* Standby/Clock Screen (Visible when no song is playing) */}
      {!currentSong && !showScore && (
        <div style={standbyWrapperStyle}>
          <div style={neonCircleStyle}>
            <span style={digitalClockStyle}>{digitalTime}</span>
          </div>
          
          <div style={infoBoxStyle}>
            <h1 className="text-neon-pink" style={{ fontFamily: 'var(--font-sans)', fontSize: '2.2rem', fontWeight: '900', letterSpacing: '2px' }}>
              🎤 보래방 🎤
            </h1>
            <p className="blink-text" style={standbyTextStyle}>
              반주기 대기 중... 노래를 예약해주세요
            </p>
            <div style={helpStyle}>
              <span>1. 왼쪽에서 노래 제목이나 가수를 검색하세요.</span>
              <span>2. 또는 리모컨에 번호를 직접 누르고 [예약]을 누르세요.</span>
              <span>3. 대기열에 노래가 추가되면 [시작]으로 노래방을 즐겨보세요!</span>
            </div>
          </div>
          
          {/* Animated background waves to simulate standby visualizer */}
          <div style={waveContainerStyle}>
            <div className="wave" style={{ ...waveStyle, animationDelay: '0s' }}></div>
            <div className="wave" style={{ ...waveStyle, animationDelay: '0.4s', borderColor: 'var(--color-secondary)' }}></div>
            <div className="wave" style={{ ...waveStyle, animationDelay: '0.8s', borderColor: 'var(--color-accent)' }}></div>
          </div>
        </div>
      )}

      {/* Score Popup Screen */}
      {showScore && (
        <div className="score-overlay">
          <div className="text-neon-yellow" style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '3px' }}>
            🏆 오늘 밤의 노래 점수는? 🏆
          </div>
          <div className="score-number text-neon-pink">{score}</div>
          <div className="score-message">{scoreMsg}</div>
        </div>
      )}
    </div>
  );
}

// Inline Styles for Player Screen
const playerScreenStyle = {
  width: '100%',
  aspectRatio: '16/9',
  maxHeight: '45vh', // Prevent player from taking too much vertical space on wide screens
  position: 'relative',
  background: '#05050f',
  overflow: 'hidden'
};

const standbyWrapperStyle = {
  position: 'absolute',
  top: 0, left: 0, right: 0, bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'radial-gradient(circle, #0e0b29 0%, #03030d 100%)',
  color: '#fff',
  zIndex: 5
};

const neonCircleStyle = {
  border: '3px solid var(--color-secondary)',
  boxShadow: 'var(--glow-cyan), inset var(--glow-cyan)',
  borderRadius: '50%',
  padding: '16px 32px',
  marginBottom: '24px',
  background: 'rgba(0, 0, 0, 0.4)'
};

const digitalClockStyle = {
  fontFamily: 'var(--font-digital)',
  fontSize: '2.5rem',
  fontWeight: 'bold',
  color: 'var(--color-secondary)',
  letterSpacing: '4px'
};

const infoBoxStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  zIndex: 10
};

const standbyTextStyle = {
  color: 'var(--color-accent)',
  textShadow: 'var(--glow-yellow)',
  fontSize: '1.2rem',
  fontWeight: '700',
  marginTop: '12px',
  letterSpacing: '1px'
};

const helpStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  marginTop: '24px',
  fontSize: '0.85rem',
  color: 'var(--text-secondary)',
  textAlign: 'left',
  background: 'rgba(0, 0, 0, 0.5)',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 255, 255, 0.05)'
};

/* Standby wave visualizer animations */
const waveContainerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  width: '100%',
  height: '100px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'flex-end',
  overflow: 'hidden',
  pointerEvents: 'none'
};

const waveStyle = {
  width: '200%',
  height: '200%',
  border: '2px solid var(--color-primary)',
  borderRadius: '43%',
  position: 'absolute',
  bottom: '-150%',
  opacity: 0.15,
  animation: 'wave-anim 12s infinite linear'
};

// Insert wave animation keyframes dynamically to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes wave-anim {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spin-anim {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
