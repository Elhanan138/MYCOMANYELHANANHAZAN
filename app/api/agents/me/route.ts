import { NextResponse } from "next/server";

// Stub - in a real system this would return the current agent context
export async function GET() {
  return NextResponse.json({ id: null, type: "board" });
}
