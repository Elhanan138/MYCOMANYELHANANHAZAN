import { NextResponse } from "next/server";
import { db } from "@/db";
import { issues, agents, projects } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await db
      .select({ issue: issues, assignee: agents, project: projects })
      .from(issues)
      .leftJoin(agents, eq(issues.assigneeAgentId, agents.id))
      .leftJoin(projects, eq(issues.projectId, projects.id))
      .where(eq(issues.id, id));

    if (!result.length) {
      return NextResponse.json({ error: "נושא לא נמצא" }, { status: 404 });
    }
    const r = result[0];
    return NextResponse.json({ ...r.issue, assignee: r.assignee, project: r.project });
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
    const {
      title,
      description,
      status,
      priority,
      assigneeAgentId,
      projectId,
      labels,
      billingCode,
    } = body;

    const [updated] = await db
      .update(issues)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(assigneeAgentId !== undefined && { assigneeAgentId }),
        ...(projectId !== undefined && { projectId }),
        ...(labels !== undefined && { labels }),
        ...(billingCode !== undefined && { billingCode }),
        updatedAt: new Date(),
      })
      .where(eq(issues.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(issues).where(eq(issues.id, id));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
