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
    <main
      className="min-h-screen"
      style={{ background: 'linear-gradient(160deg, #080d18 0%, #0a0f1c 100%)' }}
    >
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-semibold tracking-widest uppercase"
            style={{
              background: 'rgba(96,165,250,0.1)',
              border: '1px solid rgba(96,165,250,0.2)',
              color: '#60a5fa',
              fontFamily: 'monospace',
            }}
          >
            AI Business Analysis
          </div>
          <h1
            className="text-3xl font-black mb-2"
            style={{ color: '#f1f5f9', letterSpacing: '-0.5px' }}
          >
            아이디어 사업화 분석
          </h1>
          <p style={{ color: '#475569' }}>당신의 아이디어, AI가 사업화 가능성을 분석합니다</p>
        </div>

        {/* 입력 폼 */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <label className="block text-sm font-medium mb-2" style={{ color: '#94a3b8' }}>
            아이디어를 설명해주세요
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="예: 직장인을 위한 점심 구독 서비스. 매일 아침 원하는 음식을 미리 예약하면 점심에 사무실로 배달해주는 서비스입니다."
            className="w-full h-36 p-3 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#e2e8f0',
            }}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: '#334155', fontFamily: 'monospace' }}>
              {idea.length} / 2000
            </span>
            <button
              type="submit"
              disabled={loading || idea.trim().length < 10}
              className="px-6 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                background: loading || idea.trim().length < 10
                  ? 'rgba(96,165,250,0.2)'
                  : 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: loading || idea.trim().length < 10 ? '#475569' : '#fff',
                cursor: loading || idea.trim().length < 10 ? 'not-allowed' : 'pointer',
                boxShadow: loading || idea.trim().length < 10 ? 'none' : '0 4px 20px rgba(59,130,246,0.35)',
              }}
            >
              {loading ? '분석 중...' : '분석 시작하기'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        </form>

        {/* 로딩 */}
        {loading && (
          <div className="text-center py-12">
            <div
              className="w-10 h-10 rounded-full mx-auto mb-4"
              style={{
                border: '2px solid rgba(96,165,250,0.2)',
                borderTop: '2px solid #60a5fa',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <p className="text-sm" style={{ color: '#475569' }}>
              AI가 아이디어를 분석하고 있습니다...
            </p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* 결과 */}
        {result && <ScoreCard result={result} />}
      </div>
    </main>
  );
}
