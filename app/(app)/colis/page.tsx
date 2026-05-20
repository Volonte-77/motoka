"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, Search, Package, User, ArrowRight, CheckCircle2, 
  LayoutGrid, List, Eye, ShieldCheck, KeyRound, QrCode, Truck
} from "lucide-react";

// Données fictives enrichies pour les colis
const initialPackages = [
  { id: "TRK-9021", sender: "Anselme Kambale", receiver: "Placide Kakule", phoneReceiver: "+243 815 990 112", description: "Carton d'ordinateurs portables", route: "Goma → Butembo", status: "En transit", weight: "14 kg", value: "1,200 USD", otp: "4821" },
  { id: "TRK-3042", sender: "Faustin Mwanawavene", receiver: "Divine Kavira", phoneReceiver: "+243 994 321 098", description: "Sac de marchandises (Habits)", route: "Goma → Beni", status: "En attente", weight: "35 kg", value: "450 000 FC", otp: "9105" },
  { id: "TRK-1108", sender: "Rebecca Zawadi", receiver: "Michel Mwamba", phoneReceiver: "+243 823 456 781", description: "Documents administratifs scellés", route: "Goma → Kinshasa", status: "Livré", weight: "0.5 kg", value: "Non déclaré", otp: "ALREADY_VERIFIED" },
];

