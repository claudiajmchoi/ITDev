// 기존 MVP 결과 타입
export interface AnalysisResult {
  score_total: number;        // 0~100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  score_market: number;       // 시장성 점수
  score_competition: number;  // 경쟁 강도 점수
  score_revenue: number;      // 수익 모델 점수
  summary: string;            // 아이디어 한줄 요약
  strengths: string[];        // 강점 3가지
  risks: string[];            // 리스크 3가지
  actions: string[];          // 액션 아이템 3가지
  industry: string;           // 업종
  market_analysis: {
    market_size: string;      // 시장 규모 (예: "약 2조원")
    growth_rate: string;      // 성장률 (예: "연 12% 성장")
    trend: 'growing' | 'stable' | 'declining';
    target_customer: string;  // 주요 타겟 고객
    overview: string;         // 시장 분석 요약 2~3문장
  };
  competitors: Array<{
    name: string;             // 경쟁사/서비스명
    type: 'direct' | 'indirect';
    description: string;      // 한줄 설명
    weakness: string;         // 우리가 파고들 수 있는 약점
  }>;
}

// Sprint 2 — 전처리 결과
export interface PreprocessResult {
  language: 'ko' | 'en' | 'mixed';
  quality: 'low' | 'medium' | 'high';
  qualityScore: number;
  industry: string;
  ethicsFlag: boolean;
  ethicsReason?: string;
  normalizedIdea: string;
}

// Sprint 2 — 시장성 + 경쟁 분석 결과 (Zone A)
export interface MarketAnalysisResult {
  score_market: number;
  score_competition: number;
  market_size: string;
  market_trend: string;
  competitor_count: 'few' | 'moderate' | 'many';
  differentiation: string;
  market_analysis: string;
  competition_analysis: string;
}

// Sprint 2 — 수익 모델 분석 결과 (Zone B)
export interface RevenueAnalysisResult {
  score_revenue: number;
  revenue_model: string;
  revenue_streams: string[];
  monetization_strategy: string;
  unit_economics: string;
}

// Sprint 2 — 종합 인사이트 결과 (Zone C)
export interface InsightsResult {
  summary: string;
  strengths: string[];
  risks: string[];
  actions: string[];
}

// Sprint 2 — 앙상블 집계 결과 (모델 메타 포함)
export interface EnsembleResult extends AnalysisResult {
  model_meta: {
    models_used: string[];
    consensus_level: 'high' | 'medium' | 'low';
    market_model: string;
    revenue_model: string;
    insights_model: string;
  };
}
