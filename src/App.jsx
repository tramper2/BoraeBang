import React, { useState, useEffect } from 'react';
import { Settings, Volume2, VolumeX, Menu, Heart, History, ListMusic, ChevronLeft, ChevronRight } from 'lucide-react';
import KaraokePlayer from './components/KaraokePlayer';
import SearchPanel from './components/SearchPanel';
import QueuePanel from './components/QueuePanel';
import RemoteControl from './components/RemoteControl';
import FavoritesPanel from './components/FavoritesPanel';
import SettingsModal from './components/SettingsModal';
import { searchYouTube } from './services/youtube';
import { searchKaraoke } from './services/manana';

export default function App() {
  // --- Local Storage Initialization ---
  const loadStored = (key, defaultVal) => {
    const val = localStorage.getItem(key);
    if (!val) return defaultVal;
    try { return JSON.parse(val); } catch (e) { return defaultVal; }
  };

  const [settings, setSettings] = useState(() => {
    const stored = loadStored('boraebang_settings', {});
    return {
      brand: 'tj',
      youtubeApiKey: '',
      searchPipedOnly: true,
      pipedInstance: 'https://pipedapi.moomoo.me',
      customBackendUrl: '',
      ...stored
    };
  });

  const [favorites, setFavorites] = useState(() => loadStored('boraebang_favorites', []));
  const [history, setHistory] = useState(() => loadStored('boraebang_history', []));

  // --- Core Application States ---
  const [queue, setQueue] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  
  // Tab states for the right panel
  const [activeTab, setActiveTab] = useState('queue'); // 'queue', 'favorites', 'history'
  
  // Playback control states
  const [tempo, setTempo] = useState(1.0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isVerse1Mode, setIsVerse1Mode] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // Layout states
  const [showSettings, setShowSettings] = useState(false);
  const [remoteOpen, setRemoteOpen] = useState(true);
  
  // Loading status overlay
  const [resolvingSong, setResolvingSong] = useState(false);

  // --- Sync with LocalStorage ---
  useEffect(() => {
    localStorage.setItem('boraebang_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('boraebang_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('boraebang_history', JSON.stringify(history));
  }, [history]);

  // --- Song Resolution Logic ---
  /**
   * Resolves a database track/number into a YouTube Video ID.
   * Priority 1: Search brand + number (e.g. "TJ 12345")
   * Priority 2: Search brand + singer + title
   */
  const resolveYoutubeVideo = async (song) => {
    // If the song already has a videoId, return it directly
    if (song.videoId) return song;

    const brandName = (song.brand || settings.brand).toUpperCase();
    const no = song.no;

    // Search query 1: "TJ 12345"
    let searchQuery = `${brandName} ${no}`;
    let videos = [];
    try {
      videos = await searchYouTube({
        query: searchQuery,
        apiKey: settings.youtubeApiKey,
        searchPipedOnly: settings.searchPipedOnly,
        customBackendUrl: settings.customBackendUrl
      });
    } catch (e) {
      console.warn('First query failed, trying search query 2...');
    }

    // If query 1 returns nothing, try search query 2: "TJ 노래방 아이유 밤편지"
    if (videos.length === 0) {
      searchQuery = `${brandName} 노래방 ${song.singer} ${song.title}`;
      try {
        videos = await searchYouTube({
          query: searchQuery,
          apiKey: settings.youtubeApiKey,
          searchPipedOnly: settings.searchPipedOnly,
          customBackendUrl: settings.customBackendUrl
        });
      } catch (e) {
        console.error('Failed to resolve video on both queries:', e);
      }
    }

    if (videos.length > 0) {
      return {
        ...song,
        videoId: videos[0].videoId,
        thumbnail: videos[0].thumbnail
      };
    } else {
      throw new Error('노래방 영상을 찾을 수 없습니다.');
    }
  };

  // --- Queue Actions ---
  const handleQueueSong = async (song, isPriority = false) => {
    setResolvingSong(true);
    try {
      const resolved = await resolveYoutubeVideo(song);
      const queueItem = {
        ...resolved,
        queueId: `${resolved.brand}-${resolved.no}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };

      setQueue(prev => {
        const newQueue = [...prev];
        if (isPriority) {
          newQueue.unshift(queueItem);
        } else {
          newQueue.push(queueItem);
        }
        return newQueue;
      });

      // If no song is playing, play this song immediately!
      if (!currentSong) {
        setTimeout(() => startNextSong(), 100);
      }
    } catch (err) {
      alert(err.message || '영상을 예약하는 데 실패했습니다.');
    } finally {
      setResolvingSong(false);
    }
  };

  const handlePlayNow = async (song) => {
    setResolvingSong(true);
    try {
      const resolved = await resolveYoutubeVideo(song);
      
      // Stop currently playing
      setCurrentSong(null);
      
      // Reset controls
      setTempo(1.0);
      
      // Update current song
      setCurrentSong(resolved);
      addToHistory(resolved);
    } catch (err) {
      alert(err.message || '영상을 재생하는 데 실패했습니다.');
    } finally {
      setResolvingSong(false);
    }
  };

  const startNextSong = () => {
    setQueue(prev => {
      if (prev.length === 0) {
        setCurrentSong(null);
        return prev;
      }
      const next = prev[0];
      const remaining = prev.slice(1);
      
      setCurrentSong(next);
      addToHistory(next);
      setTempo(1.0); // Reset tempo for next song
      
      return remaining;
    });
  };

  const handleRemoveFromQueue = (index) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setQueue(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    setQueue(prev => {
      if (index === prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  // --- History Management ---
  const addToHistory = (song) => {
    setHistory(prev => {
      const filtered = prev.filter(item => !(item.no === song.no && item.brand === song.brand));
      const newHist = [song, ...filtered];
      return newHist.slice(0, 30); // limit to 30 items
    });
  };

  // --- Favorite Actions ---
  const handleToggleFavorite = (song) => {
    setFavorites(prev => {
      const isFav = prev.some(item => item.no === song.no && item.brand === song.brand);
      if (isFav) {
        return prev.filter(item => !(item.no === song.no && item.brand === song.brand));
      } else {
        return [song, ...prev];
      }
    });
  };

  const handleRemoveFavorite = (song) => {
    setFavorites(prev => prev.filter(item => !(item.no === song.no && item.brand === song.brand)));
  };

  // --- Remote Numeric Lookup Actions ---
  const handleReserveNumber = async (number, isPriority = false, playImmediately = false) => {
    setResolvingSong(true);
    try {
      // 1. Search manana db for the song number
      const searchRes = await searchKaraoke({ query: number, brand: settings.brand });
      
      let songItem;
      if (searchRes.length > 0) {
        songItem = searchRes[0];
      } else {
        // Fallback: If not in database, search YouTube for "TJ 번호" directly
        const brandName = settings.brand.toUpperCase();
        const searchQuery = `${brandName} ${number}`;
        const videos = await searchYouTube({
          query: searchQuery,
          apiKey: settings.youtubeApiKey,
          searchPipedOnly: settings.searchPipedOnly,
          customBackendUrl: settings.customBackendUrl
        });

        if (videos.length > 0) {
          songItem = {
            brand: settings.brand,
            no: number,
            title: videos[0].title,
            singer: videos[0].author,
            videoId: videos[0].videoId,
            thumbnail: videos[0].thumbnail
          };
        } else {
          throw new Error('해당 번호의 노래방 영상을 찾을 수 없습니다.');
        }
      }

      if (playImmediately) {
        handlePlayNow(songItem);
      } else {
        handleQueueSong(songItem, isPriority);
      }
    } catch (err) {
      alert(err.message || '번호 조회 및 등록에 실패했습니다.');
    } finally {
      setResolvingSong(false);
    }
  };

  // --- Control Button Action Coordinator ---
  const handleControlAction = (action) => {
    switch (action) {
      case 'tempoUp':
        setTempo(prev => Math.min(prev + 0.05, 1.25));
        break;
      case 'tempoDown':
        setTempo(prev => Math.max(prev - 0.05, 0.75));
        break;
      case 'toggleVerse1':
        setIsVerse1Mode(prev => !prev);
        break;
      case 'volumeUp':
        setVolume(prev => Math.min(prev + 10, 100));
        setIsMuted(false);
        break;
      case 'volumeDown':
        setVolume(prev => Math.max(prev - 10, 0));
        break;
      case 'toggleMute':
        setIsMuted(prev => !prev);
        break;
      default:
        // Play, Pause, Skip, Restart, SkipInterlude are caught by EventListener inside KaraokePlayer
        window.dispatchEvent(new CustomEvent('boraebang-control', { detail: { action } }));
        break;
    }
  };

  return (
    <div style={appContainerStyle}>
      {/* 1. Header Navigation */}
      <header className="glass-panel" style={headerStyle}>
        <div style={logoWrapperStyle}>
          <h1 className="text-neon-cyan" style={logoStyle}>BoraeBang 🎤</h1>
          <span style={logoSubtitleStyle}>온라인 노래방</span>
        </div>

        {/* Global Controls */}
        <div style={globalControlWrapperStyle}>
          {/* Volume control */}
          <div style={volumeControlStyle}>
            <button onClick={() => handleControlAction('toggleMute')} style={volBtnStyle}>
              {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input 
              type="range" 
              min="0" max="100" 
              value={isMuted ? 0 : volume} 
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              style={volumeSliderStyle} 
            />
          </div>

          {/* Toggle Remote button */}
          <button 
            className="btn-neon btn-neon-cyan" 
            onClick={() => setRemoteOpen(!remoteOpen)}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            리모컨 {remoteOpen ? '닫기' : '열기'}
          </button>

          {/* Settings button */}
          <button onClick={() => setShowSettings(true)} style={settingsBtnStyle} title="설정">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main style={mainLayoutStyle}>
        
        {/* Left Side: Player Screen & Search Panel */}
        <div style={leftColumnStyle}>
          
          {/* Karaoke Screen */}
          <KaraokePlayer 
            currentSong={currentSong}
            tempo={tempo}
            volume={volume}
            isMuted={isMuted}
            isVerse1Mode={isVerse1Mode}
            onControlAction={handleControlAction}
            onSongEnded={startNextSong}
            onPlayerReadyState={setPlayerReady}
          />

          {/* Search Panel */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <SearchPanel 
              settings={settings}
              favorites={favorites}
              onQueueSong={handleQueueSong}
              onPlayNow={handlePlayNow}
              onToggleFavorite={handleToggleFavorite}
            />
          </div>
        </div>

        {/* Right Side: Tab panel (Queue, Favorites, History) & Remote control */}
        <div style={{ ...rightColumnStyle, width: remoteOpen ? '320px' : '0px', opacity: remoteOpen ? 1 : 0, overflow: remoteOpen ? 'visible' : 'hidden' }}>
          {/* Tabs header inside Sidebar */}
          <div className="glass-panel" style={rightTabWrapperStyle}>
            <div className="tab-container" style={{ width: '100%' }}>
              <button 
                className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
                onClick={() => setActiveTab('queue')}
                style={{ flex: 1, fontSize: '0.8rem', padding: '6px 0' }}
              >
                예약곡
              </button>
              <button 
                className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
                onClick={() => setActiveTab('favorites')}
                style={{ flex: 1, fontSize: '0.8rem', padding: '6px 0' }}
              >
                애창곡
              </button>
              <button 
                className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
                style={{ flex: 1, fontSize: '0.8rem', padding: '6px 0' }}
              >
                최근곡
              </button>
            </div>

            <div style={tabBodyStyle}>
              {activeTab === 'queue' && (
                <QueuePanel 
                  queue={queue}
                  currentSong={currentSong}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onRemoveFromQueue={handleRemoveFromQueue}
                />
              )}

              {activeTab === 'favorites' && (
                <FavoritesPanel 
                  favorites={favorites}
                  onQueueSong={handleQueueSong}
                  onRemoveFavorite={handleRemoveFavorite}
                />
              )}

              {activeTab === 'history' && (
                <QueuePanel 
                  queue={history.map(item => ({ ...item, queueId: `history-${item.brand}-${item.no}` }))}
                  currentSong={null}
                  onMoveUp={() => {}}
                  onMoveDown={() => {}}
                  onRemoveFromQueue={(idx) => setHistory(prev => prev.filter((_, i) => i !== idx))}
                />
              )}
            </div>
          </div>

          {/* Karaoke Remote Control Widget */}
          <RemoteControl 
            currentSong={currentSong}
            tempo={tempo}
            onControlAction={handleControlAction}
            onReserveNumber={handleReserveNumber}
            isVerse1Mode={isVerse1Mode}
          />
        </div>
      </main>

      {/* 3. Loading Overlay for Song Resolution */}
      {resolvingSong && (
        <div style={loaderOverlayStyle}>
          <div className="glass-panel" style={loaderCardStyle}>
            <span className="spin-anim" style={spinnerStyle}></span>
            <span style={{ fontWeight: '500' }}>유튜브 노래방 비디오 매칭 중...</span>
          </div>
        </div>
      )}

      {/* 4. Settings Modal */}
      {showSettings && (
        <SettingsModal 
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}

// App-wide CSS styles
const appContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  width: '100vw',
  overflow: 'hidden',
  padding: '12px'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 20px',
  borderRadius: '16px',
  marginBottom: '12px',
  height: '60px'
};

const logoWrapperStyle = {
  display: 'flex',
  alignItems: 'baseline',
  gap: '8px'
};

const logoStyle = {
  fontSize: '1.4rem',
  fontWeight: '900',
  letterSpacing: '1px'
};

const logoSubtitleStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  fontWeight: '500'
};

const globalControlWrapperStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px'
};

const volumeControlStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(5, 5, 13, 0.4)',
  padding: '4px 8px',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const volBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  ':hover': { color: '#fff' }
};

const volumeSliderStyle = {
  width: '80px',
  accentColor: 'var(--color-secondary)',
  cursor: 'pointer'
};

const settingsBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px',
  borderRadius: '50%',
  transition: 'all 0.2s',
  ':hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' }
};

const mainLayoutStyle = {
  display: 'flex',
  gap: '12px',
  flex: 1,
  minHeight: 0
};

const leftColumnStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  minWidth: 0
};

const rightColumnStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  transition: 'width 0.3s ease, opacity 0.3s ease'
};

const rightTabWrapperStyle = {
  flex: 1,
  minHeight: 0,
  padding: '12px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
};

const tabBodyStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto'
};

/* Spinner / Loader Overlays */
const loaderOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5, 5, 13, 0.7)',
  backdropFilter: 'blur(4px)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const loaderCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  padding: '20px 24px',
  borderRadius: '12px',
  boxShadow: '0 0 25px rgba(255, 0, 127, 0.2)',
  border: '1px solid rgba(255, 0, 127, 0.3)',
  color: '#fff'
};

const spinnerStyle = {
  width: '24px',
  height: '24px',
  border: '3px solid rgba(255, 0, 127, 0.2)',
  borderTop: '3px solid var(--color-primary)',
  borderRadius: '50%',
  display: 'inline-block'
};
