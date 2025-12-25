"use client";

import { useState } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { RiskGauge } from "@/components/risk-gauge";
import { SanctionsCard } from "@/components/sanctions-card";
import { LatencyBadge } from "@/components/latency-badge";
import { scoreTransaction } from "@/lib/api";
import { TransactionRequest, ScoreResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";

export default function Dashboard() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScore = async (data: TransactionRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await scoreTransaction(data);
      setResult(response);
    } catch (err: any) {
      setError(err.message || "Failed to score transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              FraudGuard AI
            </h1>
            <p className="text-slate-500 mt-1">
              Real-time payment fraud & sanctions screening
            </p>
          </div>

          {result && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Last scan latency:</span>
              <LatencyBadge latencyMs={result.latency_ms} />
            </div>
          )}
        </header>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <ShieldAlert className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5">
            <TransactionForm onSubmit={handleScore} isLoading={isLoading} />

            <div className="mt-6 p-4 bg-white rounded-lg border text-sm text-slate-500">
              <h3 className="font-semibold mb-2 text-slate-700">
                How it works
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Scores transactions in <strong>&lt;200ms</strong>.
                </li>
                <li>
                  Checks <strong>velocity features</strong> (Redis).
                </li>
                <li>
                  Screens against <strong>OFAC Sanctions</strong>.
                </li>
                <li>Returns risk score & explainability.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {!result ? (
              <Card className="h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 border-dashed">
                <div className="text-center text-slate-400">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Submit a transaction to see risk analysis</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fraud Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RiskGauge score={result.risk_score} riskLevel={result.risk_level} />
                      <div className="text-center mt-4">
                        <div
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium uppercase tracking-wide"
                          style={{
                            backgroundColor:
                              result.risk_level === "low"
                                ? "#dcfce7"
                                : result.risk_level === "medium"
                                ? "#fef9c3"
                                : "#fee2e2",
                            color:
                              result.risk_level === "low"
                                ? "#166534"
                                : result.risk_level === "medium"
                                ? "#854d0e"
                                : "#991b1b",
                          }}
                        >
                          {result.risk_level} Risk
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <SanctionsCard
                    matchData={result.sanctions_details}
                    isMatch={result.sanctions_match}
                  />
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Decision Logic</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Recommendation</span>
                        <span
                          className={`font-bold px-3 py-1 rounded-md uppercase text-sm ${
                            result.decision === "approve"
                              ? "bg-green-100 text-green-700"
                              : result.decision === "reject"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {result.decision}
                        </span>
                      </div>
                      <Separator />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-muted-foreground">
                            Transaction ID
                          </span>
                          <span className="font-mono text-slate-700">
                            {result.transaction_id}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground">
                            Processing Time
                          </span>
                          <span className="font-mono text-slate-700">
                            {result.latency_ms.toFixed(2)} ms
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
