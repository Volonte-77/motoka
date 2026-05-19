import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
      <Card className="w-full max-w-md border border-border bg-card">
        <CardHeader className="space-y-1">
          <div className="text-xs font-semibold tracking-widest text-primary uppercase">
            SaaS Multi-Agences
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            MOTOKA
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Application Web Mobile-First de Gestion de Transport.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Le projet Next.js + Supabase est initialisé avec succès. Prêt pour le développement des modules de gestion.
          </p>
          <Button className="w-full bg-primary hover:opacity-90 text-primary-foreground font-medium cursor-pointer">
            Démarrer la configuration
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}