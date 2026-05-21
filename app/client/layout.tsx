"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Layout pour l'Espace Client (/client/*)
 * 
 * Réservé: Clients Agence (Passagers / Expéditeurs) uniquement
 * Style: B2C / Grand Public, fluide, accueillant, rassurante
 * 
 * UX/Philosophie:
 * - Interface chaleureuse et accueillante
 * - Barre de recherche de trajets proéminente
 * - Suivi en temps réel du statut des colis
 * - Historique de réservations
 * - Thème doux avec accents de confiance
 * 
 * Affiche:
 * - Billets de réservation (historique + actifs)
 * - Colis envoyés (suivi avec OTP)
 * - Recherche de trajets disponibles
 * - Horaires publics
 */
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuthStore();

  // Guard: Uniquement Client
  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "Client") {
      if (user) {
        // Rediriger vers l'espace approprié
        switch (user.role) {
          case "Super Admin SaaS":
            router.push("/admin/saas/agencies");
            break;
          case "Admin Agence":
          case "Dispatcher / Opérateur":
            router.push("/app/dashboard");
            break;
          case "Chauffeur":
            router.push("/driver/portal");
            break;
          default:
            router.push("/login");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-blue-400 rounded-full mx-auto mb-4"></div>
            <p className="text-slate-600">Chargement de votre espace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Entête accueillante */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Home size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">MOTOKA Client</h1>
                <p className="text-xs text-slate-500">
                  Bienvenue, {user?.name}
                </p>
              </div>
            </div>

            {/* Action déconnexion */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="text-slate-700 border-slate-300 hover:bg-slate-100 flex items-center gap-2"
            >
              <LogOut size={16} /> Déconnexion
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer doux */}
      <footer className="border-t border-slate-200 bg-white mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-slate-600">
            <p>
              MOTOKA © 2026 · Gestion Logistique Intelligente · Volenium Tech
            </p>
            <div className="flex justify-center gap-6 mt-4 text-slate-500">
              <a href="#" className="hover:text-slate-900">
                Aide
              </a>
              <a href="#" className="hover:text-slate-900">
                Contact
              </a>
              <a href="#" className="hover:text-slate-900">
                Conditions
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
