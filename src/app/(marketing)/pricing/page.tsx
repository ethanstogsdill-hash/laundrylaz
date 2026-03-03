import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND, PRICING, formatCents } from "@/lib/constants";
import { PricingCalculator } from "@/components/features/pricing-calculator";

export const metadata: Metadata = {
  title: "Pricing",
};

const included = [
  "Drop off anytime we're open",
  "Wash, dry & fold",
  "Eco-friendly detergent",
  "Stain pre-treatment",
  "24-hour turnaround",
  "Clothes sorted by color",
  "Neatly folded & packaged",
  "Ready for you to pick up",
];

const faqs = [
  {
    q: "Is there a minimum order?",
    a: `Yes, the minimum order is ${PRICING.minimumWeightLbs} lbs. Most students find that about 1-2 weeks of laundry meets this minimum easily.`,
  },
  {
    q: "Are there any hidden fees?",
    a: `No hidden fees at all. You pay the ${formatCents(PRICING.baseFeeCents)} drop-off fee plus ${formatCents(PRICING.perLbRateCents)} per pound — that's it. Tax is included.`,
  },
  {
    q: "How does the referral program work?",
    a: `When you refer a friend, you both get ${formatCents(PRICING.referralCreditCents)} in credit applied to your next order. There's no limit on how many friends you can refer!`,
  },
  {
    q: "Can I tip the staff?",
    a: "Absolutely! Tips are optional but always appreciated. You can tip our team when you pick up your order.",
  },
  {
    q: "Do you offer bulk or subscription discounts?",
    a: "We're working on subscription plans. For now, our per-pound pricing is already one of the most affordable options in Gainesville.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Simple, Honest Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            No subscriptions or contracts. Just pay for what you wash. It&apos;s
            laundry — it shouldn&apos;t be complicated.
          </p>
        </div>
      </section>

      {/* Pricing breakdown */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-2">
            {/* Detail card */}
            <Card className="border-brand-ocean/20">
              <CardHeader>
                <CardTitle className="text-2xl">How Pricing Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Core pricing */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-brand-ocean/5 p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {PRICING.baseFeeLabel}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-brand-ocean">
                      {formatCents(PRICING.baseFeeCents)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      per order
                    </p>
                  </div>
                  <div className="rounded-lg bg-brand-amber/5 p-4 text-center">
                    <p className="text-sm font-medium text-muted-foreground">
                      {PRICING.perLbRateLabel}
                    </p>
                    <p className="mt-1 text-3xl font-bold text-brand-amber">
                      {formatCents(PRICING.perLbRateCents)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      per pound
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Minimum order of {PRICING.minimumWeightLbs} lbs. Your clothes
                  are weighed at drop-off and you&apos;re charged based on the
                  actual weight.
                </p>

                {/* What's included */}
                <div>
                  <h3 className="font-semibold text-foreground">
                    What&apos;s Included
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {included.map((item) => (
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
                    next order. Share your referral code from your dashboard.
                  </p>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Calculator */}
            <div className="lg:sticky lg:top-24">
              <PricingCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="bg-muted/30 py-16 sm:py-20">
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
      <section className="py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Ready to save time?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Sign up in under a minute and drop off your first load today.
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
