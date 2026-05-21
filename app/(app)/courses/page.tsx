"use client";

import { useState, useEffect } from "react";
import localforage from "localforage";
import { useAuthStore } from "@/store/useAuthStore";
import { useTenantContext } from "@/hooks/useAuthGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, Search, Car, Users, Milestone, Calendar, MapPin, 
  LayoutGrid, List, Eye, Clock, CheckCircle2, Play, AlertCircle, Package
} from "lucide-react";
import { Trip, Vehicle, STORAGE_KEYS } from "@/types";

/**
 * Page Courses / Trajets — MOTOKA Admin Agence
 * ✓ Multi-Agences: Filtrage automatique par user.agencyId
 * ✓ Véhicules: Charge depuis la même agence pour affectation
 * ✓ Offline-First: Persistance localforage
 * ✓ Synergie: Les courses assignent uniquement les véhicules de l'agence
 */

// Données fictives initiales de secours
const initialTrips = [
  { id: "CRS-402", route: "Goma → Butembo", driver: "Jean-Pierre Kasongo", vehicle: "Bus Coaster (C042-GMA)", status: "En cours", departureTime: "20/05/2026 à 07:30", eta: "Env. 6 heures", passengers: 18, load: "4 Colis", agencyId: "AGE-001" },
  { id: "CRS-403", route: "Goma → Beni", driver: "Marc Mbusa", vehicle: "Toyota Probox (T108-GMA)", status: "Planifiée", departureTime: "21/05/2026 à 06:00", eta: "Env. 7 heures", passengers: 4, load: "2 Colis", agencyId: "AGE-001" },
  { id: "CRS-401", route: "Goma → Kanyabayonga", driver: "Alain Paluku", vehicle: "Moto Kijima (M009-GMA)", status: "Terminée", departureTime: "19/05/2026 à 09:00", eta: "Arrivé à 14:15", passengers: 1, load: "1 Petit Colis", agencyId: "AGE-001" },
];

