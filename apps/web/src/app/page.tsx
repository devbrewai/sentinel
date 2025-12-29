"use client";

import { useState, useRef, useEffect } from "react";
import { TransactionForm } from "@/components/transaction-form";
import { RiskGauge } from "@/components/risk-gauge";
import { SanctionsCard } from "@/components/sanctions-card";
import { CopyButton } from "@/components/copy-button";
import { SkeletonResults } from "@/components/skeleton-results";
import { FeatureImportance } from "@/components/feature-importance";
import { ComplianceReport } from "@/components/compliance-report";
import { VelocityIndicators } from "@/components/velocity-indicators";
import {
  TransactionHistory,
  HistoryItem,
} from "@/components/transaction-history";
import { scoreTransaction } from "@/lib/api";
import { TransactionRequest, ScoreResponse } from "@/types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Activity,
} from "lucide-react";

const HISTORY_KEY = "fraudguard_history";
const MAX_HISTORY = 20;

export default function Dashboard() {
  const [result, setResult] = useState<ScoreResponse | null>(null);
  const [currentRequest, setCurrentRequest] =
    useState<TransactionRequest | null>(null);
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
    // Invalidate any pending request so it won't overwrite the selected history item
    currentRequestIdRef.current = null;
    setResult(item.response);
    setCurrentRequest(item.request);
    setSelectedHistoryId(item.id);
    setError(null);
    setIsLoading(false);
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
    setCurrentRequest(null);
    setSelectedHistoryId(undefined);

    try {
      const response = await scoreTransaction(data);
      if (currentRequestIdRef.current === requestId) {
        setResult(response);
        setCurrentRequest(data);
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
  const approvedCount = history.filter(
    (h) => h.response.decision === "approve"
  ).length;
  const flaggedCount = history.filter(
    (h) => h.response.decision !== "approve"
  ).length;

  return (
    <div className="py-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Transaction screening
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time fraud detection and sanctions screening for cross-border
            payments
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Screened Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-none flex flex-col">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Screened
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {totalScreened}
            </p>
          </div>

          {/* Approved Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-none flex flex-col">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Approved
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {approvedCount}
            </p>
          </div>

          {/* Flagged Card */}
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-none flex flex-col">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
              Flagged
            </p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {flaggedCount}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column: Form (~40%) */}
          <div className="lg:col-span-2 space-y-6">
            <TransactionForm onSubmit={handleScore} isLoading={isLoading} />

            {/* Transaction History (Restored) */}
            <TransactionHistory
              history={history}
              onSelect={handleHistorySelect}
              onClear={handleHistoryClear}
              selectedId={selectedHistoryId}
            />
          </div>

          {/* Right Column: Results (~60%) */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              <SkeletonResults />
            ) : !result ? (
              <div className="bg-white border border-gray-200 rounded-lg h-full min-h-[400px] flex items-center justify-center shadow-none">
                <div className="text-center">
                  <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Activity className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Ready to analyze
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Fill out the transaction details on the left to screen for
                    fraud and sanctions.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Decision Display Card */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                        Decision
                      </p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold uppercase tracking-tight ${
                            result.decision === "approve"
                              ? "text-green-600"
                              : result.decision === "reject"
                              ? "text-red-600"
                              : "text-amber-600"
                          }`}
                        >
                          {result.decision}
                        </span>
                        {result.latency_ms && (
                          <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium ml-2">
                            {result.latency_ms.toFixed(0)}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {currentRequest && (
                        <ComplianceReport
                          request={currentRequest}
                          response={result}
                        />
                      )}
                      <CopyButton value={JSON.stringify(result, null, 2)} />
                    </div>
                  </div>
                  {result.velocity && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
                        Card velocity
                      </p>
                      <VelocityIndicators velocity={result.velocity} />
                    </div>
                  )}
                </div>

                {/* Fraud Risk & Sanctions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fraud Risk Card */}
                  <div className="bg-white rounded-lg border border-gray-200 shadow-none p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">
                      Fraud risk
                    </h3>
                    <RiskGauge
                      score={result.risk_score}
                      riskLevel={result.risk_level}
                    />
                    <div className="text-center mt-6">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${
                          result.risk_level === "low"
                            ? "bg-green-100 text-green-700"
                            : result.risk_level === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.risk_level} Risk
                      </span>
                    </div>
                  </div>

                  {/* Sanctions Card */}
                  <SanctionsCard
                    matchData={result.sanctions_details}
                    isMatch={result.sanctions_match}
                  />
                </div>

                {/* Top Fraud Risk Factors */}
                <FeatureImportance features={result.top_features} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
