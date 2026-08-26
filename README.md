# jiD design studio - Portfolio Web Application

Apple 감성의 미니멀하고 직관적인 인터랙션을 제공하는 **jiD design studio** 포트폴리오 웹사이트입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

- **Framework**: Next.js 16 (App Router)
- **Library**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Animation**: GSAP 3, `@gsap/react`, ScrollTrigger
- **Server / Hosting**: Raspberry Pi (Node.js & PM2) / Mac Local

---

## 💻 로컬 개발 환경 (Mac)

```bash
# 의존성 패키지 설치
npm install

# 로컬 개발 서버 실행 (http://localhost:3000)
npm run dev

# 로컬 프로덕션 빌드 테스트
npm run build
npm start
```

---

## 🚀 Mac에서 작업 후 라즈베리파이에 배포하는 워크플로우

라즈베리파이 3의 한정된 자원(RAM 1GB)을 고려하여, **성능이 뛰어난 Mac에서 빌드를 완료한 후 라즈베리파이로 전송하거나 GitHub을 통해 배포**하는 것이 가장 안전하고 빠릅니다.

### 방법 1. Mac에서 빌드 후 `rsync`로 즉시 동기화 (가장 빠르고 추천 ⭐)

#### ① Mac에서 작업 및 빌드 수행
```bash
cd /Volumes/Hagibis/Works/AI/Orca/jdesign

# Mac에서 초고속 빌드 수행
npm run build
```

#### ② 라즈베리파이로 파일 및 빌드 결과물(`.next`) 전송
```bash
# 용량이 큰 node_modules는 제외하고 소스코드와 .next 빌드 폴더를 전송합니다.
rsync -avz --exclude 'node_modules' "/Volumes/Hagibis/Works/AI/Orca/jdesign/" sonstick@192.168.50.39:~/jdesign/jdesign/
```

#### ③ 라즈베리파이에서 서버 재시작 (PM2)
라즈베리파이 터미널(SSH)에서 아래 명령어를 실행하여 변경사항을 즉시 반영합니다:
```bash
# 라즈베리파이 터미널에서 실행
pm2 restart jdesign
```

---

### 방법 2. GitHub 저장소를 통한 배포

#### ① Mac에서 GitHub으로 푸시
```bash
cd /Volumes/Hagibis/Works/AI/Orca/jdesign
git add .
git commit -m "Update: 포트폴리오 디자인 및 콘텐츠 업데이트"
git push origin main
```

#### ② 라즈베리파이에서 코드 풀 및 재시작
```bash
# 라즈베리파이 SSH 접속 후
cd ~/jdesign/jdesign
git pull origin main

# 신규 패키지가 있다면 설치 후 빌드 & 재시작
npm install
npm run build
pm2 restart jdesign
```

---

## 🔄 라즈베리파이 PM2 프로세스 관리 (24시간 상시 운영)

SSH 세션을 종료하거나 라즈베리파이가 재부팅되어도 서비스가 중단되지 않도록 **PM2**를 사용합니다.

```bash
# 1. PM2로 신규 실행 등록 (포트 3000, 외부 IP 수신 허용)
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

라즈베리파이 3 환경에서 빌드 시 Out of Memory(OOM) 방지를 위해 가상 메모리(Swap)가 2GB로 구성되어 있습니다.

```bash
# 가상 메모리(Swap) 재설정이 필요할 때:
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 메모리 상태 확인
free -h
```
