"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { EquipmentCategory } from "@/lib/supabase/types";

function getTagPrefix(category: EquipmentCategory) {
  return { truck: "VHL", drill: "OTL", battery: "BAT" }[category];
}

function generateAssetTag(category: EquipmentCategory) {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `${getTagPrefix(category)}-${randomNumber}`;
}

export default function NewEquipmentPage() {
  const router = useRouter();
  const [category, setCategory] = useState<EquipmentCategory>("truck");
  const [tag, setTag] = useState(() => generateAssetTag("truck"));
  const [name, setName] = useState("");
  const [usageValue, setUsageValue] = useState("");
  const [usageUnit, setUsageUnit] = useState<"heures" | "Kilomètres">("heures");
  const [warrantyExpiry, setWarrantyExpiry] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Your session expired. Please sign in again.");
      setLoading(false);
      return;
    }
    let photoPath: string | null = null;
    if (photo) {
      photoPath = `${user.id}/${crypto.randomUUID()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
      const { error: uploadError } = await supabase.storage
        .from("equipment-photos")
        .upload(photoPath, photo, { contentType: photo.type, upsert: false });
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
    }
    const { error: insertError } = await supabase.from("equipment").insert({
      tag,
      name,
      category,
      usage_value: usageValue ? Number(usageValue) : null,
      usage_unit: category === "battery" ? null : usageUnit,
      warranty_expiry:
        category === "battery" && warrantyExpiry ? warrantyExpiry : null,
      photo_path: photoPath,
    });
    if (insertError) setError(insertError.message);
    else router.push("/equipment/all");
    setLoading(false);
  }

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-xl font-bold text-gray-900">
          Register New Equipment
        </h1>
        <p className="mb-6 mt-1 text-sm text-gray-500">
          Save the asset directly to Supabase.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-gray-700">
            Category
            <select
              value={category}
              onChange={(e) => {
                const nextCategory = e.target.value as EquipmentCategory;
                setCategory(nextCategory);
                setTag(generateAssetTag(nextCategory));
              }}
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="truck">Véhicule</option>
              <option value="drill">Outil</option>
              <option value="battery">Batterie</option>
            </select>
          </label>
          <div>
            <label
              htmlFor="asset-tag"
              className="block text-sm font-medium text-gray-700"
            >
              Numéro d&apos;actif
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="asset-tag"
                required
                readOnly
                value={tag}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono font-semibold tracking-wide text-gray-900"
              />
              <button
                type="button"
                onClick={() => setTag(generateAssetTag(category))}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                title="Générer un nouveau numéro"
              >
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Nouveau</span>
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Généré automatiquement selon la catégorie sélectionnée.
            </p>
          </div>
          <label className="block text-sm font-medium text-gray-700">
            Nom / modèle
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Kubota L2501, Dewalt DCD791D2, etc."
              className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
            />
          </label>
          {category === "battery" ? (
            <label className="block text-sm font-medium text-gray-700">
              Fin de la garantie
              <input
                required
                type="date"
                value={warrantyExpiry}
                onChange={(e) => setWarrantyExpiry(e.target.value)}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-gray-700">
                Kilométrage / heures d&apos;opération
                <input
                  type="number"
                  min="0"
                  value={usageValue}
                  onChange={(e) => setUsageValue(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700">
                Unité
                <select
                  value={usageUnit}
                  onChange={(e) =>
                    setUsageUnit(e.target.value as "heures" | "Kilomètres")
                  }
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2"
                >
                  <option value="heures">Heures d'opération</option>
                  <option value="Kilomètres">Kilomètres</option>
                </select>
              </label>
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-800">
            <Camera size={18} /> Upload photo
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => setPhoto(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          {photo && (
            <p className="text-sm text-green-700">
              {photo.name} ready to upload
            </p>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-medium text-white disabled:opacity-60"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Saving..." : "Save & Register Equipment"}
          </button>
        </form>
      </div>
    </div>
  );
}
