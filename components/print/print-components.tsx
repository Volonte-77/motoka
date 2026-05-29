"use client";

import React from "react";
import { Package, Trip, Agency, CashTransaction } from "@/types";
import { ShieldCheck, MapPin, Package as PackageIcon, Car, Receipt } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * REÇU THERMIQUE (80mm) - Optimisé pour imprimantes à rouleau
 */
export const ThermalReceipt = React.forwardRef<HTMLDivElement, { pkg: Package; agency: Agency }>(
  ({ pkg, agency }, ref) => {
    return (
      <div ref={ref} className="w-[80mm] p-[5mm] bg-white text-black font-mono text-[10px] leading-tight print:block hidden">
        <div className="text-center border-b border-dashed border-black pb-2 mb-2">
          <h1 className="text-sm font-bold uppercase">{agency.name}</h1>
          <p className="text-[8px]">{agency.city}</p>
          <p className="text-[8px]">{agency.email}</p>
        </div>

        <div className="space-y-1 mb-2">
          <div className="flex justify-between">
            <span>DATE:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>N° SUIVI:</span>
            <span className="font-bold">{pkg.id}</span>
          </div>
        </div>

        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-1">
          <p className="font-bold border-b border-black w-fit mb-1">EXPÉDITEUR</p>
          <p>{pkg.sender}</p>
          <p className="font-bold border-b border-black w-fit mb-1 mt-2">DESTINATAIRE</p>
          <p>{pkg.receiver}</p>
          <p>Tél: {pkg.phoneReceiver}</p>
        </div>

        <div className="space-y-1 mb-2">
          <p className="font-bold uppercase tracking-widest text-[8px]">Détails Fret:</p>
          <p>{pkg.description}</p>
          <div className="flex justify-between">
            <span>Itinéraire:</span>
            <span>{pkg.route}</span>
          </div>
          <div className="flex justify-between">
            <span>Poids:</span>
            <span>{pkg.weight}</span>
          </div>
          <div className="flex justify-between">
            <span>Valeur:</span>
            <span>{pkg.value}</span>
          </div>
        </div>

        <div className="border-2 border-black p-2 text-center my-4">
          <p className="text-[8px] font-bold">CODE DE RÉCUPÉRATION (OTP)</p>
          <p className="text-xl font-black">{pkg.otp}</p>
        </div>

        <div className="text-center text-[8px] pt-2 border-t border-dashed border-black">
          <p>Merci de votre confiance !</p>
          <p>www.motoka.cd</p>
        </div>
      </div>
    );
  }
);
ThermalReceipt.displayName = "ThermalReceipt";

/**
 * FACTURE A4 - Format standard pour courses et rapports
 */
