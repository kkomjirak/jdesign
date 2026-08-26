# jiD design studio - Portfolio Web Application

Apple 감성의 미니멀하고 직관적인 인터랙션을 제공하는 **jiD design studio** 포트폴리오 웹사이트입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Typography**: Pretendard Light (300) & SF Pro
- **Animation**: GSAP 3, `@gsap/react`, ScrollTrigger
- **Server / Hosting**: Raspberry Pi 3 (Node.js & PM2) / Mac Local

---

## 💻 로컬 개발 환경 (Mac)

```bash
# 1. 의존성 패키지 설치
npm install

# 2. 로컬 개발 서버 실행 (http://localhost:3000)
npm run dev

# 3. 로컬 프로덕션 빌드 테스트
npm run build
npm start
```

---

## 🚀 [표준 배포 절차] Mac ➔ 라즈베리파이 2단계 업로드 (기본 방식)

Mac에서 빌드한 최신 결과물(`.next`)을 라즈베리파이로 전송하고 PM2를 재시작하는 **가장 빠르고 안정적인 공식 배포 절차**입니다.

### 1️⃣ [1단계] Mac 터미널에서 실행 (빌드 및 전송)
```bash
cd /Volumes/Hagibis/Works/AI/Orca/jdesign

# 1. Mac에서 최신 프로덕션 빌드 수행
npm run build

# 2. 라즈베리파이로 최신 빌드 결과물 및 소스코드 전송
rsync -avz --exclude 'node_modules' "/Volumes/Hagibis/Works/AI/Orca/jdesign/" sonstick@192.168.50.39:~/jdesign/jdesign/
```
*(비밀번호를 물어보면 라즈베리파이 접속 비밀번호를 입력합니다.)*

---

### 2️⃣ [2단계] 라즈베리파이 터미널(SSH)에서 실행 (서버 재시작)
```bash
# PM2로 실행 중인 웹서버 즉시 재시작
pm2 restart jdesign
```

---

### 💡 (선택사항) GitHub에도 함께 저장/백업할 때
```bash
cd /Volumes/Hagibis/Works/AI/Orca/jdesign
git add .
git commit -m "Update: 포트폴리오 디자인 및 콘텐츠 업데이트"
git push origin main
```

---

## 🔄 라즈베리파이 PM2 프로세스 관리 (24시간 상시 운영)

SSH 세션을 닫거나 라즈베리파이가 재부팅되어도 웹서버가 중단되지 않도록 **PM2**를 사용합니다.

```bash
# 1. PM2로 최초 실행 등록 (포트 3000, 외부 IP 수신 허용)
pm2 start npm --name "jdesign" -- start -- -H 0.0.0.0 -p 3000

# 2. 라즈베리파이 재부팅 시 자동 실행 설정 저장
pm2 startup
pm2 save

# --- 유용한 PM2 관리 명령어 ---
pm2 list             # 현재 구동 중인 프로세스 목록 및 상태 확인
pm2 logs jdesign     # 실시간 서버 로그 확인
pm2 restart jdesign  # 서버 재시작
pm2 stop jdesign     # 서버 일시 중지
```

---

## 🌐 외부 접속 및 공유기 설정 안내

- **라즈베리파이 내부 IP**: `192.168.50.39`
- **내부 서비스 포트**: `3000`

### 1. 공유기 포트포워딩(Port Forwarding)
- **공유기 관리자 접속**: 브라우저에서 `http://192.168.50.1` 접속
- **규칙 추가**:
  - 외부 포트: `80` (또는 `3000`)
  - 내부 IP: `192.168.50.39`
  - 내부 포트: `3000`
  - 프로토콜: `TCP`

### 2. 외부 접속 테스트
- 외부 포트를 `80`으로 포트포워딩한 경우: `http://공인IP`
- 외부 포트를 `3000`으로 포트포워딩한 경우: `http://공인IP:3000`

---

## 💡 라즈베리파이 메모리(Swap) 설정 팁

라즈베리파이 3 환경에서 Out of Memory(OOM) 방지를 위해 가상 메모리(Swap)가 2GB로 구성되어 있습니다.

```bash
# 가상 메모리(Swap) 재설정이 필요할 때:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 메모리 상태 확인
free -h
```
