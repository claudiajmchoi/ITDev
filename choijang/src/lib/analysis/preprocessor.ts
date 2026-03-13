// 입력 전처리 — 언어 감지, 품질 평가, 윤리 필터 (BE-002 + BE-013)
import Anthropic from '@anthropic-ai/sdk';
import { env } from '@/lib/env';
import { withTimeout } from './timeout';
import type { PreprocessResult } from '@/types/analysis';

const PREPROCESS_MODEL = 'claude-haiku-4-5-20251001';

// 1단계 키워드 기반 윤리 필터
const ETHICS_KEYWORDS = [
  '마약', '도박', '불법', '해킹', '사기', '위조', '매춘', '성매매',
  '무기', '폭발물', '테러', '살인', '자살', '피싱',
];

const client = new Anthropic({ apiKey: env.anthropic.apiKey });

// 한글 유니코드 비율로 언어 감지
function detectLanguage(text: string): 'ko' | 'en' | 'mixed' {
  const koreanChars = (text.match(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g) ?? []).length;
  const totalChars = text.replace(/\s/g, '').length;
  if (totalChars === 0) return 'en';
  const ratio = koreanChars / totalChars;
  if (ratio > 0.5) return 'ko';
  if (ratio > 0.1) return 'mixed';
  return 'en';
}

// 길이 + 핵심 요소 기반 품질 평가
function evaluateQuality(text: string): { quality: 'low' | 'medium' | 'high'; score: number } {
  let score = 0;
  if (text.length >= 50) score += 20;
  if (text.length >= 100) score += 20;
  if (text.length >= 200) score += 10;

  if (/제품|서비스|앱|플랫폼|솔루션|product|service|app|platform/i.test(text)) score += 15;
  if (/고객|사용자|타겟|시장|customer|user|target|market/i.test(text)) score += 15;
  if (/수익|매출|가격|구독|revenue|price|subscription|monetize/i.test(text)) score += 10;
  if (/문제|불편|해결|니즈|pain|problem|need|solve/i.test(text)) score += 10;

  const quality = score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low';
  return { quality, score };
}

function checkEthicsKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return ETHICS_KEYWORDS.some((keyword) => lower.includes(keyword));
}

export async function preprocessIdea(idea: string): Promise<PreprocessResult> {
  const language = detectLanguage(idea);
  const { quality, score: qualityScore } = evaluateQuality(idea);

  // 1단계: 키워드 기반 윤리 필터
  if (checkEthicsKeywords(idea)) {
    return {
      language,
      quality,
      qualityScore,
      industry: '미분류',
      ethicsFlag: true,
      ethicsReason: '비윤리적 키워드가 포함된 아이디어입니다.',
      normalizedIdea: idea,
    };
  }

  // 2단계: Claude 소형 모델로 업종 분류 + 맥락 윤리 필터
  try {
    const response = await withTimeout(
      client.messages.create({
        model: PREPROCESS_MODEL,
        max_tokens: 256,
        system: `아이디어를 분석하여 JSON으로만 응답하세요. 다른 텍스트는 포함하지 마세요.
{
  "industry": <업종: "SaaS"|"F&B"|"커머스"|"핀테크"|"헬스케어"|"에듀테크"|"물류"|"게임"|"미디어"|"기타">,
  "ethics_flag": <비윤리적이면 true, 아니면 false>,
  "ethics_reason": <ethics_flag=true일 때만 사유>
}`,
        messages: [{ role: 'user', content: `아이디어: ${idea}` }],
      }),
      10000,
      'preprocessor-claude',
    );

    const content = response.content[0];
    if (content?.type === 'text') {
      const parsed = JSON.parse(content.text) as {
        industry?: string;
        ethics_flag?: boolean;
        ethics_reason?: string;
      };
      return {
        language,
        quality,
        qualityScore,
        industry: parsed.industry ?? '기타',
        ethicsFlag: parsed.ethics_flag ?? false,
        ethicsReason: parsed.ethics_reason,
        normalizedIdea: idea,
      };
    }
  } catch {
    // 전처리 실패 시 기본값으로 계속 진행
  }

  return {
    language,
    quality,
    qualityScore,
    industry: '기타',
    ethicsFlag: false,
    normalizedIdea: idea,
  };
}
