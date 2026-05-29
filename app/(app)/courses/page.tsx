"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Search, MapPin, Calendar, Users as UsersIcon, ChevronRight, MoreHorizontal, Clock, Building2, Printer, Wallet } from "lucide-react";
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
import { useReactToPrint } from "react-to-print";
import { A4Invoice } from "@/components/print/print-components";
import apiClient from "@/lib/api-client";

const tripSchema = z.object({
  nomCourse: z.string().min(5, "L'itinéraire est requis"),
  Idchauffeur: z.string().min(1, "Veuillez sélectionner un chauffeur"),
  Idvehicule: z.string().min(1, "Veuillez sélectionner un véhicule"),
  departureTime: z.string().min(1, "L'heure de départ est requise"),
  PrixReel: z.string().min(1, "Le prix est requis"),
  paye_a: z.enum(["chauffeur", "agence"]),
  passengers: z.preprocess((val) => Number(val), z.number().min(0)),
  load: z.string().optional(),
  statut_enum: z.enum(["en_attente", "en_cours", "termine", "annulee"]),
  Idsuccursale: z.string().optional(),
});

type TripFormValues = z.infer<typeof tripSchema>;

export default function CoursesPage() {
  const { user } = useAuthStore();
  const [trips, setTrips] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const printRef = useRef<HTMLDivElement>(null);
  const [selectedTripForPrint, setSelectedTripForPrint] = useState<any | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Ticket_Course_${selectedTripForPrint?.id}`,
  });

  const triggerPrint = (trip: any) => {
    setSelectedTripForPrint(trip);
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  const form = useForm<TripFormValues>({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      nomCourse: "",
      Idchauffeur: "",
      Idvehicule: "",
      departureTime: new Date().toISOString().slice(0, 16),
      PrixReel: "0",
      paye_a: "chauffeur",
      passengers: 0,
      load: "",
      statut_enum: "en_attente",
      Idsuccursale: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [tripsRes, vehRes, driversRes, branchesRes] = await Promise.all([
        apiClient.get("/courses"),
        apiClient.get("/vehicules/disponibles"),
        apiClient.get("/admin/chauffeurs"),
        apiClient.get("/succursales")
      ]);

      setTrips(tripsRes.data.data || tripsRes.data);
      setVehicles(vehRes.data.data || vehRes.data);
      setDrivers(driversRes.data.data || driversRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: TripFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        PrixReel: parseFloat(values.PrixReel),
        PrixEstime: parseFloat(values.PrixReel),
        AdresseDepart: values.nomCourse.split("→")[0]?.trim() || "Départ",
        AdresseArrive: values.nomCourse.split("→")[1]?.trim() || "Arrivée",
        LatitudeDepart: 0, LongitudeDepart: 0, LatitudeArrivee: 0, LongitudeArrive: 0,
        Distance_Km: 0,
        Idclient: 1, // Default or select client
        Idsuccursale: values.Idsuccursale === "global" ? null : values.Idsuccursale,
      };

      await apiClient.post("/courses", payload);
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success("Course planifiée avec succès");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "en_attente": return <Badge variant="outline" className="border-blue-500/50 text-blue-500 bg-blue-500/5">Planifiée</Badge>;
      case "en_cours": return <Badge className="bg-amber-500 text-white border-none font-bold">En cours</Badge>;
      case "termine": return <Badge className="bg-emerald-500 text-white border-none font-bold">Terminée</Badge>;
      case "annulee": return <Badge variant="destructive" className="font-bold">Annulée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredTrips = trips.filter(t => t.nomCourse?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* COMPOSANT CACHÉ POUR L'IMPRESSION (A4) */}
      <div className="hidden">
        {agency && selectedTripForPrint && (
          <A4Invoice ref={printRef} trip={selectedTripForPrint} agency={agency} />
        )}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground uppercase tracking-tighter">
            Planning des Courses
          </h1>
          <p className="text-sm text-muted-foreground">
            Vue globale et gestion opérationnelle des mouvements.
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white hover:bg-primary/90 font-bold">
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
                <Card key={i} className="p-4"><Skeleton className="h-20 w-full" /></Card>
              ))
            ) : filteredTrips.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
                Aucune course trouvée.
              </div>
            ) : (
              filteredTrips.map((trip) => (
                <Card key={trip.id} className="border-border bg-card hover:border-primary/50 transition-colors group cursor-pointer shadow-sm" onClick={() => triggerPrint(trip)}>
                  <CardContent className="p-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="font-bold text-lg text-foreground tracking-tight">{trip.route}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                          <div className="flex items-center gap-1.5"><Clock size={12} /> {trip.departureTime.replace("T", " à ")}</div>
                          <div className="flex items-center gap-1.5"><UsersIcon size={12} /> {trip.passengers} PAX</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right hidden md:block">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{trip.driver}</p>
                          <p className="text-[10px] text-zinc-400 font-mono">{trip.vehicle}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(trip.status)}
                          <Button variant="outline" size="icon" className="h-8 w-8 hover:bg-primary hover:text-white" onClick={(e) => { e.stopPropagation(); triggerPrint(trip); }}>
                            <Printer size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="md:col-span-4">
          <Card className="border-border bg-card shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Stats Planning</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                <span className="text-xs font-bold text-muted-foreground uppercase">Mouvements</span>
                <span className="font-bold text-xl">{trips.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Planification Course</DialogTitle>
            <DialogDescription>Détails du trajet et assignation opérationnelle.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="nomCourse" render={({ field }) => (
                <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Itinéraire (Ex: Goma → Butembo)</FormLabel><FormControl><Input placeholder="Goma → Butembo" {...field} className="bg-muted/30 border-border font-bold" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="Idchauffeur" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Chauffeur</FormLabel>
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
                <FormField control={form.control} name="Idvehicule" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Véhicule</FormLabel>
                    <FormControl>
                      <Combobox 
                        options={vehicles.map(v => ({ value: v.id.toString(), label: `${v.modele} (${v.immatriculation})` }))} 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="PrixReel" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Prix du Trajet (CDF)</FormLabel>
                    <FormControl><Input type="number" {...field} className="bg-muted/30 border-border font-bold text-primary" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="paye_a" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Paiement reçu par</FormLabel>
                    <FormControl>
                      <Combobox 
                        options={[
                          { value: "chauffeur", label: "Directement au Chauffeur" },
                          { value: "agence", label: "À la Caisse de l'Agence" },
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
                <FormField control={form.control} name="departureTime" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs uppercase font-bold text-muted-foreground">Date & Heure de Départ</FormLabel><FormControl><Input type="datetime-local" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="statut_enum" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase font-bold text-muted-foreground">Statut</FormLabel>
                    <FormControl>
                      <Combobox 
                        options={[
                          { value: "en_attente", label: "Planifiée / En attente" },
                          { value: "en_cours", label: "En cours de route" },
                          { value: "termine", label: "Arrivée / Terminée" },
                        ]} 
                        value={field.value} 
                        onChange={field.onChange} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <DialogFooter className="pt-4">
                <Button type="submit" className="w-full font-bold bg-primary text-primary-foreground hover:bg-primary/90 py-6 text-lg" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmer la Planification
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
