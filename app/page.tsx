"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import localforage from "localforage";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, Zap, CheckCircle, KeyRound, UserPlus, LogIn } from "lucide-react";
import { STORAGE_KEYS, AppUser, Agency, SubscriptionPlan, defaultAgencies } from "@/components/saas-mock";

export default function LandingPage() {
  const router = useRouter();
  const loginStore = useAuthStore((state) => state.login);

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSeeded, setIsSeeded] = useState(false);

  // Inscription
  const [regAgencyName, setRegAgencyName] = useState("");
  const [regAdminName, setRegAdminName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regPlan, setRegPlan] = useState<SubscriptionPlan>("Standard");

  // Ensemencer localforage avec l'existant au premier chargement
  useEffect(() => {
    const seedDatabase = async () => {
      const currentAgencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST);
      if (!currentAgencies || currentAgencies.length === 0) {
        await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, defaultAgencies);
      }

      const currentUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST);
      if (!currentUsers || currentUsers.length === 0) {
        // Injection d'utilisateurs par défaut pour vos tests de rôles
        const initialUsers: AppUser[] = [
          { id: "USR-SUPER", name: "Alpha Volenium", email: "admin@motoka.cd", password: "admin", role: "Super Admin SaaS", agencyId: null, siteAccess: "Global" },
          { id: "USR-KASONGO", name: "Papa Kasongo", email: "kasongo@mail.cd", password: "password", role: "Admin Agence", agencyId: "AGE-001", siteAccess: "Global" },
          { id: "USR-CHAUFFEUR", name: "Chauffeur Kakule", email: "driver@mail.cd", password: "driver", role: "Chauffeur", agencyId: "AGE-001", siteAccess: "Bus C01" }
        ];
        await localforage.setItem(STORAGE_KEYS.USERS_LIST, initialUsers);
      }

      setIsSeeded(true);
    };
    seedDatabase();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!isSeeded) {
      setLoginError("Initialisation en cours, veuillez réessayer dans un instant.");
      return;
    }

    const allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
    const foundUser = allUsers.find(u => u.email === loginEmail && u.password === loginPassword);

    if (foundUser) {
      await loginStore({
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        agencyId: foundUser.agencyId,
        siteAccess: foundUser.siteAccess
      });
      setIsLoginOpen(false);
      
      // Routeur applicatif adaptif : Super Admin utilise le même espace admin partagé
      if (foundUser.role === "Chauffeur") router.push("/courses");
      else router.push("/dashboard");
    } else {
      setLoginError("Identifiants incorrects ou agence introuvable.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAgencyId = `AGE-${Math.floor(Math.random() * 900) + 100}`;
    const newUserId = `USR-${Math.floor(Math.random() * 900) + 100}`;

    const newAgency: Agency = {
      id: newAgencyId,
      name: regAgencyName,
      email: regEmail,
      city: regCity,
      plan: regPlan,
      status: "Actif",
      expiresAt: "2026-12-31",
      createdAt: "2026-05-20",
      branches: [regCity + " Direction"]
    };

    const newAdmin: AppUser = {
      id: newUserId,
      name: regAdminName,
      email: regEmail,
      password: regPassword,
      role: "Admin Agence",
      agencyId: newAgencyId,
      siteAccess: "Global"
    };

    const agencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
    await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, [...agencies, newAgency]);

    const users = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
    await localforage.setItem(STORAGE_KEYS.USERS_LIST, [...users, newAdmin]);

    await loginStore({
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      role: newAdmin.role,
      agencyId: newAgencyId,
      siteAccess: "Global"
    });

    setIsRegisterOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col justify-between p-6 antialiased">
      <header className="max-w-6xl w-full mx-auto flex justify-between items-center py-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-black p-1.5 rounded-lg font-black text-sm">M</div>
          <span className="text-xl font-bold tracking-tight">MOTOKA <span className="text-primary text-xs font-mono">SaaS</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="text-xs font-semibold h-9 text-zinc-400 hover:text-white cursor-pointer">
            Portail d'accès
          </Button>
          <Button onClick={() => setIsRegisterOpen(true)} className="bg-primary text-black hover:opacity-95 text-xs font-semibold h-9 cursor-pointer">
            Déployer votre Agence
          </Button>
        </div>
      </header>

      <main className="max-w-3xl w-full mx-auto text-center my-auto py-16 space-y-6">
        <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs py-1 px-3 rounded-full font-mono">
          Ecosystem Logistics v2
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none">
          L'infrastructure numérique du transport routier en <span className="text-primary">RDC</span>.
        </h1>
        <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Gérez votre flotte multi-sites, vos billetteries unifiées, et vos audits de caisse en temps réel.
        </p>
        <div className="pt-2">
          <Button onClick={() => setIsRegisterOpen(true)} className="bg-white text-black font-bold h-11 px-6 text-xs rounded-xl flex items-center gap-2 cursor-pointer hover:bg-zinc-200">
            Créer un compte Agence <ArrowRight size={14}/>
          </Button>
        </div>
      </main>

      {/* MODAL CONNEXION */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-[#121214] border border-zinc-800 text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <KeyRound className="text-primary" size={18}/> Authentification
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
            {loginError && <p className="text-xs text-rose-500 bg-rose-500/10 p-2 rounded-lg">{loginError}</p>}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Email professionnel</label>
              <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="nom@kasongo.cd" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Mot de passe</label>
              <Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
            </div>
            <Button type="submit" disabled={!isSeeded} className="w-full bg-primary text-black font-bold text-xs h-10 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60">
              <LogIn size={14} className="mr-1"/> Se connecter
            </Button>
          </form>
          <div className="text-[10px] text-zinc-500 border-t border-zinc-800 mt-2 pt-2 space-y-1 font-mono">
            <p>• Super Admin : admin@motoka.cd / admin</p>
            <p>• Agence Admin : kasongo@mail.cd / password</p>
            <p>• Chauffeur : driver@mail.cd / driver</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL INSCRIPTION AGENCE */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="bg-[#121214] border border-zinc-800 text-white max-w-md rounded-xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="text-primary" size={18}/> Formulaire d'Adhésion SaaS
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Raison Sociale de l'Agence</label>
              <Input value={regAgencyName} onChange={e => setRegAgencyName(e.target.value)} placeholder="Ex: Volenium Trans" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Nom Administrateur</label>
                <Input value={regAdminName} onChange={e => setRegAdminName(e.target.value)} placeholder="Votre nom" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Ville d'origine</label>
                <Input value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="Ex: Beni" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Email de contact</label>
                <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="admin@volenium.cd" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-zinc-400">Mot de passe de sécurité</label>
                <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800 text-xs text-white" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400 block">Niveau de licence</label>
              <div className="grid grid-cols-3 gap-2">
                {(["Basique", "Standard", "Premium"] as const).map((plan) => (
                  <div
                    key={plan} onClick={() => setRegPlan(plan)}
                    className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all ${
                      regPlan === plan ? "border-primary bg-primary/5 text-primary" : "border-zinc-800 bg-zinc-900/50 text-zinc-400"
                    }`}
                  >
                    <p className="text-xs font-bold">{plan}</p>
                    <p className="text-[9px] font-mono mt-0.5 text-zinc-500">{plan === "Basique" ? "50$" : plan === "Standard" ? "120$" : "250$"}/m</p>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-primary text-black font-semibold text-xs h-10 cursor-pointer">
              <UserPlus size={14} className="mr-1"/> Déployer mon infrastructure
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="text-center text-xs text-zinc-600 py-2 border-t border-zinc-900">
        © 2026 Motoka Ecosystem. Tous droits réservés.
      </footer>
    </div>
  );
}