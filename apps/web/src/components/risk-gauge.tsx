"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface RiskGaugeProps {
  score: number; // 0 to 1
  riskLevel?: "low" | "medium" | "high" | "critical";
}

export function RiskGauge({ score, riskLevel }: RiskGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Animate score changes
  useEffect(() => {
    setIsAnimating(true);
    const targetScore = Math.round(score * 100);
    const duration = 800; // ms
    const startTime = Date.now();
    const startScore = animatedScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentScore = Math.round(
        startScore + (targetScore - startScore) * easeOutQuart
      );

      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    requestAnimationFrame(animate);
  }, [score]);

  const percentage = animatedScore;

  // Determine colors based on risk level or score
  const getColors = () => {
    if (riskLevel === "critical") {
      return {
        primary: "#dc2626", // red-600
        secondary: "#fca5a5", // red-300
        glow: "rgba(220, 38, 38, 0.3)",
      };
    }
    if (riskLevel === "high") {
      return {
        primary: "#ef4444", // red-500
        secondary: "#fecaca", // red-200
        glow: "rgba(239, 68, 68, 0.25)",
      };
    }
    if (riskLevel === "medium" || percentage > 50) {
      return {
        primary: "#f59e0b", // amber-500
        secondary: "#fde68a", // amber-200
        glow: "rgba(245, 158, 11, 0.2)",
      };
    }
    return {
      primary: "#22c55e", // green-500
      secondary: "#86efac", // green-300
      glow: "rgba(34, 197, 94, 0.15)",
    };
  };

  const colors = getColors();
  const isHighRisk = riskLevel === "high" || riskLevel === "critical";

  const data = [
    { name: "Score", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-64 relative">
      {/* Glow effect for high risk */}
      {isHighRisk && (
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-50 animate-pulse"
          style={{ backgroundColor: colors.glow }}
        />
      )}

      {/* Score Display */}
      <div className="relative z-10">
        <div
          className={`text-5xl font-bold transition-all duration-300 ${
            isHighRisk ? "animate-pulse" : ""
          } ${isAnimating ? "scale-105" : "scale-100"}`}
          style={{ color: colors.primary }}
        >
          {percentage}%
        </div>
        <div className="text-sm text-muted-foreground uppercase tracking-wider mt-1 font-semibold text-center">
          Risk Score
        </div>
      </div>

      {/* Gauge Chart */}
      <div className="w-full h-40 mt-4 -mb-20 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {/* Background track */}
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={75}
              outerRadius={105}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell
                fill="currentColor"
                className="text-slate-200 dark:text-slate-700"
              />
            </Pie>

            {/* Score arc */}
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={78}
              outerRadius={102}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationDuration={0}
            >
              <Cell key="score" fill={colors.primary} />
              <Cell key="remaining" fill="transparent" />
            </Pie>

            {/* Inner glow ring for high risk */}
            {isHighRisk && (
              <Pie
                data={data}
                cx="50%"
                cy="100%"
                startAngle={180}
                endAngle={0}
                innerRadius={82}
                outerRadius={98}
                paddingAngle={0}
                dataKey="value"
                stroke="none"
              >
                <Cell key="score-glow" fill={colors.secondary} opacity={0.5} />
                <Cell key="remaining-glow" fill="transparent" />
              </Pie>
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Risk level indicators */}
      <div className="flex justify-between w-full max-w-[240px] mt-2 text-xs font-medium text-muted-foreground">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}
