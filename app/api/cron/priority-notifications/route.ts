import { NextResponse } from "next/server";
import { sendPriorityNotifications } from "@/lib/push/priority";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(await sendPriorityNotifications());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Push failed" }, { status: 500 });
  }
}
