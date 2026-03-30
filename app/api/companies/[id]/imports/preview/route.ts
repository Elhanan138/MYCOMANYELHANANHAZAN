import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      preview: body,
      counts: {
        agents: body.agents?.length || 0,
        projects: body.projects?.length || 0,
        issues: body.issues?.length || 0,
        goals: body.goals?.length || 0,
        routines: body.routines?.length || 0,
        skills: body.skills?.length || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "קובץ לא תקין" }, { status: 400 });
  }
}
