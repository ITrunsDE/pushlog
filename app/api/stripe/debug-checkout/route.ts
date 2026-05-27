import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userWithCustomer = await db.user.findFirst({
      where: { stripeCustomerId: { not: null } },
    });

    if (!userWithCustomer?.stripeCustomerId) {
      return NextResponse.json(
        { error: "No user with stripeCustomerId found" },
        { status: 404 }
      );
    }

    console.log("[DEBUG] Checking customer:", userWithCustomer.stripeCustomerId);

    const subscriptions = await stripe.subscriptions.list({
      customer: userWithCustomer.stripeCustomerId,
      limit: 1,
    });

    console.log("[DEBUG] Subscriptions found:", subscriptions.data.length);
    console.log("[DEBUG] Subscription data:", JSON.stringify(subscriptions.data[0], null, 2));

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        message: "No subscriptions found",
        customer: userWithCustomer.stripeCustomerId,
        currentPlan: userWithCustomer.plan,
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0]?.price.id;

    console.log("[DEBUG] Price ID:", priceId);
    console.log("[DEBUG] STRIPE_SOLO_PRICE_ID:", process.env.STRIPE_SOLO_PRICE_ID);
    console.log("[DEBUG] STRIPE_PRO_PRICE_ID:", process.env.STRIPE_PRO_PRICE_ID);

    const planMap: { [key: string]: string } = {
      [process.env.STRIPE_SOLO_PRICE_ID!]: "solo",
      [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
    };

    const mappedPlan = planMap[priceId!] || "free";

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        priceId,
        mappedPlan,
      },
      expectedPlan: mappedPlan,
      currentUserPlan: userWithCustomer.plan,
      soloPrice: process.env.STRIPE_SOLO_PRICE_ID,
      proPrice: process.env.STRIPE_PRO_PRICE_ID,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
