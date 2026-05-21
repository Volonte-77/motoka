"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

/**
 * Layout pour le Portail Chauffeur (/driver/*)
 * 
 * Réservé: Chauffeurs uniquement
 * Style: Mobile-First, Épuré, Ultra-Sombre avec Contraste Élevé
 * 
 * UX/Philosophie:
 * - Boutons massifs tactiles (min 48px de hauteur)
 * - Pas de tableaux denses
 * - Feuille de route active + actions rapides
 * - Contraste maximal pour utilisation sur la route
 * 
 * Affiche:
 * - Course assignée
 * - État du véhicule
 * - Liste des colis à décharger
 * - Bouton action principal (Lancer course / Arrivé)
 */
export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard: Uniquement Chauffeur
  useEffect(() => {
    if (loading) return;

    if (!user || user.role !== "Chauffeur") {
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

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
        <div className="text-zinc-400 text-center">
          <div className="text-sm">Initialisation du portail...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Entête minimaliste - Ultra contraste pour route */}
      <header className="bg-black border-b-2 border-orange-500 sticky top-0 z-50 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">MOTOKA Driver</h1>
          <p className="text-xs text-orange-400">{user?.name}</p>
        </div>

        {/* Menu mobile */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-zinc-900 transition"
        >
          <Menu size={24} className="text-white" />
        </button>
      </header>

      {/* Menu mobile (si ouvert) */}
      {mobileMenuOpen && (
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 space-y-2">
          <Button
            onClick={handleLogout}
            className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold h-12 flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Déconnexion
          </Button>
        </div>
      )}

      {/* Contenu principal (flex-grow pour footer adhesif) */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-20">
        {children}
      </main>

      {/* Footer fixe (optionnel pour actions rapides) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black border-t-2 border-orange-500 px-4 py-3 flex gap-2">
        <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-black font-bold h-14 text-base">
          Statut: Disponible
        </Button>
        <Button
          variant="outline"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-4 h-14 border-zinc-700 bg-zinc-900"
        >
          Menu
        </Button>
      </footer>
    </div>
  );
}
