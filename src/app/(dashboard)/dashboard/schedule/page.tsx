"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  CalendarPlus,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PRICING, formatCents } from "@/lib/constants";
import { schedulePickup } from "@/actions/orders";
import { getAvailableTimeSlots } from "@/actions/orders";
import { getAddresses } from "@/actions/addresses";
import type { Address, TimeSlot } from "@/lib/supabase/types";

const STEPS = [
  { label: "Date", icon: CalendarPlus },
  { label: "Time", icon: Clock },
  { label: "Address", icon: MapPin },
  { label: "Notes", icon: FileText },
  { label: "Review", icon: CheckCircle2 },
];

export default function SchedulePickupPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    getAvailableTimeSlots(dateStr).then((result) => {
      if (result.error) {
        setError(result.error);
        setTimeSlots([]);
      } else {
        setTimeSlots(result.data || []);
        setError(null);
      }
      setLoadingSlots(false);
    });
  }, [selectedDate]);

  // Fetch addresses on mount
  useEffect(() => {
    setLoadingAddresses(true);
    getAddresses().then((result) => {
      if (result.error) {
        setError(result.error);
      } else {
        const addrs = result.data || [];
        setAddresses(addrs);
        // Auto-select default address
        const defaultAddr = addrs.find((a) => a.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr);
      }
      setLoadingAddresses(false);
    });
  }, []);

  const canProceed = () => {
    switch (step) {
      case 0:
        return !!selectedDate;
      case 1:
        return !!selectedSlot;
      case 2:
        return !!selectedAddress;
      case 3:
        return true; // instructions are optional
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleSubmit = () => {
    if (!selectedSlot || !selectedAddress) return;

    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set("address_id", selectedAddress.id);
      formData.set("pickup_slot_id", selectedSlot.id);
      formData.set("special_instructions", instructions);

      const result = await schedulePickup(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.orderId) {
        router.push(`/dashboard/orders/${result.orderId}`);
      }
    });
  };

  const disabledDays = { before: new Date() };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Schedule Pickup</h1>
        <p className="text-muted-foreground mt-1">
          Book a laundry pickup in a few easy steps.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="flex items-center gap-2">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  i < step
                    ? "bg-primary text-primary-foreground"
                    : i === step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="size-4" />
              </div>
              <span
                className={cn(
                  "hidden sm:inline text-sm",
                  i <= step ? "font-medium" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "hidden sm:block h-px w-8 lg:w-16",
                    i < step ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Step content */}
      <Card>
        <CardContent className="pt-6">
          {/* Step 1: Select Date */}
          {step === 0 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Select a Pickup Date</CardTitle>
                <CardDescription>
                  Choose when you would like us to pick up your laundry.
                </CardDescription>
              </CardHeader>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={disabledDays}
                />
              </div>
            </div>
          )}

          {/* Step 2: Select Time Slot */}
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Select a Time Slot</CardTitle>
                <CardDescription>
                  {selectedDate
                    ? `Available slots for ${format(selectedDate, "EEEE, MMMM d, yyyy")}`
                    : "Select a date first"}
                </CardDescription>
              </CardHeader>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="size-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No available time slots for this date. Please try another
                    day.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                        selectedSlot?.id === slot.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <Clock className="size-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {slot.capacity - slot.booked} spots left
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Select Address */}
          {step === 2 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Select Pickup Address</CardTitle>
                <CardDescription>
                  Where should we pick up your laundry?
                </CardDescription>
              </CardHeader>
              {loadingAddresses ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="text-center py-8">
                  <MapPin className="size-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-4">
                    You have no saved addresses. Please add one first.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/dashboard/addresses")}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => setSelectedAddress(addr)}
                      className={cn(
                        "flex items-start gap-3 rounded-lg border p-4 text-left transition-colors",
                        selectedAddress?.id === addr.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "hover:bg-accent"
                      )}
                    >
                      <MapPin className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        {addr.label && (
                          <p className="font-medium text-sm">{addr.label}</p>
                        )}
                        <p className="text-sm">
                          {addr.street}
                          {addr.apt ? `, ${addr.apt}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {addr.city}, {addr.state} {addr.zip}
                        </p>
                        {addr.is_default && (
                          <span className="inline-block mt-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            Default
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Special Instructions */}
          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="p-0">
                <CardTitle>Special Instructions</CardTitle>
                <CardDescription>
                  Any special requests? (Optional)
                </CardDescription>
              </CardHeader>
              <Textarea
                placeholder="e.g., Leave bag at front door, separate darks and lights, use fragrance-free detergent..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows={4}
              />
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {step === 4 && (
            <div className="space-y-6">
              <CardHeader className="p-0">
                <CardTitle>Review & Confirm</CardTitle>
                <CardDescription>
                  Please review your pickup details before confirming.
                </CardDescription>
              </CardHeader>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                  <CalendarPlus className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pickup Date & Time</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate &&
                        format(selectedDate, "EEEE, MMMM d, yyyy")}
                    </p>
                    {selectedSlot && (
                      <p className="text-sm text-muted-foreground">
                        {selectedSlot.start_time} - {selectedSlot.end_time}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="size-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pickup Address</p>
                    {selectedAddress && (
                      <>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.street}
                          {selectedAddress.apt
                            ? `, ${selectedAddress.apt}`
                            : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedAddress.city}, {selectedAddress.state}{" "}
                          {selectedAddress.zip}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Instructions */}
                {instructions && (
                  <div className="flex items-start gap-3">
                    <FileText className="size-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">
                        Special Instructions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {instructions}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pricing Estimate */}
                <div className="rounded-lg border p-4 bg-muted/30">
                  <p className="font-medium text-sm mb-2">Pricing Estimate</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Per Pound
                      </span>
                      <span>
                        {formatCents(PRICING.washFoldPerLbCents)}/lb
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Minimum weight</span>
                      <span>{PRICING.washFoldMinLbs} lbs</span>
                    </div>
                    <hr className="my-2" />
                    <p className="text-xs text-muted-foreground">
                      Final total calculated after weighing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
          >
            Next
            <ArrowRight className="size-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                Confirm Pickup
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
