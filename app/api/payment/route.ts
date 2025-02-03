import { NextResponse } from "next/server";
import { sendTokens } from "@/lib/privy/actions";

export async function POST(req: Request) {
  try {
    const { walletId, toAddress, amount } = await req.json();

    const hash = await sendTokens(walletId, toAddress, amount);

    return NextResponse.json({ success: true, hash });
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json({ error: "Payment failed" }, { status: 500 });
  }
}
