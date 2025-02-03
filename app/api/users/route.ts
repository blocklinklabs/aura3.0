import { NextResponse } from "next/server";
import { db } from "@/lib/db/dbConfig";
import { users } from "@/lib/db/schema";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Create user in database
    const user = await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
