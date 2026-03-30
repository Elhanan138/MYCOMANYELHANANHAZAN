import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLog, companies, agents } from "@/db/schema";
import { eq, or, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";

async function getCompanyByIdOrSlug(id: string) {
  const [company] = await db
    .select()
    .from(companies)
    .where(or(eq(companies.id, id), eq(companies.slug, id)));
  return company;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const company = await getCompanyByIdOrSlug(id);
    if (!company) {
      return NextResponse.json({ error: "חברה לא נמצאה" }, { status: 404 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    const result = await db
      .select({
        log: activityLog,
        actor: agents,
      })
      .from(activityLog)
      .leftJoin(agents, eq(activityLog.actorId, agents.id))
      .where(eq(activityLog.companyId, company.id))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);

    const mapped = result.map((r) => ({
      ...r.log,
      actor: r.actor,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[GET /api/companies/[id]/activity]", error);
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
    const { actorType, actorId, action, entityType, entityId, metadata } = body;

    const [log] = await db
      .insert(activityLog)
      .values({
        companyId: company.id,
        actorType,
        actorId: actorId || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        metadata: metadata || null,
      })
      .returning();

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("[POST /api/companies/[id]/activity]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
