import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  try {
    const userWithCustomer = await db.user.findFirst({
      where: { stripeCustomerId: { not: null } },
    });

    if (!userWithCustomer) {
      return NextResponse.json(
        { error: "No user with stripeCustomerId found" },
        { status: 404 }
      );
    }

    console.log("[TEST] Found user with stripeCustomerId:", {
      id: userWithCustomer.id,
      email: userWithCustomer.email,
      stripeCustomerId: userWithCustomer.stripeCustomerId,
      currentPlan: userWithCustomer.plan,
    });

    const user = await db.user.update({
      where: { id: userWithCustomer.id },
      data: { plan: "solo" },
    });

    console.log(`[TEST] Updated user ${user.id} plan to solo`);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Test webhook error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
