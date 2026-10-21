"use client";

import { useState } from "react";
import { CheckCircle, Clock, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceTask } from "@/lib/supabase/types";

type MaintenanceRow = MaintenanceTask & { assetTag: string; assetName: string };

export default function MaintenanceQueue({ tasks, error }: { tasks: MaintenanceRow[]; error: string | null }) {
  const [workOrders, setWorkOrders] = useState(tasks);
  const [filter, setFilter] = useState("all");
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleCompleteTask(id: string) {
    setUpdateError(null);
    const { error: completionError } = await createClient().from("maintenance_tasks").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", id);
    if (completionError) { setUpdateError(completionError.message); return; }
    setWorkOrders((current) => current.map((task) => task.id === id ? { ...task, status: "completed", completed_at: new Date().toISOString() } : task));
  }

  const filteredOrders = workOrders.filter((task) => filter === "all" || task.status === filter);
  const statusLabel = { overdue: "En retard", due_soon: "Bientôt dû", upcoming: "À venir", completed: "Terminé" };

  return <div className="min-h-screen bg-gray-50 p-6 md:p-8"><div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-2xl font-bold text-gray-900">File de maintenance</h1><p className="text-sm text-gray-500">Suivez les tâches d&apos;entretien liées à vos équipements.</p></header>{(error || updateError) && <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">{error ?? updateError}</p>}<div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 shadow-sm">{["all", "due_soon", "overdue", "completed"].map((tab) => <button key={tab} onClick={() => setFilter(tab)} className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium capitalize ${filter === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{tab === "all" ? "Toutes les tâches" : statusLabel[tab as keyof typeof statusLabel]}</button>)}</div><div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"><div className="overflow-x-auto">{filteredOrders.length ? <table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Équipement</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Tâche</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Échéance</th><th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th><th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th></tr></thead><tbody className="divide-y divide-gray-200">{filteredOrders.map((task) => <tr key={task.id} className="hover:bg-gray-50"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"><Wrench className="h-4 w-4 text-blue-600" /></div><div><div className="font-semibold text-gray-900">{task.assetTag}</div><div className="text-sm text-gray-500">{task.assetName}</div></div></div></td><td className="px-6 py-4 text-sm font-medium text-gray-900">{task.title}</td><td className="px-6 py-4 text-sm text-gray-600"><span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4 text-gray-400" />{task.due_date}</span></td><td className="px-6 py-4"><span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">{statusLabel[task.status]}</span></td><td className="px-6 py-4 text-right">{task.status !== "completed" ? <button onClick={() => handleCompleteTask(task.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100"><CheckCircle className="h-4 w-4" />Terminer</button> : <span className="text-xs font-medium text-gray-400">Terminé</span>}</td></tr>)}</tbody></table> : <div className="p-12 text-center"><Wrench className="mx-auto text-gray-300" size={36} /><h2 className="mt-3 font-semibold text-gray-900">Aucune tâche de maintenance</h2><p className="mt-1 text-sm text-gray-500">Ajoutez d&apos;abord un équipement, puis créez ses tâches d&apos;entretien.</p></div>}</div></div></div></div>;
}
