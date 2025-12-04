import { TransactionRequest, ScoreResponse } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function scoreTransaction(
  data: TransactionRequest
): Promise<ScoreResponse> {
  try {
    const response = await fetch(`${API_URL}/api/v1/score`, {
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
  } catch (error) {
    console.error("Scoring failed:", error);
    throw error;
  }
}

