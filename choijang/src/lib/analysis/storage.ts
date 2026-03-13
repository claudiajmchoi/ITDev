// 분석 결과 DB 저장 (BE-010)
// @supabase/ssr createServerClient 사용 — Edge Runtime 호환
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/types/database';
import type { EnsembleResult } from '@/types/analysis';

function getServiceClient() {
  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export interface StorageInput {
  ideaInput: string;
  sessionId: string | null;
  userId: string | null;
  result: EnsembleResult;
}

export async function saveAnalysis(input: StorageInput): Promise<string | null> {
  try {
    // supabase-js v2.99.x 제네릭 추론 한계로 as unknown 캐스팅 사용
    // 런타임 동작에는 영향 없음
    const supabase = getServiceClient() as unknown as {
      from: (table: string) => {
        insert: (values: Record<string, unknown>) => {
          select: (cols: string) => {
            single: () => Promise<{ data: { id: string } | null; error: Error | null }>;
          };
        };
      };
    };

    const { data, error } = await supabase
      .from('analyses')
      .insert({
        user_id: input.userId,
        session_id: input.sessionId,
        idea_input: input.ideaInput,
        idea_summary: input.result.summary,
        industry: input.result.industry,
        score_total: input.result.score_total,
        score_market: input.result.score_market,
        score_competition: input.result.score_competition,
        score_revenue: input.result.score_revenue,
        grade: input.result.grade,
        result_json: input.result as unknown as Record<string, unknown>,
        model_meta: input.result.model_meta as unknown as Record<string, unknown>,
        status: 'completed',
      })
      .select('id')
      .single();

    if (error) {
      console.error('분석 결과 저장 실패:', error);
      return null;
    }

    return data?.id ?? null;
  } catch (error) {
    console.error('DB 저장 오류:', error);
    return null;
  }
}
