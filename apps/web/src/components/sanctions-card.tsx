"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
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
    1: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
    2: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    3: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
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
      : "bg-slate-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs font-mono font-medium w-12 text-right">
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
      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-md">
        <div className="flex items-center gap-2">
          <MatchRankBadge rank={rank} />
          <span className="text-sm font-medium truncate max-w-[180px]">
            {match.match_name}
          </span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {(match.score * 100).toFixed(1)}%
        </span>
      </div>
    );
  }

  return (
    <div className="text-sm space-y-3 border rounded-md p-3 bg-background">
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
            className="text-xs text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950"
          >
            REVIEW
          </Badge>
        )}
      </div>

      <div className="space-y-2">
        <div>
          <span className="text-xs text-muted-foreground block mb-1">
            Matched Entity
          </span>
          <span
            className={`font-medium ${
              match.is_match ? "text-red-600 dark:text-red-400" : ""
            }`}
          >
            {match.match_name}
          </span>
        </div>

        <div>
          <span className="text-xs text-muted-foreground block mb-1">
            Similarity Score
          </span>
          <ScoreBar score={match.score} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t">
        <div>
          <span className="text-xs text-muted-foreground block">Program</span>
          <span className="text-sm font-mono font-medium">
            {match.program || "SDN"}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">UID</span>
          <span className="text-sm font-mono font-medium">
            {match.uid || "N/A"}
          </span>
        </div>
        {match.country && (
          <div>
            <span className="text-xs text-muted-foreground block">Country</span>
            <span className="text-sm font-mono font-medium">
              {match.country}
            </span>
          </div>
        )}
        {match.source && (
          <div>
            <span className="text-xs text-muted-foreground block">Source</span>
            <span className="text-sm font-mono font-medium">
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Sanctions screening
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No sanctions data available.
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
      className={
        isMatch ? "border-red-200 dark:border-red-900 dark:bg-red-950/20" : ""
      }
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {isMatch ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            Sanctions screening
          </span>
          {matches.length > 0 && (
            <Badge variant="secondary" className="text-xs font-normal">
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMatch ? (
          <Alert
            variant="destructive"
            className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-medium">
              Sanctions hit detected
            </AlertTitle>
            <AlertDescription>
              This entity matches a record on the OFAC sanctions list.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-3 py-2 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>Clean - No high-confidence OFAC matches.</span>
          </div>
        )}

        {/* Query Info */}
        {matchData?.query && (
          <div className="text-sm">
            <span className="text-muted-foreground">Screened: </span>
            <span className="font-medium">{matchData.query}</span>
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
              className="w-full text-xs text-muted-foreground hover:text-foreground"
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

            {!showAllMatches && (
              <div className="space-y-1">
                {additionalMatches.map((match, idx) => (
                  <MatchItem
                    key={match.uid || idx}
                    match={match}
                    rank={idx + 2}
                    isExpanded={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Applied Filters */}
        {matchData?.applied_filters &&
          Object.values(matchData.applied_filters).some((v) => v) && (
            <div className="text-xs text-muted-foreground pt-2 border-t">
              <span className="font-medium">Filters: </span>
              {Object.entries(matchData.applied_filters)
                .filter(([, v]) => v)
                .map(([k, v]) => `${k}=${v}`)
                .join(", ")}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
