import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Equipment } from "@/lib/supabase/types";

function statusLabel(status: Equipment["status"]) {
  return {
    healthy: "Healthy",
    due_soon: "Due Soon",
    overdue: "Overdue",
    warranty_expiring: "Warranty Alert",
  }[status];
}

export default async function EquipmentListPage() {
  const supabase = await createClient();
  const { data: equipment, error } = await supabase
    .from("equipment")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-medium text-gray-900">Inventaire</h1>
          <p className="text-sm text-gray-500">
            Tous les véhicules, batteries, outils et plus.
          </p>
        </div>
        <Link
          href="/equipment/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-300 px-2 py-2 text-sm font-medium text-white"
        >
          <Plus size={17} /> Ajouter
        </Link>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Could not load equipment: {error.message}
        </p>
      )}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {equipment?.length ? (
          equipment.map((item) => (
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
                <span className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1 capitalize text-gray-600">
                  {item.category}
                </span>
                <span className="text-gray-500">
                  {statusLabel(item.status)}
                </span>
                <ArrowRight size={16} className="text-gray-400" />
              </div>
            </Link>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-gray-500">
            Pas d&apos;équipement trouvé. Cliquez sur &quot;Ajouter&quot; pour
            créer un nouvel actif.
          </p>
        )}
      </div>
    </div>
  );
}
