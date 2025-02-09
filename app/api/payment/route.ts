import { NextResponse } from "next/server";
import { sendTokens } from "@/lib/privy/actions";

// Check if we're in production environment
const isProduction = process.env.NODE_ENV === "production";

// Validate environment setup
function validateEnvironment() {
  const requiredEnvVars = [
    "WALLET_PRIVATE_KEY_BASE",
    "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
    return false;
  }

  return true;
}

export async function POST(req: Request) {
  try {
    // In development, proceed even if env vars are missing
    if (isProduction && !validateEnvironment()) {
      return NextResponse.json(
        {
          error: "Payment service is not properly configured",
          details: "Missing required environment variables",
        },
        { status: 503 }
      );
    }

    const { walletId, toAddress, amount } = await req.json();

    // Validate input parameters
    if (!walletId || !toAddress || !amount) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
          details: "Missing required fields: walletId, toAddress, or amount",
        },
        { status: 400 }
      );
    }

    // Attempt to send tokens
    const hash = await sendTokens(walletId, toAddress, amount);

    if (!hash) {
      throw new Error("Transaction failed - no hash returned");
    }

    return NextResponse.json({
      success: true,
      hash,
      message: "Payment processed successfully",
    });
  } catch (error: any) {
    console.error("Payment error:", error);

    // Determine if it's a wallet authorization error
    if (error.message?.includes("Invalid wallet authorization")) {
      return NextResponse.json(
        {
          error: "Payment authorization failed",
          details: "Invalid wallet configuration",
          message: isProduction
            ? "Payment service is temporarily unavailable"
            : error.message,
        },
        { status: 401 }
      );
    }

    // Generic error response
    return NextResponse.json(
      {
        error: "Payment failed",
        message: isProduction ? "An unexpected error occurred" : error.message,
      },
      { status: 500 }
    );
  }
}
