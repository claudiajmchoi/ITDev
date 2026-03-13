// Supabase 테이블 타입 정의
// Sprint 1에서 생성하는 analyses, credits, credit_transactions 테이블을 반영한다.

export type AnalysisStatus = 'pending' | 'completed' | 'failed';
export type AnalysisGrade = 'S' | 'A' | 'B' | 'C' | 'D';
export type CreditTransactionType = 'purchase' | 'usage' | 'refund' | 'bonus';

export interface Analysis {
  id: string;
  user_id: string | null;
  session_id: string | null;
  idea_input: string;
  idea_summary: string | null;
  industry: string | null;
  score_total: number | null;
  score_market: number | null;
  score_competition: number | null;
  score_revenue: number | null;
  grade: AnalysisGrade | null;
  result_json: Record<string, unknown> | null;
  model_meta: Record<string, unknown> | null;
  status: AnalysisStatus;
  created_at: string;
  updated_at: string;
}

export interface Credit {
  id: string;
  user_id: string;
  balance: number;
  total_purchased: number;
  total_used: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: CreditTransactionType;
  reference_id: string | null;
  note: string | null;
  created_at: string;
}

// Supabase 클라이언트 제네릭 타입
// GenericSchema 요구 필드: Tables + Views + Functions
export interface Database {
  public: {
    Tables: {
      analyses: {
        Row: Analysis;
        Insert: Omit<Analysis, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Analysis, 'id' | 'created_at'>>;
        Relationships: never[];
      };
      credits: {
        Row: Credit;
        Insert: Omit<Credit, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Credit, 'id' | 'created_at'>>;
        Relationships: never[];
      };
      credit_transactions: {
        Row: CreditTransaction;
        Insert: Omit<CreditTransaction, 'id' | 'created_at'>;
        Update: never;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
