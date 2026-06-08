import React, { useState } from 'react';
import { Search, Star, Plus, Play, ListMusic, Loader, Database } from 'lucide-react';
import { searchKaraoke } from '../services/manana';
import { searchYouTube } from '../services/youtube';

// Custom inline SVG Youtube icon due to brand icons missing in lucide-react 1.17
const Youtube = ({ size = 18, ...props }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.56 49.56 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" fill="currentColor" />
  </svg>
);


export default function SearchPanel({ 
  settings, 
  favorites, 
  onQueueSong, // (song, isPriority)
  onPlayNow, // (song)
  onToggleFavorite 
}) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('db'); // 'db' or 'youtube'
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    setLoading(true);
    setSearched(true);
    setResults([]);

    try {
      if (searchMode === 'db') {
        const data = await searchKaraoke({ query: trimmed, brand: settings.brand });
        setResults(data);
      } else {
        // Direct YouTube search: query prefixed with default search helpers
        const searchQuery = `노래방 ${trimmed}`;
        const data = await searchYouTube({ 
          query: searchQuery, 
          apiKey: settings.youtubeApiKey,
          searchPipedOnly: settings.searchPipedOnly,
          customBackendUrl: settings.customBackendUrl
        });
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('검색 중 오류가 발생했습니다. Piped API 상태를 확인하거나 잠시 후 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (song) => {
    return favorites.some(fav => fav.no === song.no && fav.brand === song.brand);
  };

  const handleDbPlayNow = (song) => {
    onPlayNow(song); // Coordinates youtube search + play
  };

  const handleDbQueue = (song, isPriority = false) => {
    onQueueSong(song, isPriority);
  };

  return (
    <div className="glass-panel" style={panelStyle}>
      {/* Search Header Tabs */}
      <div style={tabsStyle}>
        <button 
          className={searchMode === 'db' ? 'active' : ''} 
          onClick={() => { setSearchMode('db'); setResults([]); setSearched(false); }}
          style={tabBtnStyle}
        >
          <Database size={14} style={{ marginRight: '6px' }} />
          노래방 DB 검색
        </button>
        <button 
          className={searchMode === 'youtube' ? 'active' : ''} 
          onClick={() => { setSearchMode('youtube'); setResults([]); setSearched(false); }}
          style={tabBtnStyle}
        >
          <Youtube size={14} style={{ marginRight: '6px' }} />
          유튜브 직접 검색
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} style={searchBarContainerStyle}>
        <div style={inputWrapperStyle}>
          <input
            type="text"
            className="input-neon"
            placeholder={
              searchMode === 'db' 
                ? "곡 제목, 가수명 또는 곡 번호를 입력하세요..." 
                : "검색어를 입력하세요 (자동으로 '노래방'이 접두사로 추가됩니다)..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" style={searchSubmitBtnStyle}>
            <Search size={18} />
          </button>
        </div>
      </form>

      {/* Search Results Display Area */}
      <div style={resultsContainerStyle}>
        {loading && (
          <div style={statusWrapperStyle}>
            <Loader size={36} color="var(--color-secondary)" className="spin-anim" />
            <p style={{ marginTop: '12px', color: 'var(--text-secondary)' }}>검색결과를 가져오는 중...</p>
          </div>
        )}

        {!loading && results.length === 0 && searched && (
          <div style={statusWrapperStyle}>
            <p style={{ color: 'var(--text-muted)' }}>검색 결과가 없습니다.</p>
          </div>
        )}

        {!loading && !searched && (
          <div style={statusWrapperStyle}>
            <p style={{ color: 'var(--text-muted)' }}>
              {searchMode === 'db' 
                ? "TJ 및 KY 노래방 수록곡 번호를 즉시 찾아보세요." 
                : "유튜브의 노래방 반주 동영상을 다이렉트로 검색해 예약하세요."}
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div style={resultsListStyle}>
            {searchMode === 'db' ? (
              // DB Results Rendering
              results.map((song) => {
                const fav = isFavorite(song);
                return (
                  <div key={`${song.brand}-${song.no}`} style={rowStyle}>
                    <div style={rowLeftStyle}>
                      <div style={metaStyle}>
                        <span style={{ 
                          ...badgeStyle, 
                          backgroundColor: song.brand === 'tj' ? 'rgba(255, 0, 127, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                          color: song.brand === 'tj' ? 'var(--color-primary)' : 'var(--color-secondary)'
                        }}>
                          {song.brand.toUpperCase()}
                        </span>
                        <span style={numberStyle}>{song.no}</span>
                      </div>
                      <span style={songTitleStyle} title={song.title}>{song.title}</span>
                      <span style={singerStyle} title={song.singer}>{song.singer}</span>
                    </div>
                    
                    <div style={rowActionsStyle}>
                      {/* Favorite star */}
                      <button 
                        onClick={() => onToggleFavorite(song)} 
                        style={{ ...rowActionBtnStyle, color: fav ? 'var(--color-accent)' : 'var(--text-muted)' }}
                        title="애창곡 등록/해제"
                      >
                        <Star size={16} fill={fav ? 'var(--color-accent)' : 'transparent'} />
                      </button>
                      {/* Queue */}
                      <button 
                        onClick={() => handleDbQueue(song, false)} 
                        style={rowActionBtnStyle}
                        title="예약"
                      >
                        <Plus size={16} />
                      </button>
                      {/* Priority queue */}
                      <button 
                        onClick={() => handleDbQueue(song, true)} 
                        style={rowActionBtnStyle}
                        title="우선예약"
                      >
                        <ListMusic size={16} />
                      </button>
                      {/* Play Now */}
                      <button 
                        onClick={() => handleDbPlayNow(song)} 
                        style={rowActionPlayBtnStyle}
                        title="즉시 재생"
                      >
                        <Play size={14} fill="#000" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              // YouTube Direct Results Rendering
              results.map((video) => (
                <div key={video.videoId} style={youtubeRowStyle}>
                  <img src={video.thumbnail} alt={video.title} style={ytThumbStyle} />
                  <div style={ytDetailsStyle}>
                    <span style={ytTitleStyle} title={video.title}>{video.title}</span>
                    <span style={ytChannelStyle}>{video.author}</span>
                    <div style={ytActionsStyle}>
                      <button 
                        className="btn-neon btn-neon-cyan" 
                        onClick={() => onQueueSong({
                          brand: 'youtube',
                          no: 'YT',
                          title: video.title,
                          singer: video.author,
                          videoId: video.videoId,
                          thumbnail: video.thumbnail
                        }, false)}
                        style={ytBtnStyle}
                      >
                        <Plus size={12} /> 예약
                      </button>
                      <button 
                        className="btn-neon" 
                        onClick={() => onQueueSong({
                          brand: 'youtube',
                          no: 'YT',
                          title: video.title,
                          singer: video.author,
                          videoId: video.videoId,
                          thumbnail: video.thumbnail
                        }, true)}
                        style={ytBtnStyle}
                      >
                        <ListMusic size={12} /> 우선예약
                      </button>
                      <button 
                        className="btn-neon btn-neon-cyan" 
                        onClick={() => onPlayNow({
                          brand: 'youtube',
                          no: 'YT',
                          title: video.title,
                          singer: video.author,
                          videoId: video.videoId,
                          thumbnail: video.thumbnail
                        })}
                        style={{ ...ytBtnStyle, background: 'var(--color-secondary)', color: '#000' }}
                      >
                        <Play size={12} fill="#000" /> 재생
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline Styles
const panelStyle = {
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  minHeight: 0
};

const tabsStyle = {
  display: 'flex',
  gap: '8px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  paddingBottom: '8px',
  marginBottom: '16px'
};

const tabBtnStyle = {
  flex: 1,
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  padding: '10px',
  cursor: 'pointer',
  fontWeight: '600',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  outline: 'none',
  fontSize: '0.85rem'
};

// Styling for active tab inside component
const searchBarContainerStyle = {
  marginBottom: '16px'
};

const inputWrapperStyle = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center'
};

const searchSubmitBtnStyle = {
  position: 'absolute',
  right: '8px',
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',
  transition: 'all 0.2s',
  ':hover': { color: 'var(--color-secondary)' }
};

const resultsContainerStyle = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column'
};

const statusWrapperStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '60px 20px',
  textAlign: 'center',
  flex: 1
};

const resultsListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const rowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.015)',
  border: '1px solid rgba(255, 255, 255, 0.03)',
  transition: 'all 0.2s',
  ':hover': { background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.08)' }
};

const rowLeftStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
  paddingRight: '12px'
};

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '4px'
};

const badgeStyle = {
  padding: '1px 5px',
  borderRadius: '4px',
  fontSize: '0.6rem',
  fontWeight: '700'
};

const numberStyle = {
  fontFamily: 'var(--font-digital)',
  color: 'var(--color-accent)',
  fontWeight: 'bold',
  fontSize: '0.85rem'
};

const songTitleStyle = {
  fontWeight: '600',
  fontSize: '0.9rem',
  color: '#fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const singerStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  marginTop: '2px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const rowActionsStyle = {
  display: 'flex',
  gap: '4px'
};

const rowActionBtnStyle = {
  background: 'rgba(5, 5, 13, 0.6)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
  width: '32px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  transition: 'all 0.2s',
  ':hover': { color: '#fff', background: 'rgba(255,255,255,0.1)' }
};

const rowActionPlayBtnStyle = {
  ...rowActionBtnStyle,
  background: 'var(--color-secondary)',
  borderColor: 'var(--color-secondary)',
  color: '#000',
  ':hover': { 
    background: '#00d2ff', 
    boxShadow: 'var(--glow-cyan)' 
  }
};

/* YouTube specific results styling */
const youtubeRowStyle = {
  display: 'flex',
  gap: '12px',
  padding: '10px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.015)',
  border: '1px solid rgba(255,255,255,0.03)'
};

const ytThumbStyle = {
  width: '90px',
  height: '68px',
  objectFit: 'cover',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const ytDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0
};

const ytTitleStyle = {
  fontWeight: '600',
  fontSize: '0.85rem',
  color: '#fff',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: '1.3'
};

const ytChannelStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '4px'
};

const ytActionsStyle = {
  display: 'flex',
  gap: '4px',
  marginTop: '6px'
};

const ytBtnStyle = {
  padding: '4px 8px',
  fontSize: '0.7rem',
  borderRadius: '4px',
  height: '24px'
};
