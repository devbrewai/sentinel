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
      {/* Negative side */}
      <div className="flex-1 flex justify-end">
        {!isPositive && (
          <div
            className="h-2 bg-green-500 dark:bg-green-600 rounded-l transition-all duration-500"
            style={{ width: `${maxWidth}%` }}
          />
        )}
      </div>
      {/* Center line */}
      <div className="w-px h-4 bg-slate-300 dark:bg-slate-600" />
      {/* Positive side */}
      <div className="flex-1">
        {isPositive && (
          <div
            className="h-2 bg-red-500 dark:bg-red-600 rounded-r transition-all duration-500"
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
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Risk factors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No feature importance data available.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Top fraud risk factors</span>
          <span className="text-xs font-normal text-muted-foreground">
            SHAP analysis
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pb-2 border-b">
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-green-500 rounded" />
            Reduces risk
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-2 bg-red-500 rounded" />
            Increases risk
          </span>
        </div>

        {/* Feature list */}
        <div className="space-y-3">
          {features.map((feature, idx) => {
            const isPositive = feature.contribution > 0;
            return (
              <div key={feature.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">
                      {idx + 1}.
                    </span>
                    <span className="font-medium">
                      {getFeatureLabel(feature.name)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatValue(feature.value)}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-medium ${
                        isPositive
                          ? "text-red-600 dark:text-red-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : feature.contribution < 0 ? (
                        <TrendingDown className="h-3 w-3" />
                      ) : (
                        <Minus className="h-3 w-3" />
                      )}
                      {feature.contribution > 0 ? "+" : ""}
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
        <p className="text-xs text-muted-foreground pt-2 border-t">
          SHAP values show each feature&apos;s contribution to the risk score.
          Positive values increase fraud likelihood.
        </p>
      </CardContent>
    </Card>
  );
}
