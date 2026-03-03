import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Coffee,
  Leaf,
  Users,
  MapPin,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
};

const values = [
  {
    icon: Heart,
    title: "Quality & Care",
    description:
      "Every item is treated with care. We sort by color, pre-treat stains, and fold everything neatly. Your clothes come back looking and smelling their best.",
  },
  {
    icon: Coffee,
    title: "Community Space",
    description:
      "We're more than a laundromat. Our cafe serves fresh coffee, smoothies, and local baked goods — creating a space where neighbors connect.",
  },
  {
    icon: Leaf,
    title: "Eco-Friendly",
    description:
      "Our high-efficiency commercial machines clean better and dry faster while using less water and energy. Good laundry shouldn't cost the earth.",
  },
  {
    icon: BookOpen,
    title: "Giving Back",
    description:
      "We partner with the LaundryCares Foundation to provide a literacy zone where kids can read and play while families do laundry.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About {BRAND.name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            A laundromat and cafe built for the Gainesville community
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Our Story
          </h2>
          <div className="mt-6 space-y-4 text-muted-foreground">
            <p>
              {BRAND.name} opened in April 2022 with a vision from owner Maritza
              Padgett: combine a modern, full-service laundromat with a
              welcoming cafe — all under one roof.
            </p>
            <p>
              What started as a dream to merge two passions — great coffee and
              clean laundry — has grown into a 6,000-square-foot community hub
              in the heart of Gainesville. We offer self-service washers and
              dryers, professional drop-off wash & fold, and a
              fully-stocked cafe with fresh coffee, tea, smoothies, and locally
              sourced baked goods.
            </p>
            <p>
              We&apos;re proud to serve UF students, families, and residents
              across Gainesville. With over 230 reviews and a 4.6-star rating,
              we&apos;re committed to being the best laundry experience in
              town — and now we&apos;re making it even easier with online
              scheduling and drop-off wash & fold.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Our Mission
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            To create a clean, comfortable space where doing laundry feels less
            like a chore and more like a break. Whether you visit in person or
            drop off your laundry, we want your clothes — and your day — to feel
            fresh.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-foreground sm:text-3xl">
            What We Stand For
          </h2>

          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <Card key={value.title} className="border-0 bg-muted/30 shadow-none">
                <CardContent className="pt-2">
                  <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-brand-ocean/10">
                    <value.icon className="size-6 text-brand-ocean" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Location & Hours */}
      <section className="bg-muted/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-brand-ocean/10">
            <MapPin className="size-8 text-brand-ocean" />
          </div>
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Visit Us
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground">
            {BRAND.address}
          </p>
          <p className="mt-2 text-muted-foreground">
            Open {BRAND.hours}
          </p>
          <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-sm">
              Free parking, free WiFi, RV-friendly, attendant on duty
            </span>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Conveniently located for UF campus, Midtown, Downtown, Butler
            Plaza, and surrounding neighborhoods.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center sm:py-20">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
            Come See Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Stop by for a coffee and a wash, or drop off your laundry and
            let us handle the rest.
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
