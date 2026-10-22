import Link from "next/link";
import { ArrowLeft, Flag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Equipment, EquipmentAlert } from "@/lib/supabase/types";
import OpenAnomaliesList from "./OpenAnomaliesList";

export const dynamic = "force-dynamic";

export default async function OpenAnomaliesPage() {
  const supabase = await createClient();
  const [
    { data: alerts, error: alertsError },
    { data: equipment, error: equipmentError },
  ] = await Promise.all([
    supabase
      .from("equipment_alerts")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase.from("equipment").select("id, tag, name").order("tag"),
  ]);

  const equipmentById = new Map(
    ((equipment ?? []) as Pick<Equipment, "id" | "tag" | "name">[]).map(
      (item) => [item.id, item],
    ),
  );
  const error = alertsError ?? equipmentError;

  return (
    <main className="min-h-screen bg-[#f8f9fa] p-4 text-[#202124] sm:p-6 md:p-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} /> Retour à l&apos;accueil
        </Link>

        <header className="rounded-2xl">
          <div className="flex items-start gap-4">
            <div>
              <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
                Bris d'équipement
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Consultez les problèmes signalés qui nécessitent une action.
              </p>
            </div>
          </div>
        </header>

        <OpenAnomaliesList
          initialAlerts={(alerts ?? []) as EquipmentAlert[]}
          assets={Array.from(equipmentById.values())}
          error={error?.message ?? null}
        />
      </div>
    </main>
  );
}
