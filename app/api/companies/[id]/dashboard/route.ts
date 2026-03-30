import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  companies,
  agents,
  issues,
  runs,
  approvals,
  costLedger,
  activityLog,
} from "@/db/schema";
import { eq, or, and, gte, sum, count } from "drizzle-orm";
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

    const [
      allAgents,
      allIssues,
      runningRuns,
      pendingApprovals,
      costResult,
      recentActivity,
    ] = await Promise.all([
      db.select().from(agents).where(eq(agents.companyId, company.id)),
      db.select().from(issues).where(eq(issues.companyId, company.id)),
      db
        .select()
        .from(runs)
        .where(
          and(eq(runs.companyId, company.id), eq(runs.status, "running"))
        ),
      db
        .select()
        .from(approvals)
        .where(
          and(
            eq(approvals.companyId, company.id),
            eq(approvals.status, "pending")
          )
        ),
      db
        .select({ total: sum(costLedger.costUsd) })
        .from(costLedger)
        .where(eq(costLedger.companyId, company.id)),
      db
        .select()
        .from(activityLog)
        .where(eq(activityLog.companyId, company.id))
        .orderBy(sql`${activityLog.createdAt} DESC`)
        .limit(10),
    ]);

    // Issues by status
    const issuesByStatus: Record<string, number> = {};
    for (const issue of allIssues) {
      issuesByStatus[issue.status] = (issuesByStatus[issue.status] || 0) + 1;
    }

    // Cost by day (last 7 days)
    const costByDay = await db
      .select({
        date: sql<string>`DATE(${costLedger.createdAt})`.as("date"),
        cost: sum(costLedger.costUsd),
      })
      .from(costLedger)
      .where(
        and(
          eq(costLedger.companyId, company.id),
          gte(costLedger.createdAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        )
      )
      .groupBy(sql`DATE(${costLedger.createdAt})`)
      .orderBy(sql`DATE(${costLedger.createdAt})`);

    const stats = {
      totalAgents: allAgents.length,
      activeAgents: allAgents.filter((a) => a.status === "active").length,
      openIssues: allIssues.filter((i) =>
        ["todo", "in_progress", "in_review", "blocked"].includes(i.status)
      ).length,
      runningRuns: runningRuns.length,
      pendingApprovals: pendingApprovals.length,
      totalCostUsd: parseFloat(costResult[0]?.total || "0"),
      recentActivity,
      issuesByStatus: Object.entries(issuesByStatus).map(([status, count]) => ({
        status,
        count,
      })),
      costByDay: costByDay.map((r) => ({
        date: r.date,
        cost: parseFloat(r.cost || "0"),
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[GET /api/companies/[id]/dashboard]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
