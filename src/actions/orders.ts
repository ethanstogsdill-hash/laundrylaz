"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PRICING } from "@/lib/constants";

export async function schedulePickup(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to schedule a pickup." };
  }

  const addressId = formData.get("address_id") as string;
  const pickupSlotId = formData.get("pickup_slot_id") as string;
  const specialInstructions = formData.get("special_instructions") as string;

  if (!addressId || !pickupSlotId) {
    return { error: "Address and pickup time slot are required." };
  }

  // Verify the address belongs to the user
  const { data: address, error: addrError } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (addrError || !address) {
    return { error: "Invalid address selected." };
  }

  // Verify the time slot exists and has capacity
  const { data: slot, error: slotError } = await supabase
    .from("time_slots")
    .select("*")
    .eq("id", pickupSlotId)
    .eq("slot_type", "pickup")
    .single();

  if (slotError || !slot) {
    return { error: "Invalid time slot selected." };
  }

  if (slot.booked >= slot.capacity) {
    return { error: "This time slot is fully booked. Please choose another." };
  }

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: addressId,
      pickup_slot_id: pickupSlotId,
      special_instructions: specialInstructions || null,
      status: "pending",
      base_fee_cents: 0,
      per_lb_rate_cents: PRICING.washFoldPerLbCents,
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return { error: "Failed to create order. Please try again." };
  }

  // Increment the booked count on the time slot
  const { error: updateSlotError } = await supabase
    .from("time_slots")
    .update({ booked: slot.booked + 1 })
    .eq("id", pickupSlotId);

  if (updateSlotError) {
    // Log but don't fail the order
    console.error("Failed to increment slot booked count:", updateSlotError);
  }

  // Create initial status history entry
  await supabase.from("order_status_history").insert({
    order_id: order.id,
    old_status: null,
    new_status: "pending",
    changed_by: user.id,
    note: "Order created",
  });

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard");

  return { success: true, orderId: order.id };
}

export async function getOrders() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (*),
      time_slots!orders_pickup_slot_id_fkey (*)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return { error: "Failed to fetch orders." };
  }

  return { success: true, data: orders };
}

export async function getOrderDetail(orderId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (*),
      time_slots!orders_pickup_slot_id_fkey (*),
      order_status_history (*)
    `
    )
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    return { error: "Order not found." };
  }

  // Sort status history by created_at
  if (order.order_status_history) {
    order.order_status_history.sort(
      (a: { created_at: string }, b: { created_at: string }) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }

  return { success: true, data: order };
}

export async function getAvailableTimeSlots(date: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: slots, error } = await supabase
    .from("time_slots")
    .select("*")
    .eq("date", date)
    .eq("slot_type", "pickup")
    .order("start_time", { ascending: true });

  if (error) {
    return { error: "Failed to fetch time slots." };
  }

  // Filter to slots that still have capacity
  const available = (slots || []).filter((s) => s.booked < s.capacity);

  return { success: true, data: available };
}
