// 멀티 LLM 결과 집계 — 가중 평균, 등급 계산, 불일치 감지 (BE-007)
import type {
  EnsembleResult,
  MarketAnalysisResult,
  RevenueAnalysisResult,
  InsightsResult,
} from '@/types/analysis';

// 가중치: 수익 모델 40%, 시장성 35%, 경쟁우위 25%
const WEIGHTS = {
  market: 0.35,
  competition: 0.25,
  revenue: 0.40,
} as const;

function calculateGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S';
  if (score >= 75) return 'A';
  if (score >= 60) return 'B';
  if (score >= 45) return 'C';
  return 'D';
}

// 시장 점수와 수익 점수 간 불일치로 컨센서스 수준 판단
function calculateConsensus(
  market: MarketAnalysisResult,
  revenue: RevenueAnalysisResult,
): 'high' | 'medium' | 'low' {
  const diff = Math.abs(market.score_market - revenue.score_revenue);
  if (diff <= 15) return 'high';
  if (diff <= 30) return 'medium';
  return 'low';
}

export function aggregateResults(
  market: MarketAnalysisResult,
  revenue: RevenueAnalysisResult,
  insights: InsightsResult,
  industry: string,
): EnsembleResult {
  const weightedScore = Math.round(
    market.score_market * WEIGHTS.market +
      market.score_competition * WEIGHTS.competition +
      revenue.score_revenue * WEIGHTS.revenue,
  );

  const grade = calculateGrade(weightedScore);
  const consensusLevel = calculateConsensus(market, revenue);

  return {
    score_total: weightedScore,
    grade,
    score_market: market.score_market,
    score_competition: market.score_competition,
    score_revenue: revenue.score_revenue,
    summary: insights.summary,
    strengths: insights.strengths,
    risks: insights.risks,
    actions: insights.actions,
    industry,
    model_meta: {
      models_used: ['claude-haiku-4-5-20251001', 'gpt-4o-mini'],
      consensus_level: consensusLevel,
      market_model: 'claude-haiku-4-5-20251001',
      revenue_model: 'gpt-4o-mini',
      insights_model: 'claude-haiku-4-5-20251001',
    },
  };
}
