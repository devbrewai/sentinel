"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { TrendingUp, TrendingDown, Clock, ShieldCheck, ShieldAlert, Activity } from "lucide-react";

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
  { name: "Low", value: 7234, color: "#22c55e" },
  { name: "Medium", value: 1456, color: "#eab308" },
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

export default function AnalyticsPage() {
  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            System performance metrics and model analytics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Screened</p>
                  <p className="text-2xl font-bold">9,068</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12.5% vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">32ms</p>
                </div>
                <Clock className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                <TrendingDown className="h-3 w-3" />
                <span>-8ms vs target</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Fraud Detected</p>
                  <p className="text-2xl font-bold">169</p>
                </div>
                <ShieldAlert className="h-8 w-8 text-red-500 opacity-50" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <span>1.86% detection rate</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sanctions Hits</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
                <ShieldCheck className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <span>0.25% match rate</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Daily Transaction Volume</CardTitle>
              <CardDescription>Transactions processed per day (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyVolume}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="transactions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="flagged" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded" />
                  Total
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded" />
                  Flagged
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Level Distribution</CardTitle>
              <CardDescription>Breakdown of transactions by risk level</CardDescription>
            </CardHeader>
            <CardContent>
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
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
                {riskDistribution.map((item) => (
                  <span key={item.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                    {item.name}: {item.value.toLocaleString()}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latency Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Latency Trend (24h)</CardTitle>
            <CardDescription>P50 and P95 response times in milliseconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={latencyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                  <XAxis dataKey="hour" className="text-xs" />
                  <YAxis className="text-xs" unit="ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="p50" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="p95" stroke="#f97316" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded" />
                P50
              </span>
              <span className="flex items-center gap-2">
                <span className="w-3 h-3 bg-orange-500 rounded" />
                P95
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Model Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fraud Model Performance</CardTitle>
              <CardDescription>LightGBM classifier metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">ROC-AUC</p>
                  <p className="text-2xl font-bold text-blue-600">{modelMetrics.rocAuc}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precision</p>
                  <p className="text-2xl font-bold">{(modelMetrics.precision * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Recall</p>
                  <p className="text-2xl font-bold">{(modelMetrics.recall * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">F1 Score</p>
                  <p className="text-2xl font-bold">{modelMetrics.f1Score}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Sanctions Screening Performance</CardTitle>
              <CardDescription>OFAC screening metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Precision@1</p>
                  <p className="text-2xl font-bold text-emerald-600">{(sanctionsMetrics.precisionAt1 * 100).toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-2xl font-bold">{sanctionsMetrics.avgLatency}ms</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Screened</p>
                  <p className="text-2xl font-bold">{sanctionsMetrics.totalScreened.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                  <p className="text-sm text-muted-foreground">Matches Found</p>
                  <p className="text-2xl font-bold text-red-600">{sanctionsMetrics.matchesFound}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
