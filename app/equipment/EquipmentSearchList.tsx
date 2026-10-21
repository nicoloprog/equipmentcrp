"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import type { Equipment } from "@/lib/supabase/types";

function statusLabel(status: Equipment["status"]) {
  return { healthy: "OK", due_soon: "Bientôt", overdue: "Prioritaire", warranty_expiring: "Alerte de garantie" }[status];
}

export default function EquipmentSearchList({ equipment }: { equipment: Equipment[] }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const normalizedQuery = query.trim().toLowerCase();
  const filteredEquipment = equipment.filter((item) => !normalizedQuery || item.tag.toLowerCase().includes(normalizedQuery) || item.name.toLowerCase().includes(normalizedQuery));

  return (
    <>
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-medium text-gray-900">Inventaire</h1><p className="text-sm text-gray-500">Tous les véhicules, batteries, outils et plus.</p></div>
        <Link href="/equipment/new" className="inline-flex items-center gap-2 rounded-lg bg-gray-300 px-2 py-2 text-sm font-medium text-white"><Plus size={17} /> Ajouter</Link>
      </div>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="search" value={query} onFocus={() => setOpen(true)} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Rechercher par tag ou nom..." aria-label="Rechercher un équipement" className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100" />
        {open && normalizedQuery && <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {filteredEquipment.length ? filteredEquipment.map((item) => <Link key={item.id} href={`/vehicles/${item.id}`} onMouseDown={(event) => event.preventDefault()} className="block rounded-lg px-3 py-2 hover:bg-gray-50"><span className="block font-medium text-gray-900">{item.tag}</span><span className="block text-xs text-gray-500">{item.name}</span></Link>) : <p className="px-3 py-2 text-sm text-gray-500">Aucun équipement trouvé.</p>}
        </div>}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredEquipment.length ? filteredEquipment.map((item) => <Link key={item.id} href={`/vehicles/${item.id}`} className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-gray-50"><div><p className="font-semibold text-gray-950">{item.tag}</p><p className="text-sm text-gray-600">{item.name}</p></div><div className="flex items-center gap-4 text-sm"><span className="text-gray-500">{statusLabel(item.status)}</span><ArrowRight size={16} className="text-gray-400" /></div></Link>) : <p className="p-8 text-center text-sm text-gray-500">{query ? "Aucun équipement ne correspond à votre recherche." : <>Pas d&apos;équipement trouvé. Cliquez sur &quot;Ajouter&quot; pour créer un nouvel actif.</>}</p>}
      </div>
    </>
  );
}
