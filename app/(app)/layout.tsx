"use client";

import NavigationShell from "@/components/navigation-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <NavigationShell>{children}</NavigationShell>;
}