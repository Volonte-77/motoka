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
import { AppUser, UserRole, Branch, STORAGE_KEYS } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { mockApi } from "@/lib/mock-api";
import localforage from "localforage";
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
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

  // Reset form when opening for create or edit
  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        email: userToEdit.email,
        role: userToEdit.role as any,
        phone: userToEdit.phone || "",
        branchId: userToEdit.branchId || "global",
      });
    } else {
      form.reset({
        name: "",
        email: "",
        role: "Dispatcher",
        phone: "",
        branchId: "global",
      });
    }
  }, [userToEdit, isDialogOpen, form]);

  const loadData = async () => {
    if (!currentUser?.agencyId) return;
    setLoading(true);
    
    const [userData, branchData] = await Promise.all([
      (await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST)) || [],
      mockApi.agencies.getBranches(currentUser.agencyId)
    ]);
    
    let filteredData = userData.filter(u => u.agencyId === currentUser.agencyId);
    
    if (currentUser.role === "Admin Succursale" && currentUser.branchId) {
      filteredData = filteredData.filter(u => u.branchId === currentUser.branchId);
    }

    setUsers(filteredData);
    setBranches(branchData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [currentUser?.agencyId, currentUser?.branchId, currentUser?.role]);

  const onSubmit = async (values: UserFormValues) => {
    try {
      const allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
      
      if (values.role === "Admin Succursale" && values.branchId === "global") {
        toast.error("Un administrateur de succursale doit être affecté à une succursale spécifique.");
        return;
      }

      const selectedBranchName = values.branchId === "global" 
        ? "Siège Social" 
        : branches.find(b => b.id === values.branchId)?.name || "Succursale";

      if (userToEdit) {
        const updatedUsers = allUsers.map(u => {
          if (u.id === userToEdit.id) {
            return {
              ...u,
              ...values,
              branchId: values.branchId === "global" ? null : values.branchId,
              siteAccess: selectedBranchName,
            };
          }
          return u;
        });
        await localforage.setItem(STORAGE_KEYS.USERS_LIST, updatedUsers);
        toast.success(`L'utilisateur ${values.name} a été mis à jour`);
      } else {
        const newUser: AppUser = {
          id: Math.random().toString(36).substr(2, 9),
          agencyId: currentUser?.agencyId || "default",
          siteAccess: selectedBranchName,
          ...values,
          branchId: values.branchId === "global" ? null : values.branchId,
          password: "motoka2026",
          mustChangePassword: true,
        } as AppUser;
        await localforage.setItem(STORAGE_KEYS.USERS_LIST, [...allUsers, newUser]);
        toast.success(`L'utilisateur ${values.name} a été créé en tant que ${values.role}`);
      }
      
      await loadData();
      setIsDialogOpen(false);
      setUserToEdit(null);
      form.reset();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement de l'utilisateur");
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      const allUsers = await localforage.getItem<AppUser[]>(STORAGE_KEYS.USERS_LIST) || [];
      const updatedUsers = allUsers.filter(u => u.id !== userToDelete.id);
      await localforage.setItem(STORAGE_KEYS.USERS_LIST, updatedUsers);
      toast.success("Utilisateur supprimé");
      await loadData();
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
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
            {loading ? (
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
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground leading-none">{u.name}</span>
                        <span className="text-[10px] text-muted-foreground mt-1">{u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(u.role)}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Shield size={12} className="text-primary/60" />
                      {u.siteAccess}
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
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Rôle / Accès</FormLabel>
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
                  <FormItem><FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Téléphone</FormLabel><FormControl><Input placeholder="+243..." {...field} className="bg-muted/30 border-border" /></FormControl><FormMessage /></FormItem>
                )} />
              </div>

              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Affectation (Succursale)</FormLabel>
                  <FormControl>
                    <Combobox
                      options={[
                        { value: "global", label: "Siège Principal / Global" },
                        ...branches.map(b => ({ value: b.id, label: b.name }))
                      ]}
                      value={field.value || "global"}
                      onChange={field.onChange}
                      placeholder="Choisir une affectation"
                      disabled={currentUser?.role === "Admin Succursale"}
                    />
                  </FormControl>
                  {currentUser?.role === "Admin Succursale" && (
                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                      Verrouillé sur votre succursale actuelle.
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )} />

              <DialogFooter className="pt-4 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="hover:bg-muted font-medium">Annuler</Button>
                <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-8">
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
