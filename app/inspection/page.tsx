"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Check, Loader2, Search, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EquipmentCategory } from "@/lib/supabase/types";

type EquipmentOption = {
  id: string;
  tag: string;
  name: string;
  category: EquipmentCategory;
  current_km: number | null;
  usage_value: number | null;
};

function usesHours(item: Pick<EquipmentOption, "category" | "tag">) {
  return item.category === "battery" || item.category === "drill" || item.category === "machinery" || item.tag.startsWith("BAT-") || item.tag.startsWith("OTL-") || item.tag.startsWith("MCH-");
}
const vehicleChecks = [
  "Conduite générale",
  "Éclairage",
  "Pneu / roues",
  "Niveau d'huile / fuites",
  "Esthétique",
  "Pare-brise",
  "Système d'échappement",
];

function getInspectionChecks(equipment: EquipmentOption | undefined) {
  if (!equipment) return vehicleChecks;
  if (equipment.tag.startsWith("REM-")) {
    return ["Éclairage", "Attelage", "Esthétique", "Freins", "Pneus / roues", "Espace de chargement"];
  }
  if (equipment.tag.startsWith("MCH-")) {
    return ["Éclairage", "Chenille / roulement", "Niveau d'huile / fuites", "Esthétique"];
  }
  if (equipment.tag.startsWith("BAT-") || equipment.tag.startsWith("OTL-")) {
    return ["Conduite générale"];
  }
  return vehicleChecks;
}

export default function QuickInspectionPage() {
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentKm, setCurrentKm] = useState("");
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();
  const selectedEquipment = equipment.find((item) => item.id === selectedId);
  const inspectionChecks = getInspectionChecks(selectedEquipment);

  useEffect(() => {
    supabase
      .from("equipment")
      .select("id, tag, name, category, current_km, usage_value")
      .order("tag")
      .then(({ data }) => setEquipment(data ?? []));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const failed = inspectionChecks.some((check) => results[check] === false);
    if (!user || !selectedId) {
      setMessage("Sélectionnez un équipement avant de continuer.");
      setLoading(false);
      return;
    }
    if (currentKm && selectedEquipment) {
      const hourBased = usesHours(selectedEquipment);
      const { error: kilometerError } = await supabase
        .from("equipment")
        .update(hourBased ? { usage_value: Number(currentKm), usage_unit: "hours" } : { current_km: Number(currentKm), usage_unit: "kilometers" })
        .eq("id", selectedId);
      if (kilometerError) {
        setMessage(kilometerError.message);
        setLoading(false);
        return;
      }
    }
    const { error } = await supabase.from("inspections").insert({
      equipment_id: selectedId,
      inspector_id: user.id,
      status: failed ? "failed" : "passed",
      checks: results,
      notes: notes || null,
    });
    if (error) setMessage(error.message);
    else if (failed) {
      const failedChecks = inspectionChecks.filter((check) => results[check] === false);
      const description = [
        `Points non conformes : ${failedChecks.join(", ")}.`,
        notes.trim() ? `Notes : ${notes.trim()}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      const { error: alertError } = await supabase
        .from("equipment_alerts")
        .insert({
          equipment_id: selectedId,
          reporter_id: user.id,
          title: `Anomalie d'inspection — ${failedChecks.join(", ")}`,
          description,
          severity: "high",
          status: "open",
        });

      if (alertError) {
        setMessage(
          `Inspection enregistrée, mais l'anomalie n'a pas pu être créée : ${alertError.message}`,
        );
      } else {
        setMessage("Inspection enregistrée et anomalie ouverte.");
      }
      setResults({});
      setNotes("");
    } else {
      setMessage("Inspection enregistrée.");
      setResults({});
      setNotes("");
    }
    setLoading(false);
  }

  const normalizedSearch = equipmentSearch.trim().toLowerCase();
  const visibleEquipment = equipment.filter(
    (item) =>
      !normalizedSearch ||
      item.tag.toLowerCase().includes(normalizedSearch) ||
      item.name.toLowerCase().includes(normalizedSearch),
  );
  return (
    <main className="min-h-screen bg-[#f8f9fa] p-6 md:p-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          ← Retour à l&apos;accueil
        </Link>
        <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-600">
              Inspection terrain
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">
              Inspection rapide
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Passez chaque point en vert ou rouge.
            </p>
          </div>
          {equipment.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-900">
                Aucun équipement disponible
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez un équipement avant de commencer une inspection.
              </p>
              <Link
                href="/equipment/new"
                className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Ajouter un équipement
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="relative block text-sm font-medium text-gray-700 sm:col-span-2">
                  Choisir un équipement
                  <div className="relative mt-2">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      required
                      value={equipmentSearch}
                      onFocus={() => setSearchOpen(true)}
                      onChange={(e) => {
                        setEquipmentSearch(e.target.value);
                        setSelectedId("");
                        setSearchOpen(true);
                      }}
                      onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                      placeholder="Rechercher par tag ou nom..."
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3"
                    />
                  </div>
                  {searchOpen && equipmentSearch.trim() && (
                    <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                      {visibleEquipment.length ? (
                        visibleEquipment.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setSelectedId(item.id);
                              setEquipmentSearch(`${item.tag} — ${item.name}`);
                              setCurrentKm((usesHours(item) ? item.usage_value : item.current_km)?.toString() ?? "");
                              setResults({});
                              setSearchOpen(false);
                            }}
                            className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50"
                          >
                            <span className="block font-medium text-gray-900">{item.tag}</span>
                            <span className="block text-xs text-gray-500">{item.name}</span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm text-gray-500">Aucun équipement trouvé.</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
              {selectedEquipment && (
                  <label className="block rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-gray-800">
                    {usesHours(selectedEquipment) ? "Heures d’opération" : "Kilométrage actuel (km)"}
                    <input
                      required
                      type="number"
                      min="0"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-green-300 bg-white px-3 py-2"
                    />
                    <span className="mt-1 block text-xs font-normal text-gray-600">
                      Cette valeur sera enregistrée avec l&apos;inspection.
                    </span>
                  </label>
                )}
              <div className="space-y-3">
                {inspectionChecks.map((check) => (
                  <div
                    key={check}
                    className="flex items-center justify-between rounded-xl border border-gray-200 p-4"
                  >
                    <span className="font-medium text-gray-800">{check}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        aria-label={`${check} conforme`}
                        onClick={() =>
                          setResults((current) => ({
                            ...current,
                            [check]: true,
                          }))
                        }
                        className={`rounded-lg p-2 ${results[check] === true ? "bg-green-600 text-white" : "bg-green-50 text-green-700"}`}
                      >
                        <Check size={20} />
                      </button>
                      <button
                        type="button"
                        aria-label={`${check} non conforme`}
                        onClick={() =>
                          setResults((current) => ({
                            ...current,
                            [check]: false,
                          }))
                        }
                        className={`rounded-lg p-2 ${results[check] === false ? "bg-red-600 text-white" : "bg-red-50 text-red-700"}`}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <label className="block text-sm font-medium text-gray-700">
                Notes facultatives
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Ajouter une observation..."
                />
              </label>
              {message && <p className="text-sm text-gray-700">{message}</p>}
              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 py-3 font-medium text-white disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Enregistrement..." : "Enregistrer l’inspection"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
