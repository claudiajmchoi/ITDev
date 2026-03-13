// 멀티 LLM 병렬 오케스트레이션 (BE-006)
// Zone A(시장/경쟁) + Zone B(수익)를 병렬 실행 후, Zone C(인사이트)를 순차 실행
import { analyzeMarket } from './llm/claude-market';
import { analyzeRevenue } from './llm/gpt-revenue';
import { generateInsights } from './llm/claude-insights';
import type { MarketAnalysisResult, RevenueAnalysisResult, InsightsResult } from '@/types/analysis';

export interface OrchestratorResult {
  market: MarketAnalysisResult;
  revenue: RevenueAnalysisResult;
  insights: InsightsResult;
  errors: Record<string, string>;
}

export async function runOrchestrator(
  idea: string,
  industry: string,
  onProgress?: (message: string) => void,
): Promise<OrchestratorResult> {
  onProgress?.('병렬 분석 시작');

  // Zone A + Zone B 병렬 실행
  const [marketSettled, revenueSettled] = await Promise.allSettled([
    analyzeMarket(idea, industry),
    analyzeRevenue(idea, industry),
  ]);

  const errors: Record<string, string> = {};

  const market: MarketAnalysisResult =
    marketSettled.status === 'fulfilled'
      ? marketSettled.value
      : (() => {
          errors.market =
            marketSettled.reason instanceof Error
              ? marketSettled.reason.message
              : '시장 분석 실패';
          return fallbackMarket();
        })();

  const revenue: RevenueAnalysisResult =
    revenueSettled.status === 'fulfilled'
      ? revenueSettled.value
      : (() => {
          errors.revenue =
            revenueSettled.reason instanceof Error
              ? revenueSettled.reason.message
              : '수익 분석 실패';
          return fallbackRevenue();
        })();

  // Zone C 순차 실행 (시장/수익 결과 필요)
  onProgress?.('종합 인사이트 생성 중');

  let insights: InsightsResult;
  try {
    insights = await generateInsights(idea, market, revenue);
  } catch (error) {
    errors.insights = error instanceof Error ? error.message : '인사이트 생성 실패';
    insights = fallbackInsights();
  }

  return { market, revenue, insights, errors };
}

function fallbackMarket(): MarketAnalysisResult {
  return {
    score_market: 50,
    score_competition: 50,
    market_size: '중규모',
    market_trend: '성장',
    competitor_count: 'moderate',
    differentiation: '분석 불가',
    market_analysis: '시장 분석을 완료하지 못했습니다.',
    competition_analysis: '경쟁 분석을 완료하지 못했습니다.',
  };
}

function fallbackRevenue(): RevenueAnalysisResult {
  return {
    score_revenue: 50,
    revenue_model: '기타',
    revenue_streams: ['분석 불가'],
    monetization_strategy: '수익 모델 분석을 완료하지 못했습니다.',
    unit_economics: '단위 경제성 분석 불가',
  };
}

function fallbackInsights(): InsightsResult {
  return {
    summary: '아이디어 분석 완료',
    strengths: ['분석 불가', '분석 불가', '분석 불가'],
    risks: ['분석 불가', '분석 불가', '분석 불가'],
    actions: ['분석 불가', '분석 불가', '분석 불가'],
  };
}
