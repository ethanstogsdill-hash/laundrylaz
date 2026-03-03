"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getAddresses() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: addresses, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { error: "Failed to fetch addresses." };
  }

  return { success: true, data: addresses };
}

export async function createAddress(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const label = formData.get("label") as string;
  const street = formData.get("street") as string;
  const apt = formData.get("apt") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;
  const deliveryInstructions = formData.get("delivery_instructions") as string;
  const isDefault = formData.get("is_default") === "true";

  if (!street || !city || !state || !zip) {
    return { error: "Street, city, state, and zip are required." };
  }

  // If setting as default, unset other defaults first
  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const { data: address, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: label || null,
      street,
      apt: apt || null,
      city,
      state,
      zip,
      delivery_instructions: deliveryInstructions || null,
      is_default: isDefault,
    })
    .select()
    .single();

  if (error) {
    return { error: "Failed to create address." };
  }

  revalidatePath("/dashboard/addresses");
  return { success: true, data: address };
}

export async function updateAddress(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const addressId = formData.get("address_id") as string;
  const label = formData.get("label") as string;
  const street = formData.get("street") as string;
  const apt = formData.get("apt") as string;
  const city = formData.get("city") as string;
  const state = formData.get("state") as string;
  const zip = formData.get("zip") as string;
  const deliveryInstructions = formData.get("delivery_instructions") as string;
  const isDefault = formData.get("is_default") === "true";

  if (!addressId || !street || !city || !state || !zip) {
    return { error: "Address ID, street, city, state, and zip are required." };
  }

  // Verify user owns this address
  const { data: existing, error: existError } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (existError || !existing) {
    return { error: "Address not found." };
  }

  // If setting as default, unset other defaults first
  if (isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true)
      .neq("id", addressId);
  }

  const { data: address, error } = await supabase
    .from("addresses")
    .update({
      label: label || null,
      street,
      apt: apt || null,
      city,
      state,
      zip,
      delivery_instructions: deliveryInstructions || null,
      is_default: isDefault,
    })
    .eq("id", addressId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update address." };
  }

  revalidatePath("/dashboard/addresses");
  return { success: true, data: address };
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  // Verify user owns this address
  const { data: existing, error: existError } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (existError || !existing) {
    return { error: "Address not found." };
  }

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    return { error: "Failed to delete address." };
  }

  revalidatePath("/dashboard/addresses");
  return { success: true };
}
