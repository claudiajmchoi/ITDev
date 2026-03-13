# 아이디어 사업화 성공 가능성 분석 서비스

멀티 LLM 앙상블 AI가 아이디어의 사업화 성공 가능성을 분석하여 0~100점 스코어카드를 제공합니다.

## 로컬 실행

1. 의존성 설치: `npm install`
2. 환경 변수 설정: `.env.example`을 복사하여 `.env.local` 생성 후 실제 키 입력
3. 개발 서버 실행: `npm run dev`
4. 브라우저에서 `http://localhost:3000` 접속

## 기술 스택

- **Frontend/Backend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database/Auth:** Supabase (PostgreSQL + Row Level Security)
- **AI:** Anthropic Claude API, OpenAI GPT-4o
- **배포:** Vercel (자동 CI/CD)

## 프로젝트 구조

- `src/app/` — Next.js App Router 페이지 및 API Routes
- `src/lib/` — 공통 유틸리티 (Supabase 클라이언트, 환경 변수 검증)
- `src/types/` — TypeScript 타입 정의
- `supabase/migrations/` — DB 마이그레이션 SQL 파일
