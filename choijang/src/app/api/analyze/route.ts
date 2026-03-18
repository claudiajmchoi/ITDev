// MVP 분석 엔드포인트 — Claude 단일 호출, JSON 응답
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { AnalysisResult } from '@/types/analysis';

const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });

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
  "actions": [<즉시 실행 액션1>, <액션2>, <액션3>],
  "market_analysis": {
    "market_size_domestic": <국내 시장 규모, 예: "국내 약 3조원">,
    "market_size_global": <글로벌 시장 규모, 예: "글로벌 약 120조원">,
    "growth_rate": <성장률, 예: "연 12% 성장">,
    "trend": <"growing"|"stable"|"declining">,
    "target_customer": <주요 타겟 고객, 예: "20~35세 직장인">,
    "overview": <시장 분석 요약 2~3문장>
  },
  "competitors": [
    {
      "name": <경쟁사 또는 유사 서비스명>,
      "type": <"direct"|"indirect">,
      "description": <한줄 설명>,
      "weakness": <우리가 파고들 수 있는 약점>
    }
  ],
  "global_services": [
    {
      "name": <해외 유사 서비스명>,
      "country": <국가, 예: "미국">,
      "description": <서비스 한줄 설명>,
      "traction": <성과/규모, 예: "MAU 500만", "기업가치 1조원">,
      "insight": <한국 시장에서 배울 수 있는 점>
    }
  ]
}

등급 기준: S(90+), A(75~89), B(60~74), C(45~59), D(44 이하)
- competitors는 직접경쟁 2개 + 간접경쟁 1개, 총 3개 포함
- global_services는 해외 유사 서비스 3개 포함 (서로 다른 국가 우선)
- 모든 분석은 실제 존재하는 서비스/데이터 기반으로 작성`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { idea?: string };
    const idea = body.idea?.trim();

    if (!idea || idea.length < 10) {
      return NextResponse.json({ error: '아이디어를 10자 이상 입력해주세요.' }, { status: 400 });
    }
    if (idea.length > 2000) {
      return NextResponse.json({ error: '아이디어는 2000자 이내로 입력해주세요.' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `다음 아이디어를 분석해주세요:\n\n${idea}` }],
    });

    const content = message.content[0];
    if (!content || content.type !== 'text') {
      throw new Error('예상치 못한 응답 형식');
    }

    // 응답 텍스트에서 JSON 블록 추출 시도
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Claude 비JSON 응답:', content.text);
      throw new Error('AI가 올바른 형식으로 응답하지 않았습니다. 다시 시도해주세요.');
    }

    const result = JSON.parse(jsonMatch[0]) as AnalysisResult;
    return NextResponse.json(result);
  } catch (error) {
    console.error('분석 오류:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 },
    );
  }
}
