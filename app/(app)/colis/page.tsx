"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Package as PackageIcon, User, Phone, MapPin, QrCode, ShieldCheck, Building2 } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Package, PackageStatus, Branch } from "@/types";
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

const packageSchema = z.object({
  sender: z.string().min(3, "Expéditeur requis"),
  receiver: z.string().min(3, "Destinataire requis"),
  phoneReceiver: z.string().min(8, "Téléphone destinataire requis"),
  description: z.string().min(5, "Description requise"),
  route: z.string().min(5, "Itinéraire requis"),
  weight: z.string().optional(),
  value: z.string().optional(),
  status: z.enum(["En attente", "En transit", "Livré", "Annulé"]),
  branchId: z.string().optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

export default function ColisPage() {
  const { user } = useAuthStore();
  const [packages, setPackages] = useState<Package[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
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
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [packagesData, branchesData] = await Promise.all([
      mockApi.packages.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([])
    ]);

    setPackages(packagesData);
    setBranches(branchesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const onSubmit = async (values: PackageFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const pkgData: Package = {
        id: "PKG-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        agencyId: user?.agencyId || "default-agency",
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
        ...rest,
      };

      await mockApi.packages.save(pkgData);
      await loadData();
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
      case "En attente": return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/5 font-bold">En attente</Badge>;
      case "En transit": return <Badge className="bg-blue-500 text-white border-none font-bold">En transit</Badge>;
      case "Livré": return <Badge className="bg-emerald-500 text-white border-none font-bold">Livré</Badge>;
      case "Annulé": return <Badge variant="destructive" className="font-bold">Annulée</Badge>;
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground uppercase tracking-tighter">
            {user?.role === "Admin Succursale" ? "Registre des Colis" : "Fret & Logistique"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === "Admin Succursale" 
              ? `Colis enregistrés à ${branches.find(b => b.id === user.branchId)?.name || "votre succursale"}.` 
              : "Suivi global des expéditions de l'agence."}
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            sender: "", receiver: "", phoneReceiver: "", description: "", route: "", weight: "1kg", value: "0 FCFA", status: "En attente",
            branchId: user?.role === "Admin Succursale" ? user.branchId || "global" : "global"
          });
          setIsDialogOpen(true);
        }} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Nouvel Envoi
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, expéditeur ou destinataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card"><CardContent className="p-4"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))
        ) : filteredPackages.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl font-medium italic">
            Aucun colis enregistré.
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="border-border bg-card overflow-hidden group hover:border-primary/50 transition-all duration-300 shadow-sm">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex flex-col">
                  <span className="text-xs font-mono font-bold text-primary tracking-widest">{pkg.id}</span>
                  {user?.role === "Admin Agence" && (
                    <span className="text-[8px] uppercase font-bold text-muted-foreground mt-0.5 tracking-tighter">Site: {branches.find(b => b.id === pkg.branchId)?.name || "Siège"}</span>
                  )}
                </div>
                {getStatusBadge(pkg.status)}
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b border-border/50 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Expéditeur</p>
                    <p className="text-sm font-bold text-foreground truncate">{pkg.sender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Destinataire</p>
                    <p className="text-sm font-bold text-foreground truncate">{pkg.receiver}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                  <MapPin size={12} className="text-primary/70" /> {pkg.route}
                </div>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10">
                    <ShieldCheck size={14} /> {pkg.otp}
                  </div>
                  <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border bg-muted/50 hover:bg-primary hover:text-primary-foreground font-bold transition-all">
                    <QrCode size={12} /> ÉTIQUETTE
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-bold text-xl text-foreground">Enregistrement Fret</DialogTitle>
            <DialogDescription className="text-muted-foreground">Générez un bordereau d'expédition et un code OTP.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sender" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Expéditeur</FormLabel><FormControl><Input placeholder="Nom complet" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="receiver" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Destinataire</FormLabel><FormControl><Input placeholder="Nom complet" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Dépôt d'enregistrement</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[{ value: "global", label: "Agence Centrale / Siège" }, ...branches.map(b => ({ value: b.id, label: b.name }))]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      disabled={user?.role === "Admin Succursale"}
                    />
                  </FormControl>
                  {user?.role === "Admin Succursale" && <p className="text-[10px] text-muted-foreground mt-1 italic">Verrouillé sur votre dépôt local.</p>}
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="phoneReceiver" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Tél. Destinataire</FormLabel><FormControl><Input placeholder="+243..." {...field} className="bg-muted/30 border-border font-mono" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="route" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Itinéraire</FormLabel><FormControl><Input placeholder="Goma → Bukavu" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Contenu du colis</FormLabel><FormControl><Input placeholder="Description précise" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Poids (Est.)</FormLabel><FormControl><Input placeholder="Ex: 5kg" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase text-muted-foreground">Valeur déclarée</FormLabel><FormControl><Input placeholder="Valeur en FCFA" {...field} className="bg-muted/30 border-border font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-muted font-medium">Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">Confirmer l'expédition</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
