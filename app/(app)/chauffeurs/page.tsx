"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, BadgeCheck } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { AppUser, UserRole, Branch } from "@/types";
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

const driverSchema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  license: z.string().min(5, "Numéro de permis requis"),
  vehicleAssigned: z.string().optional(),
  status: z.enum(["Disponible", "Mission", "Maintenance", "Hors service"]),
  branchId: z.string().optional(),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function ChauffeursPage() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<AppUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<AppUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<DriverFormValues>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      license: "",
      vehicleAssigned: "",
      status: "Disponible",
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [driversData, branchesData] = await Promise.all([
      mockApi.drivers.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([])
    ]);
    
    setDrivers(driversData);
    setBranches(branchesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const onSubmit = async (values: DriverFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const selectedBranchName = branchId === "global" 
        ? "Siège Social" 
        : branches.find(b => b.id === branchId)?.name || "Succursale";

      const driverData: AppUser = {
        id: editingDriver?.id || Math.random().toString(36).substr(2, 9),
        role: "Chauffeur" as UserRole,
        agencyId: user?.agencyId || "default-agency",
        siteAccess: selectedBranchName,
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
        ...rest,
      };

      await mockApi.drivers.save(driverData);
      await loadData();
      setIsDialogOpen(false);
      setEditingDriver(null);
      form.reset();
      toast.success(editingDriver ? "Chauffeur mis à jour" : "Nouveau chauffeur enregistré");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du chauffeur");
    }
  };

  const handleEdit = (driver: AppUser) => {
    setEditingDriver(driver);
    form.reset({
      name: driver.name,
      email: driver.email,
      phone: driver.phone || "",
      license: driver.license || "",
      vehicleAssigned: driver.vehicleAssigned || "",
      status: (driver.status as any) || "Disponible",
      branchId: driver.branchId || "global",
    });
    setIsDialogOpen(true);
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">
            {user?.role === "Admin Succursale" ? "Nos Chauffeurs" : "Conducteurs de l'Agence"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
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
        }} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un chauffeur
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chauffeur</TableHead>
              <TableHead>Contact</TableHead>
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
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  {user?.role === "Admin Agence" && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === "Admin Agence" ? 5 : 4} className="h-32 text-center text-zinc-500">
                  Aucun chauffeur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredDrivers.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <User size={14} />
                      </div>
                      <div>
                        <p>{driver.name}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">ID: {driver.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Phone size={10} /> {driver.phone}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                        <BadgeCheck size={10} /> {driver.license}
                      </div>
                    </div>
                  </TableCell>
                  {user?.role === "Admin Agence" && (
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase font-bold border-zinc-200 dark:border-zinc-800">
                        {branches.find(b => b.id === driver.branchId)?.name || "Siège Social"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    <Badge variant="outline" className={
                      driver.status === "Disponible" ? "border-emerald-500/50 text-emerald-500 bg-emerald-500/5" :
                      driver.status === "Mission" ? "border-blue-500/50 text-blue-500 bg-blue-500/5" :
                      "border-zinc-500/50 text-zinc-500 bg-zinc-500/5"
                    }>
                      {driver.status || "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(driver)} className="h-8 w-8">
                        <Edit2 className="h-4 w-4 text-zinc-500" />
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
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle className="font-bold">{editingDriver ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</DialogTitle>
            <DialogDescription>Profil conducteur et affectation géographique.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom Complet</FormLabel>
                    <FormControl><Input placeholder="Jean Dupont" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
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
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="jean@motoka.com" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl><Input placeholder="+243..." {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
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
                    <FormLabel>Affectation (Succursale)</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "global", label: "Siège Social / Agence" },
                          ...branches.map(b => ({ value: b.id, label: b.name }))
                        ]}
                        value={field.value || "global"}
                        onChange={field.onChange}
                        placeholder="Affecter à un site"
                        disabled={user?.role === "Admin Succursale"}
                      />
                    </FormControl>
                    {user?.role === "Admin Succursale" && (
                      <p className="text-[10px] text-zinc-500 mt-1 italic">Verrouillé sur votre site actuel.</p>
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
                      <FormLabel>N° Permis</FormLabel>
                      <FormControl><Input placeholder="P-123456" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut Initial</FormLabel>
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
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">{editingDriver ? "Mettre à jour" : "Enregistrer"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
