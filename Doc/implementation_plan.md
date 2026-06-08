# 노래방 웹앱(구름 노래방 / Cloud Noraebang) 개발 계획

사용자가 노래방 곡 또는 유튜브 노래방 영상을 검색하여 노래방 분위기를 내며 노래를 부를 수 있는 웹 애플리케이션을 개발합니다. 이 앱은 GitHub Pages에 static site로 배포될 수 있도록 빌드 및 설정됩니다.

## User Review Required

> [!IMPORTANT]
> **유튜브 API 키 없이 작동하는 방식에 대하여**
> - 브라우저 단독으로 유튜브 검색을 직접 수행하면 CORS 에러가 발생하며, 공식 유튜브 Data API를 쓰려면 사용자의 API 키가 필요합니다.
> - 따라서 본 앱은 **유튜브 공식 API**(사용자 키가 있을 때)와 무료로 사용 가능한 **Piped API**(공개 인스턴스 백업)를 모두 지원하는 이중 구조로 개발합니다.
> - Piped API 인스턴스는 여러 개(kavin.rocks, moomoo.me 등)를 등록하여 하나가 작동하지 않을 시 자동으로 다음 인스턴스로 폴백(fallback)하여 무중단 서비스가 가능하도록 설계합니다.

> [!TIP]
> **실제 노래방 리모컨 시뮬레이션 탑재**
> - 실제 TJ/KY 노래방 반주기 느낌을 내기 위해 화면 우측(또는 하단)에 네온 스타일의 **노래방 리모컨 인터페이스**를 구현합니다.
> - 숫자 버튼을 눌러 번호로 즉시 예약하거나, 시작/취소/우선예약/템포 조절(유튜브 재생속도 조절)/간주점프/1절연주 등의 오리지널 조작 방식을 지원합니다.
> - 곡이 끝날 때 랜덤 점수(예: 95점, 100점!)를 출력하는 피드백 스크린 기능을 탑재하여 오락적 요소를 극대화합니다.

## Proposed Changes

Vite + React + Vanilla CSS 조합을 사용하여 빠르고 미려한 SPA를 구성합니다.

### 패키지 설정 및 인프라

#### [MODIFY] [package.json](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/package.json)
- 기존 `package.json`에 React 및 빌드 도구, 아이콘 패키지(`lucide-react`) 추가
- `gh-pages` 배포를 위한 스크립트(`deploy`) 추가

#### [NEW] [vite.config.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/vite.config.js)
- React 플러그인 설정 및 GitHub Pages 배포 시 정적 경로 문제 해결을 위해 `base: './'` 설정 적용

#### [NEW] [index.html](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/index.html)
- 폰트(Google Fonts - Inter & Orbitron 등 디지털 폰트) 설정 및 Root Element 구성

### 노래방 코어 서비스

#### [NEW] [manana.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/manana.js)
- `api.manana.kr/karaoke` API를 사용하여 브랜드(TJ, KY) 노래방 수록곡 데이터베이스를 검색하는 기능 구현

#### [NEW] [youtube.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/youtube.js)
- 유튜브 Data API v3 검색 구현 (사용자 API Key가 설정된 경우)
- Piped API 검색 구현 (API Key가 없거나 한도 초과 시 작동하는 멀티 인스턴스 폴백 시스템)
- 검색 결과에서 비디오 ID 추출 및 매핑

### 노래방 UI 컴포넌트

#### [NEW] [index.css](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/index.css)
- 사이버펑크/노래방 룸 컨셉의 글로벌 스타일 및 네온/글래스모피즘 테마 설계
- 디지털 스크린 느낌을 주기 위한 CRT 주사선(scanlines) 애니메이션 효과 클래스 선언

#### [NEW] [App.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/App.jsx)
- 전체 노래방 앱 상태 관리 (대기열(Queue), 현재 곡, 즐겨찾기, 재생 제어 상태, 설정 등)

#### [NEW] [KaraokePlayer.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/KaraokePlayer.jsx)
- 유튜브 IFrame Player API 로드 및 유튜브 플레이어 임베딩
- 곡 재생 중/종료 시 이벤트 리스너 연동 (노래 종료 시 점수 화면 노출 및 다음 곡 자동 전환)
- 대기 시 시각적 대기 스크린 출력 (네온 애니메이션과 노래방 안내문구)

