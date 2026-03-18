'use client';

import { useEffect, useState } from 'react';
import type { AnalysisResult } from '@/types/analysis';

type GradeCfg = { label: string; color: string; ring: string; bg: string };

const DEFAULT_GRADE_CFG: GradeCfg = { label: 'D', color: '#f87171', ring: '#dc2626', bg: 'rgba(220,38,38,0.12)' };

const GRADE_CONFIG: Record<string, GradeCfg> = {
  S: { label: 'S', color: '#a78bfa', ring: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
  A: { label: 'A', color: '#34d399', ring: '#059669', bg: 'rgba(5,150,105,0.12)' },
  B: { label: 'B', color: '#60a5fa', ring: '#2563eb', bg: 'rgba(37,99,235,0.12)' },
  C: { label: 'C', color: '#fbbf24', ring: '#d97706', bg: 'rgba(217,119,6,0.12)' },
  D: DEFAULT_GRADE_CFG,
};

function getCfg(grade: string): GradeCfg {
  return GRADE_CONFIG[grade] ?? DEFAULT_GRADE_CFG;
}

const SCORE_META = [
  { key: 'score_market' as const, label: '시장성', sub: 'Market Potential' },
  { key: 'score_competition' as const, label: '경쟁우위', sub: 'Competitive Edge' },
  { key: 'score_revenue' as const, label: '수익모델', sub: 'Revenue Model' },
];

function getScoreColor(score: number): string {
  if (score >= 75) return '#34d399';
  if (score >= 55) return '#60a5fa';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
}

function CircularGauge({ score, grade }: { score: number; grade: string }) {
  const [animated, setAnimated] = useState(0);
  const cfg = getCfg(grade);
  const R = 72;
  const C = 2 * Math.PI * R;

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const offset = C * (1 - animated / 100);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
      {/* glow backdrop */}
      <div
        className="absolute rounded-full blur-2xl opacity-30"
        style={{
          width: 140,
          height: 140,
          backgroundColor: cfg.ring,
        }}
      />
      <svg width={200} height={200} style={{ transform: 'rotate(-90deg)' }}>
        {/* track */}
        <circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={10}
        />
        {/* progress */}
        <circle
          cx={100}
          cy={100}
          r={R}
          fill="none"
          stroke={cfg.ring}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      {/* center content */}
      <div className="absolute flex flex-col items-center justify-center">
        <span
          className="font-black leading-none tabular-nums"
          style={{
            fontSize: 48,
            color: '#f8fafc',
            fontFamily: "'Courier New', monospace",
            letterSpacing: '-2px',
          }}
        >
          {Math.round(animated)}
        </span>
        <span className="text-xs font-semibold tracking-widest mt-0.5" style={{ color: cfg.color }}>
          GRADE {grade}
        </span>
      </div>
    </div>
  );
}

function AnimatedBar({ score, delay = 0 }: { score: number; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 200 + delay);
    return () => clearTimeout(t);
  }, [score, delay]);

  const color = getScoreColor(score);
  return (
    <div
      className="relative h-1.5 rounded-full overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.07)' }}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          transition: `width 1.2s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
          boxShadow: `0 0 8px ${color}66`,
        }}
      />
    </div>
  );
}

interface Props {
  result: AnalysisResult;
}

