"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Clock,
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { getAnalytics } from "@/lib/api";
import { AnalyticsResponse } from "@/types";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-3 text-red-500">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const {
    summary,
    daily_volume,
    risk_distribution,
    latency_trend,
    model_metrics,
    sanctions_metrics,
  } = analytics;
  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">
            System performance metrics and model analytics
          </p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Activity className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total screened</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.total_screened.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Average latency</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.avg_latency_ms.toFixed(0)}ms
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <ShieldAlert className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Fraud detected</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.fraud_detected.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>{summary.fraud_rate}% detection rate</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-full">
                <ShieldCheck className="h-5 w-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sanctions hits</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {summary.sanctions_hits.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>{summary.sanctions_rate}% match rate</span>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily volume */}
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Daily transaction volume
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Transactions processed per day (last 7 days)
              </p>
            </div>
            <div className="p-5">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={daily_volume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="transactions"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="flagged"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-emerald-500 rounded" />
                  Total
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded" />
                  Flagged
                </span>
              </div>
            </div>
          </div>

          {/* Risk cistribution */}
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Risk level distribution
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Breakdown of transactions by risk level
              </p>
            </div>
            <div className="p-5">
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={risk_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {risk_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm text-gray-600 flex-wrap">
                {risk_distribution.map((item) => (
                  <span key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}: {item.value.toLocaleString()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latency trend */}
        <div className="bg-white border border-gray-200 rounded-sm">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Latency trend (24h)</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              P50 and P95 response times in milliseconds
            </p>
          </div>
          <div className="p-5">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latency_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis tick={{ fontSize: 12, fill: "#64748b" }} unit="ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="p50"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="p95"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-emerald-500 rounded" />
                P50
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded" />
                P95
              </span>
            </div>
          </div>
        </div>

        {/* Model performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Fraud model performance
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                LightGBM classifier metrics
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">ROC-AUC</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {model_metrics.roc_auc}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Precision</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {(model_metrics.precision * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Recall</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {(model_metrics.recall * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">F1 Score</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {model_metrics.f1_score}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-sm">
            <div className="p-5 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                Sanctions screening
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                OFAC screening metrics
              </p>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Precision@1</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {(sanctions_metrics.precision_at_1 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Average latency</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {sanctions_metrics.avg_latency_ms}ms
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Total screened</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {summary.total_screened.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-sm">
                  <p className="text-sm text-gray-500">Matches found</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {summary.sanctions_hits}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance card */}
        <div className="bg-white border border-gray-200 rounded-sm">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">System health</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Current system metrics
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Total transactions</span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {summary.total_screened.toLocaleString()}
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">Average latency</span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {summary.avg_latency_ms.toFixed(0)}ms
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Fraud detection rate
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                {summary.fraud_rate}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
