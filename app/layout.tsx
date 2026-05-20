"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <html lang="fr" className="dark">
      <body className="bg-zinc-50 dark:bg-[#09090b] transition-colors duration-200 antialiased">
        {children}
      </body>
    </html>
  );
}