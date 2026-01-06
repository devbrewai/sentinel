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
    normal: "text-green-600 bg-green-50",
    elevated: "text-amber-600 bg-amber-50",
    high: "text-red-600 bg-red-50",
  };

  const StatusIcon = ({
    status,
  }: {
    status: "normal" | "elevated" | "high";
  }) => {
    if (status === "high") return <AlertTriangle className="h-3 w-3" />;
    if (status === "elevated") return <Clock className="h-3 w-3" />;
    return <CheckCircle className="h-3 w-3" />;
  };

  return (
    <div className="flex items-center gap-3">
      {/* 1 Hour */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium ${statusColors[hourlyStatus]}`}
      >
        <StatusIcon status={hourlyStatus} />
        <span>{velocity.transactions_1h} txn/1h</span>
      </div>

      {/* 24 Hours */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium ${statusColors[dailyStatus]}`}
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
      <span className="flex items-center gap-2 text-gray-700">
        <Clock className="h-4 w-4 text-gray-400" />
        Card Velocity
      </span>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className={
            hourlyStatus === "high"
              ? "text-red-600 bg-red-50 border-red-200"
              : hourlyStatus === "elevated"
              ? "text-amber-600 bg-amber-50 border-amber-200"
              : "text-green-600 bg-green-50 border-green-200"
          }
        >
          {velocity.transactions_1h}/hr
        </Badge>
        <Badge
          variant="outline"
          className={
            dailyStatus === "high"
              ? "text-red-600 bg-red-50 border-red-200"
              : dailyStatus === "elevated"
              ? "text-amber-600 bg-amber-50 border-amber-200"
              : "text-green-600 bg-green-50 border-green-200"
          }
        >
          {velocity.transactions_24h}/day
        </Badge>
      </div>
    </div>
  );
}
