# Sprint 1 인프라 셋업 구현 계획

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Next.js 14 + Supabase + Vercel CI/CD로 구성된 기초 인프라를 구축하여 Sprint 2 AI 엔진 개발을 즉시 시작할 수 있는 환경을 완성한다.

**Architecture:** Next.js 14 App Router 기반 풀스택 앱. Supabase를 DB + Auth로 사용하고, Vercel에 자동 배포. 서버 사이드와 클라이언트 사이드 Supabase 클라이언트를 분리하여 보안을 강화.

**Tech Stack:** Next.js 14, TypeScript (strict), Tailwind CSS, Supabase (PostgreSQL + Auth), Vercel, GitHub Actions

---

## ⚠️ 사전 확인 — 수동 필요 항목

아래 항목은 코드 작성 전에 사용자가 직접 준비해야 합니다:

- ⬜ **Supabase 계정 + 프로젝트 생성** (supabase.com → New Project, 리전: ap-northeast-2 Seoul)
- ⬜ **Vercel 계정 + GitHub 레포 연결** (vercel.com → Import Git Repository)
- ⬜ **API 키 준비:**
  - `NEXT_PUBLIC_SUPABASE_URL` — Supabase 프로젝트 Settings > API
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — 위 동일
  - `SUPABASE_SERVICE_ROLE_KEY` — 위 동일 (service_role)
  - `ANTHROPIC_API_KEY` — console.anthropic.com
  - `OPENAI_API_KEY` — platform.openai.com

---

### Task 1: Next.js 14 프로젝트 초기화 (INF-001)

**Files:**

- Create: `choijang/` 내 Next.js 프로젝트 전체 구조 (`npx create-next-app@latest`)
- Modify: `src/app/page.tsx` — 기본 내용 최소화
- Create: `README.md`

**Step 1: `choijang/` 디렉토리에서 Next.js 앱 초기화**

```bash
cd choijang
npx create-next-app@latest . \
  --typescript \
  --eslint \
  --tailwind \
  --src-dir \
  --app \
  --import-alias "@/*" \
  --no-git
```

프롬프트가 나오면 위 옵션대로 선택. `--no-git`은 이미 상위에 git이 있으므로 중복 방지.

**Step 2: 실행 확인**

```bash
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 → Next.js 기본 페이지 확인.
Ctrl+C로 종료.

**Step 3: `src/app/page.tsx` 최소화**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-2xl font-bold">아이디어 사업화 분석 서비스</h1>
    </main>
  );
}
```

**Step 4: `README.md` 작성**

```markdown
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
```

**Step 5: 빌드 에러 없음 확인**

```bash
npm run build
```

예상 출력: `✓ Compiled successfully`

**Step 6: 커밋**

```bash
git add .
git commit -m "feat: Next.js 14 + Tailwind CSS 프로젝트 초기화 (INF-001)"
```

---

### Task 2: ESLint + Prettier + TypeScript strict 설정 (INF-006)

> INF-001 직후 설정해야 코드 누적 전에 규칙을 확립할 수 있다.

**Files:**

- Modify: `choijang/.eslintrc.json`
- Create: `choijang/.prettierrc`
- Create: `choijang/.prettierignore`
- Modify: `choijang/tsconfig.json`
- Modify: `choijang/package.json` — scripts 추가
- Create: `choijang/.vscode/settings.json`

**Step 1: `.eslintrc.json` 강화**

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

**Step 2: `.prettierrc` 생성**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**Step 3: `.prettierignore` 생성**

```
.next
node_modules
out
dist
```

**Step 4: `tsconfig.json` strict 옵션 추가**

