# 🎤 BoraeBang (보래방) - 온라인 노래방

![License](https://img.shields.io/badge/license-ISC-blue)
![React](https://img.shields.io/badge/framework-React%2019-61dafb)
![Vite](https://img.shields.io/badge/builder-Vite%208-bd34fe)
![Deployment](https://img.shields.io/badge/deploy-GitHub%20Pages-green)

유튜브 반주 영상을 활용하여 실제 노래방 기기와 동일한 사용자 경험을 제공하는 프리미엄 웹 노래방 애플리케이션 **보래방(BoraeBang)**입니다.  
사이버펑크 네온 다크 테마와 노래방 전용 리모컨을 통해 집에서도 실감 나는 노래방 분위기를 연출할 수 있습니다.

🔗 **실시간 라이브 배포 주소**: [https://tramper2.github.io/BoraeBang/](https://tramper2.github.io/BoraeBang/)

---

## ✨ 핵심 기능 (Features)

1. **🔌 유튜브 API 키 불필요 (무인증 검색)**
   - 공개 Piped API 인스턴스들을 활용하여 우회 검색을 수행하므로, API 키 없이 바로 작동합니다.
   - 서버 장애나 속도 저하 발생 시, 리스트 내의 정상 인스턴스로 자동 전환(Rotation Fallback)하는 지능형 검색 에이전트를 내장하고 있습니다.
   - 필요 시 설정에서 개인 Google 유튜브 Data API Key를 입력하여 공식 API로 전환할 수도 있습니다.

2. **🎵 노래방 수록곡 데이터베이스 연동**
   - TJ 미디어 및 금영(KY)의 곡 번호와 정보를 실시간으로 연동 검색합니다.
   - 제목, 가수뿐만 아니라 고유 노래방 번호로 직접 조회 및 등록이 가능합니다.

3. **🎛️ 실감 나는 노래방 리모컨 시뮬레이션**
   - 숫자 패드를 눌러 노래 번호를 입력하고 즉시 `예약`하거나 `시작`할 수 있습니다.
   - **템포 제어**: 반주 배속을 조절(0.75x ~ 1.25x)하여 유튜브 영상 속도를 즉시 제어합니다.
   - **간주 점프**: 지루하게 흘러가는 간주를 30초 단위로 빠르게 스킵합니다.
   - **1절 연주**: 노래가 60% 시점에 이르면 종료시킨 뒤 보래방 전용 점수 피드백 시스템으로 넘어갑니다.
   - **다시**: 연주 중인 곡을 맨 처음 시간으로 되돌려 다시 재생합니다.

4. **📋 대기열(예약 목록) & 영속 저장소**
   - `예약` 및 `우선예약(새치기)` 기능으로 실시간 재생 목록 대기열을 예약 관리할 수 있습니다.
   - **애창곡(즐겨찾기)** 등록 및 **최근 부른 곡 히스토리**를 지원하며, 모든 설정과 데이터는 `localStorage`에 자동 보관되어 브라우저 재진입 시 복구됩니다.

5. **🎨 사이버펑크 네온 & CRT 모니터 효과**
   - HSL 베이스의 맞춤형 네온 핑크, 네온 블루 그라데이션 및 글래스모피즘 테마를 적용했습니다.
   - 대기 상태일 때는 레트로 CRT 모니터 주사선과 반짝이는 로고 디스플레이로 오리지널 노래방 반주기 대기 화면을 시뮬레이트합니다.
   - 노래가 끝나면 랜덤으로 뜨는 **노래 점수 결과 스크린**이 탑재되어 소소한 재미를 더합니다.

---

## 📂 프로젝트 문서 정리 (Documentation)

추가적인 설계 배경 및 기술 상세는 아래 `Doc/` 폴더 내 문서에서 확인하실 수 있습니다.

*   [실행 계획서 (Doc/implementation_plan.md)](./Doc/implementation_plan.md) - 초기 설계 구조, API 연동 방향 및 개발 기획서
*   [개발 완료 보고서 (Doc/walkthrough.md)](./Doc/walkthrough.md) - 컴포넌트 구조 설명, 빌드 및 배포 검증 결과

---

## 🛠️ 시작하기 (Local Setup)

로컬 환경에서 개발 서버를 띄우거나 빌드하려면 아래 명령어를 사용하세요.

### 1. 패키지 설치
```bash
npm install
```
> **WSL / Windows 공유 폴더 에러 해결 정보**  
> Windows 환경에서 WSL 가상 드라이브 경로(`\\wsl.localhost\`)를 이용하여 Windows Node.js로 실행 시, npm의 구조적 버그로 인해 특정 네이티브 바인딩 패키지(`rolldown`, `lightningcss`)의 바이너리를 찾지 못해 빌드 오류가 발생할 수 있습니다. 이 경우 아래 명령어를 수동으로 입력해 해결할 수 있습니다.
> ```bash
> npm install @rolldown/binding-win32-x64-msvc
> npm install lightningcss-win32-x64-msvc
> ```

### 2. 개발 서버 실행
```bash
npm run dev
```
기본 포트 `http://localhost:3000`으로 로컬 개발 서버가 구동되며 브라우저가 자동 실행됩니다.

### 3. 정적 빌드 및 배포
프로덕션용 배포본을 빌드하려면 다음 명령을 사용합니다.
```bash
npm run build
```
빌드된 파일은 `dist/` 폴더에 위치하며, 아래 명령으로 GitHub Pages에 배포할 수 있습니다.
```bash
npm run deploy
```
*설정된 배포 저장소: `git@github.com:tramper2/BoraeBang.git`의 `gh-pages` 브랜치*

---

## 📝 라이선스
본 프로젝트는 **ISC 라이선스**를 따릅니다.
