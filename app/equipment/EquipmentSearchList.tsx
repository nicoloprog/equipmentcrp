"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus, Search } from "lucide-react";
import type { MaintenanceStatus } from "@/lib/maintenance/status";
import type { Equipment } from "@/lib/supabase/types";

type StatusFilter = "ALL" | MaintenanceStatus;

const statusLabel: Record<MaintenanceStatus, string> = {
  OK: "OK",
  DUE_SOON: "Bientôt dû",
  OVERDUE: "Prioritaire",
};

const statusDescription: Record<MaintenanceStatus, string> = {
  OK: "Rien à maintenir",
  DUE_SOON: "Entretien à venir",
  OVERDUE: "Entretien prioritaire",
};

const statusStyles: Record<MaintenanceStatus, string> = {
  OK: "border-green-200 bg-green-50 text-green-700",
  DUE_SOON: "border-amber-200 bg-amber-50 text-amber-700",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
};

export default function EquipmentSearchList({
  equipment,
  statusByEquipmentId,
}: {
  equipment: Equipment[];
  statusByEquipmentId: Record<string, MaintenanceStatus>;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [tagFilter, setTagFilter] = useState("ALL");
  const normalizedQuery = query.trim().toLowerCase();
  const tagPrefixes = Array.from(
    new Set(
      equipment
        .map((item) => item.tag.split("-")[0]?.trim().toUpperCase())
        .filter(Boolean),
    ),
  ).sort();
  const getStatus = (item: Equipment): MaintenanceStatus =>
    statusByEquipmentId[item.id] ?? "OK";
  const filteredEquipment = equipment
    .filter(
      (item) =>
        !normalizedQuery ||
        item.tag.toLowerCase().includes(normalizedQuery) ||
        item.name.toLowerCase().includes(normalizedQuery),
    )
    .filter(
      (item) => statusFilter === "ALL" || getStatus(item) === statusFilter,
    )
    .filter(
      (item) =>
        tagFilter === "ALL" ||
        item.tag.toUpperCase().startsWith(`${tagFilter}-`),
    );

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Inventaire
          </h1>
          <p className="text-sm text-gray-500">
            Tous les véhicules, batteries, outils et plus.
          </p>
        </div>
        <Link
          href="/equipment/new"
          className="inline-flex items-center gap-2 rounded-lg border-blue-200 bg-blue-50 px-2 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} /> Ajouter
        </Link>
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2" aria-label="Filtrer par état">
          <h2 className="text-sm font-semibold tracking-tight sm:text-sm">
            Status :
          </h2>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-[15%] border px-1 py-1.5 text-xs cursor-pointer font-medium ${statusFilter === "ALL" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"}`}
          ></button>
          {(Object.keys(statusLabel) as MaintenanceStatus[]).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-[15%] border px-2 py-1.5 text-xs cursor-pointer font-medium ${statusFilter === status ? statusStyles[status] : "border-gray-200 bg-white text-gray-600"}`}
            >
              {statusLabel[status]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filtrer par tag">
          <h2 className="text-sm font-semibold tracking-tight sm:text-sm">
            Tags :
          </h2>
          <button
            type="button"
            onClick={() => setTagFilter("ALL")}
            className={`rounded-[15%] border px-1 py-1.5 text-xs cursor-pointer font-medium ${tagFilter === "ALL" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"}`}
          ></button>
          {tagPrefixes.map((prefix) => (
            <button
              key={prefix}
              type="button"
              onClick={() => setTagFilter(prefix)}
              className={`rounded-[15%] border px-2 py-1.5 text-xs cursor-pointer font-medium ${tagFilter === prefix ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-600"}`}
            >
              {prefix}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="search"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Rechercher par tag ou nom..."
          aria-label="Rechercher un équipement"
          className="h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
        />
        {open && normalizedQuery && (
          <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
            {filteredEquipment.length ? (
              filteredEquipment.map((item) => (
                <Link
                  key={item.id}
                  href={`/vehicles/${item.id}`}
                  onMouseDown={(event) => event.preventDefault()}
                  className="block rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <span className="block font-medium text-gray-900">
                    {item.tag}
                  </span>
                  <span className="block text-xs text-gray-500">
                    {item.name}
                  </span>
                </Link>
              ))
            ) : (
              <p className="px-3 py-2 text-sm text-gray-500">
                Aucun équipement trouvé.
              </p>
            )}
          </div>
        )}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {filteredEquipment.length ? (
          filteredEquipment.map((item) => (
            <Link
              key={item.id}
              href={`/vehicles/${item.id}`}
              className="flex items-center justify-between border-b border-gray-100 px-6 py-4 last:border-0 hover:bg-gray-50"
            >
              <div>
                <p className="font-semibold text-gray-950">{item.tag}</p>
                <p className="text-sm text-gray-600">{item.name}</p>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[getStatus(item)]}`}
                  title={statusDescription[getStatus(item)]}
                >
                  {statusLabel[getStatus(item)]}
                </span>
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-gray-500">
            {query ? (
              "Aucun équipement ne correspond à votre recherche."
            ) : (
              <>
                Pas d&apos;équipement trouvé. Cliquez sur &quot;Ajouter&quot;
                pour créer un nouvel actif.
              </>
            )}
          </p>
        )}
      </div>
    </>
  );
}
