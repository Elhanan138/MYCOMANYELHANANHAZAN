import { NextResponse } from "next/server";
import { db } from "@/db";
import { goals, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select({ goal: goals, owner: agents })
      .from(goals)
      .leftJoin(agents, eq(goals.ownerAgentId, agents.id))
      .where(eq(goals.id, id));

    if (!result.length) {
      return NextResponse.json({ error: "מטרה לא נמצאה" }, { status: 404 });
    }
    const r = result[0];
    return NextResponse.json({ ...r.goal, owner: r.owner });
  } catch (error) {
    console.error("[GET /api/goals/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, status, level, ownerAgentId } = body;

    const update: Record<string, unknown> = { updatedAt: new Date().toISOString() };
    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (status !== undefined) update.status = status;
    if (level !== undefined) update.level = level;
    if (ownerAgentId !== undefined) update.ownerAgentId = ownerAgentId;

    const [updated] = await db
      .update(goals)
      .set(update)
      .where(eq(goals.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/goals/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(goals).where(eq(goals.id, id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[DELETE /api/goals/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
