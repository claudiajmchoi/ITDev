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