export default function ScoreCard({ result }: Props) {
  const cfg = getCfg(result.grade);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #0d1424 0%, #0a0f1c 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── TOP HEADER ── */}
      <div
        className="flex items-center justify-between px-6 py-3"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tracking-widest uppercase"
            style={{ color: '#64748b', fontFamily: 'monospace' }}
          >
            ANALYSIS REPORT
          </span>
          <span style={{ color: '#1e293b' }}>·</span>
          <span
            className="text-xs font-semibold tracking-wider px-2 py-0.5 rounded"
            style={{
              color: cfg.color,
              background: cfg.bg,
              border: `1px solid ${cfg.color}33`,
            }}
          >
            {result.industry}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>
            AI VERIFIED
          </span>
        </div>
      </div>

      {/* ── HERO SECTION ── */}
      <div className="flex flex-col md:flex-row items-center gap-8 px-8 py-8">
        {/* gauge */}
        <div className="flex-shrink-0">
          <CircularGauge score={result.score_total} grade={result.grade} />
          <p
            className="text-center text-xs mt-2 tracking-wider"
            style={{ color: '#475569', fontFamily: 'monospace' }}
          >
            TOTAL SCORE / 100
          </p>
        </div>

        {/* right info */}
        <div className="flex-1 w-full">
          {/* summary */}
          <h2
            className="text-xl font-bold mb-1 leading-snug"
            style={{ color: '#f1f5f9' }}
          >
            {result.summary}
          </h2>
          <p className="text-sm mb-6" style={{ color: '#64748b' }}>
            사업화 성공 가능성 종합 평가
          </p>

          {/* sub-scores */}
          <div className="space-y-4">
            {SCORE_META.map(({ key, label, sub }, i) => {
              const score = result[key];
              const color = getScoreColor(score);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div>
                      <span className="text-sm font-semibold" style={{ color: '#cbd5e1' }}>
                        {label}
                      </span>
                      <span className="text-xs ml-2" style={{ color: '#475569' }}>
                        {sub}
                      </span>
                    </div>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color, fontFamily: 'monospace' }}
                    >
                      {score}
                      <span className="text-xs font-normal ml-0.5" style={{ color: '#475569' }}>
                        /100
                      </span>
                    </span>
                  </div>
                  <AnimatedBar score={score} delay={i * 150} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── INSIGHTS GRID ── */}
      <div
        className="grid grid-cols-1 md:grid-cols-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <InsightPanel
          icon="▲"
          title="핵심 강점"
          subtitle="Strengths"
          items={result.strengths}
          accent="#34d399"
          borderRight
        />
        <InsightPanel
          icon="▼"
          title="주요 리스크"
          subtitle="Risk Factors"
          items={result.risks}
          accent="#f87171"
          borderRight
        />
        <InsightPanel
          icon="→"
          title="즉시 실행 액션"
          subtitle="Action Items"
          items={result.actions}
          accent="#60a5fa"
        />
      </div>

      {/* ── MARKET ANALYSIS ── */}
      {result.market_analysis && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-6 pt-5 pb-2 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}
            >
              ◈
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>시장 분석</p>
              <p className="text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>Market Analysis</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-px mx-6 mb-5"
            style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, overflow: 'hidden' }}>
            {[
              { label: '국내 시장', value: result.market_analysis.market_size_domestic },
              { label: '글로벌 시장', value: result.market_analysis.market_size_global },
              { label: '성장률', value: result.market_analysis.growth_rate },
              {
                label: '트렌드',
                value: result.market_analysis.trend === 'growing' ? '↑ 성장' : result.market_analysis.trend === 'stable' ? '→ 안정' : '↓ 하락',
                color: result.market_analysis.trend === 'growing' ? '#34d399' : result.market_analysis.trend === 'stable' ? '#60a5fa' : '#f87171',
              },
              { label: '타겟 고객', value: result.market_analysis.target_customer },
            ].map(({ label, value, color }) => (
              <div key={label} className="p-4" style={{ background: '#0d1424' }}>
                <p className="text-xs mb-1" style={{ color: '#475569', fontFamily: 'monospace' }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: color ?? '#cbd5e1' }}>{value}</p>
              </div>
            ))}
          </div>
          <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: '#64748b' }}>
            {result.market_analysis.overview}
          </p>
        </div>
      )}

      {/* ── COMPETITOR ANALYSIS ── */}
      {result.competitors && result.competitors.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-6 pt-5 pb-4 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#f87171' }}
            >
              ⊕
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>경쟁 제품 분석</p>
              <p className="text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>Competitive Landscape</p>
            </div>
          </div>
          <div className="px-6 pb-5 space-y-3">
            {result.competitors.map((c, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-sm font-bold"
                    style={{ color: '#f1f5f9' }}
                  >
                    {c.name}
                  </span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: c.type === 'direct' ? 'rgba(248,113,113,0.15)' : 'rgba(96,165,250,0.15)',
                      color: c.type === 'direct' ? '#f87171' : '#60a5fa',
                      border: `1px solid ${c.type === 'direct' ? '#f8717133' : '#60a5fa33'}`,
                    }}
                  >
                    {c.type === 'direct' ? '직접 경쟁' : '간접 경쟁'}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: '#64748b' }}>{c.description}</p>
                <div className="flex items-start gap-2">
                  <span className="text-xs mt-0.5 flex-shrink-0" style={{ color: '#34d399' }}>→</span>
                  <p className="text-xs" style={{ color: '#34d399' }}>
                    <span style={{ color: '#475569' }}>공략 포인트: </span>{c.weakness}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── GLOBAL SERVICES ── */}
      {result.global_services && result.global_services.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-6 pt-5 pb-4 flex items-center gap-2">
            <span
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}
            >
              ✦
            </span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#e2e8f0' }}>해외 유사 서비스</p>
              <p className="text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>Global Benchmarks</p>
            </div>
          </div>
          <div className="px-6 pb-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {result.global_services.map((s, i) => (
              <div
                key={i}
                className="rounded-xl p-4"
                style={{
                  background: 'rgba(167,139,250,0.05)',
                  border: '1px solid rgba(167,139,250,0.12)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold" style={{ color: '#f1f5f9' }}>{s.name}</span>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      background: 'rgba(167,139,250,0.15)',
                      color: '#a78bfa',
                      border: '1px solid rgba(167,139,250,0.25)',
                    }}
                  >
                    {s.country}
                  </span>
                </div>
                <p className="text-xs mb-2" style={{ color: '#64748b' }}>{s.description}</p>
                <div
                  className="text-xs px-2 py-1 rounded mb-2"
                  style={{ background: 'rgba(251,191,36,0.08)', color: '#fbbf24' }}
                >
                  {s.traction}
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }}>→</span>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>{s.insight}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div
        className="px-6 py-3 flex items-center justify-between"
        style={{
          background: 'rgba(255,255,255,0.02)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <span className="text-xs" style={{ color: '#1e293b', fontFamily: 'monospace' }}>
          POWERED BY CLAUDE AI
        </span>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full"
          style={{ background: cfg.bg, border: `1px solid ${cfg.color}22` }}
        >
          <span className="text-xs font-semibold" style={{ color: cfg.color }}>
            등급 {result.grade}
          </span>
          <span className="text-xs" style={{ color: '#475569' }}>
            — {gradeDescription(result.grade)}
          </span>
        </div>
      </div>
    </div>
  );
}

