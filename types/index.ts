export type Company = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo: string | null;
  brandColor: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Agent = {
  id: string;
  name: string;
  title: string | null;
  slug: string;
  companyId: string;
  reportsToId: string | null;
  capabilities: string[] | null;
  adapterType: string | null;
  adapterConfig: Record<string, unknown> | null;
  permissions: Record<string, unknown> | null;
  runPolicy: Record<string, unknown> | null;
  status: "active" | "inactive" | "archived";
  budgetUsd: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  companyId: string;
  status: "active" | "completed" | "archived" | "on_hold";
  repoUrl: string | null;
  localFolder: string | null;
  budgetUsd: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type Issue = {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  companyId: string;
  projectId: string | null;
  status: "todo" | "in_progress" | "in_review" | "done" | "cancelled" | "blocked";
  priority: "urgent" | "high" | "medium" | "low" | "no_priority";
  labels: string[] | null;
  assigneeAgentId: string | null;
  parentIssueId: string | null;
  billingCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Joined
  assignee?: Agent | null;
  project?: Project | null;
};

export type IssueComment = {
  id: string;
  issueId: string;
  content: string;
  authorType: "agent" | "board";
  agentId: string | null;
  runId: string | null;
  createdAt: Date;
  agent?: Agent | null;
};

export type Run = {
  id: string;
  agentId: string | null;
  issueId: string | null;
  companyId: string;
  type: "issue" | "routine" | "manual" | "heartbeat";
  status: "queued" | "running" | "done" | "failed" | "cancelled";
  startedAt: Date | null;
  finishedAt: Date | null;
  exitCode: number | null;
  errorMessage: string | null;
  stdout: string | null;
  stderr: string | null;
  transcript: string | null;
  invocation: Record<string, unknown> | null;
  costUsd: string | null;
  createdAt: Date;
  agent?: Agent | null;
  issue?: Issue | null;
};

export type Goal = {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  level: "company" | "team" | "personal";
  status: "active" | "completed" | "archived" | "paused";
  ownerAgentId: string | null;
  parentGoalId: string | null;
  createdAt: Date;
  updatedAt: Date;
  owner?: Agent | null;
};

export type Skill = {
  id: string;
  name: string;
  key: string;
  source: "manual" | "import" | "generated";
  mode: "inline" | "file" | "url";
  content: string | null;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Routine = {
  id: string;
  title: string;
  companyId: string;
  assigneeAgentId: string | null;
  projectId: string | null;
  instructions: string | null;
  triggerType: "cron" | "webhook" | "manual" | "interval";
  triggerConfig: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  assignee?: Agent | null;
  project?: Project | null;
};

export type Approval = {
  id: string;
  companyId: string;
  agentId: string | null;
  type: "budget" | "action" | "deploy" | "other";
  status: "pending" | "approved" | "rejected";
  linkedIssueIds: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  agent?: Agent | null;
};

export type ActivityLog = {
  id: string;
  companyId: string;
  actorType: "agent" | "board" | "system";
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  actor?: Agent | null;
};

export type CostLedger = {
  id: string;
  companyId: string;
  agentId: string | null;
  runId: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: string;
  provider: string | null;
  createdAt: Date;
  agent?: Agent | null;
};

export type DashboardStats = {
  totalAgents: number;
  activeAgents: number;
  openIssues: number;
  runningRuns: number;
  pendingApprovals: number;
  totalCostUsd: number;
  recentActivity: ActivityLog[];
  issuesByStatus: { status: string; count: number }[];
  costByDay: { date: string; cost: number }[];
};

export type SSEEvent = {
  type: "run_update" | "issue_update" | "approval_update" | "activity" | "ping";
  payload: unknown;
};
