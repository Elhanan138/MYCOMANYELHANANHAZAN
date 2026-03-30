import { NextResponse } from "next/server";
import { db } from "@/db";
import { approvals, agents } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select({ approval: approvals, agent: agents })
      .from(approvals)
      .leftJoin(agents, eq(approvals.agentId, agents.id))
      .where(eq(approvals.id, id));

    if (!result.length) {
      return NextResponse.json({ error: "אישור לא נמצא" }, { status: 404 });
    }
    const r = result[0];
    return NextResponse.json({ ...r.approval, agent: r.agent });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
