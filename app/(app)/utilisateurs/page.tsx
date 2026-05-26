"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, User, Shield, Mail, Phone, MoreVertical, Edit, Trash2, Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { AppUser, UserRole } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import localforage from "localforage";
import { STORAGE_KEYS } from "@/types";
import { Combobox } from "@/components/ui/combobox";

const userSchema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  role: z.enum(["Admin Agence", "Admin Succursale", "Dispatcher", "Chauffeur", "Comptable"]),
  phone: z.string().optional(),
  branchId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UtilisateursPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<AppUser[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Dispatcher",
      phone: "",
      branchId: "global",
    },
  });

  const loadData = async () => {
    if (!currentUser?.agencyId) return;
    setLoading(true);
    
    const [userData, branchData] = await Promise.all([
      localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [],
      mockApi.agencies.getBranches(currentUser.agencyId)
    ]);
    
    // Filtrer par agence
    const agencyUsers = userData.filter(u => u.agencyId === currentUser.agencyId);
    setUsers(agencyUsers);
    setBranches(branchData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.agencyId]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      const newUser: AppUser = {
        id: Math.random().toString(36).substr(2, 9),
        agencyId: currentUser?.agencyId || "default",
        siteAccess: values.branchId === "global" ? "Agence" : branches.find(b => b.id === values.branchId)?.name || "Succursale",
        ...values,
        branchId: values.branchId === "global" ? null : values.branchId,
      } as AppUser;

      const currentUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
      await localforage.setItem(STORAGE_KEYS.USERS_LIST, [...currentUsers, newUser]);
      
      await loadData();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`L'utilisateur ${values.name} a été créé`);
    } catch (error) {
      toast.error("Erreur lors de la création de l'utilisateur");
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "Admin Agence": return <Badge className="bg-primary/10 text-primary border-primary/20">Admin Agence</Badge>;
      case "Admin Succursale": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">Admin Succursale</Badge>;
      case "Dispatcher": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Guichetier</Badge>;
      case "Comptable": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Comptable</Badge>;
      case "Chauffeur": return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">Chauffeur</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Gestion d'Équipe</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez les utilisateurs et les accès de votre agence.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-white">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un collaborateur
        </Button>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher par nom ou email..."
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
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                  Aucun membre d'équipe trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium dark:text-zinc-200">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <User size={14} />
                      </div>
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell className="text-zinc-500 text-xs">
                    {u.phone || "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4 text-zinc-500" />
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
            <DialogTitle>Ajouter un membre</DialogTitle>
            <DialogDescription>Créez un compte pour un nouveau collaborateur.</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Nom Complet</FormLabel><FormControl><Input placeholder="Jean Dupont" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Adresse Email</FormLabel><FormControl><Input placeholder="jean@agence.com" {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rôle / Accès</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "Dispatcher", label: "Guichetier (Dispatcher)" },
                          { value: "Admin Agence", label: "Administrateur d'Agence" },
                          { value: "Admin Succursale", label: "Administrateur Succursale" },
                          { value: "Comptable", label: "Comptable" },
                          { value: "Chauffeur", label: "Chauffeur" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choisir un rôle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Téléphone</FormLabel><FormControl><Input placeholder="+243..." {...field} className="bg-zinc-50 dark:bg-zinc-900" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Affectation (Succursale)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: "global", label: "Siège Principal / Global" },
                        ...branches.map(b => ({ value: b.id, label: b.name }))
                      ]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      placeholder="Choisir une affectation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" className="bg-primary text-white">Créer le compte</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
