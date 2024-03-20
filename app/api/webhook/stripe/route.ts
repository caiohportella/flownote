import prisma from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();

  const sig = headers().get("Stripe-Signature") as string;

  let evt: Stripe.Event;

  try {
    evt = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err: unknown) {
    return new Response("Webhook Error: " + (err as Error).message, {
      status: 400,
    });
  }

  const session = evt.data.object as Stripe.Checkout.Session;

  if (evt.type === "checkout.session.completed") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const custumerID = String(session.customer);
    const user = await prisma.user.findUnique({
      where: {
        stripeCustomerID: custumerID,
      },
    });

    if (!user) throw new Error("User not found");

    await prisma.subscription.create({
      data: {
        StripeSubscriptionID: subscription.id,
        userID: user.ID,
        startDate: subscription.current_period_start,
        endDate: subscription.current_period_end,
        status: subscription.status,
        planID: subscription.items.data[0].plan.id,
        interval: String(subscription.items.data[0].plan.interval),
      },
    });
  }

  if (evt.type === "checkout.session.async_payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );

    await prisma.subscription.update({
      where: {
        StripeSubscriptionID: subscription.id,
      },
      data: {
        planID: subscription.items.data[0].price.id,
        startDate: subscription.current_period_start,
        endDate: subscription.current_period_end,
        status: subscription.status,
      },
    });
  }

  return new Response("Success", { status: 200 });
}
