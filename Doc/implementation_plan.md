# 🎤 노래방 웹앱(구름 노래방 / Cloud Noraebang) 개발 계획서

사용자가 노래방 곡 또는 유튜브 노래방 영상을 검색하여 노래방 분위기를 내며 노래를 부를 수 있는 웹 애플리케이션을 개발합니다. 이 앱은 GitHub Pages에 static site로 배포될 수 있도록 빌드 및 설정됩니다.

## 💡 주요 특징 및 설계

### 1. 유튜브 API 키 없이 작동하는 이중 검색 구조
- 브라우저 단독으로 유튜브 검색을 직접 수행하면 CORS 에러가 발생하며, 공식 유튜브 Data API를 쓰려면 사용자의 API 키가 필요합니다.
- 따라서 본 앱은 **유튜브 공식 API**(사용자 키가 있을 때)와 무료로 사용 가능한 **Piped API**(공개 인스턴스 백업)를 모두 지원하는 이중 구조로 개발합니다.
- Piped API 인스턴스는 여러 개(kavin.rocks, moomoo.me 등)를 등록하여 하나가 작동하지 않을 시 자동으로 다음 인스턴스로 폴백(fallback)하여 무중단 서비스가 가능하도록 설계합니다.

### 2. 실제 노래방 리모컨 시뮬레이션 탑재
- 실제 TJ/KY 노래방 반주기 느낌을 내기 위해 화면 우측(또는 하단)에 네온 스타일의 **노래방 리모컨 인터페이스**를 구현합니다.
- 숫자 버튼을 눌러 번호로 즉시 예약하거나, 시작/취소/우선예약/템포 조절(유튜브 재생속도 조절)/간주점프/1절연주 등의 오리지널 조작 방식을 지원합니다.
- 곡이 끝날 때 랜덤 점수(예: 95점, 100점!)를 출력하는 피드백 스크린 기능을 탑재하여 오락적 요소를 극대화합니다.

---

## Proposed Changes

Vite + React + Vanilla CSS 조합을 사용하여 빠르고 미려한 SPA를 구성합니다.

### 1. 프로젝트 설정
- **`package.json`**: React 및 빌드 도구, 아이콘 패키지(`lucide-react`) 추가, `gh-pages` 배포 스크립트 추가
- **`vite.config.js`**: React 플러그인 설정 및 GitHub Pages 배포 시 정적 경로 문제 해결을 위해 `base: './'` 설정 적용
- **`index.html`**: 디지털 폰트(Orbitron) 및 Noto Sans KR 폰트 설정, Root Element 구성

### 2. 노래방 코어 서비스
- **`src/services/manana.js`**: `api.manana.kr/karaoke` API를 사용하여 브랜드(TJ, KY) 노래방 수록곡 데이터베이스를 검색하는 기능 구현
- **`src/services/youtube.js`**: 
  - 유튜브 Data API v3 검색 구현 (사용자 API Key가 설정된 경우)
  - Piped API 검색 구현 (API Key가 없거나 한도 초과 시 작동하는 멀티 인스턴스 폴백 시스템)

### 3. 노래방 UI 컴포넌트
- **`src/index.css`**: 사이버펑크/노래방 룸 컨셉의 글로벌 스타일 및 네온/글래스모피즘 테마 설계
- **`src/App.jsx`**: 전체 노래방 앱 상태 관리 (대기열(Queue), 현재 곡, 즐겨찾기, 재생 제어 상태, 설정 등)
- **`src/components/KaraokePlayer.jsx`**: 유튜브 IFrame Player API 로드 및 유튜브 플레이어 임베딩
- **`src/components/SearchPanel.jsx`**: 곡 검색 입력 필드 및 검색 모드 탭 (노래방 DB 검색 vs 유튜브 직접 검색)
- **`src/components/RemoteControl.jsx`**: 노래방 전용 리모컨 UI 시뮬레이션 및 템포 배속 제어
- **`src/components/QueuePanel.jsx`**: 예약 곡 목록 관리, 수동 순서 변경 및 삭제 기능
- **`src/components/FavoritesPanel.jsx`**: 로컬스토리지 애창곡 목록 리스트업 및 즉시 예약 UI
- **`src/components/SettingsModal.jsx`**: 기본 노래방 브랜드 설정(TJ/KY), 개인 유튜브 API Key 입력, Piped API 설정 변경
- **`src/main.jsx`**: React App 진입점

---

## 🔍 검증 계획 (수동 검증)

1. **검색 기능 테스트**: 노래 제목/가수 검색 시 TJ/KY 번호가 잘 매칭되어 나오는지 확인하고, 유튜브 직접 검색 시 영상들이 잘 검색되는지 확인합니다.
2. **리모컨 연동 테스트**: 리모컨의 `시작`, `취소`, `템포` 조절, `간주점프` 버튼을 눌렀을 때 유튜브 플레이어가 제어되는지 확인합니다.
3. **대기열 자동 전환**: 재생 중인 노래가 끝나면 점수 화면이 뜬 뒤 예약된 다음 곡으로 부드럽게 넘어가는지 확인합니다.
4. **로컬 빌드 확인**: `npm run build`를 실행하여 번들이 에러 없이 생성되는지 확인합니다.
