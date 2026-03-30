import { NextResponse } from "next/server";
import { db } from "@/db";
import { routines, companies, agents, projects } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

async function getCompanyByIdOrSlug(id: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(or(eq(companies.id, id), eq(companies.slug, id)));
  return company;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyByIdOrSlug(id);
    if (!company) {
      return NextResponse.json({ error: "חברה לא נמצאה" }, { status: 404 });
    }

    const result = await db
      .select({ routine: routines, assignee: agents, project: projects })
      .from(routines)
      .leftJoin(agents, eq(routines.assigneeAgentId, agents.id))
      .leftJoin(projects, eq(routines.projectId, projects.id))
      .where(eq(routines.companyId, company.id))
      .orderBy(desc(routines.createdAt));

    return NextResponse.json(
      result.map((r) => ({ ...r.routine, assignee: r.assignee, project: r.project }))
    );
  } catch (error) {
    console.error("[GET /api/companies/[id]/routines]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyByIdOrSlug(id);
    if (!company) {
      return NextResponse.json({ error: "חברה לא נמצאה" }, { status: 404 });
    }

    const body = await req.json();
    const {
      title,
      assigneeAgentId,
      projectId,
      instructions,
      triggerType,
      triggerConfig,
    } = body;

    const [routine] = await db
      .insert(routines)
      .values({
        id: uuidv4(),
        title,
        companyId: company.id,
        assigneeAgentId: assigneeAgentId || null,
        projectId: projectId || null,
        instructions: instructions || null,
        triggerType: triggerType || "manual",
        triggerConfig: triggerConfig || null,
      })
      .returning();

    return NextResponse.json(routine, { status: 201 });
  } catch (error) {
    console.error("[POST /api/companies/[id]/routines]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
