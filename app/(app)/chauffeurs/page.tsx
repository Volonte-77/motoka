"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Phone, Car, ShieldAlert, CheckCircle2 } from "lucide-react";

// Données fictives pour concevoir l'interface
const initialDrivers = [
  { id: "1", name: "Jean-Pierre Kasongo", phone: "+243 991 234 567", vehicle: "Bus Coaster - C042", status: "Disponible" },
  { id: "2", name: "Marc Mbusa", phone: "+243 812 345 678", vehicle: "Toyota Probox - T108", status: "En mission" },
  { id: "3", name: "Alain Paluku", phone: "+243 973 456 789", vehicle: "Moto Kijima - M009", status: "Hors service" },
];

export default function ChauffeursPage() {
  const [drivers] = useState(initialDrivers);
  const [search, setSearch] = useState("");

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête de la page */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion des Chauffeurs</h1>
          <p className="text-sm text-zinc-400">Suivi, documents et statuts opérationnels des chauffeurs de l'agence.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} />
          Ajouter un chauffeur
        </Button>
      </div>

      {/* Barre de Recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <Input
          type="text"
          placeholder="Rechercher un chauffeur par son nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[#121214] border-zinc-800 text-white focus-visible:ring-primary"
        />
      </div>

      {/* Liste Mobile-First (Grille s'adaptant de 1 colonne à 3 colonnes) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="border-zinc-800 bg-[#121214] overflow-hidden hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 space-y-4">
              
              {/* Ligne Supérieure : Nom & Statut */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-white text-base">{driver.name}</h3>
                  <p className="text-xs text-zinc-500">ID Chauffeur: #00{driver.id}</p>
                </div>
                
                {/* Badge de Statut Cyber-Précis */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  driver.status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  driver.status === "En mission" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    driver.status === "Disponible" ? "bg-emerald-400" :
                    driver.status === "En mission" ? "bg-amber-400" :
                    "bg-zinc-400"
                  }`} />
                  {driver.status}
                </span>
              </div>

              {/* Infos Contact & Véhicule */}
              <div className="space-y-2 text-sm text-zinc-400 border-t border-zinc-800/60 pt-3">
                <div className="flex items-center gap-2.5">
                  <Phone size={15} className="text-zinc-500" />
                  <span>{driver.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Car size={15} className="text-zinc-500" />
                  <span>{driver.vehicle}</span>
                </div>
              </div>

              {/* Actions rapides de terrain */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-9 cursor-pointer">
                  Voir Profil
                </Button>
                <Button variant="outline" className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 text-xs h-9 cursor-pointer">
                  Courses
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}