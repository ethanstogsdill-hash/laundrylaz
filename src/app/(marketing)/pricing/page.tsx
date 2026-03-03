import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRAND, PRICING, formatCents } from "@/lib/constants";
import { PricingCalculator } from "@/components/features/pricing-calculator";

export const metadata: Metadata = {
  title: "Pricing",
};

const selfServiceFeatures = [
  "100+ commercial-grade washers & dryers",
  "Multiple machine sizes to fit any load",
  "Card payment — no coins needed",
  "Free WiFi while you wait",
  "Full cafe on-site",
  "Open 7 AM – 10 PM, 7 days a week",
];

const washFoldFeatures = [
  "We wash, dry & fold everything",
  "Clothes sorted by color",
  "Eco-friendly detergent",
  "Stain pre-treatment",
  "24-hour turnaround",
  "Neatly folded & packaged",
];

const faqs = [
  {
    q: "What's the difference between the three options?",
    a: "Self-service is the most affordable — you use our machines yourself. Drop-off wash & fold means you bring your laundry to us and we do everything for you. Pickup & delivery is the most convenient — we come to your door, wash & fold, and deliver it back.",
  },
  {
    q: "Is there a minimum for drop-off wash & fold?",
    a: `Yes, the minimum order is ${PRICING.washFoldMinLbs} lbs. Most students find that about 1-2 weeks of laundry meets this minimum easily.`,
  },
  {
    q: "Are there any hidden fees?",
    a: `No hidden fees. Self-service is pay-per-load based on machine size. Drop-off wash & fold is ${formatCents(PRICING.washFoldPerLbCents)} per pound — that's it.`,
  },
  {
    q: "Can I tip the staff?",
    a: "Absolutely! Tips are optional but always appreciated. You can tip our team when you pick up your order.",
  },
  {
    q: "How does the referral program work?",
    a: `When you refer a friend, you both get ${formatCents(PRICING.referralCreditCents)} in credit applied to your next order. There's no limit on how many friends you can refer!`,
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Three Ways to Get Fresh
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Do it yourself and save, drop it off, or schedule a pickup.
            No subscriptions, no contracts.
          </p>
        </div>
      </section>

      {/* Two Options */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-stretch gap-8 lg:grid-cols-3">
            {/* Self-Service */}
            <Card className="flex flex-col border-brand-ocean/20">
              <CardHeader>
                <Badge className="w-fit bg-brand-ocean text-white">Most Affordable</Badge>
                <CardTitle className="text-2xl">Self-Service</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Use our machines yourself — wash and dry on your schedule.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-8">
                {/* Washer prices */}
                <div>
                  <h3 className="font-semibold text-foreground">Washer Prices (per load)</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {PRICING.selfServiceWashers.map((w) => (
                      <div
                        key={w.size}
                        className="flex items-center justify-between rounded-lg bg-brand-ocean/5 p-3"
                      >
                        <span className="text-sm font-medium">{w.size}</span>
                        <span className="text-lg font-bold text-brand-ocean">
                          {formatCents(w.priceCents)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-foreground">What You Get</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {selfServiceFeatures.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="size-4 shrink-0 text-brand-ocean" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button asChild className="w-full bg-brand-ocean hover:bg-brand-ocean/90 text-white" size="lg">
                    <Link href={BRAND.googleMapsUrl} target="_blank">
                      Visit Us
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Wash & Fold */}
            <Card className="flex flex-col border-brand-amber/30 shadow-lg">
              <CardHeader>
                <Badge className="w-fit bg-brand-amber text-white">We Do It For You</Badge>
                <CardTitle className="text-2xl">Drop-off Wash & Fold</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drop it off, we handle the rest. Pick it up fresh and folded.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-8">
                {/* Price */}
                <div className="rounded-lg bg-brand-amber/5 p-4 text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {formatCents(PRICING.washFoldPerLbCents)}
                    <span className="text-lg font-normal text-muted-foreground">/lb</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {PRICING.washFoldMinLbs} lb minimum
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-foreground">What&apos;s Included</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {washFoldFeatures.map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="size-4 shrink-0 text-brand-amber" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Referral */}
                <div className="rounded-lg border border-brand-amber/30 bg-brand-amber/5 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    Referral Program
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Refer a friend and you both get{" "}
                    {formatCents(PRICING.referralCreditCents)} credit toward your
                    next order.
                  </p>
                </div>

                <div className="mt-auto pt-4">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/signup">
                      Get Started
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pickup & Delivery */}
            <Card className="flex flex-col border-brand-ocean/20">
              <CardHeader>
                <Badge className="w-fit bg-brand-ocean text-white">Most Convenient</Badge>
                <CardTitle className="text-2xl">Pickup & Delivery</CardTitle>
                <p className="text-sm text-muted-foreground">
                  We come to you — pickup, wash & fold, and deliver back to your door.
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col space-y-8">
                {/* Price */}
                <div className="rounded-lg bg-brand-ocean/5 p-4 text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {formatCents(PRICING.washFoldPerLbCents)}
                    <span className="text-lg font-normal text-muted-foreground">/lb</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {PRICING.washFoldMinLbs} lb minimum + {formatCents(PRICING.pickupDeliveryFeeCents)} delivery fee
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h3 className="font-semibold text-foreground">What&apos;s Included</h3>
                  <div className="mt-3 grid gap-2">
                    {[
                      `${formatCents(PRICING.pickupDeliveryFeeCents)} flat delivery fee`,
                      "Same wash & fold quality",
                      "Pickup from your door",
                      "Schedule from your dashboard",
                      "Real-time order tracking",
                      "24-hour turnaround",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="size-4 shrink-0 text-brand-ocean" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <Button asChild className="w-full" size="lg">
                    <Link href="/signup">
                      Schedule Pickup
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Estimate Your Drop-off Cost
            </h2>
            <p className="mt-4 text-muted-foreground">
              Use the calculator to see how much your drop-off wash & fold order would cost.
            </p>
          </div>
          <div className="mt-10 flex justify-center">
            <PricingCalculator />
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Common Pricing Questions
          </h2>

          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-lg border bg-white p-4 [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between font-medium text-foreground">
                  {faq.q}
                  <span className="ml-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to get started?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop by anytime, drop it off, or schedule a pickup. We&apos;re open 7 days a week.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signup">
              Get Started
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
