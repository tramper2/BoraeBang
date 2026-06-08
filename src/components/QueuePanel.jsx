import React from 'react';
import { ArrowUp, ArrowDown, Trash2, Music, Play } from 'lucide-react';

export default function QueuePanel({ queue, currentSong, onMoveUp, onMoveDown, onRemoveFromQueue }) {
  const hasQueue = queue && queue.length > 0;
  const isPlaying = !!currentSong;

  if (!isPlaying && !hasQueue) {
    return (
      <div style={emptyStateStyle}>
        <Music size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>예약된 곡이 없습니다.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>노래를 검색하여 예약해주세요!</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Current Playing Song */}
      {currentSong && (
        <div style={currentContainerStyle}>
          <h3 style={currentTitleStyle}>
            <span className="blink-text" style={playingDotStyle}></span>
            현재 연주중 (Now Playing)
          </h3>
          <div className="glass-panel" style={currentCardStyle}>
            <div style={currentLeftStyle}>
              <div style={metaStyle}>
                <span style={{ 
                  ...badgeStyle, 
                  backgroundColor: currentSong.brand === 'tj' ? 'rgba(255, 0, 127, 0.25)' : 'rgba(0, 240, 255, 0.25)',
                  color: currentSong.brand === 'tj' ? 'var(--color-primary)' : 'var(--color-secondary)'
                }}>
                  {currentSong.brand.toUpperCase()}
                </span>
                <span style={numberStyle}>{currentSong.no || '유튜브'}</span>
              </div>
              <span style={currentSongTitleStyle}>{currentSong.title}</span>
              <span style={currentSingerStyle}>{currentSong.singer}</span>
            </div>
            {currentSong.thumbnail && (
              <img 
                src={currentSong.thumbnail} 
                alt="thumbnail" 
                style={thumbnailStyle}
              />
            )}
          </div>
        </div>
      )}

      {/* Queue List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <h3 style={upcomingTitleStyle}>
          예약 대기곡 ({queue.length}곡)
        </h3>
        
        {queue.length === 0 ? (
          <div style={emptyUpcomingStyle}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>대기 중인 다음 곡이 없습니다.</p>
          </div>
        ) : (
          <div style={listStyle}>
            {queue.map((song, index) => (
              <div key={song.queueId || `${song.brand}-${song.no}-${index}`} className="glass-panel" style={itemStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                  <span style={indexStyle}>{index + 1}</span>
                  <div style={itemDetailsStyle}>
                    <span style={songTitleStyle} title={song.title}>{song.title}</span>
                    <span style={singerStyle} title={song.singer}>{song.singer}</span>
                  </div>
                </div>
                
                <div style={actionsStyle}>
                  {/* Move Up */}
                  <button 
                    disabled={index === 0} 
                    onClick={() => onMoveUp(index)} 
                    style={{ ...actionBtnStyle, opacity: index === 0 ? 0.3 : 1 }}
                    title="위로 이동"
                  >
                    <ArrowUp size={14} />
                  </button>
                  {/* Move Down */}
                  <button 
                    disabled={index === queue.length - 1} 
                    onClick={() => onMoveDown(index)} 
                    style={{ ...actionBtnStyle, opacity: index === queue.length - 1 ? 0.3 : 1 }}
                    title="아래로 이동"
                  >
                    <ArrowDown size={14} />
                  </button>
                  {/* Delete */}
                  <button 
                    onClick={() => onRemoveFromQueue(index)} 
                    style={deleteBtnStyle}
                    title="예약 취소"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const emptyStateStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  textAlign: 'center'
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '100%',
  minHeight: 0
};

const currentContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const currentTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--color-primary)',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
};

const playingDotStyle = {
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  backgroundColor: 'var(--color-primary)',
  boxShadow: '0 0 8px var(--color-primary)'
};

const currentCardStyle = {
  padding: '14px',
  borderRadius: '12px',
  border: '1px solid rgba(255, 0, 127, 0.25)',
  boxShadow: '0 4px 20px rgba(255, 0, 127, 0.15)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '12px',
  background: 'linear-gradient(135deg, rgba(255, 0, 127, 0.05) 0%, rgba(18, 16, 38, 0.8) 100%)'
};

const currentLeftStyle = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0
};

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  marginBottom: '6px'
};

const badgeStyle = {
  padding: '2px 6px',
  borderRadius: '4px',
  fontSize: '0.65rem',
  fontWeight: '700'
};

const numberStyle = {
  fontFamily: 'var(--font-digital)',
  color: 'var(--color-accent)',
  fontSize: '0.85rem',
  letterSpacing: '0.5px'
};

const currentSongTitleStyle = {
  fontWeight: '700',
  fontSize: '1rem',
  color: '#fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const currentSingerStyle = {
  fontSize: '0.8rem',
  color: 'var(--text-secondary)',
  marginTop: '2px'
};

const thumbnailStyle = {
  width: '56px',
  height: '42px',
  objectFit: 'cover',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)'
};

const upcomingTitleStyle = {
  fontSize: '0.85rem',
  fontWeight: '700',
  color: 'var(--text-secondary)',
  marginBottom: '10px'
};

const emptyUpcomingStyle = {
  padding: '20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.01)',
  borderRadius: '8px',
  border: '1px dashed rgba(255, 255, 255, 0.05)'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  overflowY: 'auto',
  flex: 1,
  paddingRight: '4px'
};

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '10px 12px',
  borderRadius: '10px',
  background: 'rgba(255, 255, 255, 0.02)'
};

const indexStyle = {
  fontFamily: 'var(--font-digital)',
  color: 'var(--color-secondary)',
  fontSize: '0.85rem',
  width: '16px',
  textAlign: 'center'
};

const itemDetailsStyle = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0
};

const songTitleStyle = {
  fontWeight: '500',
  fontSize: '0.85rem',
  color: '#fff',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const singerStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-secondary)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  marginTop: '2px'
};

const actionsStyle = {
  display: 'flex',
  gap: '2px'
};

const actionBtnStyle = {
  background: 'transparent',
  border: 'none',
  borderRadius: '4px',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-muted)',
  transition: 'all 0.2s',
  ':hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' }
};

const deleteBtnStyle = {
  ...actionBtnStyle,
  ':hover': { color: '#ff4d4d', background: 'rgba(255, 77, 77, 0.05)' }
};
