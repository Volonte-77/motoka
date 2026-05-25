"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Car, Package, Users, Settings, 
  LogOut, Menu, Wallet, ShieldAlert, BarChart3, User,
  Building2, CreditCard, Activity, X
} from "lucide-react";
import { Logo } from "@/components/logo";

// Liste de navigation enrichie avec les restrictions de rôles (RBAC)
const navigationItems = [
  // --- ESPACE AGENCE ---
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Chauffeurs", href: "/chauffeurs", icon: Users, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Véhicules", href: "/vehicules", icon: Car, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Courses", href: "/courses", icon: Car, roles: ["Admin Agence", "Dispatcher / Opérateur", "Chauffeur"] },
  { name: "Colis", href: "/colis", icon: Package, roles: ["Admin Agence", "Dispatcher / Opérateur", "Client"] },
  { name: "Caisse", href: "/caisse", icon: Wallet, roles: ["Admin Agence", "Dispatcher / Opérateur"] },
  { name: "Rapports", href: "/rapports", icon: BarChart3, roles: ["Admin Agence"] }, 
  { name: "Utilisateurs", href: "/utilisateurs", icon: Users, roles: ["Admin Agence"] },

  // --- ESPACE SUPER ADMIN SaaS ---
  { name: "SaaS Overview", href: "/super-admin", icon: LayoutDashboard, roles: ["Super Admin SaaS"] },
  { name: "Agences", href: "/super-admin/agencies", icon: Building2, roles: ["Super Admin SaaS"] },
  { name: "Plans & Tarifs", href: "/super-admin/plans", icon: CreditCard, roles: ["Super Admin SaaS"] },
  { name: "Logs Système", href: "/super-admin/logs", icon: Activity, roles: ["Super Admin SaaS"] },

  // --- COMMUN ---
  { name: "Paramètres", href: "/settings", icon: Settings, roles: ["Super Admin SaaS", "Admin Agence", "Dispatcher / Opérateur", "Chauffeur"] },
];

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // sidebarOpen gère l'état réduit sur desktop ET l'état ouvert sur mobile
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { user, logout, loading } = useAuthStore();

  // Fermer le menu mobile lors d'un changement de route
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] flex items-center justify-center text-xs font-mono text-zinc-500">
        INITIALIZING SECURITY LAYERS...
      </div>
    );
  }

  const allowedItems = navigationItems.filter(item => 
    user ? item.roles.includes(user.role) : false
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-200">
      
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Drawer sur mobile, Permanent sur desktop) */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 flex flex-col justify-between",
        // Logique Mobile
        mobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
        // Logique Desktop
        sidebarOpen ? "md:w-64" : "md:w-20"
      )}>
        <div>
          {/* Header Sidebar (Logo + Toggle) */}
          <div className={cn(
            "p-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 h-16 transition-all duration-200",
            !sidebarOpen && "md:justify-center"
          )}>
            <div 
              onClick={() => !sidebarOpen && setSidebarOpen(true)}
              className={cn("transition-all duration-200", !sidebarOpen && "md:cursor-pointer md:hover:scale-110")}
            >
              <Logo 
                size={sidebarOpen ? 30 : 36} 
                showText={sidebarOpen || mobileMenuOpen} 
                className={cn("transition-all duration-200", !sidebarOpen && "md:ml-0")} 
              />
            </div>
            
            {/* Bouton fermeture (Desktop) */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="hidden md:flex p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer ml-auto"
              style={{ display: sidebarOpen ? 'flex' : 'none' }}
            >
              <Menu size={18} />
            </button>

            {/* Bouton fermeture (Mobile) */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profil */}
          <div className={cn("p-3 mx-2 mt-3 border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-xl space-y-0.5 overflow-hidden transition-all", (!sidebarOpen && !mobileMenuOpen) && "md:opacity-0 md:h-0 md:p-0 md:mt-0")}>
            <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
              <User size={12} className="text-primary" />
              <p className="text-xs font-semibold truncate">{user?.name}</p>
            </div>
            <p className="text-[9px] font-mono font-bold uppercase text-zinc-400 tracking-wider truncate">{user?.role}</p>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 space-y-1">
            {allowedItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isDesktopCollapsed = !sidebarOpen && !mobileMenuOpen;
              
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
                  <span className={cn("transition-all duration-200 whitespace-nowrap", isDesktopCollapsed && "md:hidden")}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar (Logout) */}
        <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
          >
            <LogOut size={18} />
            <span className={cn(!sidebarOpen && !mobileMenuOpen && "md:hidden")}>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <div className={cn(
        "transition-all duration-300 min-h-screen",
        sidebarOpen ? "md:pl-64" : "md:pl-20"
      )}>
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#121214] border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-30">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 cursor-pointer"
          >
            <Menu size={20} />
          </button>
          <Logo size={28} />
          <div className="w-10" /> {/* Spacer pour centrer le logo */}
        </header>

        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