export const A4Invoice = React.forwardRef<HTMLDivElement, { trip: Trip; agency: Agency }>(
  ({ trip, agency }, ref) => {
    return (
      <div ref={ref} className="w-[210mm] min-h-[297mm] p-12 bg-white text-zinc-900 font-sans print:block hidden mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-2 border-emerald-500 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-black text-emerald-600 uppercase tracking-tighter">{agency.name}</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Services de Transport & Logistique</p>
            <div className="mt-4 text-sm text-zinc-600 space-y-0.5">
              <p>{agency.city}, République Démocratique du Congo</p>
              <p>Email: {agency.email}</p>
            </div>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase text-zinc-800">Facture / Ticket</h2>
            <p className="text-zinc-500 font-mono text-sm mt-1">REF: {trip.id.toUpperCase()}</p>
            <p className="text-zinc-500 text-sm mt-1">Date: {new Date().toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-12 mb-12">
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Détails de l'itinéraire</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="text-emerald-500" size={18} />
                <span className="text-lg font-bold">{trip.route}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <span className="text-xs font-bold uppercase">Départ:</span>
                <span className="text-sm font-medium">{trip.departureTime.replace("T", " à ")}</span>
              </div>
            </div>
          </div>
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Équipage & Véhicule</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Car className="text-emerald-500" size={18} />
                <span className="text-lg font-bold">{trip.vehicle}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600">
                <span className="text-xs font-bold uppercase">Chauffeur:</span>
                <span className="text-sm font-medium">{trip.driver}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-zinc-900 text-white">
                <th className="py-4 px-6 text-left text-xs font-bold uppercase tracking-widest">Désignation</th>
                <th className="py-4 px-6 text-center text-xs font-bold uppercase tracking-widest">Quantité</th>
                <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest">Prix Unitaire</th>
                <th className="py-4 px-6 text-right text-xs font-bold uppercase tracking-widest">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-100">
                <td className="py-6 px-6">
                  <p className="font-bold text-zinc-800">Ticket de Voyage - {trip.route}</p>
                  <p className="text-xs text-zinc-500 mt-1">Passage sécurisé via réseau {agency.name}</p>
                </td>
                <td className="py-6 px-6 text-center font-bold">{trip.passengers} PAX</td>
                <td className="py-6 px-6 text-right text-zinc-500 italic">--</td>
                <td className="py-6 px-6 text-right font-black text-zinc-800">Facturé à l'embarquement</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary & Stamp */}
        <div className="mt-auto pt-20 flex justify-between items-end border-t border-zinc-100">
          <div className="max-w-xs">
            <div className="flex items-center gap-3 mb-4">
              <ShieldCheck className="text-emerald-500" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase text-zinc-800 leading-none">Document Certifié</p>
                <p className="text-[8px] text-zinc-500 mt-1 uppercase">Généré par Motoka Engine v2.0</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 italic">Ce document tient lieu de facture et de preuve de voyage pour le passager dont le nom figure sur le manifeste.</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase mb-4 tracking-widest">Visa & Cachet Agence</p>
            <div className="w-48 h-24 border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-300 italic text-xs">
              Signature Autorisée
            </div>
          </div>
        </div>
      </div>
    );
  }
);
A4Invoice.displayName = "A4Invoice";

/**
 * RAPPORT FINANCIER A4
 */
export const A4FinancialReport = React.forwardRef<HTMLDivElement, { data: any }>(
  ({ data }, ref) => {
    return (
      <div ref={ref} className="w-[210mm] min-h-[297mm] p-12 bg-white text-zinc-900 font-sans print:block hidden mx-auto">
        <div className="flex justify-between items-start border-b-4 border-zinc-900 pb-8 mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter">{data.agencyName}</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Rapport de Performance Financière</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold uppercase text-zinc-800">Bilan Périodique</h2>
            <p className="text-zinc-500 text-sm mt-1">Date: {data.date}</p>
          </div>
        </div>

        <div className="bg-zinc-900 text-white p-8 rounded-3xl grid grid-cols-3 gap-8 mb-12 shadow-2xl">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recettes Totales</p>
            <p className="text-2xl font-black text-emerald-400">{data.totals.in.toLocaleString()} FCFA</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dépenses Totales</p>
            <p className="text-2xl font-black text-rose-400">{data.totals.out.toLocaleString()} FCFA</p>
          </div>
          <div className="space-y-1 border-l border-zinc-800 pl-8">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Résultat Net</p>
            <p className="text-2xl font-black">{(data.totals.in - data.totals.out).toLocaleString()} FCFA</p>
          </div>
        </div>

        <div className="mb-12">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Détails des Mouvements (Top 10)</h3>
          <table className="w-full">
            <thead className="border-b-2 border-zinc-100">
              <tr className="text-left text-[10px] font-black uppercase text-zinc-500">
                <th className="py-4">ID</th>
                <th className="py-4">Désignation</th>
                <th className="py-4">Catégorie</th>
                <th className="py-4 text-right">Montant (FCFA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {data.transactions.map((t: any, i: number) => (
                <tr key={i} className="text-sm">
                  <td className="py-4 font-mono text-xs font-bold text-zinc-400">{t.id}</td>
                  <td className="py-4 font-bold text-zinc-800">{t.desc}</td>
                  <td className="py-4 uppercase text-[10px] font-bold text-zinc-500">{t.cat}</td>
                  <td className={cn("py-4 text-right font-black", t.type === "Entrée" ? "text-emerald-600" : "text-rose-600")}>
                    {t.type === "Entrée" ? "+" : "-"} {t.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-auto pt-10 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400">
          <p>Document généré par Motoka BI - Version Agence {data.branchName}</p>
          <p>Page 1 sur 1</p>
        </div>
      </div>
    );
  }
);
A4FinancialReport.displayName = "A4FinancialReport";
