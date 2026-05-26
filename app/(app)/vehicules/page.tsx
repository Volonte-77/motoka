"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Trash2, Edit2, Car } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Vehicle, VehicleStatus, Branch } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";

// Schéma de validation Zod
const vehicleSchema = z.object({
  model: z.string().min(2, "Le modèle est requis (min 2 caractères)"),
  plate: z.string().min(3, "La plaque d'immatriculation est requise"),
  type: z.enum(["Bus", "Taxi", "Camion", "Moto", "Autre"]),
  status: z.enum(["Disponible", "Mission", "Maintenance", "Hors service"]),
  owner: z.string().min(2, "Le propriétaire est requis"),
  mileage: z.string().min(1, "Le kilométrage est requis"),
  lastService: z.string().min(1, "La date du dernier entretien est requise"),
  branchId: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function VehiculesPage() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      model: "",
      plate: "",
      type: "Bus",
      status: "Disponible",
      owner: "Agence Interne",
      mileage: "0",
      lastService: new Date().toISOString().split("T")[0],
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [vehiclesData, branchesData] = await Promise.all([
      mockApi.vehicles.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([])
    ]);
    
    setVehicles(vehiclesData);
    setBranches(branchesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const vehicleData: Vehicle = {
        id: editingVehicle?.id || Math.random().toString(36).substr(2, 9),
        ...rest,
        agencyId: user?.agencyId || "default-agency",
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
      };

      await mockApi.vehicles.save(vehicleData);
      await loadData();
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
      toast.success(editingVehicle ? "Véhicule mis à jour" : "Véhicule ajouté avec succès");
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'enregistrement");
    }
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      model: vehicle.model,
      plate: vehicle.plate,
      type: vehicle.type,
      status: vehicle.status,
      owner: vehicle.owner,
      mileage: vehicle.mileage,
      lastService: vehicle.lastService,
      branchId: vehicle.branchId || "global",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      try {
        await mockApi.vehicles.delete(id);
        await loadData();
        toast.success("Véhicule supprimé");
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case "Disponible":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Disponible</Badge>;
      case "Mission":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">En mission</Badge>;
      case "Maintenance":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Maintenance</Badge>;
      case "Hors service":
        return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">Hors service</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">
            {user?.role === "Admin Succursale" ? "Parc Automobile Local" : "Véhicules de l'Agence"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.role === "Admin Succursale" 
              ? "Gérez les véhicules affectés à votre succursale." 
              : "Gérez l'ensemble de votre flotte à travers toutes les branches."}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingVehicle(null);
            form.reset({
              model: "",
              plate: "",
              type: "Bus",
              status: "Disponible",
              owner: "Agence Interne",
              mileage: "0",
              lastService: new Date().toISOString().split("T")[0],
              branchId: user?.role === "Admin Succursale" ? user.branchId || "global" : "global",
            });
            setIsDialogOpen(true);
          }}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter un véhicule
        </Button>
      </div>

      {/* Filtres & Recherche */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher par modèle ou plaque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Liste des véhicules */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Véhicule</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Plaque</TableHead>
              {user?.role === "Admin Agence" && <TableHead>Affectation</TableHead>}
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  {user?.role === "Admin Agence" && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === "Admin Agence" ? 6 : 5} className="h-32 text-center text-zinc-500">
                  Aucun véhicule trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-zinc-100 dark:bg-zinc-800">
                        <Car size={16} className="text-zinc-500" />
                      </div>
                      <div className="flex flex-col">
                        <span>{vehicle.model}</span>
                        <span className="text-[10px] text-zinc-500 uppercase font-mono">{vehicle.owner}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs">{vehicle.type}</TableCell>
                  <TableCell className="font-mono text-xs font-bold tracking-wider">{vehicle.plate}</TableCell>
                  {user?.role === "Admin Agence" && (
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold border-zinc-200 dark:border-zinc-800">
                        {branches.find(b => b.id === vehicle.branchId)?.name || "Siège Social"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)} className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                        <Edit2 className="h-4 w-4 text-zinc-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)} className="h-8 w-8 hover:bg-rose-500/10 text-rose-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Dialog Ajout/Edition */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white font-bold">
              {editingVehicle ? "Modifier le véhicule" : "Ajouter un véhicule"}
            </DialogTitle>
            <DialogDescription>
              Informations techniques et affectation géographique.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota Coaster" {...field} className="bg-zinc-50 dark:bg-zinc-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="plate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plaque</FormLabel>
                      <FormControl>
                        <Input placeholder="ABC-1234" {...field} className="bg-zinc-50 dark:bg-zinc-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "Bus", label: "Bus" },
                            { value: "Taxi", label: "Taxi" },
                            { value: "Camion", label: "Camion" },
                            { value: "Moto", label: "Moto" },
                            { value: "Autre", label: "Autre" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Choisir le type"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "Disponible", label: "Disponible" },
                            { value: "Mission", label: "En mission" },
                            { value: "Maintenance", label: "Maintenance" },
                            { value: "Hors service", label: "Hors service" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Choisir le statut"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affectation Géographique</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "global", label: "Siège Social / Agence" },
                          ...branches.map(b => ({ value: b.id, label: b.name }))
                        ]}
                        value={field.value || "global"}
                        onChange={field.onChange}
                        placeholder="Affecter à une succursale"
                        disabled={user?.role === "Admin Succursale"}
                      />
                    </FormControl>
                    {user?.role === "Admin Succursale" && (
                      <p className="text-[10px] text-zinc-500 mt-1 italic">Verrouillé sur votre succursale.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kilométrage</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-zinc-50 dark:bg-zinc-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastService"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dernier entretien</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="bg-zinc-50 dark:bg-zinc-900" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="dark:text-zinc-400">
                  Annuler
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  {editingVehicle ? "Enregistrer les modifications" : "Ajouter le véhicule"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
