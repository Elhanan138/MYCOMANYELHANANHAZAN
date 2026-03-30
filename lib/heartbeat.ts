import { db } from "@/db";
import { runs, agents, routines } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

const intervals: Map<string, NodeJS.Timeout> = new Map();

export async function startHeartbeat(routineId: string) {
  if (intervals.has(routineId)) return;

  const [routine] = await db
    .select()
    .from(routines)
    .where(eq(routines.id, routineId))
    .limit(1);

  if (!routine || !routine.assigneeAgentId) return;

  let intervalMs = 60000;
  if (routine.triggerType === "interval" && routine.triggerConfig) {
    const config = routine.triggerConfig as Record<string, unknown>;
    if (typeof config.intervalMs === "number") intervalMs = config.intervalMs;
  }

  const tick = async () => {
    try {
      const [agent] = await db
        .select()
        .from(agents)
        .where(and(eq(agents.id, routine.assigneeAgentId!), eq(agents.status, "active")))
        .limit(1);
      if (!agent) return;

      await db.insert(runs).values({
        id: uuidv4(),
        agentId: agent.id,
        companyId: routine.companyId,
        type: "heartbeat",
        status: "queued",
        invocation: { routineId: routine.id, title: routine.title },
      });
    } catch (err) {
      console.error("[heartbeat] error", err);
    }
  };

  const handle = setInterval(tick, intervalMs);
  intervals.set(routineId, handle);
}

export function stopHeartbeat(routineId: string) {
  const handle = intervals.get(routineId);
  if (handle) { clearInterval(handle); intervals.delete(routineId); }
}

export function stopAllHeartbeats() {
  for (const [id] of intervals) stopHeartbeat(id);
}
