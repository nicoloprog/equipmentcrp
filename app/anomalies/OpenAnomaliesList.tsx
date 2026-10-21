"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ExternalLink, Flag } from "lucide-react";
import type { EquipmentAlert } from "@/lib/supabase/types";

type Asset = { id: string; tag: string; name: string };

export default function OpenAnomaliesList({
  initialAlerts,
  assets,
  error,
}: {
  initialAlerts: EquipmentAlert[];
  assets: Asset[];
  error: string | null;
}) {
  const [alerts] = useState(initialAlerts);
  const assetsById = new Map(assets.map((asset) => [asset.id, asset]));

  return (
    <>
      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Impossible de charger les anomalies : {error}</p>}
      {alerts.length ? (
        <section className="grid gap-4 lg:grid-cols-2" aria-label="Anomalies ouvertes">
          {alerts.map((alert) => {
            const asset = assetsById.get(alert.equipment_id);
            return (
              <article key={alert.id} className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600"><AlertTriangle size={19} /></div>
                    <div className="min-w-0"><h2 className="break-words font-semibold text-gray-900">{alert.title}</h2><p className="mt-1 text-sm font-medium text-gray-600">{asset ? `${asset.tag} — ${asset.name}` : "Équipement introuvable"}</p></div>
                  </div>
                  <span className="shrink-0 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">{alert.severity === "high" ? "Urgente" : alert.severity === "medium" ? "Moyenne" : "Faible"}</span>
                </div>
                <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">{alert.description}</p>
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs text-gray-400">Signalée le {new Date(alert.created_at).toLocaleDateString("fr-CA")}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {asset && <Link href={`/vehicles/${asset.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-red-600">Voir l&apos;équipement <ExternalLink size={14} /></Link>}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm sm:p-14"><Flag className="mx-auto text-gray-300" size={38} /><h2 className="mt-4 text-lg font-semibold text-gray-900">Aucune anomalie ouverte</h2><p className="mt-1 text-sm text-gray-500">Les problèmes signalés pendant une inspection apparaîtront ici.</p></section>
      )}
    </>
  );
}
