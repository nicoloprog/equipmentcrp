"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, QrCode, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EquipmentOption = { id: string; tag: string; name: string };
const checks = ["Freins", "Éclairage", "Pneus / roues", "Niveaux / fuites", "Équipement de sécurité"];

export default function QuickInspectionPage() {
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [tag, setTag] = useState("");
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("equipment").select("id, tag, name").order("tag").then(({ data }) => setEquipment(data ?? []));
  }, []);

  function selectByTag(value: string) {
    const match = equipment.find((item) => item.tag.toLowerCase() === value.trim().toLowerCase());
    if (match) setSelectedId(match.id);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    const failed = checks.some((check) => results[check] === false);
    if (!user || !selectedId) { setMessage("Sélectionnez un équipement avant de continuer."); setLoading(false); return; }
    const { error } = await supabase.from("inspections").insert({ equipment_id: selectedId, inspector_id: user.id, status: failed ? "failed" : "passed", checks: results, notes: notes || null });
    if (error) setMessage(error.message); else { setMessage("Inspection enregistrée."); setResults({}); setNotes(""); }
    setLoading(false);
  }

  return <main className="min-h-screen bg-[#f8f9fa] p-6 md:p-10"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Retour à l&apos;accueil</Link><div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-600">Inspection terrain</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Inspection rapide</h1><p className="mt-1 text-sm text-gray-500">Passez chaque point en vert ou rouge.</p></div>{equipment.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="font-medium text-gray-900">Aucun équipement disponible</p><p className="mt-1 text-sm text-gray-500">Ajoutez un équipement avant de commencer une inspection.</p><Link href="/equipment/new" className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Ajouter un équipement</Link></div> : <form onSubmit={submit} className="mt-6 space-y-6"><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-gray-700">Choisir un équipement<select required value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Sélectionner...</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.tag} — {item.name}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Scanner un QR / tag<div className="relative mt-2"><QrCode size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={tag} onChange={(e) => { setTag(e.target.value); selectByTag(e.target.value); }} placeholder="VHL-123456" className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3" /></div></label></div><div className="space-y-3">{checks.map((check) => <div key={check} className="flex items-center justify-between rounded-xl border border-gray-200 p-4"><span className="font-medium text-gray-800">{check}</span><div className="flex gap-2"><button type="button" aria-label={`${check} conforme`} onClick={() => setResults((current) => ({ ...current, [check]: true }))} className={`rounded-lg p-2 ${results[check] === true ? "bg-green-600 text-white" : "bg-green-50 text-green-700"}`}><Check size={20} /></button><button type="button" aria-label={`${check} non conforme`} onClick={() => setResults((current) => ({ ...current, [check]: false }))} className={`rounded-lg p-2 ${results[check] === false ? "bg-red-600 text-white" : "bg-red-50 text-red-700"}`}><X size={20} /></button></div></div>)}</div><label className="block text-sm font-medium text-gray-700">Notes facultatives<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" placeholder="Ajouter une observation..." /></label>{message && <p className="text-sm text-gray-700">{message}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? "Enregistrement..." : "Enregistrer l’inspection"}</button></form>}</div></div></main>;
}
