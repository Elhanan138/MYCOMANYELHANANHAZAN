import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  decimal,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

// Enums
export const agentStatusEnum = pgEnum("agent_status", [
  "active",
  "inactive",
  "archived",
]);
export const projectStatusEnum = pgEnum("project_status", [
  "active",
  "completed",
  "archived",
  "on_hold",
]);
export const issueStatusEnum = pgEnum("issue_status", [
  "todo",
  "in_progress",
  "in_review",
  "done",
  "cancelled",
  "blocked",
]);
export const priorityEnum = pgEnum("priority", [
  "urgent",
  "high",
  "medium",
  "low",
  "no_priority",
]);
export const runStatusEnum = pgEnum("run_status", [
  "queued",
  "running",
  "done",
  "failed",
  "cancelled",
]);
export const runTypeEnum = pgEnum("run_type", [
  "issue",
  "routine",
  "manual",
  "heartbeat",
]);
export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "archived",
  "paused",
]);
export const goalLevelEnum = pgEnum("goal_level", [
  "company",
  "team",
  "personal",
]);
export const skillModeEnum = pgEnum("skill_mode", ["inline", "file", "url"]);
export const skillSourceEnum = pgEnum("skill_source", [
  "manual",
  "import",
  "generated",
]);
export const triggerTypeEnum = pgEnum("trigger_type", [
  "cron",
  "webhook",
  "manual",
  "interval",
]);
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);
export const approvalTypeEnum = pgEnum("approval_type", [
  "budget",
  "action",
  "deploy",
  "other",
]);
export const actorTypeEnum = pgEnum("actor_type", ["agent", "board", "system"]);
export const authorTypeEnum = pgEnum("author_type", ["agent", "board"]);

// Tables
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  brandColor: text("brand_color").default("#6366f1"),
  archivedAt: timestamp("archived_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  title: text("title"),
  slug: text("slug").notNull(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  reportsToId: uuid("reports_to_id"),
  capabilities: text("capabilities").array(),
  adapterType: text("adapter_type").default("cli"),
  adapterConfig: jsonb("adapter_config"),
  permissions: jsonb("permissions"),
  runPolicy: jsonb("run_policy"),
  status: agentStatusEnum("status").default("active").notNull(),
  budgetUsd: decimal("budget_usd", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  status: projectStatusEnum("status").default("active").notNull(),
  repoUrl: text("repo_url"),
  localFolder: text("local_folder"),
  budgetUsd: decimal("budget_usd", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const issues = pgTable("issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  identifier: text("identifier").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  status: issueStatusEnum("status").default("todo").notNull(),
  priority: priorityEnum("priority").default("no_priority").notNull(),
  labels: text("labels").array(),
  assigneeAgentId: uuid("assignee_agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  parentIssueId: uuid("parent_issue_id"),
  billingCode: text("billing_code"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const issueComments = pgTable("issue_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  authorType: authorTypeEnum("author_type").notNull(),
  agentId: uuid("agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  runId: uuid("run_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const runs = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  issueId: uuid("issue_id").references(() => issues.id, {
    onDelete: "set null",
  }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  type: runTypeEnum("type").default("manual").notNull(),
  status: runStatusEnum("status").default("queued").notNull(),
  startedAt: timestamp("started_at"),
  finishedAt: timestamp("finished_at"),
  exitCode: integer("exit_code"),
  errorMessage: text("error_message"),
  stdout: text("stdout"),
  stderr: text("stderr"),
  transcript: text("transcript"),
  invocation: jsonb("invocation"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  level: goalLevelEnum("level").default("company").notNull(),
  status: goalStatusEnum("status").default("active").notNull(),
  ownerAgentId: uuid("owner_agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  parentGoalId: uuid("parent_goal_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  key: text("key").notNull(),
  source: skillSourceEnum("source").default("manual").notNull(),
  mode: skillModeEnum("mode").default("inline").notNull(),
  content: text("content"),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const agentSkills = pgTable("agent_skills", {
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
});

export const routines = pgTable("routines", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  assigneeAgentId: uuid("assignee_agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  projectId: uuid("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  instructions: text("instructions"),
  triggerType: triggerTypeEnum("trigger_type").default("manual").notNull(),
  triggerConfig: jsonb("trigger_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  type: approvalTypeEnum("type").default("action").notNull(),
  status: approvalStatusEnum("status").default("pending").notNull(),
  linkedIssueIds: text("linked_issue_ids").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const activityLog = pgTable("activity_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  actorType: actorTypeEnum("actor_type").notNull(),
  actorId: uuid("actor_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: uuid("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const costLedger = pgTable("cost_ledger", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  agentId: uuid("agent_id").references(() => agents.id, {
    onDelete: "set null",
  }),
  runId: uuid("run_id").references(() => runs.id, { onDelete: "set null" }),
  tokensIn: integer("tokens_in").default(0),
  tokensOut: integer("tokens_out").default(0),
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 }).notNull(),
  provider: text("provider").default("openai"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const agentInstructions = pgTable("agent_instructions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const configRevisions = pgTable("config_revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .notNull()
    .references(() => agents.id, { onDelete: "cascade" }),
  config: jsonb("config").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
