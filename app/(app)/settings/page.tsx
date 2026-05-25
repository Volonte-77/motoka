"use client";

import React from "react";
import { useTheme } from "next-themes";
import { 
  Settings as SettingsIcon, 
  Moon, 
  Sun, 
  Monitor, 
  Bell, 
  Lock, 
  User as UserIcon,
  Globe,
  Database
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const ThemeOption = ({ value, label, icon: Icon }: { value: string, label: string, icon: any }) => (
    <button
      onClick={() => {
        setTheme(value);
        toast.success(`Thème ${label} activé`);
      }}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
        theme === value 
          ? "border-primary bg-primary/5 text-primary" 
          : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      <Icon size={24} />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl dark:text-white">Paramètres</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez vos préférences et la configuration de l'agence.</p>
      </div>

      <div className="grid gap-6">
        {/* Apparence */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-primary" />
              <CardTitle>Apparence</CardTitle>
            </div>
            <CardDescription>Personnalisez l'interface de votre application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <ThemeOption value="light" label="Clair" icon={Sun} />
              <ThemeOption value="dark" label="Sombre" icon={Moon} />
              <ThemeOption value="system" label="Système" icon={Monitor} />
            </div>
          </CardContent>
        </Card>

        {/* Profil de l'Agence */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle>Informations Agence</CardTitle>
            </div>
            <CardDescription>Détails visibles sur les billets et factures.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de l'agence</Label>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium">
                  Motoka Express
                </div>
              </div>
              <div className="space-y-2">
                <Label>Devise par défaut</Label>
                <div className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-medium">
                  FCFA (Franc Congolais)
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle>Sécurité & Accès</CardTitle>
            </div>
            <CardDescription>Gérez vos informations de connexion.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="text-xs">
              Changer mon mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance / Données */}
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] border-dashed">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-rose-500">Zone de Danger</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Button 
              variant="ghost" 
              className="text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-500"
              onClick={() => {
                if(confirm("Effacer toutes les données locales de simulation ?")) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
            >
              Réinitialiser les données locales
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
