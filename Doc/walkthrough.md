# 🎤 BoraeBang (보래방) 개발 완료 보고서 (Walkthrough)

유튜브 반주 영상을 활용하여 실제 노래방 기기와 동일한 사용자 경험을 제공하는 프리미엄 노래방 웹 애플리케이션 **보래방(BoraeBang)** 개발 및 배포를 완료했습니다.

---

## 🚀 개발 요약 및 주요 기능

1. **무인증 유튜브 검색 및 다중 Piped API 인스턴스 자동 로테이션**:
   - 유튜브 공식 API 키 없이도 검색할 수 있도록 공개 Piped API 서버 리스트를 탑재했습니다.
   - 인스턴스 중 하나에 오류(CORS, 다운타임 등)가 발생하면 자동으로 다음 백업 인스턴스로 폴백하여 무중단 검색을 보장합니다.
   - 사용자가 원할 경우 설정 모달에서 개인 구글 유튜브 API 키를 직접 설정할 수도 있습니다.

2. **TJ 및 KY 노래방 수록곡 데이터베이스 연동**:
   - `api.manana.kr/karaoke` API를 활용하여 국내 대형 노래방 브랜드의 곡 정보를 검색할 수 있습니다.
   - 제목, 가수명 검색은 물론 번호 검색도 완벽히 대응합니다.

3. **대기열(Queue) 및 예약 제어 시스템**:
   - 노래 검색 결과를 대기열에 추가(`예약`), 맨 앞으로 추가(`우선예약`), `즉시재생`하는 대기열 파이프라인을 구축했습니다.
   - 대기곡의 위/아래 순서 변경 및 예약 취소가 가능합니다.

4. **리얼 노래방 리모컨 시뮬레이터**:
   - 실물 노래방 리모컨을 그대로 본뜬 네온 디자인의 사이드바 리모컨을 구현했습니다.
   - 숫자 패드로 번호를 입력하고 `예약`을 누르면 데이터베이스와 유튜브에서 해당 곡 번호를 찾아 즉시 예약해줍니다.
   - `템포 조절` 기능으로 유튜브 플레이어 재생 속도(0.75x ~ 1.25x)를 직접 조절할 수 있습니다.
   - `1절 연주` 기능 활성화 시, 곡 재생이 60% 시점에 도달하면 자동으로 중단되며 재미있는 점수 애니메이션 화면이 켜집니다.
   - `간주 점프` 기능으로 지루한 대기 시간 없이 30초씩 빠르게 스킵 가능합니다.

5. **애창곡(즐겨찾기) 및 최근곡 히스토리 영속성**:
   - 사용자의 애창곡 리스트와 최근 부른 노래 히스토리, 설정 데이터는 브라우저의 `localStorage`를 통해 페이지를 새로고침해도 영구 유지됩니다.

6. **프리미엄 사이버펑크 네온 테마 & CRT 화면 효과**:
   - 깊은 다크 컬러와 네온 핑크, 네온 블루, 네온 옐로우 그라데이션으로 화려하게 화면을 꾸몄습니다.
   - 반주기 대기 상태일 때는 시간 및 노래방 안내 문구가 흐르는 CRT 스캔라인 스크린 애니메이션이 활성화됩니다.

7. **임베드 차단 영상 자동 필터링 및 스킵**:
   - TJ/KY 공식 채널이 외부 도메인(GitHub Pages 등)에서의 재생을 차단한 영상을 YouTube oEmbed API로 사전 감지합니다.
   - 차단된 영상은 예약 시점에 건너뛰고 다음 임베드 가능한 후보 영상을 자동으로 탐색합니다.
   - 재생 중 차단 에러(코드 101/150) 발생 시에도 화면 하단 토스트 알림을 표시한 뒤 다음 곡으로 자동 스킵합니다.

8. **커버곡 제외 및 노래방 MR 반주 영상 우선 정렬**:
   - 검색 결과에서 일반인 커버(cover), 라이브(live), 뮤직비디오(MV) 등 보컬이 포함된 영상을 점수 기반으로 걸러냅니다.
   - `노래방`, `반주`, `MR`, `TJ미디어`, `금영`, `KY` 등 반주 관련 키워드가 포함된 영상에 높은 점수를 부여하여 목록 최상단에 정렬합니다.
   - 4단계 검색 전략(MR 명시 → 반주 → 가수 MR → 브로드 폴백)으로 반주 영상을 최우선 탐색합니다.

---

## 📁 파일 변경 사항 목록

모든 파일은 [\\wsl.localhost\\Ubuntu\\home\\tramp\\projects\\Noraebang](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang) 작업 디렉토리 하위에 위치합니다.

