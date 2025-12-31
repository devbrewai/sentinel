"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileStack, BarChart3 } from "lucide-react";
import { SiGithub } from "@icons-pack/react-simple-icons";
import { cn } from "@/lib/utils";
import { checkHealth } from "@/lib/api";
import Image from "next/image";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/batch", label: "Batch", icon: FileStack },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

type SystemStatus = "operational" | "degraded" | "down" | "loading";

export function NavHeader() {
  const pathname = usePathname();
  const [status, setStatus] = useState<SystemStatus>("loading");

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await checkHealth();
        if (
          health.status === "healthy" &&
          health.model_loaded &&
          health.screener_loaded
        ) {
          setStatus("operational");
        } else {
          setStatus("degraded");
        }
      } catch {
        setStatus("down");
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    loading: { color: "bg-gray-400", label: "Checking..." },
    operational: {
      color: "bg-green-500",
      pingColor: "bg-green-400",
      label: "All systems operational",
    },
    degraded: {
      color: "bg-yellow-500",
      pingColor: "bg-yellow-400",
      label: "Degraded performance",
    },
    down: {
      color: "bg-red-500",
      pingColor: "bg-red-400",
      label: "System unavailable",
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logos/logo.svg"
              alt="FraudGuard"
              width={100}
              height={100}
              className="h-6 w-auto group-hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-xs",
                    isActive
                      ? "text-gray-900 bg-gray-50"
                      : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-gray-900" : "text-gray-400"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-full">
              <span className="flex h-2 w-2 relative">
                {status !== "loading" && "pingColor" in currentStatus && (
                  <span
                    className={cn(
                      "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                      currentStatus.pingColor
                    )}
                  ></span>
                )}
                <span
                  className={cn(
                    "relative inline-flex rounded-full h-2 w-2",
                    currentStatus.color
                  )}
                ></span>
              </span>
              <span className="text-gray-600 font-medium text-xs">
                {currentStatus.label}
              </span>
            </div>
            <a
              href="https://github.com/devbrewai/ai-fraud-detection-cross-border-payments"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="View on GitHub"
            >
              <SiGithub className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto -mx-2 px-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors rounded-xs",
                  isActive
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
