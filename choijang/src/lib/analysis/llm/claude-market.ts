// 시장성 + 경쟁 분석 모듈 (BE-003) — Claude Haiku
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '@/lib/env';
import { withTimeout } from '../timeout';
import type { MarketAnalysisResult } from '@/types/analysis';

// 개발 중 비용 절감 — 프로덕션 시 claude-sonnet-4-5 등으로 전환
const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 25000;

const MarketSchema = z.object({
  score_market: z.number().int().min(0).max(100),
  score_competition: z.number().int().min(0).max(100),
  market_size: z.string(),
  market_trend: z.string(),
  competitor_count: z.enum(['few', 'moderate', 'many']),
  differentiation: z.string(),
  market_analysis: z.string(),
  competition_analysis: z.string(),
});

const client = new Anthropic({ apiKey: env.anthropic.apiKey });

export async function analyzeMarket(
  idea: string,
  industry: string,
): Promise<MarketAnalysisResult> {
  const response = await withTimeout(
    client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `당신은 시장 분석 전문가입니다. 아이디어의 시장성과 경쟁 환경을 분석하여 반드시 아래 JSON 형식으로만 응답하세요.
{
  "score_market": <0~100 정수, 시장 잠재력>,
  "score_competition": <0~100 정수, 경쟁우위 점수 (높을수록 유리)>,
  "market_size": <"소규모"|"중규모"|"대규모"|"글로벌">,
  "market_trend": <"성장"|"정체"|"축소">,
  "competitor_count": <"few"|"moderate"|"many">,
  "differentiation": <차별화 포인트 한 줄>,
  "market_analysis": <시장성 분석 2~3문장>,
  "competition_analysis": <경쟁 환경 분석 2~3문장>
}`,
      messages: [{ role: 'user', content: `업종: ${industry}\n아이디어: ${idea}` }],
    }),
    TIMEOUT_MS,
    'claude-market',
  );

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('claude-market: 응답 없음');
  }

  const parsed: unknown = JSON.parse(content.text);
  return MarketSchema.parse(parsed);
}
