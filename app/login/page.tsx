"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique de connexion Supabase à venir
    console.log("Connexion avec :", email, password);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-[#09090b]">
      <div className="w-full max-w-[400px] space-y-6">
        {/* Logo / Entête de l'application */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="text-2xl font-bold tracking-wider text-white">
            MO<span className="text-primary">TO</span>KA
          </div>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">
            Gestion de transport intelligente
          </p>
        </div>

        <Card className="border border-zinc-800 bg-[#121214]">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-white">Connexion</CardTitle>
            <CardDescription className="text-zinc-400">
              Saisissez vos identifiants pour accéder à votre espace agence.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-300" htmlFor="email">
                  Adresse Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@agence.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#18181b] border-zinc-800 text-white focus-visible:ring-primary"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300" htmlFor="password">
                    Mot de passe
                  </label>
                  <a href="#" className="text-xs text-primary hover:underline">
                    Oublié ?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#18181b] border-zinc-800 text-white focus-visible:ring-primary"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full bg-primary text-primary-foreground font-medium hover:opacity-90 cursor-pointer">
                Se connecter
              </Button>
              <div className="text-center text-xs text-zinc-500 mt-2">
                Besoin d'un compte pour votre agence ?{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Créer une agence
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}