#### [NEW] [SearchPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SearchPanel.jsx)
- 곡 검색 입력 필드 및 검색 모드 탭 (노래방 DB 검색 vs 유튜브 직접 검색)
- 검색 결과 리스트 출력 및 '예약/우선예약/시작/즐겨찾기' 액션 매핑

#### [NEW] [RemoteControl.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/RemoteControl.jsx)
- 노래방 리모컨 UI 시뮬레이션 컴포넌트
- 숫자 패드를 통해 번호를 입력하고 `예약`을 누르면 데이터베이스나 유튜브에서 번호로 영상 검색 및 예약 기능 구현
- 템포 조절(`템포 -` / `템포 +`)을 통해 유튜브 배속 제어(0.75배 ~ 1.25배)

#### [NEW] [QueuePanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/QueuePanel.jsx)
- 예약 곡 목록 관리, 수동 순서 변경(이동 버튼) 및 삭제 기능

#### [NEW] [FavoritesPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/FavoritesPanel.jsx)
- `localStorage`에 저장된 사용자의 애창곡(즐겨찾기) 목록을 리스트업하고 즉시 예약 가능한 UI 제공

#### [NEW] [SettingsModal.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SettingsModal.jsx)
- 기본 노래방 브랜드 설정(TJ/KY), 유튜브 API Key 입력, Piped API 인스턴스 테스트 및 변경 옵션

#### [NEW] [main.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/main.jsx)
- React App의 진입점(Entrypoint)

---

### Artractive API 서비스 CORS 추가

글로벌 크로스 오리진(CORS) 호출 및 쿠키 기반 세션 인증 유지를 위해 CORS 구성을 추가합니다.

#### [MODIFY] [server.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/ArtractiveAPI/server.js)
- `cors` 라이브러리를 전역 미들웨어로 주입
- 동적 Origin 에코백 기능 (`origin: (origin, callback) => callback(null, true)`)을 적용하여 다양한 게임 도메인 및 대시보드 도메인에서 동일하게 자격 증명(Cookie/Credentials)을 허용하도록 설정
- 기존 `/api/v1/` 관련 라우트에 중복으로 명시된 `publicCorsOptions` 개별 미들웨어를 제거하여 코드를 단순화하고 일관된 글로벌 정책 적용

---

## Verification Plan

### 수동 검증 방식

#### 1. 보래방 웹앱 기능 검증
- **검색 기능 검증**:
  - `SearchPanel`에서 노래 제목(예: "아이유 밤편지")을 검색했을 때 TJ/KY 브랜드별 곡 정보가 잘 노출되는지 확인합니다.
  - 검색 모드를 "유튜브 검색"으로 바꾸고 입력했을 때 노래방 반주 영상 리스트가 잘 표시되는지 확인합니다.
- **플레이어 제어 및 대기열(Queue) 기능 검증**:
  - 검색한 곡을 "예약"했을 때 예약 목록에 추가되는지 확인합니다.
  - 플레이어가 실행 중일 때 리모컨의 `시작`, `취소`, `템포` 조절, `간주점프` 등이 올바르게 작동하는지 테스트합니다.
  - 현재 재생 중인 노래가 끝나면 재미있는 점수 화면(Score screen) 애니메이션이 나오는지, 그리고 예약된 다음 노래로 자동 전환되는지 확인합니다.
- **즐겨찾기(LocalStorage) 영속성 검증**:
  - 애창곡을 추가하고 페이지를 새로고침해도 즐겨찾기 탭과 설정한 유튜브 API 키가 유지되는지 확인합니다.
- **빌드 및 로컬 실행 테스트**:
  - `npm run build` 명령을 실행하여 번들 빌드가 오류 없이 생성되는지 확인합니다.

#### 2. ArtractiveAPI CORS 기능 검증
- **CORS 헤더 응답 테스트**:
  - 로컬 API 서버를 구동(WSL 환경)한 뒤, `curl`을 이용하여 임의의 Origin(예: `http://example.com`)으로 CORS preflight (`OPTIONS`) 요청을 전송합니다.
  - 응답 헤더로 `Access-Control-Allow-Origin: http://example.com`와 `Access-Control-Allow-Credentials: true`가 올바르게 반환되는지 확인합니다.
