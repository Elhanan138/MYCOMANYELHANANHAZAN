import { NextResponse } from "next/server";
import { db, initDb } from "@/db";
import { companies } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await initDb();
    const { id } = await params;
    const [company] = await db
      .select()
      .from(companies)
      .where(or(eq(companies.id, id), eq(companies.slug, id)));

    if (!company) {
      return NextResponse.json({ error: "חברה לא נמצאה" }, { status: 404 });
    }
    return NextResponse.json(company);
  } catch (error) {
    console.error("[GET /api/companies/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, slug, brandColor } = body;

    const [updated] = await db
      .update(companies)
      .set({ name, description, slug, brandColor, updatedAt: new Date().toISOString() })
      .where(or(eq(companies.id, id), eq(companies.slug, id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /api/companies/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db
      .update(companies)
      .set({ archivedAt: new Date().toISOString() })
      .where(or(eq(companies.id, id), eq(companies.slug, id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/companies/[id]]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
