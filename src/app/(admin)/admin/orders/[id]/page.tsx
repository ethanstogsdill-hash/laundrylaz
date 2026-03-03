"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  Circle,
  User,
  Scale,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  formatCents,
  calculateOrderTotal,
} from "@/lib/constants";
import {
  getAdminOrderDetail,
  updateOrderStatus,
  updateOrderWeight,
  sendInvoice,
} from "@/actions/admin";
import type {
  OrderStatus,
  Address,
  TimeSlot,
  OrderStatusHistory,
  Payment,
} from "@/lib/supabase/types";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Status update
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNote, setStatusNote] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Weight entry
  const [weightInput, setWeightInput] = useState("");
  const [weightUpdating, setWeightUpdating] = useState(false);

  // Invoice
  const [invoiceSending, setInvoiceSending] = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    const result = await getAdminOrderDetail(orderId);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setOrder(result.data);
      setNewStatus(result.data.status as string);
      if (result.data.weight_lbs != null) {
        setWeightInput(String(result.data.weight_lbs));
      }
    }
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading order details...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="size-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error ?? "Order not found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const addr = order.addresses as Address | null;
  const slot = order.time_slots as TimeSlot | null;
  const statusHistory = (
    (order.order_status_history as OrderStatusHistory[]) || []
  );
  const payments = (order.payments as Payment[]) || [];
  const profile = order.profiles as {
    id: string;
    full_name: string | null;
    phone: string | null;
  } | null;
  const userEmail = order.userEmail as string | null;

  const statusKey = order.status as OrderStatus;
  const statusLabel =
    ORDER_STATUS_LABELS[statusKey as keyof typeof ORDER_STATUS_LABELS] ??
    (order.status as string);
  const statusColor =
    ORDER_STATUS_COLORS[statusKey as keyof typeof ORDER_STATUS_COLORS] ??
    "bg-gray-100 text-gray-800";

  const handleStatusUpdate = async () => {
    if (!newStatus || newStatus === order.status) return;
    setStatusUpdating(true);
    const result = await updateOrderStatus(
      orderId,
      newStatus as OrderStatus,
      statusNote || undefined
    );
    if (result.error) {
      alert(result.error);
    } else {
      setStatusNote("");
      await fetchOrder();
    }
    setStatusUpdating(false);
  };

  const handleWeightUpdate = async () => {
    const weight = parseFloat(weightInput);
    if (isNaN(weight) || weight <= 0) {
      alert("Please enter a valid weight.");
      return;
    }
    setWeightUpdating(true);
    const result = await updateOrderWeight(orderId, weight);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchOrder();
    }
    setWeightUpdating(false);
  };

  const handleSendInvoice = async () => {
    if (!confirm("Send invoice to customer?")) return;
    setInvoiceSending(true);
    const result = await sendInvoice(orderId);
    if (result.error) {
      alert(result.error);
    } else {
      await fetchOrder();
    }
    setInvoiceSending(false);
  };

  // Calculate preview of price if weight is entered
  const weightNum = parseFloat(weightInput);
  const previewCalc =
    !isNaN(weightNum) && weightNum > 0
      ? calculateOrderTotal(
          weightNum,
          (order.credits_applied_cents as number) ?? 0
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-sm text-muted-foreground">
            Order ID: {orderId.slice(0, 8)}...
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusColor}`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-4" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Name</span>
                <span className="text-sm font-medium">
                  {profile?.full_name ?? "Unknown"}
                </span>
              </div>
              {userEmail && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm">{userEmail}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm">{profile.phone}</span>
                </div>
              )}
              {profile?.id && (
                <div className="mt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/customers/${profile.id}`}>
                      View Customer Profile
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pickup and Address Info */}
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
                      Delivery notes: {addr.delivery_instructions}
                    </p>
                  )}
                </div>
              )}
              {(order.special_instructions as string | null) && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="size-3" />
                    Special Instructions
                  </p>
                  <p className="text-sm">{order.special_instructions as string}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Weight Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="size-4" />
                Weight & Pricing
              </CardTitle>
              <CardDescription>
                Enter the weight after pickup to calculate the total.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 12.5"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleWeightUpdate}
                  disabled={weightUpdating || !weightInput}
                >
                  {weightUpdating ? "Saving..." : "Save Weight"}
                </Button>
              </div>

              {/* Price breakdown */}
              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Base Fee</span>
                  <span>
                    {formatCents(order.base_fee_cents as number)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Per Lb Rate</span>
                  <span>
                    {formatCents(order.per_lb_rate_cents as number)}/lb
                  </span>
                </div>
                {previewCalc && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Weight Charge ({weightInput} lbs)
                      </span>
                      <span>{formatCents(previewCalc.weightCharge)}</span>
                    </div>
                    {previewCalc.credits > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Credits Applied</span>
                        <span>-{formatCents(previewCalc.credits)}</span>
                      </div>
                    )}
                    <hr />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{formatCents(previewCalc.total)}</span>
                    </div>
                  </>
                )}
                {!previewCalc && order.total_cents != null && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Weight</span>
                      <span>{order.weight_lbs as number} lbs</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total</span>
                      <span>{formatCents(order.total_cents as number)}</span>
                    </div>
                  </>
                )}
                {!previewCalc && order.total_cents == null && (
                  <p className="text-muted-foreground text-center py-2">
                    Enter weight to calculate total.
                  </p>
                )}
              </div>

              {/* Send Invoice button */}
              {order.total_cents != null &&
                order.payment_status === "pending" && (
                  <Button
                    onClick={handleSendInvoice}
                    disabled={invoiceSending}
                    className="w-full"
                  >
                    <Send className="size-4 mr-2" />
                    {invoiceSending
                      ? "Sending..."
                      : "Send Invoice"}
                  </Button>
                )}
            </CardContent>
          </Card>

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
              <CardDescription>
                Change the order status and add an optional note.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {ORDER_STATUS_LABELS[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleStatusUpdate}
                  disabled={
                    statusUpdating || newStatus === (order.status as string)
                  }
                >
                  {statusUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
              <div>
                <Label htmlFor="statusNote">Note (optional)</Label>
                <Textarea
                  id="statusNote"
                  placeholder="Add a note about this status change..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Status Timeline</CardTitle>
              <CardDescription>Order progress history.</CardDescription>
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

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="size-4" />
                Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length > 0 ? (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between text-sm border-b pb-2 last:border-0"
                    >
                      <div>
                        <p className="font-medium">
                          {formatCents(payment.amount_cents)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          payment.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : payment.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No payments recorded.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
