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

// Batch processing types
export interface BatchTransactionItem {
  transaction_id: string;
  sender_name: string;
  TransactionAmt: number;
  card_id: string;
  sender_country?: string;
  ProductCD?: string;
}

export interface BatchResultItem {
  transaction_id: string;
  sender_name: string;
  amount: number;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  decision: "approve" | "review" | "reject";
  sanctions_match: boolean;
  latency_ms: number;
}

export interface BatchRequest {
  transactions: BatchTransactionItem[];
}

export interface BatchResponse {
  results: BatchResultItem[];
  total_processed: number;
  total_latency_ms: number;
}

// Analytics types
export interface AnalyticsSummary {
  total_screened: number;
  avg_latency_ms: number;
  fraud_detected: number;
  sanctions_hits: number;
  fraud_rate: number;
  sanctions_rate: number;
}

export interface DailyVolumeItem {
  day: string;
  transactions: number;
  flagged: number;
}

export interface RiskDistributionItem {
  name: string;
  value: number;
  color: string;
  [key: string]: unknown;
}

export interface LatencyTrendItem {
  hour: string;
  p50: number;
  p95: number;
}

export interface ModelMetrics {
  roc_auc: number;
  precision: number;
  recall: number;
  f1_score: number;
}

export interface SanctionsMetrics {
  precision_at_1: number;
  avg_latency_ms: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  daily_volume: DailyVolumeItem[];
  risk_distribution: RiskDistributionItem[];
  latency_trend: LatencyTrendItem[];
  model_metrics: ModelMetrics;
  sanctions_metrics: SanctionsMetrics;
}
