"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Shield } from "lucide-react";

/**
 * Layout pour le Panneau SaaS Global (/admin/saas/*)
 * 
 * Réservé: Super Admin SaaS uniquement
 * Style: Minimaliste, analytique, froid
 * 
 * Affiche:
 * - Gestion des abonnements agences
 * - Création/blocage des comptes
 * - Métriques globales de performance
 */
export default function SaasAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  // Guard: Uniquement SuperAdmin
  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "Super Admin SaaS") {
      if (user) {
        // Rediriger vers l'espace approprié
        switch (user.role) {
          case "Admin Agence":
          case "Dispatcher / Opérateur":
            router.push("/app/dashboard");
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
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-zinc-400">Chargement Panneau SaaS...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#15151a]">
      {/* Entête SaaS */}
      <header className="border-b border-zinc-800 bg-[#121214]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="text-orange-500" size={24} />
            <div>
              <h1 className="text-lg font-bold text-white">Panneau de Contrôle SaaS</h1>
              <p className="text-xs text-zinc-500">Volenium Tech — MOTOKA Core</p>
            </div>
          </div>

          {/* User info */}
          <div className="text-right text-xs">
            <p className="text-zinc-400">Utilisateur:</p>
            <p className="text-white font-medium">{user?.name}</p>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