`compilerOptions`에 아래 항목 추가:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}
```

> `create-next-app`이 이미 `"strict": true`를 넣었을 수 있으니 중복 확인 후 추가.

**Step 5: `package.json` scripts 추가**

기존 `"scripts"` 블록에 아래 항목 추가:

```json
"format": "prettier --write .",
"format:check": "prettier --check .",
"type-check": "tsc --noEmit"
```

**Step 6: `.vscode/settings.json` 생성**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

**Step 7: Prettier 패키지 설치**

```bash
npm install --save-dev prettier eslint-config-prettier
```

**Step 8: lint + format + type-check 모두 통과 확인**

```bash
npm run lint
npm run format:check
npm run type-check
```

예상 출력: 세 명령 모두 에러 없이 종료.

**Step 9: 커밋**

```bash
git add .
git commit -m "feat: ESLint + Prettier + TypeScript strict 설정 (INF-006)"
```

---

### Task 3: 환경 변수 관리 체계 구축 (INF-005)

**Files:**

- Create: `choijang/.env.example`
- Create: `choijang/src/lib/env.ts`
- Modify: `choijang/.gitignore` — `.env.local` 포함 확인

**Step 1: `.gitignore`에 `.env.local` 포함 확인**

`choijang/.gitignore`를 열어 `.env.local`이 있는지 확인. 없으면 추가:

```
# 환경 변수 (실제 키 포함 — 절대 커밋 금지)
.env.local
.env.*.local
```

**Step 2: `.env.example` 생성**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Anthropic (Claude API)
ANTHROPIC_API_KEY=your-anthropic-api-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Step 3: `src/lib/env.ts` 생성**

```typescript
// 서버 시작 시 필수 환경 변수 존재 여부를 검증한다.
// 누락된 키가 있으면 즉시 에러를 던져 런타임 오류 전에 조기 감지.
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`필수 환경 변수 누락: ${missing.join(', ')}`);
  }
}

// 타입 안전한 환경 변수 접근자
export const env = {
  supabase: {
    url: process.env['NEXT_PUBLIC_SUPABASE_URL'] as string,
    anonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] as string,
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] as string,
  },
  anthropic: {
    apiKey: process.env['ANTHROPIC_API_KEY'] as string,
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] as string,
  },
  app: {
    url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
  },
} as const;
```

**Step 4: `.env.local` 직접 생성 (사용자가 실제 키 입력)**

`.env.example`을 복사하여 `.env.local`을 만들고 실제 API 키를 입력.

```bash
cp .env.example .env.local
# 이후 .env.local을 에디터로 열어 실제 키 입력
```

**Step 5: `.env.local`이 git에 추적되지 않는지 확인**

```bash
git status
```

예상: `.env.local`이 목록에 없어야 함 (`.gitignore`로 무시됨).

**Step 6: 커밋**

```bash
git add .env.example src/lib/env.ts .gitignore
git commit -m "feat: 환경 변수 관리 체계 구축 (INF-005)"
```

---

### Task 4: Supabase 클라이언트 유틸리티 생성

> INF-003/004에서 테이블을 만들기 전에 Supabase 클라이언트를 코드에 먼저 준비한다.

**Files:**

- Create: `choijang/src/lib/supabase/client.ts`
- Create: `choijang/src/lib/supabase/server.ts`
- Create: `choijang/src/types/database.ts`

**Step 1: Supabase 패키지 설치**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

**Step 2: `src/lib/supabase/client.ts` 생성 (클라이언트 사이드)**

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// 클라이언트 컴포넌트에서 사용하는 Supabase 인스턴스
// NEXT_PUBLIC_* 키만 사용 (브라우저에 노출되어도 안전)
export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  );
}
```

**Step 3: `src/lib/supabase/server.ts` 생성 (서버 사이드)**

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// 서버 컴포넌트 / API Route에서 사용하는 Supabase 인스턴스
// SERVICE_ROLE_KEY 사용 가능 (서버에서만 실행됨)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 쿠키 설정 무시 (읽기 전용)
          }
        },
      },
    }
  );
}

// Service Role 클라이언트 — RLS 우회, 서버 전용
export function createServiceClient() {
  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}
```

**Step 4: `src/types/database.ts` 생성 (DB 타입 정의)**

```typescript
// Supabase 테이블 타입 정의
// Sprint 1에서 생성하는 analyses, credits, credit_transactions 테이블을 반영한다.

export type AnalysisStatus = 'pending' | 'completed' | 'failed';
export type AnalysisGrade = 'S' | 'A' | 'B' | 'C' | 'D';
export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus';

