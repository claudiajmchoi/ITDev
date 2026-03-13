// 종합 인사이트 생성 모듈 (BE-005) — Claude Haiku
import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import { env } from '@/lib/env';
import { withTimeout } from '../timeout';
import type { InsightsResult, MarketAnalysisResult, RevenueAnalysisResult } from '@/types/analysis';

const MODEL = 'claude-haiku-4-5-20251001';
const TIMEOUT_MS = 25000;

const InsightsSchema = z.object({
  summary: z.string().max(50),
  strengths: z.array(z.string()).length(3),
  risks: z.array(z.string()).length(3),
  actions: z.array(z.string()).length(3),
});

const client = new Anthropic({ apiKey: env.anthropic.apiKey });

export async function generateInsights(
  idea: string,
  market: MarketAnalysisResult,
  revenue: RevenueAnalysisResult,
): Promise<InsightsResult> {
  const context = JSON.stringify({ market, revenue }, null, 2);

  const response = await withTimeout(
    client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `당신은 스타트업 전략 컨설턴트입니다. 시장 분석과 수익 분석 결과를 바탕으로 종합 인사이트를 제공하세요.
반드시 아래 JSON 형식으로만 응답하세요.
{
  "summary": <아이디어 핵심 한줄 요약, 30자 이내>,
  "strengths": [<강점1>, <강점2>, <강점3>],
  "risks": [<주요 리스크1>, <리스크2>, <리스크3>],
  "actions": [<즉시 실행 액션1>, <액션2>, <액션3>]
}`,
      messages: [
        { role: 'user', content: `아이디어: ${idea}\n\n분석 결과:\n${context}` },
      ],
    }),
    TIMEOUT_MS,
    'claude-insights',
  );

  const content = response.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('claude-insights: 응답 없음');
  }

  const parsed: unknown = JSON.parse(content.text);
  return InsightsSchema.parse(parsed);
}
