"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, ShieldCheck, MoreHorizontal, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

const agencySchema = z.object({
  // Agence
  agence_nom: z.string().min(3, "Nom de l'agence requis"),
  agence_slug: z.string().min(3, "Slug requis (ex: agence-goma)"),
  agence_email: z.string().email("Email agence invalide"),
  agence_telephone: z.string().min(10, "Téléphone agence requis"),
  
  // Admin
  admin_name: z.string().min(3, "Nom de l'administrateur requis"),
  admin_email: z.string().email("Email admin invalide"),
  admin_password: z.string().min(6, "Mot de passe trop court"),
  admin_password_confirmation: z.string(),
  admin_telephone: z.string().min(10, "Téléphone admin requis"),
}).refine((data) => data.admin_password === data.admin_password_confirmation, {
  message: "Les mots de passe ne correspondent pas",
  path: ["admin_password_confirmation"],
});

type AgencyFormValues = z.infer<typeof agencySchema>;

export default function AgenciesPage() {
  const { user } = useAuthStore();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<AgencyFormValues>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      agence_nom: "",
      agence_slug: "",
      agence_email: "",
      agence_telephone: "",
      admin_name: "",
      admin_email: "",
      admin_password: "",
      admin_password_confirmation: "",
      admin_telephone: "",
    },
  });

  const loadAgencies = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/agences");
      setAgencies(response.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des agences");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgencies();
  }, []);

  const onSubmit = async (values: AgencyFormValues) => {
    try {
      setLoading(true);
      await apiClient.post("/register-agence", values);
      
      await loadAgencies();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`L'agence ${values.agence_nom} et son admin ont été créés avec succès`);
    } catch (error: any) {
      const message = error.response?.data?.message || "Erreur lors de la création de l'agence";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "starter": return <Badge variant="outline">Starter</Badge>;
      case "business": return <Badge className="bg-blue-500 text-white border-none">Business</Badge>;
      case "enterprise": return <Badge className="bg-primary text-white font-bold border-none">Enterprise</Badge>;
      default: return <Badge variant="secondary">{plan}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "actif": return <Badge className="bg-emerald-500 text-white border-none">Actif</Badge>;
      case "suspendu": return <Badge className="bg-amber-500 text-white border-none">Suspendu</Badge>;
      case "ferme": return <Badge variant="destructive">Fermé</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAgencies = agencies.filter(a => 
    a.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Gestion des Agences</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Administrez les partenaires du réseau Motoka.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Agence
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher une agence..."
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
              <TableHead>Slug</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && agencies.length === 0 ? (
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
                <TableRow key={agency.Idagence}>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex flex-col">
                      <span>{agency.nom}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{agency.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-500">{agency.slug}</TableCell>
                  <TableCell>{getPlanBadge(agency.plan_enum)}</TableCell>
                  <TableCell>{getStatusBadge(agency.statut_enum)}</TableCell>
                  <TableCell className="text-xs font-mono text-zinc-500">
                    {agency.telephone}
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
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Nouvelle Agence & Admin</DialogTitle>
            <DialogDescription>Créez une agence et son compte administrateur principal.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold border-b pb-2">Informations de l'Agence</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="agence_nom" render={({ field }) => (
                    <FormItem><FormLabel>Nom de l'agence</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="agence_slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug (identifiant unique)</FormLabel><FormControl><Input {...field} placeholder="agence-xyz" className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="agence_email" render={({ field }) => (
                    <FormItem><FormLabel>Email Professionnel</FormLabel><FormControl><Input {...field} type="email" className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="agence_telephone" render={({ field }) => (
                    <FormItem><FormLabel>Téléphone Agence</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold border-b pb-2">Compte Administrateur Principal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="admin_name" render={({ field }) => (
                    <FormItem><FormLabel>Nom Complet</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="admin_telephone" render={({ field }) => (
                    <FormItem><FormLabel>Téléphone Personnel</FormLabel><FormControl><Input {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="admin_email" render={({ field }) => (
                  <FormItem><FormLabel>Email de connexion</FormLabel><FormControl><Input {...field} type="email" className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="admin_password" render={({ field }) => (
                    <FormItem><FormLabel>Mot de passe</FormLabel><FormControl><Input {...field} type="password" className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="admin_password_confirmation" render={({ field }) => (
                    <FormItem><FormLabel>Confirmation</FormLabel><FormControl><Input {...field} type="password" className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>

              <DialogFooter className="pt-6">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={loading}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Créer l'Agence & l'Admin
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
