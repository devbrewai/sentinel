import {
  TransactionRequest,
  ScoreResponse,
  BatchRequest,
  BatchResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface HealthResponse {
  status: string;
  project: string;
  version: string;
  model_loaded: boolean;
  screener_loaded: boolean;
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`);
  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }
  return await response.json();
}

export interface ScoreTransactionOptions {
  signal?: AbortSignal;
}

export async function scoreTransaction(
  data: TransactionRequest,
  options?: ScoreTransactionOptions
): Promise<ScoreResponse> {
  try {
    const response = await fetch(`${API_URL}/api/v1/score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: options?.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    // Re-throw AbortError without logging (expected behavior)
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    console.error("Scoring failed:", error);
    throw error;
  }
}

export async function scoreBatchTransactions(
  data: BatchRequest
): Promise<BatchResponse> {
  const response = await fetch(`${API_URL}/api/v1/batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error: ${response.status} ${errorText}`);
  }

  return await response.json();
}

