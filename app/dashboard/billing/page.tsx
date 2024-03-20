import { StripePortalButton, StripeSubscriptionButton } from "@/components/submit-buttons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import prisma from "@/lib/db";
import { getStripeSession, stripe } from "@/lib/stripe";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { CheckCircle2 } from "lucide-react";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

const featureItems = [
  { name: "Unlimited notes", description: "Create as many notes as you want" },
  {
    name: "Priority support",
    description: "Get priority support for any issues",
  },
  {
    name: "Advanced features",
    description: "Access advanced features for power users",
  },
  {
    name: "Customizable themes",
    description: "Personalize your note-taking experience",
  },
  {
    name: "Collaboration tools",
    description: "Work together with others on notes",
  },
];

const getData = async (userID: string) => {
  noStore();
  const data = await prisma.subscription.findUnique({
    where: {
      userID: userID,
    },
    select: {
      status: true,
      user: {
        select: {
          stripeCustomerID: true,
        },
      },
    },
  });

  return data;
};

const BillingPage = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const data = await getData(user?.id as string);

  const createSubscription = async () => {
    "use server";

    const dbUser = await prisma.user.findUnique({
      where: {
        ID: user?.id,
      },
      select: {
        stripeCustomerID: true,
      },
    });

    if (!dbUser?.stripeCustomerID)
      throw new Error("No stripe customer ID found");

    const subscriptionURL = await getStripeSession({
      customerID: dbUser?.stripeCustomerID as string,
      domainURL: "http://localhost:3000",
      priceID: process.env.STRIPE_PRICE_ID as string,
    });

    return redirect(subscriptionURL);
  };

  const createCustomerPortal = async () => {
    "use server";

    const session = await stripe.billingPortal.sessions.create({
      customer: data?.user.stripeCustomerID as string,
      return_url: "http://localhost:3000/dashboard",
    });

    return redirect(session.url);
  };

  if (data?.status === "active") {
    return (
      <div className="grid items-start gap-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-3xl md:text-4xl">Subscription</h1>
            <p className="text-lg text-muted-foreground">
              Settings regarding your subscription
            </p>
          </div>
        </div>

        <Card className="w-full lg:w-2/3">
          <CardHeader>
            <CardTitle>Edit Subscription</CardTitle>
            <CardDescription>
              Click on the button below to change your payment details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createCustomerPortal}>
              <StripePortalButton />
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <Card className="flex flex-col">
        <CardContent className="py-8">
          <div>
            <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-primary/10 text-primary">
              Monthly
            </h3>
          </div>

          <div className="mt-4 flex items-baseline text-6xl font-extrabold">
            R$20<span className="ml-1 text-2xl text-muted-foreground">/mo</span>
          </div>
          <p className="mt-5 text-lg text-muted-foreground">
            Unlimited notes for a fair price
          </p>
        </CardContent>
        <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-secondary rounded-lg m-1 space-y-6 sm:p-10 sm:pt-6">
          <ul className="space-y-4">
            {featureItems.map((item, index) => (
              <li key={index} className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
                <p className="ml-3 text-base">{item.name}</p>
              </li>
            ))}
          </ul>

          <form className="w-full" action={createSubscription}>
            <StripeSubscriptionButton />
          </form>
        </div>
      </Card>
    </div>
  );
};

export default BillingPage;
