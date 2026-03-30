import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [agent] = await db
      .select()
      .from(agents)
      .where(or(eq(agents.id, id), eq(agents.slug, id)));

    if (!agent) {
      return NextResponse.json({ error: "סוכן לא נמצא" }, { status: 404 });
    }
    return NextResponse.json(agent);
  } catch (error) {
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
    const {
      name,
      title,
      slug,
      reportsToId,
      capabilities,
      adapterType,
      adapterConfig,
      permissions,
      runPolicy,
      status,
      budgetUsd,
    } = body;

    const [updated] = await db
      .update(agents)
      .set({
        ...(name !== undefined && { name }),
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(reportsToId !== undefined && { reportsToId }),
        ...(capabilities !== undefined && { capabilities }),
        ...(adapterType !== undefined && { adapterType }),
        ...(adapterConfig !== undefined && { adapterConfig }),
        ...(permissions !== undefined && { permissions }),
        ...(runPolicy !== undefined && { runPolicy }),
        ...(status !== undefined && { status }),
        ...(budgetUsd !== undefined && { budgetUsd }),
        updatedAt: new Date().toISOString(),
      })
      .where(or(eq(agents.id, id), eq(agents.slug, id)))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
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
      .update(agents)
      .set({ status: "archived" })
      .where(or(eq(agents.id, id), eq(agents.slug, id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
