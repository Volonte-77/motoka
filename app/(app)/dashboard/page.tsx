"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockApi } from "@/lib/mock-api";
import { useAuthStore } from "@/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Car, 
  Users, 
  Package, 
  TrendingUp, 
  MapPin, 
  Clock,
  ShieldCheck
} from "lucide-react";

import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  ResponsiveContainer 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { Branch } from "@/types";
import { Combobox } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";

const revenueData = [
  { day: "Lun", amount: 45000 },
  { day: "Mar", amount: 52000 },
  { day: "Mer", amount: 38000 },
  { day: "Jeu", amount: 65000 },
  { day: "Ven", amount: 48000 },
  { day: "Sam", amount: 72000 },
  { day: "Dim", amount: 40000 },
];

const chartConfig = {
  amount: {
    label: "Recettes",
    color: "#0ea5e9",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | "all">("all");
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    packages: 0,
    trips: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranchData = async () => {
      if (!user?.agencyId) return;
      const branchList = await mockApi.agencies.getBranches(user.agencyId);
      
      if (user.role === "Admin Agence") {
        setBranches(branchList);
      } else if (user.branchId) {
        const myBranch = branchList.find(b => b.id === user.branchId);
        if (myBranch) setCurrentBranch(myBranch);
      }
    };
    fetchBranchData();
  }, [user]);

  const [revenueData, setRevenueData] = useState<{ day: string, amount: number }[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const agencyId = user?.agencyId || null;
      const effectiveBranchId = user?.role === "Admin Succursale" 
        ? user.branchId 
        : (selectedBranchId === "all" ? null : selectedBranchId);

      const [v, d, p, t, c] = await Promise.all([
        mockApi.vehicles.getAll(agencyId, effectiveBranchId),
        mockApi.drivers.getAll(agencyId, effectiveBranchId),
        mockApi.packages.getAll(agencyId, effectiveBranchId),
        mockApi.trips.getAll(agencyId, effectiveBranchId),
        mockApi.cash.getAll(agencyId, effectiveBranchId)
      ]);

      const revenue = c.reduce((acc, curr) => acc + (curr.type === "Entrée" ? curr.amount : -curr.amount), 0);

      setStats({
        vehicles: v.length,
        drivers: d.length,
        packages: p.length,
        trips: t.length,
        revenue
      });

      // Calculer les données du graphique (7 derniers jours)
      const last7Days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return {
          dateStr: d.toISOString().split('T')[0],
          label: d.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')
        };
      });

      const chartData = last7Days.map(day => {
        const dayRevenue = c
          .filter(tx => tx.timestamp.split('T')[0] === day.dateStr && tx.type === "Entrée")
          .reduce((acc, curr) => acc + curr.amount, 0);
        return { day: day.label, amount: dayRevenue };
      });

      setRevenueData(chartData);
      setLoading(false);
    };
    loadStats();
  }, [user?.agencyId, user?.branchId, user?.role, selectedBranchId]);

  const StatCard = ({ title, value, icon: Icon, color, description }: any) => (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden relative group hover:border-primary transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color} group-hover:scale-110 transition-transform`}>
          <Icon size={14} />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {typeof value === 'number' && title.includes('Recettes') ? value.toLocaleString() + ' FCFA' : value}
          </div>
        )}
        <p className="text-[10px] text-zinc-500 mt-1 truncate font-medium">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* HEADER INTELLIGENT */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-6 rounded-2xl border border-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldCheck size={120} className="text-primary" />
        </div>
        
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user?.name}
            </h1>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] font-bold">
              {user?.role}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin size={14} className="text-primary" />
            <p className="text-sm font-medium">
              {user?.role === "Admin Succursale" 
                ? `Gestionnaire : Succursale de ${currentBranch?.name || "..."}`
                : "Direction Générale - Vue d'ensemble"}
            </p>
          </div>
        </div>
        
        <div className="relative z-10">
          {user?.role === "Admin Agence" ? (
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-xl border border-border">
              <span className="text-[10px] font-bold text-muted-foreground uppercase ml-2 tracking-widest">Périmètre :</span>
              <Combobox
                options={[
                  { value: "all", label: "Toutes les succursales" },
                  ...branches.map(b => ({ value: b.id, label: b.name }))
                ]}
                value={selectedBranchId}
                onChange={(val) => setSelectedBranchId(val as string)}
                placeholder="Filtrer..."
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Session Active : {currentBranch?.city || "Local"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* STATS SCOPÉES */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Courses actives" 
          value={stats.trips} 
          icon={MapPin} 
          description={user?.role === "Admin Succursale" ? "Trajets au départ de votre site" : "Total agence"}
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Colis en attente" 
          value={stats.packages} 
          icon={Package} 
          description={user?.role === "Admin Succursale" ? "Dans votre dépôt local" : "Flux global colis"}
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          title="Recettes de caisse" 
          value={stats.revenue} 
          icon={TrendingUp} 
          description={user?.role === "Admin Succursale" ? "Performance de votre site" : "Chiffre d'affaires global"}
          color="bg-emerald-500/10 text-emerald-500" 
        />
        <StatCard 
          title="Équipe de terrain" 
          value={stats.drivers} 
          icon={Users} 
          description={user?.role === "Admin Succursale" ? "Vos chauffeurs affectés" : "Total chauffeurs agence"}
          color="bg-zinc-500/10 text-zinc-500" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <TrendingUp size={16} className="text-primary" /> 
              {user?.role === "Admin Succursale" ? "Recettes Locales" : "Recettes Consolidées"}
            </CardTitle>
            <Badge variant="outline" className="text-[10px] font-mono border-border">7 DERNIERS JOURS</Badge>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  tick={{fontSize: 10, fill: 'currentColor'}}
                  className="text-muted-foreground"
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--color-amount)" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Clock size={16} className="text-amber-500" /> Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-1 before:-translate-x-px before:h-full before:w-0.5 before:bg-muted/50">
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="absolute left-0 h-2 w-2 rounded-full bg-primary ring-4 ring-card" />
                    <div className="pl-6">
                      <p className="text-xs font-bold text-foreground">Course créée</p>
                      <p className="text-[10px] text-muted-foreground">Goma → Bukavu</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">5m</span>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="absolute left-0 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-card" />
                    <div className="pl-6">
                      <p className="text-xs font-bold text-foreground">Colis livré</p>
                      <p className="text-[10px] text-muted-foreground">ID: PKG-8291</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">12m</span>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="absolute left-0 h-2 w-2 rounded-full bg-amber-500 ring-4 ring-card" />
                    <div className="pl-6">
                      <p className="text-xs font-bold text-foreground">Nouvelle dépense</p>
                      <p className="text-[10px] text-muted-foreground">Maintenance Carburant</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">45m</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
