"use client";

import { useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SanctionsMatch } from "@/types";

interface SanctionsCardProps {
  matchData:
    | {
        query: string;
        top_matches: SanctionsMatch[];
        applied_filters?: Record<string, string | null>;
        latency_ms?: number;
        version?: string;
      }
    | null
    | undefined;
  isMatch: boolean;
}

function MatchRankBadge({ rank }: { rank: number }) {
  const colors = {
    1: "bg-amber-100 text-amber-800",
    2: "bg-gray-100 text-gray-700",
    3: "bg-orange-100 text-orange-700",
  };
  return (
    <span
      className={`text-xs font-bold px-1.5 py-0.5 rounded ${
        colors[rank as keyof typeof colors] || colors[3]
      }`}
    >
      #{rank}
    </span>
  );
}

function ScoreBar({ score }: { score: number }) {
  const percentage = score * 100;
  const color =
    percentage >= 90
      ? "bg-red-500"
      : percentage >= 80
      ? "bg-amber-500"
      : "bg-gray-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium w-12 text-right text-gray-600">
        {percentage.toFixed(1)}%
      </span>
    </div>
  );
}

function MatchItem({
  match,
  rank,
  isExpanded = true,
}: {
  match: SanctionsMatch;
  rank: number;
  isExpanded?: boolean;
}) {
  if (!isExpanded) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-sm hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          <MatchRankBadge rank={rank} />
          <span className="text-sm font-medium truncate max-w-[180px] text-gray-900">
            {match.match_name}
          </span>
        </div>
        <span className="text-xs font-mono text-gray-500">
          {(match.score * 100).toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div className="text-sm space-y-3 border border-gray-200 rounded-sm p-3 bg-white hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <MatchRankBadge rank={rank} />
        {match.is_match && (
          <Badge variant="destructive" className="text-xs">
            MATCH
          </Badge>
        )}
        {!match.is_match && match.decision === "review" && (
          <Badge
            variant="outline"
            className="text-xs text-amber-600 border-amber-300 bg-amber-50"
          >
            REVIEW
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs text-gray-500 block mb-1">
            Matched Entity
          </span>
          <span
            className={`font-medium ${
              match.is_match ? "text-red-600" : "text-gray-900"
            }`}
          >
            {match.match_name}
          </span>
        </div>

        <div>
          <span className="text-xs text-gray-500 block mb-1">
            Similarity Score
          </span>
          <ScoreBar score={match.score} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <span className="text-xs text-gray-500 block">Program</span>
          <span className="text-sm font-mono font-medium text-gray-900">
            {match.program || "SDN"}
          </span>
        </div>
        <div>
          <span className="text-xs text-gray-500 block">UID</span>
          <span className="text-sm font-mono font-medium text-gray-900">
            {match.uid || "N/A"}
          </span>
        </div>
        {match.country && (
          <div>
            <span className="text-xs text-gray-500 block">Country</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {match.country}
            </span>
          </div>
        )}
        {match.source && (
          <div>
            <span className="text-xs text-gray-500 block">Source</span>
            <span className="text-sm font-mono font-medium text-gray-900">
              {match.source}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function SanctionsCard({ matchData, isMatch }: SanctionsCardProps) {
  const [showAllMatches, setShowAllMatches] = useState(false);

  if (!matchData && !isMatch) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
            <div className="p-1.5 bg-green-100 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            Sanctions screening
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-gray-500 py-8 text-center">
            No sanctions match.
          </p>
        </CardContent>
      </Card>
    );
  }

  const matches = matchData?.top_matches || [];
  const topMatch = matches[0];
  const additionalMatches = matches.slice(1);

  return (
    <Card
      className={`h-full ${isMatch ? "border-red-200" : "border-gray-200"}`}
    >
      <CardHeader className="pb-4 border-b border-gray-100">
        <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
          <div className="flex items-center gap-3">
            {isMatch ? (
              <div className="p-1.5 bg-red-100 rounded-full">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
            ) : (
              <div className="p-1.5 bg-green-100 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            )}
            Sanctions screening
          </div>
          {matches.length > 0 && (
            <Badge
              variant="secondary"
              className="text-xs font-normal bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {isMatch ? (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="font-medium text-red-900">
              Sanctions hit detected
            </AlertTitle>
            <AlertDescription className="text-red-800">
              This entity matches a record on the OFAC sanctions list.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-3 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-sm border border-green-100">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="font-medium">
              Clean - No high-confidence OFAC matches.
            </span>
          </div>
        )}

        {/* Query Info */}
        {matchData?.query && (
          <div className="text-sm bg-gray-50 p-3 rounded-sm border border-gray-100">
            <span className="text-gray-500">Screened: </span>
            <span className="font-medium text-gray-900">{matchData.query}</span>
          </div>
        )}

        {/* Top Match (Always Expanded) */}
        {topMatch && <MatchItem match={topMatch} rank={1} isExpanded />}

        {/* Additional Matches */}
        {additionalMatches.length > 0 && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              onClick={() => setShowAllMatches(!showAllMatches)}
            >
              {showAllMatches ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide additional matches
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {additionalMatches.length} more match
                  {additionalMatches.length !== 1 ? "es" : ""}
                </>
              )}
            </Button>

            {showAllMatches && (
              <div className="space-y-2">
                {additionalMatches.map((match, idx) => (
                  <MatchItem
                    key={match.uid || idx}
                    match={match}
                    rank={idx + 2}
                    isExpanded
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
