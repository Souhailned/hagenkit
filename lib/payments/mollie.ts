/**
 * Mollie payment integration (Dutch payment provider)
 * 
 * To activate:
 * 1. Sign up at mollie.com
 * 2. Get API key from dashboard
 * 3. Set MOLLIE_API_KEY in .env.local
 * 4. Install: bun add @mollie/api-client
 */

// import { createMollieClient } from "@mollie/api-client";

export interface CreateSubscriptionData {
  customerId: string;
  planId: string;
  amount: { value: string; currency: string };
  interval: string;
  description: string;
  webhookUrl: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
}

/**
 * Create a Mollie customer (for recurring payments)
 */
export async function createCustomer(name: string, email: string): Promise<string | null> {
  if (!process.env.MOLLIE_API_KEY) {
    console.log("[MOLLIE] API key not set — skipping customer creation");
    return `mock_customer_${Date.now()}`;
  }

  // TODO: Activate when Mollie account is ready
  // const client = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  // const customer = await client.customers.create({ name, email });
  // return customer.id;

  return `mock_customer_${Date.now()}`;
}

/**
 * Create a first payment (for mandate) and redirect to checkout
 */
export async function createFirstPayment(
  customerId: string,
  planId: string,
  redirectUrl: string
): Promise<PaymentResult> {
  if (!process.env.MOLLIE_API_KEY) {
    console.log("[MOLLIE] API key not set — mock payment created");
    return {
      success: true,
      paymentId: `mock_payment_${Date.now()}`,
      checkoutUrl: redirectUrl + "?payment=success",
    };
  }

  // TODO: Activate when Mollie account is ready
  // const client = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  // const payment = await client.payments.create({
  //   amount: { value: "0.01", currency: "EUR" },
  //   customerId,
  //   sequenceType: "first",
  //   description: `Horecagrond ${planId} - Eerste betaling`,
  //   redirectUrl,
  //   webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/mollie`,
  // });

  return {
    success: true,
    paymentId: `mock_payment_${Date.now()}`,
    checkoutUrl: redirectUrl + "?payment=success",
  };
}

/**
 * Create a subscription after first payment succeeds
 */
export async function createSubscription(data: CreateSubscriptionData): Promise<PaymentResult> {
  if (!process.env.MOLLIE_API_KEY) {
    console.log("[MOLLIE] API key not set — mock subscription created");
    return { success: true, paymentId: `mock_sub_${Date.now()}` };
  }

  // TODO: Activate when Mollie account is ready
  // const client = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY });
  // const subscription = await client.customerSubscriptions.create(data);

  return { success: true, paymentId: `mock_sub_${Date.now()}` };
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  customerId: string,
  subscriptionId: string
): Promise<boolean> {
  if (!process.env.MOLLIE_API_KEY) {
    console.log("[MOLLIE] API key not set — mock cancellation");
    return true;
  }

  // TODO: Activate when Mollie account is ready
  return true;
}
