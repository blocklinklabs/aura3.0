import { NextResponse } from "next/server";
import { privyServer } from "@/lib/privy/server";
import { db } from "@/lib/db/dbConfig";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    // Create server wallet
    const wallet = await privyServer.walletApi.create({
      chainType: "ethereum",
    });

    // Update user record with wallet info
    await db
      .update(users)
      .set({
        walletId: wallet.id,
        walletAddress: wallet.address,
      })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("Wallet creation error:", error);
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 }
    );
  }
}
