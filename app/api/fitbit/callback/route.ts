import { NextResponse } from "next/server";
import { connectWearableDevice } from "@/lib/db/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { error: "No authorization code provided" },
      { status: 400 }
    );
  }

  try {
    // Exchange the authorization code for access token
    const tokenResponse = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/fitbit/callback`,
      }),
    });

    const tokens = await tokenResponse.json();

    // Get user's Fitbit profile
    const profileResponse = await fetch(
      "https://api.fitbit.com/1/user/-/profile.json",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    const profile = await profileResponse.json();

    // Store the connection in the database
    await connectWearableDevice({
      userId: "current-user-id", // You'll need to get this from your auth system
      deviceType: "fitbit",
      deviceId: profile.user.encodedId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    });

    // Redirect back to dashboard
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    );
  } catch (error) {
    console.error("Error connecting Fitbit:", error);
    return NextResponse.json(
      { error: "Failed to connect Fitbit" },
      { status: 500 }
    );
  }
}
