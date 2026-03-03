import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSms } from "@/lib/twilio/server";
import { format } from "date-fns";

/**
 * Cron job: Send morning reminders for today's pickups.
 * Configure in vercel.json: { "crons": [{ "path": "/api/cron", "schedule": "0 7 * * *" }] }
 */
export async function GET(request: NextRequest) {
  // Verify cron secret (Vercel sends this automatically)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const today = format(new Date(), "yyyy-MM-dd");

  // Get today's confirmed orders with pickup slots
  const { data: orders } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      status,
      profiles!orders_user_id_fkey(full_name, phone, sms_opt_in),
      time_slots!orders_pickup_slot_id_fkey(start_time, end_time)
    `)
    .in("status", ["pending", "confirmed"])
    .eq("time_slots.date", today);

  if (!orders || orders.length === 0) {
    return NextResponse.json({ message: "No pickups today", sent: 0 });
  }

  let sent = 0;

  for (const order of orders) {
    const profile = order.profiles as {
      full_name: string;
      phone: string | null;
      sms_opt_in: boolean;
    } | null;

    const slot = order.time_slots as {
      start_time: string;
      end_time: string;
    } | null;

    if (!profile?.phone || !profile.sms_opt_in || !slot) continue;

    const timeStr = `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;

    await sendSms({
      to: profile.phone,
      messageType: "pickup_reminder",
      userId: order.user_id,
      variables: {
        name: profile.full_name,
        time: timeStr,
      },
    });

    sent++;
  }

  return NextResponse.json({ message: "Reminders sent", sent });
}
