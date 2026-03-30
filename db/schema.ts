import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const companies = sqliteTable("companies", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  brandColor: text("brand_color").default("#6366f1"),
  archivedAt: text("archived_at"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const agents = sqliteTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title"),
  slug: text("slug").notNull(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  reportsToId: text("reports_to_id"),
  // JSON fields stored as text with auto-parse
  capabilities: text("capabilities", { mode: "json" }).$type<string[]>(),
  adapterType: text("adapter_type").default("cli"),
  adapterConfig: text("adapter_config", { mode: "json" }).$type<Record<string, unknown>>(),
  permissions: text("permissions", { mode: "json" }).$type<Record<string, unknown>>(),
  runPolicy: text("run_policy", { mode: "json" }).$type<Record<string, unknown>>(),
  status: text("status").default("active").notNull(),
  budgetUsd: real("budget_usd"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  status: text("status").default("active").notNull(),
  repoUrl: text("repo_url"),
  localFolder: text("local_folder"),
  budgetUsd: real("budget_usd"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const issues = sqliteTable("issues", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  status: text("status").default("todo").notNull(),
  priority: text("priority").default("no_priority").notNull(),
  labels: text("labels", { mode: "json" }).$type<string[]>(),
  assigneeAgentId: text("assignee_agent_id").references(() => agents.id, { onDelete: "set null" }),
  parentIssueId: text("parent_issue_id"),
  billingCode: text("billing_code"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const issueComments = sqliteTable("issue_comments", {
  id: text("id").primaryKey(),
  issueId: text("issue_id").notNull().references(() => issues.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorType: text("author_type").notNull(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  runId: text("run_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const runs = sqliteTable("runs", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  issueId: text("issue_id").references(() => issues.id, { onDelete: "set null" }),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  type: text("type").default("manual").notNull(),
  status: text("status").default("queued").notNull(),
  startedAt: text("started_at"),
  finishedAt: text("finished_at"),
  exitCode: integer("exit_code"),
  errorMessage: text("error_message"),
  stdout: text("stdout"),
  stderr: text("stderr"),
  transcript: text("transcript"),
  invocation: text("invocation", { mode: "json" }).$type<Record<string, unknown>>(),
  costUsd: real("cost_usd"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  level: text("level").default("company").notNull(),
  status: text("status").default("active").notNull(),
  ownerAgentId: text("owner_agent_id").references(() => agents.id, { onDelete: "set null" }),
  parentGoalId: text("parent_goal_id"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const skills = sqliteTable("skills", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  source: text("source").default("manual").notNull(),
  mode: text("mode").default("inline").notNull(),
  content: text("content"),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const agentSkills = sqliteTable("agent_skills", {
  agentId: text("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  skillId: text("skill_id").notNull().references(() => skills.id, { onDelete: "cascade" }),
});

export const routines = sqliteTable("routines", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  assigneeAgentId: text("assignee_agent_id").references(() => agents.id, { onDelete: "set null" }),
  projectId: text("project_id").references(() => projects.id, { onDelete: "set null" }),
  instructions: text("instructions"),
  triggerType: text("trigger_type").default("manual").notNull(),
  triggerConfig: text("trigger_config", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const approvals = sqliteTable("approvals", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  type: text("type").default("action").notNull(),
  status: text("status").default("pending").notNull(),
  linkedIssueIds: text("linked_issue_ids", { mode: "json" }).$type<string[]>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const activityLog = sqliteTable("activity_log", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  actorType: text("actor_type").notNull(),
  actorId: text("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const costLedger = sqliteTable("cost_ledger", {
  id: text("id").primaryKey(),
  companyId: text("company_id").notNull().references(() => companies.id, { onDelete: "cascade" }),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "set null" }),
  runId: text("run_id").references(() => runs.id, { onDelete: "set null" }),
  tokensIn: integer("tokens_in").default(0),
  tokensOut: integer("tokens_out").default(0),
  costUsd: real("cost_usd").notNull().default(0),
  provider: text("provider").default("anthropic"),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const agentInstructions = sqliteTable("agent_instructions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const configRevisions = sqliteTable("config_revisions", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  config: text("config", { mode: "json" }).$type<Record<string, unknown>>(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});
