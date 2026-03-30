import { NextResponse } from "next/server";
import { db } from "@/db";
import {
  companies,
  agents,
  projects,
  issues,
  goals,
  routines,
  skills,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";

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
      allProjects,
      allIssues,
      allGoals,
      allRoutines,
      allSkills,
    ] = await Promise.all([
      db.select().from(agents).where(eq(agents.companyId, company.id)),
      db.select().from(projects).where(eq(projects.companyId, company.id)),
      db.select().from(issues).where(eq(issues.companyId, company.id)),
      db.select().from(goals).where(eq(goals.companyId, company.id)),
      db.select().from(routines).where(eq(routines.companyId, company.id)),
      db.select().from(skills).where(eq(skills.companyId, company.id)),
    ]);

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      company,
      agents: allAgents,
      projects: allProjects,
      issues: allIssues,
      goals: allGoals,
      routines: allRoutines,
      skills: allSkills,
    };

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${company.slug}-export-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/companies/[id]/exports]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
