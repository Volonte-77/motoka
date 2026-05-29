"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Plus, Search, Package as PackageIcon, User, Phone, 
  MapPin, QrCode, ShieldCheck, LayoutGrid, List, Filter,
  History, ArchiveRestore, Clock, ChevronRight, Printer
} from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Package, PackageStatus, Branch, Agency } from "@/types";
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
import { useReactToPrint } from "react-to-print";
import { ThermalReceipt } from "@/components/print/print-components";

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
  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState(false);

  // ÉTATS POUR L'IMPRESSION CIBLÉE (80mm)
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedPkgForPrint, setSelectedPkgForPrint] = useState<Package | null>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Recu_Colis_${selectedPkgForPrint?.id}`,
  });

  const triggerPrint = (pkg: Package) => {
    setSelectedPkgForPrint(pkg);
    // Délai pour assurer le rendu React avant capture
    setTimeout(() => {
      handlePrint();
    }, 150);
  };

  useEffect(() => { setIsClient(true); }, []);

  // Nouveaux états pour l'affichage intelligent
  const [displayMode, setDisplayMode] = useState<"table" | "grid">("table");
  const [showArchived, setShowArchived] = useState(false); 

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      sender: "",
      receiver: "",
      phoneReceiver: "",
      description: "",
      route: "",
      weight: "1kg",
      value: "0 CDF",
      status: "En attente",
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [packagesData, branchesData, agenciesData] = await Promise.all([
      mockApi.packages.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([]),
      mockApi.agencies.getAll()
    ]);

    setPackages(packagesData);
    setBranches(branchesData);
    if (agencyId) {
      setAgency(agenciesData.find(a => a.id === agencyId) || null);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const filteredPackages = useMemo(() => {
    return packages.filter(p => {
      const matchesSearch = 
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.receiver.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (!matchesSearch) return false;

      if (!showArchived) {
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
        weight: rest.weight ?? "1kg",
        value: rest.value ?? "0 CDF",
        price: 0,
        paymentMode: "Agence",
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
      {/* COMPOSANT CACHÉ POUR L'IMPRESSION (80mm) */}
      <div className="hidden">
        {agency && selectedPkgForPrint && (
          <ThermalReceipt ref={printRef} pkg={selectedPkgForPrint} agency={agency} />
        )}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground uppercase tracking-tighter flex items-center gap-2">
            <PackageIcon className="text-primary h-8 w-8" />
            {showArchived ? "Historique des Colis" : "Registre des Colis Actifs"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {showArchived ? "Consultation des archives passées." : "Gestion des expéditions en cours."}
          </p>
        </div>

        <div className="flex items-center gap-2">
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

          <div className="bg-muted/50 p-1 rounded-xl border border-border flex items-center gap-1">
            <Button variant={displayMode === "table" ? "default" : "ghost"} size="icon" onClick={() => setDisplayMode("table")} className="h-7 w-7 rounded-lg">
              <List size={14} />
            </Button>
            <Button variant={displayMode === "grid" ? "default" : "ghost"} size="icon" onClick={() => setDisplayMode("grid")} className="h-7 w-7 rounded-lg">
              <LayoutGrid size={14} />
            </Button>
          </div>

          <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white hover:bg-primary/90 font-bold h-9">
            <Plus className="mr-2 h-4 w-4" /> Nouvel Envoi
          </Button>
        </div>
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

      {loading ? (
        <div className={displayMode === "grid" ? "grid gap-4 md:grid-cols-3" : "space-y-2"}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4"><Skeleton className="h-32 w-full" /></Card>
          ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="text-center py-20 bg-card border-2 border-dashed border-border rounded-2xl">
          <PackageIcon size={32} className="text-muted-foreground opacity-20 mx-auto mb-4" />
          <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Aucun colis correspondant</p>
        </div>
      ) : (
        <>
          {displayMode === "table" ? (
            <Card className="border-border bg-card shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">ID</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Contacts</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden md:table-cell">Itinéraire</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider">Statut</TableHead>
                    <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPackages.map((pkg) => (
                    <TableRow key={pkg.id}>
                      <TableCell className="font-mono text-[11px] font-bold text-primary">{pkg.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{pkg.sender}</span>
                          <span className="text-[10px] text-muted-foreground">→ {pkg.receiver}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-[11px] text-muted-foreground">{pkg.route}</TableCell>
                      <TableCell>{getStatusBadge(pkg.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-500/5">
                            <ShieldCheck size={12} className="mr-1" /> {pkg.otp}
                          </Button>
                          <Button onClick={() => triggerPrint(pkg)} variant="outline" size="icon" className="h-8 w-8 hover:bg-primary hover:text-white">
                            <Printer size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
                <Card key={pkg.id} className="border-border bg-card overflow-hidden group hover:border-primary/50 transition-all shadow-sm">
                  <div className="p-4 border-b border-border flex items-center justify-between bg-muted/30">
                    <span className="text-xs font-mono font-bold text-primary">{pkg.id}</span>
                    {getStatusBadge(pkg.status)}
                  </div>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                      <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Expéditeur</p><p className="text-xs font-bold">{pkg.sender}</p></div>
                      <div><p className="text-[9px] uppercase font-bold text-muted-foreground">Destinataire</p><p className="text-xs font-bold">{pkg.receiver}</p></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] font-mono font-black text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-md">
                        <ShieldCheck size={12} /> {pkg.otp}
                      </div>
                      <Button onClick={() => triggerPrint(pkg)} variant="outline" size="sm" className="h-7 text-[10px] gap-1 font-bold">
                        <Printer size={12} /> IMPRIMER REÇU
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Enregistrement Fret</DialogTitle></DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="sender" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs uppercase font-bold">Expéditeur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="receiver" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs uppercase font-bold">Destinataire</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="route" render={({ field }) => (
                <FormItem><FormLabel className="text-xs uppercase font-bold">Itinéraire</FormLabel><FormControl><Input placeholder="Goma → Bukavu" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="weight" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs uppercase font-bold">Poids</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="value" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs uppercase font-bold">Valeur</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full font-bold">Confirmer l'expédition</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
