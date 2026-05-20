"use client";

import { useState, useEffect } from "react";
import localforage from "localforage";
import { useAuthStore } from "@/store/useAuthStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STORAGE_KEYS, AppUser, Agency } from "@/components/saas-mock";
import { Settings, User, Building2, MapPin, Save, Plus, AlertCircle } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [agencyData, setAgencyData] = useState<Agency | null>(null);
  
  const [userName, setUserName] = useState(user?.name || "");
  const [userPhone, setUserPhone] = useState("");
  const [newBranchName, setNewBranchName] = useState("");

  useEffect(() => {
    const loadSettings = async () => {
      if (user?.agencyId) {
        const agencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
        const match = agencies.find(a => a.id === user.agencyId);
        if (match) setAgencyData(match);

        const users = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
        const found = users.find(u => u.id === user.id);
        if (found?.phone) setUserPhone(found.phone);
      }
    };
    loadSettings();
  }, [user]);

  const handleSaveProfile = async () => {
    const allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
    const updated = allUsers.map(u => u.id === user?.id ? { ...u, name: userName, phone: userPhone } : u);
    await localforage.setItem(STORAGE_KEYS.USERS_LIST, updated);
    alert("Profil personnel mis à jour !");
  };

  const handleAddBranch = async () => {
    if (!agencyData || !newBranchName) return;

    // Protection par paliers d'abonnement
    const branches = agencyData.branches || [];
    if (agencyData.plan === "Basique") {
      alert("Le plan Basique est restreint au site d'exploitation initial. Évoluez vers l'offre Standard pour ajouter d'autres terminaux.");
      return;
    }
    if (agencyData.plan === "Standard" && branches.length >= 3) {
      alert("Le plan Standard limite votre parc à 3 succursales physiques interconnectées. Passez à la licence Premium.");
      return;
    }

    const updatedBranches = [...branches, newBranchName];
    const allAgencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
    const updatedAgencies = allAgencies.map(a => a.id === agencyData.id ? { ...a, branches: updatedBranches } : a);

    await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, updatedAgencies);
    setAgencyData({ ...agencyData, branches: updatedBranches });
    setNewBranchName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings size={20} className="text-primary"/> Paramètres de Configuration
        </h1>
        <p className="text-xs text-zinc-500">Gestion de vos préférences de compte et de vos autorisations logistiques.</p>
      </div>

      {/* ESPACE COMPTE PERSONNEL (Chauffeurs & Admins) */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <User size={14} className="text-primary"/> Identité & Contact Opérationnel
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Nom d'usage sur le réseau</label>
              <Input value={userName} onChange={e => setUserName(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-9" />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400">Téléphone Mobile de terrain</label>
              <Input value={userPhone} onChange={e => setUserPhone(e.target.value)} placeholder="+243..." className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-9" />
            </div>
          </div>
          <Button onClick={handleSaveProfile} size="sm" className="bg-primary text-black font-semibold text-xs h-8 cursor-pointer flex items-center gap-1">
            <Save size={12}/> Sauvegarder mes modifications
          </Button>
        </CardContent>
      </Card>

      {/* ESPACE DIRECTEUR : CONFIGURATION MULTI-SITES AGENT */}
      {user?.role === "Admin Agence" && agencyData && (
        <div className="space-y-6 pt-2">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Building2 size={14} className="text-primary"/> Propriétés de la Licence Agence
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-mono font-bold">
                  FORFAIT {agencyData.plan} ({agencyData.status})
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-2 text-xs text-zinc-400 font-mono">
              <p>• Identifiant Fiscal : {agencyData.id}</p>
              <p>• Expiration de Licence : {agencyData.expiresAt}</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MapPin size={14} className="text-primary"/> Déploiement de Terminaux & Succursales
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2 space-y-4">
              <div className="flex gap-2 max-w-sm">
                <Input value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="Ex: Butembo Dépôt" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-xs h-9" />
                <Button onClick={handleAddBranch} size="sm" className="bg-white text-black font-semibold text-xs h-9 flex items-center gap-1 whitespace-nowrap cursor-pointer">
                  <Plus size={14}/> Connecter le Site
                </Button>
              </div>

              {agencyData.plan !== "Premium" && (
                <p className="text-[11px] text-amber-500 bg-amber-500/10 p-2 rounded-lg max-w-sm flex items-center gap-1 font-mono">
                  <AlertCircle size={12}/> Restriction de l'offre {agencyData.plan} active.
                </p>
              )}

              <div className="space-y-1.5 pt-1">
                <p className="text-xs font-semibold text-zinc-400">Réseau d'agences physiques actives :</p>
                <div className="flex flex-wrap gap-2">
                  {(agencyData.branches || [agencyData.city]).map((branch, i) => (
                    <span key={i} className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-md font-medium text-zinc-700 dark:text-zinc-300">
                      {branch}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}