export interface AnalysisResult {
  score_total: number;        // 0~100
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  score_market: number;       // 시장성 점수
  score_competition: number;  // 경쟁 강도 점수
  score_revenue: number;      // 수익 모델 점수
  summary: string;            // 아이디어 한줄 요약
  strengths: string[];        // 강점 3가지
  risks: string[];            // 리스크 3가지
  actions: string[];          // 액션 아이템 3가지
  industry: string;           // 업종
}
