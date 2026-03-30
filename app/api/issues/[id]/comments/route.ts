import { NextResponse } from "next/server";
import { db } from "@/db";
import { issueComments, agents } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select({ comment: issueComments, agent: agents })
      .from(issueComments)
      .leftJoin(agents, eq(issueComments.agentId, agents.id))
      .where(eq(issueComments.issueId, id))
      .orderBy(asc(issueComments.createdAt));

    return NextResponse.json(result.map((r) => ({ ...r.comment, agent: r.agent })));
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
    const { content, authorType, agentId, runId } = body;

    const [comment] = await db
      .insert(issueComments)
      .values({
        id: uuidv4(),
        issueId: id,
        content,
        authorType: authorType || "board",
        agentId: agentId || null,
        runId: runId || null,
      })
      .returning();

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
