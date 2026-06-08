import React from 'react';
import { Star, Play, Plus, ListMusic, Trash2 } from 'lucide-react';

export default function FavoritesPanel({ favorites, onQueueSong, onRemoveFavorite }) {
  if (!favorites || favorites.length === 0) {
    return (
      <div style={emptyStateStyle}>
        <Star size={36} color="var(--text-muted)" style={{ marginBottom: '12px', opacity: 0.5 }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>아직 등록된 애창곡이 없습니다.</p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>노래 검색 후 별표(★)를 눌러 등록해보세요!</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>
        <Star size={16} fill="var(--color-accent)" color="var(--color-accent)" />
        애창곡 목록 ({favorites.length})
      </h3>
      <div style={listStyle}>
        {favorites.map((song) => (
          <div key={`${song.brand}-${song.no}`} className="glass-panel" style={itemStyle}>
            <div style={leftStyle}>
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
              <div style={titleTextContainerStyle}>
                <span style={songTitleStyle} title={song.title}>{song.title}</span>
                <span style={singerStyle} title={song.singer}>{song.singer}</span>
              </div>
            </div>
            <div style={actionsStyle}>
              {/* Queue Button */}
              <button 
                title="예약"
                onClick={() => onQueueSong(song, false)} 
                style={queueBtnStyle}
              >
                <Plus size={16} />
              </button>
              {/* Priority Queue Button */}
              <button 
                title="우선예약"
                onClick={() => onQueueSong(song, true)} 
                style={priorityBtnStyle}
              >
                <ListMusic size={16} />
              </button>
              {/* Remove Favorite */}
              <button 
                title="즐겨찾기 삭제"
                onClick={() => onRemoveFavorite(song)} 
                style={deleteBtnStyle}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
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
  height: '100%'
};

const titleStyle = {
  fontSize: '1rem',
  fontWeight: '600',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
};

const listStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 250px)',
  paddingRight: '4px'
};

const itemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '12px',
  borderRadius: '12px',
  background: 'rgba(255, 255, 255, 0.02)'
};

const leftStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  flex: 1,
  minWidth: 0,
  paddingRight: '8px'
};

const metaStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px'
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
  fontWeight: 'bold',
  fontSize: '0.9rem',
  letterSpacing: '1px'
};

const titleTextContainerStyle = {
  display: 'flex',
  flexDirection: 'column'
};

const songTitleStyle = {
  fontWeight: '500',
  fontSize: '0.85rem',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  color: '#fff'
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
  gap: '4px'
};

const actionBtnBase = {
  background: 'rgba(5, 5, 13, 0.6)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '6px',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--text-secondary)',
  transition: 'all 0.2s'
};

const queueBtnStyle = {
  ...actionBtnBase,
  ':hover': {
    color: 'var(--color-secondary)',
    borderColor: 'var(--color-secondary)',
    background: 'rgba(0, 240, 255, 0.05)'
  }
};

const priorityBtnStyle = {
  ...actionBtnBase,
  ':hover': {
    color: 'var(--color-primary)',
    borderColor: 'var(--color-primary)',
    background: 'rgba(255, 0, 127, 0.05)'
  }
};

const deleteBtnStyle = {
  ...actionBtnBase,
  ':hover': {
    color: '#ff4d4d',
    borderColor: 'rgba(255, 77, 77, 0.4)',
    background: 'rgba(255, 77, 77, 0.05)'
  }
};
