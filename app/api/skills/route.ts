import { NextResponse } from "next/server";
import { db } from "@/db";
import { skills, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
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
      const result = await db.select().from(skills);
      return NextResponse.json(result);
    }

    const result = await db.select().from(skills).where(eq(skills.companyId, cId));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, key, mode, source, content, companyId } = body;

    const [skill] = await db
      .insert(skills)
      .values({
        id: uuidv4(),
        name,
        key: key || name.toLowerCase().replace(/\s+/g, "_"),
        mode: mode || "inline",
        source: source || "manual",
        content: content || null,
        companyId,
      })
      .returning();

    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
