"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, User, Shield, Mail, Phone, MoreVertical, Edit, Trash2, Key, Loader2 } from "lucide-react";
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
import { UserRole, Branch } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import apiClient from "@/lib/api-client";
import { Combobox } from "@/components/ui/combobox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const userSchema = z.object({
  name: z.string().min(3, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  role_enum: z.string(),
  telephone: z.string().optional(),
  Idsuccursale: z.string().optional(),
  password: z.string().min(6, "Mot de passe requis").optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof userSchema>;

export default function UtilisateursPage() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role_enum: "dispatcher",
      telephone: "",
      Idsuccursale: "global",
      password: "",
    },
  });

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role_enum: userToEdit.role_enum,
        telephone: userToEdit.telephone || "",
        Idsuccursale: userToEdit.Idsuccursale ? userToEdit.Idsuccursale.toString() : "global",
        password: "",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role_enum: "dispatcher",
        telephone: "",
        Idsuccursale: "global",
        password: "",
      });
    }
  }, [userToEdit, isDialogOpen, form]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, branchesRes] = await Promise.all([
        apiClient.get("/admin/users"),
        apiClient.get("/succursales")
      ]);
      setUsers(usersRes.data.data || usersRes.data);
      setBranches(branchesRes.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onSubmit = async (values: UserFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        Idsuccursale: values.Idsuccursale === "global" ? null : values.Idsuccursale,
      };

      if (userToEdit) {
        await apiClient.put(`/admin/users/${userToEdit.id}`, payload);
        toast.success(`L'utilisateur ${values.name} a été mis à jour`);
      } else {
        // Déterminer la route selon le rôle
        let route = "/admin/users/dispatcher";
        if (values.role_enum === 'adminAgence') route = "/admin/users/admin-agence";
        else if (values.role_enum === 'adminSuccursale') route = "/admin/users/admin-succursale";
        
        await apiClient.post(route, {
          ...payload,
          password_confirmation: payload.password
        });
        toast.success(`L'utilisateur ${values.name} a été créé`);
      }
      
      await loadData();
      setIsDialogOpen(false);
      setUserToEdit(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setLoading(true);
      await apiClient.delete(`/admin/users/${userToDelete.id}`);
      toast.success("Utilisateur supprimé");
      await loadData();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setLoading(false);
    }
  };

  const mapRoleToDisplay = (role: string) => {
    switch (role) {
      case 'superAdmin': return "Super Admin";
      case 'adminAgence': return "Admin Agence";
      case 'adminSuccursale': return "Admin Succursale";
      case 'dispatcher': return "Guichetier";
      case 'comptable': return "Comptable";
      case 'chauffeur': return "Chauffeur";
      default: return role;
    }
  };

  const getRoleBadge = (role: string) => {
    const display = mapRoleToDisplay(role);
    switch (role) {
      case "adminAgence": return <Badge className="bg-primary/10 text-primary border-primary/20">{display}</Badge>;
      case "adminSuccursale": return <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">{display}</Badge>;
      case "dispatcher": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">{display}</Badge>;
      case "comptable": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{display}</Badge>;
      case "chauffeur": return <Badge className="bg-zinc-500/10 text-zinc-500 border-zinc-500/20">{display}</Badge>;
      default: return <Badge variant="outline">{display}</Badge>;
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-foreground">Gestion d'Équipe</h1>
          <p className="text-sm text-muted-foreground">Administrez les comptes et les accès de vos collaborateurs.</p>
        </div>
        <Button onClick={() => { setUserToEdit(null); setIsDialogOpen(true); }} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un membre
        </Button>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/30 border-border focus-visible:ring-primary"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Membre</TableHead>
              <TableHead className="text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Rôle / Accès</TableHead>
              <TableHead className="hidden md:table-cell text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Localisation</TableHead>
              <TableHead className="text-right text-muted-foreground font-bold uppercase text-[10px] tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && users.length === 0 ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-border">
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-10 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground italic border-border">
                  Aucun utilisateur trouvé.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/30 border-border transition-colors group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform font-bold">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground leading-none">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-1">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role_enum)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Shield size={12} className="text-primary/60" />
                      {u.succursale?.nom || "Siège Social"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-muted">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-card border-border shadow-xl">
                        <DropdownMenuLabel className="text-[10px] uppercase font-bold text-muted-foreground">Options</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem 
                          onClick={() => {
                            setUserToEdit(u);
                            setIsDialogOpen(true);
                          }}
                          className="cursor-pointer focus:bg-primary/10 focus:text-primary transition-colors font-medium"
                        >
                          <Edit className="mr-2 h-4 w-4" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            setUserToDelete(u);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-rose-500 cursor-pointer focus:bg-rose-500/10 focus:text-rose-600 transition-colors font-medium"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* DIALOGUE CRÉATION / ÉDITION */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setUserToEdit(null);
      }}>
        <DialogContent className="sm:max-w-[500px] bg-card border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground tracking-tight">{userToEdit ? "Modifier le membre" : "Ajouter un membre"}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {userToEdit 
                ? "Mettez à jour les informations du collaborateur." 
                : "Créez un compte pour un nouveau collaborateur."}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Nom Complet</FormLabel><FormControl><Input placeholder="Jean Dupont" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Adresse Email</FormLabel><FormControl><Input placeholder="jean@agence.com" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
              )} />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="role_enum" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôle / Accès</FormLabel>
                    <FormControl>
                      <Combobox
                        options={[
                          { value: "dispatcher", label: "Guichetier (Dispatcher)" },
                          { value: "adminAgence", label: "Administrateur d'Agence" },
                          { value: "adminSuccursale", label: "Administrateur Succursale" },
                          { value: "comptable", label: "Comptable" },
                          { value: "chauffeur", label: "Chauffeur" },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Choisir un rôle"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="telephone" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Téléphone</FormLabel><FormControl><Input placeholder="+243..." {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              {!userToEdit && (
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mot de passe provisoire</FormLabel><FormControl><Input type="password" placeholder="••••••••" {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              )}

              <FormField control={form.control} name="Idsuccursale" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Affectation (Succursale)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: "global", label: "Siège Principal / Global" },
                        ...branches.map(b => ({ value: b.Idsuccursale.toString(), label: b.nom }))
                      ]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      placeholder="Choisir une affectation"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-muted font-medium">Annuler</Button>
                <Button type="submit" disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {userToEdit ? "Enregistrer" : "Créer le compte"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* DIALOGUE SUPPRESSION */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-foreground tracking-tight text-rose-500">Avertissement de Sécurité</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Cette action supprimera définitivement le compte de <strong className="text-foreground">{userToDelete?.name}</strong>. 
              Toutes les données associées seront inaccessibles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="cursor-pointer hover:bg-muted font-medium">Annuler la suppression</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white border-none cursor-pointer font-bold px-8"
            >
              Confirmer la suppression
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
