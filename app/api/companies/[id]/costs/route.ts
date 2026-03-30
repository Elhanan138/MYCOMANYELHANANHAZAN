import { NextResponse } from "next/server";
import { db } from "@/db";
import { costLedger, companies, agents } from "@/db/schema";
import { eq, or, desc, sum, gte } from "drizzle-orm";
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
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const [ledger, byAgent, byDay, total] = await Promise.all([
      db
        .select({
          entry: costLedger,
          agent: agents,
        })
        .from(costLedger)
        .leftJoin(agents, eq(costLedger.agentId, agents.id))
        .where(eq(costLedger.companyId, company.id))
        .orderBy(desc(costLedger.createdAt))
        .limit(limit),
      db
        .select({
          agentId: costLedger.agentId,
          agentName: agents.name,
          total: sum(costLedger.costUsd),
          runs: sql<number>`count(*)`.as("runs"),
        })
        .from(costLedger)
        .leftJoin(agents, eq(costLedger.agentId, agents.id))
        .where(eq(costLedger.companyId, company.id))
        .groupBy(costLedger.agentId, agents.name),
      db
        .select({
          date: sql<string>`DATE(${costLedger.createdAt})`.as("date"),
          cost: sum(costLedger.costUsd),
        })
        .from(costLedger)
        .where(
          sql`${costLedger.companyId} = ${company.id} AND ${costLedger.createdAt} >= NOW() - INTERVAL '30 days'`
        )
        .groupBy(sql`DATE(${costLedger.createdAt})`)
        .orderBy(sql`DATE(${costLedger.createdAt})`),
      db
        .select({ total: sum(costLedger.costUsd) })
        .from(costLedger)
        .where(eq(costLedger.companyId, company.id)),
    ]);

    return NextResponse.json({
      ledger: ledger.map((r) => ({ ...r.entry, agent: r.agent })),
      byAgent,
      byDay: byDay.map((r) => ({ date: r.date, cost: parseFloat(r.cost || "0") })),
      total: parseFloat(total[0]?.total || "0"),
    });
  } catch (error) {
    console.error("[GET /api/companies/[id]/costs]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
