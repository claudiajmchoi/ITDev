# Sprint 1 — 기초 인프라 셋업

> **작성일:** 2026-03-13
> **작성자:** sprint-planner 에이전트
> **기반 문서:** [ROADMAP.md](../ROADMAP.md)

---

## 개요

| 항목          | 내용                                                    |
| ------------- | ------------------------------------------------------- |
| 스프린트 번호 | 1                                                       |
| 기간          | 2026-03-16 ~ 2026-03-20 (5일)                           |
| 목표          | 개발 환경 완성, 핵심 인프라 구성, DB 스키마 배포        |
| 브랜치        | `sprint1`                                               |
| 선행 조건     | OQ-1(무료 제한 기준), OQ-2(LLM 비용 분석) 의사결정 권장 |

---

## 스프린트 목표

> **Sprint 1은 이후 모든 스프린트의 기반이 되는 인프라를 완성하는 것이 목표입니다.**
>
> `npm run dev`가 정상 실행되는 Next.js 14 프로젝트, Vercel CI/CD 자동 배포, Supabase DB 스키마(analyses + credits 테이블), 환경 변수 관리, 코드 품질 도구(ESLint/Prettier/TypeScript strict)를 모두 갖춘 상태를 달성합니다.

---

## 구현 범위

### 포함

- Next.js 14 + Tailwind CSS 프로젝트 초기화 및 기본 구조 설정
- Vercel 프로젝트 생성 + GitHub Actions CI/CD 연결 (main 브랜치 자동 배포)
- Supabase 프로젝트 생성 + `analyses` 테이블 스키마 + RLS 정책 초안
- `credits` 테이블 스키마 생성 (v2 선준비 — 데이터 마이그레이션 방지 목적)
- 환경 변수 관리 체계 구축 (`.env.local` + Vercel 환경 변수)
- ESLint + Prettier + TypeScript strict 설정 + 린트 에러 0건 달성

### 제외 (다음 스프린트 이후)

- AI 분석 엔진 구현 (Sprint 2)
- 입력 UI / 결과 화면 (Sprint 3, 4)
- 인증 / 이력 저장 (Sprint 5)
- PDF 다운로드 (Sprint 6)
- 실제 결제 연동 (v2)
- 업종별 동적 가중치 (v2)

---

## Task Breakdown

### INF-001: Next.js 14 + Tailwind CSS 프로젝트 초기화

**목표:** 개발 서버가 정상 실행되는 기본 Next.js 14 프로젝트를 생성한다.

**구현 방법:**

1. `choijang/` 디렉토리 내에 `npx create-next-app@latest` 실행
   - TypeScript: Yes
   - ESLint: Yes
   - Tailwind CSS: Yes
   - `src/` 디렉토리: Yes
   - App Router: Yes
   - import alias: `@/*`
2. 불필요한 기본 페이지 내용 정리 (`page.tsx` 최소화)
3. `README.md` 초안 작성 (프로젝트 개요, 실행 방법)

**완료 기준:**

- `npm run dev` 실행 후 `http://localhost:3000` 정상 접속 확인
- TypeScript 컴파일 에러 0건 (`npm run build`)

**예상 소요 시간:** 1시간

---

### INF-002: Vercel 프로젝트 생성 + GitHub CI/CD 연결

**목표:** `main` 브랜치 푸시 시 Vercel에 자동 배포되는 파이프라인을 구축한다.

**구현 방법:**

1. Vercel 대시보드에서 신규 프로젝트 생성, GitHub 레포지토리 연결
2. `main` 브랜치: 프로덕션 배포 / `sprint*` 브랜치: 프리뷰 배포 설정
3. GitHub Actions 워크플로우 파일 생성 (`.github/workflows/ci.yml`)
   - `npm run lint` + `npm run build` — PR 머지 전 검사
4. Vercel 프로젝트 설정에서 빌드 커맨드, 출력 디렉토리 확인

**완료 기준:**

