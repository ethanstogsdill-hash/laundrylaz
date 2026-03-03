"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
} from "@/lib/constants";
import { getScheduleForDate } from "@/actions/admin";
import type { OrderStatus } from "@/lib/supabase/types";

interface SlotOrder {
  id: string;
  status: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
  addresses: { street: string; city: string } | null;
}

interface ScheduleSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  slot_type: "pickup" | "delivery";
  capacity: number;
  booked: number;
  orders: SlotOrder[];
}

function getSlotFullnessColor(booked: number, capacity: number): string {
  const ratio = booked / capacity;
  if (ratio >= 1) return "bg-red-100 border-red-300 text-red-800";
  if (ratio >= 0.7) return "bg-yellow-100 border-yellow-300 text-yellow-800";
  return "bg-green-100 border-green-300 text-green-800";
}

function formatDateForInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default function AdminSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(
    formatDateForInput(new Date())
  );
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    const result = await getScheduleForDate(selectedDate);
    if (result.success) {
      setSlots((result.data as ScheduleSlot[]) || []);
    }
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const goDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(formatDateForInput(d));
  };

  const pickupSlots = slots.filter((s) => s.slot_type === "pickup");
  const deliverySlots = slots.filter((s) => s.slot_type === "delivery");

  const displayDate = new Date(selectedDate + "T12:00:00").toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Schedule
        </h1>
        <p className="text-muted-foreground mt-1">
          View daily pickups and deliveries.
        </p>
      </div>

      {/* Date picker */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={() => goDay(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <div className="flex items-center gap-2 flex-1">
              <CalendarDays className="size-4 text-muted-foreground" />
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-[160px]"
              />
              <span className="text-sm font-medium hidden sm:inline">
                {displayDate}
              </span>
            </div>
            <Button variant="outline" size="icon" onClick={() => goDay(1)}>
              <ChevronRight className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(formatDateForInput(new Date()))}
            >
              Today
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Loading schedule...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pickups */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Package className="size-5" />
              Pickups
            </h2>
            {pickupSlots.length > 0 ? (
              pickupSlots.map((slot) => {
                const fullnessColor = getSlotFullnessColor(
                  slot.booked,
                  slot.capacity
                );
                return (
                  <Card key={slot.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {slot.start_time} - {slot.end_time}
                        </CardTitle>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${fullnessColor}`}
                        >
                          {slot.booked}/{slot.capacity} booked
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {slot.orders.length > 0 ? (
                        <div className="space-y-2">
                          {slot.orders.map((order) => {
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
                              <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                  <span className="text-sm truncate">
                                    {order.profiles?.full_name ?? "Unknown"}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {order.addresses?.street ?? ""}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No orders in this slot.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Package className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No pickup slots for this date.</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Deliveries */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="size-5" />
              Deliveries
            </h2>
            {deliverySlots.length > 0 ? (
              deliverySlots.map((slot) => {
                const fullnessColor = getSlotFullnessColor(
                  slot.booked,
                  slot.capacity
                );
                return (
                  <Card key={slot.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {slot.start_time} - {slot.end_time}
                        </CardTitle>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${fullnessColor}`}
                        >
                          {slot.booked}/{slot.capacity} booked
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {slot.orders.length > 0 ? (
                        <div className="space-y-2">
                          {slot.orders.map((order) => {
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
                              <Link
                                key={order.id}
                                href={`/admin/orders/${order.id}`}
                                className="flex items-center justify-between rounded-md border px-3 py-2 hover:bg-accent transition-colors"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}
                                  >
                                    {statusLabel}
                                  </span>
                                  <span className="text-sm truncate">
                                    {order.profiles?.full_name ?? "Unknown"}
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {order.addresses?.street ?? ""}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No orders in this slot.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Truck className="size-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No delivery slots for this date.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
