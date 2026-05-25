"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, MapPin, Calendar, Users as UsersIcon, ChevronRight, MoreHorizontal, Clock } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Trip, TripStatus, Vehicle, AppUser } from "@/types";
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
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<AppUser[]>([]);
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
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const [tripsData, vehiclesData, driversData] = await Promise.all([
      mockApi.trips.getAll(agencyId),
      mockApi.vehicles.getAll(agencyId),
      mockApi.drivers.getAll(agencyId),
    ]);
    setTrips(tripsData);
    setVehicles(vehiclesData.filter(v => v.status === "Disponible"));
    setDrivers(driversData.filter(d => d.status === "Disponible"));
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId]);

  const onSubmit = async (values: TripFormValues) => {
    try {
      const selectedDriver = drivers.find(d => d.id === values.driverId);
      const selectedVehicle = vehicles.find(v => v.id === values.vehicleId);

      const tripData: Trip = {
        id: Math.random().toString(36).substr(2, 9),
        ...values,
        driver: selectedDriver?.name || "Inconnu",
        vehicle: selectedVehicle ? `${selectedVehicle.model} (${selectedVehicle.plate})` : "Inconnu",
        agencyId: user?.agencyId || "default-agency",
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
      case "En cours": return <Badge className="bg-amber-500 text-white">En cours</Badge>;
      case "Terminée": return <Badge className="bg-emerald-500 text-white">Terminée</Badge>;
      case "Annulée": return <Badge variant="destructive">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredTrips = trips.filter(t => t.route.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Courses & Trajets</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Planifiez et suivez les voyages de vos véhicules.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Course
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-4">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Rechercher un itinéraire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-zinc-50 dark:bg-zinc-900"
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-zinc-200 dark:border-zinc-800"><CardContent className="p-4"><Skeleton className="h-20 w-full" /></CardContent></Card>
              ))
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                Aucune course planifiée.
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <Card key={trip.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:border-primary/50 transition-colors group cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <MapPin size={18} />
                          </div>
                          <span className="font-bold text-lg text-zinc-900 dark:text-white">{trip.route}</span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-zinc-500">
                          <div className="flex items-center gap-1.5"><Clock size={14} /> {trip.departureTime.replace("T", " à ")}</div>
                          <div className="flex items-center gap-1.5"><UsersIcon size={14} /> {trip.passengers} passagers</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Chauffeur & Véhicule</p>
                          <p className="text-sm font-medium dark:text-zinc-300">{trip.driver}</p>
                          <p className="text-[10px] text-zinc-500">{trip.vehicle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(trip.status)}
                          <ChevronRight size={20} className="text-zinc-300 group-hover:text-primary transition-colors" />
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
          <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
            <CardHeader><CardTitle className="text-sm">Aujourd'hui</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-500">Total Courses</span>
                <span className="font-bold text-xl">{trips.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-sm text-emerald-600 dark:text-emerald-400">Terminées</span>
                <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{trips.filter(t => t.status === "Terminée").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Planifier une nouvelle course</DialogTitle>
            <DialogDescription>Assignez un chauffeur et un véhicule à un itinéraire.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="route"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itinéraire (Ex: Goma → Butembo)</FormLabel>
                    <FormControl><Input placeholder="Ville départ → Ville arrivée" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chauffeur</FormLabel>
                      <FormControl>
                        <Combobox
                          options={drivers.map(d => ({ value: d.id, label: d.name }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner un chauffeur"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Véhicule</FormLabel>
                      <FormControl>
                        <Combobox
                          options={vehicles.map(v => ({ value: v.id, label: `${v.model} (${v.plate})` }))}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Sélectionner un véhicule"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Heure de départ</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="passengers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de passagers</FormLabel>
                      <FormControl><Input type="number" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">Créer la course</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
