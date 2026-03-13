// 보완 질문 생성 + 재분석 엔드포인트 (BE-009)
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';

const MODEL = 'claude-haiku-4-5-20251001';
const client = new Anthropic({ apiKey: env.anthropic.apiKey });

export async function POST(request: NextRequest) {
  let body: { idea?: string; context?: string; mode?: 'questions' | 'reanalyze' };
  try {
    body = (await request.json()) as {
      idea?: string;
      context?: string;
      mode?: 'questions' | 'reanalyze';
    };
  } catch {
    return new Response(JSON.stringify({ error: '잘못된 요청 형식입니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { idea, context, mode = 'questions' } = body;

  if (!idea?.trim()) {
    return new Response(JSON.stringify({ error: '아이디어를 입력해주세요.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 보완 질문 생성 모드
  if (mode === 'questions') {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: 512,
        system: `당신은 스타트업 멘토입니다. 아이디어를 더 잘 이해하기 위한 핵심 보완 질문 3개를 JSON으로 응답하세요.
응답 형식: { "questions": ["질문1", "질문2", "질문3"] }`,
        messages: [{ role: 'user', content: `아이디어: ${idea}` }],
      });

      const content = response.content[0];
      if (!content || content.type !== 'text') {
        return new Response(JSON.stringify({ error: '질문 생성 실패' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      return new Response(content.text, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('clarify 오류:', error);
      return new Response(JSON.stringify({ error: '질문 생성 중 오류가 발생했습니다.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 재분석 모드: 보완 정보를 포함한 통합 아이디어 반환
  // 클라이언트는 이 combined_idea를 /api/analyze에 전달하면 됨
  if (!context?.trim()) {
    return new Response(JSON.stringify({ error: '보완 정보를 입력해주세요.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const combinedIdea = `${idea}\n\n[보완 정보]\n${context}`;
  return new Response(JSON.stringify({ combined_idea: combinedIdea }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
