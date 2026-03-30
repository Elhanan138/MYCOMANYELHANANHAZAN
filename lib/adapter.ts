import { spawn as nodeSpawn } from "child_process";
import { db } from "@/db";
import { runs } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface AdapterConfig {
  command: string;
  args?: string[];
  env?: Record<string, string>;
  cwd?: string;
  timeout?: number;
}

export async function executeRun(runId: string, config: AdapterConfig): Promise<void> {
  await db
    .update(runs)
    .set({ status: "running", startedAt: new Date().toISOString() })
    .where(eq(runs.id, runId));

  const child = nodeSpawn(config.command, config.args || [], {
    env: { ...process.env, ...(config.env || {}) },
    cwd: config.cwd,
    shell: true,
  });

  let stdout = "";
  let stderr = "";

  child.stdout?.on("data", (data: Buffer) => { stdout += data.toString(); });
  child.stderr?.on("data", (data: Buffer) => { stderr += data.toString(); });

  const timeout = config.timeout || 300000;
  const timer = setTimeout(() => child.kill("SIGTERM"), timeout);

  child.on("close", async (code: number | null) => {
    clearTimeout(timer);
    const status = code === 0 ? "done" : "failed";
    await db
      .update(runs)
      .set({
        status,
        finishedAt: new Date().toISOString(),
        exitCode: code,
        stdout: stdout.slice(0, 50000),
        stderr: stderr.slice(0, 50000),
        errorMessage: code !== 0 ? `Process exited with code ${code}` : null,
      })
      .where(eq(runs.id, runId));
  });
}
