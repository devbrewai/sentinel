"use client";

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
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Activity,
  CheckCircle2,
} from "lucide-react";

// Demo data for analytics showcase
const dailyVolume = [
  { day: "Mon", transactions: 1245, flagged: 23 },
  { day: "Tue", transactions: 1389, flagged: 31 },
  { day: "Wed", transactions: 1567, flagged: 28 },
  { day: "Thu", transactions: 1234, flagged: 19 },
  { day: "Fri", transactions: 1890, flagged: 42 },
  { day: "Sat", transactions: 987, flagged: 15 },
  { day: "Sun", transactions: 756, flagged: 11 },
];

const riskDistribution = [
  { name: "Low", value: 7234, color: "#10b981" },
  { name: "Medium", value: 1456, color: "#f59e0b" },
  { name: "High", value: 312, color: "#f97316" },
  { name: "Critical", value: 66, color: "#ef4444" },
];

const latencyTrend = [
  { hour: "00:00", p50: 28, p95: 45 },
  { hour: "04:00", p50: 25, p95: 42 },
  { hour: "08:00", p50: 32, p95: 58 },
  { hour: "12:00", p50: 35, p95: 62 },
  { hour: "16:00", p50: 38, p95: 68 },
  { hour: "20:00", p50: 30, p95: 52 },
];

const modelMetrics = {
  rocAuc: 0.8861,
  precision: 0.82,
  recall: 0.79,
  f1Score: 0.805,
};

const sanctionsMetrics = {
  precisionAt1: 0.975,
  avgLatency: 12.3,
  totalScreened: 9068,
  matchesFound: 23,
};

// TODO: Analytics are hardcoded for now, we need to fetch the data from the API

export default function AnalyticsPage() {
  return (
    <div className="py-8 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            System performance metrics and model analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Activity className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Total screened
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  9,068
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+12.5% vs last week</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Average latency
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  32ms
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-emerald-600">
              <TrendingDown className="h-3.5 w-3.5" />
              <span>-8ms vs target</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Fraud detected
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  169
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>1.86% detection rate</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <ShieldCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  Sanctions hits
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  23
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-sm text-gray-500">
              <span>0.25% match rate</span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Volume */}
          <div className="bg-white border border-gray-200 rounded-lg">
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
                  <BarChart data={dailyVolume}>
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

          {/* Risk Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg">
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
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
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
                {riskDistribution.map((item) => (
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

        {/* Latency Trend */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              Latency trend (24h)
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              P50 and P95 response times in milliseconds
            </p>
          </div>
          <div className="p-5">
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyTrend}>
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

        {/* Model Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg">
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
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    ROC-AUC
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {modelMetrics.rocAuc}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Precision
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {(modelMetrics.precision * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Recall
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {(modelMetrics.recall * 100).toFixed(0)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    F1 Score
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {modelMetrics.f1Score}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg">
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
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Precision@1
                  </p>
                  <p className="text-2xl font-semibold text-emerald-600 mt-1">
                    {(sanctionsMetrics.precisionAt1 * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Average latency
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {sanctionsMetrics.avgLatency}ms
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Total screened
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">
                    {sanctionsMetrics.totalScreened.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">
                    Matches found
                  </p>
                  <p className="text-2xl font-semibold text-red-600 mt-1">
                    {sanctionsMetrics.matchesFound}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Card */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">
              System health
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Average over the last 24 hours
            </p>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                API uptime
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                100.0000%
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Average latency
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                32ms
              </span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Error rate
              </span>
              <span className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
                0.02%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
