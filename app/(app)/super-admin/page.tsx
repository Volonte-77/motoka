"use client";

import { useState, useEffect } from "react";
import localforage from "localforage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, LayoutGrid, List } from "lucide-react";
import { Agency, defaultAgencies, SubscriptionPlan, SubscriptionStatus } from "@/components/saas-mock";
import { STORAGE_KEYS } from "@/types";

export default function SuperAdminPage() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Charger ou Initialiser les agences dans localforage
  useEffect(() => {
    const initStorage = async () => {
      let data = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST);
      if (!data) {
        data = defaultAgencies;
        await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, defaultAgencies);
      }
      setAgencies(data);
      setLoading(false);
    };
    initStorage();
  }, []);

  // Action en direct : Modifier l'abonnement d'une agence
  const togglePlan = async (id: string, newPlan: SubscriptionPlan) => {
    const updated = agencies.map(a => a.id === id ? { ...a, plan: newPlan } : a);
    setAgencies(updated);
    await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, updated);
  };

  // Action en direct : Modifier le statut d'accès (Bloquer / Activer l'agence)
  const toggleStatus = async (id: string, currentStatus: SubscriptionStatus) => {
    const nextStatus: SubscriptionStatus = currentStatus === "Actif" ? "Expiré" : "Actif";
    const updated = agencies.map(a => a.id === id ? { ...a, status: nextStatus } : a);
    setAgencies(updated);
    await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, updated);
  };

  if (loading) return <div className="text-sm p-6 text-zinc-400">Chargement du Core SaaS Engine...</div>;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <Shield className="text-primary" size={24}/> Panneau de Contrôle SaaS Global (Propriétaire)
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Supervision des licences agences, états de facturation et quotas d'infrastructures.</p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] p-1">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="h-9 w-9 p-0"
            >
              <List size={16} />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 p-0"
            >
              <LayoutGrid size={16} />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <table className="min-w-full text-left text-sm text-zinc-400">
            <thead className="bg-zinc-900 text-xs uppercase tracking-wide text-zinc-400">
              <tr>
                <th className="px-4 py-3">Agence</th>
                <th className="px-4 py-3">Ville</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Expiration</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200/10">
              {agencies.map((agency) => (
                <tr key={agency.id} className="hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-white">{agency.name}</td>
                  <td className="px-4 py-3 text-zinc-500">{agency.city}</td>
                  <td className="px-4 py-3 text-zinc-500">{agency.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                      agency.status === "Actif" ? "bg-emerald-500/10 text-emerald-400" :
                      agency.status === "Essai" ? "bg-blue-500/10 text-blue-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {agency.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{agency.expiresAt}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => togglePlan(agency.id, agency.plan === "Premium" ? "Standard" : "Premium")} className="text-[10px] h-8 px-2">
                        {agency.plan === "Premium" ? "Standard" : "Premium"}
                      </Button>
                      <Button size="sm" onClick={() => toggleStatus(agency.id, agency.status)} className="text-[10px] h-8 px-2">
                        {agency.status === "Actif" ? "Bloquer" : "Activer"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {agencies.map((agency) => (
            <Card key={agency.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase">{agency.id} · {agency.city}</span>
                  <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">{agency.name}</CardTitle>
                  <p className="text-xs text-zinc-500">{agency.email}</p>
                </div>

                {/* Statut de la licence */}
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                  agency.status === "Actif" ? "bg-emerald-500/10 text-emerald-400" :
                  agency.status === "Essai" ? "bg-blue-500/10 text-blue-400" :
                  "bg-rose-500/10 text-rose-400"
                }`}>
                  {agency.status}
                </span>
              </CardHeader>

              <CardContent className="p-4 pt-2 space-y-4">
                <div className="text-xs text-zinc-500 dark:text-zinc-400 flex justify-between border-t border-b border-zinc-100 dark:border-zinc-800/60 py-2">
                  <span>Offre : <strong className="text-primary">{agency.plan}</strong></span>
                  <span>Expire le : <strong className="text-zinc-700 dark:text-zinc-300">{agency.expiresAt}</strong></span>
                </div>

                {/* Actions rapides du Super Admin */}
                <div className="flex flex-wrap gap-2 pt-1 justify-between items-center">
                  <div className="flex gap-1.5">
                    <Button 
                      onClick={() => togglePlan(agency.id, "Premium")} 
                      size="sm" variant="outline" 
                      className={`text-[10px] h-7 px-2 cursor-pointer ${agency.plan === "Premium" ? "border-primary text-primary" : "border-zinc-200 dark:border-zinc-800"}`}
                    >
                      Set Premium
                    </Button>
                    <Button 
                      onClick={() => togglePlan(agency.id, "Standard")} 
                      size="sm" variant="outline" 
                      className={`text-[10px] h-7 px-2 cursor-pointer ${agency.plan === "Standard" ? "border-primary text-primary" : "border-zinc-200 dark:border-zinc-800"}`}
                    >
                      Set Standard
                    </Button>
                  </div>

                  <Button 
                    onClick={() => toggleStatus(agency.id, agency.status)}
                    size="sm" 
                    className={`h-7 text-xs font-medium cursor-pointer ${agency.status === "Actif" ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                  >
                    {agency.status === "Actif" ? "Couper l'accès" : "Réactiver l'agence"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}