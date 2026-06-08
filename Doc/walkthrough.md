# 🎤 보래방(BoraeBang) 개발 완료 보고서 (Walkthrough)

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

---

## 📁 파일 변경 사항 목록

모든 파일은 [\\wsl.localhost\Ubuntu\home\tramp\projects\Noraebang](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang) 작업 디렉토리 하위에 새롭게 생성되었습니다.

*   [package.json](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/package.json): Vite 개발 서버 실행, 빌드 및 GitHub Pages 배포 스크립트(`deploy`)를 세팅하고 라이브러리를 설치했습니다.
*   [vite.config.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/vite.config.js): GitHub Pages의 리포지토리별 서브디렉토리 경로를 고려하여 `base: './'` 상대경로 빌드 설정을 제공합니다.
*   [index.html](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/index.html): SEO를 위한 메타 태그 지정 및 Google Fonts(Orbitron 디지털 폰트, Inter, Noto Sans KR)를 탑재했습니다.
*   [src/index.css](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/index.css): 글래스모피즘, 네온 글로우 유틸리티 클래스 및 CRT 모니터 스캔라인 효과와 점수 팝업 애니메이션 등을 vanilla CSS로 정의했습니다.
*   [src/main.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/main.jsx): React App 시작점
*   [src/App.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/App.jsx): 대기열, 애창곡, 플레이어 재생 조율 등 전체 노래방의 두뇌 역할을 담당하는 상태(State) 컨트롤러입니다.
*   [src/services/manana.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/manana.js): 브랜드별 노래방 데이터베이스 검색(제목/가수/번호) 및 복합 쿼리 필터링 서비스
*   [src/services/youtube.js](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/services/youtube.js): 유튜브 Data API v3 검색 및 Piped API 다중 인스턴스 자동 백업 로테이터 구현
*   [src/components/KaraokePlayer.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/KaraokePlayer.jsx): 유튜브 IFrame API 래퍼 컴포넌트, 노래 종료 시 랜덤 점수 스크린 애니메이션 출력, 대기 스크린 디지털 시계 시각화
*   [src/components/SearchPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SearchPanel.jsx): DB 검색 및 유튜브 검색 탭, 예약/우선예약/즐겨찾기 버튼 연동
*   [src/components/RemoteControl.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/RemoteControl.jsx): 실제 반주기 리모컨의 키패드 조작, 템포 배속, 1절 연주, 간주점프 제어반 시뮬레이터
*   [src/components/QueuePanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/QueuePanel.jsx): 예약된 곡 목록 및 현재 연주곡 정보 표시
*   [src/components/FavoritesPanel.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/FavoritesPanel.jsx): 애창곡 목록 퀵 로드 및 단축 예약
*   [src/components/SettingsModal.jsx](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/src/components/SettingsModal.jsx): 기본 브랜드(TJ/KY), API 모드 스위치, 로컬 캐시 전체 삭제(초기화) 모달
*   [.gitignore](file:///wsl.localhost/Ubuntu/home/tramp/projects/Noraebang/.gitignore): build, node_modules 무시 설정

---

## 🛠️ 빌드 및 배포 검증 결과

1. **로컬 빌드 검증**:
   - `npm run build`를 실행하여 Vite 환경에서 에러 없이 정적 에셋 컴파일을 완료했습니다.
   - `dist/index.html` (1.37 kB), `dist/assets/index-CF5zhNDx.css` (4.24 kB), `dist/assets/index-uEbiHEK9.js` (243.85 kB) 빌드 생성을 완료했습니다.
2. **GitHub Pages 실시간 배포**:
   - `npm run deploy` 명령을 성공적으로 실행하여 지정하신 원격 저장소(`git@github.com:tramper2/BoraeBang.git`)의 `gh-pages` 브랜치로 빌드 결과물(dist 폴더) 업로드를 완료했습니다.
   - **배포 주소**: `https://tramper2.github.io/BoraeBang/`
