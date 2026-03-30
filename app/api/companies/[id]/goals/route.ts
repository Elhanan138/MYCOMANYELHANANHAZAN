import { NextResponse } from "next/server";
import { db } from "@/db";
import { goals, companies, agents } from "@/db/schema";
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
      .select({ goal: goals, owner: agents })
      .from(goals)
      .leftJoin(agents, eq(goals.ownerAgentId, agents.id))
      .where(eq(goals.companyId, company.id))
      .orderBy(desc(goals.createdAt));

    return NextResponse.json(result.map((r) => ({ ...r.goal, owner: r.owner })));
  } catch (error) {
    console.error("[GET /api/companies/[id]/goals]", error);
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
    const { name, description, level, ownerAgentId, parentGoalId } = body;

    const [goal] = await db
      .insert(goals)
      .values({
        id: uuidv4(),
        name,
        description,
        companyId: company.id,
        level: level || "company",
        status: "active",
        ownerAgentId: ownerAgentId || null,
        parentGoalId: parentGoalId || null,
      })
      .returning();

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("[POST /api/companies/[id]/goals]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
