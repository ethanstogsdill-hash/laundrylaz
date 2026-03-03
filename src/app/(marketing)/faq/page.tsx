import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, PRICING, formatCents } from "@/lib/constants";

export const metadata: Metadata = {
  title: "FAQ",
};

const faqs = [
  {
    question: "Where are you located?",
    answer: `We're at 3830 SW 13th St in ${BRAND.location}, convenient for UF students, Midtown, Downtown, and Butler Plaza. Open 7 days a week, 7 AM to 10 PM.`,
  },
  {
    question: "How much does it cost?",
    answer: `Our drop-off wash & fold pricing is simple: ${formatCents(PRICING.baseFeeCents)} drop-off fee plus ${formatCents(PRICING.perLbRateCents)} per pound, with a ${PRICING.minimumWeightLbs} lb minimum. That includes washing, drying, and folding. No hidden fees. Or save money and use our self-service machines!`,
  },
  {
    question: "How long does turnaround take?",
    answer:
      "We offer 24-hour turnaround on most drop-off orders. Once you leave your laundry with us, you can expect it back clean and folded by the same time the next day. We'll notify you when it's ready.",
  },
  {
    question: "How does drop-off work?",
    answer:
      "Just bring your laundry to our location at 3830 SW 13th St during business hours. We'll weigh it, confirm the order, and take it from there. You can grab a coffee in our cafe while you wait, or come back later to pick it up.",
  },
  {
    question: "What items can be washed?",
    answer:
      "We handle everyday laundry — clothes, towels, bed sheets, pillowcases, gym clothes, and more. We don't currently handle dry-clean-only items, leather, suede, or heavily stained/soiled items. When in doubt, check with us first!",
  },
  {
    question: "How do I pay?",
    answer:
      "We accept all major credit and debit cards. You can pay at the counter when you drop off or pick up your laundry.",
  },
  {
    question: "How does the referral program work?",
    answer: `When you refer a friend to ${BRAND.name}, both of you receive ${formatCents(PRICING.referralCreditCents)} in credit toward your next order. Simply share your unique referral code from your dashboard. There's no limit to how many friends you can refer.`,
  },
  {
    question: "What if something goes wrong with my order?",
    answer: `We take every order seriously. If an item is damaged, lost, or not washed to your satisfaction, contact us within 48 hours and we'll make it right — either with a rewash or a credit. Reach out at ${BRAND.email} or ${BRAND.phone}.`,
  },
  {
    question: "Can I do my own laundry there?",
    answer:
      "Yes! We have over 100 self-service washers and dryers available. It's the more affordable option — just come in, load a machine, and relax in our cafe while your clothes get clean.",
  },
  {
    question: "Do I need to provide my own laundry bag?",
    answer:
      "Nope! You can use any bag or hamper you have. We'll return your clean clothes in a fresh, sealed bag. If you'd rather use a reusable bag, that works too — just let us know.",
  },
];

export default function FAQPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Everything you need to know about {BRAND.name}
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border bg-white p-5 transition-shadow hover:shadow-sm [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium text-foreground">
                  <span>{faq.question}</span>
                  <span className="shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Still have questions + CTA */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Still have questions?
          </h2>
          <p className="mt-4 text-muted-foreground">
            We&apos;re happy to help. Reach out to us at{" "}
            <a
              href={`mailto:${BRAND.email}`}
              className="font-medium text-brand-ocean underline-offset-4 hover:underline"
            >
              {BRAND.email}
            </a>{" "}
            or call{" "}
            <a
              href={`tel:${BRAND.phone}`}
              className="font-medium text-brand-ocean underline-offset-4 hover:underline"
            >
              {BRAND.phone}
            </a>
            .
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
