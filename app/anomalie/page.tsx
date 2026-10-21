"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EquipmentOption = { id: string; tag: string; name: string };

export default function ReportIssuePage() {
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { supabase.from("equipment").select("id, tag, name").order("tag").then(({ data }) => setEquipment(data ?? [])); }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !equipmentId) { setMessage("Sélectionnez l’équipement concerné."); setLoading(false); return; }
    const { error } = await supabase.from("equipment_alerts").insert({ equipment_id: equipmentId, reporter_id: user.id, title, description, severity, status: "open" });
    if (error) setMessage(error.message); else { setMessage("Anomalie signalée avec succès."); setTitle(""); setDescription(""); }
    setLoading(false);
  }

  return <main className="min-h-screen bg-[#f8f9fa] p-6 md:p-10"><div className="mx-auto max-w-2xl"><Link href="/" className="text-sm text-gray-500 hover:text-gray-900">← Retour à l&apos;accueil</Link><div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-start gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600"><Flag /></div><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-red-600">Alerte terrain</p><h1 className="mt-1 text-2xl font-semibold text-gray-900">Signaler un problème / Anomalie</h1><p className="mt-1 text-sm text-gray-500">Créez une alerte immédiate sans faire l&apos;inspection complète.</p></div></div>{equipment.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center"><p className="font-medium text-gray-900">Aucun équipement disponible</p><p className="mt-1 text-sm text-gray-500">Ajoutez un équipement avant de signaler une anomalie.</p><Link href="/equipment/new" className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">Ajouter un équipement</Link></div> : <form onSubmit={submit} className="mt-6 space-y-5"><label className="block text-sm font-medium text-gray-700">Équipement concerné<select required value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">Sélectionner...</option>{equipment.map((item) => <option key={item.id} value={item.id}>{item.tag} — {item.name}</option>)}</select></label><label className="block text-sm font-medium text-gray-700">Titre du problème<input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Pneu endommagé" className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" /></label><label className="block text-sm font-medium text-gray-700">Priorité<select value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)} className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="low">Faible</option><option value="medium">Moyenne</option><option value="high">Urgente</option></select></label><label className="block text-sm font-medium text-gray-700">Description<textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Décrivez le problème observé..." className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2" /></label>{message && <p className="text-sm text-gray-700">{message}</p>}<button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-medium text-white disabled:opacity-60">{loading && <Loader2 size={18} className="animate-spin" />}{loading ? "Envoi..." : "Signaler l’anomalie"}</button></form>}</div></div></main>;
}
