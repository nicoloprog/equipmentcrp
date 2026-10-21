"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Clock, ExternalLink, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceStatus } from "@/lib/maintenance/status";
import type { MaintenancePlan } from "@/lib/supabase/types";

type MaintenanceRow = MaintenancePlan & {
  assetTag: string;
  assetName: string;
  currentKm: number | null;
  progress: number;
  status: MaintenanceStatus;
  dueDate: string | null;
  dueKm: number | null;
};

const statusLabel: Record<MaintenanceStatus, string> = {
  OK: "OK",
  DUE_SOON: "Bientôt dû",
  OVERDUE: "Prioritaire",
};

const statusStyle: Record<MaintenanceStatus, string> = {
  OK: "border-green-200 bg-green-50 text-green-700",
  DUE_SOON: "border-yellow-200 bg-yellow-50 text-yellow-700",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
};

export default function MaintenanceQueue({
  plans,
  error,
}: {
  plans: MaintenanceRow[];
  error: string | null;
}) {
  const [rows, setRows] = useState(plans);
  const [filter, setFilter] = useState<"all" | "due_soon" | "overdue">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const supabase = createClient();

  async function completePlan(plan: MaintenanceRow) {
    if (plan.currentKm == null) {
      setUpdateError("Mettez à jour le kilométrage pendant une inspection avant de terminer cette maintenance.");
      return;
    }

    setBusyId(plan.id);
    setUpdateError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setUpdateError("Votre session a expiré.");
      setBusyId(null);
      return;
    }

    const { error: completionError } = await supabase.rpc(
      "complete_maintenance_plan",
      {
        p_plan_id: plan.id,
        p_equipment_id: plan.equipment_id,
        p_completed_km: plan.currentKm,
        p_completed_by: user.id,
        p_notes: null,
      },
    );

    if (completionError) {
      setUpdateError(completionError.message);
    } else {
      setRows((current) =>
        current.map((item) =>
          item.id === plan.id
            ? {
                ...item,
                last_completed_km: plan.currentKm!,
                last_completed_date: new Date().toISOString().slice(0, 10),
                progress: 0,
                status: "OK",
              }
            : item,
        ),
      );
    }

    setBusyId(null);
  }

  const filteredPlans = rows.filter((plan) =>
    filter === "all"
      ? true
      : filter === "overdue"
        ? plan.progress >= 100
        : plan.progress >= 85 && plan.progress < 100,
  );
  const message = error ?? updateError;

  function ActionButtons({ plan }: { plan: MaintenanceRow }) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          href={`/vehicles/${plan.equipment_id}`}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          Détails
        </Link>
        <button
          disabled={busyId === plan.id || plan.currentKm == null}
          onClick={() => completePlan(plan)}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle className="h-4 w-4" />
          {busyId === plan.id ? "..." : "Terminer"}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            File de maintenance
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Consultez les services planifiés pour chaque véhicule et outil.
          </p>
        </header>

        {message && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            {message}
          </p>
        )}

        <div className="flex gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
          {(["all", "due_soon", "overdue"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`min-h-10 shrink-0 rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${filter === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab === "all"
                ? "Toutes les tâches"
                : tab === "due_soon"
                  ? "Bientôt dû"
                  : "Prioritaire"}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {filteredPlans.length ? (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Équipement</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Progression</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100"><Wrench className="h-4 w-4 text-blue-600" /></div><div><div className="font-semibold text-gray-900">{plan.assetTag}</div><div className="text-sm text-gray-500">{plan.assetName}</div></div></div></td>
                        <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{plan.title}</p><p className="mt-1 text-xs text-gray-500">{plan.dueKm != null ? `${plan.dueKm.toLocaleString("fr-CA")} km` : ""}{plan.dueKm != null && plan.dueDate ? " · " : ""}{plan.dueDate ?? ""}</p></td>
                        <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="h-2 w-28 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${plan.status === "OVERDUE" ? "bg-red-500" : plan.status === "DUE_SOON" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${plan.progress}%` }} /></div><span className="text-xs text-gray-500">{Math.round(plan.progress)}%</span></div></td>
                        <td className="px-6 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyle[plan.status]}`}>{statusLabel[plan.status]}</span></td>
                        <td className="px-6 py-4"><ActionButtons plan={plan} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 p-3 md:hidden">
                {filteredPlans.map((plan) => (
                  <article key={plan.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><p className="truncate font-semibold text-gray-900">{plan.assetTag}</p><p className="truncate text-sm text-gray-500">{plan.assetName}</p></div>
                      <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-medium ${statusStyle[plan.status]}`}>{statusLabel[plan.status]}</span>
                    </div>
                    <h2 className="mt-4 break-words font-medium text-gray-900">{plan.title}</h2>
                    <div className="mt-4 flex items-center gap-3"><div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full ${plan.status === "OVERDUE" ? "bg-red-500" : plan.status === "DUE_SOON" ? "bg-yellow-500" : "bg-green-500"}`} style={{ width: `${plan.progress}%` }} /></div><span className="shrink-0 text-xs text-gray-500">{Math.round(plan.progress)}%</span></div>
                    <p className="mt-2 text-xs text-gray-500">{plan.dueKm != null ? `Prochaine échéance: ${plan.dueKm.toLocaleString("fr-CA")} km` : ""}{plan.dueKm != null && plan.dueDate ? " · " : ""}{plan.dueDate ?? ""}</p>
                    <div className="mt-4"><ActionButtons plan={plan} /></div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="p-10 text-center sm:p-12"><Clock className="mx-auto text-gray-300" size={36} /><h2 className="mt-3 font-semibold text-gray-900">Aucune maintenance planifiée</h2><p className="mt-1 text-sm text-gray-500">Ajoutez une règle dans la page de détails d&apos;un véhicule ou outil.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
