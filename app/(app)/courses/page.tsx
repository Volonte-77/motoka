"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Calendar, Users as UsersIcon, ChevronRight, MoreHorizontal, Clock, Building2 } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Trip, TripStatus, Vehicle, AppUser, Branch } from "@/types";
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

const tripSchema = z.object({
  route: z.string().min(5, "L'itinéraire est requis"),
  driverId: z.string().min(1, "Veuillez sélectionner un chauffeur"),
  vehicleId: z.string().min(1, "Veuillez sélectionner un véhicule"),
  departureTime: z.string().min(1, "L'heure de départ est requise"),
  eta: z.string().optional(),
  passengers: z.preprocess((val) => Number(val), z.number().min(0)),
  load: z.string().optional(),
  status: z.enum(["Planifiée", "En cours", "Terminée", "Annulée"]),
  branchId: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<AppUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      route: "",
      driverId: "",
      vehicleId: "",
      departureTime: new Date().toISOString().slice(0, 16),
      eta: "Env. 4 heures",
      passengers: 0,
      load: "",
      status: "Planifiée",
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [tripsData, vehiclesData, driversData, branchesData] = await Promise.all([
      mockApi.trips.getAll(agencyId, branchId),
      mockApi.vehicles.getAll(agencyId, branchId),
      mockApi.drivers.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([])
    ]);

    setTrips(tripsData);
    setVehicles(vehiclesData.filter(v => v.status === "Disponible"));
    setDrivers(driversData.filter(d => d.status === "Disponible"));
    setBranches(branchesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const onSubmit = async (values: TripFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const selectedDriver = drivers.find(d => d.id === values.driverId);
      const selectedVehicle = vehicles.find(v => v.id === values.vehicleId);

      const tripData: Trip = {
        id: Math.random().toString(36).substr(2, 9),
        ...rest,
        driver: selectedDriver?.name || "Inconnu",
        vehicle: selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.plate})` : "Inconnu",
        agencyId: user?.agencyId || "default-agency",
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
      };

      await mockApi.trips.save(tripData);
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success("Course planifiée avec succès");
    } catch (error) {
      toast.error("Erreur lors de la planification de la course");
    }
  };

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case "Planifiée": return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/5">Planifiée</Badge>;
      case "En cours": return <Badge className="bg-amber-500 text-white border-none font-bold">En cours</Badge>;
      case "Terminée": return <Badge className="bg-emerald-500 text-white border-none font-bold">Terminée</Badge>;
      case "Annulée": return <Badge variant="destructive" className="font-bold">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredTrips = trips.filter(t => t.route.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground uppercase tracking-tighter">
            {user?.role === "Admin Succursale" ? "Planning des Courses" : "Flux des Courses"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "Admin Succursale" 
              ? `Vols et trajets au départ de ${branches.find(b => b.id === user.branchId)?.name || "votre succursale"}.` 
              : "Vue globale des mouvements de la flotte."}
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            route: "", driverId: "", vehicleId: "", departureTime: new Date().toISOString().slice(0, 16),
            eta: "Env. 4 heures", passengers: 0, load: "", status: "Planifiée",
            branchId: user?.role === "Admin Succursale" ? user.branchId || "global" : "global"
          });
          setIsDialogOpen(true);
        }} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-4">
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un itinéraire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/30 border-border"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-border bg-card"><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Aucune course trouvée.
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <Card key={trip.id} className="border-border bg-card hover:border-primary/50 transition-colors group cursor-pointer shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                            <MapPin size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-foreground leading-none tracking-tight">{trip.route}</span>
                            {user?.role === "Admin Agence" && (
                              <span className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-widest bg-muted/50 w-fit px-1.5 py-0.5 rounded">Site: {branches.find(b => b.id === trip.branchId)?.name || "Siège"}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          <div className="flex items-center gap-1.5"><Clock size={12} className="text-primary/60" /> {trip.departureTime.replace("T", " à ")}</div>
                          <div className="flex items-center gap-1.5"><UsersIcon size={12} className="text-primary/60" /> {trip.passengers} PAX</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Responsable</p>
                          <p className="text-sm font-bold text-foreground">{trip.driver}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{trip.vehicle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(trip.status)}
                          <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-4 space-y-6">
          <Card className="border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Statistiques Planning</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border">
                <span className="text-xs font-bold text-muted-foreground uppercase">Mouvements</span>
                <span className="font-bold text-xl text-foreground">{trips.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">Terminés</span>
                <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{trips.filter(t => t.status === "Terminée").length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase">En cours</span>
                <span className="font-bold text-xl text-amber-600 dark:text-amber-400">{trips.filter(t => t.status === "En cours").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-foreground">Planification Course</DialogTitle>
            <DialogDescription className="text-muted-foreground">Initialisez un nouveau trajet avec chauffeur et véhicule.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="route" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Itinéraire</FormLabel><FormControl><Input placeholder="Ex: Goma → Bukavu" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
              )} />

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Site de départ</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[{ value: "global", label: "Agence Centrale / Siège" }, ...branches.map(b => ({ value: b.id, label: b.name }))]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      disabled={user?.role === "Admin Succursale"}
                    />
                  </FormControl>
                  {user?.role === "Admin Succursale" && <p className="text-[10px] text-muted-foreground mt-1 italic">Verrouillé sur votre planning local.</p>}
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="driverId" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Chauffeur (Disponible)</FormLabel><FormControl><Combobox options={drivers.map(d => ({ value: d.id, label: d.name }))} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="vehicleId" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Véhicule (Disponible)</FormLabel><FormControl><Combobox options={vehicles.map(v => ({ value: v.id, label: `${v.model} (${v.plate})` }))} value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="departureTime" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Date & Heure</FormLabel><FormControl><Input type="datetime-local" {...field} className="bg-muted/30 border-border font-mono text-xs" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="passengers" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nb Passagers</FormLabel><FormControl><Input type="number" {...field} className="bg-muted/30 border-border font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-muted font-medium">Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">Confirmer le départ</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