- `main` 브랜치 푸시 → Vercel 자동 배포 성공 확인
- GitHub PR 생성 시 Vercel 프리뷰 URL 자동 생성 확인
- GitHub Actions CI 파이프라인 통과 확인

**예상 소요 시간:** 1.5시간

---

### INF-003: Supabase 프로젝트 생성 + `analyses` 테이블 스키마 배포

**목표:** 분석 결과를 저장할 `analyses` 테이블을 생성하고 RLS 정책 초안을 적용한다.

**구현 방법:**

1. Supabase 대시보드에서 신규 프로젝트 생성 (리전: ap-northeast-2 Seoul)
2. `analyses` 테이블 SQL 스키마 작성 및 배포:

```sql
CREATE TABLE analyses (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   TEXT,                          -- 비로그인 사용자 식별
  idea_input   TEXT NOT NULL,                 -- 원본 입력 텍스트
  idea_summary TEXT,                          -- AI 요약 제목
  industry     TEXT,                          -- 분류된 업종
  score_total  SMALLINT CHECK (score_total BETWEEN 0 AND 100),
  score_market SMALLINT CHECK (score_market BETWEEN 0 AND 100),
  score_competition SMALLINT CHECK (score_competition BETWEEN 0 AND 100),
  score_revenue SMALLINT CHECK (score_revenue BETWEEN 0 AND 100),
  grade        TEXT CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  result_json  JSONB,                         -- 전체 분석 결과 (Zone A/B/C)
  model_meta   JSONB,                         -- 사용된 모델 + 신뢰도 메타데이터
  status       TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX analyses_user_id_idx ON analyses(user_id);
CREATE INDEX analyses_session_id_idx ON analyses(session_id);
CREATE INDEX analyses_created_at_idx ON analyses(created_at DESC);
```

3. RLS 정책 초안 적용:

```sql
-- RLS 활성화
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자: 본인 이력만 조회
CREATE POLICY "본인 분석 이력 조회"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- 비로그인 분석 저장 허용 (service_role 키로만)
CREATE POLICY "서비스 롤 전체 접근"
  ON analyses FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
```

4. `supabase/migrations/` 디렉토리에 SQL 파일 버전 관리

**완료 기준:**

- Supabase 대시보드에서 `analyses` 테이블 생성 확인
- RLS 정책 적용 후 `anon` 키로 직접 SELECT 시 데이터 반환 없음 확인
- 마이그레이션 파일이 레포지토리에 커밋됨

**예상 소요 시간:** 2시간

---

### INF-004: `credits` 테이블 스키마 생성 (v2 선준비)

**목표:** v2 결제 시스템 연동 시 데이터 마이그레이션 없이 바로 사용 가능한 `credits` 테이블을 미리 생성한다.

**구현 방법:**

1. `credits` 테이블 SQL 스키마 작성 및 배포:

```sql
CREATE TABLE credits (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance      INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER NOT NULL DEFAULT 0,
  total_used   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT now(),
  updated_at   TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT credits_user_id_unique UNIQUE (user_id)
);

-- 인덱스
CREATE INDEX credits_user_id_idx ON credits(user_id);

-- RLS 활성화
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- 본인 크레딧 조회만 허용
CREATE POLICY "본인 크레딧 조회"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

-- 서비스 롤 전체 접근 (결제 처리 시 사용)
CREATE POLICY "서비스 롤 크레딧 접근"
  ON credits FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
```

2. `credit_transactions` 이력 테이블도 함께 생성:

```sql
CREATE TABLE credit_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,              -- 양수: 충전, 음수: 차감
  type         TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  reference_id UUID,                          -- analyses.id 또는 결제 ID
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX credit_transactions_user_id_idx ON credit_transactions(user_id);
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 거래 이력 조회"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);
```

**완료 기준:**

- `credits` 및 `credit_transactions` 테이블 생성 확인
- RLS 정책 적용 확인
- 마이그레이션 파일 레포지토리 커밋

**예상 소요 시간:** 1시간

---

### INF-005: 환경 변수 관리 (.env.local + Vercel 환경 변수)

