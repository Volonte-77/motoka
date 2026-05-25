"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, User, Phone, Mail, BadgeCheck } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { AppUser, UserRole } from "@/types";
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

const driverSchema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  license: z.string().min(5, "Numéro de permis requis"),
  vehicleAssigned: z.string().optional(),
  status: z.enum(["Disponible", "Mission", "Maintenance", "Hors service"]),
});

type DriverFormValues = z.infer<typeof driverSchema>;

export default function ChauffeursPage() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<AppUser[]>([]);
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
    },
  });

  const loadDrivers = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const data = await mockApi.drivers.getAll(user?.agencyId || null);
    setDrivers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDrivers();
  }, [user?.agencyId]);

  const onSubmit = async (values: DriverFormValues) => {
    try {
      const driverData: AppUser = {
        id: editingDriver?.id || Math.random().toString(36).substr(2, 9),
        role: "Chauffeur" as UserRole,
        agencyId: user?.agencyId || "default-agency",
        siteAccess: "Agence",
        ...values,
      };

      await mockApi.drivers.save(driverData);
      await loadDrivers();
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl dark:text-white">Chauffeurs</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez les conducteurs et leurs affectations.</p>
        </div>
        <Button onClick={() => { setEditingDriver(null); form.reset(); setIsDialogOpen(true); }} className="bg-primary hover:bg-primary/90 text-white">
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
              <TableHead className="hidden md:table-cell">Permis</TableHead>
              <TableHead>Véhicule</TableHead>
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
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredDrivers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
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
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Mail size={10} /> {driver.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-xs font-medium dark:text-zinc-400">
                      <BadgeCheck size={12} className="text-primary" /> {driver.license}
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500 text-xs">
                    {driver.vehicleAssigned || "Non assigné"}
                  </TableCell>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-500/10 text-rose-500">
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
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>{editingDriver ? "Modifier le chauffeur" : "Ajouter un chauffeur"}</DialogTitle>
            <DialogDescription>Informations personnelles et professionnelles du conducteur.</DialogDescription>
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
                        <select {...field} className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm">
                          <option value="Disponible">Disponible</option>
                          <option value="Mission">En mission</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Hors service">Hors service</option>
                        </select>
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
