"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  Plus, Search, Package as PackageIcon, User, Phone, 
  MapPin, QrCode, ShieldCheck, LayoutGrid, List, Filter,
  History, ArchiveRestore, Clock, ChevronRight
} from "lucide-react";
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
import { cn } from "@/lib/utils";

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
  
  // Nouveaux états pour l'affichage intelligent
  const [displayMode, setDisplayMode] = useState<"table" | "grid">("table");
  const [showArchived, setShowArchived] = useState(false); // Par défaut on ne montre pas l'historique

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

  // LOGIQUE DE FILTRAGE INTELLIGENTE
  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      // 1. Filtrage par recherche
      const matchesSearch = 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiver.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      // 2. Filtrage intelligent (Archive vs Actif)
      if (!showArchived) {
        // Cacher si déjà livré ou annulé (On ne garde que l'opérationnel)
        const isStale = p.status === "Livré" || p.status === "Annulé";
        if (isStale) return false;
      }

      return true;
    });
  }, [packages, searchTerm, showArchived]);

  const onSubmit = async (values: PackageFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const pkgData: Package = {
        id: "PKG-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        agencyId: user?.agencyId || "default-agency",
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
        // Ensure non-optional fields expected by Package type are provided
        weight: rest.weight ?? "1kg",
        value: rest.value ?? "0 FCFA",
        ...rest,
      };

      await mockApi.packages.save(pkgData);
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`Colis enregistré ! OTP: ${pkgData.otp}`);
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

  return (
    <div className="space-y-6">
      {/* HEADER AVEC CONTRÔLES D'AFFICHAGE */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground uppercase tracking-tighter flex items-center gap-2">
            <PackageIcon className="text-primary h-8 w-8" />
            {showArchived ? "Historique des Colis" : "Registre des Colis Actifs"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {showArchived 
              ? "Consultation des archives et livraisons passées." 
              : "Gestion des expéditions en cours de traitement."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle Archive */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowArchived(!showArchived)}
            className={cn(
              "h-9 px-4 gap-2 font-bold text-[10px] uppercase tracking-widest border-border transition-all",
              showArchived ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-card hover:bg-muted"
            )}
          >
            {showArchived ? <History size={14} /> : <ArchiveRestore size={14} />}
            {showArchived ? "Voir Actifs" : "Voir Archives"}
          </Button>

          {/* Sélecteur de Mode d'Affichage */}
          <div className="bg-muted/50 p-1 rounded-xl border border-border flex items-center gap-1">
            <Button 
              variant={displayMode === "table" ? "default" : "ghost"} 
              size="icon" 
              onClick={() => setDisplayMode("table")}
              className={cn("h-7 w-7 rounded-lg", displayMode === "table" && "shadow-sm")}
            >
              <List size={14} />
            </Button>
            <Button 
              variant={displayMode === "grid" ? "default" : "ghost"} 
              size="icon" 
              onClick={() => setDisplayMode("grid")}
              className={cn("h-7 w-7 rounded-lg", displayMode === "grid" && "shadow-sm")}
            >
              <LayoutGrid size={14} />
            </Button>
          </div>

          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-sm h-9">
            <Plus className="mr-2 h-4 w-4" /> Nouvel Envoi
          </Button>
        </div>
      </div>

      {/* RECHERCHE INTELLIGENTE */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par ID, expéditeur ou destinataire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border focus-visible:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className={displayMode === "grid" ? "grid gap-4 md:grid-cols-3" : "space-y-2"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border bg-card p-4"><Skeleton className="h-32 w-full" /></Card>
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-2xl">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <PackageIcon size={32} className="text-muted-foreground opacity-20" />
          </div>
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Aucun colis correspondant</p>
          <Button variant="link" onClick={() => setShowArchived(true)} className="text-primary mt-2">Consulter les archives ?</Button>
        </div>
      ) : (
        <>
          {displayMode === "table" ? (
            /* VUE TABLEAU (Par Défaut) */
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow className="border-border">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Colis ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Expéditeur / Dest.</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hidden md:table-cell">Itinéraire</TableHead>
                    {user?.role === "Admin Agence" && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Provenance</TableHead>}
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Statut</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id} className="hover:bg-muted/30 border-border transition-colors group">
                      <TableCell className="font-mono text-[11px] font-bold text-primary tracking-tighter">{pkg.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-foreground leading-none">{pkg.sender}</span>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            <ChevronRight size={10} className="text-primary" /> {pkg.receiver}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
                          <MapPin size={12} className="text-primary/60" /> {pkg.route}
                        </div>
                      </TableCell>
                      {user?.role === "Admin Agence" && (
                        <TableCell>
                          <Badge variant="outline" className="text-[8px] uppercase font-bold border-border bg-muted/50 text-muted-foreground">
                            {branches.find(b => b.id === pkg.branchId)?.name || "Siège Social"}
                          </Badge>
                        </TableCell>
                      )}
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10">
                          <ShieldCheck size={12} /> {pkg.otp}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            /* VUE GRILLE */
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
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
              ))}
            </div>
          )}
        </>
      )}

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
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Tél. Destinataire</FormLabel>
                    <FormControl>
                      <Input placeholder="+243..." {...field} className="bg-muted/30 border-border font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="route" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-muted-foreground">Itinéraire</FormLabel>
                    <FormControl>
                      <Input placeholder="Goma → Bukavu" {...field} className="bg-muted/30 border-border" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
