# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 저장소 구조

이 저장소는 두 가지 독립적인 영역으로 구성됩니다.

```
ITDev/
├── index.html          # 단일 파일 랜딩 페이지 (인라인 CSS/JS, 빌드 없음)
├── PRD.md              # 루트 레벨 PRD (초안)
├── choijang/           # 아이디어 사업화 성공 가능성 분석 서비스 프로젝트
│   ├── .claude/
│   │   ├── agents/     # 서브 에이전트 정의
│   │   └── skills/     # 스킬 정의
│   └── docs/
│       ├── PRD.md
│       ├── ROADMAP.md
│       ├── plans/      # 구현 계획 (YYYY-MM-DD-<feature-name>.md)
│       └── sprint/     # 스프린트 문서 및 검증 보고서
└── choiji-guide/       # Claude Code 설정 공유용 템플릿 레포지토리
    ├── .claude/
    │   ├── agents/
    │   └── skills/
    ├── CLAUDE.md        # 상세 에이전트/스킬 사용 가이드 참조
    └── docs/
```

## index.html

빌드 도구 없음. 단일 `index.html`에 CSS/JS 인라인. 브라우저에서 직접 열어 확인.

## choijang 프로젝트

**아이디어 사업화 성공 가능성 분석 서비스** — 기술 스택 및 상세 내용은 `choijang/docs/PRD.md` 참조.

> 에이전트·스킬 구조, 스프린트 워크플로우, 언어 규칙 등 상세 운영 가이드는 **`choiji-guide/CLAUDE.md`** 를 따릅니다.

### 에이전트 사용 순서

| 단계 | 에이전트         | 입력 → 출력                                         |
| ---- | ---------------- | --------------------------------------------------- |
| 1    | `prd-to-roadmap` | `docs/PRD.md` → `docs/ROADMAP.md`                   |
| 2    | `sprint-planner` | `ROADMAP.md` → `docs/sprint/sprint{N}.md`           |
| 3    | _(구현)_         | `writing-plans` 스킬로 세부 계획 수립 후 실행       |
| 4    | `sprint-close`   | ROADMAP 업데이트 → PR → 코드 리뷰 → Playwright 검증 |

### 스프린트 개발 규칙

- 스프린트 시작 시 `sprint{N}` 브랜치 생성 (worktree 사용 금지)
- `karpathy-guidelines` 스킬 준수 — 최소한의 변경, 검증 가능한 완료 기준
- 문서 저장 위치: 계획 → `docs/plans/`, 스프린트 → `docs/sprint/sprint{N}.md`, 첨부 → `docs/sprint/sprint{N}/`
- 체크리스트: 완료 `✅` / 미완료 `⬜` (GFM `[x]` 사용 금지)

### 언어 규칙

- 응답·문서·커밋 메시지: **한국어**
- 변수명·함수명: **영어**

## 언어 및 커뮤니케이션 규칙

- 기본 응답 언어: 한국어
- 코드 주석: 한국어로 작성
- 커밋 메시지: 한국어로 작성
- 문서화: 한국어로 작성
- 변수명/함수명: 영어 (코드 표준 준수)

## 개발시 유의해야할 사항

- sprint 관련 문서 구조:
  - 스프린트 계획/완료 문서: `docs/sprint/sprint{n}.md`
  - 스프린트 첨부 파일 (스크린샷, 보고서 등): `docs/sprint/sprint{n}/`
- sprint 개발이 plan 모드로 진행될 때는 다음을 꼭 준수합니다.
  - karpathy-guidelines skill을 준수하세요.
  - sprint 가 새로 시작될 때는 새로 branch를 sprint{n} 이름으로 생성하고 해당 브랜치에서 작업해주세요. (worktree 사용하지 말아주세요)
  - 다음과 같이 agent를 활용합니다.
    1. sprint-planner agent가 계획 수립 작업을 수행하도록 해주세요.
    2. 구현/검증 단계에서는 각 task의 내용에 따라 적절한 agent가 있는지 확인 한 후 적극 활용해주세요.
    3. 스프린트 구현이 완료되면 sprint-close agent를 사용하여 마무리 작업(ROADMAP 업데이트, PR 생성, 코드 리뷰, 자동 검증)을 수행해주세요.

- 스프린트 검증 원칙 — **자동화 가능한 항목은 sprint-close 시점에 직접 실행**:
  - ✅ **자동 실행**: `docker compose exec backend pytest -v` — 백엔드 통합 테스트
  - ✅ **자동 실행**: API 동작 검증 (curl/httpx) — Docker 컨테이너가 실행 중인 경우 sprint-close agent가 직접 실행
  - ✅ **자동 실행**: 데모 모드 API 검증 — 마찬가지로 서버 실행 중이면 자동 실행
  - ❌ **수동 필요**: `docker compose up --build` — 새 코드 반영을 위한 Docker 재빌드 (타이밍을 사용자가 결정)
  - ❌ **수동 필요**: `alembic upgrade head` — prod DB 스키마 변경 (되돌릴 수 없으므로 사용자가 직접 실행)
  - ❌ **수동 필요**: 브라우저 UI 시각적 확인 (프론트엔드 렌더링, 버튼 동작 등)
  - sprint-close agent는 자동 실행 항목을 실행하고 결과를 deploy.md에 기록해야 합니다.
  - deploy.md에는 "자동 검증 완료" 항목과 "수동 검증 필요" 항목을 명확히 구분하여 기재합니다.

- 사용자가 직접 수행해야 하는 작업은 deploy.md 파일을 생성하거나 기존에 존재하는 deploy.md에 수행해야하는 작업을 자세히 정리해주세요.
- 체크리스트 작성 형식:
  - 완료 항목: `- ✅ 항목 내용`
  - 미완료 항목: `- ⬜ 항목 내용`
  - GFM `[x]`/`[ ]` 대신 이모지를 사용하여 마크다운 미리보기에서 시각적 구분을 보장합니다.
