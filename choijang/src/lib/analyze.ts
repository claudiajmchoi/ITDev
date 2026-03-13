import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from '@/types/analysis';

const client = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY'],
});

const SYSTEM_PROMPT = `당신은 스타트업 아이디어를 평가하는 전문 비즈니스 분석가입니다.
사용자의 아이디어를 분석하여 반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트는 절대 포함하지 마세요.

{
  "score_total": <0~100 정수, 전체 사업화 성공 가능성>,
  "grade": <"S"|"A"|"B"|"C"|"D">,
  "score_market": <0~100 정수, 시장성>,
  "score_competition": <0~100 정수, 경쟁우위>,
  "score_revenue": <0~100 정수, 수익모델>,
  "summary": <아이디어 한줄 요약, 20자 이내>,
  "industry": <업종 분류, 예: SaaS, F&B, 커머스, 핀테크>,
  "strengths": [<강점1>, <강점2>, <강점3>],
  "risks": [<리스크1>, <리스크2>, <리스크3>],
  "actions": [<즉시 실행 액션1>, <액션2>, <액션3>]
}

등급 기준: S(90+), A(75~89), B(60~74), C(45~59), D(44 이하)`;

export async function analyzeIdea(idea: string): Promise<AnalysisResult> {
  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `다음 아이디어를 분석해주세요:\n\n${idea}`,
      },
    ],
  });

  const content = message.content[0];
  if (!content || content.type !== 'text') {
    throw new Error('예상치 못한 응답 형식');
  }

  const result = JSON.parse(content.text) as AnalysisResult;
  return result;
}
