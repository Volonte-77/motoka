"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Car, Package, Users, Settings, 
  LogOut, Menu, Wallet, ShieldAlert, BarChart3, User
} from "lucide-react";

// Liste de navigation enrichie avec les restrictions de rôles (RBAC)
const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Super Admin SaaS", "Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Chauffeurs", href: "/chauffeurs", icon: Users, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Véhicules", href: "/vehicules", icon: Car, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Courses", href: "/courses", icon: Car, roles: ["Admin Agence", "Dispatcher / Opérateur", "Chauffeur"] },
  { name: "Colis", href: "/colis", icon: Package, roles: ["Admin Agence", "Dispatcher / Opérateur", "Client"] },
  { name: "Caisse", href: "/caisse", icon: Wallet, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Rapports", href: "/rapports", icon: BarChart3, roles: ["Admin Agence"] }, 
  { name: "Utilisateurs", href: "/utilisateurs", icon: Users, roles: ["Admin Agence"] },
  { name: "Super Admin", href: "/super-admin", icon: ShieldAlert, roles: ["Super Admin SaaS"] },
  { name: "Paramètres", href: "/settings", icon: Settings, roles: ["Super Admin SaaS", "Admin Agence", "Dispatcher / Opérateur", "Chauffeur"] },
];

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Consommer l'état global Zustand sans ré-affichage inutile
  const { user, logout, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-xs font-mono text-zinc-500">
        INITIALIZING SECURITY LAYERS...
      </div>
    );
  }

  // Filtrer les onglets accessibles selon le rôle de l'utilisateur actif
  const allowedItems = navigationItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-200">
      
      {/* 1. SIDEBAR DESKTOP */}
      <aside className={cn(
        "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 md:flex flex-col justify-between hidden",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        <div>
          {/* Header Sidebar */}
          <div className="p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 h-16">
            <span className={cn("font-bold tracking-wider text-base transition-opacity duration-150", !sidebarOpen && "hidden opacity-0")}>
              MO<span className="text-primary">TO</span>KA <span className="text-[10px] font-mono text-zinc-500">SaaS</span>
            </span>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer ml-auto"
            >
              <Menu size={18} />
            </button>
          </div>

          {/* Mini-Profil Connecté Intégré dans l'UI Supabase */}
          <div className={cn("p-3 mx-2 mt-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl space-y-0.5 overflow-hidden", !sidebarOpen && "hidden")}>
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <User size={12} className="text-primary" />
              <p className="text-xs font-semibold truncate">{user?.name}</p>
            </div>
            <p className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider truncate">{user?.role}</p>
          </div>

          {/* Liens de Navigation Filtrés (Milieu) */}
          <nav className="px-3 py-4 space-y-1">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group cursor-pointer",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold" 
                      : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white"
                  )}
                >
                  <Icon size={18} className={cn(isActive ? "text-primary" : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white")} />
                  <span className={cn("transition-all duration-200 whitespace-nowrap", !sidebarOpen && "opacity-0 md:hidden")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (Déconnexion connectée au Store) */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut size={18} />
            <span className={cn(!sidebarOpen && "hidden")}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* 2. CONTENU PRINCIPAL (S'ADAPTE À LA LARGEUR DYNAMIQUE) */}
      <div className={cn(
        "pb-20 md:pb-0 min-h-screen transition-all duration-200",
        sidebarOpen ? "md:pl-64" : "md:pl-20"
      )}>
        {/* Header mobile rapide */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#121214] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
          <span className="font-bold tracking-wider text-base">
            MO<span className="text-primary">TO</span>KA
          </span>
          <div className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold uppercase">
            {user?.role.split(" ")[0]}
          </div>
        </header>

        {/* Contenu de la page injecté ici */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM BAR (MOBILE ONLY) — Affiche uniquement les items autorisés */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#121214]/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 h-16 flex items-center justify-around px-2">
        {allowedItems.slice(0, 5).map((item) => { // Limité à 5 pour l'affichage mobile
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 text-[10px] font-medium transition-colors cursor-pointer",
                isActive ? "text-primary" : "text-zinc-400"
              )}
            >
              <Icon size={18} className={cn("mb-1", isActive ? "text-primary" : "text-zinc-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}