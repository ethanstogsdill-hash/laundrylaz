"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getOrCreateStripeCustomer,
  createPaymentIntent,
} from "@/lib/stripe/server";
import { sendSms } from "@/lib/twilio/server";
import { formatCents, calculateOrderTotal } from "@/lib/constants";
import { revalidatePath } from "next/cache";

/**
 * Create a Stripe PaymentIntent for an order and send payment link via SMS.
 * Called by admin after entering weight.
 */
export async function createOrderPayment(orderId: string) {
  const supabase = await createClient();

  // Verify caller is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: adminProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (adminProfile?.role !== "admin") return { error: "Not authorized" };

  // Get order with customer info
  const { data: order } = await supabase
    .from("orders")
    .select("*, profiles!orders_user_id_fkey(id, full_name, phone, stripe_customer_id, sms_opt_in, credit_balance_cents, referral_code)")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };
  if (!order.weight_lbs) return { error: "Weight not entered yet" };
  if (order.payment_status === "paid") return { error: "Already paid" };

  const profile = order.profiles as {
    id: string;
    full_name: string;
    phone: string | null;
    stripe_customer_id: string | null;
    sms_opt_in: boolean;
    credit_balance_cents: number;
    referral_code: string | null;
  };

  // Calculate total with credits
  const { total, credits } = calculateOrderTotal(
    Number(order.weight_lbs),
    profile.credit_balance_cents
  );

  // If total is 0 after credits, mark as paid
  if (total <= 0) {
    const adminSupabase = createAdminClient();

    // Deduct credits
    if (credits > 0) {
      await adminSupabase
        .from("profiles")
        .update({
          credit_balance_cents: profile.credit_balance_cents - credits,
        })
        .eq("id", profile.id);

      await adminSupabase.from("credit_transactions").insert({
        user_id: profile.id,
        amount_cents: -credits,
        type: "order_payment",
        reference_id: orderId,
        description: `Applied ${formatCents(credits)} credit to order #${orderId.slice(0, 8)}`,
      });
    }

    await adminSupabase
      .from("orders")
      .update({
        total_cents: 0,
        credits_applied_cents: credits,
        payment_status: "paid",
      })
      .eq("id", orderId);

    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, message: "Order fully covered by credits" };
  }

  // Get or create Stripe customer
  const { data: authUser } = await createAdminClient().auth.admin.getUserById(
    profile.id
  );
  const customerEmail = authUser?.user?.email || "";

  const stripeCustomerId = await getOrCreateStripeCustomer(
    customerEmail,
    profile.full_name,
    profile.stripe_customer_id
  );

  // Save Stripe customer ID if new
  if (!profile.stripe_customer_id) {
    await createAdminClient()
      .from("profiles")
      .update({ stripe_customer_id: stripeCustomerId })
      .eq("id", profile.id);
  }

  // Create PaymentIntent
  const paymentIntent = await createPaymentIntent({
    amountCents: total,
    customerId: stripeCustomerId,
    orderId,
    description: `Fresh Laundry Cafe - ${order.weight_lbs} lbs laundry service`,
  });

  const adminSupabase = createAdminClient();

  // Apply credits if any
  if (credits > 0) {
    await adminSupabase
      .from("profiles")
      .update({
        credit_balance_cents: profile.credit_balance_cents - credits,
      })
      .eq("id", profile.id);

    await adminSupabase.from("credit_transactions").insert({
      user_id: profile.id,
      amount_cents: -credits,
      type: "order_payment",
      reference_id: orderId,
      description: `Applied ${formatCents(credits)} credit to order #${orderId.slice(0, 8)}`,
    });
  }

  // Save payment record
  await adminSupabase.from("payments").insert({
    order_id: orderId,
    stripe_payment_intent_id: paymentIntent.id,
    amount_cents: total,
    status: "pending",
  });

  // Update order
  await adminSupabase
    .from("orders")
    .update({
      total_cents: total,
      credits_applied_cents: credits,
      payment_status: "pending",
    })
    .eq("id", orderId);

  // Send payment SMS
  const paymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/orders/${orderId}`;

  if (profile.phone && profile.sms_opt_in) {
    await sendSms({
      to: profile.phone,
      messageType: "payment_requested",
      userId: profile.id,
      variables: {
        name: profile.full_name,
        orderId: orderId.slice(0, 8),
        total: formatCents(total),
        weight: String(order.weight_lbs),
        paymentUrl,
      },
    });
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/dashboard/orders/${orderId}`);

  return {
    success: true,
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

/**
 * Get the client secret for an existing PaymentIntent (for customer payment page).
 */
export async function getPaymentClientSecret(orderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: payment } = await supabase
    .from("payments")
    .select("stripe_payment_intent_id, amount_cents, status")
    .eq("order_id", orderId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!payment) return { error: "No payment found" };
  if (payment.status === "paid") return { error: "Already paid" };

  const { getPaymentIntent } = await import("@/lib/stripe/server");
  const paymentIntent = await getPaymentIntent(
    payment.stripe_payment_intent_id!
  );

  return {
    success: true,
    clientSecret: paymentIntent.client_secret,
    amount: payment.amount_cents,
  };
}