*   [package.json](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/package.json): Vite 개발 서버 실행, 빌드 및 GitHub Pages 배포 스크립트(`deploy`)를 세팅하고 라이브러리를 설치했습니다.
*   [vite.config.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/vite.config.js): GitHub Pages의 리포지토리별 서브디렉토리 경로를 고려하여 `base: './'` 상대경로 빌드 설정을 제공합니다.
*   [index.html](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/index.html): SEO를 위한 메타 태그 지정 및 Google Fonts(Orbitron 디지털 폰트, Inter, Noto Sans KR)를 탑재했습니다.
*   [src/index.css](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/index.css): 글래스모피즘, 네온 글로우 유틸리티 클래스 및 CRT 모니터 스캔라인 효과와 점수 팝업 애니메이션 등을 vanilla CSS로 정의했습니다.
*   [src/main.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/main.jsx): React App 시작점
*   [src/App.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/App.jsx): 대기열, 애창곡, 플레이어 재생 조율 등 전체 노래방의 두뇌 역할을 담당하는 상태(State) 컨트롤러입니다. 4단계 MR 우선 검색 전략 및 임베드 차단 자동 스킵 핸들러를 포함합니다.
*   [src/services/manana.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/manana.js): 브랜드별 노래방 데이터베이스 검색(제목/가수/번호) 및 복합 쿼리 필터링 서비스
*   [src/services/youtube.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/youtube.js): 유튜브 Data API v3 / Piped API 다중 인스턴스 검색, CORS 프록시 폴백, 임베드 가능 여부 확인(`checkEmbeddable`), 커버곡 필터링 및 MR 점수 정렬(`filterAndRankKaraoke`) 포함
*   [src/components/KaraokePlayer.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/KaraokePlayer.jsx): 유튜브 IFrame API 래퍼 컴포넌트. 노래 종료 시 랜덤 점수 스크린 애니메이션, 대기 스크린 디지털 시계, 임베드 차단 에러(101/150) 콜백 처리 포함
*   [src/components/SearchPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SearchPanel.jsx): DB 검색 및 유튜브 검색 탭, 예약/우선예약/즐겨찾기 버튼 연동. 유튜브 직접 검색 시 MR 키워드 삽입 및 `filterAndRankKaraoke` 적용
*   [src/components/RemoteControl.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/RemoteControl.jsx): 실제 반주기 리모컨의 키패드 조작, 템포 배속, 1절 연주, 간주점프 제어반 시뮬레이터
*   [src/components/QueuePanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/QueuePanel.jsx): 예약된 곡 목록 및 현재 연주곡 정보 표시
*   [src/components/FavoritesPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/FavoritesPanel.jsx): 애창곡 목록 퀵 로드 및 단축 예약
*   [src/components/SettingsModal.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SettingsModal.jsx): 기본 브랜드(TJ/KY), API 모드 스위치, 로컬 캐시 전체 삭제(초기화) 모달
*   [.gitignore](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/.gitignore): build, node_modules 무시 설정

---

## 🛠️ 빌드 및 배포 검증 결과

1. **로컬 빌드 검증**:
   - `npm run build`를 실행하여 Vite 환경에서 에러 없이 정적 에셋 컴파일을 완료했습니다.
   - `dist/index.html` (1.37 kB), CSS 번들 (4.24 kB), JS 번들 (248.02 kB) 빌드를 완료했습니다.
