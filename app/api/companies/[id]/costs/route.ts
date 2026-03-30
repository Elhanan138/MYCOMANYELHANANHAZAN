import { NextResponse } from "next/server";
import { db } from "@/db";
import { costLedger, companies, agents } from "@/db/schema";
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
    const limit = parseInt(url.searchParams.get("limit") || "100");

    const ledger = await db
      .select({
        entry: costLedger,
        agent: agents,
      })
      .from(costLedger)
      .leftJoin(agents, eq(costLedger.agentId, agents.id))
      .where(eq(costLedger.companyId, company.id))
      .orderBy(desc(costLedger.createdAt))
      .limit(limit);

    // Aggregate by agent in JS (SQLite sum works but let's keep it simple)
    const agentMap: Record<string, { agentId: string; agentName: string | null; total: number }> = {};
    for (const row of ledger) {
      const aid = row.entry.agentId || "__none__";
      if (!agentMap[aid]) {
        agentMap[aid] = { agentId: aid, agentName: row.agent?.name || null, total: 0 };
      }
      agentMap[aid].total += row.entry.costUsd || 0;
    }

    const total = ledger.reduce((s, r) => s + (r.entry.costUsd || 0), 0);

    // Cost by day (last 30 days) using SQLite date()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const byDayRows = await db
      .select({
        date: sql<string>`date(${costLedger.createdAt})`,
        cost: sql<number>`sum(${costLedger.costUsd})`,
      })
      .from(costLedger)
      .where(
        sql`${costLedger.companyId} = ${company.id} AND ${costLedger.createdAt} >= ${thirtyDaysAgo}`
      )
      .groupBy(sql`date(${costLedger.createdAt})`)
      .orderBy(sql`date(${costLedger.createdAt})`);

    return NextResponse.json({
      ledger: ledger.map((r) => ({ ...r.entry, agent: r.agent })),
      byAgent: Object.values(agentMap),
      byDay: byDayRows.map((r) => ({ date: r.date, cost: r.cost || 0 })),
      total,
    });
  } catch (error) {
    console.error("[GET /api/companies/[id]/costs]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
