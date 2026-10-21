import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Equipment, EquipmentAlert, MaintenanceLog, MaintenancePlan } from "@/lib/supabase/types";
import VehicleMaintenanceDetail from "./VehicleMaintenanceDetail";

export const dynamic = "force-dynamic";

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: vehicle, error: vehicleError }, { data: plans, error: plansError }, { data: logs, error: logsError }, { data: alerts, error: alertsError }] = await Promise.all([
    supabase.from("equipment").select("*").eq("id", id).single(),
    supabase.from("maintenance_plans").select("*").eq("equipment_id", id).eq("active", true).order("created_at"),
    supabase.from("maintenance_logs").select("*").eq("equipment_id", id).order("completed_date", { ascending: false }),
    supabase.from("equipment_alerts").select("*").eq("equipment_id", id).eq("status", "open").order("created_at", { ascending: false }),
  ]);
  if (vehicleError?.code === "PGRST116" || !vehicle) notFound();
  const error = vehicleError ?? plansError ?? logsError ?? alertsError;
  const vehicleData = vehicle as Equipment;
  const { data: photo } = vehicleData.photo_path
    ? await supabase.storage
        .from("equipment-photos")
        .createSignedUrl(vehicleData.photo_path, 3600)
    : { data: null };
  return <VehicleMaintenanceDetail vehicle={vehicleData} photoUrl={photo?.signedUrl ?? null} plans={(plans ?? []) as MaintenancePlan[]} logs={(logs ?? []) as MaintenanceLog[]} alerts={(alerts ?? []) as EquipmentAlert[]} error={error?.message ?? null} renderedAt={new Date().toISOString()} />;
}
