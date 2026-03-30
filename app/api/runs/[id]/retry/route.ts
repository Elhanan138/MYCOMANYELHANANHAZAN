import { NextResponse } from "next/server";
import { db } from "@/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [original] = await db.select().from(runs).where(eq(runs.id, id));

    if (!original) {
      return NextResponse.json({ error: "ריצה לא נמצאה" }, { status: 404 });
    }

    const [newRun] = await db
      .insert(runs)
      .values({
        id: uuidv4(),
        agentId: original.agentId,
        issueId: original.issueId,
        companyId: original.companyId,
        type: original.type,
        status: "queued",
        invocation: original.invocation,
      })
      .returning();

    return NextResponse.json(newRun, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
