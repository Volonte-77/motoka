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

    // Admin Agence, Dispatcher ou Super Admin peuvent accéder ici
    const allowedRoles = ["Super Admin SaaS", "Admin Agence", "Dispatcher / Opérateur"];
    if (!allowedRoles.includes(user.role)) {
      // Rediriger vers l'espace approprié
      switch (user.role) {
        case "Super Admin SaaS":
          router.push("/super-admin");
          break;
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
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-zinc-400">Chargement...</div>
      </div>
    );
  }

  // Afficher le layout avec la NavigationShell
  return <NavigationShell>{children}</NavigationShell>;
}
