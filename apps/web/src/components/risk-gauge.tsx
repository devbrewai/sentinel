"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  score: number; // 0 to 1
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const percentage = Math.round(score * 100);

  // Determine color
  let color = "#22c55e"; // Green
  if (percentage > 80) color = "#ef4444"; // Red
  else if (percentage > 50) color = "#eab308"; // Yellow

  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-64 relative">
      <div className="text-5xl font-bold" style={{ color }}>
        {percentage}%
      </div>
      <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1 font-semibold">
        Risk Score
      </div>

      <div className="w-full h-40 mt-4 -mb-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={110}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell key="score" fill={color} />
              <Cell key="remaining" fill="#f3f4f6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
