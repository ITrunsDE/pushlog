import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  try {
    console.log(`[Webhook] Event type: ${event.type}`);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const customerId = session.customer;

        console.log("[Webhook] Session data:", {
          customerId,
          subscription: session.subscription,
          paymentStatus: session.payment_status,
        });

        if (!customerId) {
          console.error("No customer ID in checkout session");
          break;
        }

        if (!session.subscription) {
          console.warn("[Webhook] No subscription in session, skipping plan update");
          break;
        }

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer:", customerId);
          break;
        }

        try {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription
          );

          const planMap: { [key: string]: string } = {
            [process.env.STRIPE_SOLO_PRICE_ID!]: "solo",
            [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
          };

          const priceId = subscription.items.data[0]?.price.id;
          const plan = planMap[priceId] || "free";

          await db.user.update({
            where: { id: user.id },
            data: { plan },
          });

          console.log(`Updated user ${user.id} plan to ${plan}`);
        } catch (subError) {
          console.error("Error retrieving subscription:", subError);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        console.log("[Webhook] Subscription event:", {
          type: event.type,
          subscriptionId: subscription.id,
          customerId,
          status: subscription.status,
        });

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer:", customerId);
          break;
        }

        if (subscription.status === "active") {
          const planMap: { [key: string]: string } = {
            [process.env.STRIPE_SOLO_PRICE_ID!]: "solo",
            [process.env.STRIPE_PRO_PRICE_ID!]: "pro",
          };

          const priceId = subscription.items.data[0]?.price.id;
          const plan = planMap[priceId] || "free";

          await db.user.update({
            where: { id: user.id },
            data: { plan },
          });

          console.log(`Updated user ${user.id} plan to ${plan} (via subscription event)`);

          if (plan === "pro") {
            // Reactivate all products when upgrading to Pro
            await db.product.updateMany({
              where: { userId: user.id },
              data: { isActive: true },
            });
          } else {
            // Lock all products except the first when downgrading from Pro
            const products = await db.product.findMany({
              where: { userId: user.id },
              orderBy: { createdAt: "asc" },
              select: { id: true },
            });
            if (products.length > 1) {
              const toDeactivate = products.slice(1).map((p) => p.id);
              await db.product.updateMany({
                where: { id: { in: toDeactivate } },
                data: { isActive: false },
              });
              console.log(`Deactivated ${toDeactivate.length} extra products for user ${user.id}`);
            }
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;

        const user = await db.user.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (!user) {
          console.error("User not found for customer:", customerId);
          break;
        }

        await db.user.update({
          where: { id: user.id },
          data: { plan: "free" },
        });

        // Lock extra products on cancellation
        const products = await db.product.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "asc" },
          select: { id: true },
        });
        if (products.length > 1) {
          const toDeactivate = products.slice(1).map((p) => p.id);
          await db.product.updateMany({
            where: { id: { in: toDeactivate } },
            data: { isActive: false },
          });
        }

        console.log(`Updated user ${user.id} plan to free`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
