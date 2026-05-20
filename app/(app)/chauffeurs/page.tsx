"use client";

import { useState, useEffect } from "react";
import localforage from "localforage";
import { useAuthStore } from "@/store/useAuthStore";
import { STORAGE_KEYS, AppUser } from "@/components/saas-mock";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { 
  Plus, Search, Users, Phone, Car, ShieldAlert, CheckCircle2, 
  LayoutGrid, List, Eye, IdCard as IdentificationCard, FileText, Star
} from "lucide-react";

// Données de secours initiales (utilisées uniquement si la BDD locale est vide)
const initialDrivers = [
  { id: "DRV-001", name: "Jean-Pierre Kasongo", phone: "+243 991 234 567", vehicle: "Bus Coaster - C042", status: "Disponible", license: "Catégorie ABC", rating: "4.8", joinedDate: "14/09/2025", email: "kasongo.driver@mail.cd", agencyId: "AGE-001", siteAccess: "Global" },
  { id: "DRV-002", name: "Marc Mbusa", phone: "+243 812 345 678", vehicle: "Toyota Probox - T108", status: "En mission", license: "Catégorie B", rating: "4.5", joinedDate: "02/11/2025", email: "mbusa@mail.cd", agencyId: "AGE-001", siteAccess: "Global" },
  { id: "DRV-003", name: "Alain Paluku", phone: "+243 973 456 789", vehicle: "Moto Kijima - M009", status: "Hors service", license: "Catégorie A", rating: "4.9", joinedDate: "20/01/2026", email: "paluku@mail.cd", agencyId: "AGE-001", siteAccess: "Global" },
];

