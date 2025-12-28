export interface TransactionRequest {
  transaction_id: string;
  TransactionAmt: number;
  card_id: string;
  sender_name: string;
  sender_country?: string;
  ProductCD?: string;
  [key: string]: any;
}

export interface SanctionsMatch {
  match_name: string;
  score: number;
  is_match: boolean;
  decision: string;
  country?: string;
  program?: string;
  source?: string;
  uid?: string;
}

export interface FeatureContribution {
  name: string;
  value: any;
  contribution: number;
}

export interface VelocityFeatures {
  transactions_1h: number;
  transactions_24h: number;
}

export interface ScoreResponse {
  transaction_id: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  decision: "approve" | "review" | "reject";
  sanctions_match: boolean;
  sanctions_details?: {
    query: string;
    top_matches: SanctionsMatch[];
    applied_filters?: Record<string, string | null>;
    latency_ms?: number;
    version?: string;
  } | null;
  top_features?: FeatureContribution[] | null;
  velocity?: VelocityFeatures | null;
  latency_ms: number;
}
