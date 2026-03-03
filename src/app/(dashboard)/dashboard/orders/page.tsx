import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, formatCents } from "@/lib/constants";
import type { OrderStatus } from "@/lib/supabase/types";

export const metadata = {
  title: "Orders",
};

export default async function OrdersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: orders } = await supabase
    .from("orders")
    .select(
      `
      *,
      addresses (street, city, state, zip),
      time_slots!orders_pickup_slot_id_fkey (date, start_time, end_time)
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            View and track all your laundry orders.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/schedule">New Pickup</Link>
        </Button>
      </div>

      {orders && orders.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => {
                      const statusKey = order.status as OrderStatus;
                      const statusLabel =
                        ORDER_STATUS_LABELS[
                          statusKey as keyof typeof ORDER_STATUS_LABELS
                        ] ?? order.status;
                      const statusColor =
                        ORDER_STATUS_COLORS[
                          statusKey as keyof typeof ORDER_STATUS_COLORS
                        ] ?? "bg-gray-100 text-gray-800";
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
                        <TableRow key={order.id}>
                          <TableCell>
                            {slot
                              ? new Date(slot.date).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {slot
                              ? `${slot.start_time} - ${slot.end_time}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order.weight_lbs
                              ? `${order.weight_lbs} lbs`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {order.total_cents != null
                              ? formatCents(order.total_cents)
                              : "-"}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {addr
                              ? `${addr.street}, ${addr.city}`
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon-sm" asChild>
                              <Link href={`/dashboard/orders/${order.id}`}>
                                <ArrowRight className="size-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => {
              const statusKey = order.status as OrderStatus;
              const statusLabel =
                ORDER_STATUS_LABELS[
                  statusKey as keyof typeof ORDER_STATUS_LABELS
                ] ?? order.status;
              const statusColor =
                ORDER_STATUS_COLORS[
                  statusKey as keyof typeof ORDER_STATUS_COLORS
                ] ?? "bg-gray-100 text-gray-800";
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
                    <CardContent className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                          >
                            {statusLabel}
                          </span>
                          {order.total_cents != null && (
                            <span className="text-sm font-medium">
                              {formatCents(order.total_cents)}
                            </span>
                          )}
                        </div>
                        {slot && (
                          <p className="text-sm text-muted-foreground">
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            &middot; {slot.start_time} - {slot.end_time}
                          </p>
                        )}
                        {addr && (
                          <p className="text-xs text-muted-foreground truncate">
                            {addr.street}, {addr.city}
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
        </>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="size-12 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="mb-2">No orders yet</CardTitle>
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
  );
}