export default function ColisPage() {
  const [packages] = useState(initialPackages);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // États de l'UI
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedPackage, setSelectedPackage] = useState<typeof initialPackages[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState(false);
  const [otpSuccess, setOtpSuccess] = useState(false);

  // Filtrage combiné
  const filteredPackages = packages.filter(p => {
    const matchesSearch = p.id.toLowerCase().includes(search.toLowerCase()) || 
                          p.sender.toLowerCase().includes(search.toLowerCase()) || 
                          p.receiver.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (pkg: typeof initialPackages[0]) => {
    setSelectedPackage(pkg);
    setOtpInput("");
    setOtpError(false);
    setOtpSuccess(false);
    setIsModalOpen(true);
  };

  const handleVerifyOtp = () => {
    if (selectedPackage && otpInput === selectedPackage.otp) {
      setOtpSuccess(true);
      setOtpError(false);
      // La logique de mise à jour Supabase viendra ici plus tard
    } else {
      setOtpError(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion des Colis & Fret</h1>
          <p className="text-sm text-zinc-400">Enregistrement, édition de bordereaux et sécurisation des livraisons.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} /> Enregistrer un colis
        </Button>
      </div>

      {/* Barre de contrôle */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <Input
              type="text"
              placeholder="Rechercher par Code tracking, Expéditeur, Destinataire..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white dark:bg-[#121214] border-zinc-800 text-white focus-visible:ring-primary"
            />
          </div>
          
          {/* Basculeur de vue Grid / Table */}
          <div className="flex items-center gap-1 bg-white dark:bg-[#121214] border border-zinc-800 p-1 rounded-lg self-end md:self-auto">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 cursor-pointer text-zinc-400 data-[variant=secondary]:text-white"
              data-variant={viewMode === "grid" ? "secondary" : "ghost"}
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="h-8 w-8 cursor-pointer text-zinc-400 data-[variant=secondary]:text-white"
              data-variant={viewMode === "table" ? "secondary" : "ghost"}
            >
              <List size={16} />
            </Button>
          </div>
        </div>

        {/* Filtres par État du flux */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button 
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
            className="text-xs h-8 cursor-pointer rounded-full"
          >
            Tous les colis
          </Button>
          {["En attente", "En transit", "Livré"].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() => setStatusFilter(status)}
              className="text-xs h-8 cursor-pointer rounded-full"
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* RENDU 1 : CARTES (GRID) */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              onClick={() => openDetails(pkg)}
              className="border-zinc-800 bg-white dark:bg-[#121214] hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-primary tracking-wider font-semibold">{pkg.id}</span>
                    <h3 className="text-base font-semibold text-white mt-0.5 truncate max-w-[180px]">{pkg.description}</h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    pkg.status === "Livré" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    pkg.status === "En transit" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {pkg.status}
                  </span>
                </div>

                <div className="text-sm text-zinc-400 space-y-1.5 border-t border-zinc-800/60 pt-3">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-zinc-500" />
                    <span className="truncate">Pour: <strong>{pkg.receiver}</strong></span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium bg-zinc-900 px-2 py-1 rounded w-fit">
                    Axe : {pkg.route}
                  </p>
                </div>

                <div className="text-xs text-zinc-500 flex justify-between items-center pt-1">
                  <span>Poids : <strong className="text-zinc-300">{pkg.weight}</strong></span>
                  <span className="text-primary hover:underline flex items-center gap-1">Gérer <Eye size={12}/></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* RENDU 2 : TABLEAU */}
      {viewMode === "table" && (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-white dark:bg-[#121214]">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Code / Description</th>
                <th className="px-4 py-3">Expéditeur</th>
                <th className="px-4 py-3">Destinataire</th>
                <th className="px-4 py-3">Trajet</th>
                <th className="px-4 py-3">Poids</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredPackages.map((pkg) => (
                <tr 
                  key={pkg.id} 
                  onClick={() => openDetails(pkg)}
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-primary font-semibold">{pkg.id}</span>
                      <span>{pkg.description}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{pkg.sender}</td>
                  <td className="px-4 py-3 text-zinc-300">{pkg.receiver}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{pkg.route}</td>
                  <td className="px-4 py-3 text-zinc-300">{pkg.weight}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      pkg.status === "Livré" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      pkg.status === "En transit" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openDetails(pkg)} className="text-zinc-400 hover:text-white h-7">
                      Gérer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL AVANCÉ : TRACKING & VALIDATION OTP */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-800 text-white max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase mb-1">
              <Package size={14}/> Fiche de suivi fret
            </div>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <span>{selectedPackage?.id}</span>
              <span className="text-zinc-500 text-sm font-normal">| {selectedPackage?.weight}</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Contenu : {selectedPackage?.description}
            </DialogDescription>
          </DialogHeader>

          {/* Flux logistique : Expéditeur → Destinataire */}
          <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg space-y-3 my-2 text-sm">
            <div className="flex items-center justify-between text-xs text-zinc-500 uppercase tracking-wider">
              <span>Expéditeur</span>
              <ArrowRight size={14} />
              <span>Destinataire</span>
            </div>
            <div className="flex items-center justify-between font-medium text-zinc-200">
              <span>{selectedPackage?.sender}</span>
              <span className="text-primary text-xs font-mono">{selectedPackage?.route}</span>
              <span>{selectedPackage?.receiver}</span>
            </div>
            <div className="text-xs text-zinc-400 text-right">
              Tél Destinataire : {selectedPackage?.phoneReceiver}
            </div>
          </div>

          {/* Module de Sécurisation de Livraison */}
          <div className="border-t border-zinc-800/80 pt-4 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-primary"/> Sécurisation de la Livraison
            </h4>

            {selectedPackage?.status === "Livré" || otpSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2.5 text-emerald-400 text-sm">
                <CheckCircle2 size={18} />
                <span>Colis livré et authentifié avec succès par OTP.</span>
              </div>
            ) : selectedPackage?.status === "En transit" ? (
              <div className="space-y-2">
                <p className="text-xs text-zinc-400">
                  Saisissez le code OTP à 4 chiffres envoyé par SMS au destinataire pour valider la remise en main propre :
                </p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                    <Input
                      type="text"
                      maxLength={4}
                      placeholder="Code OTP (ex: 1234)"
                      value={otpInput}
                      onChange={(e) => {
                        setOtpInput(e.target.value);
                        setOtpError(false);
                      }}
                      className="pl-9 bg-zinc-900 border-zinc-800 font-mono text-center tracking-widest text-white focus-visible:ring-primary"
                    />
                  </div>
                  <Button onClick={handleVerifyOtp} className="bg-primary text-primary-foreground font-medium cursor-pointer">
                    Valider
                  </Button>
                </div>
                {otpError && (
                  <p className="text-xs text-destructive font-medium">Code OTP incorrect. Veuillez réessayer.</p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-amber-400 text-xs flex items-center gap-2">
                <Truck size={16} />
                <span>Le colis est encore au dépôt d'origine. En attente de chargement.</span>
              </div>
            )}
          </div>

          {/* Actions de pied de page */}
          <div className="flex gap-2 justify-end pt-3 border-t border-zinc-800/40 mt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer text-xs h-9">
              Fermer
            </Button>
            <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer text-xs h-9 flex items-center gap-1.5">
              <QrCode size={14} /> Voir QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}