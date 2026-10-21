import type { Equipment, MaintenancePlan } from "@/lib/supabase/types";

export type MaintenanceStatus = "OK" | "DUE_SOON" | "OVERDUE";

export type MaintenanceStatusResult = {
  status: MaintenanceStatus;
  remainingKm: number | null;
  remainingDays: number | null;
  dueKm: number | null;
  dueDate: string | null;
};

export function getMaintenanceProgress(
  plan: MaintenancePlan,
  vehicle: Pick<Equipment, "current_km">,
  today = new Date(),
) {
  const values: number[] = [];
  if (plan.interval_km != null && vehicle.current_km != null) {
    values.push(((vehicle.current_km - plan.last_completed_km) / plan.interval_km) * 100);
  }
  if (plan.interval_months != null) {
    const elapsed = today.getTime() - new Date(`${plan.last_completed_date}T00:00:00.000Z`).getTime();
    values.push((elapsed / (plan.interval_months * 30.4375 * 86400000)) * 100);
  }
  return Math.max(0, Math.min(100, values.length ? Math.max(...values) : 0));
}

function addMonths(date: string, months: number) {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

export function getMaintenanceStatus(
  plan: MaintenancePlan,
  vehicle: Pick<Equipment, "current_km">,
  today = new Date(),
): MaintenanceStatusResult {
  const dueKm = plan.interval_km == null ? null : plan.last_completed_km + plan.interval_km;
  const dueDate = plan.interval_months == null ? null : addMonths(plan.last_completed_date, plan.interval_months).toISOString().slice(0, 10);
  const remainingKm = dueKm == null || vehicle.current_km == null ? null : dueKm - vehicle.current_km;
  const dueDateTime = dueDate ? new Date(`${dueDate}T00:00:00.000Z`).getTime() : null;
  const remainingDays = dueDateTime == null ? null : Math.ceil((dueDateTime - Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())) / 86400000);
  const overdueByKm = remainingKm != null && remainingKm <= 0;
  const overdueByDate = remainingDays != null && remainingDays <= 0;
  const dueSoonByKm = remainingKm != null && remainingKm <= 1000;
  const dueSoonByDate = remainingDays != null && remainingDays <= 30;

  return {
    status: overdueByKm || overdueByDate ? "OVERDUE" : dueSoonByKm || dueSoonByDate ? "DUE_SOON" : "OK",
    remainingKm,
    remainingDays,
    dueKm,
    dueDate,
  };
}
