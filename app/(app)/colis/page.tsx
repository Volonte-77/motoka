"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Package as PackageIcon, User, Phone, MapPin, QrCode, ShieldCheck } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Package, PackageStatus } from "@/types";
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

const packageSchema = z.object({
  sender: z.string().min(3, "Expéditeur requis"),
  receiver: z.string().min(3, "Destinataire requis"),
  phoneReceiver: z.string().min(8, "Téléphone destinataire requis"),
  description: z.string().min(5, "Description requise"),
  route: z.string().min(5, "Itinéraire requis"),
  weight: z.string().optional(),
  value: z.string().optional(),
  status: z.enum(["En attente", "En transit", "Livré", "Annulé"]),
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function ColisPage() {
  const { user } = userAuthStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      sender: "",
      receiver: "",
      phoneReceiver: "",
      description: "",
      route: "",
      weight: "1kg",
      value: "0 FCFA",
      status: "En attente",
    },
  });

  const loadPackages = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const data = await mockApi.packages.getAll(user?.agencyId || null);
    setPackages(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPackages();
  }, [user?.agencyId]);

  const onSubmit = async (values: PackageFormValues) => {
    try {
      const pkgData: Package = {
        id: "PKG-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        agencyId: user?.agencyId || "default-agency",
        ...values,
      };

      await mockApi.packages.save(pkgData);
      await loadPackages();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`Colis enregistré ! OTP: ${pkgData.otp}`, {
        description: "Communiquez ce code au destinataire pour la récupération.",
        duration: 5000,
      });
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement du colis");
    }
  };

  const getStatusBadge = (status: PackageStatus) => {
    switch (status) {
      case "En attente": return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5">En attente</Badge>;
      case "En transit": return <Badge className="bg-blue-500 text-white">En transit</Badge>;
      case "Livré": return <Badge className="bg-emerald-500 text-white">Livré</Badge>;
      case "Annulé": return <Badge variant="destructive">Annulé</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const filteredPackages = packages.filter(p => 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.receiver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Gestion des Colis</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Suivez les expéditions et livraisons de fret.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Nouvel Envoi
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher par ID, expéditeur ou destinataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800"><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))
        ) : filteredPackages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            Aucun colis enregistré.
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
                <span className="text-xs font-mono font-bold text-primary">{pkg.id}</span>
                {getStatusBadge(pkg.status)}
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Expéditeur</p>
                    <p className="text-sm font-medium dark:text-zinc-200 truncate">{pkg.sender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">Destinataire</p>
                    <p className="text-sm font-medium dark:text-zinc-200 truncate">{pkg.receiver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <MapPin size={12} /> {pkg.route}
                </div>
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck size={14} /> OTP: {pkg.otp}
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 hover:bg-primary/10 hover:text-primary">
                    <QrCode size={12} /> Étiquette
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Enregistrer un nouveau colis</DialogTitle>
            <DialogDescription>Saisissez les informations d'expédition pour générer le code de suivi.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sender" render={({ field }) => (
                  <FormItem><FormLabel>Expéditeur</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="receiver" render={({ field }) => (
                  <FormItem><FormLabel>Destinataire</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phoneReceiver" render={({ field }) => (
                  <FormItem><FormLabel>Tél. Destinataire</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="route" render={({ field }) => (
                  <FormItem><FormLabel>Itinéraire</FormLabel><FormControl><Input placeholder="Goma → Bukavu" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description du contenu</FormLabel><FormControl><Input placeholder="Sac de farine, carton d'huile..." {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel>Poids (Est.)</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel>Valeur déclarée</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">Générer Envoi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Correction d'une faute de frappe dans l'import/usage de useAuthStore
import { useAuthStore as userAuthStore } from "@/store/useAuthStore";
