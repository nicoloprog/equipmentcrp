import { createClient } from "@/lib/supabase/server";
import {
  getMaintenanceProgress,
  getMaintenanceStatus,
  type MaintenanceStatus,
} from "@/lib/maintenance/status";
import type { Equipment, EquipmentAlert, MaintenancePlan } from "@/lib/supabase/types";
import MaintenanceQueue from "../MaintenanceQueue";

export const dynamic = "force-dynamic";

export default async function PriorityMaintenancePage() {
  const supabase = await createClient();
  const [{ data: plans, error: plansError }, { data: equipment, error: equipmentError }, { data: alerts, error: alertsError }] =
    await Promise.all([
      supabase
        .from("maintenance_plans")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      supabase.from("equipment").select("*").order("tag"),
      supabase.from("equipment_alerts").select("*").eq("status", "open").eq("severity", "high").order("created_at", { ascending: false }),
    ]);

  const equipmentById = new Map(
    ((equipment ?? []) as Equipment[]).map((item) => [item.id, item]),
  );
  const now = new Date();
  const rows = ((plans ?? []) as MaintenancePlan[]).flatMap((plan) => {
    const vehicle = equipmentById.get(plan.equipment_id);
    if (!vehicle) return [];

    const result = getMaintenanceStatus(plan, vehicle, now);
    const progress = getMaintenanceProgress(plan, vehicle, now);
    const status: MaintenanceStatus =
      progress >= 100 ? "OVERDUE" : progress >= 85 ? "DUE_SOON" : "OK";

    if (status !== "OVERDUE") return [];

    return [
      {
        ...plan,
        assetTag: vehicle.tag,
        assetName: vehicle.name,
        currentKm: vehicle.current_km,
        progress,
        status,
        dueDate: result.dueDate,
        dueKm: result.dueKm,
      },
    ];
  });

  const urgentAlerts = ((alerts ?? []) as EquipmentAlert[]).flatMap((alert) => {
    const vehicle = equipmentById.get(alert.equipment_id);
    return vehicle ? [{ ...alert, assetTag: vehicle.tag, assetName: vehicle.name }] : [];
  });

  return (
    <MaintenanceQueue
      plans={rows}
      error={(plansError ?? equipmentError ?? alertsError)?.message ?? null}
      title="Entretien prioritaire"
      description="Tous les services de maintenance arrivés à échéance ou en retard."
      hideFilters
      urgentAlerts={urgentAlerts}
    />
  );
}
