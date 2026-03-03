"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PRICING, formatCents } from "@/lib/constants";
import { revalidatePath } from "next/cache";

/**
 * Process a referral after a new user signs up with a referral code.
 * Called during signup or after email verification.
 */
export async function processReferral(
  refereeId: string,
  referralCode: string
) {
  const supabase = createAdminClient();

  // Find the referrer by code
  const { data: referrer } = await supabase
    .from("profiles")
    .select("id, full_name")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) return { error: "Invalid referral code" };
  if (referrer.id === refereeId) return { error: "Cannot refer yourself" };

  // Check if referral already exists
  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referrer_id", referrer.id)
    .eq("referee_id", refereeId)
    .single();

  if (existing) return { error: "Referral already processed" };

  const rewardCents = PRICING.referralCreditCents;

  // Create referral record
  await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referee_id: refereeId,
    referral_code_used: referralCode,
    reward_cents: rewardCents,
    status: "completed",
  });

  // Credit both users
  // Referrer gets credit
  await supabase.rpc("increment_credit_balance", {
    user_id_input: referrer.id,
    amount_input: rewardCents,
  });

  await supabase.from("credit_transactions").insert({
    user_id: referrer.id,
    amount_cents: rewardCents,
    type: "referral_reward",
    reference_id: refereeId,
    description: `Referral reward - someone used your code (${formatCents(rewardCents)})`,
  });

  // Referee gets credit
  await supabase.rpc("increment_credit_balance", {
    user_id_input: refereeId,
    amount_input: rewardCents,
  });

  await supabase.from("credit_transactions").insert({
    user_id: refereeId,
    amount_cents: rewardCents,
    type: "referral_bonus",
    reference_id: referrer.id,
    description: `Welcome bonus - referral code used (${formatCents(rewardCents)})`,
  });

  // Update referrer's referred_by if not set
  await supabase
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", refereeId)
    .is("referred_by", null);

  return { success: true, rewardCents };
}

/**
 * Get referral dashboard data for the current user.
 */
export async function getReferralDashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get profile with referral code and credit balance
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, credit_balance_cents")
    .eq("id", user.id)
    .single();

  // Get referrals made by this user
  const { data: referrals } = await supabase
    .from("referrals")
    .select("id, referee_id, reward_cents, status, created_at")
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false });

  // Get credit transactions
  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return {
    success: true,
    data: {
      referralCode: profile?.referral_code || "",
      creditBalance: profile?.credit_balance_cents || 0,
      referrals: referrals || [],
      transactions: transactions || [],
    },
  };
}
