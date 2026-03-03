"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PRICING,
  formatCents,
  calculateOrderTotal,
} from "@/lib/constants";

export function PricingCalculator() {
  const [weight, setWeight] = useState<number>(PRICING.minimumWeightLbs);

  const effectiveWeight = Math.max(weight, PRICING.minimumWeightLbs);
  const { baseFee, weightCharge, total } = calculateOrderTotal(effectiveWeight);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="size-5 text-brand-ocean" />
          Price Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Weight input */}
        <div className="space-y-2">
          <Label htmlFor="weight">Estimated weight (lbs)</Label>
          <Input
            id="weight"
            type="number"
            min={PRICING.minimumWeightLbs}
            step={1}
            value={weight}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setWeight(isNaN(val) ? PRICING.minimumWeightLbs : val);
            }}
          />
          {weight < PRICING.minimumWeightLbs && (
            <p className="text-xs text-muted-foreground">
              Minimum order is {PRICING.minimumWeightLbs} lbs
            </p>
          )}
        </div>

        {/* Slider */}
        <input
          type="range"
          min={PRICING.minimumWeightLbs}
          max={50}
          step={1}
          value={Math.max(weight, PRICING.minimumWeightLbs)}
          onChange={(e) => setWeight(parseInt(e.target.value, 10))}
          className="w-full accent-brand-ocean"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{PRICING.minimumWeightLbs} lbs</span>
          <span>50 lbs</span>
        </div>

        {/* Breakdown */}
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{PRICING.baseFeeLabel}</span>
            <span>{formatCents(baseFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {effectiveWeight} lbs x {formatCents(PRICING.perLbRateCents)}/lb
            </span>
            <span>{formatCents(weightCharge)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold">
              <span>Estimated Total</span>
              <span className="text-brand-ocean">{formatCents(total)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
