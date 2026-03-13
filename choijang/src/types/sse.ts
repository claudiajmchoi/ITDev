export type SSEEventType =
  | 'start'
  | 'progress'
  | 'zone_a'
  | 'zone_b'
  | 'zone_c'
  | 'result'
  | 'error'
  | 'done';

export interface SSEEvent<T = unknown> {
  event: SSEEventType;
  data: T;
}

export interface SSEProgressData {
  step: string;
  message: string;
}

export interface SSEErrorData {
  code: string;
  message: string;
}

export interface SSEZoneAData {
  score_market: number;
  score_competition: number;
  market_analysis: string;
  competition_analysis: string;
}

export interface SSEZoneBData {
  score_revenue: number;
  revenue_model: string;
  revenue_streams: string[];
}

export interface SSEZoneCData {
  summary: string;
  strengths: string[];
  risks: string[];
  actions: string[];
}

export interface SSEResultData {
  score_total: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D';
  industry: string;
  analysis_id?: string | null;
}
