// 수익 모델 분석 모듈 (BE-004) — GPT-4o-mini
import OpenAI from 'openai';
import { z } from 'zod';
import { env } from '@/lib/env';
import { withTimeout } from '../timeout';
import type { RevenueAnalysisResult } from '@/types/analysis';

// 개발 중 비용 절감 — 프로덕션 시 gpt-4o로 전환
const MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 25000;

const RevenueSchema = z.object({
  score_revenue: z.number().int().min(0).max(100),
  revenue_model: z.string(),
  revenue_streams: z.array(z.string()),
  monetization_strategy: z.string(),
  unit_economics: z.string(),
});

const client = new OpenAI({ apiKey: env.openai.apiKey });

export async function analyzeRevenue(
  idea: string,
  industry: string,
): Promise<RevenueAnalysisResult> {
  const response = await withTimeout(
    client.chat.completions.create({
      model: MODEL,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `당신은 수익 모델 전문가입니다. 아이디어의 수익화 가능성을 분석하여 반드시 아래 JSON 형식으로만 응답하세요.
{
  "score_revenue": <0~100 정수, 수익 모델 성숙도>,
  "revenue_model": <"구독"|"광고"|"커머스"|"SaaS"|"마켓플레이스"|"프리미엄"|"기타">,
  "revenue_streams": [<수익원1>, <수익원2>, <수익원3>],
  "monetization_strategy": <수익화 전략 2~3문장>,
  "unit_economics": <단위 경제성 설명 1~2문장>
}`,
        },
        { role: 'user', content: `업종: ${industry}\n아이디어: ${idea}` },
      ],
    }),
    TIMEOUT_MS,
    'gpt-revenue',
  );

  const text = response.choices[0]?.message?.content;
  if (!text) throw new Error('gpt-revenue: 응답 없음');

  const parsed: unknown = JSON.parse(text);
  return RevenueSchema.parse(parsed);
}
