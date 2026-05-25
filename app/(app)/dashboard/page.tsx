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
  ArrowUpRight
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
    color: "#0ea5e9", // Bleu Ciel vibrant
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    vehicles: 0,
    drivers: 0,
    packages: 0,
    trips: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      const agencyId = user?.agencyId || null;
      const [v, d, p, t, c] = await Promise.all([
        mockApi.vehicles.getAll(agencyId),
        mockApi.drivers.getAll(agencyId),
        mockApi.packages.getAll(agencyId),
        mockApi.trips.getAll(agencyId),
        mockApi.cash.getAll(agencyId)
      ]);

      const revenue = c.reduce((acc, curr) => acc + (curr.type === "Entrée" ? curr.amount : -curr.amount), 0);

      setStats({
        vehicles: v.length,
        drivers: d.length,
        packages: p.length,
        trips: t.length,
        revenue
      });
      setLoading(false);
    };
    loadStats();
  }, [user?.agencyId]);

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">{title}</CardTitle>
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
        {trend && (
          <p className="text-[10px] font-medium text-emerald-500 flex items-center gap-1 mt-1">
            <ArrowUpRight size={10} /> {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">
          Bonjour, {user?.name}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Voici ce qui se passe dans votre agence aujourd'hui.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Courses actives" 
          value={stats.trips} 
          icon={MapPin} 
          trend="+3 cette heure"
          color="bg-blue-500/10 text-blue-500" 
        />
        <StatCard 
          title="Colis en attente" 
          value={stats.packages} 
          icon={Package} 
          trend="+12 nouveaux"
          color="bg-amber-500/10 text-amber-500" 
        />
        <StatCard 
          title="Véhicules" 
          value={stats.vehicles} 
          icon={Car} 
          color="bg-zinc-500/10 text-zinc-500" 
        />
        <StatCard 
          title="Chauffeurs" 
          value={stats.drivers} 
          icon={Users} 
          color="bg-emerald-500/10 text-emerald-500" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" /> Recettes de la semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="day" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="var(--color-amount)" 
                  fillOpacity={1} 
                  fill="url(#colorAmount)" 
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock size={16} className="text-amber-500" /> Activités Récentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 border-l-2 border-primary pl-4 py-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold dark:text-zinc-200">Nouvelle course créée</p>
                    <p className="text-[10px] text-zinc-500">Goma → Bukavu • Il y a 5 min</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-l-2 border-emerald-500 pl-4 py-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold dark:text-zinc-200">Colis livré avec succès</p>
                    <p className="text-[10px] text-zinc-500">ID: PKG-8291 • Il y a 12 min</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-l-2 border-zinc-200 dark:border-zinc-800 pl-4 py-1">
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold dark:text-zinc-200">Caisse : Dépense carburant</p>
                    <p className="text-[10px] text-zinc-500">45,000 FCFA • Il y a 45 min</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
