"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { Flag, Loader2, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type EquipmentOption = { id: string; tag: string; name: string };

export default function ReportIssuePage() {
  const [equipment, setEquipment] = useState<EquipmentOption[]>([]);
  const [equipmentId, setEquipmentId] = useState("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("equipment")
      .select("id, tag, name")
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
    if (!user || !equipmentId) {
      setMessage("Sélectionnez l’équipement concerné.");
      setLoading(false);
      return;
    }
    const { error } = await supabase.from("equipment_alerts").insert({
      equipment_id: equipmentId,
      reporter_id: user.id,
      title,
      description,
      severity,
      status: "open",
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Anomalie signalée avec succès.");
      setTitle("");
      setDescription("");
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
          <div className="flex items-start gap-4">
            <div>
              <h1 className="mt-1 text-2xl font-semibold text-gray-900">
                Signaler un problème / Bris d'équipement
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Créez une alerte immédiate sans faire l&apos;inspection
                complète.
              </p>
            </div>
          </div>
          {equipment.length === 0 ? (
            <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center">
              <p className="font-medium text-gray-900">
                Aucun équipement disponible
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez un équipement avant de signaler une anomalie.
              </p>
              <Link
                href="/equipment/new"
                className="mt-4 inline-flex rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                Ajouter un équipement
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5">
              <label className="relative block text-sm font-medium text-gray-700">
                Équipement concerné
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
                      setEquipmentId("");
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
                            setEquipmentId(item.id);
                            setEquipmentSearch(`${item.tag} — ${item.name}`);
                            setSearchOpen(false);
                          }}
                          className="block w-full rounded-md px-3 py-2 text-left hover:bg-gray-50"
                        >
                          <span className="block font-medium text-gray-900">
                            {item.tag}
                          </span>
                          <span className="block text-xs text-gray-500">
                            {item.name}
                          </span>
                        </button>
                      ))
                    ) : (
                      <p className="px-3 py-2 text-sm text-gray-500">
                        Aucun équipement trouvé.
                      </p>
                    )}
                  </div>
                )}
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Titre du problème
                <input
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex. Pneu endommagé"
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Priorité
                <select
                  value={severity}
                  onChange={(e) =>
                    setSeverity(e.target.value as typeof severity)
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="low">Faible</option>
                  <option value="medium">Moyenne</option>
                  <option value="high">Urgente</option>
                </select>
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Description
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Décrivez le problème observé..."
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              {message && <p className="text-sm text-gray-700">{message}</p>}
              <button
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-medium text-white disabled:opacity-60"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? "Envoi..." : "Signaler l’anomalie"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