export interface Analysis {
  id: string;
  user_id: string | null;
  session_id: string | null;
  idea_input: string;
  idea_summary: string | null;
  industry: string | null;
  score_total: number | null;
  score_market: number | null;
  score_competition: number | null;
  score_revenue: number | null;
  grade: AnalysisGrade | null;
  result_json: Record<string, unknown> | null;
  model_meta: Record<string, unknown> | null;
  status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

// Supabase 클라이언트 제네릭 타입
export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: Analysis;
        Insert: Omit<Analysis, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Analysis, 'id' | 'created_at'>>;
      };
      credits: {
        Row: Credit;
        Insert: Omit<Credit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Credit, 'id' | 'created_at'>>;
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
```

**Step 5: type-check 통과 확인**

```bash
npm run type-check
```

예상: 에러 0건.

**Step 6: 커밋**

```bash
git add src/lib/supabase/ src/types/
git commit -m "feat: Supabase 클라이언트 유틸리티 및 DB 타입 정의 생성"
```

---

### Task 5: Supabase DB 마이그레이션 SQL 파일 생성 (INF-003, INF-004)

> Supabase 대시보드에서 직접 SQL을 실행하지 않고, 마이그레이션 파일로 버전 관리한다.

**Files:**

- Create: `choijang/supabase/migrations/20260316_001_create_analyses.sql`
- Create: `choijang/supabase/migrations/20260316_002_create_credits.sql`

**Step 1: `supabase/migrations/` 디렉토리 생성**

```bash
mkdir -p supabase/migrations
```

**Step 2: `20260316_001_create_analyses.sql` 생성**

```sql
-- ============================================================
-- 마이그레이션: analyses 테이블 생성
-- 목적: 사용자의 아이디어 분석 결과를 저장한다.
--       비로그인 사용자는 session_id로, 로그인 사용자는 user_id로 식별.
-- ============================================================

CREATE TABLE IF NOT EXISTS analyses (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id        TEXT,                              -- 비로그인 사용자 임시 식별자
  idea_input        TEXT        NOT NULL,              -- 사용자가 입력한 원본 아이디어
  idea_summary      TEXT,                              -- AI가 생성한 아이디어 요약 제목
  industry          TEXT,                              -- 자동 분류된 업종 (ex: SaaS, F&B)
  score_total       SMALLINT    CHECK (score_total       BETWEEN 0 AND 100),
  score_market      SMALLINT    CHECK (score_market      BETWEEN 0 AND 100),
  score_competition SMALLINT    CHECK (score_competition BETWEEN 0 AND 100),
  score_revenue     SMALLINT    CHECK (score_revenue     BETWEEN 0 AND 100),
  grade             TEXT        CHECK (grade IN ('S', 'A', 'B', 'C', 'D')),
  result_json       JSONB,                             -- Zone A/B/C 전체 분석 결과
  model_meta        JSONB,                             -- 사용된 모델 명, 신뢰도, 일치율
  status            TEXT        NOT NULL DEFAULT 'completed'
                                CHECK (status IN ('pending', 'completed', 'failed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 조회 성능 최적화 인덱스
CREATE INDEX IF NOT EXISTS analyses_user_id_idx    ON analyses(user_id);
CREATE INDEX IF NOT EXISTS analyses_session_id_idx ON analyses(session_id);
CREATE INDEX IF NOT EXISTS analyses_created_at_idx ON analyses(created_at DESC);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 로그인 사용자: 본인 분석 이력만 조회 가능
CREATE POLICY "본인 분석 이력 조회"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- service_role 키: 전체 접근 허용 (서버 사이드 API에서만 사용)
CREATE POLICY "서비스 롤 전체 접근"
  ON analyses FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**Step 3: `20260316_002_create_credits.sql` 생성**

```sql
-- ============================================================
-- 마이그레이션: credits + credit_transactions 테이블 생성
-- 목적: v2 결제 시스템 연동을 위해 선준비. Sprint 1에서 생성하여
--       v2 착수 시 데이터 마이그레이션 없이 바로 사용 가능하게 한다.
-- ============================================================

-- 사용자별 크레딧 잔액 테이블
CREATE TABLE IF NOT EXISTS credits (
  id               UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance          INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0), -- 현재 잔액
  total_purchased  INTEGER NOT NULL DEFAULT 0,                      -- 누적 구매량
  total_used       INTEGER NOT NULL DEFAULT 0,                      -- 누적 사용량
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT credits_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS credits_user_id_idx ON credits(user_id);

CREATE TRIGGER credits_updated_at
  BEFORE UPDATE ON credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 크레딧 조회"
  ON credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "서비스 롤 크레딧 접근"
  ON credits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 크레딧 거래 이력 테이블
-- ============================================================

CREATE TABLE IF NOT EXISTS credit_transactions (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount       INTEGER NOT NULL,              -- 양수: 충전, 음수: 차감
  type         TEXT    NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  reference_id UUID,                          -- analyses.id 또는 결제 트랜잭션 ID
  note         TEXT,                          -- 비고 (ex: "스타터 패키지 구매")
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS credit_transactions_user_id_idx ON credit_transactions(user_id);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "본인 거래 이력 조회"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "서비스 롤 거래 이력 접근"
  ON credit_transactions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

**Step 4: Supabase 대시보드에서 SQL 실행 (수동)**

1. Supabase 대시보드 → SQL Editor 접속
2. `20260316_001_create_analyses.sql` 내용 붙여넣기 → Run
3. `20260316_002_create_credits.sql` 내용 붙여넣기 → Run
4. Table Editor에서 `analyses`, `credits`, `credit_transactions` 테이블 생성 확인

**Step 5: RLS 검증 (수동, Supabase Dashboard > Table Editor)**

`anon` 키로 직접 SELECT 쿼리 실행 시 데이터 반환 없음 확인:

```sql
-- API Key를 anon 키로 설정 후 실행
SELECT * FROM analyses;
-- 예상: 0 rows (RLS로 차단됨)
```

**Step 6: 마이그레이션 파일 커밋**

```bash
git add supabase/migrations/
git commit -m "feat: Supabase DB 마이그레이션 SQL 작성 (analyses, credits 테이블) (INF-003, INF-004)"
```

---

### Task 6: GitHub Actions CI 워크플로우 생성 (INF-002)

**Files:**

- Create: `choijang/.github/workflows/ci.yml`

> `.github/` 디렉토리는 `choijang/` 이 아닌 레포지토리 루트에 위치해야 GitHub이 인식한다.

**Step 1: `.github/workflows/ci.yml` 생성**

레포지토리 루트(`ITDev/`) 기준으로:

```yaml
name: CI

on:
  push:
    branches: [main, sprint1, sprint2, sprint3, sprint4, sprint5, sprint6, sprint7, sprint8]
  pull_request:
    branches: [main]

defaults:
  run:
    working-directory: choijang

jobs:
  lint-and-build:
    name: Lint + Type Check + Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Node.js 설정
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: choijang/package-lock.json

      - name: 의존성 설치
        run: npm ci

      - name: ESLint 검사
        run: npm run lint

      - name: TypeScript 타입 검사
        run: npm run type-check

      - name: Prettier 포맷 검사
        run: npm run format:check

      - name: 프로덕션 빌드
        run: npm run build
        env:
          # 빌드 시 환경 변수 플레이스홀더 (실제 값은 Vercel에서 주입)
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          NEXT_PUBLIC_APP_URL: http://localhost:3000
```

**Step 2: GitHub 레포지토리 Secrets 설정 (수동)**

GitHub 레포 → Settings → Secrets and variables → Actions → New repository secret:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

**Step 3: 커밋 후 CI 통과 확인**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: GitHub Actions CI 워크플로우 추가 (INF-002)"
git push origin sprint1
```

GitHub Actions 탭에서 워크플로우 실행 → 통과 확인.

---

### Task 7: 최종 검증 및 Sprint 1 완료 체크

**Step 1: 로컬 전체 검사 실행**

```bash
cd choijang
npm run lint
npm run format:check
npm run type-check
npm run build
```

예상: 4개 명령 모두 에러 0건.

**Step 2: Sprint 1 DoD 체크리스트 확인**

`docs/sprint/sprint1.md`의 완료 기준 체크리스트를 검토하고 완료 항목을 `✅`로 업데이트.

**Step 3: 최종 커밋**

```bash
git add docs/sprint/sprint1.md
git commit -m "docs: Sprint 1 완료 기준 체크리스트 업데이트"
```

---

## 수동 필요 항목 요약 (deploy.md 작성 대상)

| 항목                   | 설명                                                    |
| ---------------------- | ------------------------------------------------------- |
| Supabase 프로젝트 생성 | 대시보드에서 신규 프로젝트 생성 후 URL/키 복사          |
| Supabase SQL 실행      | SQL Editor에서 마이그레이션 파일 2개 실행               |
| Vercel 프로젝트 연결   | GitHub 레포 Import, 루트 디렉토리를 `choijang`으로 설정 |
| Vercel 환경 변수 설정  | Settings → Environment Variables에 API 키 입력          |
| GitHub Secrets 설정    | CI 빌드를 위한 API 키 Secrets 등록                      |
| `.env.local` 작성      | `.env.example` 복사 후 실제 키 입력                     |

---

**Plan complete and saved to `docs/plans/2026-03-13-sprint1-infra.md`.**

**두 가지 실행 옵션:**

**1. Subagent-Driven (현재 세션)** — 태스크별 서브에이전트 파견, 코드 리뷰 후 다음 태스크 진행

**2. Parallel Session (별도 세션)** — 새 세션에서 executing-plans 스킬로 일괄 실행

**어떤 방식으로 진행할까요?**
