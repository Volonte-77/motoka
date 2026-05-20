import NavigationShell from "@/components/navigation-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
      <div className="space-y-6">
        {/* Entête du Dashboard */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-white">Tableau de bord</h1>
          <p className="text-sm text-zinc-400">Vue d'ensemble de l'activité de votre agence.</p>
        </div>

        {/* Grille de stats rapides (Mobile friendly : 1 col sur mobile, 3 sur desktop) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-zinc-800 bg-[#121214]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Courses Aujourd'hui</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">24</div>
              <p className="text-xs text-primary">+12% par rapport à hier</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#121214]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Colis en Attente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">142</div>
              <p className="text-xs text-zinc-500">78 en cours de livraison</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#121214] sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-400">Recettes du jour</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">450 000 FCFA</div>
              <p className="text-xs text-zinc-500">Objectif atteint à 85%</p>
            </CardContent>
          </Card>
        </div>
      </div>
    
  );
}