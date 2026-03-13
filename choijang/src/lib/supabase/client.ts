import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

// 클라이언트 컴포넌트에서 사용하는 Supabase 인스턴스
// NEXT_PUBLIC_* 키만 사용 (브라우저에 노출되어도 안전)
export function createClient() {
  return createBrowserClient<Database>(
    process.env['NEXT_PUBLIC_SUPABASE_URL']!,
    process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!
  );
}
