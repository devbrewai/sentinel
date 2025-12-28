"use client";

import { History, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreResponse, TransactionRequest } from "@/types";

export interface HistoryItem {
  id: string;
  request: TransactionRequest;
  response: ScoreResponse;
  timestamp: Date;
}

interface TransactionHistoryProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  selectedId?: string;
}

function RiskDot({ level }: { level: string }) {
  const colors = {
    low: "bg-green-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
    critical: "bg-red-600 animate-pulse",
  };
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${
        colors[level as keyof typeof colors] || colors.low
      }`}
    />
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function TransactionHistory({
  history,
  onSelect,
  onClear,
  selectedId,
}: TransactionHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
        <CardContent className="py-8 text-center">
          <History className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-40" />
          <p className="text-sm text-muted-foreground">
            Transaction history will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Transactions
            <Badge variant="secondary" className="text-xs font-normal">
              {history.length}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive"
            onClick={onClear}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-2.5 rounded-md transition-colors ${
                selectedId === item.id
                  ? "bg-primary/10 dark:bg-primary/20 border border-primary/30"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <RiskDot level={item.response.risk_level} />
                  <span className="text-sm font-medium truncate">
                    {formatCurrency(item.request.TransactionAmt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.response.sanctions_match && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className="text-xs text-muted-foreground font-mono">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                  {item.request.sender_name}
                </span>
                <span
                  className={`text-xs font-medium uppercase ${
                    item.response.decision === "approve"
                      ? "text-green-600 dark:text-green-400"
                      : item.response.decision === "reject"
                      ? "text-red-600 dark:text-red-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {item.response.decision}
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
