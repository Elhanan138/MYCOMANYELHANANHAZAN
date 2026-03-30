import { NextResponse } from "next/server";
import { db } from "@/db";
import { issues, companies, agents, projects } from "@/db/schema";
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
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const projectId = url.searchParams.get("projectId");
    const assigneeId = url.searchParams.get("assigneeId");

    let query = db
      .select({
        issue: issues,
        assignee: agents,
        project: projects,
      })
      .from(issues)
      .leftJoin(agents, eq(issues.assigneeAgentId, agents.id))
      .leftJoin(projects, eq(issues.projectId, projects.id))
      .where(eq(issues.companyId, company.id))
      .$dynamic();

    const result = await db
      .select({
        issue: issues,
        assignee: agents,
        project: projects,
      })
      .from(issues)
      .leftJoin(agents, eq(issues.assigneeAgentId, agents.id))
      .leftJoin(projects, eq(issues.projectId, projects.id))
      .where(eq(issues.companyId, company.id))
      .orderBy(desc(issues.createdAt));

    const mapped = result
      .filter((r) => {
        if (status && r.issue.status !== status) return false;
        if (priority && r.issue.priority !== priority) return false;
        if (projectId && r.issue.projectId !== projectId) return false;
        if (assigneeId && r.issue.assigneeAgentId !== assigneeId) return false;
        return true;
      })
      .map((r) => ({
        ...r.issue,
        assignee: r.assignee,
        project: r.project,
      }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error("[GET /api/companies/[id]/issues]", error);
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
      description,
      status,
      priority,
      projectId,
      assigneeAgentId,
      labels,
      billingCode,
      parentIssueId,
    } = body;

    // Generate identifier
    const existingCount = await db
      .select()
      .from(issues)
      .where(eq(issues.companyId, company.id));

    const number = existingCount.length + 1;
    const identifier = `${company.slug.toUpperCase()}-${number}`;

    const [issue] = await db
      .insert(issues)
      .values({
        id: uuidv4(),
        identifier,
        title,
        description,
        companyId: company.id,
        projectId: projectId || null,
        status: status || "todo",
        priority: priority || "no_priority",
        labels: labels || [],
        assigneeAgentId: assigneeAgentId || null,
        parentIssueId: parentIssueId || null,
        billingCode: billingCode || null,
      })
      .returning();

    return NextResponse.json(issue, { status: 201 });
  } catch (error) {
    console.error("[POST /api/companies/[id]/issues]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
