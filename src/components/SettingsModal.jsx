import React, { useState, useEffect } from 'react';
import { X, Key, Info, RefreshCw, Trash2, Check, AlertCircle } from 'lucide-react';
import { PIPED_INSTANCES, getActivePipedInstance } from '../services/youtube';

export default function SettingsModal({ settings, onSave, onClose }) {
  const [brand, setBrand] = useState(settings.brand || 'tj');
  const [youtubeApiKey, setYoutubeApiKey] = useState(settings.youtubeApiKey || '');
  const [searchPipedOnly, setSearchPipedOnly] = useState(settings.searchPipedOnly || true);
  const [pipedInstance, setPipedInstance] = useState(settings.pipedInstance || getActivePipedInstance());
  const [customBackendUrl, setCustomBackendUrl] = useState(settings.customBackendUrl || '');
  const [testStatus, setTestStatus] = useState({});
  const [testing, setTesting] = useState(false);

  const handleSave = () => {
    onSave({
      brand,
      youtubeApiKey,
      searchPipedOnly,
      pipedInstance,
      customBackendUrl
    });
    onClose();
  };

  const testInstances = async () => {
    setTesting(true);
    const results = {};
    for (const inst of PIPED_INSTANCES) {
      results[inst] = 'testing';
      setTestStatus({ ...results });
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const res = await fetch(`${inst}/suggestions?query=iu`, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (res.ok) {
          results[inst] = 'online';
        } else {
          results[inst] = 'offline';
        }
      } catch (err) {
        results[inst] = 'offline';
      }
      setTestStatus({ ...results });
    }
    setTesting(false);
  };

  const handleClearCache = () => {
    if (confirm('모든 애창곡, 예약 대기열, 세팅 내역이 초기화됩니다. 진행하시겠습니까?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div className="glass-panel" style={modalContentStyle}>
        <div style={headerStyle}>
          <h2 className="text-neon-cyan" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚙️ 설정 (Settings)
          </h2>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={20} />
          </button>
        </div>

        <div style={formStyle}>
          {/* Brand selection */}
          <div style={sectionStyle}>
            <label style={labelStyle}>기본 반주기 선택</label>
            <div style={radioGroupStyle}>
              <button
                type="button"
                className={brand === 'tj' ? 'active' : ''}
                style={{ ...brandBtnStyle, borderColor: brand === 'tj' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)' }}
                onClick={() => setBrand('tj')}
              >
                TJ 미디어 (태진)
              </button>
              <button
                type="button"
                className={brand === 'ky' ? 'active' : ''}
                style={{ ...brandBtnStyle, borderColor: brand === 'ky' ? 'var(--color-secondary)' : 'rgba(255,255,255,0.1)' }}
                onClick={() => setBrand('ky')}
              >
                금영 (KY)
              </button>
            </div>
            <span style={descStyle}>데이터베이스 곡 검색 시 기본 정렬 및 수록 번호를 불러올 기준 브랜드입니다.</span>
          </div>

          {/* Search Strategy */}
          <div style={sectionStyle}>
            <label style={labelStyle}>유튜브 검색 방식</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={searchPipedOnly}
                  onChange={(e) => setSearchPipedOnly(e.target.checked)}
                  style={checkboxStyle}
                />
                <span>무료 Piped API 검색 사용 (유튜브 API 키 불필요)</span>
              </label>
            </div>
          </div>

          {/* API Key */}
          {!searchPipedOnly && (
            <div style={sectionStyle}>
              <label style={labelStyle}>
                <Key size={14} style={{ marginRight: '6px' }} />
                유튜브 Data API v3 키
              </label>
              <input
                type="password"
                className="input-neon"
                placeholder="AIzaSy..."
                value={youtubeApiKey}
                onChange={(e) => setYoutubeApiKey(e.target.value)}
                style={{ marginTop: '8px' }}
              />
              <span style={descStyle}>공식 구글 유튜브 API를 사용하여 더 정확하고 안정적인 검색결과를 원할 시 등록합니다.</span>
            </div>
          )}

          {/* Custom EC2 Backend Proxy */}
          <div style={sectionStyle}>
            <label style={labelStyle}>
              🌐 자체 프록시 서버 URL (선택사항)
            </label>
            <input
              type="text"
              className="input-neon"
              placeholder="http://your-ec2-ip:5000"
              value={customBackendUrl}
              onChange={(e) => setCustomBackendUrl(e.target.value)}
              style={{ marginTop: '8px' }}
            />
            <span style={descStyle}>AWS EC2 등에 프록시 서버를 구축한 경우 해당 서버 주소를 입력합니다. (예: http://54.180.1.2:5000)</span>
          </div>

          {/* Piped Instance List */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Piped API 서버 리스트</label>
              <button 
                type="button" 
                onClick={testInstances} 
                disabled={testing}
                style={testBtnStyle}
              >
                <RefreshCw size={12} className={testing ? 'spin-anim' : ''} />
                서버 테스트
              </button>
            </div>
            <div style={instanceListStyle}>
              {PIPED_INSTANCES.map((inst) => (
                <div 
                  key={inst} 
                  style={{
                    ...instanceRowStyle,
                    borderLeft: pipedInstance === inst ? '3px solid var(--color-secondary)' : 'none',
                    background: pipedInstance === inst ? 'rgba(0, 240, 255, 0.05)' : 'transparent'
                  }}
                  onClick={() => setPipedInstance(inst)}
                >
                  <span style={{ fontSize: '0.85rem', color: pipedInstance === inst ? '#fff' : 'var(--text-secondary)' }}>{inst}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {testStatus[inst] === 'testing' && <span style={{ color: 'var(--color-accent)', fontSize: '0.75rem' }}>측정중...</span>}
                    {testStatus[inst] === 'online' && <Check size={14} color="var(--color-success)" />}
                    {testStatus[inst] === 'offline' && <AlertCircle size={14} color="red" />}
                  </div>
                </div>
              ))}
            </div>
            <span style={descStyle}>Piped API를 통해 유튜브 비디오를 무료로 우회 검색합니다. 클릭하여 수동 변경 가능합니다.</span>
          </div>

          {/* Reset Cache */}
          <div style={{ ...sectionStyle, border: 'none', paddingBottom: 0 }}>
            <label style={{ ...labelStyle, color: '#ff4d4d' }}>위험 구역 (Danger Zone)</label>
            <button 
              type="button" 
              onClick={handleClearCache}
              style={clearCacheBtnStyle}
            >
              <Trash2 size={14} />
              앱 데이터 초기화
            </button>
          </div>
        </div>

        <div style={footerStyle}>
          <button className="btn-neon btn-neon-cyan" onClick={handleSave} style={{ width: '100%', justifyContent: 'center' }}>
            적용하기 (Apply)
          </button>
        </div>
      </div>
    </div>
  );
}

// Styling (JS Objects in CSS-in-JS style)
const modalOverlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  background: 'rgba(5, 5, 13, 0.8)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px'
};

const modalContentStyle = {
  width: '100%',
  maxWidth: '480px',
  padding: '24px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 0 30px rgba(0, 240, 255, 0.1)',
  animation: 'fadeIn 0.2s ease'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '20px',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  paddingBottom: '12px'
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  padding: '4px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  ':hover': { color: '#fff', background: 'rgba(255,255,255,0.05)' }
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px'
};

const sectionStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
  borderBottom: '1px solid rgba(255,255,255,0.05)',
  paddingBottom: '16px'
};

const labelStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#fff',
  display: 'flex',
  alignItems: 'center'
};

const radioGroupStyle = {
  display: 'flex',
  gap: '10px',
  marginTop: '8px'
};

const brandBtnStyle = {
  flex: 1,
  background: 'rgba(5, 5, 13, 0.4)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '10px',
  borderRadius: '8px',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const checkboxStyle = {
  accentColor: 'var(--color-secondary)',
  cursor: 'pointer',
  width: '16px',
  height: '16px'
};

const descStyle = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  marginTop: '4px',
  lineHeight: '1.4'
};

const testBtnStyle = {
  background: 'rgba(0, 240, 255, 0.1)',
  border: '1px solid rgba(0, 240, 255, 0.3)',
  color: 'var(--color-secondary)',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '0.75rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  transition: 'all 0.2s'
};

const instanceListStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  maxHeight: '120px',
  overflowY: 'auto',
  background: 'rgba(5, 5, 13, 0.5)',
  borderRadius: '8px',
  padding: '6px',
  marginTop: '8px',
  border: '1px solid rgba(255,255,255,0.05)'
};

const instanceRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '6px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  ':hover': { background: 'rgba(255,255,255,0.03)' }
};

const clearCacheBtnStyle = {
  background: 'rgba(255, 77, 77, 0.1)',
  border: '1px solid rgba(255, 77, 77, 0.3)',
  color: '#ff4d4d',
  padding: '8px 12px',
  borderRadius: '8px',
  fontSize: '0.85rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  width: '100%',
  marginTop: '8px',
  fontWeight: '500',
  transition: 'all 0.2s'
};

const footerStyle = {
  marginTop: '24px'
};
