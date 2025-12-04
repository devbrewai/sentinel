import { Badge } from "@/components/ui/badge";
import { Zap } from "lucide-react";

interface LatencyBadgeProps {
  latencyMs: number;
}

export function LatencyBadge({ latencyMs }: LatencyBadgeProps) {
  let colorClass = "bg-green-100 text-green-800 hover:bg-green-100";
  if (latencyMs > 200) colorClass = "bg-red-100 text-red-800 hover:bg-red-100";
  else if (latencyMs > 100)
    colorClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";

  return (
    <Badge variant="secondary" className={`gap-1 font-mono ${colorClass}`}>
      <Zap className="h-3 w-3" />
      {latencyMs.toFixed(1)}ms
    </Badge>
  );
}
