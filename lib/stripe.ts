import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export const getStripeSession = async ({
  priceID,
  domainURL,
  customerID,
}: {
  priceID: string;
  domainURL: string;
  customerID: string;
}) => {
  const session = await stripe.checkout.sessions.create({
    customer: customerID,
    mode: "subscription",
    billing_address_collection: "auto",
    line_items: [
      {
        price: priceID,
        quantity: 1,
      },
    ],
    payment_method_types: ["card"],
    customer_update: {
      address: "auto",
      name: "auto",
    },

    success_url: `${domainURL}/payment/success`,
    cancel_url: `${domainURL}/payment/cancelled`,
  });

  return session.url as string;
};
