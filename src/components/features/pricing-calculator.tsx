"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRICING,
  formatCents,
  calculateWashFoldTotal,
} from "@/lib/constants";

type ServiceType = "self-service" | "drop-off" | "pickup-delivery";

function getSelfServiceEstimate(weightLbs: number) {
  // Rough estimate: ~8 lbs per small load, ~12 medium, ~16 large, ~20 XL
  const loadSizes = [
    { size: "Small", lbsPerLoad: 8, priceCents: PRICING.selfServiceWashers[0].priceCents },
    { size: "Medium", lbsPerLoad: 12, priceCents: PRICING.selfServiceWashers[1].priceCents },
    { size: "Large", lbsPerLoad: 16, priceCents: PRICING.selfServiceWashers[2].priceCents },
    { size: "Extra Large", lbsPerLoad: 20, priceCents: PRICING.selfServiceWashers[3].priceCents },
  ];

  // Find best value machine size (cheapest per lb)
  const best = loadSizes
    .map((s) => ({ ...s, costPerLb: s.priceCents / s.lbsPerLoad }))
    .sort((a, b) => a.costPerLb - b.costPerLb)[0];

  const loads = Math.ceil(weightLbs / best.lbsPerLoad);
  const total = loads * best.priceCents;

  return { machineName: best.size, loads, total, priceCents: best.priceCents };
}

export function PricingCalculator() {
  const [serviceType, setServiceType] = useState<ServiceType>("drop-off");
  const [weight, setWeight] = useState<number>(PRICING.washFoldMinLbs);

  const effectiveWeight = serviceType === "self-service" ? Math.max(weight, 1) : Math.max(weight, PRICING.washFoldMinLbs);

  const washFold = calculateWashFoldTotal(effectiveWeight);
  const selfService = getSelfServiceEstimate(effectiveWeight);
  const deliveryFee = serviceType === "pickup-delivery" ? PRICING.pickupDeliveryFeeCents : 0;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="size-5 text-brand-ocean" />
          Pricing Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Type Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="service-type">Service Type</Label>
          <select
            id="service-type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="self-service">Self-Service</option>
            <option value="drop-off">Drop-off Wash & Fold</option>
            <option value="pickup-delivery">Pickup & Delivery</option>
          </select>
        </div>

        {/* Weight input */}
        <div className="space-y-2">
          <Label htmlFor="weight">Estimated weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            min={serviceType === "self-service" ? 1 : PRICING.washFoldMinLbs}
            step={1}
            value={weight}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setWeight(isNaN(val) ? PRICING.washFoldMinLbs : val);
            }}
          />
          {serviceType !== "self-service" && weight < PRICING.washFoldMinLbs && (
            <p className="text-xs text-muted-foreground">
              Minimum order is {PRICING.washFoldMinLbs} lbs
            </p>
          )}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={serviceType === "self-service" ? 1 : PRICING.washFoldMinLbs}
          max={50}
          step={1}
          value={Math.max(weight, serviceType === "self-service" ? 1 : PRICING.washFoldMinLbs)}
          onChange={(e) => setWeight(parseInt(e.target.value, 10))}
          className="w-full accent-brand-ocean"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{serviceType === "self-service" ? "1" : PRICING.washFoldMinLbs} lbs</span>
          <span>50 lbs</span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          {serviceType === "self-service" ? (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Best value: {selfService.machineName} washer
                </span>
                <span>{formatCents(selfService.priceCents)}/load</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  ~{selfService.loads} load{selfService.loads > 1 ? "s" : ""} needed
                </span>
                <span>{formatCents(selfService.total)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dryer cost not included. Estimate based on machine capacity.
              </p>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Washer Cost</span>
                  <span className="text-brand-ocean">{formatCents(selfService.total)}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {effectiveWeight} lbs x {formatCents(PRICING.washFoldPerLbCents)}/lb
                </span>
                <span>{formatCents(washFold.weightCharge)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span>{formatCents(deliveryFee)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-brand-ocean">
                    {formatCents(washFold.total + deliveryFee)}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