export default function CoursesPage() {
  const { user } = useAuthStore();
  const tenantContext = useTenantContext();
  
  // États de données réelles
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // États de l'UI
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // États du formulaire de planification
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [driverName, setDriverName] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [departureTimeStr, setDepartureTimeStr] = useState("");
  const [passengersCount, setPassengersCount] = useState("0");
  const [loadDetails, setLoadDetails] = useState("");
  const [etaEstimation, setEtaEstimation] = useState("");

  // Charger les données depuis localforage filtrées par tenant
  const loadData = async () => {
    try {
      setLoading(true);
      
      // 1. Charger les courses
      let allTrips = await localforage.getItem<Trip[]>(STORAGE_KEYS.TRIPS_LIST) || [];
      if (allTrips.length === 0 && tenantContext?.agencyId) {
        const demoTrips = initialTrips.map(t => ({ ...t, agencyId: tenantContext.agencyId }));
        await localforage.setItem(STORAGE_KEYS.TRIPS_LIST, demoTrips);
        allTrips = demoTrips;
      }

      // Filtrer par tenant
      const filteredTrips = tenantContext?.viewAll
        ? allTrips
        : allTrips.filter(t => t.agencyId === tenantContext?.agencyId);
      setTrips(filteredTrips);

      // 2. Charger les véhicules disponibles (même agence uniquement)
      const allVehicles = await localforage.getItem<Vehicle[]>(STORAGE_KEYS.VEHICLES_LIST) || [];
      const agencyVehicles = tenantContext?.viewAll
        ? allVehicles
        : allVehicles.filter(v => v.agencyId === tenantContext?.agencyId);
      setAvailableVehicles(agencyVehicles);
      if (agencyVehicles.length > 0) {
        setSelectedVehicleId(agencyVehicles[0].id);
      }
    } catch (error) {
      console.error("Erreur chargement courses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, tenantContext]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-sm text-zinc-400">Chargement des courses...</p>
      </div>
    );
  }

  // Filtrage combiné (Axe, chauffeur ou véhicule)
  const filteredTrips = trips.filter(t => {
    const matchesSearch = t.route.toLowerCase().includes(search.toLowerCase()) || 
                          t.driver.toLowerCase().includes(search.toLowerCase()) ||
                          t.vehicle.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const openDetails = (trip: Trip) => {
    setSelectedTrip(trip);
    setIsModalOpen(true);
  };

  // Mises à jour de statut asynchrones persistées
  const handleUpdateStatus = async (id: string, nextStatus: string, updatedEta?: string) => {
    const allTrips = await localforage.getItem<Trip[]>(STORAGE_KEYS.TRIPS_LIST) || [];
    const updatedTrips = allTrips.map(t => {
      if (t.id === id) {
        return { 
          ...t, 
          status: nextStatus, 
          eta: updatedEta || t.eta 
        };
      }
      return t;
    });

    await localforage.setItem(STORAGE_KEYS.TRIPS_LIST, updatedTrips);
    
    // Mettre à jour l'état local de la feuille de route active
    if (selectedTrip && selectedTrip.id === id) {
      setSelectedTrip({ 
        ...selectedTrip, 
        status: nextStatus, 
        eta: updatedEta || selectedTrip.eta 
      });
    }
    loadData();
  };

  // Soumission de la nouvelle planification
  const handlePlanTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeFrom || !routeTo || !driverName) return;

    // Trouver le libellé complet du véhicule sélectionné
    const targetVehicle = availableVehicles.find(v => v.id === selectedVehicleId);
    const vehicleLabel = targetVehicle 
      ? `${targetVehicle.model} (${targetVehicle.plate})` 
      : "Véhicule non spécifié";

    // Formatage de la date de départ
    const formattedDate = departureDate 
      ? `${departureDate.split("-").reverse().join("/")} à ${departureTimeStr || "00:00"}`
      : "Date non définie";

    const newTripItem = {
      id: `CRS-${Math.floor(Math.random() * 800) + 100}`,
      route: `${routeFrom} → ${routeTo}`,
      driver: driverName,
      vehicle: vehicleLabel,
      status: "Planifiée",
      departureTime: formattedDate,
      eta: etaEstimation ? `Env. ${etaEstimation}` : "Non spécifié",
      passengers: parseInt(passengersCount) || 0,
      load: loadDetails || "Aucun colis",
      agencyId: user?.agencyId || "AGE-001"
    };

    const allTrips = await localforage.getItem<typeof initialTrips>(STORAGE_KEYS.TRIPS_LIST) || [];
    await localforage.setItem(STORAGE_KEYS.TRIPS_LIST, [...allTrips, newTripItem]);

    // Réinitialisation du formulaire
    setRouteFrom(""); setRouteTo(""); setDriverName(""); setLoadDetails(""); setEtaEstimation(""); setPassengersCount("0");
    setIsAddModalOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion des Courses</h1>
          <p className="text-sm text-zinc-400">Planification des trajets, affectation des équipages et suivi des lignes de transport.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} /> Planifier une course
        </Button>
      </div>

      {/* Barre de contrôle */}
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
          
          {/* Basculeur de vue */}
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

        {/* Filtres par État */}
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

      {/* MODAL 1 : PLANIFIER UN NOUVEAU TRAJET */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-800 text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <MapPin size={18} className="text-primary"/> Planifier un trajet
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Configurez une nouvelle feuille de route pour une ligne régulière ou spéciale.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePlanTripSubmit} className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Lieu de départ</label>
                <Input value={routeFrom} onChange={e => setRouteFrom(e.target.value)} placeholder="Ex: Goma" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Destination</label>
                <Input value={routeTo} onChange={e => setRouteTo(e.target.value)} placeholder="Ex: Beni" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] text-zinc-400">Nom du Chauffeur</label>
              <Input value={driverName} onChange={e => setDriverName(e.target.value)} placeholder="Ex: Alain Paluku" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] text-zinc-400">Affecter un véhicule disponible</label>
              <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-md px-2 text-xs h-8 text-white focus-visible:ring-primary">
                {availableVehicles.length === 0 ? (
                  <option value="">Aucun véhicule en base — Config interne</option>
                ) : (
                  availableVehicles.map(veh => (
                    <option key={veh.id} value={veh.id}>
                      {veh.model} — {veh.plate} [{veh.owner}]
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Date de départ</label>
                <Input type="date" value={departureDate} onChange={e => setDepartureDate(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Heure de départ</label>
                <Input type="time" value={departureTimeStr} onChange={e => setDepartureTimeStr(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Nombre de passagers</label>
                <Input type="number" value={passengersCount} onChange={e => setPassengersCount(e.target.value)} className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Estimation Durée (ETA)</label>
                <Input value={etaEstimation} onChange={e => setEtaEstimation(e.target.value)} placeholder="Ex: 6 heures" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[10px] text-zinc-400">Détails colis / marchandises</label>
              <Input value={loadDetails} onChange={e => setLoadDetails(e.target.value)} placeholder="Ex: 3 cartons pharmaceutiques" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-zinc-800 text-zinc-300 h-8 text-xs cursor-pointer">Annuler</Button>
              <Button type="submit" className="bg-primary text-black font-bold h-8 text-xs cursor-pointer">Confirmer le trajet</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2 : FEUILLE DE ROUTE DE LA COURSE */}
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
                <p className="text-zinc-200 font-medium">{selectedTrip?.passengers} Voyageurs</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Fret / Cargo</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5"><Package size={14} className="text-zinc-500" />{selectedTrip?.load}</p>
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
            
            {selectedTrip?.status === "Planifiée" && (
              <Button 
                onClick={() => selectedTrip && handleUpdateStatus(selectedTrip.id, "En cours")}
                className="bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs h-9 flex items-center gap-1.5"
              >
                <Play size={14} /> Lancer la course
              </Button>
            )}
            
            {selectedTrip?.status === "En cours" && (
              <Button 
                onClick={() => selectedTrip && handleUpdateStatus(selectedTrip.id, "Terminée", "Arrivé à l'instant")}
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