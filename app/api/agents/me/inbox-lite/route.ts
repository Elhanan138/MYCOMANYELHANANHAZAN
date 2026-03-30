import { NextResponse } from "next/server";
import { db } from "@/db";
import { approvals, issues, runs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ approvals: [], issues: [], runs: [] });
    }

    const [pendingApprovals, blockedIssues, failedRuns] = await Promise.all([
      db
        .select()
        .from(approvals)
        .where(
          and(
            eq(approvals.companyId, companyId),
            eq(approvals.status, "pending")
          )
        )
        .limit(10),
      db
        .select()
        .from(issues)
        .where(
          and(eq(issues.companyId, companyId), eq(issues.status, "blocked"))
        )
        .limit(10),
      db
        .select()
        .from(runs)
        .where(
          and(eq(runs.companyId, companyId), eq(runs.status, "failed"))
        )
        .limit(10),
    ]);

    return NextResponse.json({
      approvals: pendingApprovals,
      issues: blockedIssues,
      runs: failedRuns,
    });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
