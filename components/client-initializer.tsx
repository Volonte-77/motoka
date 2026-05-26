"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ClientInitializer({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
