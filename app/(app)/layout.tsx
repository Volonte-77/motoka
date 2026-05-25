"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NavigationShell from "@/components/navigation-shell";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthGuard } from "@/hooks/useAuthGuard";

/**
 * Layout pour l'espace Admin Agence (/app/*)
 * 
 * Autorize: Admin Agence, Dispatcher/Opérateur
 * Rôles non-autorisés: redirigés vers leur espace home
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  // Guard: Vérifier l'authentification et le rôle
  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const allowedRoles = ["Super Admin SaaS", "Admin Agence", "Dispatcher / Opérateur"];
    if (!allowedRoles.includes(user.role)) {
      switch (user.role) {
        case "Chauffeur":
          router.push("/driver/portal");
          break;
        case "Client":
          router.push("/client/space");
          break;
        default:
          router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Afficher le loading ou un skeleton si nécessaire
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50 dark:bg-[#09090b]">
        <div className="text-zinc-400">Chargement...</div>
      </div>
    );
  }

  // Afficher le layout avec la NavigationShell
  return <NavigationShell>{children}</NavigationShell>;
}
