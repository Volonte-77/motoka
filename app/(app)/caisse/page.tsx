"use client";

import React, { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownLeft, Filter, Search } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { CashTransaction, CashCategory, CashTransactionType } from "@/types";
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

const transactionSchema = z.object({
  type: z.enum(["Entrée", "Sortie"]),
  amount: z.preprocess((val) => Number(val), z.number().min(1, "Le montant doit être supérieur à 0")),
  description: z.string().min(5, "Description requise"),
  category: z.enum(["Billet", "Fret", "Carburant", "Maintenance", "Autre"]),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

export default function CaissePage() {
  const { user } = useAuthStore();
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
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
    },
  });

  const loadTransactions = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const data = await mockApi.cash.getAll(user?.agencyId || null);
    setTransactions(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, [user?.agencyId]);

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const transaction: CashTransaction = {
        id: Math.random().toString(36).substr(2, 9),
        agencyId: user?.agencyId || "default-agency",
        timestamp: new Date().toISOString(),
        userId: user?.id,
        ...values,
      };

      await mockApi.cash.save(transaction);
      await loadTransactions();
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
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl dark:text-white">Gestion de Caisse</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Suivi des flux financiers en temps réel.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Opération
        </Button>
      </div>

      {/* Résumé des finances */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-500">Solde Actuel</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-white">{(totals.in - totals.out).toLocaleString()} FCFA</div>
            <p className="text-xs text-zinc-500 mt-1">Trésorerie disponible</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-500">Entrées (Total)</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{totals.in.toLocaleString()} FCFA</div>
            <p className="text-xs text-zinc-500 mt-1">Cumul des revenus</p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-rose-500">Sorties (Total)</CardTitle>
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{totals.out.toLocaleString()} FCFA</div>
            <p className="text-xs text-zinc-500 mt-1">Cumul des dépenses</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <Button 
          variant={filterType === "Tous" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Tous")}
          className="rounded-full text-xs h-8"
        >
          Toutes
        </Button>
        <Button 
          variant={filterType === "Entrée" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Entrée")}
          className="rounded-full text-xs h-8"
        >
          Entrées
        </Button>
        <Button 
          variant={filterType === "Sortie" ? "default" : "outline"} 
          size="sm" 
          onClick={() => setFilterType("Sortie")}
          className="rounded-full text-xs h-8"
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
              <TableHead className="text-right">Montant</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-zinc-500">
                  Aucune transaction enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs text-zinc-500 font-mono">
                    {new Date(t.timestamp).toLocaleString("fr-FR", { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium dark:text-zinc-200">{t.description}</p>
                      <Badge variant="outline" className="text-[9px] h-4 uppercase border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold">
                        {t.category}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={cn(
                      "flex items-center justify-end gap-1.5 font-bold",
                      t.type === "Entrée" ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {t.type === "Entrée" ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                      {t.amount.toLocaleString()} <span className="text-[10px] font-medium opacity-70">FCFA</span>
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
            <DialogTitle>Nouvelle transaction</DialogTitle>
            <DialogDescription>Enregistrez une entrée ou une sortie de fonds.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
                <Button 
                  type="button"
                  variant={form.watch("type") === "Entrée" ? "default" : "ghost"}
                  onClick={() => form.setValue("type", "Entrée")}
                  className="h-9 text-xs"
                >
                  <TrendingUp className="mr-2 h-3 w-3" /> Entrée
                </Button>
                <Button 
                  type="button"
                  variant={form.watch("type") === "Sortie" ? "default" : "ghost"}
                  onClick={() => form.setValue("type", "Sortie")}
                  className="h-9 text-xs"
                >
                  <TrendingDown className="mr-2 h-3 w-3" /> Sortie
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="amount" render={({ field }) => (
                  <FormItem><FormLabel>Montant (FCFA)</FormLabel><FormControl><Input type="number" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="category" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <FormControl>
                      <select {...field} className="flex h-10 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm">
                        <option value="Billet">Billetterie</option>
                        <option value="Fret">Fret / Colis</option>
                        <option value="Carburant">Carburant</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Description / Motif</FormLabel><FormControl><Input placeholder="Ex: Vente billets course Goma-Bukavu" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">Valider l'opération</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
