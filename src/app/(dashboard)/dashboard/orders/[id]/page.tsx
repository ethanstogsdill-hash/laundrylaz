import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  Circle,
  Clock,
  Truck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCents,
} from "@/lib/constants";
import type { OrderStatus, Address, TimeSlot, OrderStatusHistory } from "@/lib/supabase/types";

export const metadata = {
  title: "Order Details",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
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
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) {
    notFound();
  }

  const addr = order.addresses as Address | null;
  const slot = order.time_slots as TimeSlot | null;
  const statusHistory = (
    (order.order_status_history as OrderStatusHistory[]) || []
  ).sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const statusKey = order.status as OrderStatus;
  const statusLabel =
    ORDER_STATUS_LABELS[statusKey as keyof typeof ORDER_STATUS_LABELS] ??
    order.status;
  const statusColor =
    ORDER_STATUS_COLORS[statusKey as keyof typeof ORDER_STATUS_COLORS] ??
    "bg-gray-100 text-gray-800";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Order ID: {order.id.slice(0, 8)}...
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      {/* Order Tracking */}
      {statusKey !== "delivered" && statusKey !== "cancelled" && (
        <Card className="border-brand-ocean/20 bg-brand-ocean/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex size-10 items-center justify-center rounded-full bg-brand-ocean/10">
                {statusKey === "out_for_delivery" ? (
                  <Truck className="size-5 text-brand-ocean" />
                ) : (
                  <Clock className="size-5 text-brand-ocean" />
                )}
              </div>
              <div>
                <p className="font-semibold text-foreground">Order Tracking</p>
                <p className="text-sm text-muted-foreground">
                  {statusKey === "pending" && "Your order has been placed. We'll confirm it shortly."}
                  {statusKey === "confirmed" && "Your order is confirmed and scheduled for pickup."}
                  {statusKey === "picked_up" && "We've picked up your laundry. Washing will begin soon."}
                  {statusKey === "washing" && "Your laundry is being washed and folded."}
                  {statusKey === "ready" && "Your laundry is ready! Come pick it up or wait for delivery."}
                  {statusKey === "out_for_delivery" && "Your laundry is on its way to you!"}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Placed</span>
                <span>Confirmed</span>
                <span>Washing</span>
                <span>Ready</span>
                <span>Delivered</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-ocean transition-all duration-500"
                  style={{
                    width:
                      statusKey === "pending" ? "10%" :
                      statusKey === "confirmed" ? "25%" :
                      statusKey === "picked_up" ? "40%" :
                      statusKey === "washing" ? "55%" :
                      statusKey === "ready" ? "80%" :
                      statusKey === "out_for_delivery" ? "90%" :
                      "100%",
                  }}
                />
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Real-time updates will be available once connected with Fresh Laundry & Cafe&apos;s system.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-6">
          {/* Pickup Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="size-4" />
                Pickup Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {slot && (
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">
                    {new Date(slot.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm">
                    {slot.start_time} - {slot.end_time}
                  </p>
                </div>
              )}
              {addr && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    Address
                  </p>
                  <p className="font-medium">
                    {addr.street}
                    {addr.apt ? `, ${addr.apt}` : ""}
                  </p>
                  <p className="text-sm">
                    {addr.city}, {addr.state} {addr.zip}
                  </p>
                  {addr.delivery_instructions && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Delivery: {addr.delivery_instructions}
                    </p>
                  )}
                </div>
              )}
              {order.special_instructions && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="size-3" />
                    Special Instructions
                  </p>
                  <p className="text-sm">{order.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fee</span>
                  <span>{formatCents(order.base_fee_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Lb Rate</span>
                  <span>{formatCents(order.per_lb_rate_cents)}/lb</span>
                </div>
                {order.weight_lbs != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span>{order.weight_lbs} lbs</span>
                  </div>
                )}
                {order.weight_lbs != null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weight Charge</span>
                    <span>
                      {formatCents(
                        Math.round(order.weight_lbs * order.per_lb_rate_cents)
                      )}
                    </span>
                  </div>
                )}
                {order.credits_applied_cents > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Credits Applied</span>
                    <span>-{formatCents(order.credits_applied_cents)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span>
                    {order.total_cents != null
                      ? formatCents(order.total_cents)
                      : "Pending weigh-in"}
                  </span>
                </div>
              </div>

              {/* Payment status */}
              {order.payment_status === "pending" &&
                order.total_cents != null && (
                  <div className="mt-4">
                    <Button className="w-full" disabled>
                      Pay Now (Coming Soon)
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Stripe payments will be available in the next update.
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Status Timeline */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>
                Track the progress of your order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {statusHistory.length > 0 ? (
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-border" />

                  <div className="space-y-6">
                    {statusHistory.map((entry, index) => {
                      const isLatest = index === statusHistory.length - 1;
                      const entryStatusLabel =
                        ORDER_STATUS_LABELS[
                          entry.new_status as keyof typeof ORDER_STATUS_LABELS
                        ] ?? entry.new_status;
                      const entryStatusColor =
                        ORDER_STATUS_COLORS[
                          entry.new_status as keyof typeof ORDER_STATUS_COLORS
                        ] ?? "bg-gray-100 text-gray-800";

                      return (
                        <div key={entry.id} className="relative flex gap-4">
                          {/* Icon */}
                          <div className="relative z-10">
                            {isLatest ? (
                              <CheckCircle2 className="size-6 text-primary" />
                            ) : (
                              <Circle className="size-6 text-muted-foreground fill-background" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${entryStatusColor}`}
                              >
                                {entryStatusLabel}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(entry.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                            {entry.note && (
                              <p className="text-sm mt-1">{entry.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No status updates yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
