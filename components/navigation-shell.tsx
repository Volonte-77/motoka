"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Car, Package, Users, Settings, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

// Définition des liens de navigation principaux
const navigationItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard }, // Devient la racine de l'application connectée
  { name: "Chauffeurs", href: "/chauffeurs", icon: Users },
  {name: "Véhicules", href: "/vehicules", icon: Car }, // Ajouté ici
  { name: "Courses", href: "/courses", icon: Car },
  { name: "Colis", href: "/colis", icon: Package },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

export default function NavigationShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-white transition-colors duration-200">
    
    {/* 1. SIDEBAR */}
    <aside className={cn(
      "fixed top-0 left-0 z-40 h-screen bg-white dark:bg-[#121214] border-r border-zinc-200 dark:border-zinc-800 transition-transform md:translate-x-0 hidden md:flex flex-col justify-between",
      sidebarOpen ? "w-64" : "w-20"
    )}>
        {/* Header Sidebar */}
        <div className="p-4 flex items-center justify-between border-b border-zinc-800">
          <span className={cn("font-bold tracking-wider text-xl", !sidebarOpen && "hidden")}>
            MO<span className="text-primary">TO</span>KA
          </span>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white cursor-pointer"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Liens de Navigation (Milieu) */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                )}
              >
                <Icon size={20} className={cn(isActive ? "text-primary" : "text-zinc-400 group-hover:text-white")} />
                <span className={cn("transition-opacity duration-200", !sidebarOpen && "opacity-0 md:hidden")}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Sidebar (Déconnexion) */}
        <div className="p-3 border-t border-zinc-800">
          <Link
            href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            <span className={cn(!sidebarOpen && "hidden")}>Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* 2. CONTENU PRINCIPAL (S'ADAPTE À LA SIDEBAR) */}
      <div className={cn(
        "pb-20 md:pb-0 min-h-screen transition-all duration-200",
        sidebarOpen ? "md:pl-64" : "md:pl-20"
      )}>
        {/* Header mobile rapide */}
        <header className="md:hidden flex items-center justify-between p-4 bg-[#121214] border-b border-zinc-800 sticky top-0 z-30">
          <span className="font-bold tracking-wider text-lg">
            MO<span className="text-primary">TO</span>KA
          </span>
          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-semibold text-primary border border-zinc-700">
            AG
          </div>
        </header>

        {/* Contenu de la page injecté ici */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>

      {/* 3. BOTTOM BAR (MOBILE ONLY) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#121214]/95 backdrop-blur-md border-t border-zinc-800 h-16 flex items-center justify-around px-2">
        {navigationItems.map((item) => {
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
              <Icon size={20} className={cn("mb-1", isActive ? "text-primary" : "text-zinc-400")} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

    </div>
  );
}