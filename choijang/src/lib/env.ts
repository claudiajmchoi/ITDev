// 서버 시작 시 필수 환경 변수 존재 여부를 검증한다.
// 누락된 키가 있으면 즉시 에러를 던져 런타임 오류 전에 조기 감지.
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'ANTHROPIC_API_KEY',
    'OPENAI_API_KEY',
  ] as const;

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`필수 환경 변수 누락: ${missing.join(', ')}`);
  }
}

// 타입 안전한 환경 변수 접근자
export const env = {
  supabase: {
    url: process.env['NEXT_PUBLIC_SUPABASE_URL'] as string,
    anonKey: process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'] as string,
    serviceRoleKey: process.env['SUPABASE_SERVICE_ROLE_KEY'] as string,
  },
  anthropic: {
    apiKey: process.env['ANTHROPIC_API_KEY'] as string,
  },
  openai: {
    apiKey: process.env['OPENAI_API_KEY'] as string,
  },
  app: {
    url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
  },
} as const;
