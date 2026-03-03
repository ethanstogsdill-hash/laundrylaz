import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Create or retrieve a Stripe Customer for a user.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  existingCustomerId?: string | null
): Promise<string> {
  if (existingCustomerId) {
    return existingCustomerId;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { source: "fresh-laundry-cafe" },
  });

  return customer.id;
}

/**
 * Create a PaymentIntent for an order.
 */
export async function createPaymentIntent(params: {
  amountCents: number;
  customerId: string;
  orderId: string;
  description?: string;
}): Promise<Stripe.PaymentIntent> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: "usd",
    customer: params.customerId,
    metadata: {
      order_id: params.orderId,
    },
    description:
      params.description || `Fresh Laundry Cafe Order ${params.orderId.slice(0, 8)}`,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}

/**
 * Retrieve a PaymentIntent by ID.
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
}
