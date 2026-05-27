"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { Logo } from "@/components/logo";
import { getHomeRouteByRole } from "@/lib/routing-middleware";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginReel, loading } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    try {
      await loginReel(email.trim(), password.trim());
      
      const user = useAuthStore.getState().user;
      if (user) {
        const homeRoute = getHomeRouteByRole(user.role);
        router.push(homeRoute);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Identifiants incorrects ou erreur serveur.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-zinc-50 dark:bg-[#09090b] text-zinc-950 dark:text-zinc-50 transition-colors duration-200">
      <div className="w-full max-w-[400px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Logo size={48} />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-2">
            Gestion de transport intelligente
          </p>
        </div>
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">Connexion</CardTitle>
            <CardDescription className="text-zinc-500 dark:text-zinc-400">
              Accédez à votre espace Motoka.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300" htmlFor="email">
                  Adresse Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@agence.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300" htmlFor="password">
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
                  disabled={loading}
                  className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white"
                />
              </div>

              {errorMessage ? (
                <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-sm text-rose-500 font-medium">
                  {errorMessage}
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-col gap-3">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-primary text-white font-medium hover:opacity-90 cursor-pointer shadow-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? "Connexion..." : "Se connecter"}
              </Button>
              <div className="text-center text-xs text-zinc-500 mt-2">
                Besoin d'un compte pour votre agence ?{" "}
                <a href="#" className="text-primary hover:underline font-medium">
                  Contacter le support
                </a>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
