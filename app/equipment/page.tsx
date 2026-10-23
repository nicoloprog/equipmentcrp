import { createClient } from "@/lib/supabase/server";
import { getMaintenanceStatus, type MaintenanceStatus } from "@/lib/maintenance/status";
import type { Equipment, MaintenancePlan } from "@/lib/supabase/types";
import EquipmentSearchList from "./EquipmentSearchList";

export const dynamic = "force-dynamic";

export default async function EquipmentListPage() {
  const supabase = await createClient();
  const [{ data, error }, { data: plans, error: plansError }] = await Promise.all([
    supabase.from("equipment").select("*").order("created_at", { ascending: false }),
    supabase.from("maintenance_plans").select("*").eq("active", true),
  ]);

  const equipment = (data ?? []) as Equipment[];
  const equipmentById = new Map(equipment.map((item) => [item.id, item]));
  const statusByEquipmentId: Record<string, MaintenanceStatus> = {};
  const priority: Record<MaintenanceStatus, number> = { OK: 0, DUE_SOON: 1, OVERDUE: 2 };

  for (const plan of (plans ?? []) as MaintenancePlan[]) {
    const item = equipmentById.get(plan.equipment_id);
    if (!item) continue;
    const status = getMaintenanceStatus(plan, item).status;
    if (!statusByEquipmentId[item.id] || priority[status] > priority[statusByEquipmentId[item.id]]) {
      statusByEquipmentId[item.id] = status;
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-6">
      {(error ?? plansError) && (
        <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          Could not load equipment: {(error ?? plansError)?.message}
        </p>
      )}
      <EquipmentSearchList equipment={equipment} statusByEquipmentId={statusByEquipmentId} />
    </div>
  );
}