export default function ChauffeursPage() {
  const { user } = useAuthStore();
  
  // États de la base de données locale
  const [drivers, setDrivers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  
  // États pour le mode d'affichage et les modals
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [selectedDriver, setSelectedDriver] = useState<AppUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // États du formulaire d'ajout d'un nouveau chauffeur
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newVehicle, setNewVehicle] = useState("");
  const [newLicense, setNewLicense] = useState("Catégorie B");

  // Charger les chauffeurs depuis localforage en filtrant par agence
  const loadDriversData = async () => {
    let allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
    
    // Si aucun utilisateur n'est présent ou s'il n'y a aucun chauffeur, on injecte les données de démo rattachées à l'agence courante
    const hasDrivers = allUsers.some(u => u.role === "Chauffeur");
    if (!hasDrivers && user?.agencyId) {
      const demoDrivers = initialDrivers.map(d => ({
        ...d,
        id: `DRV-${Math.floor(Math.random() * 900) + 100}`,
        agencyId: user.agencyId,
        role: "Chauffeur" as const,
        vehicleAssigned: d.vehicle,
      }));
      allUsers = [...allUsers, ...demoDrivers];
      await localforage.setItem(STORAGE_KEYS.USERS_LIST, allUsers);
    }

    // Filtrer pour n'afficher que les chauffeurs de l'agence de l'admin connecté
    const agencyDrivers = allUsers.filter(u => u.role === "Chauffeur" && u.agencyId === user?.agencyId);
    setDrivers(agencyDrivers);
  };

  useEffect(() => {
    loadDriversData();
  }, [user]);

  // Logique de soumission et d'écriture en BDD
  const handleAddDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    const newDriver: AppUser = {
      id: `DRV-${Math.floor(Math.random() * 900) + 100}`,
      name: newName,
      email: newEmail,
      password: newPassword,
      role: "Chauffeur",
      agencyId: user?.agencyId || null,
      siteAccess: "Global",
      phone: newPhone || "+243 --- --- ---",
      vehicleAssigned: newVehicle || "Aucun (En attente)"
    };

    // Propriétés étendues simulées pour matcher votre structure graphique initiale
    (newDriver as any).status = "Disponible";
    (newDriver as any).license = newLicense;
    (newDriver as any).rating = "5.0";
    (newDriver as any).joinedDate = new Date().toLocaleDateString("fr-FR");

    const allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
    await localforage.setItem(STORAGE_KEYS.USERS_LIST, [...allUsers, newDriver]);

    // Réinitialisation de l'état du formulaire
    setNewName(""); setNewEmail(""); setNewPassword(""); setNewPhone(""); setNewVehicle("");
    setIsAddModalOpen(false);
    
    // Rafraîchissement de la vue
    loadDriversData();
  };

  const filteredDrivers = drivers.filter(driver => 
    driver.name.toLowerCase().includes(search.toLowerCase()) || 
    (driver.phone && driver.phone.includes(search))
  );

  const openDetails = (driver: AppUser) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Gestion des Chauffeurs</h1>
          <p className="text-sm text-zinc-400">Suivi, documents et statuts opérationnels des chauffeurs de l'agence.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 w-full sm:w-auto cursor-pointer">
          <Plus size={18} />
          Ajouter un chauffeur
        </Button>
      </div>

      {/* Barre de contrôle : Recherche + Basculeur de vue */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <Input
            type="text"
            placeholder="Rechercher par nom ou numéro de téléphone..."
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

      {/* RENDU 1 : VUE EN CARTES (GRID) */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredDrivers.map((driver) => {
            const status = (driver as any).status || "Disponible";
            return (
              <Card 
                key={driver.id} 
                onClick={() => openDetails(driver)}
                className="border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <CardContent className="p-4 space-y-4">
                  
                  {/* Entête Carte : Nom & Statut */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-base">{driver.name}</h3>
                      <p className="text-xs text-zinc-500">ID: {driver.id}</p>
                    </div>
                    
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                      status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      status === "En mission" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Données de contact rapides */}
                  <div className="space-y-2 text-sm text-zinc-400 border-t border-zinc-800/60 pt-3">
                    <div className="flex items-center gap-2.5">
                      <Phone size={14} className="text-zinc-500" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Car size={14} className="text-zinc-500" />
                      <span>{driver.vehicleAssigned || (driver as any).vehicle}</span>
                    </div>
                  </div>

                  {/* Ligne inférieure de la carte */}
                  <div className="text-xs text-zinc-500 flex justify-between items-center pt-1">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={12} fill="currentColor"/> <span>{(driver as any).rating || "5.0"}</span>
                    </div>
                    <span className="text-primary hover:underline flex items-center gap-1">Profil <Eye size={12}/></span>
                  </div>

                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* RENDU 2 : VUE EN TABLEAU */}
      {viewMode === "table" && (
        <div className="w-full overflow-x-auto rounded-xl border border-zinc-800 bg-white dark:bg-[#121214]">
          <table className="w-full text-sm text-left text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-900 text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Chauffeur / ID</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="px-4 py-3">Véhicule Assigné</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filteredDrivers.map((driver) => {
                const status = (driver as any).status || "Disponible";
                return (
                  <tr 
                    key={driver.id} 
                    onClick={() => openDetails(driver)}
                    className="hover:bg-zinc-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      <div className="flex flex-col">
                        <span>{driver.name}</span>
                        <span className="text-xs text-zinc-500">{driver.id}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{driver.phone}</td>
                    <td className="px-4 py-3 text-zinc-300">{driver.vehicleAssigned || (driver as any).vehicle}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star size={12} fill="currentColor"/> {(driver as any).rating || "5.0"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        status === "Disponible" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        status === "En mission" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" onClick={() => openDetails(driver)} className="text-zinc-400 hover:text-white h-7">
                        Profil
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1 : AJOUT D'UN NOUVEAU CHAUFFEUR DANS LA BDD */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-800 text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Users size={18} className="text-primary"/> Enrôler un nouveau conducteur
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Le compte sera directement rattaché à votre agence.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddDriverSubmit} className="space-y-3 pt-2">
            <div className="space-y-0.5">
              <label className="text-[10px] text-zinc-400">Nom Complet</label>
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Patient Paluku" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Email de Connexion</label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="chauffeur@mail.com" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Mot de passe</label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" required />
              </div>
            </div>
            <div className="space-y-0.5">
              <label className="text-[10px] text-zinc-400">Numéro de Téléphone</label>
              <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+243..." className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Véhicule (Plaque/ID)</label>
                <Input value={newVehicle} onChange={e => setNewVehicle(e.target.value)} placeholder="Ex: Probox - A12" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
              </div>
              <div className="space-y-0.5">
                <label className="text-[10px] text-zinc-400">Permis de conduire</label>
                <Input value={newLicense} onChange={e => setNewLicense(e.target.value)} placeholder="Catégorie ABC" className="bg-zinc-900 border-zinc-800 text-xs h-8 text-white" />
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-zinc-800 text-zinc-300 h-8 text-xs cursor-pointer">Annuller</Button>
              <Button type="submit" className="bg-primary text-black font-bold h-8 text-xs cursor-pointer">Sauvegarder</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2 : PROFIL DÉTAILLÉ DU CHAUFFEUR */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-800 text-white max-w-md rounded-xl">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-primary uppercase mb-1">
              <Users size={14}/> Fiche Chauffeur
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-white">
              {selectedDriver?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Inscrit le {selectedDriver?.joinedDate || "Récemment"}
            </DialogDescription>
          </DialogHeader>

          {/* Corps d'informations du profil */}
          <div className="space-y-4 my-2 border-t border-b border-zinc-800/80 py-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Contact direct</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5">
                  <Phone size={14} className="text-zinc-500"/>{selectedDriver?.phone}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Type de Permis</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5">
                  <IdentificationCard size={14} className="text-zinc-500"/>{selectedDriver?.license || "Catégorie B"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Véhicule Actuel</span>
                <p className="text-zinc-200 font-medium flex items-center gap-1.5">
                  <Car size={14} className="text-zinc-500"/>{selectedDriver?.vehicleAssigned || selectedDriver?.vehicle}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-medium">Note Globale</span>
                <p className="text-amber-400 font-medium flex items-center gap-1">
                  <Star size={14} fill="currentColor"/> {selectedDriver?.rating || "5.0"} / 5
                </p>
              </div>
            </div>

            {/* Statut du dossier / Documents */}
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-zinc-400" />
                <div className="text-xs">
                  <p className="text-zinc-200 font-medium">Vérification des documents</p>
                  <p className="text-zinc-500">Permis & Dossier médical à jour</p>
                </div>
              </div>
              <CheckCircle2 size={18} className="text-emerald-400" />
            </div>
          </div>

          {/* Boutons d'actions */}
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-zinc-800 text-zinc-300 hover:bg-zinc-800 cursor-pointer">
              Fermer
            </Button>
            <Button className="bg-primary text-primary-foreground hover:opacity-90 cursor-pointer">
              Modifier le profil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}