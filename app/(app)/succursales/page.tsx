"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Building2, MapPin, Phone, User, MoreVertical, Edit, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { Combobox } from "@/components/ui/combobox";

const branchSchema = z.object({
  nom: z.string().min(3, "Le nom est requis"),
  ville: z.string().min(2, "La ville est requise"),
  adresse: z.string().min(5, "L'adresse est requise"),
  telephone: z.string().min(10, "Téléphone valide requis"),
  Idmanager: z.string().optional(),
});

type BranchFormValues = z.infer<typeof branchSchema>;

export default function SuccursalesPage() {
  const { user: currentUser } = useAuthStore();
  const [branches, setBranches] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<BranchFormValues>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      nom: "",
      ville: "",
      adresse: "",
      telephone: "",
      Idmanager: "",
    },
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [branchesRes, usersRes] = await Promise.all([
        apiClient.get("/succursales"),
        apiClient.get("/admin/users")
      ]);
      setBranches(branchesRes.data);
      setUsers(usersRes.data.data || usersRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: BranchFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        Idmanager: values.Idmanager === "" ? null : values.Idmanager,
      };

      await apiClient.post("/succursales", payload);
      
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`La succursale ${values.nom} a été créée`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(b => 
    b.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Nos Succursales</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez les points de service de votre agence et leurs responsables.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Créer une succursale
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher par nom ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading && branches.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
              <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredBranches.length === 0 ? (
          <div className="col-span-full h-48 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
            <Building2 size={32} className="mb-2 opacity-20" />
            <p>Aucune succursale configurée.</p>
            <Button variant="link" onClick={() => setIsDialogOpen(true)}>Créer votre première succursale</Button>
          </div>
        ) : (
          filteredBranches.map((branch) => (
            <Card key={branch.Idsuccursale} className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{branch.nom}</CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono uppercase">{branch.ville}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <MapPin size={14} />
                    <span>{branch.adresse}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Phone size={14} />
                    <span>{branch.telephone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-900 dark:text-zinc-300 font-medium pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <User size={14} className="text-primary" />
                    <span>Manager: {branch.manager?.name || "Non assigné"}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" className="h-8 text-xs">Modifier</Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs text-primary">Voir Rapports</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#121214] border-zinc-200 dark:border-zinc-800">
          <DialogHeader>
            <DialogTitle>Nouvelle Succursale</DialogTitle>
            <DialogDescription>Ajoutez un nouveau point de service à votre réseau.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="nom" render={({ field }) => (
                <FormItem><FormLabel>Nom de la succursale</FormLabel><FormControl><Input placeholder="Agence Sud - Goma" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="ville" render={({ field }) => (
                  <FormItem><FormLabel>Ville</FormLabel><FormControl><Input placeholder="Goma" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="telephone" render={({ field }) => (
                  <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input placeholder="+243..." {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="adresse" render={({ field }) => (
                <FormItem><FormLabel>Adresse Complète</FormLabel><FormControl><Input placeholder="Q. Les Volcans, Av. du Port n°12" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <FormField control={form.control} name="Idmanager" render={({ field }) => (
                <FormItem>
                  <FormLabel>Responsable (Manager)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={users.map(u => ({ value: u.id.toString(), label: u.name }))}
                      value={field.value || ""}
                      onChange={field.onChange}
                      placeholder="Assigner un responsable"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={loading}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirmer la création
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