**목표:** 모든 API 키와 서비스 URL을 안전하게 관리하는 환경 변수 체계를 구축한다.

**구현 방법:**

1. 프로젝트 루트에 `.env.local` 파일 생성 (`.gitignore`에 반드시 포함)
2. `.env.example` 파일 생성 (실제 값 제외, 키 이름만 포함 — 레포지토리에 커밋):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Anthropic (Claude)
ANTHROPIC_API_KEY=

# OpenAI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Vercel 대시보드 → Settings → Environment Variables에 동일 키 설정
   - `Production`, `Preview`, `Development` 환경 분리
4. `src/lib/env.ts` 파일 생성 — 환경 변수 타입 검증 유틸리티:

```typescript
// 서버 시작 시 필수 환경 변수 존재 여부 검증
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
  ];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`필수 환경 변수 누락: ${missing.join(', ')}`);
  }
}
```

**완료 기준:**

- `.env.local`에 Claude API 키, OpenAI API 키, Supabase URL/키 설정 완료
- Vercel 환경 변수에 동일 키 설정 완료
- `.env.local`이 `.gitignore`에 포함되어 레포지토리에 커밋되지 않음 확인
- `validateEnv()` 함수가 누락 키를 감지하고 에러를 던지는 것 확인

**예상 소요 시간:** 1시간

---

### INF-006: ESLint + Prettier + TypeScript strict 설정

**목표:** 코드 품질 도구를 설정하여 린트 에러 0건, 일관된 코드 스타일을 보장한다.

**구현 방법:**

1. ESLint 설정 강화 (`.eslintrc.json`):
   - `@typescript-eslint/recommended` 규칙 적용
   - `no-console` 경고 (프로덕션 코드)
   - `@typescript-eslint/no-explicit-any` 에러 설정
2. Prettier 설정 (`.prettierrc`):

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

3. `tsconfig.json` TypeScript strict 모드 확인 및 강화:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

4. `package.json` scripts에 lint/format 명령 추가:

```json
{
  "scripts": {
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  }
}
```

5. VSCode 설정 (`.vscode/settings.json`) — 저장 시 자동 포맷 적용

**완료 기준:**

- `npm run lint` 실행 결과 에러 0건
- `npm run format:check` 실행 결과 에러 0건
- `npm run type-check` 실행 결과 에러 0건
- CI 파이프라인에 lint + type-check 포함됨

**예상 소요 시간:** 1시간

---

## 기술적 접근 방법

### 프로젝트 구조 (Sprint 1 완료 후 예상)

```
choijang/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃
│   │   ├── page.tsx            # 임시 홈 페이지 (랜딩 페이지는 Sprint 8)
│   │   └── globals.css         # Tailwind CSS 글로벌 스타일
│   ├── lib/
│   │   ├── env.ts              # 환경 변수 검증
│   │   └── supabase/
│   │       ├── client.ts       # 클라이언트 사이드 Supabase 인스턴스
│   │       └── server.ts       # 서버 사이드 Supabase 인스턴스
│   └── types/
│       └── database.ts         # Supabase 테이블 타입 정의
├── supabase/
│   └── migrations/
│       ├── 20260316_001_create_analyses.sql
│       └── 20260316_002_create_credits.sql
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI 파이프라인
├── .env.example                # 환경 변수 템플릿 (커밋 O)
├── .env.local                  # 실제 환경 변수 (커밋 X)
├── .eslintrc.json
├── .prettierrc
└── tsconfig.json
```

### Supabase 클라이언트 설정

Next.js App Router에서 서버 컴포넌트와 클라이언트 컴포넌트에서 각각 다른 Supabase 인스턴스를 사용해야 합니다.

- **클라이언트 사이드** (`src/lib/supabase/client.ts`): `createBrowserClient` — `NEXT_PUBLIC_*` 키 사용
- **서버 사이드** (`src/lib/supabase/server.ts`): `createServerClient` — `SERVICE_ROLE` 키 사용 가능

### CI/CD 파이프라인 전략

