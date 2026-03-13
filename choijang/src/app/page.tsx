'use client';

import { useState } from 'react';
import ScoreCard from '@/components/ScoreCard';
import type { AnalysisResult } from '@/types/analysis';

export default function Home() {
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (idea.trim().length < 10) {
      setError('아이디어를 10자 이상 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json() as AnalysisResult & { error?: string };
      if (!res.ok) {
        setError(data.error ?? '오류가 발생했습니다.');
      } else {
        setResult(data);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">아이디어 사업화 분석</h1>
          <p className="text-gray-500">당신의 아이디어, AI가 사업화 가능성을 분석합니다</p>
        </div>

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            아이디어를 설명해주세요
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="예: 직장인을 위한 점심 구독 서비스. 매일 아침 원하는 음식을 미리 예약하면 점심에 사무실로 배달해주는 서비스입니다."
            className="w-full h-36 p-3 border rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{idea.length} / 2000자</span>
            <button
              type="submit"
              disabled={loading || idea.trim().length < 10}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '분석 중...' : '분석 시작하기'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        </form>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-sm">AI가 아이디어를 분석하고 있습니다...</p>
          </div>
        )}

        {/* 결과 */}
        {result && <ScoreCard result={result} />}
      </div>
    </main>
  );
}
