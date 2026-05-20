"use client";

import { useEffect, useState } from "react";
import localforage from "localforage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Shield, Bell, Save, CheckCircle2 } from "lucide-react";

// Clé unique pour stocker nos paramètres dans localforage
const SETTINGS_KEY = "motoka_user_settings";

export default function SettingsPage() {
  // 1. États locaux pour nos configurations
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // 2. Apprentissage Pas à Pas : Charger les données au démarrage
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // localforage.getItem va chercher la valeur de manière asynchrone dans l'IndexedDB du navigateur
        const savedSettings = await localforage.getItem<{ theme: "dark" | "light"; notifications: boolean }>(SETTINGS_KEY);
        
        if (savedSettings) {
          setTheme(savedSettings.theme);
          setNotifications(savedSettings.notifications);
          
          // Appliquer immédiatement le thème chargé au document HTML
          applyTheme(savedSettings.theme);
        } else {
          // Si rien n'est stocké, on applique le thème par défaut (dark)
          applyTheme("dark");
        }
      } catch (error) {
        console.error("Erreur lors du chargement de localforage :", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // 3. Fonction utilitaire pour injecter/retirer la classe 'dark' de Tailwind
  const applyTheme = (currentTheme: "dark" | "light") => {
    const root = window.document.documentElement;
    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  // 4. Apprentissage Pas à Pas : Sauvegarder les données
  const handleSaveSettings = async () => {
    setIsSaved(false);
    try {
      const settingsToSave = { theme, notifications };
      
      // localforage.setItem(clé, valeur) sérialise et stocke l'objet automatiquement
      await localforage.setItem(SETTINGS_KEY, settingsToSave);
      
      // Appliquer le thème sélectionné en direct
      applyTheme(theme);
      
      // Déclencher le message de succès temporaire
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Erreur de sauvegarde localforage :", error);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-zinc-400">Chargement de vos configurations...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl dark:text-white text-zinc-900">Paramètres de l'application</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Personnalisez votre espace de travail et gérez vos préférences locales.</p>
      </div>

      {/* BLOC 1 : PERSONNALISATION DU THÈME */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            Thème Visuel
          </CardTitle>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Choisissez l'apparence de l'interface Motoka selon votre environnement de travail.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {/* Option Mode Sombre */}
          <button
            onClick={() => setTheme("dark")}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-sm font-medium ${
              theme === "dark"
                ? "border-primary bg-primary/5 text-primary"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Moon size={22} />
            <span>Mode Sombre</span>
          </button>

          {/* Option Mode Clair */}
          <button
            onClick={() => setTheme("light")}
            className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all cursor-pointer text-sm font-medium ${
              theme === "light"
                ? "border-primary bg-primary/5 text-primary"
                : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            }`}
          >
            <Sun size={22} />
            <span>Mode Clair</span>
          </button>
        </CardContent>
      </Card>

      {/* BLOC 2 : NOTIFICATIONS & CONFIGURATIONS */}
      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
            <Bell size={18} className="text-zinc-500"/> Préférences Système
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/60">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-900 dark:text-white">Alertes de livraison</p>
              <p className="text-xs text-zinc-500">Activer les popups lors de la validation d'un OTP Colis.</p>
            </div>
            <input 
              type="checkbox" 
              checked={notifications} 
              onChange={(e) => setNotifications(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* BARRE D'ACTIONS INFERIEURE */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium transition-opacity">
          {isSaved && (
            <>
              <CheckCircle2 size={16} />
              <span>Configurations enregistrées en local !</span>
            </>
          )}
        </div>
        
        <Button 
          onClick={handleSaveSettings}
          className="bg-primary text-primary-foreground hover:opacity-90 flex items-center gap-2 cursor-pointer font-medium"
        >
          <Save size={16} />
          Sauvegarder les modifications
        </Button>
      </div>
    </div>
  );
}