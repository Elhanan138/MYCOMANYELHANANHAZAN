import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents, companies } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const companySlug = url.searchParams.get("companySlug");

    let result;
    if (companyId || companySlug) {
      // Find company first
      let cId = companyId;
      if (companySlug) {
        const [company] = await db
          .select()
          .from(companies)
          .where(eq(companies.slug, companySlug));
        cId = company?.id;
      }
      if (!cId) return NextResponse.json([]);
      result = await db.select().from(agents).where(eq(agents.companyId, cId));
    } else {
      result = await db.select().from(agents);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      title,
      slug,
      companyId,
      reportsToId,
      capabilities,
      adapterType,
      adapterConfig,
      permissions,
      runPolicy,
      budgetUsd,
    } = body;

    const [agent] = await db
      .insert(agents)
      .values({
        id: uuidv4(),
        name,
        title,
        slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
        companyId,
        reportsToId: reportsToId || null,
        capabilities: capabilities || [],
        adapterType: adapterType || "cli",
        adapterConfig: adapterConfig || null,
        permissions: permissions || null,
        runPolicy: runPolicy || null,
        status: "active",
        budgetUsd: budgetUsd || null,
      })
      .returning();

    return NextResponse.json(agent, { status: 201 });
  } catch (error) {
    console.error("[POST /api/agents]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
