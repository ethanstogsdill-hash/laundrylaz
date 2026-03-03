import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  User,
  Package,
  Gift,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
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
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCents,
} from "@/lib/constants";
import { getAdminCustomerDetail } from "@/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

export const metadata = {
  title: "Customer Detail - Admin",
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getAdminCustomerDetail(id);

  if ("error" in result && result.error) {
    notFound();
  }

  const { profile, userEmail, orders, referrals, creditTransactions } =
    result.data!;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/customers">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name ?? "Unnamed Customer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Customer since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {profile.full_name ?? "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{userEmail ?? "Not available"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p className="font-medium">{profile.phone ?? "Not set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">SMS Opt-in</p>
                  <p className="font-medium">
                    {profile.sms_opt_in ? "Yes" : "No"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referral Code</p>
                  <p className="font-medium font-mono">
                    {profile.referral_code ?? "None"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Credit Balance</p>
                  <p className="font-medium text-green-600">
                    {formatCents(profile.credit_balance_cents)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="size-4" />
                Order History
              </CardTitle>
              <CardDescription>
                {orders.length} order{orders.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(
                      (order: {
                        id: string;
                        status: string;
                        weight_lbs: number | null;
                        total_cents: number | null;
                        payment_status: string;
                        created_at: string;
                        time_slots: {
                          date: string;
                          start_time: string;
                          end_time: string;
                        } | null;
                      }) => {
                        const statusKey = order.status as OrderStatus;
                        const statusLabel =
                          ORDER_STATUS_LABELS[
                            statusKey as keyof typeof ORDER_STATUS_LABELS
                          ] ?? order.status;
                        const statusColor =
                          ORDER_STATUS_COLORS[
                            statusKey as keyof typeof ORDER_STATUS_COLORS
                          ] ?? "bg-gray-100 text-gray-800";

                        return (
                          <TableRow key={order.id}>
                            <TableCell>
                              <Link
                                href={`/admin/orders/${order.id}`}
                                className="text-primary hover:underline font-mono text-xs"
                              >
                                #{order.id.slice(0, 8)}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {new Date(
                                order.created_at
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                            </TableCell>
                            <TableCell>
                              {order.weight_lbs != null
                                ? `${order.weight_lbs} lbs`
                                : "--"}
                            </TableCell>
                            <TableCell>
                              {order.total_cents != null
                                ? formatCents(order.total_cents)
                                : "--"}
                            </TableCell>
                          </TableRow>
                        );
                      }
                    )}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No orders yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Referrals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="size-4" />
                Referrals
              </CardTitle>
              <CardDescription>
                {referrals.length} referral
                {referrals.length !== 1 ? "s" : ""} made
              </CardDescription>
            </CardHeader>
            <CardContent>
              {referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map(
                    (referral: {
                      id: string;
                      reward_cents: number;
                      status: string;
                      created_at: string;
                      profiles: { full_name: string | null } | null;
                    }) => (
                      <div
                        key={referral.id}
                        className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium">
                            {referral.profiles?.full_name ?? "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(
                              referral.created_at
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-600 font-medium">
                            +{formatCents(referral.reward_cents)}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              referral.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : referral.status === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {referral.status}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No referrals made.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Credit Transactions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Credit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {creditTransactions.length > 0 ? (
                <div className="space-y-3">
                  {creditTransactions.map(
                    (tx: {
                      id: string;
                      amount_cents: number;
                      type: string;
                      description: string | null;
                      created_at: string;
                    }) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                      >
                        <div>
                          <p className="font-medium capitalize">
                            {tx.type.replace(/_/g, " ")}
                          </p>
                          {tx.description && (
                            <p className="text-xs text-muted-foreground">
                              {tx.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                        <span
                          className={`font-medium ${
                            tx.amount_cents >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {tx.amount_cents >= 0 ? "+" : ""}
                          {formatCents(Math.abs(tx.amount_cents))}
                        </span>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No credit transactions.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