```
PR 생성 → GitHub Actions (lint + type-check + build)
    ↓ 통과
Vercel 프리뷰 배포 (자동)
    ↓
main 머지 → Vercel 프로덕션 배포 (자동)
```

---

## 의존성 및 리스크

### 외부 의존성

| 의존성            | 설명                                  | 리스크                         |
| ----------------- | ------------------------------------- | ------------------------------ |
| Vercel 계정       | 프로젝트 배포에 필요                  | 낮음 — 무료 플랜으로 시작 가능 |
| Supabase 계정     | DB 및 Auth 서비스                     | 낮음 — 무료 플랜으로 시작 가능 |
| Anthropic API 키  | Claude API 호출 (Sprint 2부터 실사용) | 중간 — 키 발급 지연 가능       |
| OpenAI API 키     | GPT-4o API 호출 (Sprint 2부터 실사용) | 중간 — 키 발급 지연 가능       |
| GitHub 레포지토리 | CI/CD 연결 필요                       | 낮음                           |

### 스프린트 내 리스크

| 리스크                           | 발생 가능성 | 영향도    | 완화 방법                                         |
| -------------------------------- | ----------- | --------- | ------------------------------------------------- |
| Vercel SSE 제한 사전 검증 미흡   | 낮음        | 높음      | Sprint 1에서 Vercel Edge Runtime 호환성 사전 조사 |
| Supabase 무료 티어 설정 제한     | 낮음        | 중간      | 프로젝트 생성 직후 티어 제한 확인                 |
| API 키 Git 노출                  | 낮음        | 매우 높음 | `.gitignore` 설정 최우선 처리, PR 리뷰 시 확인    |
| TypeScript strict 모드 초기 에러 | 중간        | 낮음      | 프로젝트 초기화 직후 즉시 설정하여 누적 방지      |

### 선행 의사결정 필요 항목 (OQ)

| 미결 사항                                              | 중요도 | Sprint 1 영향                                                   |
| ------------------------------------------------------ | ------ | --------------------------------------------------------------- |
| OQ-1: 무료 분석 3회 제한 기준 (IP vs 디바이스 vs 계정) | 높음   | Rate Limiting 미들웨어 설계에 영향 (Sprint 2 착수 전 결정 필요) |
| OQ-2: 멀티 LLM 앙상블 월 비용 분석                     | 높음   | Sprint 1 직접 영향 없음, Sprint 2 전 결정 권장                  |

---

## 완료 기준 (Definition of Done)

Sprint 1이 완료되었다고 판단하려면 아래 항목이 모두 충족되어야 합니다.

### 기능 완료 체크리스트

- ⬜ INF-001: `npm run dev` 실행 후 `http://localhost:3000` 정상 접속
- ✅ INF-001: `npm run build` TypeScript 컴파일 에러 0건
- ⬜ INF-002: `main` 브랜치 푸시 → Vercel 자동 배포 성공 (수동 설정 필요)
- ✅ INF-002: GitHub Actions CI 파이프라인 생성 완료 (`.github/workflows/ci.yml`)
- ⬜ INF-003: Supabase `analyses` 테이블 생성 및 인덱스 적용 확인 (수동 실행 필요)
- ⬜ INF-003: RLS 정책 적용 후 `anon` 키 직접 접근 차단 확인 (수동 실행 필요)
- ✅ INF-003: 마이그레이션 SQL 파일 레포지토리 커밋
- ⬜ INF-004: Supabase `credits` 및 `credit_transactions` 테이블 생성 확인 (수동 실행 필요)
- ✅ INF-004: `credits` 및 `credit_transactions` 마이그레이션 SQL 파일 커밋 완료
- ⬜ INF-005: `.env.local`에 Claude/OpenAI/Supabase 키 설정 완료 (수동 입력 필요)
- ⬜ INF-005: Vercel 환경 변수 설정 완료 (수동 설정 필요)
- ✅ INF-005: `.env.local`이 레포지토리에 커밋되지 않음 확인 (`.gitignore` 적용)
- ✅ INF-005: `.env.example` 존재 및 모든 필수 키 포함
- ✅ INF-006: `npm run lint` 에러 0건
- ✅ INF-006: `npm run format:check` 에러 0건
- ✅ INF-006: `npm run type-check` 에러 0건

