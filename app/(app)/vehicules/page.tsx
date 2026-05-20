"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, Search, Car, Truck, Bike, Wrench, Navigation, 
  LayoutGrid, List, Eye, Calendar, ShieldCheck, Milestone
} from "lucide-react";

// Données fictives des véhicules
const initialVehicles = [
  { id: "1", model: "Toyota HiAce (Coaster)", plate: "C042-GMA", type: "Bus", status: "Disponible", owner: "Agence Goma Centre", mileage: "45,200 km", lastService: "12/04/2026" },
  { id: "2", model: "Toyota Probox", plate: "T108-GMA", type: "Taxi", status: "Mission", owner: "Agence Goma Centre", mileage: "128,000 km", lastService: "02/05/2026" },
  { id: "3", model: "Fuso Fighter", plate: "C901-GMA", type: "Camion", status: "Maintenance", owner: "Antenne Beni", mileage: "89,450 km", lastService: "19/05/2026" },
  { id: "4", model: "Kijima 150", plate: "M009-GMA", type: "Moto", status: "Disponible", owner: "Antenne Butembo", mileage: "12,100 km", lastService: "28/03/2026" },
  { id: "5", model: "Suzuki Alto", plate: "T220-GMA", type: "Taxi", status: "Hors service", owner: "Agence Goma Centre", mileage: "210,000 km", lastService: "10/01/2026" },
];

export default function VehiculesPage() {
  const [vehicles] = useState(initialVehicles);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // États pour la gestion de l'affichage et du modal
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedVehicle, setSelectedVehicle] = useState<typeof initialVehicles[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.model.toLowerCase().includes(search.toLowerCase()) || v.plate.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType ? v.type === selectedType : true;
    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Camion": return <Truck size={16} />;
      case "Moto": return <Bike size={16} />;
      default: return <Car size={16} />;
    }
  };

  const openDetails = (vehicle: typeof initialVehicles[0]) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
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
          <Plus size={18} /> Ajouter un véhicule
        </Button>
      </div>

      {/* Barre de contrôle : Recherche + Filtres + Basculeur de vue */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <Input
              type="text"
              placeholder="Rechercher par modèle ou plaque..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#121214] border-zinc-800 text-white focus-visible:ring-primary"
            />
          </div>
          
          {/* Boutons de choix de rendu (Invisible ou désactivé astucieusement sur petit mobile pour forcer le grid) */}
          <div className="flex items-center gap-1 bg-[#121214] border border-zinc-800 p-1 rounded-lg self-end md:self-auto">
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

        {/* Filtres par Catégories */}
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

      {/* RENDU 1 : VUE EN CARTES (GRID) */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVehicles.map((vehicle) => (
            <Card 
              key={vehicle.id} 
              onClick={() => openDetails(vehicle)}
              className="border-zinc-800 bg-[#121214] hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 space-y-4">
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

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    vehicle.status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    vehicle.status === "Mission" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    vehicle.status === "Maintenance" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    "bg-destructive/10 text-destructive border-destructive/20"
                  }`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 flex justify-between border-t border-zinc-800/60 pt-3">
                  <span>Kilométrage : <strong className="text-zinc-300">{vehicle.mileage}</strong></span>
                  <span className="text-primary hover:underline flex items-center gap-1">Voir <Eye size={12}/></span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* RENDU 2 : VUE EN TABLEAU PROFESSIONNEL */}
      {viewMode === "table" && (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-[#121214]">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Véhicule / Plaque</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3">Kilométrage</th>
                <th className="px-4 py-3">Dernier Entretien</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredVehicles.map((vehicle) => (
                <tr 
                  key={vehicle.id} 
                  onClick={() => openDetails(vehicle)}
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <div className="flex flex-col">
                      <span>{vehicle.model}</span>
                      <span className="text-xs font-mono text-zinc-500">{vehicle.plate}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-300">
                      {getTypeIcon(vehicle.type)} {vehicle.type}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{vehicle.mileage}</td>
                  <td className="px-4 py-3 text-zinc-500">{vehicle.lastService}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      vehicle.status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      vehicle.status === "Mission" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      vehicle.status === "Maintenance" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-destructive/10 text-destructive border-destructive/20"
                    }`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openDetails(vehicle)} className="text-zinc-400 hover:text-white h-7">
                      Détails
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JOLIE MODAL : FICHE TECHNIQUE DU VÉHICULE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#121214] border border-zinc-800 text-white max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase mb-1">
              {selectedVehicle && getTypeIcon(selectedVehicle.type)} Fiche Technique
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {selectedVehicle?.model}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-zinc-400 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 w-fit">
              Immatriculation : {selectedVehicle?.plate}
            </DialogDescription>
          </DialogHeader>

          {/* Grille d'informations détaillées */}
          <div className="space-y-4 my-2 border-t border-b border-zinc-800/80 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Affectation</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><ShieldCheck size={14} className="text-zinc-500"/>{selectedVehicle?.owner}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Kilométrage Actuel</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><Milestone size={14} className="text-zinc-500"/>{selectedVehicle?.mileage}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Dernier Entretien</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><Calendar size={14} className="text-zinc-500"/>{selectedVehicle?.lastService}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Statut Courant</span>
                <p className="text-primary font-semibold">{selectedVehicle?.status}</p>
              </div>
            </div>
          </div>

          {/* Actions à l'intérieur du Modal */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
              Fermer
            </Button>
            {selectedVehicle?.status === "Disponible" && (
              <Button className="bg-primary text-primary-foreground hover:opacity-90 cursor-pointer flex items-center gap-1.5">
                <Navigation size={14} /> Assigner à une course
              </Button>
            )}
            {selectedVehicle?.status === "Maintenance" && (
              <Button className="bg-amber-600 text-white hover:bg-amber-700 cursor-pointer flex items-center gap-1.5">
                <Wrench size={14} /> Clôturer l'entretien
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}