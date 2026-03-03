import Link from "next/link";
import { redirect } from "next/navigation";
import { CreditCard, ArrowRight, Receipt } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCents } from "@/lib/constants";

export const metadata = {
  title: "Payments",
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  succeeded: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  succeeded: "Succeeded",
  failed: "Failed",
  refunded: "Refunded",
};

export default async function PaymentsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch payments for all of the user's orders
  const { data: payments } = await supabase
    .from("payments")
    .select(
      `
      *,
      orders!payments_order_id_fkey (id, user_id)
    `
    )
    .order("created_at", { ascending: false });

  // Filter to only payments that belong to the current user's orders
  const userPayments = (payments || []).filter((payment) => {
    const order = payment.orders as { id: string; user_id: string } | null;
    return order?.user_id === user.id;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground mt-1">
          View your payment history across all orders.
        </p>
      </div>

      {userPayments.length > 0 ? (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPayments.map((payment) => {
                      const order = payment.orders as {
                        id: string;
                        user_id: string;
                      } | null;
                      const statusLabel =
                        PAYMENT_STATUS_LABELS[payment.status] ?? payment.status;
                      const statusColor =
                        PAYMENT_STATUS_COLORS[payment.status] ??
                        "bg-gray-100 text-gray-800";

                      return (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {order ? `${order.id.slice(0, 8)}...` : "-"}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCents(payment.amount_cents)}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                            >
                              {statusLabel}
                            </span>
                          </TableCell>
                          <TableCell>
                            {order && (
                              <Button variant="ghost" size="icon-sm" asChild>
                                <Link
                                  href={`/dashboard/orders/${order.id}`}
                                >
                                  <ArrowRight className="size-4" />
                                </Link>
                              </Button>
                            )}
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
            {userPayments.map((payment) => {
              const order = payment.orders as {
                id: string;
                user_id: string;
              } | null;
              const statusLabel =
                PAYMENT_STATUS_LABELS[payment.status] ?? payment.status;
              const statusColor =
                PAYMENT_STATUS_COLORS[payment.status] ??
                "bg-gray-100 text-gray-800";

              return (
                <Link
                  key={payment.id}
                  href={
                    order
                      ? `/dashboard/orders/${order.id}`
                      : "/dashboard/payments"
                  }
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
                          <span className="text-sm font-medium">
                            {formatCents(payment.amount_cents)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </p>
                        {order && (
                          <p className="text-xs text-muted-foreground font-mono">
                            Order: {order.id.slice(0, 8)}...
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
            <Receipt className="size-12 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="mb-2">No payments yet</CardTitle>
            <CardDescription className="mb-4">
              Payments will appear here once your orders are processed.
            </CardDescription>
            <Button asChild>
              <Link href="/dashboard/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
