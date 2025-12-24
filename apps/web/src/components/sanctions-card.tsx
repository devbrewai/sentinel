import { AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export function SanctionsCard({ matchData, isMatch }: SanctionsCardProps) {
  if (!matchData && !isMatch) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Sanctions Screening
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

  const topMatch = matchData?.top_matches?.[0];

  return (
    <Card className={isMatch ? "border-red-200 bg-red-50/10" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isMatch ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
          Sanctions Screening
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isMatch ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Sanctions Hit Detected</AlertTitle>
            <AlertDescription>
              This entity matches a record on the OFAC SDN list.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-md">
            <CheckCircle className="h-4 w-4" />
            <span>Clean - No OFAC matches found.</span>
          </div>
        )}

        {topMatch && (
          <div className="text-sm space-y-2 border rounded-md p-3 bg-background">
            <div className="grid grid-cols-3 gap-1">
              <span className="text-muted-foreground">Input:</span>
              <span className="col-span-2 font-medium">{matchData?.query}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-muted-foreground">Match:</span>
              <span className="col-span-2 font-medium text-red-600">
                {topMatch.match_name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="text-muted-foreground">Score:</span>
              <span className="col-span-2 font-medium">
                {(topMatch.score * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
