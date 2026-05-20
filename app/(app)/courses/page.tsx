"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, Search, Car, Users, Milestone, Calendar, MapPin, 
  LayoutGrid, List, Eye, Clock, CheckCircle2, Play, AlertCircle
} from "lucide-react";

// Données fictives enrichies pour les courses
const initialTrips = [
  { id: "CRS-402", route: "Goma → Butembo", driver: "Jean-Pierre Kasongo", vehicle: "Bus Coaster (C042-GMA)", status: "En cours", departureTime: "20/05/2026 à 07:30", eta: "Env. 6 heures", passengers: 18, load: "4 Colis" },
  { id: "CRS-403", route: "Goma → Beni", driver: "Marc Mbusa", vehicle: "Toyota Probox (T108-GMA)", status: "Planifiée", departureTime: "21/05/2026 à 06:00", eta: "Env. 7 heures", passengers: 4, load: "2 Colis" },
  { id: "CRS-401", route: "Goma → Kanyabayonga", driver: "Alain Paluku", vehicle: "Moto Kijima (M009-GMA)", status: "Terminée", departureTime: "19/05/2026 à 09:00", eta: "Arrivé à 14:15", passengers: 1, load: "1 Petit Colis" },
];

export default function CoursesPage() {
  const [trips, setTrips] = useState(initialTrips);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // États de l'UI
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedTrip, setSelectedTrip] = useState<typeof initialTrips[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtrage combiné (Recherche par axe, chauffeur ou véhicule)
  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.route.toLowerCase().includes(search.toLowerCase()) || 
                          t.driver.toLowerCase().includes(search.toLowerCase()) ||
                          t.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (trip: typeof initialTrips[0]) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  // Simulation de changement de statut pour le côté interactif
  const handleStartTrip = (id: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: "En cours" } : t));
    if (selectedTrip) setSelectedTrip({ ...selectedTrip, status: "En cours" });
  };

  const handleCompleteTrip = (id: string) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status: "Terminée", eta: "Arrivé à l'instant" } : t));
    if (selectedTrip) setSelectedTrip({ ...selectedTrip, status: "Terminée", eta: "Arrivé à l'instant" });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion des Courses</h1>
          <p className="text-sm text-zinc-400">Planification des trajets, affectation des équipages et suivi des lignes de transport.</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} /> Planifier une course
        </Button>
      </div>

      {/* Barre de contrôle : Recherche + Basculeur de vue */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <Input
              type="text"
              placeholder="Rechercher par Axe, Chauffeur, Véhicule..."
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

        {/* Filtres par État de la Course */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <Button 
            variant={statusFilter === null ? "default" : "outline"}
            onClick={() => setStatusFilter(null)}
            className="text-xs h-8 cursor-pointer rounded-full"
          >
            Toutes les courses
          </Button>
          {["Planifiée", "En cours", "Terminée"].map((status) => (
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
          {filteredTrips.map((trip) => (
            <Card 
              key={trip.id} 
              onClick={() => openDetails(trip)}
              className="border-zinc-800 bg-white dark:bg-[#121214] hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <CardContent className="p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-mono text-primary font-semibold tracking-wider">{trip.id}</span>
                    <h3 className="text-base font-semibold text-white mt-0.5 flex items-center gap-1.5">
                      <Milestone size={16} className="text-zinc-500" /> {trip.route}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                    trip.status === "Terminée" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    trip.status === "En cours" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <div className="text-sm text-zinc-400 space-y-1.5 border-t border-zinc-800/60 pt-3">
                  <p className="text-xs">Chauffeur : <strong className="text-zinc-200">{trip.driver}</strong></p>
                  <p className="text-xs text-zinc-500 truncate">Véhicule : {trip.vehicle}</p>
                </div>

                <div className="text-xs text-zinc-500 flex justify-between items-center pt-1">
                  <span className="flex items-center gap-1"><Clock size={12}/> {trip.status === "Planifiée" ? "Départ prévu" : "Durée"}</span>
                  <span className="text-primary hover:underline flex items-center gap-1">Détails <Eye size={12}/></span>
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
                <th className="px-4 py-3">ID / Axe de trajet</th>
                <th className="px-4 py-3">Chauffeur</th>
                <th className="px-4 py-3">Véhicule</th>
                <th className="px-4 py-3">Départ / Statut Temps</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredTrips.map((trip) => (
                <tr 
                  key={trip.id} 
                  onClick={() => openDetails(trip)}
                  className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3 font-medium text-white">
                    <div className="flex flex-col">
                      <span className="text-xs font-mono text-primary font-semibold">{trip.id}</span>
                      <span>{trip.route}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{trip.driver}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs truncate max-w-[150px]">{trip.vehicle}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col text-xs">
                      <span className="text-zinc-300">{trip.departureTime}</span>
                      <span className="text-zinc-500 font-mono">{trip.eta}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                      trip.status === "Terminée" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      trip.status === "En cours" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" onClick={() => openDetails(trip)} className="text-zinc-400 hover:text-white h-7">
                      Suivre
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL : FEUILLE DE ROUTE DE LA COURSE */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-800 text-white max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase mb-1">
              <Milestone size={14}/> Feuille de Route Opérationnelle
            </div>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <span>{selectedTrip?.route}</span>
              <span className="text-zinc-500 text-sm font-mono">({selectedTrip?.id})</span>
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs flex items-center gap-1">
              <Calendar size={12}/> Planification : {selectedTrip?.departureTime}
            </DialogDescription>
          </DialogHeader>

          {/* Détails logistiques de la course */}
          <div className="space-y-4 my-2 border-t border-b border-zinc-800/80 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Chauffeur</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><Users size={14} className="text-zinc-500"/>{selectedTrip?.driver}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Véhicule engagé</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><Car size={14} className="text-zinc-500"/>{selectedTrip?.vehicle.split(" (")[0]}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Passagers à bord</span>
                <p className="text-zinc-200 font-medium">{selectedTrip?.passengers ?? selectedTrip?.passengers} Voyageurs</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Fret / Cargo</span>
                <p className="text-zinc-200 font-medium">{selectedTrip?.load}</p>
              </div>
            </div>

            {/* Suivi temporel / État de la ligne */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <div className="text-xs">
                  <p className="text-zinc-200 font-medium">Indicateur de temps (ETA)</p>
                  <p className="text-zinc-500">{selectedTrip?.eta}</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                {selectedTrip?.status}
              </span>
            </div>
          </div>

          {/* Actions de contrôle du flux en direct */}
          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer text-xs h-9">
              Fermer
            </Button>
            
            {/* Boutons d'actions dynamiques selon le cycle de vie de la course */}
            {selectedTrip?.status === "Planifiée" && (
              <Button 
                onClick={() => selectedTrip && handleStartTrip(selectedTrip.id)}
                className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs h-9 flex items-center gap-1.5"
              >
                <Play size={14} /> Lancer la course
              </Button>
            )}
            
            {selectedTrip?.status === "En cours" && (
              <Button 
                onClick={() => selectedTrip && handleCompleteTrip(selectedTrip.id)}
                className="bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-xs h-9 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} /> Marquer comme Arrivé
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}