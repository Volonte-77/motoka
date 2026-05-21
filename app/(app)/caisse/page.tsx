"use client";

import { useState, useRef, useEffect } from "react";
import localforage from "localforage";
import { useReactToPrint } from "react-to-print";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowUpRight, ArrowDownLeft, Printer, Plus, Wallet, FileText, Landmark } from "lucide-react";
import { CashTransaction, STORAGE_KEYS } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useTenantContext } from "@/hooks/useAuthGuard";

/**
 * Page Caisse & Flux du Jour — MOTOKA Admin Agence
 * ✓ Multi-Agences: Filtrage automatique par user.agencyId
 * ✓ Offline-First: Persistance localforage
 * ✓ Isolation tenant: Les données ne sont visibles que par l'agence propriétaire
 */
export default function CaissePage() {
  const { user } = useAuthStore();
  const tenantContext = useTenantContext();

  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les transactions depuis localforage filtrées par agencyId
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        setLoading(true);
        let allTransactions = await localforage.getItem<CashTransaction[]>(STORAGE_KEYS.CASH_TRANSACTIONS) || [];

        // Filtrer par agencyId pour isolation multi-tenant
        if (!tenantContext?.viewAll && tenantContext?.agencyId) {
          allTransactions = allTransactions.filter(t => t.agencyId === tenantContext.agencyId);
        }

        setTransactions(allTransactions);
      } catch (error) {
        console.error("Erreur chargement transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [user, tenantContext]);

  const [activeReceipt, setActiveReceipt] = useState<CashTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Calculs financiers
  const entrees = transactions.filter(t => t.type === "Entrée").reduce((acc, t) => acc + t.amount, 0);
  const sorties = transactions.filter(t => t.type === "Sortie").reduce((acc, t) => acc + t.amount, 0);
  const soldeDuJour = entrees - sorties;

  // Configuration de react-to-print pour ticket thermique
  const receiptRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
  });

  const triggerPrintReceipt = (tx: CashTransaction) => {
    setActiveReceipt(tx);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* En-tête de Caisse */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Caisse & Flux du Jour</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Suivi des encaissements billets, frets et dépenses opérationnelles.</p>
        </div>
        <Button className="bg-primary text-primary-foreground font-medium flex items-center gap-2 cursor-pointer">
          <Plus size={16} /> Nouvelle Opération
        </Button>
      </div>

      {/* Cartes de Solde Cyber-Précises */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase">Encaissements (Entrées)</p>
              <h3 className="text-2xl font-bold text-emerald-500 mt-1">+{entrees} USD</h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500"><ArrowDownLeft size={20}/></div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase">Décaissements (Sorties)</p>
              <h3 className="text-2xl font-bold text-rose-500 mt-1">-{sorties} USD</h3>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500"><ArrowUpRight size={20}/></div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase">Solde Net Journalier</p>
              <h3 className={`text-2xl font-bold mt-1 ${soldeDuJour >= 0 ? "text-primary" : "text-rose-500"}`}>{soldeDuJour} USD</h3>
            </div>
            <div className="p-2 rounded-lg bg-primary/10 text-primary"><Wallet size={20}/></div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des flux */}
      <div className="w-full overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#121214]">
        <table className="w-full text-sm text-left text-zinc-500 dark:text-zinc-400">
          <thead className="text-xs uppercase bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500">
            <tr>
              <th className="px-4 py-3">Réf / Heure</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3">Montant</th>
              <th className="px-4 py-3 text-right">Bordereau</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 text-zinc-900 dark:text-zinc-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/20">
                <td className="px-4 py-3 font-mono text-xs">
                  <span className="text-zinc-400 dark:text-zinc-500">{tx.timestamp}</span> · {tx.id}
                </td>
                <td className="px-4 py-3 font-medium text-xs sm:text-sm">{tx.description}</td>
                <td className="px-4 py-3"><span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-600 dark:text-zinc-400">{tx.category}</span></td>
                <td className={`px-4 py-3 font-bold ${tx.type === "Entrée" ? "text-emerald-500" : "text-rose-500"}`}>
                  {tx.type === "Entrée" ? "+" : "-"}{tx.amount} $
                </td>
                <td className="px-4 py-3 text-right">
                  <Button onClick={() => triggerPrintReceipt(tx)} variant="outline" size="sm" className="h-8 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 cursor-pointer flex items-center gap-1 ml-auto">
                    <Printer size={13}/> Reçu
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL IMPRESSION DU TICKET THERMIQUE (FORMAT STANDARD 58mm / 80mm) */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base text-zinc-500 dark:text-zinc-400">Aperçu du Reçu de Caisse</DialogTitle>
          </DialogHeader>

          {/* ZONE IMPRIMABLE TECHNIQUE (Modélisée avec des styles natifs épurés pour l'imprimante) */}
          <div className="p-2 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-900/40">
            <div ref={receiptRef} className="p-4 bg-white text-black font-mono text-xs space-y-4 w-full">
              <div className="text-center space-y-1">
                <h2 className="text-sm font-bold tracking-tight uppercase">MOTOKA SAAS</h2>
                <p className="text-[10px] text-zinc-600">Agence de transport & fret</p>
                <p className="text-[9px] text-zinc-500">RDC — Nord-Kivu</p>
              </div>

              <div className="border-t border-b border-black border-dashed py-2 space-y-1 text-[10px]">
                <p>REÇU N° : {activeReceipt?.id}</p>
                <p>DATE    : {new Date().toLocaleDateString()}</p>
                <p>HEURE   : {activeReceipt?.timestamp}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <p className="font-bold">DESCRIPTION :</p>
                <p className="text-zinc-800">{activeReceipt?.description}</p>
                <p className="text-zinc-500">Catégorie: {activeReceipt?.category}</p>
              </div>

              <div className="border-t border-black border-dashed pt-2 flex justify-between font-bold text-sm">
                <span>TOTAL NET :</span>
                <span>{activeReceipt?.amount}.00 USD</span>
              </div>

              <div className="text-center pt-2 text-[9px] text-zinc-500 italic">
                Merci pour votre confiance !
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <Button variant="outline" onClick={() => setIsReceiptOpen(false)} className="text-xs h-9 cursor-pointer">Fermer</Button>
            <Button onClick={() => handlePrint()} className="bg-primary text-primary-foreground text-xs h-9 font-medium flex items-center gap-1.5 cursor-pointer">
              <Printer size={14} /> Lancer l'impression
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}