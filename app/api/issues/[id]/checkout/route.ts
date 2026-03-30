import { NextResponse } from "next/server";
import { db } from "@/db";
import { issues, runs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { agentId } = body;

    const [issue] = await db.select().from(issues).where(eq(issues.id, id));
    if (!issue) {
      return NextResponse.json({ error: "נושא לא נמצא" }, { status: 404 });
    }

    // Update issue status
    await db
      .update(issues)
      .set({ status: "in_progress", assigneeAgentId: agentId, updatedAt: new Date() })
      .where(eq(issues.id, id));

    // Create a run
    const [run] = await db
      .insert(runs)
      .values({
        id: uuidv4(),
        agentId,
        issueId: id,
        companyId: issue.companyId,
        type: "issue",
        status: "queued",
        invocation: { issueId: id, issueIdentifier: issue.identifier },
      })
      .returning();

    return NextResponse.json({ success: true, run });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
