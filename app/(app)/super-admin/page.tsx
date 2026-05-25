"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Globe, 
  Activity, 
  ShieldCheck, 
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Server
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import localforage from "localforage";
import { STORAGE_KEYS, Agency, AppUser } from "@/types";

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalAgencies: 0,
    activeAgencies: 0,
    totalUsers: 0,
    systemHealth: "Optimal",
    globalRevenue: "12.4M", // Simulation
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlobalStats = async () => {
      setLoading(true);
      const [agencies, users] = await Promise.all([
        localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [],
        localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [],
      ]);

      setStats({
        totalAgencies: (agencies as Agency[]).length,
        activeAgencies: (agencies as Agency[]).filter(a => a.status === "Actif").length,
        totalUsers: (users as AppUser[]).length,
        systemHealth: "Optimal",
        globalRevenue: "12.4M",
      });
      setLoading(false);
    };
    loadGlobalStats();
  }, []);

  const StatCard = ({ title, value, icon: Icon, trend, color, description }: any) => (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon size={16} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</div>
        )}
        <p className="text-[10px] text-zinc-500 mt-1">{description}</p>
        {trend && (
          <div className={cn(
            "absolute bottom-0 right-0 p-2",
            trend > 0 ? "text-emerald-500" : "text-rose-500"
          )}>
            {trend > 0 ? <ArrowUpRight size={20} className="opacity-20" /> : <ArrowDownRight size={20} className="opacity-20" />}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white flex items-center gap-3">
          <ShieldCheck className="text-primary h-8 w-8" /> Overview SaaS
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Supervisez l'ensemble du réseau Motoka et la santé du système.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Agences" 
          value={stats.totalAgencies} 
          icon={Building2} 
          color="bg-blue-500/10 text-blue-500"
          description="Opérateurs enregistrés"
        />
        <StatCard 
          title="Utilisateurs" 
          value={stats.totalUsers} 
          icon={Users} 
          color="bg-primary/10 text-primary"
          description="Staff total du réseau"
        />
        <StatCard 
          title="Revenu Global" 
          value={`${stats.globalRevenue} FCFA`} 
          icon={TrendingUp} 
          color="bg-emerald-500/10 text-emerald-500"
          description="Volume d'affaires mensuel"
        />
        <StatCard 
          title="Santé Système" 
          value={stats.systemHealth} 
          icon={Activity} 
          color="bg-amber-500/10 text-amber-500"
          description="Uptime 99.9%"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Graphique de croissance */}
        <Card className="md:col-span-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Globe size={16} className="text-primary" /> Croissance du Réseau (6 mois)
            </CardTitle>
            <CardDescription>Nombre de nouvelles agences par mois.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] flex items-end justify-around gap-4 pt-8">
              {[2, 5, 8, 12, 15, 22].map((val, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-1 max-w-[60px] group">
                  <div 
                    className="w-full bg-primary/20 group-hover:bg-primary transition-all rounded-t-md relative" 
                    style={{ height: `${(val / 25) * 100}%` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {['Jan', 'Féb', 'Mar', 'Avr', 'Mai', 'Juin'][i]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status des agences par plan */}
        <Card className="md:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Répartition des Plans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Premium</span>
                <span className="text-zinc-500">45%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[45%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Standard</span>
                <span className="text-zinc-500">35%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[35%]"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Basique</span>
                <span className="text-zinc-500">20%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-zinc-400 w-[20%]"></div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <Server size={14} />
                <span>Base de données : 2.4 GB / 10 GB</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
