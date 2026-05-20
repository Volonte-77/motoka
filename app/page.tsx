"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import localforage from "localforage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Car, Building2, Shield, Users, ArrowRight, Zap, CheckCircle, KeyRound } from "lucide-react";
import { STORAGE_KEYS, UserRole, SessionUser, Agency } from "@/components/saas-mock";

export default function LandingHubPage() {
  const router = useRouter();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"Basique" | "Standard" | "Premium">("Standard");
  
  // Formulaires
  const [agencyName, setAgencyName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [agencyCity, setAgencyCity] = useState("");

  // Simulation de connexion rapide pour les tests de rôles
  const handleFastLogin = async (role: UserRole, agencyNameStr: string, site: string) => {
    const mockUser: SessionUser = {
      id: `USR-${Math.floor(Math.random() * 900) + 100}`,
      name: `${role} (${agencyNameStr})`,
      email: `${role.toLowerCase().replace(" ", "")}@test.cd`,
      role: role,
      agencyId: role === "Super Admin SaaS" ? null : "AGE-101",
      siteAccess: site
    };

    // Sauvegarde de la session active dans localforage
    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, mockUser);
    
    // Redirection vers le cœur de l'application
    router.push("/settings"); // On redirige temporairement vers settings pour valider l'UI
  };

  // Traitement de l'inscription d'une nouvelle agence
  const handleRegisterAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName || !adminEmail || !agencyCity) return;

    const newAgencyId = `AGE-${Math.floor(Math.random() * 900) + 100}`;
    
    // 1. Créer l'agence
    const newAgency: Agency = {
      id: newAgencyId,
      name: agencyName,
      email: adminEmail,
      city: agencyCity,
      plan: selectedPlan,
      status: "Actif",
      expiresAt: "2026-12-31",
      createdAt: "2026-05-20"
    };

    // 2. Récupérer la liste existante des agences et pousser la nouvelle
    const existingAgencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
    await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, [...existingAgencies, newAgency]);

    // 3. Ouvrir directement la session en tant qu'Admin de cette nouvelle agence
    const newAdminUser: SessionUser = {
      id: "USR-001",
      name: `Directeur ${agencyName}`,
      email: adminEmail,
      role: "Admin Agence",
      agencyId: newAgencyId,
      siteAccess: "Global"
    };

    await localforage.setItem(STORAGE_KEYS.CURRENT_SESSION, newAdminUser);
    setIsRegisterOpen(false);
    router.push("/utilisateurs"); // Redirection vers sa gestion d'abonnement
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-6 antialiased selection:bg-primary selection:text-black">
      
      {/* 1. BRANDING / HEADER */}
      <header className="max-w-6xl w-full mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-black p-1.5 rounded-lg font-black tracking-tighter text-sm">M</div>
          <span className="text-xl font-bold tracking-tight">MOTOKA <span className="text-primary text-xs font-mono font-bold">SaaS v2</span></span>
        </div>
        <Button 
          onClick={() => setIsRegisterOpen(true)}
          className="bg-primary text-black hover:opacity-95 text-xs font-semibold h-9 cursor-pointer"
        >
          Déployer votre Agence <ArrowRight size={14} className="ml-1"/>
        </Button>
      </header>

      {/* 2. MAIN HERO & ACTION HUB */}
      <main className="max-w-4xl w-full mx-auto my-auto py-12 grid gap-10 md:grid-cols-2 items-center">
        <div className="space-y-6">
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs py-1 px-3 rounded-full font-mono">
            Système d'Exploitation Logistique Multi-Sites
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Pilotez votre flotte de transport partout en <span className="text-primary">RDC</span>.
          </h1>
          <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
            Une infrastructure cloud unique pour centraliser vos guichets, sécuriser vos colis par OTP, et auditer vos revenus en temps réel depuis n'importe quelle succursale.
          </p>
        </div>

        {/* PANNEAU DE CONNEXION RAPIDE (SIMULATION DE TERRAIN) */}
        <Card className="border-zinc-800 bg-[#121214] p-6 space-y-4 shadow-2xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <KeyRound className="text-primary" size={18}/> Portail d'Authentification
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Sélectionnez un profil pour simuler le comportement du routeur applicatif.</p>
          </div>

          <div className="space-y-2 pt-2">
            <button 
              onClick={() => handleFastLogin("Super Admin SaaS", "Motoka Core", "Global")}
              className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-primary/50 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Shield size={16} className="text-primary"/>
                <div>
                  <p className="text-zinc-200">Super Admin SaaS</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Contrôle global des licences</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-zinc-600"/>
            </button>

            <button 
              onClick={() => handleFastLogin("Admin Agence", "Kasongo Express", "Global")}
              className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-primary/50 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Building2 size={16} className="text-blue-400"/>
                <div>
                  <p className="text-zinc-200">Admin Agence (Maison Kasongo)</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Vue financière consolidée multi-sites</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-zinc-600"/>
            </button>

            <button 
              onClick={() => handleFastLogin("Dispatcher / Opérateur", "Kasongo Express", "Beni Dépôt")}
              className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-primary/50 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Users size={16} className="text-emerald-400"/>
                <div>
                  <p className="text-zinc-200">Opérateur de Guichet</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Restreint au site de : Beni Dépôt</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-zinc-600"/>
            </button>

            <button 
              onClick={() => handleFastLogin("Chauffeur", "Kasongo Express", "Bus C042")}
              className="w-full text-left p-3 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-primary/50 transition-all flex items-center justify-between text-xs font-medium cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Car size={16} className="text-amber-400"/>
                <div>
                  <p className="text-zinc-200">Chauffeur Routier</p>
                  <p className="text-[10px] text-zinc-500 font-mono">Feuille de route uniquement</p>
                </div>
              </div>
              <ArrowRight size={14} className="text-zinc-600"/>
            </button>
          </div>
        </Card>
      </main>

      {/* 3. MODAL DE CRÉATION D'AGENCE / PROCES DE SOUSCRIPTION */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="bg-[#121214] border border-zinc-800 text-white max-w-lg rounded-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Building2 className="text-primary"/> Déployer une nouvelle Agence
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Remplissez les informations de votre entreprise et sélectionnez votre plan de licence d'exploitation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRegisterAgency} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Nom de l'Agence</label>
                <Input 
                  placeholder="Ex: Volenium Express" 
                  value={agencyName} onChange={e => setAgencyName(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-xs text-white" required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-400">Ville du Siège Social</label>
                <Input 
                  placeholder="Ex: Goma" 
                  value={agencyCity} onChange={e => setAgencyCity(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 text-xs text-white" required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Email du Directeur (Admin)</label>
              <Input 
                type="email" placeholder="directeur@volenium.cd" 
                value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                className="bg-zinc-900 border-zinc-800 text-xs text-white" required
              />
            </div>

            {/* SÉLECTEUR DE FORFAIT EN DIRECT DANS LE FORMULAIRE */}
            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-zinc-400 block">Sélectionnez votre niveau d'infrastructure</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Basique", "Standard", "Premium"] as const).map((plan) => (
                  <div
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-3 rounded-lg border text-center cursor-pointer transition-all ${
                      selectedPlan === plan 
                        ? "border-primary bg-primary/5 text-primary" 
                        : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    <p className="text-xs font-bold">{plan}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {plan === "Basique" ? "50$" : plan === "Standard" ? "120$" : "250$"} / m
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Avantages du plan sélectionné */}
            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-[11px] text-zinc-400 space-y-1.5">
              <p className="font-semibold text-zinc-300 flex items-center gap-1">
                <Zap size={12} className="text-primary fill-primary"/> Inclus dans le Forfait {selectedPlan} :
              </p>
              {selectedPlan === "Basique" && (
                <>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> 1 seul site physique d'exploitation</p>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> Max 3 comptes Opérateurs de guichet</p>
                </>
              )}
              {selectedPlan === "Standard" && (
                <>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> Jusqu'à 3 sites physiques interconnectés</p>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> Suivi de fret automatisé avec alertes SMS</p>
                </>
              )}
              {selectedPlan === "Premium" && (
                <>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> **Nombre de sites illimité** partout en RDC</p>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> Authentification de sécurité par **OTP** Colis</p>
                  <p className="flex items-center gap-1.5"><CheckCircle size={10} className="text-primary"/> Consolidation financière multi-sites automatisée</p>
                </>
              )}
            </div>

            <Button type="submit" className="w-full bg-primary text-black font-semibold text-xs h-10 cursor-pointer">
              Valider l'adhésion et ouvrir la session
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* FOOTER */}
      <footer className="text-center text-xs text-zinc-600 py-4 border-t border-zinc-900">
        © 2026 Motoka Ecosystem · Solution SaaS pour l'excellence logistique.
      </footer>
    </div>
  );
}