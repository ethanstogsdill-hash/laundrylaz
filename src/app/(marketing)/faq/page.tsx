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
    question: "What areas do you serve?",
    answer: `We currently serve ${BRAND.location} and the surrounding areas, including the University of Florida campus, Midtown, Downtown, Butler Plaza, and most apartment complexes within a 10-mile radius of UF. Not sure if you're covered? Sign up and enter your address — we'll let you know instantly.`,
  },
  {
    question: "How much does it cost?",
    answer: `Our pricing is simple: ${formatCents(PRICING.baseFeeCents)} pickup fee plus ${formatCents(PRICING.perLbRateCents)} per pound, with a ${PRICING.minimumWeightLbs} lb minimum. That includes pickup, washing, drying, folding, and delivery. No hidden fees.`,
  },
  {
    question: "How long does turnaround take?",
    answer:
      "We offer 24-hour turnaround on most orders. Once we pick up your laundry, you can expect it back clean, folded, and delivered by the same time the next day. We'll notify you at every step.",
  },
  {
    question: "How does pickup work?",
    answer:
      "After you schedule a pickup through the app, one of our team members will arrive during your selected window. Just leave your laundry bag at your door (or hand it off in person). We'll weigh it, confirm the order, and take it from there.",
  },
  {
    question: "What items can be washed?",
    answer:
      "We handle everyday laundry — clothes, towels, bed sheets, pillowcases, gym clothes, and more. We don't currently handle dry-clean-only items, leather, suede, or heavily stained/soiled items. When in doubt, check with us first!",
  },
  {
    question: "How do I pay?",
    answer:
      "Payment is handled securely through the app. You'll add a card on file and be charged after your laundry is weighed at pickup. We accept all major credit and debit cards.",
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
    question: "Can I cancel or reschedule a pickup?",
    answer:
      "Yes! You can cancel or reschedule a pickup at any time before our team member is on the way. Just open the app and update your order. There's no fee for cancellations.",
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
      <section className="bg-gradient-to-b from-cyan-50 to-white py-16 sm:py-24">
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
