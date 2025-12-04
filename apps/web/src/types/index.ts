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
  candidate: string;
  score: number;
  is_match: boolean;
  reason?: string;
  // Other fields as needed from the backend response
}

export interface ScoreResponse {
  transaction_id: string;
  risk_score: number;
  risk_level: "low" | "medium" | "high" | "critical";
  decision: "approve" | "review" | "reject";
  sanctions_match: boolean;
  sanctions_details?: {
    top_matches: SanctionsMatch[];
    screened_name: string;
  } | null;
  latency_ms: number;
}

