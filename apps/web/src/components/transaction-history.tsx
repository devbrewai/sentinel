"use client";

import { History, X, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
      className={`inline-block h-2 w-2 rounded-full ${
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
      <Card className="bg-white border border-gray-200 shadow-sm border-dashed">
        <CardContent className="py-8 text-center">
          <History className="h-8 w-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">
            Transaction history will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-none">
      <CardHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <History className="h-4 w-4 text-gray-500" />
          Recent transactions
          <Badge
            variant="secondary"
            className="text-xs font-normal bg-gray-100 text-gray-600"
          >
            {history.length}
          </Badge>
        </CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-gray-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Clear transaction history?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove all {history.length} transaction
                {history.length === 1 ? "" : "s"} from your session history.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onClear}
                className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
              >
                Clear all
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[320px] overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={`w-full text-left p-4 border-b border-gray-100 transition-colors cursor-pointer last:border-0 ${
                selectedId === item.id ? "bg-gray-100" : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <RiskDot level={item.response.risk_level} />
                  <span className="text-sm font-semibold text-gray-900 truncate">
                    {formatCurrency(item.request.TransactionAmt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.response.sanctions_match && (
                    <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                  )}
                  <span className="text-xs text-gray-400 font-mono">
                    {formatTime(item.timestamp)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 truncate max-w-[140px]">
                  {item.request.sender_name}
                </span>
                <span
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    item.response.decision === "approve"
                      ? "text-green-600"
                      : item.response.decision === "reject"
                      ? "text-red-600"
                      : "text-amber-600"
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
