"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { 
  BarChart3, Landmark, TrendingUp, Download, Building2, 
  ArrowDownLeft, ArrowUpRight, ShieldCheck, RefreshCw 
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
  Cell
} from "recharts";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent,
  ChartConfig
} from "@/components/ui/chart";

// 1. Définition des styles pour le Rapport PDF Professionnel Clean
const pdfStyles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { borderBottomWidth: 1, borderBottomColor: "#e4e4e7", paddingBottom: 20, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: "bold", color: "#09090b" },
  subtitle: { fontSize: 10, color: "#71717a", marginTop: 5 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: "bold", color: "#18181b", marginBottom: 10 },
  grid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  kpiCard: { padding: 12, borderWidth: 1, borderColor: "#e4e4e7", borderRadius: 6, width: "30%" },
  kpiLabel: { fontSize: 9, color: "#71717a", textTransform: "uppercase" },
  kpiValue: { fontSize: 14, fontWeight: "bold", marginTop: 4, color: "#0f766e" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f4f4f5", paddingVertical: 6 },
  tableHeader: { backgroundColor: "#f4f4f5", fontWeight: "bold" },
  tableCol: { fontSize: 10, color: "#27272a", width: "25%" }
});

// Le Composant du Document PDF à générer
const FinancialReportDoc = ({ agencyName, site, data }: any) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.title}>Rapport Financier — {agencyName}</Text>
        <Text style={pdfStyles.subtitle}>Périmètre : {site} · Généré le {new Date().toLocaleDateString()} en 2026</Text>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Indicateurs Clés de Performance</Text>
        <View style={pdfStyles.grid}>
          <View style={pdfStyles.kpiCard}>
            <Text style={pdfStyles.kpiLabel}>Recettes Totales</Text>
            <Text style={pdfStyles.kpiValue}>{data.revenu} USD</Text>
          </View>
          <View style={pdfStyles.kpiCard}>
            <Text style={pdfStyles.kpiLabel}>Dépenses Opérationnelles</Text>
            <Text style={[pdfStyles.kpiValue, { color: "#be123c" }]}>{data.depenses} USD</Text>
          </View>
          <View style={pdfStyles.kpiCard}>
            <Text style={pdfStyles.kpiLabel}>Bénéfice Net</Text>
            <Text style={[pdfStyles.kpiValue, { color: "#2563eb" }]}>{data.revenu - data.depenses} USD</Text>
          </View>
        </View>
      </View>

      <View style={pdfStyles.section}>
        <Text style={pdfStyles.sectionTitle}>Répartition du Volume d'activité</Text>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol}>Flux Passagers</Text>
          <Text style={pdfStyles.tableCol}>{data.passagers} Personnes</Text>
        </View>
        <View style={pdfStyles.tableRow}>
          <Text style={pdfStyles.tableCol}>Flux Colis / Fret</Text>
          <Text style={pdfStyles.tableCol}>{data.colis} Pièces</Text>
        </View>
      </View>
    </Page>
  </Document>
);

const chartConfig = {
  revenu: {
    label: "Revenu",
    color: "hsl(var(--primary))",
  },
  depenses: {
    label: "Dépenses",
    color: "#f43f5e",
  },
} satisfies ChartConfig;

export default function RapportsPage() {
  const [selectedSite, setSelectedSite] = useState<"Global" | "Goma Centre" | "Beni Antenne">("Global");

  // Données financières simulées par site (Logique d'affichage intelligente)
  const stats = {
    Global: { revenu: 14850, depenses: 4320, passagers: 340, colis: 189 },
    "Goma Centre": { revenu: 9200, depenses: 2100, passagers: 210, colis: 110 },
    "Beni Antenne": { revenu: 5650, depenses: 2220, passagers: 130, colis: 79 }
  };

  const activeData = stats[selectedSite];

  const compareData = [
    { name: "Global", revenu: stats.Global.revenu, depenses: stats.Global.depenses },
    { name: "Goma", revenu: stats["Goma Centre"].revenu, depenses: stats["Goma Centre"].depenses },
    { name: "Beni", revenu: stats["Beni Antenne"].revenu, depenses: stats["Beni Antenne"].depenses },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Centre de Rapports & Analytique</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Consolidation financière multi-sites, bilans de fret et performance du parc.</p>
        </div>
        
        {/* Sélecteur intelligent de site */}
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-[#121214] p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 self-start sm:self-auto">
          {(["Global", "Goma Centre", "Beni Antenne"] as const).map((site) => (
            <Button
              key={site}
              variant={selectedSite === site ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSite(site)}
              className="text-xs h-8 rounded-lg cursor-pointer transition-all"
            >
              <Building2 size={13} className="mr-1 text-zinc-400"/> {site}
            </Button>
          ))}
        </div>
      </div>

      {/* Cartes financières intelligentes consolidées */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">Volume d'Affaires ({selectedSite})</span>
            <div className="flex items-baseline justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">{activeData.revenu.toLocaleString()} $</h2>
              <span className="text-emerald-500 text-xs font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <TrendingUp size={12}/> +14%
              </span>
            </div>
            <p className="text-xs text-zinc-500">Recettes brutes cumulées perçues.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">Charges & Dépenses</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-rose-500">{activeData.depenses.toLocaleString()} $</h2>
            <p className="text-xs text-zinc-500">Frais de carburant, maintenance et imprévus.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-5 space-y-2">
            <span className="text-xs text-zinc-400 uppercase font-medium tracking-wider block">Marge Net Générée</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary">{(activeData.revenu - activeData.depenses).toLocaleString()} $</h2>
            <p className="text-xs text-zinc-500">Bénéfice direct reversé sur le compte central.</p>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques d'exploitation en grille cyber-précise */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Comparatif Performance Sites</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <BarChart data={compareData}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="revenu" fill="var(--color-revenu)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" fill="var(--color-depenses)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* BLOC ACTIONS DE TÉLÉCHARGEMENT PDF INDUSTRIEL */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Génération de documents légaux</CardTitle>
            <CardDescription className="text-xs">Exportez instantanément le livre comptable certifié pour ce site au format PDF A4 standardisé.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <PDFDownloadLink
              document={<FinancialReportDoc agencyName="Kasongo Transport" site={selectedSite} data={activeData} />}
              fileName={`Rapport_${selectedSite}_2026.pdf`}
            >
              {({ loading }) => (
                <Button disabled={loading} className="w-full bg-zinc-900 dark:bg-white text-white dark:text-black font-medium flex items-center justify-center gap-2 cursor-pointer h-11 hover:opacity-90 transition-opacity">
                  <Download size={16} />
                  {loading ? "Génération du PDF comptable..." : "Télécharger le Bilan PDF Certifié (A4)"}
                </Button>
              )}
            </PDFDownloadLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
