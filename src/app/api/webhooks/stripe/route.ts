import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe webhook signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (!orderId) break;

      // Update payment record
      await supabase
        .from("payments")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      // Update order payment status
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      // Add status history note about payment
      const { data: currentOrder } = await supabase
        .from("orders")
        .select("status")
        .eq("id", orderId)
        .single();

      if (currentOrder) {
        await supabase.from("order_status_history").insert({
          order_id: orderId,
          old_status: currentOrder.status,
          new_status: currentOrder.status,
          note: `Payment of $${(paymentIntent.amount / 100).toFixed(2)} received`,
        });
      }

      // Send payment confirmation SMS
      const { data: order } = await supabase
        .from("orders")
        .select("user_id, total_cents")
        .eq("id", orderId)
        .single();

      if (order) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("phone, full_name, sms_opt_in")
          .eq("id", order.user_id)
          .single();

        if (profile?.phone && profile.sms_opt_in) {
          // Dynamic import to avoid circular deps
          const { sendSms } = await import("@/lib/twilio/server");
          await sendSms({
            to: profile.phone,
            messageType: "payment_received",
            userId: order.user_id,
            variables: {
              name: profile.full_name || "Customer",
              orderId: orderId.slice(0, 8),
              total: (paymentIntent.amount / 100).toFixed(2),
            },
          });
        }
      }

      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata.order_id;

      if (!orderId) break;

      await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_payment_intent_id", paymentIntent.id);

      await supabase
        .from("orders")
        .update({
          payment_status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
