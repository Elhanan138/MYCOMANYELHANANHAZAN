import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const result = await db
      .select()
      .from(companies)
      .where(isNull(companies.archivedAt))
      .orderBy(companies.createdAt);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/companies]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, slug, brandColor } = body;

    if (!name || !slug) {
      return NextResponse.json({ error: "שם וסלאג נדרשים" }, { status: 400 });
    }

    const [company] = await db
      .insert(companies)
      .values({
        id: uuidv4(),
        name,
        description,
        slug,
        brandColor: brandColor || "#6366f1",
      })
      .returning();

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("[POST /api/companies]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
