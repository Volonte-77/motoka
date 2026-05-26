"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, Landmark, TrendingUp, Download, Building2, 
  ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw,
  Eye, FileText, Calendar as CalendarIcon, Printer,
  Table as TableIcon, PieChart as PieIcon, CheckCircle2,
  AlertCircle, ArrowRight
} from "lucide-react";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";
import { useAuthStore } from "@/store/useAuthStore";
import { mockApi } from "@/lib/mock-api";
import { Branch } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// --- CONFIGURATION DES COULEURS DES GRAPHIQUES ---
const chartConfig = {
  revenu: { label: "Recettes", color: "#10b981" },
  depenses: { label: "Dépenses", color: "#f43f5e" },
} satisfies ChartConfig;

export default function RapportsPage() {
  const { user } = useAuthStore();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | "all">("all");
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState<"financier" | "operationnel">("financier");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const init = async () => {
      if (user?.agencyId) {
        const branchList = await mockApi.agencies.getBranches(user.agencyId);
        setBranches(branchList);
        setLoading(false);
      }
    };
    init();
  }, [user]);

  // --- DONNÉES SIMULÉES POUR LE PREVIEW ---
  const reportData = useMemo(() => ({
    agencyName: "Kasongo Express",
    branchName: selectedBranchId === "all" ? "Toutes les succursales" : branches.find(b => b.id === selectedBranchId)?.name || "Siège Social",
    date: new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' }),
    transactions: [
      { id: "TX-001", desc: "Vente billets Goma-Bukavu", cat: "Billet", amount: 450000, type: "Entrée" },
      { id: "TX-002", desc: "Maintenance Bus Coaster", cat: "Entretien", amount: 125000, type: "Sortie" },
      { id: "TX-003", desc: "Frais de douane Fret", cat: "Logistique", amount: 85000, type: "Sortie" },
      { id: "TX-004", desc: "Recette Colis Express", cat: "Fret", amount: 210000, type: "Entrée" },
    ]
  }), [selectedBranchId, branches]);

  const totals = reportData.transactions.reduce((acc, curr) => {
    if (curr.type === "Entrée") acc.in += curr.amount;
    else acc.out += curr.amount;
    return acc;
  }, { in: 0, out: 0 });

  // --- COMPOSANT DE PREVIEW PROFESSIONNEL ---
  const ReportPreview = () => (
    <div className="bg-zinc-100 dark:bg-zinc-950 p-4 md:p-8 rounded-2xl border border-border shadow-inner min-h-[600px] animate-in fade-in zoom-in-95 duration-300">
      {/* Simulation d'une feuille A4 */}
      <div className="bg-white text-zinc-900 mx-auto max-w-[800px] shadow-2xl p-10 min-h-[1000px] flex flex-col font-sans border-t-8 border-primary">
        {/* Header Papier à en-tête */}
        <div className="flex justify-between items-start border-b-2 border-zinc-100 pb-8 mb-8">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">{reportData.agencyName}</h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Système de Gestion de Transport</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold uppercase tracking-tight">RAPPORT {reportType.toUpperCase()}</h3>
            <p className="text-[10px] text-zinc-500 font-medium mt-1 italic">Réf: MOT-REP-{Date.now().toString().slice(-6)}</p>
          </div>
        </div>

        {/* Info périmètre */}
        <div className="grid grid-cols-2 gap-8 mb-10 bg-zinc-50 p-4 rounded-lg border border-zinc-100">
          <div className="space-y-1">
            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Unité d'Exploitation</p>
            <p className="text-sm font-bold text-zinc-800">{reportData.branchName}</p>
          </div>
          <div className="space-y-1 text-right">
            <p className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Période du Rapport</p>
            <p className="text-sm font-bold text-zinc-800">{reportData.date}</p>
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-xl border-2 border-emerald-500/20 bg-emerald-50/50">
            <p className="text-[8px] uppercase font-black text-emerald-600 mb-1">Total Recettes</p>
            <p className="text-lg font-black text-emerald-700">{totals.in.toLocaleString()} FCFA</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-rose-500/20 bg-rose-50/50">
            <p className="text-[8px] uppercase font-black text-rose-600 mb-1">Total Dépenses</p>
            <p className="text-lg font-black text-rose-700">{totals.out.toLocaleString()} FCFA</p>
          </div>
          <div className="p-4 rounded-xl border-2 border-zinc-900 bg-zinc-900">
            <p className="text-[8px] uppercase font-black text-zinc-400 mb-1">Résultat Net</p>
            <p className="text-lg font-black text-white">{(totals.in - totals.out).toLocaleString()} FCFA</p>
          </div>
        </div>

        {/* Tableau Comptable */}
        <div className="flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-100 text-left border-y border-zinc-200">
                <th className="py-3 px-2 text-[9px] font-black uppercase text-zinc-600">ID</th>
                <th className="py-3 px-2 text-[9px] font-black uppercase text-zinc-600">Désignation de l'opération</th>
                <th className="py-3 px-2 text-[9px] font-black uppercase text-zinc-600">Catégorie</th>
                <th className="py-3 px-2 text-[9px] font-black uppercase text-zinc-600 text-right">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody>
              {reportData.transactions.map((t, i) => (
                <tr key={i} className="border-b border-zinc-100">
                  <td className="py-3 px-2 text-[10px] font-mono font-bold text-zinc-400">{t.id}</td>
                  <td className="py-3 px-2 text-[11px] font-bold text-zinc-800">{t.desc}</td>
                  <td className="py-3 px-2 text-[9px] font-bold uppercase text-zinc-500 bg-zinc-50 w-fit rounded-full px-2 py-0.5">{t.cat}</td>
                  <td className={cn(
                    "py-3 px-2 text-[11px] font-black text-right",
                    t.type === "Entrée" ? "text-emerald-600" : "text-rose-600"
                  )}>
                    {t.type === "Entrée" ? "+" : "-"} {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Certifié */}
        <div className="mt-20 pt-8 border-t border-zinc-200 flex justify-between items-end">
          <div className="flex items-center gap-3 grayscale opacity-50">
            <ShieldCheck size={40} className="text-primary" />
            <div className="border-l border-zinc-300 pl-3">
              <p className="text-[8px] font-black text-zinc-800 uppercase tracking-widest leading-none">Document Certifié</p>
              <p className="text-[8px] text-zinc-500 mt-1 uppercase">Généré par Motoka BI Engine v2.0</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-bold text-zinc-400 uppercase mb-4">Visa Direction Financière</p>
            <div className="w-32 h-16 border-2 border-zinc-100 rounded-lg flex items-center justify-center italic text-zinc-300 text-xs font-serif">Signature & Cachet</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. PANNEAU DE CONTRÔLE ET GÉNÉRATION */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch animate-in fade-in slide-in-from-top-4 duration-700">
        
        {/* Config du Rapport */}
        <Card className="lg:w-1/3 border-border bg-card shadow-xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border bg-muted/30">
            <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase tracking-tighter">Moteur Analytique</h1>
            <p className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-widest">Configuration du Bilan</p>
          </div>
          
          <CardContent className="p-6 space-y-6 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Périmètre d'analyse</label>
                <div className="grid grid-cols-1 gap-2">
                  {user?.role === "Admin Agence" && (
                    <Button 
                      variant={selectedBranchId === "all" ? "default" : "outline"} 
                      onClick={() => setSelectedBranchId("all")}
                      className="h-10 text-xs font-bold uppercase tracking-tight justify-start gap-2"
                    >
                      <Building2 size={16} /> Vue Agence Globale
                    </Button>
                  )}
                  {branches.map(b => (
                    <Button 
                      key={b.id}
                      variant={selectedBranchId === b.id ? "default" : "outline"} 
                      onClick={() => setSelectedBranchId(b.id)}
                      className="h-10 text-xs font-bold uppercase tracking-tight justify-start gap-2"
                    >
                      <MapPin size={16} className={selectedBranchId === b.id ? "text-white" : "text-primary"} /> {b.name}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Type de Document</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant={reportType === "financier" ? "secondary" : "ghost"}
                    onClick={() => setReportType("financier")}
                    className={cn("h-16 flex-col gap-1 border-none", reportType === "financier" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                  >
                    <Landmark size={20} />
                    <span className="text-[9px] font-black uppercase">Financier</span>
                  </Button>
                  <Button 
                    variant={reportType === "operationnel" ? "secondary" : "ghost"}
                    onClick={() => setReportType("operationnel")}
                    className={cn("h-16 flex-col gap-1 border-none", reportType === "operationnel" ? "bg-primary/10 text-primary" : "text-muted-foreground")}
                  >
                    <Car size={20} />
                    <span className="text-[9px] font-black uppercase">Mouvements</span>
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <Button 
                onClick={() => setIsPreviewOpen(true)}
                className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-black uppercase text-xs tracking-widest h-12 gap-2 shadow-lg"
              >
                <Eye size={16} /> Prévisualiser le Bilan
              </Button>
              {isPreviewOpen && (
                <Button 
                  variant="outline" 
                  className="w-full border-primary/50 text-primary font-black uppercase text-xs tracking-widest h-12 gap-2 hover:bg-primary/5"
                >
                  <Download size={16} /> Télécharger PDF (A4)
                </Button>
              )}
            </div>
          </CardContent>

          <div className="p-4 bg-muted/50 border-t border-border flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Mise à jour en temps réel des données</p>
          </div>
        </Card>

        {/* 2. ZONE DE PREVIEW / VISUALISATION */}
        <div className="lg:w-2/3 flex flex-col gap-6">
          {!isPreviewOpen ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <Card className="border-border bg-card shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                    <PieIcon size={14} className="text-primary" /> Répartition Revenus
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center text-center opacity-20 space-y-4">
                    <TrendingUp size={48} />
                    <p className="text-xs font-bold uppercase tracking-widest">Générez une prévisualisation<br/>pour voir les analytiques</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-sm flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase font-black text-muted-foreground tracking-widest flex items-center gap-2">
                    <TableIcon size={14} className="text-primary" /> Audit de Caisse
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center space-y-4 p-8">
                  <div className="space-y-4">
                    <div className="h-2 bg-muted rounded-full w-full" />
                    <div className="h-2 bg-muted rounded-full w-[80%]" />
                    <div className="h-2 bg-muted rounded-full w-[60%]" />
                    <div className="h-2 bg-muted rounded-full w-[90%]" />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center font-medium italic mt-4">Sélectionnez les filtres pour extraire le grand livre comptable.</p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <ReportPreview />
          )}
        </div>
      </div>

      {/* 3. GUIDE D'UTILISATION PROFESSIONNEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10">
          <CheckCircle2 size={18} className="text-primary mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground leading-none">Format Certifié</p>
            <p className="text-[10px] text-muted-foreground mt-1">Tous les exports respectent les normes comptables OHADA standard.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <AlertCircle size={18} className="text-amber-500 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground leading-none">Vérification Requise</p>
            <p className="text-[10px] text-muted-foreground mt-1">Veuillez prévisualiser le document avant toute impression officielle.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
          <Printer size={18} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-foreground leading-none">Prêt pour Impression</p>
            <p className="text-[10px] text-muted-foreground mt-1">Optimisé pour les formats A4 portrait avec marges de reliure.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
