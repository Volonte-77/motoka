"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Search, Car, Truck, Bike, Wrench, AlertTriangle, CheckCircle, Navigation } from "lucide-react";

// Données fictives des véhicules de l'agence
const initialVehicles = [
  { id: "1", model: "Toyota HiAce (Coaster)", plate: "C042-GMA", type: "Bus", status: "Disponible" },
  { id: "2", model: "Toyota Probox", plate: "T108-GMA", type: "Taxi", status: "Mission" },
  { id: "3", model: "Fuso Fighter", plate: "C901-GMA", type: "Camion", status: "Maintenance" },
  { id: "4", model: "Kijima 150", plate: "M009-GMA", type: "Moto", status: "Disponible" },
  { id: "5", model: "Suzuki Alto", plate: "T220-GMA", type: "Taxi", status: "Hors service" },
];

export default function VehiculesPage() {
  const [vehicles] = useState(initialVehicles);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filtrage combiné (Recherche + Type de véhicule)
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.model.toLowerCase().includes(search.toLowerCase()) || v.plate.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? v.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  // Fonction pour afficher l'icône de la catégorie correspondante
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Camion": return <Truck size={18} />;
      case "Moto": return <Bike size={18} />;
      default: return <Car size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion du Parc Automobile</h1>
          <p className="text-sm text-zinc-400">Suivi en temps réel des véhicules, de leur disponibilité et de leur état technique.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} />
          Ajouter un véhicule
        </Button>
      </div>

      {/* Barre de recherche et filtres tactiles */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input
            type="text"
            placeholder="Rechercher par modèle ou plaque d'immatriculation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[#121214] border-zinc-800 text-white focus-visible:ring-primary"
          />
        </div>

        {/* Boutons de filtres horizontaux défilants sur mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button 
            variant={selectedType === null ? "default" : "outline"}
            onClick={() => setSelectedType(null)}
            className="text-xs h-8 cursor-pointer rounded-full"
          >
            Tous
          </Button>
          {["Bus", "Taxi", "Camion", "Moto"].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              onClick={() => setSelectedType(type)}
              className="text-xs h-8 cursor-pointer rounded-full flex items-center gap-1.5"
            >
              {getTypeIcon(type)}
              {type}
            </Button>
          ))}
        </div>
      </div>

      {/* Grille des véhicules */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="border-zinc-800 bg-[#121214] hover:border-zinc-700 transition-colors">
            <CardContent className="p-4 space-y-4">
              
              {/* Ligne Supérieure : Modèle et Badge de Statut */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white font-semibold">
                    <span className="text-zinc-500">{getTypeIcon(vehicle.type)}</span>
                    <h3 className="text-base tracking-tight">{vehicle.model}</h3>
                  </div>
                  <span className="inline-block bg-zinc-800 text-zinc-400 font-mono text-xs px-2 py-0.5 rounded border border-zinc-700/50">
                    {vehicle.plate}
                  </span>
                </div>

                {/* Badge statut cyber-précis */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  vehicle.status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                  vehicle.status === "Mission" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  vehicle.status === "Maintenance" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    vehicle.status === "Disponible" ? "bg-emerald-400" :
                    vehicle.status === "Mission" ? "bg-blue-400" :
                    vehicle.status === "Maintenance" ? "bg-amber-400" :
                    "bg-destructive"
                  }`} />
                  {vehicle.status}
                </span>
              </div>

              {/* Ligne d'actions contextuelles selon l'état */}
              <div className="flex items-center justify-between border-t border-zinc-800/60 pt-3 text-xs">
                <span className="text-zinc-500">Catégorie : <strong className="text-zinc-300">{vehicle.type}</strong></span>
                
                <div className="flex gap-1.5">
                  {vehicle.status === "Disponible" && (
                    <Button size="sm" variant="outline" className="h-8 border-zinc-800 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1">
                      <Navigation size={12} /> Assigner
                    </Button>
                  )}
                  {vehicle.status === "Maintenance" && (
                    <Button size="sm" variant="outline" className="h-8 border-zinc-800 text-amber-400 hover:bg-amber-500/10 cursor-pointer flex items-center gap-1">
                      <Wrench size={12} /> Rapport
                    </Button>
                  )}
                  <Button size="sm" variant="outline" className="h-8 border-zinc-800 text-zinc-400 hover:bg-zinc-800 cursor-pointer">
                    Détails
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}