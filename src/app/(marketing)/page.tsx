import Link from "next/link";
import Image from "next/image";
import {
  CalendarDays,
  Shirt,
  Clock,
  Coffee,
  Leaf,
  Star,
  ArrowRight,
  CheckCircle,
  Wifi,
  MapPin,
  BookOpen,
  Car,
  Instagram,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BRAND, PRICING, formatCents } from "@/lib/constants";
import { PricingCalculator } from "@/components/features/pricing-calculator";

const steps = [
  {
    icon: Shirt,
    title: "Drop It Off",
    description:
      "Bring your laundry to our 6,000 sq ft location. We're open 7 days a week, 7 AM to 10 PM.",
  },
  {
    icon: CalendarDays,
    title: "We Wash & Fold",
    description:
      "Our team washes it in commercial-grade machines, carefully folds everything, and has it ready for you.",
  },
  {
    icon: Coffee,
    title: "Grab a Coffee",
    description:
      "Enjoy our full cafe while you wait, or come back later to pick up your fresh, clean laundry.",
  },
];

const features = [
  {
    icon: Shirt,
    title: "Drop-off Wash & Fold",
    description:
      "Drop off your laundry and we'll wash, dry, and fold it for you. Just come back and pick it up!",
  },
  {
    icon: Coffee,
    title: "Full Cafe On-Site",
    description:
      "Fresh coffee, tea, smoothies, and local baked goods. Grab a bite while your clothes spin.",
  },
  {
    icon: Clock,
    title: "Open 7AM – 10PM",
    description:
      "Open 7 days a week with hours that fit any schedule. Self-service or drop-off.",
  },
  {
    icon: Leaf,
    title: "100+ Machines",
    description:
      "Over 100 commercial-grade washers & dryers in multiple sizes. No coins needed — card payment.",
  },
];

const amenities = [
  { icon: Wifi, label: "Free WiFi" },
  { icon: Coffee, label: "Fresh Cafe" },
  { icon: BookOpen, label: "Kids Literacy Zone" },
  { icon: Car, label: "Free Parking & RV Friendly" },
];

