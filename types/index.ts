export type Company = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  logo: string | null;
  brandColor: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  status: string;
  budgetUsd: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  companyId: string;
  status: string;
  repoUrl: string | null;
  localFolder: string | null;
  budgetUsd: number | null;
  createdAt: string;
  updatedAt: string;
};

export type Issue = {
  id: string;
  identifier: string;
  title: string;
  description: string | null;
  companyId: string;
  projectId: string | null;
  status: string;
  priority: string;
  labels: string[] | null;
  assigneeAgentId: string | null;
  parentIssueId: string | null;
  billingCode: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Agent | null;
  project?: Project | null;
};

export type IssueComment = {
  id: string;
  issueId: string;
  content: string;
  authorType: string;
  agentId: string | null;
  runId: string | null;
  createdAt: string;
  agent?: Agent | null;
};

export type Run = {
  id: string;
  agentId: string | null;
  issueId: string | null;
  companyId: string;
  type: string;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  exitCode: number | null;
  errorMessage: string | null;
  stdout: string | null;
  stderr: string | null;
  transcript: string | null;
  invocation: Record<string, unknown> | null;
  costUsd: number | null;
  createdAt: string;
  agent?: Agent | null;
  issue?: Issue | null;
};

export type Goal = {
  id: string;
  name: string;
  description: string | null;
  companyId: string;
  level: string;
  status: string;
  ownerAgentId: string | null;
  parentGoalId: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: Agent | null;
};

export type Skill = {
  id: string;
  name: string;
  key: string;
  source: string;
  mode: string;
  content: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type Routine = {
  id: string;
  title: string;
  companyId: string;
  assigneeAgentId: string | null;
  projectId: string | null;
  instructions: string | null;
  triggerType: string;
  triggerConfig: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  assignee?: Agent | null;
  project?: Project | null;
};

export type Approval = {
  id: string;
  companyId: string;
  agentId: string | null;
  type: string;
  status: string;
  linkedIssueIds: string[] | null;
  createdAt: string;
  updatedAt: string;
  agent?: Agent | null;
};

export type ActivityLog = {
  id: string;
  companyId: string;
  actorType: string;
  actorId: string | null;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor?: Agent | null;
};

export type CostLedger = {
  id: string;
  companyId: string;
  agentId: string | null;
  runId: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: number;
  provider: string | null;
  createdAt: string;
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
