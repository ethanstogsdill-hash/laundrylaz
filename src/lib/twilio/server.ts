import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

function getClient() {
  return twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  );
}

function getFromNumber() {
  return process.env.TWILIO_PHONE_NUMBER!;
}

export type SmsMessageType =
  | "order_confirmed"
  | "pickup_completed"
  | "payment_requested"
  | "payment_received"
  | "out_for_delivery"
  | "delivered"
  | "pickup_reminder";

const SMS_TEMPLATES: Record<SmsMessageType, (vars: Record<string, string>) => string> = {
  order_confirmed: (v) =>
    `Hi ${v.name}! Your laundry pickup is confirmed for ${v.date} at ${v.time}. We'll text you when we're on the way! - Fresh Laundry Cafe`,
  pickup_completed: (v) =>
    `We've picked up your laundry! Your order #${v.orderId} is now being washed and folded. We'll let you know when it's ready. - Fresh Laundry Cafe`,
  payment_requested: (v) =>
    `Your laundry is ready! Total: $${v.total} (${v.weight} lbs). Pay here: ${v.paymentUrl} - Fresh Laundry Cafe`,
  payment_received: (v) =>
    `Payment of $${v.total} received for order #${v.orderId}. We'll schedule your delivery soon! - Fresh Laundry Cafe`,
  out_for_delivery: (v) =>
    `Your fresh laundry is on its way! Expect delivery within the next hour. - Fresh Laundry Cafe`,
  delivered: (v) =>
    `Your laundry has been delivered! Thank you for choosing Fresh Laundry Cafe. Refer a friend and you both get $5 off! Code: ${v.referralCode}`,
  pickup_reminder: (v) =>
    `Reminder: We're picking up your laundry today at ${v.time}. Please have it ready! - Fresh Laundry Cafe`,
};

/**
 * Send an SMS and log it to the database.
 */
export async function sendSms(params: {
  to: string;
  messageType: SmsMessageType;
  variables: Record<string, string>;
  userId?: string;
}): Promise<{ success: boolean; sid?: string; error?: string }> {
  const template = SMS_TEMPLATES[params.messageType];
  if (!template) {
    return { success: false, error: `Unknown message type: ${params.messageType}` };
  }

  const messageBody = template(params.variables);
  const supabase = createAdminClient();

  try {
    const message = await getClient().messages.create({
      body: messageBody,
      from: getFromNumber(),
      to: params.to,
    });

    // Log to database
    await supabase.from("sms_log").insert({
      user_id: params.userId || null,
      phone: params.to,
      message_type: params.messageType,
      message_body: messageBody,
      twilio_sid: message.sid,
      status: (message.status as "queued" | "sent" | "delivered" | "failed") || "queued",
    });

    return { success: true, sid: message.sid };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Still log the failed attempt
    await supabase.from("sms_log").insert({
      user_id: params.userId || null,
      phone: params.to,
      message_type: params.messageType,
      message_body: messageBody,
      status: "failed",
    });

    return { success: false, error: errorMessage };
  }
}

/**
 * Send SMS notification for an order status change.
 */
export async function sendOrderStatusSms(params: {
  orderId: string;
  newStatus: string;
  userId: string;
  phone: string;
  customerName: string;
  referralCode?: string;
  paymentUrl?: string;
  weight?: string;
  total?: string;
  date?: string;
  time?: string;
}) {
  const statusToMessageType: Record<string, SmsMessageType> = {
    confirmed: "order_confirmed",
    picked_up: "pickup_completed",
    out_for_delivery: "out_for_delivery",
    delivered: "delivered",
  };

  const messageType = statusToMessageType[params.newStatus];
  if (!messageType) return; // Not all statuses trigger SMS

  await sendSms({
    to: params.phone,
    messageType,
    userId: params.userId,
    variables: {
      name: params.customerName,
      orderId: params.orderId.slice(0, 8),
      referralCode: params.referralCode || "",
      paymentUrl: params.paymentUrl || "",
      weight: params.weight || "",
      total: params.total || "",
      date: params.date || "",
      time: params.time || "",
    },
  });
}
