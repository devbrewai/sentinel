"use client";

import { NavHeader } from "@/components/nav-header";
import { Footer } from "@/components/footer";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 transition-colors flex flex-col">
      <NavHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
