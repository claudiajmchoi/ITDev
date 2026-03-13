import { NextRequest, NextResponse } from 'next/server';
import { analyzeIdea } from '@/lib/analyze';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { idea?: string };
    const idea = body.idea?.trim();

    if (!idea || idea.length < 10) {
      return NextResponse.json(
        { error: '아이디어를 10자 이상 입력해주세요.' },
        { status: 400 }
      );
    }

    if (idea.length > 2000) {
      return NextResponse.json(
        { error: '아이디어는 2000자 이내로 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await analyzeIdea(idea);
    return NextResponse.json(result);
  } catch (error) {
    console.error('분석 오류:', error);
    return NextResponse.json(
      { error: '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}
