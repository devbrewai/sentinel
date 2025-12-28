"use client";

import { useState, useRef, useEffect } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { RiskGauge } from "@/components/risk-gauge";
import { SanctionsCard } from "@/components/sanctions-card";
import { CopyButton } from "@/components/copy-button";
import { SkeletonResults } from "@/components/skeleton-results";
import {
  TransactionHistory,
  HistoryItem,
} from "@/components/transaction-history";
import { FeatureImportance } from "@/components/feature-importance";
import { scoreTransaction } from "@/lib/api";
import { TransactionRequest, ScoreResponse } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Shield,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
} from "lucide-react";

const HISTORY_KEY = "fraudguard_history";
const MAX_HISTORY = 20;

export default function Dashboard() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<
    string | undefined
  >();

  const currentRequestIdRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
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

  useEffect(() => {
    if (history.length > 0) {
      try {
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (e) {
        console.error("Failed to save history:", e);
      }
    }
  }, [history]);

  const addToHistory = (
    request: TransactionRequest,
    response: ScoreResponse
  ) => {
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
    setSelectedHistoryId(undefined);

    try {
      const response = await scoreTransaction(data);
      if (currentRequestIdRef.current === requestId) {
        setResult(response);
        setIsLoading(false);
        addToHistory(data, response);
      }
    } catch (err: any) {
      if (currentRequestIdRef.current === requestId) {
        setError(err.message || "Failed to score transaction");
        setIsLoading(false);
      }
    }
  };

  const totalScreened = history.length;
  const approvedCount = history.filter(h => h.response.decision === "approve").length;
  const flaggedCount = history.filter(h => h.response.decision !== "approve").length;

  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Transaction Screening
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Real-time fraud detection and sanctions screening for cross-border payments
          </p>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <ArrowRightLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Screened</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {totalScreened.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {approvedCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Flagged</p>
                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                  {flaggedCount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & History */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  New Transaction
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter transaction details to screen
                </p>
              </div>
              <div className="p-5">
                <TransactionForm onSubmit={handleScore} isLoading={isLoading} />
              </div>
            </div>

            {/* How it works */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-3">
                How it works
              </h3>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span>Scores transactions in &lt;200ms</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                  <span>Checks velocity features via Redis</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-slate-400" />
                  <span>Screens against OFAC sanctions list</span>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <TransactionHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleHistoryClear}
              selectedId={selectedHistoryId}
            />
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {isLoading ? (
              <SkeletonResults />
            ) : !result ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Shield className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                  <p className="text-slate-500 dark:text-slate-400">
                    Submit a transaction to see risk analysis
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Decision Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Decision</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-2xl font-semibold uppercase ${
                          result.decision === "approve"
                            ? "text-emerald-600"
                            : result.decision === "reject"
                            ? "text-red-600"
                            : "text-amber-600"
                        }`}>
                          {result.decision}
                        </span>
                        {result.latency_ms && (
                          <Badge variant="outline" className="text-xs font-mono">
                            {result.latency_ms.toFixed(0)}ms
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CopyButton value={JSON.stringify(result, null, 2)} />
                  </div>
                </div>

                {/* Risk Score & Sanctions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Risk Score */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100">
                        Fraud Risk
                      </h3>
                    </div>
                    <div className="p-5">
                      <RiskGauge
                        score={result.risk_score}
                        riskLevel={result.risk_level}
                      />
                      <div className="text-center mt-4">
                        <Badge
                          variant="outline"
                          className={`uppercase text-xs font-medium ${
                            result.risk_level === "low"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                              : result.risk_level === "medium"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
                          }`}
                        >
                          {result.risk_level} Risk
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Sanctions */}
                  <SanctionsCard
                    matchData={result.sanctions_details}
                    isMatch={result.sanctions_match}
                  />
                </div>

                {/* Feature Importance */}
                <FeatureImportance features={result.top_features} />

                {/* Details */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                      Details
                    </h3>
                    <button className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
                      View all <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-800">
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Transaction ID</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                        {result.transaction_id}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Velocity (1h / 24h)</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                        {result.velocity?.transactions_1h ?? 0} / {result.velocity?.transactions_24h ?? 0}
                      </span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Sanctions Status</span>
                      {result.sanctions_match ? (
                        <Badge variant="destructive" className="text-xs">Match Found</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800">
                          Clear
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400">Processing Time</span>
                      <span className="text-sm font-mono text-slate-900 dark:text-slate-100">
                        {result.latency_ms.toFixed(2)}ms
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