### 코드 품질 기준

- ✅ 모든 코드 파일에 TypeScript strict 모드 적용
- ✅ `any` 타입 사용 없음
- ✅ 환경 변수 타입 검증 유틸리티 (`validateEnv`) 구현 완료
- ✅ `.env.example` 파일 존재 및 최신 상태 유지

### 문서 기준

- ✅ `README.md` 프로젝트 개요 및 로컬 실행 방법 작성
- ✅ `.env.example` 모든 필수 환경 변수 키 포함
- ✅ 마이그레이션 SQL 파일에 주석 작성 (테이블 목적, 컬럼 설명)

---

## 예상 산출물

| 산출물                         | 유형      | 위치                            |
| ------------------------------ | --------- | ------------------------------- |
| Next.js 14 + Tailwind 프로젝트 | 코드      | `choijang/` 루트                |
| GitHub Actions CI 워크플로우   | 설정 파일 | `.github/workflows/ci.yml`      |
| Supabase 마이그레이션 SQL      | DB 스키마 | `supabase/migrations/`          |
| 환경 변수 템플릿               | 설정 파일 | `.env.example`                  |
| Supabase 클라이언트 유틸리티   | 코드      | `src/lib/supabase/`             |
| 환경 변수 검증 유틸리티        | 코드      | `src/lib/env.ts`                |
| ESLint + Prettier 설정         | 설정 파일 | `.eslintrc.json`, `.prettierrc` |
| 프로젝트 README                | 문서      | `README.md`                     |

---

## 일일 작업 계획

| 날짜            | 작업                                                   | 예상 완료              |
| --------------- | ------------------------------------------------------ | ---------------------- |
| 2026-03-16 (월) | INF-001: Next.js 초기화 + INF-006: 코드 품질 도구 설정 | INF-001 ✅, INF-006 ✅ |
| 2026-03-17 (화) | INF-002: Vercel + GitHub CI/CD 연결                    | INF-002 ✅             |
| 2026-03-18 (수) | INF-003: Supabase 프로젝트 + analyses 테이블           | INF-003 ✅             |
| 2026-03-19 (목) | INF-004: credits 테이블 + INF-005: 환경 변수 관리      | INF-004 ✅, INF-005 ✅ |
| 2026-03-20 (금) | 전체 완료 기준 검증 + 문서 정리 + Sprint 1 회고        | Sprint 1 완료          |

---

## 참고 사항 및 결정 사항

### 아키텍처 결정 사항 (Sprint 1 기준)

- **ADR-001 (확정):** PDF 생성 — 서버사이드 API Route
- **ADR-002 (확정):** LLM 스트리밍 — SSE(Server-Sent Events)
- **ADR-003 (확정):** 비로그인 분석 — MVP에서 허용
- **ADR-004 (확정):** 평가 가중치 — MVP 고정, v2에서 동적 전환
- **ADR-005 (미결):** 결제 게이트웨이 — Stripe vs 토스페이먼츠 (Sprint 6 이전 결정)
- **ADR-006 (미결):** 무료 분석 제한 기준 — IP vs 디바이스 vs 계정 (Sprint 2 이전 결정)

### INFRA-M1 마일스톤 달성 조건

> Sprint 1 완료가 곧 **INFRA-M1 (개발/프로덕션 환경 분리)** 마일스톤 달성을 의미합니다.
> `dev` 브랜치(또는 `sprint*` 브랜치)의 Vercel 프리뷰 배포와 `main` 브랜치의 프로덕션 배포가 분리되어 운영됩니다.

---

_Sprint 1 완료 후 Sprint 2 (AI 분석 엔진 백엔드) 착수 전, OQ-1과 OQ-2 미결 사항을 반드시 해소하세요._
