import webpush from "web-push";
import { createClient } from "@supabase/supabase-js";
import { getMaintenanceStatus } from "@/lib/maintenance/status";
import type {
  Database,
  Equipment,
  MaintenancePlan,
  PushSubscription,
} from "@/lib/supabase/types";

export async function sendPriorityNotifications() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey)
    throw new Error("Push environment variables are missing");
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    vapidPublicKey,
    vapidPrivateKey,
  );
  const supabase = createClient<Database>(supabaseUrl, serviceRoleKey);
  const [
    { data: equipment },
    { data: plans },
    { data: alerts },
    { data: subscriptions },
  ] = await Promise.all([
    supabase.from("equipment").select("*"),
    supabase.from("maintenance_plans").select("*").eq("active", true),
    supabase
      .from("equipment_alerts")
      .select("id, equipment_id")
      .eq("status", "open")
      .eq("severity", "high"),
    supabase.from("push_subscriptions").select("*"),
  ]);
  const equipmentById = new Map(
    ((equipment ?? []) as Equipment[]).map((item) => [item.id, item]),
  );
  const priorityPlanIds = ((plans ?? []) as MaintenancePlan[])
    .filter((plan) => {
      const item = equipmentById.get(plan.equipment_id);
      return item
        ? getMaintenanceStatus(plan, item).status === "OVERDUE"
        : false;
    })
    .map((plan) => `plan:${plan.id}`);
  const priorityAlertIds = (alerts ?? []).map((alert) => `alert:${alert.id}`);
  const priorityKey = [...priorityPlanIds, ...priorityAlertIds]
    .sort()
    .join(",");
  let sent = 0;
  for (const subscription of (subscriptions ?? []) as PushSubscription[]) {
    if (subscription.last_notified_key === priorityKey) continue;
    if (!priorityKey) {
      await supabase
        .from("push_subscriptions")
        .update({ last_notified_key: "" })
        .eq("id", subscription.id);
      continue;
    }
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify({
          title: "Entretien prioritaire",
          body: `${priorityPlanIds.length + priorityAlertIds.length} maintenance(s) nécessitent votre attention.`,
          url: "/maintenance/prioritaires",
          tag: "maintenance-prioritaire",
        }),
      );
      await supabase
        .from("push_subscriptions")
        .update({ last_notified_key: priorityKey })
        .eq("id", subscription.id);
      sent += 1;
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410)
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("id", subscription.id);
    }
  }
  return {
    sent,
    priorityCount: priorityPlanIds.length + priorityAlertIds.length,
  };
}
