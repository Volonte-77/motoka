"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MoreHorizontal, Trash2, Edit2, Car, MapPin, Loader2 } from "lucide-react";
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
import apiClient from "@/lib/api-client";

// Schéma de validation Zod adapté au Backend
const vehicleSchema = z.object({
  modele: z.string().min(2, "Le modèle est requis"),
  immatriculation: z.string().min(3, "La plaque est requise"),
  TypeVehicule: z.enum(["bus", "taxi", "camion", "moto", "minibus"]),
  statut_enum: z.enum(["disponible", "en_mission", "maintenance", "hors_service"]),
  marque: z.string().min(2, "La marque est requise"),
  kilometrage: z.string().min(1, "Le kilométrage est requis"),
  Date_Expir_Assurance: z.string().min(1, "Date assurance requise"),
  visiteTech: z.string().min(1, "Date visite technique requise"),
  Idsuccursale: z.string().optional(),
  CapacitePassagers: z.string().min(1, "Capacité requise"),
  Capacite: z.string().min(1, "Capacité totale requise"),
  proprietaire_type: z.enum(["agence", "chauffeur"]),
  Idchauffeur: z.string().optional(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

export default function VehiculesPage() {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      modele: "",
      immatriculation: "",
      TypeVehicule: "bus",
      statut_enum: "disponible",
      marque: "Toyota",
      kilometrage: "0",
      Date_Expir_Assurance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      visiteTech: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      Idsuccursale: "global",
      CapacitePassagers: "15",
      Capacite: "15",
      proprietaire_type: "agence",
      Idchauffeur: "",
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [vehRes, branchesRes, driversRes] = await Promise.all([
        apiClient.get("/vehicules"),
        apiClient.get("/succursales"),
        apiClient.get("/admin/chauffeurs")
      ]);
      setVehicles(vehRes.data.data || vehRes.data);
      setBranches(branchesRes.data);
      setDrivers(driversRes.data.data || driversRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: VehicleFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        kilometrage: parseInt(values.kilometrage),
        CapacitePassagers: parseInt(values.CapacitePassagers),
        Capacite: parseInt(values.Capacite),
        Idsuccursale: values.Idsuccursale === "global" ? null : values.Idsuccursale,
        Idchauffeur: values.proprietaire_type === "chauffeur" ? values.Idchauffeur : null,
      };

      if (editingVehicle) {
        await apiClient.put(`/vehicules/${editingVehicle.id}`, payload);
        toast.success("Véhicule mis à jour");
      } else {
        await apiClient.post("/vehicules", payload);
        toast.success("Véhicule ajouté avec succès");
      }
      
      await loadData();
      setIsDialogOpen(false);
      setEditingVehicle(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (vehicle: any) => {
    setEditingVehicle(vehicle);
    form.reset({
      modele: vehicle.modele,
      immatriculation: vehicle.immatriculation,
      TypeVehicule: vehicle.type,
      statut_enum: vehicle.statut,
      marque: vehicle.marque,
      kilometrage: vehicle.kilometrage.toString(),
      Date_Expir_Assurance: vehicle.dates_importantes?.expiration_assurance || "",
      visiteTech: vehicle.dates_importantes?.visite_technique || "",
      Idsuccursale: vehicle.Idsuccursale ? vehicle.Idsuccursale.toString() : "global",
      CapacitePassagers: vehicle.capacite?.passagers.toString() || "0",
      Capacite: vehicle.capacite?.globale.toString() || "0",
      proprietaire_type: vehicle.proprietaire_type || "agence",
      Idchauffeur: vehicle.Idchauffeur ? vehicle.Idchauffeur.toString() : "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce véhicule ?")) {
      try {
        setLoading(true);
        await apiClient.delete(`/vehicules/${id}`);
        toast.success("Véhicule supprimé");
        await loadData();
      } catch (error) {
        toast.error("Erreur lors de la suppression");
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "disponible":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px]">Disponible</Badge>;
      case "en_mission":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px]">En mission</Badge>;
      case "maintenance":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[10px]">Maintenance</Badge>;
      case "hors_service":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase text-[10px]">Hors service</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredVehicles = vehicles.filter(
    (v) =>
      v.modele?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.immatriculation?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">Gestion du Parc</h1>
          <p className="text-sm text-muted-foreground">Suivi technique et opérationnel de vos véhicules.</p>
        </div>
        <Button 
          onClick={() => {
            setEditingVehicle(null);
            setIsDialogOpen(true);
          }}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Ajouter un véhicule
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par modèle ou plaque..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Véhicule</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Type</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Plaque</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Localisation</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && vehicles.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground italic border-border">
                  Aucun véhicule trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-muted border border-border group-hover:scale-110 transition-transform">
                        <Car size={16} className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-foreground font-bold">{vehicle.modele}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">{vehicle.marque}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs uppercase">{vehicle.type}</TableCell>
                  <TableCell className="font-mono text-xs font-bold tracking-wider text-foreground">{vehicle.immatriculation}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[9px] uppercase font-bold border-border bg-muted/50 text-muted-foreground">
                      {vehicle.succursale?.nom || "Siège Social"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(vehicle.statut)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(vehicle)} className="h-8 w-8 hover:bg-muted">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">
              {editingVehicle ? "Modifier le véhicule" : "Ajouter un véhicule"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Informations techniques et conformité légale.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="marque" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Marque</FormLabel><FormControl><Input placeholder="Toyota" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="modele" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Modèle</FormLabel><FormControl><Input placeholder="Coaster" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="immatriculation" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Plaque d'immatriculation</FormLabel><FormControl><Input placeholder="ABC-1234" {...field} className="bg-muted/30 border-border font-mono" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="TypeVehicule" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Type de Véhicule</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "bus", label: "Bus / Grand Format" },
                          { value: "minibus", label: "Minibus / Van" },
                          { value: "taxi", label: "Taxi / Voiture" },
                          { value: "camion", label: "Camion / Logistique" },
                          { value: "moto", label: "Moto / Coursier" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="statut_enum" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Statut Opérationnel</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "disponible", label: "Disponible" },
                          { value: "en_mission", label: "En mission" },
                          { value: "maintenance", label: "Maintenance" },
                          { value: "hors_service", label: "Hors service" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="Idsuccursale" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Affectation</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[{ value: "global", label: "Siège Social" }, ...branches.map(b => ({ value: b.Idsuccursale.toString(), label: b.nom }))]}
                        value={field.value || "global"}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField control={form.control} name="kilometrage" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Kilométrage</FormLabel><FormControl><Input type="number" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="CapacitePassagers" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Passagers</FormLabel><FormControl><Input type="number" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="Capacite" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Capacité Totale</FormLabel><FormControl><Input type="number" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="Date_Expir_Assurance" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Expiration Assurance</FormLabel><FormControl><Input type="date" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="visiteTech" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Visite Technique</FormLabel><FormControl><Input type="date" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <FormField control={form.control} name="proprietaire_type" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Propriété du Véhicule</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "agence", label: "Véhicule de l'Agence" },
                          { value: "chauffeur", label: "Véhicule du Chauffeur" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {form.watch("proprietaire_type") === "chauffeur" && (
                  <FormField control={form.control} name="Idchauffeur" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Chauffeur Propriétaire</FormLabel>
                      <FormControl>
                        <Combobox
                          options={drivers.map(d => ({ value: d.chauffeur?.Idchauffeur?.toString() || d.id.toString(), label: d.name }))}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={loading}>Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingVehicle ? "Enregistrer les modifications" : "Ajouter au parc"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
