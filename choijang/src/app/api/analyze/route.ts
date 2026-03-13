// SSE 분석 엔드포인트 (BE-001 + BE-008)
// 파이프라인: Rate Limit → 전처리/윤리 → 오케스트레이터 → 앙상블 → Zone A/B/C 전송 → DB 저장
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { preprocessIdea } from '@/lib/analysis/preprocessor';
import { runOrchestrator } from '@/lib/analysis/orchestrator';
import { aggregateResults } from '@/lib/analysis/ensemble';
import { saveAnalysis } from '@/lib/analysis/storage';
import { checkRateLimit } from '@/lib/rateLimit';

function sseMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';

  // Rate Limit 확인
  const rateLimitResult = await checkRateLimit(ip);
  if (!rateLimitResult.success) {
    return new Response(
      JSON.stringify({ error: '요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.' }),
      { status: 429, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // 입력 파싱
  let body: { idea?: string; session_id?: string };
  try {
    body = (await request.json()) as { idea?: string; session_id?: string };
  } catch {
    return new Response(JSON.stringify({ error: '잘못된 요청 형식입니다.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const idea = body.idea?.trim();
  const sessionId = body.session_id ?? null;

  if (!idea || idea.length < 10) {
    return new Response(JSON.stringify({ error: '아이디어를 10자 이상 입력해주세요.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (idea.length > 2000) {
    return new Response(JSON.stringify({ error: '아이디어는 2000자 이내로 입력해주세요.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(sseMessage(event, data)));
      };

      try {
        send('start', { message: '분석을 시작합니다.' });

        // 전처리 + 윤리 필터
        send('progress', { step: 'preprocess', message: '아이디어를 분석 중입니다...' });
        const preprocess = await preprocessIdea(idea);

        if (preprocess.ethicsFlag) {
          send('error', {
            code: 'ETHICS_VIOLATION',
            message: preprocess.ethicsReason ?? '이 아이디어는 분석할 수 없습니다.',
          });
          controller.close();
          return;
        }

        // 오케스트레이터 실행 (Zone A + B 병렬, Zone C 순차)
        const { market, revenue, insights, errors } = await runOrchestrator(
          idea,
          preprocess.industry,
          (message) => send('progress', { step: 'orchestrate', message }),
        );

        if (Object.keys(errors).length > 0) {
          console.warn('오케스트레이터 부분 실패:', errors);
        }

        // Zone A: 시장성 + 경쟁 분석
        send('zone_a', {
          score_market: market.score_market,
          score_competition: market.score_competition,
          market_analysis: market.market_analysis,
          competition_analysis: market.competition_analysis,
        });

        // Zone B: 수익 모델 분석
        send('zone_b', {
          score_revenue: revenue.score_revenue,
          revenue_model: revenue.revenue_model,
          revenue_streams: revenue.revenue_streams,
        });

        // Zone C: 종합 인사이트
        send('zone_c', {
          summary: insights.summary,
          strengths: insights.strengths,
          risks: insights.risks,
          actions: insights.actions,
        });

        // 앙상블 집계
        const ensemble = aggregateResults(market, revenue, insights, preprocess.industry);

        // 최종 결과
        send('result', {
          score_total: ensemble.score_total,
          grade: ensemble.grade,
          industry: ensemble.industry,
        });

        // DB 저장 (실패해도 스트림 계속)
        const analysisId = await saveAnalysis({
          ideaInput: idea,
          sessionId,
          userId: null,
          result: ensemble,
        });

        send('done', { analysis_id: analysisId });
      } catch (error) {
        console.error('분석 오류:', error);
        send('error', {
          code: 'INTERNAL_ERROR',
          message: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
