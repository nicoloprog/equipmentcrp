import { createClient } from "@/lib/supabase/server";
import MaintenanceQueue from "./MaintenanceQueue";
import type { MaintenanceTask } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function MaintenancePage() {
  const supabase = await createClient();
  const [{ data: tasks, error: tasksError }, { data: equipment, error: equipmentError }] = await Promise.all([
    supabase.from("maintenance_tasks").select("*").order("due_date", { ascending: true }),
    supabase.from("equipment").select("id, tag, name"),
  ]);

  const error = tasksError ?? equipmentError;
  const equipmentById = new Map((equipment ?? []).map((item) => [item.id, item]));
  const rows = (tasks ?? []).map((task: MaintenanceTask) => {
    const asset = equipmentById.get(task.equipment_id);
    return { ...task, assetTag: asset?.tag ?? "Équipement supprimé", assetName: asset?.name ?? "" };
  });

  return <MaintenanceQueue tasks={rows} error={error?.message ?? null} />;
}
