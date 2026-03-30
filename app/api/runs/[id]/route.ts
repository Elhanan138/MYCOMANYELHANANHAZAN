import { NextResponse } from "next/server";
import { db } from "@/db";
import { runs, agents, issues } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select({ run: runs, agent: agents, issue: issues })
      .from(runs)
      .leftJoin(agents, eq(runs.agentId, agents.id))
      .leftJoin(issues, eq(runs.issueId, issues.id))
      .where(eq(runs.id, id));

    if (!result.length) {
      return NextResponse.json({ error: "ריצה לא נמצאה" }, { status: 404 });
    }
    const r = result[0];
    return NextResponse.json({ ...r.run, agent: r.agent, issue: r.issue });
  } catch (error) {
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
    const { status, exitCode, errorMessage, stdout, stderr, transcript, costUsd } = body;

    const [updated] = await db
      .update(runs)
      .set({
        ...(status !== undefined && { status }),
        ...(exitCode !== undefined && { exitCode }),
        ...(errorMessage !== undefined && { errorMessage }),
        ...(stdout !== undefined && { stdout }),
        ...(stderr !== undefined && { stderr }),
        ...(transcript !== undefined && { transcript }),
        ...(costUsd !== undefined && { costUsd }),
        ...(status === "running" && { startedAt: new Date().toISOString() }),
        ...(["done", "failed", "cancelled"].includes(status) && { finishedAt: new Date().toISOString() }),
      })
      .where(eq(runs.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
