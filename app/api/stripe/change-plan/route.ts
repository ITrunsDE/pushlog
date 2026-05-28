import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { targetPlan } = body as { targetPlan?: string };

    if (!targetPlan || !["solo", "pro"].includes(targetPlan)) {
      return NextResponse.json(
        { error: "Invalid target plan" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.plan === "free") {
      return NextResponse.json(
        { error: "Free users must use checkout" },
        { status: 400 }
      );
    }

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    // Get active subscription
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 400 }
      );
    }

    const subscription = subscriptions.data[0];
    const subscriptionItemId = subscription.items.data[0]?.id;

    if (!subscriptionItemId) {
      return NextResponse.json(
        { error: "No subscription item found" },
        { status: 400 }
      );
    }

    const newPriceId =
      targetPlan === "solo"
        ? process.env.STRIPE_SOLO_PRICE_ID!
        : process.env.STRIPE_PRO_PRICE_ID!;

    // Update subscription
    await stripe.subscriptions.update(subscription.id, {
      items: [
        {
          id: subscriptionItemId,
          price: newPriceId,
        },
      ],
      proration_behavior: "always_invoice",
    });

    // Update DB immediately (webhook will also update)
    await db.user.update({
      where: { id: user.id },
      data: { plan: targetPlan },
    });

    revalidatePath("/dashboard/settings");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change plan error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
