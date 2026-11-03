import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPriorityNotifications } from "@/lib/push/priority";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  try {
    return NextResponse.json(await sendPriorityNotifications());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Push failed" }, { status: 500 });
  }
}
