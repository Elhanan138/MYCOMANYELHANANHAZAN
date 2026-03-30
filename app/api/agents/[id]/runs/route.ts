import { NextResponse } from "next/server";
import { db } from "@/db";
import { runs, agents } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");

    const [agent] = await db
      .select()
      .from(agents)
      .where(or(eq(agents.id, id), eq(agents.slug, id)));

    if (!agent) {
      return NextResponse.json({ error: "סוכן לא נמצא" }, { status: 404 });
    }

    const result = await db
      .select()
      .from(runs)
      .where(eq(runs.agentId, agent.id))
      .orderBy(desc(runs.createdAt))
      .limit(limit);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { companyId, type, invocation } = body;

    const [agent] = await db
      .select()
      .from(agents)
      .where(or(eq(agents.id, id), eq(agents.slug, id)));

    if (!agent) {
      return NextResponse.json({ error: "סוכן לא נמצא" }, { status: 404 });
    }

    const [run] = await db
      .insert(runs)
      .values({
        id: uuidv4(),
        agentId: agent.id,
        companyId: companyId || agent.companyId,
        type: type || "manual",
        status: "queued",
        invocation: invocation || null,
      })
      .returning();

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
