"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Filter, Search, Building2 } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { CashTransaction, CashCategory, CashTransactionType, Branch } from "@/types";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";

const transactionSchema = z.object({
  type: z.enum(["Entrée", "Sortie"]),
  amount: z.preprocess((val) => Number(val), z.number().min(1, "Le montant doit être supérieur à 0")),
  description: z.string().min(5, "Description requise"),
  category: z.enum(["Billet", "Fret", "Carburant", "Maintenance", "Autre"]),
  branchId: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function CaissePage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState<CashTransactionType | "Tous">("Tous");

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "Entrée",
      amount: 0,
      description: "",
      category: "Billet",
      branchId: "global",
    },
  });

  const loadData = async () => {
    setLoading(true);
    const agencyId = user?.agencyId || null;
    const branchId = user?.role === "Admin Succursale" ? user.branchId : null;

    const [transactionsData, branchesData] = await Promise.all([
      mockApi.cash.getAll(agencyId, branchId),
      user?.agencyId ? mockApi.agencies.getBranches(user.agencyId) : Promise.resolve([])
    ]);

    setTransactions(transactionsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setBranches(branchesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user?.agencyId, user?.branchId, user?.role]);

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const { branchId, ...rest } = values;
      const transaction: CashTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        agencyId: user?.agencyId || "default-agency",
        branchId: user?.role === "Admin Succursale" ? user.branchId : (branchId === "global" ? null : branchId || null),
        timestamp: new Date().toISOString(),
        userId: user?.id,
        ...rest,
      };

      await mockApi.cash.save(transaction);
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success(values.type === "Entrée" ? "Recette enregistrée" : "Dépense enregistrée");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'opération");
    }
  };

  const totals = transactions.reduce((acc, curr) => {
    if (curr.type === "Entrée") acc.in += curr.amount;
    else acc.out += curr.amount;
    return acc;
  }, { in: 0, out: 0 });

  const filteredTransactions = transactions.filter(t => filterType === "Tous" || t.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white uppercase tracking-tighter">
            {user?.role === "Admin Succursale" ? "Caisse Locale" : "Trésorerie de l'Agence"}
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {user?.role === "Admin Succursale" 
              ? `Opérations financières de ${branches.find(b => b.id === user.branchId)?.name || "votre succursale"}.` 
              : "Suivi global des flux financiers multi-sites."}
          </p>
        </div>
        <Button onClick={() => {
          form.reset({
            type: "Entrée", amount: 0, description: "", category: "Billet",
            branchId: user?.role === "Admin Succursale" ? user.branchId || "global" : "global"
          });
          setIsDialogOpen(true);
        }} className="bg-primary text-white hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Opération
        </Button>
      </div>

      {/* Résumé des finances */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Solde Actuel</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{(totals.in - totals.out).toLocaleString()} <span className="text-xs font-medium opacity-50">FCFA</span></div>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">Trésorerie disponible sur ce périmètre</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">Entrées</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{totals.in.toLocaleString()} <span className="text-xs font-medium opacity-50">FCFA</span></div>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-tighter">Cumul des revenus</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Sorties</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{totals.out.toLocaleString()} <span className="text-xs font-medium opacity-50">FCFA</span></div>
            <p className="text-[10px] text-zinc-500 mt-1 font-medium uppercase tracking-tighter">Cumul des dépenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
        <Button 
          variant={filterType === "Tous" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Tous")}
          className="rounded-full text-[10px] uppercase font-bold h-7 px-4 border-zinc-200 dark:border-zinc-800"
        >
          Toutes
        </Button>
        <Button 
          variant={filterType === "Entrée" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Entrée")}
          className="rounded-full text-[10px] uppercase font-bold h-7 px-4 border-zinc-200 dark:border-zinc-800"
        >
          Entrées
        </Button>
        <Button 
          variant={filterType === "Sortie" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Sortie")}
          className="rounded-full text-[10px] uppercase font-bold h-7 px-4 border-zinc-200 dark:border-zinc-800"
        >
          Sorties
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Description / Catégorie</TableHead>
              {user?.role === "Admin Agence" && <TableHead>Provenance</TableHead>}
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  {user?.role === "Admin Agence" && <TableCell><Skeleton className="h-5 w-24" /></TableCell>}
                  <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={user?.role === "Admin Agence" ? 4 : 3} className="h-32 text-center text-zinc-500 italic">
                  Aucune transaction enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-[10px] text-zinc-500 font-mono">
                    {new Date(t.timestamp).toLocaleString("fr-FR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium dark:text-zinc-200 leading-none">{t.description}</p>
                      <Badge variant="outline" className="text-[8px] h-3.5 uppercase border-zinc-200 dark:border-zinc-800 text-zinc-400 font-bold tracking-tighter">
                        {t.category}
                      </Badge>
                    </div>
                  </TableCell>
                  {user?.role === "Admin Agence" && (
                    <TableCell>
                      <Badge variant="outline" className="text-[8px] uppercase font-bold border-zinc-200 dark:border-zinc-800 text-primary bg-primary/5">
                        {branches.find(b => b.id === t.branchId)?.name || "Siège Social"}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <div className={cn(
                      "flex items-center justify-end gap-1.5 font-bold",
                      t.type === "Entrée" ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {t.type === "Entrée" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {t.amount.toLocaleString()} <span className="text-[9px] font-medium opacity-70">FCFA</span>
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
            <DialogTitle className="font-bold text-xl uppercase tracking-tighter">Nouvelle Opération</DialogTitle>
            <DialogDescription>Flux de trésorerie entrant ou sortant.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                <Button 
                  type="button"
                  variant={form.watch("type") === "Entrée" ? "default" : "ghost"}
                  onClick={() => form.setValue("type", "Entrée")}
                  className={cn("h-9 text-xs uppercase font-bold", form.watch("type") === "Entrée" && "bg-emerald-600 text-white")}
                >
                  <TrendingUp className="mr-2 h-3 w-3" /> Entrée
                </Button>
                <Button 
                  type="button"
                  variant={form.watch("type") === "Sortie" ? "default" : "ghost"}
                  onClick={() => form.setValue("type", "Sortie")}
                  className={cn("h-9 text-xs uppercase font-bold", form.watch("type") === "Sortie" && "bg-rose-600 text-white")}
                >
                  <TrendingDown className="mr-2 h-3 w-3" /> Sortie
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Montant (FCFA)</FormLabel><FormControl><Input type="number" {...field} className="bg-zinc-50 dark:bg-zinc-900 font-bold" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "Billet", label: "Billetterie" },
                          { value: "Fret", label: "Fret / Colis" },
                          { value: "Carburant", label: "Carburant" },
                          { value: "Maintenance", label: "Maintenance" },
                          { value: "Autre", label: "Autre" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choisir"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Site d'Opération</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: "global", label: "Agence Centrale / Siège" },
                        ...branches.map(b => ({ value: b.id, label: b.name }))
                      ]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      placeholder="Affecter à un site"
                      disabled={user?.role === "Admin Succursale"}
                    />
                  </FormControl>
                  {user?.role === "Admin Succursale" && (
                    <p className="text-[10px] text-zinc-500 mt-1 italic font-medium">Flux enregistré sur votre caisse locale.</p>
                  )}
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description / Motif</FormLabel><FormControl><Input placeholder="Ex: Vente billets course Goma-Beni" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white font-bold uppercase tracking-widest text-[10px]">Valider l'opération</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
