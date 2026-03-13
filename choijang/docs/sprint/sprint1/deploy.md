# Sprint 1 배포 가이드

> 코드 구현은 완료되었습니다. 아래 항목은 **사용자가 직접 수행**해야 합니다.

## 자동 검증 완료 항목

> sprint-close 에이전트 실행일: 2026-03-13

- ✅ `npm run lint` — ESLint 에러 0건
- ✅ `npm run type-check` — TypeScript 컴파일 에러 0건
- ✅ `npm run format:check` — Prettier 포맷 일치 (All matched files use Prettier code style!)
- ✅ `npm run build` — 프로덕션 빌드 성공 (Next.js 16.1.6 Turbopack, 컴파일 2.9초)
- ✅ DB 마이그레이션 SQL 파일 레포지토리 커밋 완료
- ✅ `.env.local` git 추적 제외 확인
- ✅ 코드 리뷰 완료 — Critical/High 이슈 없음
- ✅ 검증 보고서 생성 완료 (`docs/sprint/sprint1/validation-report.md`)

## 수동 검증 필요 항목

### 1. Supabase 프로젝트 설정

- ⬜ supabase.com에서 신규 프로젝트 생성 (리전: ap-northeast-2 Seoul 권장)
- ⬜ Supabase SQL Editor에서 마이그레이션 실행:
  1. `choijang/supabase/migrations/20260316_001_create_analyses.sql` 내용 복사 → 실행
  2. `choijang/supabase/migrations/20260316_002_create_credits.sql` 내용 복사 → 실행
- ⬜ Table Editor에서 `analyses`, `credits`, `credit_transactions` 테이블 생성 확인
- ⬜ RLS 검증: SQL Editor에서 `SELECT * FROM analyses;` 실행 시 0 rows 반환 확인 (anon 키)

### 2. 환경 변수 설정

- ⬜ `.env.example`을 복사하여 `.env.local` 생성:
  ```bash
  cp choijang/.env.example choijang/.env.local
  ```
- ⬜ `.env.local`에 실제 API 키 입력:
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 Settings > API > Project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Settings > API > anon/public key
  - `SUPABASE_SERVICE_ROLE_KEY` — Supabase Settings > API > service_role key
  - `ANTHROPIC_API_KEY` — console.anthropic.com
  - `OPENAI_API_KEY` — platform.openai.com

### 3. 로컬 개발 서버 확인

- ⬜ `cd choijang && npm run dev` 실행 후 `http://localhost:3000` 접속 확인

### 4. Vercel 배포 설정

- ⬜ vercel.com에서 GitHub 레포 Import
  - **루트 디렉토리를 `choijang`으로 설정** (중요)
- ⬜ Vercel Settings > Environment Variables에 `.env.local`과 동일한 키/값 입력
- ⬜ `main` 브랜치 푸시 → Vercel 자동 배포 성공 확인
- ⬜ PR 생성 시 Vercel 프리뷰 URL 자동 생성 확인

### 5. GitHub Actions Secrets 설정

- ⬜ GitHub 레포 → Settings → Secrets and variables → Actions에 다음 Secrets 등록:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ANTHROPIC_API_KEY`
  - `OPENAI_API_KEY`
- ⬜ `sprint1` 브랜치 push 후 GitHub Actions 탭에서 CI 통과 확인

## 다음 단계

Sprint 1 수동 검증 완료 후 Sprint 2 (AI 분석 엔진 백엔드) 착수 전 반드시 해소할 사항:

- ⬜ **OQ-1:** 무료 분석 3회 제한 기준 결정 — IP 기반 vs 디바이스 기반 vs 계정 기반
- ⬜ **OQ-2:** 멀티 LLM 앙상블 예상 월 비용 vs 단일 LLM 비용 비교 분석
