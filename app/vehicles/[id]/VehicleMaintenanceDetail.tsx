"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Gauge, Loader2, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getMaintenanceProgress, getMaintenanceStatus, type MaintenanceStatus } from "@/lib/maintenance/status";
import type { Equipment, EquipmentAlert, MaintenanceLog, MaintenancePlan } from "@/lib/supabase/types";

type PlanDraft = { title: string; intervalKm: string; intervalMonths: string };
const emptyDraft: PlanDraft = { title: "", intervalKm: "", intervalMonths: "" };
const badgeStyles: Record<MaintenanceStatus, string> = { OK: "bg-green-50 text-green-700 border-green-200", DUE_SOON: "bg-yellow-50 text-yellow-700 border-yellow-200", OVERDUE: "bg-red-50 text-red-700 border-red-200" };
const badgeLabels: Record<MaintenanceStatus, string> = { OK: "OK", DUE_SOON: "Bientôt dû", OVERDUE: "En retard" };

export default function VehicleMaintenanceDetail({ vehicle, photoUrl, plans: initialPlans, logs: initialLogs, alerts: initialAlerts, error, renderedAt }: { vehicle: Equipment; photoUrl: string | null; plans: MaintenancePlan[]; logs: MaintenanceLog[]; alerts: EquipmentAlert[]; error: string | null; renderedAt: string }) {
  const [plans, setPlans] = useState(initialPlans);
  const [logs, setLogs] = useState(initialLogs);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(error);
  const [showScheduleForm, setShowScheduleForm] = useState(initialPlans.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanDraft>(emptyDraft);
  const [now] = useState(() => new Date(renderedAt));
  const router = useRouter();
  const supabase = createClient();
  const planStatuses = useMemo(() => new Map(plans.map((plan) => [plan.id, getMaintenanceStatus(plan, vehicle, now)])), [plans, vehicle, now]);

  function startEdit(plan: MaintenancePlan) {
    setEditingId(plan.id); setShowScheduleForm(true); setDraft({ title: plan.title, intervalKm: plan.interval_km?.toString() ?? "", intervalMonths: plan.interval_months?.toString() ?? "" });
  }

  async function deleteAlert(alert: EquipmentAlert) {
    if (!window.confirm("Supprimer définitivement cette anomalie ?")) return;
    setBusyId(`alert-${alert.id}`);
    setMessage(null);
    const { data: resolvedRows, error: deleteError } = await supabase
      .from("equipment_alerts")
      .update({ status: "resolved" })
      .eq("id", alert.id)
      .select("id, status");
    if (deleteError) setMessage(deleteError.message);
    else if (!resolvedRows?.length) {
      setMessage("L’anomalie n’a pas pu être fermée.");
    } else {
      setAlerts((current) => current.filter((item) => item.id !== alert.id));
      setMessage("Anomalie fermée et retirée des anomalies ouvertes.");
      router.refresh();
    }
    setBusyId(null);
  }

  async function savePlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const intervalKm = draft.intervalKm ? Number(draft.intervalKm) : null;
    const intervalMonths = draft.intervalMonths ? Number(draft.intervalMonths) : null;
    if (!draft.title.trim() || (intervalKm == null && intervalMonths == null)) { setMessage("Ajoutez un titre et au moins un intervalle."); return; }
    setBusyId(editingId ?? "new"); setMessage(null);
    if (editingId) {
      const { data, error: updateError } = await supabase.from("maintenance_plans").update({ title: draft.title.trim(), interval_km: intervalKm, interval_months: intervalMonths }).eq("id", editingId).select("*").single();
      if (updateError) setMessage(updateError.message); else { setPlans((current) => current.map((plan) => plan.id === editingId ? data : plan)); setMessage("Règle mise à jour."); }
    } else {
      const { data, error: insertError } = await supabase.from("maintenance_plans").insert({ equipment_id: vehicle.id, title: draft.title.trim(), interval_km: intervalKm, interval_months: intervalMonths, last_completed_km: vehicle.current_km ?? 0, last_completed_date: new Date().toISOString().slice(0, 10), active: true }).select("*").single();
      if (insertError) setMessage(insertError.message); else { setPlans((current) => [...current, data]); setMessage("Règle ajoutée à cet équipement."); }
    }
    setDraft(emptyDraft); setEditingId(null); setShowScheduleForm(false); setBusyId(null);
  }

  async function deletePlan(plan: MaintenancePlan) {
    if (!window.confirm(`Supprimer la règle « ${plan.title} » ?`)) return;
    setBusyId(plan.id); const { error: deleteError } = await supabase.from("maintenance_plans").delete().eq("id", plan.id);
    if (deleteError) setMessage(deleteError.message); else { setPlans((current) => current.filter((item) => item.id !== plan.id)); setLogs((current) => current.filter((log) => log.maintenance_plan_id !== plan.id)); setMessage("Règle supprimée."); }
    setBusyId(null);
  }

  async function completePlan(plan: MaintenancePlan) {
    if (vehicle.current_km == null) { setMessage("Mettez d’abord à jour le kilométrage depuis une inspection."); return; }
    setBusyId(plan.id); setMessage(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setMessage("Votre session a expiré."); setBusyId(null); return; }
    const { data: logId, error: completionError } = await supabase.rpc("complete_maintenance_plan", { p_plan_id: plan.id, p_equipment_id: vehicle.id, p_completed_km: vehicle.current_km, p_completed_by: user.id, p_notes: null });
    if (completionError) setMessage(completionError.message);
    else { const today = new Date().toISOString().slice(0, 10); setPlans((current) => current.map((item) => item.id === plan.id ? { ...item, last_completed_km: vehicle.current_km!, last_completed_date: today } : item)); setLogs((current) => [{ id: logId ?? crypto.randomUUID(), equipment_id: vehicle.id, maintenance_plan_id: plan.id, completed_km: vehicle.current_km!, completed_date: today, notes: null, completed_by: user.id }, ...current]); setMessage("Maintenance terminée et ajoutée à l’historique."); }
    setBusyId(null);
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-5 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Link href="/equipment" className="text-sm text-gray-500 hover:text-gray-900">← Retour à l&apos;inventaire</Link>
        <header className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-24">
                {photoUrl ? <img src={photoUrl} alt={`Photo de ${vehicle.tag} — ${vehicle.name}`} className="h-full w-full object-cover" /> : <span className="px-2 text-center text-xs text-gray-400">Aucune photo</span>}
              </div>
              <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">{vehicle.category}</p><h1 className="mt-1 break-words text-2xl font-semibold text-gray-900 sm:text-3xl">{vehicle.tag} — {vehicle.name}</h1></div>
            </div>
            <div className="flex w-fit items-center gap-3 rounded-xl bg-gray-50 px-4 py-3"><Gauge className="text-gray-500" /><div><p className="text-xs text-gray-500">Kilométrage actuel</p><p className="font-mono text-xl font-semibold text-gray-900">{vehicle.current_km != null ? `${vehicle.current_km.toLocaleString("fr-CA")} km` : "Non renseigné"}</p></div></div>
          </div>
        </header>
        {message && <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">{message}</p>}
        <section className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold text-gray-900">Rapports d&apos;inspection</h2><p className="mt-1 text-sm text-gray-500">Anomalies signalées pour cet équipement.</p></div><span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{alerts.filter((alert) => alert.status === "open").length} ouverte(s)</span></div>
          {alerts.length === 0 ? <p className="mt-5 rounded-lg bg-gray-50 p-4 text-sm text-gray-500">Aucun problème signalé.</p> : <div className="mt-5 space-y-3">{alerts.map((alert) => <article key={alert.id} className="rounded-xl border border-gray-200 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-semibold text-gray-900">{alert.title}</h3><p className="mt-1 whitespace-pre-wrap text-sm text-gray-600">{alert.description}</p></div><span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${alert.severity === "high" ? "bg-red-50 text-red-700" : alert.severity === "medium" ? "bg-yellow-50 text-yellow-700" : "bg-gray-100 text-gray-700"}`}>{alert.severity === "high" ? "Urgente" : alert.severity === "medium" ? "Moyenne" : "Faible"}</span></div><div className="mt-3 flex flex-col gap-3 border-t border-gray-100 pt-3 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between"><span>{new Date(alert.created_at).toLocaleDateString("fr-CA")} · {alert.status === "open" ? "Ouverte" : "Résolue"}</span><button type="button" disabled={busyId === `alert-${alert.id}`} onClick={() => deleteAlert(alert)} className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60">{busyId === `alert-${alert.id}` ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Supprimer</button></div></article>)}</div>}
        </section>
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold text-gray-900">Planning personnalisé</h2><p className="mt-1 text-sm text-gray-500">Configurez les intervalles propres à ce véhicule ou outil.</p></div><button type="button" onClick={() => { setEditingId(null); setDraft(emptyDraft); setShowScheduleForm((current) => !current); }} className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"><Plus size={16} /> Ajouter une règle</button></div>{showScheduleForm && <form onSubmit={savePlan} className="mt-5 grid gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 md:grid-cols-4"><label className="text-sm font-medium text-gray-700 md:col-span-2">Titre de la règle<input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex. Vidange et filtre à huile" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" /></label><label className="text-sm font-medium text-gray-700">Intervalle km<input type="number" min="1" value={draft.intervalKm} onChange={(e) => setDraft({ ...draft, intervalKm: e.target.value })} placeholder="12000" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" /></label><label className="text-sm font-medium text-gray-700">Intervalle mois<input type="number" min="1" value={draft.intervalMonths} onChange={(e) => setDraft({ ...draft, intervalMonths: e.target.value })} placeholder="12" className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2" /></label><div className="flex gap-2 md:col-span-4"><button disabled={busyId === (editingId ?? "new")} className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">{busyId === (editingId ?? "new") && <Loader2 size={16} className="animate-spin" />}{editingId ? "Enregistrer les modifications" : "Ajouter la règle"}</button><button type="button" onClick={() => { setShowScheduleForm(false); setEditingId(null); setDraft(emptyDraft); }} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700">Annuler</button></div></form>}</section>
        {plans.length === 0 ? <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center"><Wrench className="mx-auto text-gray-300" size={36} /><h2 className="mt-3 font-semibold text-gray-900">Aucune règle de maintenance</h2><p className="mt-1 text-sm text-gray-500">Ajoutez une règle ci-dessus, par exemple 12 000 km ou 12 mois.</p></section> : <section><div className="mb-4"><h2 className="text-xl font-semibold text-gray-900">Règles de maintenance actives</h2><p className="mt-1 text-sm text-gray-500">Progression selon le kilométrage et/ou la période.</p></div><div className="grid gap-4 lg:grid-cols-2">{plans.map((plan) => { const result = planStatuses.get(plan.id)!; const progress = getMaintenanceProgress(plan, vehicle, now); return <article key={plan.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold text-gray-900">{plan.title}</h3><p className="mt-1 text-xs text-gray-500">{result.dueKm != null ? `Échéance: ${result.dueKm.toLocaleString("fr-CA")} km` : ""}{result.dueKm != null && result.dueDate ? " · " : ""}{result.dueDate ? `le ${result.dueDate}` : ""}</p></div><span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeStyles[result.status]}`}>{badgeLabels[result.status]}</span></div><div className="mt-5"><div className="mb-2 flex justify-between text-xs text-gray-500"><span>Progression</span><span>{Math.round(progress)}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${result.status === "OVERDUE" ? "bg-red-500" : result.status === "DUE_SOON" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${progress}%` }} /></div></div><div className="mt-5 flex flex-wrap gap-2"><button disabled={busyId === plan.id || vehicle.current_km == null} onClick={() => completePlan(plan)} className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50">{busyId === plan.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Marquer terminée</button><button type="button" onClick={() => startEdit(plan)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"><Pencil size={15} /> Modifier</button><button type="button" onClick={() => deletePlan(plan)} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"><Trash2 size={15} /> Supprimer</button></div>{vehicle.current_km == null && <p className="mt-2 text-xs text-amber-700">Mettez à jour le kilométrage via une inspection.</p>}</article>; })}</div></section>}
        <section className="rounded-2xl border border-gray-200 bg-white shadow-sm"><div className="border-b border-gray-200 p-5"><h2 className="text-xl font-semibold text-gray-900">Historique de maintenance</h2></div>{logs.length === 0 ? <div className="p-8 text-center text-sm text-gray-500"><Clock className="mx-auto mb-2 text-gray-300" />Aucun événement terminé.</div> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Kilométrage</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Règle</th><th className="px-5 py-3 text-left text-xs font-semibold uppercase text-gray-500">Notes</th></tr></thead><tbody className="divide-y divide-gray-100">{logs.map((log) => <tr key={log.id}><td className="px-5 py-3 text-sm text-gray-700">{log.completed_date}</td><td className="px-5 py-3 text-sm text-gray-700">{log.completed_km.toLocaleString("fr-CA")} km</td><td className="px-5 py-3 text-sm text-gray-700">{plans.find((plan) => plan.id === log.maintenance_plan_id)?.title ?? "Maintenance"}</td><td className="px-5 py-3 text-sm text-gray-500">{log.notes ?? "—"}</td></tr>)}</tbody></table></div>}</section>
      </div>
    </main>
  );
}
