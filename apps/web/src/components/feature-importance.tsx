"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeatureContribution } from "@/types";

interface FeatureImportanceProps {
  features: FeatureContribution[] | null | undefined;
}

// Human-readable feature name mapping
const FEATURE_LABELS: Record<string, string> = {
  TransactionAmt: "Transaction Amount",
  card_amt_mean: "Card Avg Amount",
  card_amt_std: "Card Amount Variance",
  P_emaildomain: "Purchaser Email Domain",
  R_emaildomain: "Recipient Email Domain",
  ProductCD: "Product Category",
  card1: "Card Type 1",
  card2: "Card Type 2",
  card4: "Card Brand",
  card6: "Card Category",
  addr1: "Billing Address",
  addr2: "Shipping Address",
  dist1: "Address Distance",
  C1: "Count Metric 1",
  C2: "Count Metric 2",
  C13: "Count Metric 13",
  C14: "Count Metric 14",
  D1: "Days Since Event 1",
  D15: "Days Since Event 15",
  "card1_txn_1.0h": "Txns (Last Hour)",
  "card1_txn_24.0h": "Txns (Last 24h)",
};

function getFeatureLabel(name: string): string {
  if (FEATURE_LABELS[name]) {
    return FEATURE_LABELS[name];
  }
  // Handle V features
  if (name.startsWith("V")) {
    return `Vesta Feature ${name.slice(1)}`;
  }
  // Handle M features
  if (name.startsWith("M")) {
    return `Match Flag ${name.slice(1)}`;
  }
  // Handle D features
  if (name.startsWith("D")) {
    return `Time Delta ${name.slice(1)}`;
  }
  // Handle C features
  if (name.startsWith("C")) {
    return `Count ${name.slice(1)}`;
  }
  return name;
}

function getContributionIcon(contribution: number) {
  if (contribution > 0.1) {
    return <TrendingUp className="h-3.5 w-3.5 text-red-500" />;
  }
  if (contribution < -0.1) {
    return <TrendingDown className="h-3.5 w-3.5 text-green-500" />;
  }
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "N/A";
  }
  if (typeof value === "number") {
    if (Number.isInteger(value)) {
      return value.toLocaleString();
    }
    return value.toFixed(2);
  }
  if (typeof value === "string") {
    return value.length > 20 ? `${value.slice(0, 20)}...` : value;
  }
  return String(value);
}

function ContributionBar({ contribution }: { contribution: number }) {
  const isPositive = contribution > 0;
  const absValue = Math.abs(contribution);
  // Scale: SHAP values typically range from -3 to +3
  const maxWidth = Math.min(absValue / 2, 1) * 100;

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Negative side (Green - reduces risk) */}
      <div className="flex-1 flex justify-end">
        {!isPositive && (
          <div
            className="h-2 bg-green-500 rounded-l-sm transition-all duration-500"
            style={{ width: `${maxWidth}%` }}
          />
        )}
      </div>
      {/* Center line */}
      <div className="w-px h-4 bg-gray-200" />
      {/* Positive side (Red - increases risk) */}
      <div className="flex-1">
        {isPositive && (
          <div
            className="h-2 bg-red-500 rounded-r-sm transition-all duration-500"
            style={{ width: `${maxWidth}%` }}
          />
        )}
      </div>
    </div>
  );
}

export function FeatureImportance({ features }: FeatureImportanceProps) {
  if (!features || features.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3 border-b border-gray-100">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Risk factors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-sm text-gray-500">
            No feature importance data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Top fraud risk factors
          </CardTitle>
          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-xs">
            SHAP analysis
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-gray-500 py-3 bg-gray-50/50 border-b border-gray-100">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            Reduces risk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            Increases risk
          </span>
        </div>

        {/* Feature list */}
        <div className="divide-y divide-gray-100">
          {features.map((feature, idx) => {
            const isPositive = feature.contribution > 0;
            return (
              <div
                key={feature.name}
                className="group p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-gray-400 w-4">
                      {idx + 1}.
                    </span>
                    <span className="font-medium text-gray-900">
                      {getFeatureLabel(feature.name)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                      {formatValue(feature.value)}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold justify-end ${
                        isPositive ? "text-red-600" : "text-green-600"
                      }`}
                    >
                      {getContributionIcon(feature.contribution)}
                      {isPositive ? "+" : ""}
                      {feature.contribution.toFixed(2)}
                    </span>
                  </div>
                </div>
                <ContributionBar contribution={feature.contribution} />
              </div>
            );
          })}
        </div>

        {/* Explanation */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 rounded-b-lg">
          <p className="text-xs text-gray-500">
            SHAP values show each feature&apos;s contribution to the risk score.
            Positive values increase fraud likelihood. Negative values reduce
            risk.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
