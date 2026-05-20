"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Shield, UserCheck, Zap, Building, CheckCircle } from "lucide-react";

// Liste fictive d'utilisateurs de l'agence
const initialUsers = [
  { id: "U-882", name: "Ephraïm Kambale", role: "Admin Agence", site: "Goma - Siège", status: "Actif" },
  { id: "U-109", name: "Sifa Muhindo", role: "Dispatcher / Opérateur", site: "Beni Antenne", status: "Actif" },
  { id: "U-304", name: "Jean-Pierre Kasongo", role: "Chauffeur", site: "Goma Centre", status: "En course" },
  { id: "U-012", name: "Patient Mwamba", role: "Client (Pro)", site: "Transit Fret", status: "Actif" },
];

export default function UsersAndPlansPage() {
  const [users] = useState(initialUsers);
  const [currentPlan, setCurrentPlan] = useState<"Basique" | "Standard" | "Premium">("Standard");

  return (
    <div className="space-y-8">
      {/* SECTION 1 : GESTION DES ABONNEMENTS ET DES AVANTAGES */}
      <div>
        <div className="mb-4">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Abonnement & Licence Agence</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Suivi des quotas multi-sites et mise à niveau de l'infrastructure SaaS.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Offre Basique */}
          <Card className={`border ${currentPlan === "Basique" ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]"}`}>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Plan Basique</h3>
                  <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">50 $ <span className="text-xs font-normal text-zinc-500">/ mois</span></p>
                </div>
                {currentPlan === "Basique" && <Badge className="bg-primary text-primary-foreground">Actif</Badge>}
              </div>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> 1 Seul Site Localisé</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Max 3 Opérateurs guichet</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Suivi Fret de base</li>
              </ul>
              {currentPlan !== "Basique" && <Button disabled variant="outline" className="w-full text-xs h-8">Sous-classer</Button>}
            </CardContent>
          </Card>

          {/* Offre Standard */}
          <Card className={`border ${currentPlan === "Standard" ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]"}`}>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Plan Standard</h3>
                  <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">120 $ <span className="text-xs font-normal text-zinc-500">/ mois</span></p>
                </div>
                {currentPlan === "Standard" && <Badge className="bg-primary text-primary-foreground">Actif</Badge>}
              </div>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Jusqu'à 3 Sites (Goma, Beni...)</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Max 10 Opérateurs système</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Suivi Colis avec alertes SMS</li>
              </ul>
              {currentPlan !== "Standard" && <Button onClick={() => setCurrentPlan("Standard")} variant="outline" className="w-full text-xs h-8">Choisir Standard</Button>}
            </CardContent>
          </Card>

          {/* Offre Premium */}
          <Card className={`border ${currentPlan === "Premium" ? "border-primary bg-primary/5" : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]"}`}>
            <CardContent className="p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg text-zinc-900 dark:text-white flex items-center gap-1.5">Plan Premium <Zap size={14} className="text-amber-500 fill-amber-500"/></h3>
                  <p className="text-2xl font-black mt-1 text-zinc-900 dark:text-white">250 $ <span className="text-xs font-normal text-zinc-500">/ mois</span></p>
                </div>
                {currentPlan === "Premium" && <Badge className="bg-primary text-primary-foreground">Actif</Badge>}
              </div>
              <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-2 border-t border-zinc-100 dark:border-zinc-800/80 pt-3">
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Sites & Agences **Illimités**</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Opérateurs & Chauffeurs Illimités</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Authentification complète **OTP** Colis</li>
                <li className="flex items-center gap-1.5"><CheckCircle size={12} className="text-primary"/> Rapports consolidés avancés + PDF</li>
              </ul>
              {currentPlan !== "Premium" && (
                <Button onClick={() => setCurrentPlan("Premium")} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs h-8 cursor-pointer">
                  Passer au Plan Premium
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SECTION 2 : GESTION DES UTILISATEURS DU SYSTEME (RBAC) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">Comptes Utilisateurs & Équipage</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Affectation des rôles métiers sécurisés sur la plateforme.</p>
          </div>
          <Button className="bg-primary text-primary-foreground font-medium flex items-center gap-2 cursor-pointer text-xs h-9">
            <Plus size={14} /> Ajouter un utilisateur
          </Button>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
              <tr>
                <th className="px-4 py-3">ID / Utilisateur</th>
                <th className="px-4 py-3">Rôle Métier</th>
                <th className="px-4 py-3">Site / Affectation</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-900 dark:text-zinc-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20 text-xs sm:text-sm">
                  <td className="px-4 py-3 font-medium">
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-[10px] font-mono text-zinc-400">{user.id}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs">
                      <Shield size={12} className="text-primary"/> {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 flex items-center gap-1 mt-1.5">
                    <Building size={13}/> {user.site}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      user.status === "Actif" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}