function InsightPanel({
  icon,
  title,
  subtitle,
  items,
  accent,
  borderRight = false,
}: {
  icon: string;
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
  borderRight?: boolean;
}) {
  return (
    <div
      className="p-6"
      style={{
        borderRight: borderRight ? '1px solid rgba(255,255,255,0.06)' : undefined,
      }}
    >
      {/* panel header */}
      <div className="flex items-center gap-2 mb-4">
        <span
          className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </span>
        <div>
          <p className="text-sm font-bold leading-tight" style={{ color: '#e2e8f0' }}>
            {title}
          </p>
          <p className="text-xs" style={{ color: '#475569', fontFamily: 'monospace' }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* items */}
      <ol className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span
              className="flex-shrink-0 w-5 h-5 rounded text-xs font-bold flex items-center justify-center mt-0.5"
              style={{
                background: `${accent}14`,
                color: accent,
                fontFamily: 'monospace',
              }}
            >
              {i + 1}
            </span>
            <p className="text-sm leading-snug" style={{ color: '#94a3b8' }}>
              {item}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function gradeDescription(grade: string): string {
  const map: Record<string, string> = {
    S: '최우수 · 즉시 추진 권장',
    A: '우수 · 추진 적합',
    B: '양호 · 보완 후 추진',
    C: '보통 · 신중한 검토 필요',
    D: '미흡 · 전면 재검토 권장',
  };
  return map[grade] ?? '';
}
