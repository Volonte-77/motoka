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
import { cn } from "@/lib/utils";

import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  Pie, 
  PieChart, 
  Cell, 
  ResponsiveContainer 
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

const growthData = [
  { month: "Jan", agencies: 2 },
  { month: "Féb", agencies: 5 },
  { month: "Mar", agencies: 8 },
  { month: "Avr", agencies: 12 },
  { month: "Mai", agencies: 15 },
  { month: "Juin", agencies: 22 },
];

const growthConfig = {
  agencies: {
    label: "Nouvelles Agences",
    color: "#10b981", // Vert Émeraude
  },
} satisfies ChartConfig;

const planData = [
  { name: "Premium", value: 45, color: "#10b981" }, // Émeraude
  { name: "Standard", value: 35, color: "#0ea5e9" }, // Bleu Ciel
  { name: "Basique", value: 20, color: "#f59e0b" },  // Ambre
];

const planConfig = {
  Premium: { label: "Premium", color: "#10b981" },
  Standard: { label: "Standard", color: "#0ea5e9" },
  Basique: { label: "Basique", color: "#f59e0b" },
} satisfies ChartConfig;

import apiClient from "@/lib/api-client";

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
      try {
        const [agenciesRes, usersRes] = await Promise.all([
          apiClient.get("/agences"),
          apiClient.get("/admin/users"),
        ]);

        const agencies = agenciesRes.data;
        const usersData = usersRes.data.data || usersRes.data;

        setStats({
          totalAgencies: agencies.length,
          activeAgencies: agencies.filter((a: any) => a.statut_enum === "actif").length,
          totalUsers: Array.isArray(usersData) ? usersData.length : 0,
          systemHealth: "Optimal",
          globalRevenue: "12.4M",
        });
      } catch (error) {
        console.error("Erreur stats super-admin:", error);
      } finally {
        setLoading(false);
      }
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
              <Globe size={16} className="text-primary" /> Croissance du Réseau
            </CardTitle>
            <CardDescription>Évolution des nouvelles agences par mois.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthConfig} className="min-h-[200px] w-full">
              <BarChart data={growthData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="agencies" 
                  fill="var(--color-agencies)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Status des agences par plan */}
        <Card className="md:col-span-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Zap size={16} className="text-amber-500" /> Répartition des Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={planConfig} className="min-h-[200px] w-full">
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              </PieChart>
            </ChartContainer>
            <div className="mt-4 space-y-2">
              {planData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-500">{item.name}</span>
                  </div>
                  <span className="font-bold text-zinc-900 dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <Server size={14} />
          <span>Base de données : 2.4 GB / 10 GB</span>
        </div>
      </div>
    </div>
  );
}
