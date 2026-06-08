import React, { useState } from 'react';
import { Delete, Play, Square, Plus, ChevronsRight, FastForward, RotateCcw } from 'lucide-react';

export default function RemoteControl({ 
  currentSong, 
  tempo, 
  onControlAction, // 'play', 'pause', 'skip', 'restart', 'tempoUp', 'tempoDown', 'skipInterlude', 'toggleVerse1'
  onReserveNumber, // (number, isPriority)
  isVerse1Mode
}) {
  const [numInput, setNumInput] = useState('');

  const handleNumClick = (val) => {
    if (numInput.length < 6) {
      setNumInput(prev => prev + val);
    }
  };

  const handleBackspace = () => {
    setNumInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setNumInput('');
  };

  const handleReserve = (isPriority = false) => {
    if (numInput.trim()) {
      onReserveNumber(numInput.trim(), isPriority);
      setNumInput('');
    }
  };

  const handleStartDirect = () => {
    if (numInput.trim()) {
      onReserveNumber(numInput.trim(), false, true); // Play immediately
      setNumInput('');
    } else {
      onControlAction('play');
    }
  };

  return (
    <div className="glass-panel" style={remoteStyle}>
      {/* Remote LCD Display */}
      <div style={lcdStyle}>
        <div style={lcdLabelStyle}>BoraeBang SYSTEM</div>
        <div style={lcdValueStyle}>
          {numInput || (currentSong ? 'PLAYING' : 'STANDBY')}
        </div>
        <div style={lcdSubStyle}>
          <span>배속: {tempo.toFixed(2)}x</span>
          {isVerse1Mode && <span style={{ color: 'var(--color-primary)' }}>[1절 연주]</span>}
        </div>
      </div>

      {/* Control Buttons Grid */}
      <div style={buttonGridStyle}>
        {/* Row 1: Key & Tempo controls */}
        <button onClick={() => onControlAction('tempoDown')} style={btnSubStyle} title="템포 느리게">
          템포 ▼
        </button>
        <button onClick={() => onControlAction('tempoUp')} style={btnSubStyle} title="템포 빠르게">
          템포 ▲
        </button>
        <button onClick={() => onControlAction('restart')} style={btnSubStyle} title="처음부터 다시">
          <RotateCcw size={12} />
          다시
        </button>

        {/* Row 2: Melody/Jump controls */}
        <button onClick={() => onControlAction('toggleVerse1')} style={{ ...btnSubStyle, color: isVerse1Mode ? 'var(--color-primary)' : '#fff' }} title="1절만 재생">
          1절 연주
        </button>
        <button onClick={() => onControlAction('skipInterlude')} style={btnSubStyle} title="간주 점프 (30초 건너뛰기)">
          간주점프
        </button>
        <button onClick={handleBackspace} style={btnSubStyle} title="지우기">
          <Delete size={12} />
          지움
        </button>
      </div>

      {/* Numeric Pad */}
      <div style={numPadStyle}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            onClick={() => handleNumClick(num.toString())} 
            style={numBtnStyle}
          >
            {num}
          </button>
        ))}
        <button onClick={handleClear} style={{ ...numBtnStyle, color: '#ff4d4d' }}>
          취소
        </button>
        <button onClick={() => handleNumClick('0')} style={numBtnStyle}>
          0
        </button>
        <button onClick={() => handleReserve(true)} style={priorityBtnStyle} title="우선 예약">
          우선
        </button>
      </div>

      {/* Large Bottom Action Buttons */}
      <div style={actionRowStyle}>
        <button onClick={() => handleReserve(false)} style={reserveBtnStyle}>
          <Plus size={16} />
          예약
        </button>
        <button onClick={handleStartDirect} style={startBtnStyle}>
          <Play size={16} fill="#fff" />
          시작
        </button>
        <button onClick={() => onControlAction('skip')} style={cancelBtnStyle}>
          <Square size={14} fill="#fff" />
          정지 / 취소
        </button>
      </div>
    </div>
  );
}

// Styles
const remoteStyle = {
  background: 'rgba(15, 12, 30, 0.95)',
  border: '2px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '24px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  boxShadow: '0 15px 40px rgba(0, 0, 0, 0.7), inset 0 0 20px rgba(255, 255, 255, 0.05)',
  width: '100%',
  maxWidth: '320px',
  margin: '0 auto'
};

const lcdStyle = {
  background: '#091509',
  border: '2px solid #1a301a',
  borderRadius: '10px',
  padding: '12px',
  fontFamily: 'var(--font-digital)',
  color: '#39ff14',
  textShadow: '0 0 5px rgba(57, 255, 20, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80px',
  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
};

const lcdLabelStyle = {
  fontSize: '0.65rem',
  color: 'rgba(57, 255, 20, 0.6)',
  letterSpacing: '2px',
  marginBottom: '6px'
};

const lcdValueStyle = {
  fontSize: '1.6rem',
  fontWeight: '900',
  letterSpacing: '3px',
  textAlign: 'center',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
};

const lcdSubStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  fontSize: '0.65rem',
  marginTop: '6px',
  color: 'rgba(57, 255, 20, 0.6)'
};

const buttonGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '8px'
};

const btnSubStyle = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '8px',
  color: '#fff',
  padding: '8px 4px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
  transition: 'all 0.2s',
  ':hover': { background: 'rgba(255, 255, 255, 0.12)', borderColor: 'rgba(255, 255, 255, 0.2)' }
};

const numPadStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  background: 'rgba(0, 0, 0, 0.2)',
  padding: '12px',
  borderRadius: '16px',
  border: '1px solid rgba(255, 255, 255, 0.03)'
};

const numBtnStyle = {
  background: '#1b1a2e',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: '50%',
  width: '56px',
  height: '56px',
  fontSize: '1.25rem',
  fontWeight: '700',
  color: '#fff',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3), inset 0 2px 2px rgba(255,255,255,0.05)',
  transition: 'all 0.15s',
  ':hover': { transform: 'scale(1.05)', background: '#25233d' },
  ':active': { transform: 'scale(0.95)' }
};

const priorityBtnStyle = {
  ...numBtnStyle,
  background: 'rgba(255, 230, 0, 0.1)',
  border: '1px solid rgba(255, 230, 0, 0.3)',
  color: 'var(--color-accent)',
  fontSize: '0.95rem',
  ':hover': { background: 'rgba(255, 230, 0, 0.2)' }
};

const actionRowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  marginTop: '8px'
};

const actionBtnBase = {
  border: 'none',
  borderRadius: '12px',
  padding: '12px',
  fontWeight: '700',
  fontSize: '0.95rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  color: '#fff',
  transition: 'all 0.2s',
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

const reserveBtnStyle = {
  ...actionBtnBase,
  background: 'linear-gradient(135deg, #00d2ff 0%, #00a8cc 100%)',
  ':hover': { boxShadow: '0 0 15px rgba(0, 240, 255, 0.4)', transform: 'translateY(-1px)' }
};

const startBtnStyle = {
  ...actionBtnBase,
  background: 'linear-gradient(135deg, #39ff14 0%, #2bc00f 100%)',
  color: '#000',
  ':hover': { boxShadow: '0 0 15px rgba(57, 255, 20, 0.4)', transform: 'translateY(-1px)' }
};

const cancelBtnStyle = {
  ...actionBtnBase,
  background: 'linear-gradient(135deg, #ff007f 0%, #d8006b 100%)',
  ':hover': { boxShadow: '0 0 15px rgba(255, 0, 127, 0.4)', transform: 'translateY(-1px)' }
};
