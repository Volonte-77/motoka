"use client";

import React from "react";
import { CreditCard, Check, Zap, Crown, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const plans = [
  {
    name: "Basique",
    price: "49,000",
    description: "Idéal pour les petites agences locales.",
    icon: Star,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
    features: ["Jusqu'à 5 véhicules", "2 utilisateurs staff", "Gestion colis standard", "Support email"],
  },
  {
    name: "Standard",
    price: "129,000",
    description: "Le meilleur choix pour les agences en croissance.",
    icon: Zap,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    popular: true,
    features: ["Jusqu'à 20 véhicules", "10 utilisateurs staff", "Gestion de caisse avancée", "Rapports mensuels PDF", "Support prioritaire"],
  },
  {
    name: "Premium",
    price: "299,000",
    description: "Puissance totale pour les grands réseaux.",
    icon: Crown,
    color: "text-primary",
    bg: "bg-primary/10",
    features: ["Véhicules illimités", "Utilisateurs illimités", "Multi-sites / Succursales", "API d'intégration", "Support 24/7 dédié"],
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl text-zinc-900 dark:text-white">Plans & Tarification</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Gérez les offres commerciales du SaaS Motoka.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.name} className={`border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214] flex flex-col relative ${plan.popular ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#09090b]' : ''}`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                  Plus Populaire
                </div>
              )}
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl ${plan.bg} ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon size={24} />
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-zinc-500 text-sm">CDF / mois</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className={`w-full ${plan.popular ? 'bg-primary text-white' : 'variant-outline border-zinc-200 dark:border-zinc-800'}`}>
                  Modifier le plan
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
