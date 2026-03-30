import { spawn } from "child_process";
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
    .set({ status: "running", startedAt: new Date() })
    .where(eq(runs.id, runId));

  const process = spawn(config.command, config.args || [], {
    env: { ...process.env, ...(config.env || {}) },
    cwd: config.cwd,
    shell: true,
  });

  let stdout = "";
  let stderr = "";

  process.stdout?.on("data", (data: Buffer) => {
    stdout += data.toString();
  });

  process.stderr?.on("data", (data: Buffer) => {
    stderr += data.toString();
  });

  const timeout = config.timeout || 300000; // 5 minutes default
  const timer = setTimeout(() => {
    process.kill("SIGTERM");
  }, timeout);

  process.on("close", async (code: number | null) => {
    clearTimeout(timer);
    const status = code === 0 ? "done" : "failed";

    await db
      .update(runs)
      .set({
        status,
        finishedAt: new Date(),
        exitCode: code,
        stdout: stdout.slice(0, 50000),
        stderr: stderr.slice(0, 50000),
        errorMessage: code !== 0 ? `Process exited with code ${code}` : null,
      })
      .where(eq(runs.id, runId));
  });
}
