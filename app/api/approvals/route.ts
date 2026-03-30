import { NextResponse } from "next/server";
import { db } from "@/db";
import { approvals, agents, companies } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const companySlug = url.searchParams.get("companySlug");

    let cId = companyId;
    if (companySlug && !cId) {
      const [c] = await db.select().from(companies).where(eq(companies.slug, companySlug));
      cId = c?.id;
    }

    let query = db
      .select({ approval: approvals, agent: agents })
      .from(approvals)
      .leftJoin(agents, eq(approvals.agentId, agents.id));

    const result = cId
      ? await query.where(eq(approvals.companyId, cId))
      : await query;

    return NextResponse.json(result.map((r) => ({ ...r.approval, agent: r.agent })));
  } catch (error) {
    console.error("[GET /api/approvals]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { companyId, agentId, type, linkedIssueIds } = body;

    if (!companyId || !type) {
      return NextResponse.json({ error: "חסרים שדות חובה" }, { status: 400 });
    }

    const [approval] = await db
      .insert(approvals)
      .values({
        id: uuidv4(),
        companyId,
        agentId: agentId || null,
        type,
        status: "pending",
        linkedIssueIds: linkedIssueIds || null,
      })
      .returning();

    return NextResponse.json(approval, { status: 201 });
  } catch (error) {
    console.error("[POST /api/approvals]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
