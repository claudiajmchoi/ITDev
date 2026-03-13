import type { AnalysisResult } from '@/types/analysis';

const GRADE_COLOR: Record<string, string> = {
  S: 'text-purple-600 bg-purple-50 border-purple-200',
  A: 'text-blue-600 bg-blue-50 border-blue-200',
  B: 'text-green-600 bg-green-50 border-green-200',
  C: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  D: 'text-red-600 bg-red-50 border-red-200',
};

const SCORE_LABEL: Record<string, string> = {
  score_market: '시장성',
  score_competition: '경쟁우위',
  score_revenue: '수익모델',
};

interface Props {
  result: AnalysisResult;
}

export default function ScoreCard({ result }: Props) {
  const gradeStyle = GRADE_COLOR[result.grade] ?? GRADE_COLOR['D'];

  return (
    <div className="space-y-6">
      {/* 히어로 점수 */}
      <div className="text-center p-8 bg-white rounded-2xl shadow-sm border">
        <p className="text-sm text-gray-500 mb-2">{result.industry}</p>
        <p className="text-gray-700 font-medium mb-4">{result.summary}</p>
        <div className="flex items-center justify-center gap-4">
          <span className="text-7xl font-bold text-gray-900">{result.score_total}</span>
          <span className={`text-4xl font-bold px-4 py-2 rounded-xl border-2 ${gradeStyle}`}>
            {result.grade}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-2">사업화 성공 가능성 점수</p>
      </div>

      {/* 차원별 점수 */}
      <div className="grid grid-cols-3 gap-3">
        {(['score_market', 'score_competition', 'score_revenue'] as const).map((key) => (
          <div key={key} className="bg-white rounded-xl p-4 border text-center shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{SCORE_LABEL[key]}</p>
            <p className="text-3xl font-bold text-gray-900">{result[key]}</p>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
              <div
                className="h-1.5 bg-blue-500 rounded-full"
                style={{ width: `${result[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 강점 / 리스크 / 액션 */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Section title="💪 강점" items={result.strengths} color="green" />
        <Section title="⚠️ 리스크" items={result.risks} color="red" />
        <Section title="🚀 액션 아이템" items={result.actions} color="blue" />
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  color,
}: {
  title: string;
  items: string[];
  color: 'green' | 'red' | 'blue';
}) {
  const border = { green: 'border-green-100', red: 'border-red-100', blue: 'border-blue-100' }[color];
  const dot = { green: 'bg-green-400', red: 'bg-red-400', blue: 'bg-blue-400' }[color];

  return (
    <div className={`bg-white rounded-xl p-4 border ${border} shadow-sm`}>
      <p className="font-semibold text-gray-700 mb-3">{title}</p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-600">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
