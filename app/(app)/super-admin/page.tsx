"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, ShieldCheck, Calendar, MoreHorizontal, LayoutGrid, List } from "lucide-react";
import { mockApi } from "@/lib/mock-api";
import { Agency, SubscriptionPlan, SubscriptionStatus } from "@/types";
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
import localforage from "localforage";
import { STORAGE_KEYS } from "@/types";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";

const agencySchema = z.object({
  name: z.string().min(3, "Nom de l'agence requis"),
  email: z.string().email("Email invalide"),
  city: z.string().min(2, "Ville requise"),
  plan: z.enum(["Basique", "Standard", "Premium"]),
  status: z.enum(["Actif", "Essai", "Expiré"]),
  expiresAt: z.string().min(1, "Date d'expiration requise"),
});

type AgencyFormValues = z.infer<typeof agencySchema>;

export default function SuperAdminPage() {
  const { user } = useAuthStore();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      name: "",
      email: "",
      city: "",
      plan: "Basique",
      status: "Essai",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    },
  });

  const loadAgencies = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const data = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
    setAgencies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const onSubmit = async (values: AgencyFormValues) => {
    try {
      const newAgency: Agency = {
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...values,
      };

      const currentAgencies = await localforage.getItem<Agency[]>(STORAGE_KEYS.AGENCIE_LIST) || [];
      await localforage.setItem(STORAGE_KEYS.AGENCIE_LIST, [...currentAgencies, newAgency]);
      
      await loadAgencies();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`L'agence ${values.name} a été activée avec succès`);
    } catch (error) {
      toast.error("Erreur lors de l'activation de l'agence");
    }
  };

  const getPlanBadge = (plan: SubscriptionPlan) => {
    switch (plan) {
      case "Basique": return <Badge variant="outline">Basique</Badge>;
      case "Standard": return <Badge className="bg-blue-500">Standard</Badge>;
      case "Premium": return <Badge className="bg-primary text-white font-bold">Premium</Badge>;
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case "Actif": return <Badge className="bg-emerald-500 text-white">Actif</Badge>;
      case "Essai": return <Badge className="bg-amber-500 text-white">Essai</Badge>;
      case "Expiré": return <Badge variant="destructive">Expiré</Badge>;
    }
  };

  const filteredAgencies = agencies.filter(a => 
    a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Super Administration</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gestion globale du réseau d'agences et des souscriptions.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Enregistrer une Agence
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Total Agences</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.length}</div>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Agences Actives</CardTitle>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agencies.filter(a => a.status === "Actif").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher une agence ou ville..."
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
              <TableHead>Agence</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Expiration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredAgencies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  Aucune agence enregistrée.
                </TableCell>
              </TableRow>
            ) : (
              filteredAgencies.map((agency) => (
                <TableRow key={agency.id}>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex flex-col">
                      <span>{agency.name}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{agency.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">{agency.city}</TableCell>
                  <TableCell>{getPlanBadge(agency.plan)}</TableCell>
                  <TableCell>{getStatusBadge(agency.status)}</TableCell>
                  <TableCell className="text-xs font-mono text-zinc-500">
                    {new Date(agency.expiresAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4 text-zinc-500" />
                    </Button>
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
            <DialogTitle>Nouvelle Agence</DialogTitle>
            <DialogDescription>Enregistrez un nouvel opérateur dans le réseau Motoka.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom de l'agence</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Email Admin</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>Ville siège</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="plan" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan de souscription</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "Basique", label: "Basique" },
                          { value: "Standard", label: "Standard" },
                          { value: "Premium", label: "Premium" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choisir un plan"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="status" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Statut</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "Actif", label: "Actif" },
                          { value: "Essai", label: "Période d'essai" },
                          { value: "Expiré", label: "Expiré" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choisir le statut"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="expiresAt" render={({ field }) => (
                <FormItem><FormLabel>Date d'expiration</FormLabel><FormControl><Input type="date" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">Activer l'Agence</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
