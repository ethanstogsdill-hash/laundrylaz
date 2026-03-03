"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculateOrderTotal } from "@/lib/constants";
import type { OrderStatus } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Helper: assert the current user is an admin
// ---------------------------------------------------------------------------

async function assertAdmin() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin") {
    throw new Error("Not authorized: admin access required");
  }

  return { supabase, user };
}

// ---------------------------------------------------------------------------
// Dashboard KPIs
// ---------------------------------------------------------------------------

export async function getAdminDashboardStats() {
  try {
    const { supabase } = await assertAdmin();

    const today = new Date().toISOString().split("T")[0];

    // Today's orders
    const { count: todayOrders } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59.999`);

    // Pending pickups (status = confirmed or pending)
    const { count: pendingPickups } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "confirmed"]);

    // Revenue this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const { data: weekPayments } = await supabase
      .from("payments")
      .select("amount_cents")
      .eq("status", "paid")
      .gte("created_at", weekAgo.toISOString());

    const weekRevenue = (weekPayments || []).reduce(
      (sum, p) => sum + p.amount_cents,
      0
    );

    // Total customers
    const { count: totalCustomers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    // Today's orders list
    const { data: todayOrdersList } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        created_at,
        total_cents,
        weight_lbs,
        profiles!orders_user_id_fkey (full_name)
      `
      )
      .gte("created_at", `${today}T00:00:00`)
      .lt("created_at", `${today}T23:59:59.999`)
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      success: true,
      data: {
        todayOrders: todayOrders ?? 0,
        pendingPickups: pendingPickups ?? 0,
        weekRevenue,
        totalCustomers: totalCustomers ?? 0,
        todayOrdersList: todayOrdersList || [],
      },
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Orders list with filters
// ---------------------------------------------------------------------------

interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function getAdminOrders(filters: OrderFilters = {}) {
  try {
    const { supabase } = await assertAdmin();

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("orders")
      .select(
        `
        id,
        user_id,
        status,
        weight_lbs,
        total_cents,
        payment_status,
        created_at,
        profiles!orders_user_id_fkey (full_name),
        addresses!orders_address_id_fkey (street, city, state, zip)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filters.status && filters.status !== "all") {
      query = query.eq("status", filters.status as OrderStatus);
    }

    if (filters.dateFrom) {
      query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
    }

    if (filters.dateTo) {
      query = query.lte("created_at", `${filters.dateTo}T23:59:59.999`);
    }

    const { data: orders, count, error } = await query;

    if (error) {
      return { error: error.message };
    }

    // If there's a search term, we filter client-side on the profile name
    // (Supabase doesn't support filtering on joined columns easily)
    let filteredOrders = orders || [];
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredOrders = filteredOrders.filter((o) => {
        const profile = o.profiles as { full_name: string | null } | null;
        const name = profile?.full_name?.toLowerCase() ?? "";
        return name.includes(searchLower) || o.id.toLowerCase().includes(searchLower);
      });
    }

    return {
      success: true,
      data: filteredOrders,
      total: count ?? 0,
      page,
      limit,
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Single order detail
// ---------------------------------------------------------------------------

export async function getAdminOrderDetail(orderId: string) {
  try {
    const { supabase } = await assertAdmin();

    const { data: order, error } = await supabase
      .from("orders")
      .select(
        `
        *,
        profiles!orders_user_id_fkey (id, full_name, phone, email:id),
        addresses!orders_address_id_fkey (*),
        time_slots!orders_pickup_slot_id_fkey (*),
        order_status_history (*),
        payments (*)
      `
      )
      .eq("id", orderId)
      .single();

    if (error || !order) {
      return { error: "Order not found." };
    }

    // Sort status history
    if (order.order_status_history) {
      (
        order.order_status_history as Array<{ created_at: string }>
      ).sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }

    // Get user email from auth (profiles doesn't store email)
    const userId = (order.profiles as { id: string } | null)?.id;
    let userEmail: string | null = null;
    if (userId) {
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      userEmail = authData?.user?.email ?? null;
    }

    return {
      success: true,
      data: { ...order, userEmail },
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Update order status
// ---------------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  note?: string
) {
  try {
    const { supabase, user } = await assertAdmin();

    // Get current status
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Order not found." };
    }

    const oldStatus = order.status;

    // Update order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", orderId);

    if (updateError) {
      return { error: "Failed to update order status." };
    }

    // Create status history entry
    await supabase.from("order_status_history").insert({
      order_id: orderId,
      old_status: oldStatus as OrderStatus,
      new_status: newStatus,
      changed_by: user.id,
      note: note || null,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Update order weight and calculate total
// ---------------------------------------------------------------------------

export async function updateOrderWeight(orderId: string, weightLbs: number) {
  try {
    const { supabase } = await assertAdmin();

    if (weightLbs <= 0) {
      return { error: "Weight must be greater than zero." };
    }

    // Fetch the order for pricing info
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("base_fee_cents, per_lb_rate_cents, credits_applied_cents, user_id")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Order not found." };
    }

    // Calculate total using the app's standard calculation
    const { total } = calculateOrderTotal(
      weightLbs,
      order.credits_applied_cents
    );

    // Update order with weight and calculated total
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        weight_lbs: weightLbs,
        total_cents: total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      return { error: "Failed to update order weight." };
    }

    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, data: { weightLbs, totalCents: total } };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Send invoice / create payment placeholder
// ---------------------------------------------------------------------------

export async function sendInvoice(orderId: string) {
  try {
    const { supabase } = await assertAdmin();

    // Get order to verify it has a total
    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("total_cents, payment_status")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return { error: "Order not found." };
    }

    if (order.total_cents == null) {
      return { error: "Cannot send invoice before weight is entered." };
    }

    // Create a placeholder payment (Stripe integration in Phase 4)
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        order_id: orderId,
        stripe_payment_intent_id: `placeholder_${orderId}_${Date.now()}`,
        amount_cents: order.total_cents,
        status: "pending",
      });

    if (paymentError) {
      return { error: "Failed to create payment record." };
    }

    // Update order payment status
    await supabase
      .from("orders")
      .update({
        payment_status: "processing",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Customers list
// ---------------------------------------------------------------------------

export async function getAdminCustomers(search?: string) {
  try {
    const { supabase } = await assertAdmin();

    // Fetch all customer profiles
    let query = supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer")
      .order("created_at", { ascending: false });

    const { data: profiles, error } = await query;

    if (error) {
      return { error: error.message };
    }

    let customers = profiles || [];

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      customers = customers.filter((p) => {
        const name = p.full_name?.toLowerCase() ?? "";
        const phone = p.phone?.toLowerCase() ?? "";
        return name.includes(searchLower) || phone.includes(searchLower);
      });
    }

    // For each customer, get order count and total spent
    const customerData = await Promise.all(
      customers.map(async (profile) => {
        const { count: orderCount } = await supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("user_id", profile.id);

        const { data: paidOrders } = await supabase
          .from("orders")
          .select("total_cents")
          .eq("user_id", profile.id)
          .not("total_cents", "is", null);

        const totalSpent = (paidOrders || []).reduce(
          (sum, o) => sum + (o.total_cents ?? 0),
          0
        );

        const { count: referralCount } = await supabase
          .from("referrals")
          .select("*", { count: "exact", head: true })
          .eq("referrer_id", profile.id);

        return {
          ...profile,
          orderCount: orderCount ?? 0,
          totalSpent,
          referralCount: referralCount ?? 0,
        };
      })
    );

    return { success: true, data: customerData };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Customer detail
// ---------------------------------------------------------------------------

export async function getAdminCustomerDetail(userId: string) {
  try {
    const { supabase } = await assertAdmin();

    // Profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return { error: "Customer not found." };
    }

    // Try to get email from auth
    let userEmail: string | null = null;
    try {
      const { data: authData } = await supabase.auth.admin.getUserById(userId);
      userEmail = authData?.user?.email ?? null;
    } catch {
      // Admin API might not be available with anon key; skip
    }

    // Orders
    const { data: orders } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        weight_lbs,
        total_cents,
        payment_status,
        created_at,
        time_slots!orders_pickup_slot_id_fkey (date, start_time, end_time)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // Referrals (as referrer)
    const { data: referrals } = await supabase
      .from("referrals")
      .select(
        `
        id,
        referee_id,
        reward_cents,
        status,
        created_at,
        profiles!referrals_referee_id_fkey (full_name)
      `
      )
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    // Credit transactions
    const { data: creditTransactions } = await supabase
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return {
      success: true,
      data: {
        profile,
        userEmail,
        orders: orders || [],
        referrals: referrals || [],
        creditTransactions: creditTransactions || [],
      },
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Schedule for a date
// ---------------------------------------------------------------------------

export async function getScheduleForDate(date: string) {
  try {
    const { supabase } = await assertAdmin();

    // Fetch all time slots for the date
    const { data: slots, error: slotError } = await supabase
      .from("time_slots")
      .select("*")
      .eq("date", date)
      .order("start_time", { ascending: true });

    if (slotError) {
      return { error: slotError.message };
    }

    // For each slot, fetch orders booked in that slot
    const slotsWithOrders = await Promise.all(
      (slots || []).map(async (slot) => {
        const column =
          slot.slot_type === "pickup"
            ? "pickup_slot_id"
            : "delivery_slot_id";

        const { data: orders } = await supabase
          .from("orders")
          .select(
            `
            id,
            status,
            created_at,
            profiles!orders_user_id_fkey (full_name),
            addresses!orders_address_id_fkey (street, city)
          `
          )
          .eq(column, slot.id)
          .order("created_at", { ascending: true });

        return {
          ...slot,
          orders: orders || [],
        };
      })
    );

    return { success: true, data: slotsWithOrders };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

// ---------------------------------------------------------------------------
// Revenue stats
// ---------------------------------------------------------------------------

export async function getRevenueStats() {
  try {
    const { supabase } = await assertAdmin();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Fetch all succeeded payments
    const { data: allPayments } = await supabase
      .from("payments")
      .select("amount_cents, created_at")
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    const payments = allPayments || [];

    const todayRevenue = payments
      .filter((p) => p.created_at.startsWith(today))
      .reduce((sum, p) => sum + p.amount_cents, 0);

    const weekRevenue = payments
      .filter((p) => new Date(p.created_at) >= weekAgo)
      .reduce((sum, p) => sum + p.amount_cents, 0);

    const monthRevenue = payments
      .filter((p) => new Date(p.created_at) >= monthAgo)
      .reduce((sum, p) => sum + p.amount_cents, 0);

    const allTimeRevenue = payments.reduce(
      (sum, p) => sum + p.amount_cents,
      0
    );

    // Recent payments (last 20)
    const { data: recentPayments } = await supabase
      .from("payments")
      .select(
        `
        id,
        amount_cents,
        status,
        created_at,
        orders!payments_order_id_fkey (
          id,
          profiles!orders_user_id_fkey (full_name)
        )
      `
      )
      .order("created_at", { ascending: false })
      .limit(20);

    return {
      success: true,
      data: {
        todayRevenue,
        weekRevenue,
        monthRevenue,
        allTimeRevenue,
        recentPayments: recentPayments || [],
      },
    };
  } catch (error) {
    return { error: (error as Error).message };
  }
}
