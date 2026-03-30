import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

function getDbUrl(): string {
  // Explicit override (e.g. Turso for persistent production)
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  // Vercel / read-only filesystem → use /tmp (ephemeral but works)
  if (process.env.VERCEL) return "file:/tmp/paperclip.db";
  // Local development → persistent file in ./data/
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return `file:${path.join(dataDir, "paperclip.db")}`;
}

const client = createClient({
  url: getDbUrl(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

const CREATE_TABLES = `
CREATE TABLE IF NOT EXISTS companies (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  slug TEXT NOT NULL UNIQUE, logo TEXT, brand_color TEXT DEFAULT '#6366f1',
  archived_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, title TEXT, slug TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reports_to_id TEXT, capabilities TEXT, adapter_type TEXT DEFAULT 'cli',
  adapter_config TEXT, permissions TEXT, run_policy TEXT,
  status TEXT NOT NULL DEFAULT 'active', budget_usd REAL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, slug TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active', repo_url TEXT, local_folder TEXT,
  budget_usd REAL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS issues (
  id TEXT PRIMARY KEY, identifier TEXT NOT NULL, title TEXT NOT NULL,
  description TEXT, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'todo', priority TEXT NOT NULL DEFAULT 'no_priority',
  labels TEXT, assignee_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  parent_issue_id TEXT, billing_code TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS issue_comments (
  id TEXT PRIMARY KEY, issue_id TEXT NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  content TEXT NOT NULL, author_type TEXT NOT NULL,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  run_id TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS runs (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  issue_id TEXT REFERENCES issues(id) ON DELETE SET NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'manual', status TEXT NOT NULL DEFAULT 'queued',
  started_at TEXT, finished_at TEXT, exit_code INTEGER, error_message TEXT,
  stdout TEXT, stderr TEXT, transcript TEXT, invocation TEXT, cost_usd REAL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  level TEXT NOT NULL DEFAULT 'company', status TEXT NOT NULL DEFAULT 'active',
  owner_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  parent_goal_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, key TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'manual', mode TEXT NOT NULL DEFAULT 'inline',
  content TEXT, company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_skills (
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, skill_id)
);
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY, title TEXT NOT NULL,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assignee_agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
  instructions TEXT, trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_config TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS approvals (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'action', status TEXT NOT NULL DEFAULT 'pending',
  linked_issue_ids TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_type TEXT NOT NULL, actor_id TEXT, action TEXT NOT NULL,
  entity_type TEXT, entity_id TEXT, metadata TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS cost_ledger (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  agent_id TEXT REFERENCES agents(id) ON DELETE SET NULL,
  run_id TEXT REFERENCES runs(id) ON DELETE SET NULL,
  tokens_in INTEGER DEFAULT 0, tokens_out INTEGER DEFAULT 0,
  cost_usd REAL NOT NULL DEFAULT 0, provider TEXT DEFAULT 'anthropic',
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS agent_instructions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  filename TEXT NOT NULL, content TEXT NOT NULL,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS config_revisions (
  id TEXT PRIMARY KEY,
  agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  config TEXT NOT NULL, created_at TEXT NOT NULL
);
`;

let initialized = false;

export async function initDb() {
  if (initialized) return;
  // libsql executes statements one at a time
  const statements = CREATE_TABLES
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  for (const sql of statements) {
    await client.execute(sql);
  }
  initialized = true;
}

// Only kick off init at runtime, not during Next.js build
if (process.env.NEXT_PHASE !== "phase-production-build") {
  initDb().catch(console.error);
}

export * from "./schema";
