"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowRight, Zap, CheckCircle, KeyRound, UserPlus, LogIn, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";
import apiClient from "@/lib/api-client";
import { getHomeRouteByRole } from "@/lib/routing-middleware";
import { toast } from "sonner";

export default function LandingPage() {
  const router = useRouter();
  const { loginReel, login, loading: authLoading } = useAuthStore();

  // Modals
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Inscription
  const [regAgencyName, setRegAgencyName] = useState("");
  const [regAdminName, setRegAdminName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCity, setRegCity] = useState("");
  const [regTelephone, setRegTelephone] = useState("");
  const [regPlan, setRegPlan] = useState<string>("starter");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      await loginReel(loginEmail.trim(), loginPassword.trim());
      const user = useAuthStore.getState().user;
      if (user) {
        setIsLoginOpen(false);
        router.push(getHomeRouteByRole(user.role));
      }
    } catch (error: any) {
      setLoginError(error.message || "Identifiants incorrects.");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiClient.post("/register-agence", {
        agence_nom: regAgencyName,
        agence_email: regEmail,
        agence_telephone: regTelephone,
        agence_adresse: regCity,
        admin_name: regAdminName,
        admin_email: regEmail,
        admin_password: regPassword,
        admin_telephone: regTelephone,
        plan_enum: regPlan
      });

      const { admin, token } = response.data;
      
      // Auto-login après inscription
      const mapRole = (role: string) => {
        if (role === 'superAdmin') return "Super Admin SaaS";
        if (role === 'adminAgence') return "Admin Agence";
        return "Client";
      };

      await login({
        id: admin.id.toString(),
        name: admin.name,
        email: admin.email,
        role: mapRole(admin.role_enum) as any,
        agencyId: admin.Idagence.toString(),
        branchId: null,
        siteAccess: "Global",
        token: token
      } as any);

      toast.success("Votre agence a été créée avec succès !");
      setIsRegisterOpen(false);
      router.push("/dashboard");
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur lors de la création de l'agence";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-50 flex flex-col justify-between p-6 antialiased transition-colors duration-200 relative overflow-hidden">
      {/* Effets de fond Premium */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-50 dark:opacity-100">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/5 dark:bg-primary/10 rounded-[100%] blur-[120px]" />
      </div>

      <header className="max-w-6xl w-full mx-auto flex justify-between items-center py-4 relative z-10">
        <Logo size={40} />
        <div className="flex items-center gap-3">
          <Button onClick={() => setIsLoginOpen(true)} variant="ghost" className="text-xs font-semibold h-9 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer">
            Portail d'accès
          </Button>
          <Button onClick={() => setIsRegisterOpen(true)} className="bg-primary text-white hover:opacity-90 text-xs font-semibold h-9 cursor-pointer shadow-sm shadow-primary/20">
            Déployer votre Agence
          </Button>
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto text-center my-auto py-16 space-y-10 relative z-10">
        <div className="flex justify-center">
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] py-1 px-4 rounded-full font-bold tracking-widest uppercase flex items-center gap-2">
            <Sparkles size={12}/> Ecosystem Logistics v2
          </Badge>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.85] text-zinc-900 dark:text-white">
            L'infrastructure du transport en <span className="text-primary drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">RDC</span>.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            Gérez votre flotte multi-sites, vos billetteries unifiées, et vos audits de caisse en temps réel avec une interface moderne et sécurisée.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => setIsRegisterOpen(true)} className="bg-primary text-white font-bold h-14 px-10 text-sm rounded-2xl flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/30">
            Démarrer gratuitement <ArrowRight size={16}/>
          </Button>
          <Button onClick={() => setIsLoginOpen(true)} variant="outline" className="border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm font-bold h-14 px-10 text-sm rounded-2xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-2">
            <LogIn size={16} /> Se connecter
          </Button>
        </div>

        {/* Preuve sociale / Partenaires fictifs */}
        <div className="pt-12 opacity-50 grayscale dark:invert brightness-0 dark:brightness-200 flex flex-wrap justify-center gap-8 md:gap-16">
          <div className="font-black text-xl tracking-tighter italic">KivuTrans</div>
          <div className="font-black text-xl tracking-tighter italic">GomaExpress</div>
          <div className="font-black text-xl tracking-tighter italic">BeniLogistics</div>
          <div className="font-black text-xl tracking-tighter italic">CongoWays</div>
        </div>
      </main>

      {/* MODAL CONNEXION */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 max-w-sm rounded-3xl shadow-2xl p-8">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <KeyRound className="text-primary" size={24}/>
            </div>
            <div className="text-center">
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Authentification</DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Accédez à votre espace de gestion sécurisé.
              </DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleLoginSubmit} className="space-y-5 pt-4">
            {loginError && <p className="text-xs text-rose-500 bg-rose-500/10 p-3 rounded-xl font-medium text-center">{loginError}</p>}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Email professionnel</label>
              <Input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="admin@motoka.cd" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mot de passe</label>
              <Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
            </div>
            <Button type="submit" disabled={authLoading} className="w-full bg-primary text-white font-bold text-sm h-12 rounded-xl cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-lg shadow-primary/20 hover:opacity-90 transition-all">
              {authLoading ? <Loader2 size={16} className="mr-2 animate-spin"/> : <LogIn size={16} className="mr-2"/>} 
              Se connecter au portail
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL INSCRIPTION AGENCE */}
      <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-50 max-w-md rounded-3xl shadow-2xl p-8 overflow-y-auto max-h-[90vh]">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Building2 className="text-primary" size={24}/>
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-zinc-900 dark:text-white">Adhésion au Réseau</DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Digitalisez votre agence de transport dès aujourd'hui.
              </DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleRegisterSubmit} className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Raison Sociale</label>
              <Input value={regAgencyName} onChange={e => setRegAgencyName(e.target.value)} placeholder="Ex: Volenium Trans" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Nom Admin</label>
                <Input value={regAdminName} onChange={e => setRegAdminName(e.target.value)} placeholder="Votre nom" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Ville</label>
                <Input value={regCity} onChange={e => setRegCity(e.target.value)} placeholder="Ex: Goma" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Email Admin</label>
                <Input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="admin@volenium.cd" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Téléphone</label>
                <Input value={regTelephone} onChange={e => setRegTelephone(e.target.value)} placeholder="08..." className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1">Mot de passe</label>
              <Input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 h-11 px-4 rounded-xl text-sm" required />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider ml-1 block">Niveau de licence</label>
              <div className="grid grid-cols-3 gap-3">
                {(["starter", "business", "enterprise"] as const).map((plan) => (
                  <div
                    key={plan} onClick={() => setRegPlan(plan)}
                    className={cn(
                      "p-3 rounded-2xl border text-center cursor-pointer transition-all flex flex-col gap-1",
                      regPlan === plan 
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20" 
                        : "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 text-zinc-400"
                    )}
                  >
                    <p className="text-[10px] font-black uppercase tracking-tighter">{plan}</p>
                    <p className="text-[10px] font-mono text-zinc-500">{plan === "starter" ? "50 CDF" : plan === "business" ? "120 CDF" : "250 CDF"}</p>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary text-white font-bold text-sm h-12 rounded-xl cursor-pointer shadow-lg shadow-primary/20 hover:opacity-90 transition-all mt-2">
              {loading ? <Loader2 size={16} className="mr-2 animate-spin"/> : <UserPlus size={16} className="mr-2"/>} 
              Déployer mon infrastructure
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <footer className="text-center py-8 relative z-10">
        <div className="max-w-6xl mx-auto border-t border-zinc-200 dark:border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-zinc-400 dark:text-zinc-600 uppercase tracking-widest font-bold">
            © 2026 Motoka Ecosystem • Digitalizing African Logistics
          </p>
          <div className="flex gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-primary transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-primary transition-colors">Conditions</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
