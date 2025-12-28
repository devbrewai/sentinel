"use client";

import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VelocityFeatures } from "@/types";

interface VelocityIndicatorsProps {
  velocity: VelocityFeatures | null | undefined;
}

function getVelocityStatus(
  count: number,
  threshold: number
): "normal" | "elevated" | "high" {
  if (count >= threshold * 2) return "high";
  if (count >= threshold) return "elevated";
  return "normal";
}

export function VelocityIndicators({ velocity }: VelocityIndicatorsProps) {
  if (!velocity) {
    return null;
  }

  const hourlyStatus = getVelocityStatus(velocity.transactions_1h, 5);
  const dailyStatus = getVelocityStatus(velocity.transactions_24h, 20);

  const statusColors = {
    normal: "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50",
    elevated: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50",
    high: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50",
  };

  const StatusIcon = ({ status }: { status: "normal" | "elevated" | "high" }) => {
    if (status === "high") return <AlertTriangle className="h-3 w-3" />;
    if (status === "elevated") return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* 1 Hour */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusColors[hourlyStatus]}`}
      >
        <StatusIcon status={hourlyStatus} />
        <span>{velocity.transactions_1h} txn/1h</span>
      </div>

      {/* 24 Hours */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusColors[dailyStatus]}`}
      >
        <StatusIcon status={dailyStatus} />
        <span>{velocity.transactions_24h} txn/24h</span>
      </div>
    </div>
  );
}

export function VelocityCard({ velocity }: VelocityIndicatorsProps) {
  if (!velocity) {
    return null;
  }

  const hourlyStatus = getVelocityStatus(velocity.transactions_1h, 5);
  const dailyStatus = getVelocityStatus(velocity.transactions_24h, 20);

  return (
    <div className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <Clock className="h-4 w-4 text-slate-400" />
        Card Velocity
      </span>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            hourlyStatus === "high"
              ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50"
              : hourlyStatus === "elevated"
                ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50"
                : "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/50"
          }
        >
          {velocity.transactions_1h}/hr
        </Badge>
        <Badge
          variant="outline"
          className={
            dailyStatus === "high"
              ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/50"
              : dailyStatus === "elevated"
                ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/50"
                : "text-green-600 bg-green-50 border-green-200 dark:bg-green-950/50"
          }
        >
          {velocity.transactions_24h}/day
        </Badge>
      </div>
    </div>
  );
}
