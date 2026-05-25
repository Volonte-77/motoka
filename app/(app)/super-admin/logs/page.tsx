"use client";

import React, { useState } from "react";
import { Activity, Shield, User, Globe, AlertCircle, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const mockLogs = [
  { id: 1, action: "Création Agence", user: "admin@motoka.com", target: "Goma Express", status: "Succès", time: "Il y a 5 min", type: "Security" },
  { id: 2, action: "Mise à jour Plan", user: "superadmin@motoka.com", target: "Kivu Motors", status: "Succès", time: "Il y a 12 min", type: "Billing" },
  { id: 3, action: "Tentative Connexion", user: "unknown", target: "System", status: "Échec", time: "Il y a 45 min", type: "Warning" },
  { id: 4, action: "Suppression Véhicule", user: "manager@goma.cd", target: "BUS-902", status: "Succès", time: "Il y a 1h", type: "Activity" },
  { id: 5, action: "Backup Base de données", user: "System", target: "PostgreSQL", status: "Succès", time: "Il y a 3h", type: "System" },
];

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "Security": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Sécurité</Badge>;
      case "Billing": return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Facturation</Badge>;
      case "Warning": return <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">Alerte</Badge>;
      default: return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white flex items-center gap-2">
          <Activity size={28} className="text-primary" /> Audit Logs
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Journal d'activité global du système SaaS.</p>
      </div>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <CardContent className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher une action, un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
            />
          </div>
          <Badge variant="outline" className="h-10 px-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 gap-2">
            <Filter size={14} /> Filtres Avancés
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Événement</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Cible</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Moment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium dark:text-zinc-200">{log.action}</TableCell>
                <TableCell className="text-zinc-500 text-xs font-mono">{log.user}</TableCell>
                <TableCell className="text-zinc-500 text-xs">{log.target}</TableCell>
                <TableCell>{getTypeBadge(log.type)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs">
                    <div className={`h-1.5 w-1.5 rounded-full ${log.status === 'Succès' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    {log.status}
                  </div>
                </TableCell>
                <TableCell className="text-right text-xs text-zinc-400 font-mono">{log.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
