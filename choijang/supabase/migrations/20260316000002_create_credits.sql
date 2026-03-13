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
