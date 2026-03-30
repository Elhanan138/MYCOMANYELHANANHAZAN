import { NextResponse } from "next/server";
import { db } from "@/db";
import { projects, companies } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const companySlug = url.searchParams.get("companySlug");

    let cId = companyId;
    if (companySlug) {
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.slug, companySlug));
      cId = company?.id;
    }

    if (!cId) {
      const result = await db.select().from(projects);
      return NextResponse.json(result);
    }

    const result = await db
      .select()
      .from(projects)
      .where(eq(projects.companyId, cId));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, slug, companyId, repoUrl, localFolder, budgetUsd } = body;

    const [project] = await db
      .insert(projects)
      .values({
        id: uuidv4(),
        name,
        description,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        companyId,
        repoUrl: repoUrl || null,
        localFolder: localFolder || null,
        budgetUsd: budgetUsd || null,
        status: "active",
      })
      .returning();

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
