import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, agents, issues, runs, approvals, costLedger, activityLog } from "@/db/schema";
import { eq, or, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

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

    const [allAgents, allIssues, runningRuns, pendingApprovals, allCosts, recentActivity] =
      await Promise.all([
        db.select().from(agents).where(eq(agents.companyId, company.id)),
        db.select().from(issues).where(eq(issues.companyId, company.id)),
        db.select().from(runs).where(and(eq(runs.companyId, company.id), eq(runs.status, "running"))),
        db.select().from(approvals).where(and(eq(approvals.companyId, company.id), eq(approvals.status, "pending"))),
        db.select({ costUsd: costLedger.costUsd }).from(costLedger).where(eq(costLedger.companyId, company.id)),
        db.select().from(activityLog).where(eq(activityLog.companyId, company.id))
          .orderBy(sql`${activityLog.createdAt} DESC`).limit(10),
      ]);

    const issuesByStatus: Record<string, number> = {};
    for (const issue of allIssues) {
      issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
    }

    const totalCostUsd = allCosts.reduce((s, r) => s + (r.costUsd || 0), 0);

    // Cost by day using SQLite date()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const costByDay = await db
      .select({
        date: sql<string>`date(${costLedger.createdAt})`,
        cost: sql<number>`sum(${costLedger.costUsd})`,
      })
      .from(costLedger)
      .where(sql`${costLedger.companyId} = ${company.id} AND ${costLedger.createdAt} >= ${sevenDaysAgo}`)
      .groupBy(sql`date(${costLedger.createdAt})`)
      .orderBy(sql`date(${costLedger.createdAt})`);

    return NextResponse.json({
      totalAgents: allAgents.length,
      activeAgents: allAgents.filter((a) => a.status === "active").length,
      openIssues: allIssues.filter((i) =>
        ["todo", "in_progress", "in_review", "blocked"].includes(i.status)
      ).length,
      runningRuns: runningRuns.length,
      pendingApprovals: pendingApprovals.length,
      totalCostUsd,
      recentActivity,
      issuesByStatus: Object.entries(issuesByStatus).map(([status, count]) => ({ status, count })),
      costByDay: costByDay.map((r) => ({ date: r.date, cost: r.cost || 0 })),
    });
  } catch (error) {
    console.error("[GET /api/companies/[id]/dashboard]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
