"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, BadgeCheck, MapPin, Briefcase } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

const driverSchema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  license: z.string().min(5, "Numéro de permis requis"),
  type_contrat: z.enum(["salarie", "adherent"]),
  commission: z.string().optional(),
  salaireBase: z.string().optional(),
  status: z.enum(["dispo", "en_course", "conge", "suspendu"]),
  branchId: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function ChauffeursPage() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      license: "",
      type_contrat: "salarie",
      commission: "10",
      salaireBase: "0",
      status: "dispo",
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [driversRes, branchesRes] = await Promise.all([
        apiClient.get("/admin/chauffeurs"),
        apiClient.get("/succursales")
      ]);
      setDrivers(driversRes.data.data || driversRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des chauffeurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: DriverFormValues) => {
    try {
      setLoading(true);
      const payload = {
        name: values.name,
        email: values.email,
        telephone: values.phone,
        numeroPermis: values.license,
        statut_Enum: values.status,
        type_contrat: values.type_contrat,
        commission: parseFloat(values.commission || "0"),
        salaireBase: parseFloat(values.salaireBase || "0"),
        password: "password123", // Default for new, will be handled by backend usually
        password_confirmation: "password123"
      };

      if (editingDriver) {
        await apiClient.put(`/admin/chauffeurs/${editingDriver.id}`, payload);
        toast.success("Chauffeur mis à jour");
      } else {
        await apiClient.post("/admin/chauffeurs", payload);
        toast.success("Nouveau chauffeur enregistré");
      }
      
      await loadData();
      setIsDialogOpen(false);
      setEditingDriver(null);
      form.reset();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (driver: any) => {
    setEditingDriver(driver);
    form.reset({
      name: driver.name,
      email: driver.email,
      phone: driver.chauffeur?.telephone || "",
      license: driver.chauffeur?.numeroPermis || "",
      type_contrat: driver.chauffeur?.type_contrat || "salarie",
      commission: driver.chauffeur?.commission?.toString() || "10",
      salaireBase: driver.chauffeur?.salaireBase?.toString() || "0",
      status: driver.chauffeur?.statut_Enum || "dispo",
      branchId: driver.branchId || "global",
    });
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "dispo":
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase text-[10px]">Disponible</Badge>;
      case "en_course":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 uppercase text-[10px]">En course</Badge>;
      case "conge":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 uppercase text-[10px]">En congé</Badge>;
      case "suspendu":
        return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 uppercase text-[10px]">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">
            {user?.role === "Admin Succursale" ? "Nos Chauffeurs" : "Conducteurs de l'Agence"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "Admin Succursale" 
              ? "Gérez l'équipe de conducteurs affectée à votre site." 
              : "Gérez l'ensemble des chauffeurs à travers toutes les succursales."}
          </p>
        </div>
        <Button onClick={() => { 
          setEditingDriver(null); 
          form.reset({
            name: "", email: "", phone: "", license: "", vehicleAssigned: "", status: "Disponible",
            branchId: user?.role === "Admin Succursale" ? user.branchId || "global" : "global"
          }); 
          setIsDialogOpen(true); 
        }} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un chauffeur
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email..."
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
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Chauffeur</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact</TableHead>
              {user?.role === "Admin Agence" && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Affectation</TableHead>}
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  {user?.role === "Admin Agence" && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === "Admin Agence" ? 5 : 4} className="h-32 text-center text-muted-foreground italic border-border">
                  Aucun chauffeur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground leading-none">{driver.name}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {driver.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={10} className="text-primary/60" /> {driver.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                        <BadgeCheck size={10} className="text-primary/60" /> {driver.license}
                      </div>
                    </div>
                  </TableCell>
                  {user?.role === "Admin Agence" && (
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold border-border bg-muted/50 text-muted-foreground">
                        {branches.find(b => b.id === driver.branchId)?.name || "Siège Social"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex flex-col">
                      <Badge variant="outline" className={
                        driver.chauffeur?.type_contrat === "salarie" ? "border-zinc-500/50 text-zinc-500 bg-zinc-500/5" :
                        "border-orange-500/50 text-orange-500 bg-orange-500/5"
                      }>
                        {driver.chauffeur?.type_contrat === "salarie" ? "Salarié" : "Adhérent"}
                      </Badge>
                      {driver.chauffeur?.type_contrat === "adherent" && (
                        <span className="text-[9px] text-orange-600 font-bold mt-1">Frais Fret: {driver.chauffeur?.commission}%</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      driver.chauffeur?.statut_Enum === "dispo" ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" :
                      driver.chauffeur?.statut_Enum === "en_course" ? "border-blue-500/50 text-blue-500 bg-blue-500/5" :
                      "border-border text-muted-foreground bg-muted/50"
                    }>
                      {driver.chauffeur?.statut_Enum || "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)} className="h-8 w-8 hover:bg-muted">
                        <Edit2 className="h-4 w-4 text-muted-foreground" />
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
        <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-foreground tracking-tight">{editingDriver ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">Profil conducteur et affectation géographique.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Nom Complet</FormLabel>
                    <FormControl><Input placeholder="Jean Dupont" {...field} className="bg-muted/30 border-border" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Email</FormLabel>
                      <FormControl><Input placeholder="jean@motoka.com" {...field} className="bg-muted/30 border-border" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Téléphone</FormLabel>
                      <FormControl><Input placeholder="+243..." {...field} className="bg-muted/30 border-border" /></FormControl>
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
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Affectation (Succursale)</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[{ value: "global", label: "Siège Social / Agence" }, ...branches.map(b => ({ value: b.id, label: b.name }))]}
                        value={field.value || "global"}
                        onChange={field.onChange}
                        disabled={user?.role === "Admin Succursale"}
                      />
                    </FormControl>
                    {user?.role === "Admin Succursale" && (
                      <p className="text-[10px] text-muted-foreground mt-1 italic">Verrouillé sur votre site actuel.</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">N° Permis</FormLabel>
                      <FormControl><Input placeholder="P-123456" {...field} className="bg-muted/30 border-border font-mono" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Statut Initial</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "dispo", label: "Disponible" },
                            { value: "en_course", label: "En mission" },
                            { value: "conge", label: "Congé" },
                            { value: "suspendu", label: "Suspendu" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <FormField
                  control={form.control}
                  name="type_contrat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Type de Contrat</FormLabel>
                      <FormControl>
                        <Combobox
                          options={[
                            { value: "salarie", label: "Salarié (Véhicule Agence)" },
                            { value: "adherent", label: "Adhérent (Véhicule Propre)" },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("type_contrat") === "adherent" ? (
                  <FormField
                    control={form.control}
                    name="commission"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Frais Fret Agence (%)</FormLabel>
                        <FormControl><Input type="number" {...field} className="bg-muted/30 border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="salaireBase"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Salaire de Base (CDF)</FormLabel>
                        <FormControl><Input type="number" {...field} className="bg-muted/30 border-border" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-muted font-medium">Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">{editingDriver ? "Mettre à jour" : "Enregistrer"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
