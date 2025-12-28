"use client";

import { useState, useRef, useEffect } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { RiskGauge } from "@/components/risk-gauge";
import { SanctionsCard } from "@/components/sanctions-card";
import { LatencyBadge } from "@/components/latency-badge";
import { TransactionRoute } from "@/components/transaction-route";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyButton } from "@/components/copy-button";
import { SkeletonResults } from "@/components/skeleton-results";
import {
  TransactionHistory,
  HistoryItem,
} from "@/components/transaction-history";
import { scoreTransaction } from "@/lib/api";
import { TransactionRequest, ScoreResponse } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Shield, Activity } from "lucide-react";

const HISTORY_KEY = "fraudguard_history";
const MAX_HISTORY = 20;

export default function Dashboard() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [lastRequest, setLastRequest] = useState<TransactionRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();

  // Track current request to prevent race conditions with out-of-order responses
  const currentRequestIdRef = useRef<string | null>(null);

  // Load history from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert string timestamps back to Date objects
        const items = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp),
        }));
        setHistory(items);
      }
    } catch (e) {
      console.error("Failed to load history:", e);
    }
  }, []);

  // Save history to sessionStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    }
  }, [history]);

  const addToHistory = (request: TransactionRequest, response: ScoreResponse) => {
    const newItem: HistoryItem = {
      id: response.transaction_id,
      request,
      response,
      timestamp: new Date(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, MAX_HISTORY));
    setSelectedHistoryId(newItem.id);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    setResult(item.response);
    setLastRequest(item.request);
    setSelectedHistoryId(item.id);
    setError(null);
  };

  const handleHistoryClear = () => {
    setHistory([]);
    sessionStorage.removeItem(HISTORY_KEY);
    setSelectedHistoryId(undefined);
  };

  const handleScore = async (data: TransactionRequest) => {
    const requestId = data.transaction_id;
    currentRequestIdRef.current = requestId;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setLastRequest(data);
    setSelectedHistoryId(undefined);

    try {
      const response = await scoreTransaction(data);
      // Only update state if this response matches the current request
      if (currentRequestIdRef.current === requestId) {
        setResult(response);
        setIsLoading(false);
        addToHistory(data, response);
      }
    } catch (err: any) {
      // Only update error state if this is still the current request
      if (currentRequestIdRef.current === requestId) {
        setError(err.message || "Failed to score transaction");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-blue-600" />
              FraudGuard AI
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Real-time payment fraud & sanctions screening
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-gray-700 dark:text-emerald-300 text-xs font-medium rounded-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                System Operational
              </div>
              <ThemeToggle />
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Last scan latency:
                </span>
                <LatencyBadge latencyMs={result.latency_ms} />
              </div>
            )}
          </div>
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

            <div className="mt-6 p-4 bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-800 text-sm text-slate-500 dark:text-slate-400">
              <h3 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">
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

            {/* Transaction History */}
            <div className="mt-6">
              <TransactionHistory
                history={history}
                onSelect={handleHistorySelect}
                onClear={handleHistoryClear}
                selectedId={selectedHistoryId}
              />
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading ? (
              <SkeletonResults />
            ) : !result ? (
              <Card className="h-full min-h-[400px] flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                <div className="text-center text-slate-400 dark:text-slate-500">
                  <Shield className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>Submit a transaction to see risk analysis</p>
                </div>
              </Card>
            ) : (
              <>
                <TransactionRoute
                  originCountry={lastRequest?.sender_country}
                  destinationCountry="US"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Fraud Risk Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RiskGauge
                        score={result.risk_score}
                        riskLevel={result.risk_level}
                      />
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Decision Logic</CardTitle>
                    <CopyButton value={JSON.stringify(result, null, 2)} />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                          Recommendation
                        </span>
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

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Activity className="h-4 w-4 text-slate-400" />
                            Velocity Check
                          </span>
                          {result.risk_level === "critical" ||
                          result.risk_level === "high" ? (
                            <Badge
                              variant="outline"
                              className="text-amber-600 bg-amber-50 border-amber-200"
                            >
                              Warning
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-green-600 bg-green-50 border-green-200"
                            >
                              Passed
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <ShieldAlert className="h-4 w-4 text-slate-400" />
                            Sanctions List
                          </span>
                          {result.sanctions_match ? (
                            <Badge variant="destructive">HIT FOUND</Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-green-600 bg-green-50 border-green-200"
                            >
                              Clean
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            <Shield className="h-4 w-4 text-slate-400" />
                            Model Confidence
                          </span>
                          <span className="font-mono text-slate-600 dark:text-slate-400">
                            {(result.risk_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <Separator />
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="block text-muted-foreground">
                            Transaction ID
                          </span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
                            {result.transaction_id}
                          </span>
                        </div>
                        <div>
                          <span className="block text-muted-foreground">
                            Processing Time
                          </span>
                          <span className="font-mono text-slate-700 dark:text-slate-300">
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
