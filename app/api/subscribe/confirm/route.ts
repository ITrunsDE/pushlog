import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  const confirmToken = await db.subscriberConfirmToken.findUnique({
    where: { token },
    include: { subscriber: { include: { product: true } } },
  });

  if (!confirmToken) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 }
    );
  }

  // Mark subscriber as confirmed
  await db.subscriber.update({
    where: { id: confirmToken.subscriber.id },
    data: { confirmedAt: new Date() },
  });

  // Delete token
  await db.subscriberConfirmToken.delete({
    where: { id: confirmToken.id },
  });

  // Redirect to changelog with success message
  const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL}/changelog/${confirmToken.subscriber.product.slug}?confirmed=true`;
  return NextResponse.redirect(redirectUrl);
}