const testimonials = [
  {
    name: "Sarah M.",
    context: "UF Student",
    text: "The drop-off wash & fold service is a game-changer. I used to waste my whole Sunday doing laundry. Now I just drop it off and focus on studying. Clothes come back perfectly folded!",
    rating: 5,
  },
  {
    name: "David R.",
    context: "Local Resident",
    text: "Nicest, newest and cleanest laundromat I've ever been to. The cafe has good drinks & snacks, staff is super friendly and attentive. Love the kids reading area too.",
    rating: 5,
  },
  {
    name: "Jessica L.",
    context: "Gainesville Regular",
    text: "This place is more than a laundromat — it's a whole experience. Great coffee, fast machines, free WiFi. I actually look forward to laundry day now. The referral program is a nice bonus too!",
    rating: 5,
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden">
        {/* Background image overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f2460]/95 via-[#1B3B8C]/90 to-[#0f2460]/95" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <Image
              src="/logo.jpg"
              alt="Fresh Laundry & Cafe"
              width={180}
              height={180}
              className="mx-auto mb-8 rounded-full shadow-2xl border-4 border-white/20"
              priority
            />
            <Badge
              variant="secondary"
              className="mb-6 bg-white/15 text-white border-white/20 backdrop-blur-sm"
            >
              <MapPin className="size-3 mr-1" />
              3830 SW 13th St, Gainesville, FL
            </Badge>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Wash. Sip.{" "}
              <span className="text-brand-amber">Relax.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80 sm:text-xl">
              {BRAND.description}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-brand-amber hover:bg-brand-amber/90 text-white"
              >
                <Link href="/signup">
                  Get Started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
              >
                <Link href="/pricing">See Pricing</Link>
              </Button>
            </div>

            {/* Stats bar */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/70">
              <div className="flex items-center gap-1.5">
                <Star className="size-4 fill-brand-amber text-brand-amber" />
                <span className="text-sm font-medium text-white">
                  {BRAND.stats.rating}
                </span>
                <span className="text-sm">({BRAND.stats.reviewCount}+ reviews)</span>
              </div>
              <div className="text-sm">{BRAND.stats.machineCount}+ machines</div>
              <div className="text-sm">{BRAND.stats.sqft.toLocaleString()} sq ft</div>
              <div className="text-sm">Open 7 days</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Amenities Bar ─── */}
      <section className="border-b bg-white py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 px-4">
          {amenities.map((a) => (
            <div
              key={a.label}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
            >
              <a.icon className="size-4 text-brand-ocean" />
              {a.label}
            </div>
          ))}
        </div>
      </section>

      {/* ─── Photo Gallery Strip ─── */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            More Than a Laundromat
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg text-muted-foreground">
            A {BRAND.stats.sqft.toLocaleString()} sq ft space designed for comfort, community, and clean clothes
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {[
              {
                src: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&q=80",
                alt: "Modern washing machines",
                label: "100+ Machines",
              },
              {
                src: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
                alt: "Fresh cafe coffee",
                label: "Fresh Cafe",
              },
              {
                src: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&q=80",
                alt: "Clean folded laundry",
                label: "Wash & Fold",
              },
              {
                src: "https://images.unsplash.com/photo-1604881991720-f91add269bed?w=600&q=80",
                alt: "Cozy reading nook",
                label: "Kids Zone",
              },
            ].map((photo) => (
              <div key={photo.label} className="group relative overflow-hidden rounded-xl">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={600}
                  height={400}
                  className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-sm font-semibold text-white">
                  {photo.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How Drop-off Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Let us do the work — just drop it off and pick it up.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-brand-ocean/10">
                  <step.icon className="size-8 text-brand-ocean" />
                </div>
                <span className="mb-2 block text-sm font-semibold text-brand-ocean">
                  Step {i + 1}
                </span>
                <h3 className="text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Section ─── */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              No subscriptions. No hidden fees. Just pay for what you wash.
            </p>
          </div>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-2">
            <Card className="mx-auto w-full max-w-md border-brand-ocean/20">
              <CardContent className="space-y-6 pt-2">
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {formatCents(PRICING.perLbRateCents)}
                    <span className="text-lg font-normal text-muted-foreground">
                      /lb
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    + {formatCents(PRICING.baseFeeCents)} drop-off fee
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    "Drop-off wash & fold service",
                    "Wash, dry & fold by hand",
                    "Commercial-grade machines",
                    "24-hour turnaround",
                    `${PRICING.minimumWeightLbs} lb minimum order`,
                    `Refer a friend, both get ${formatCents(PRICING.referralCreditCents)} off`,
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm"
                    >
                      <CheckCircle className="size-4 shrink-0 text-brand-amber" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardContent>
            </Card>

            <PricingCalculator />
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why {BRAND.name}?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need, all under one roof
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="border-0 bg-muted/30 shadow-none"
              >
                <CardContent className="pt-2">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-ocean/10">
                    <feature.icon className="size-6 text-brand-ocean" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-muted/30 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Loved by Gainesville
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              <Star className="mr-1 inline size-4 fill-brand-amber text-brand-amber" />
              {BRAND.stats.rating} stars with {BRAND.stats.reviewCount}+ reviews
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-0 bg-white shadow-sm">
                <CardContent className="space-y-4 pt-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-brand-amber text-brand-amber"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.context}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Social proof links */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href={BRAND.social.yelp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-red-300 hover:text-red-600"
            >
              <Star className="size-4" />
              Read on Yelp
              <ExternalLink className="size-3" />
            </a>
            <a
              href={BRAND.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-pink-300 hover:text-pink-600"
            >
              <Instagram className="size-4" />
              Follow on Instagram
              <ExternalLink className="size-3" />
            </a>
          </div>
        </div>
      </section>

      {/* ─── Location & Map ─── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Find Us
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Visit us in person — self-service or drop-off
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Map */}
            <div className="overflow-hidden rounded-xl border shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3467.8!2d-82.37!3d29.63!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e8a3ad297a9c89%3A0x5c7e68b33ff00e3e!2sFresh%20Laundry%20%26%20Cafe!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Fresh Laundry & Cafe location"
              />
            </div>

            {/* Info card */}
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-4 pt-2">
                  <h3 className="text-lg font-semibold">
                    Fresh Laundry & Cafe
                  </h3>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ocean" />
                      <div>
                        <p className="font-medium">{BRAND.address}</p>
                        <a
                          href={BRAND.googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-ocean hover:underline"
                        >
                          Get directions
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="mt-0.5 size-4 shrink-0 text-brand-ocean" />
                      <div>
                        <p className="font-medium">Hours</p>
                        <p className="text-muted-foreground">{BRAND.hours}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Coffee className="mt-0.5 size-4 shrink-0 text-brand-ocean" />
                      <div>
                        <p className="font-medium">Services</p>
                        <p className="text-muted-foreground">
                          Self-service laundry, drop-off wash & fold,
                          full cafe
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Social links */}
              <Card>
                <CardContent className="pt-2">
                  <h3 className="mb-3 text-sm font-semibold">Follow Us</h3>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href={BRAND.social.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <Instagram className="size-4 text-pink-500" />
                      Instagram
                    </a>
                    <a
                      href={BRAND.social.yelp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <Star className="size-4 text-red-500" />
                      Yelp
                    </a>
                    <a
                      href={BRAND.social.snapchat}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors hover:bg-muted"
                    >
                      <ExternalLink className="size-4 text-yellow-500" />
                      Snapchat
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Button asChild className="w-full" size="lg">
                <a href={`tel:${BRAND.phone}`}>
                  Call Us: {BRAND.phone}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2460] to-[#1B3B8C]" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to skip laundry day?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Visit us at 3830 SW 13th St — do it yourself or drop it off and
            we&apos;ll handle the rest. Fresh laundry and a great cup of coffee are waiting.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="bg-white text-brand-ocean hover:bg-white/90"
            >
              <Link href="/signup">
                Get Started
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/30 text-white hover:bg-white/10"
            >
              <a
                href={BRAND.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MapPin className="size-4" />
                Get Directions
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
