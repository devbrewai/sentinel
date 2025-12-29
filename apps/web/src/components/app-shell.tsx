"use client";

import { NavHeader } from "@/components/nav-header";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors">
      <NavHeader />
      <main>{children}</main>
    </div>
  );
}
