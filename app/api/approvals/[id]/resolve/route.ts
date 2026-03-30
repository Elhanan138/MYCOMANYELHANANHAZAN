import { NextResponse } from "next/server";
import { db } from "@/db";
import { approvals } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { decision } = body; // "approved" | "rejected"

    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "החלטה לא תקינה" }, { status: 400 });
    }

    const [updated] = await db
      .update(approvals)
      .set({ status: decision, updatedAt: new Date().toISOString() })
      .where(eq(approvals.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "אישור לא נמצא" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
