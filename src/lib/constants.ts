// ============================================================
// Brand Configuration - Change these to rebrand the entire app
// ============================================================

export const BRAND = {
  name: "Fresh Laundry & Cafe",
  tagline: "Wash. Sip. Relax.",
  description:
    "Gainesville's favorite laundromat and cafe — all under one roof. Self-service, drop-off wash & fold, or pickup & delivery, plus fresh coffee, smoothies, and local baked goods. 6,000 sq ft of clean, community-driven comfort.",
  location: "Gainesville, FL",
  address: "3830 SW 13th St, Gainesville, FL 32608",
  email: "hello@freshlaundryandcafe.com",
  phone: "(352) 451-4358",
  url: "https://freshlaundryandcafe.com",
  hours: "7:00 AM – 10:00 PM, 7 days a week",
  owner: "Maritza Padgett",
  openedYear: 2022,
  googleMapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1734!2d-82.3406!3d29.6171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88e8a3ad297a9c89%3A0x5c7e68b33ff00e3e!2sFresh%20Laundry%20%26%20Cafe!5e0!3m2!1sen!2sus!4v1700000000000",
  googleMapsUrl:
    "https://www.google.com/maps/place/Fresh+Laundry+%26+Cafe/@29.6171,-82.3406,17z",
  social: {
    instagram: "https://www.instagram.com/freshlaundryandcafe/",
    yelp: "https://www.yelp.com/biz/fresh-laundry-and-cafe-no-title",
    facebook: "https://www.facebook.com/freshlaundryandcafe/",
  },
  stats: {
    rating: 4.6,
    reviewCount: 230,
    machineCount: 100,
    sqft: 6000,
  },
} as const;

export const PRICING = {
  // Drop-off wash & fold
  washFoldPerLbCents: 125, // $1.25/lb
  washFoldMinLbs: 15,
  // Self-service washers (by machine size)
  selfServiceWashers: [
    { size: "Small", priceCents: 250 },
    { size: "Medium", priceCents: 350 },
    { size: "Large", priceCents: 450 },
    { size: "Extra Large", priceCents: 600 },
  ],
  pickupDeliveryFeeCents: 500, // $5.00 delivery fee
  referralCreditCents: 500, // $5.00 credit for referrer and referee
} as const;

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "picked_up",
  "washing",
  "ready",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  picked_up: "Picked Up",
  washing: "Washing",
  ready: "Ready",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  picked_up: "bg-indigo-100 text-indigo-800",
  washing: "bg-purple-100 text-purple-800",
  ready: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export const PAYMENT_STATUSES = [
  "not_required",
  "pending",
  "processing",
  "paid",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** @deprecated Use calculateWashFoldTotal. Kept for backend compat. */
export function calculateOrderTotal(
  weightLbs: number,
  creditCents: number = 0
): { baseFee: number; weightCharge: number; credits: number; total: number } {
  const baseFee = 0;
  const weightCharge = Math.round(weightLbs * PRICING.washFoldPerLbCents);
  const subtotal = baseFee + weightCharge;
  const credits = Math.min(creditCents, subtotal);
  const total = subtotal - credits;
  return { baseFee, weightCharge, credits, total };
}

export function calculateWashFoldTotal(
  weightLbs: number,
  creditCents: number = 0
): { weightCharge: number; credits: number; total: number } {
  const weightCharge = Math.round(weightLbs * PRICING.washFoldPerLbCents);
  const credits = Math.min(creditCents, weightCharge);
  const total = weightCharge - credits;
  return { weightCharge, credits, total };
}
