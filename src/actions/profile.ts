"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    return { error: "Failed to fetch profile." };
  }

  return { success: true, data: { ...profile, email: user.email } };
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in." };
  }

  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const smsOptIn = formData.get("sms_opt_in") === "true";

  if (!fullName) {
    return { error: "Full name is required." };
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      phone: phone || null,
      sms_opt_in: smsOptIn,
    })
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    return { error: "Failed to update profile." };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  return { success: true, data: profile };
}
