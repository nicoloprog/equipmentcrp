import { NextResponse } from "next/server";
import webpush from "web-push";
import { createClient } from "@/lib/supabase/server";
import type { PushSubscription } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return NextResponse.json({ error: "VAPID keys are missing" }, { status: 500 });
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:admin@example.com", publicKey, privateKey);

  const { data, error } = await supabase.from("push_subscriptions").select("*").eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const subscriptions = (data ?? []) as PushSubscription[];
  if (!subscriptions.length) return NextResponse.json({ error: "No device subscription found" }, { status: 404 });

  let sent = 0;
  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        { endpoint: subscription.endpoint, keys: { p256dh: subscription.p256dh, auth: subscription.auth } },
        JSON.stringify({ title: "Test Maintenance CRP", body: "Les notifications fonctionnent sur cet appareil.", url: "/maintenance/prioritaires", tag: "maintenance-test" }),
      );
      sent += 1;
    } catch (sendError) {
      const statusCode = (sendError as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) await supabase.from("push_subscriptions").delete().eq("id", subscription.id);
    }
  }
  return sent ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Push service rejected the subscription" }, { status: 502 });
}