2. **GitHub Pages 실시간 배포**:
   - `npm run deploy` 명령을 성공적으로 실행하여 지정하신 원격 저장소(`git@github.com:tramper2/BoraeBang.git`)의 `gh-pages` 브랜치로 빌드 결과물(dist 폴더) 업로드를 완료했습니다.
   - **배포 주소**: [https://tramper2.github.io/BoraeBang/](https://tramper2.github.io/BoraeBang/)

---

## 🔒 ArtractiveAPI CORS 기능 추가 완료

`ArtractiveAPI` 프로젝트([ArtractiveAPI](file:///wsl.localhost/Ubuntu/home/tramp/projects/ArtractiveAPI))에 다른 오리진(Multi-origin)에서 게임 및 관리자 대시보드를 자유롭게 연동할 수 있도록 글로벌 CORS 설정을 성공적으로 구축하고 커밋/푸시를 완료했습니다.

1. **글로벌 CORS 미들웨어 적용**:
   - [server.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/ArtractiveAPI/server.js#L75-L85)에 `cors` 패키지를 전역 미들웨어로 주입했습니다.
   - 요청 헤더에 들어오는 Origin을 그대로 반환(Dynamic Echo)하도록 origin 함수를 정의하여 모든 도메인에서의 다중 origin 요청에 대응하도록 설계했습니다.
   - 세션 쿠키/자격 증명을 동반한 API 통신이 가능하도록 `credentials: true` 옵션을 포함했습니다.
   - 지원 메서드: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
   - 지원 헤더: `Content-Type`, `Authorization`, `x-api-key`
   - 브라우저의 preflight 캐시 유효기간(`maxAge`)을 `86400`초(24시간)로 극대화하여 예비 요청의 오버헤드를 최소화했습니다.

2. **기존 API 경로별 중복 CORS 미들웨어 제거**:
   - `/api/v1/leaderboard` 및 `/api/v1/visitor/count` 등 개별 라우트에 선언되어 있던 부분적 `publicCorsOptions` 미들웨어를 제거하여 라우터의 코드 복잡도를 낮추고 글로벌 레벨에서 보안 통제를 통합 관리하도록 리팩토링했습니다.

3. **로컬 검증 및 배포 완료**:
   - WSL 환경에서 API 서버를 기동하고 `curl.exe`를 사용해 크로스 오리진 preflight (`OPTIONS`) 요청을 보내 `Access-Control-Allow-Origin: http://example.com`, `Access-Control-Allow-Credentials: true` 등 필수 헤더가 완벽히 응답됨을 확인했습니다.
   - 변경된 소스코드를 스테이징 및 커밋하고, 지정된 원격 저장소([ArtractiveAPI.git](git@github.com:tramper2/ArtractiveAPI.git))의 `main` 브랜치로 푸시를 마쳤습니다.

---

## 🚫 임베드 차단 영상 자동 필터링 시스템

TJ미디어/금영 등 공식 채널이 외부 도메인에서의 재생을 막는 영상을 자동으로 감지하고 우회합니다.

### 동작 흐름

```
예약 버튼 클릭
  → 4단계 MR 우선 검색 쿼리로 후보 목록 확보
  → filterAndRankKaraoke(): 커버곡 제거 + MR 반주 영상 상위 정렬
  → findEmbeddableVideo(): oEmbed API로 임베드 가능 여부 순차 확인
  → 임베드 가능한 첫 번째 영상으로 재생 ✅

재생 중 YouTube 에러 101/150 발생 시 (예상 못한 차단)
  → onEmbedError() 콜백 호출
  → 하단 주황색 토스트 알림 표시
  → 자동으로 다음 대기곡으로 스킵 ✅
```

### 관련 함수 (src/services/youtube.js)

| 함수 | 역할 |
|------|------|
| `checkEmbeddable(videoId)` | YouTube oEmbed API로 단일 영상 임베드 가능 여부 확인 |
| `findEmbeddableVideo(videos)` | 후보 목록에서 첫 임베드 가능 영상 반환 |
| `scoreKaraokeRelevance(title, author)` | 제목·채널명 기반 MR/반주 점수 산정 |
| `filterAndRankKaraoke(videos)` | 커버곡 제거 + 점수 내림차순 정렬 |

---

## 🎵 커버곡 필터링 및 MR 우선 정렬 시스템

검색 결과에서 일반인 커버곡이나 보컬 영상을 걸러내고 실제 노래방 반주(MR) 영상을 우선 노출합니다.

### 점수 기준

| 분류 | 키워드 예시 | 점수 |
|------|------------|------|
| **MR/반주 긍정 키워드** | `노래방`, `반주`, `MR`, `karaoke`, `instrumental`, `금영`, `TJ미디어` | +10점 |
| **TJ/KY/금영 공식 채널** | 채널명에 TJ, KY, 금영 포함 | +15점 추가 |
| **커버/보컬 부정 키워드** | `커버`, `cover`, `라이브`, `live`, `MV`, `직캠`, `부른`, `가창` | -20점 |

- 점수 **-20 이하** 영상은 목록에서 **완전 제거**
- 나머지는 점수 **높은 순** 으로 정렬

### 4단계 검색 전략 (App.jsx)

| 순서 | 쿼리 형식 | 목적 |
|------|----------|------|
| 1 | `TJ [번호] [제목] MR` | 번호와 MR 명시한 가장 정확한 검색 |
| 2 | `TJ 노래방 [제목] 반주` | 번호 없이 반주 키워드 포함 검색 |
| 3 | `노래방 [가수] [제목] MR` | 브랜드 무관 반주 검색 |
| 4 | `TJ 노래방 [제목]` | 최후 수단 (가장 넓은 검색) |
