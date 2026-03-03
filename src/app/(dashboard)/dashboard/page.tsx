import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarPlus, Package, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCents } from "@/lib/constants";
import type { OrderStatus } from "@/lib/supabase/types";

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, credit_balance_cents")
    .eq("id", user.id)
    .single();

  // Fetch active orders (non-delivered, non-cancelled)
  const { data: activeOrders } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (street, city, state, zip),
      time_slots!orders_pickup_slot_id_fkey (date, start_time, end_time)
    `
    )
    .eq("user_id", user.id)
    .not("status", "in", '("delivered","cancelled")')
    .order("created_at", { ascending: false })
    .limit(5);

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Hey, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here is what is happening with your laundry.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <CalendarPlus className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Schedule Pickup</h3>
              <p className="text-sm text-muted-foreground">
                Book a new laundry pickup
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/schedule">
                Book Now
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
              <Package className="size-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">View Orders</h3>
              <p className="text-sm text-muted-foreground">
                Track your order history
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/orders">
                View All
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Credit Balance */}
      {profile && profile.credit_balance_cents > 0 && (
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credit Balance</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCents(profile.credit_balance_cents)}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/referrals">Earn More</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Orders</h2>
          {activeOrders && activeOrders.length > 0 && (
            <Button variant="link" asChild className="text-sm">
              <Link href="/dashboard/orders">View All</Link>
            </Button>
          )}
        </div>

        {activeOrders && activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map((order) => {
              const statusKey = order.status as OrderStatus;
              const statusLabel =
                ORDER_STATUS_LABELS[statusKey as keyof typeof ORDER_STATUS_LABELS] ??
                order.status;
              const statusColor =
                ORDER_STATUS_COLORS[statusKey as keyof typeof ORDER_STATUS_COLORS] ??
                "bg-gray-100 text-gray-800";
              const slot = order.time_slots as {
                date: string;
                start_time: string;
                end_time: string;
              } | null;
              const addr = order.addresses as {
                street: string;
                city: string;
                state: string;
                zip: string;
              } | null;

              return (
                <Link
                  key={order.id}
                  href={`/dashboard/orders/${order.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
                            {statusLabel}
                          </span>
                          {slot && (
                            <span className="text-sm text-muted-foreground">
                              {new Date(slot.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}{" "}
                              &middot; {slot.start_time} - {slot.end_time}
                            </span>
                          )}
                        </div>
                        {addr && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {addr.street}, {addr.city}, {addr.state} {addr.zip}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="size-12 mx-auto text-muted-foreground mb-3" />
              <CardTitle className="mb-2">No active orders</CardTitle>
              <CardDescription className="mb-4">
                Schedule your first laundry pickup to get started!
              </CardDescription>
              <Button asChild>
                <Link href="/dashboard/schedule">Schedule Pickup</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
