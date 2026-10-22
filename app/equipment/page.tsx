import { createClient } from "@/lib/supabase/server";
import type { Equipment } from "@/lib/supabase/types";
import EquipmentSearchList from "./EquipmentSearchList";

export const dynamic = "force-dynamic";

export default async function EquipmentListPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Could not load equipment: {error.message}
        </p>
      )}
      <EquipmentSearchList equipment={(data ?? []) as Equipment[]} />
    </div>
  );
}
