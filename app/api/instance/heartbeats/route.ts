import { NextResponse } from "next/server";
import { db } from "@/db";
import { agents, companies, runs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const allAgents = await db
      .select({ agent: agents, company: companies })
      .from(agents)
      .leftJoin(companies, eq(agents.companyId, companies.id));

    const result = await Promise.all(
      allAgents.map(async ({ agent, company }) => {
        const runPolicy = agent.runPolicy as Record<string, unknown> | null;
        const heartbeatEnabled = runPolicy?.heartbeatEnabled === true;
        const intervalSec = (runPolicy?.heartbeatIntervalSec as number) || 3600;

        let lastRun: string | null = null;
        if (heartbeatEnabled) {
          const [lastHeartbeatRun] = await db
            .select({ startedAt: runs.startedAt })
            .from(runs)
            .where(eq(runs.agentId, agent.id))
            .orderBy(desc(runs.startedAt))
            .limit(1);
          lastRun = lastHeartbeatRun?.startedAt?.toISOString() || null;
        }

        return {
          agentId: agent.id,
          agentName: agent.name,
          companyName: company?.name || "—",
          enabled: heartbeatEnabled,
          intervalSec,
          lastRun,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("[GET /api/instance/heartbeats]", error);
    return NextResponse.json({ error: "שגיאה בשרת" }, { status: 500 });
  }
}
