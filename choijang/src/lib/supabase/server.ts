import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

// 서버 컴포넌트 / API Route에서 사용하는 Supabase 인스턴스
// SERVICE_ROLE_KEY 사용 가능 (서버에서만 실행됨)
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 쿠키 설정 무시 (읽기 전용)
          }
        },
      },
    }
  );
}

// Service Role 클라이언트 — RLS 우회, 서버 전용
export function createServiceClient() {
  return createServerClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['SUPABASE_SERVICE_ROLE_KEY']!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );
}
