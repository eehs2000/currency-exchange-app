# 환전 애플리케이션

React 기반 환전 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Data Fetching**: TanStack Query
- **State Management**: Zustand (전역 Toast 관리)
- **Styling**: SCSS

## 주요 기능

### 1. 사용자 인증

- 이메일 기반 로그인
- JWT 토큰 관리 (LocalStorage)
- 라우트 보호 (미인증 시 리다이렉트)

### 2. 환전 페이지

- 지갑 잔액 및 총 보유자산 표시
- 실시간 환율 정보 (1분 주기 갱신)
- USD/JPY 환전 견적 조회
- 환전 실행 및 잔액 자동 갱신

### 3. 환전 내역 페이지

- 거래 내역 목록
- 무한 스크롤

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

## API

- Base URL: `https://exchange-example.switchflow.biz`
- Swagger: `https://exchange-example.switchflow.biz/swagger-ui/index.html`
