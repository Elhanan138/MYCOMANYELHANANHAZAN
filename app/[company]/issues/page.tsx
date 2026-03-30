"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime, getStatusBgColor, getPriorityColor } from "@/lib/utils";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import {
  CircleDot,
  Plus,
  Filter,
  List,
  Columns,
  MoreHorizontal,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingList } from "@/components/shared/LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Issue, Agent, Project } from "@/types";

const STATUSES = [
  "todo",
  "in_progress",
  "in_review",
  "blocked",
  "done",
  "cancelled",
];

export default function IssuesPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const [issues, setIssues] = useState<Issue[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "board">("list");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");

  const [newIssue, setNewIssue] = useState({
    title: "",
    description: "",
    status: "todo",
    priority: "no_priority",
    assigneeAgentId: "",
    projectId: "",
  });

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const companyRes = await fetch(`/api/companies/${companySlug}`);
      const company = await companyRes.json();
      setCompanyId(company.id);

      const [issuesRes, agentsRes, projectsRes] = await Promise.all([
        fetch(`/api/companies/${company.id}/issues`),
        fetch(`/api/agents?companyId=${company.id}`),
        fetch(`/api/projects?companyId=${company.id}`),
      ]);

      setIssues(await issuesRes.json());
      setAgents(await agentsRes.json());
      setProjects(await projectsRes.json());
    } catch (e) {
      toast.error("שגיאה בטעינת נושאים");
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createIssue = async () => {
    if (!newIssue.title.trim()) {
      toast.error("כותרת נדרשת");
      return;
    }
    try {
      const res = await fetch(`/api/companies/${companyId}/issues`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newIssue,
          assigneeAgentId: newIssue.assigneeAgentId || null,
          projectId: newIssue.projectId || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("נושא נוצר בהצלחה");
      setCreateOpen(false);
      setNewIssue({
        title: "",
        description: "",
        status: "todo",
        priority: "no_priority",
        assigneeAgentId: "",
        projectId: "",
      });
      fetchAll();
    } catch {
      toast.error("שגיאה ביצירת נושא");
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (filterStatus && issue.status !== filterStatus) return false;
    if (
      searchQuery &&
      !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !issue.identifier.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  // Board view grouped by status
  const boardColumns = STATUSES.map((status) => ({
    status,
    issues: filteredIssues.filter((i) => i.status === status),
  }));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <CircleDot className="h-5 w-5 text-[#a3a3a3]" />
          <h1 className="text-lg font-semibold text-[#ededed]">נושאים</h1>
          <span className="text-sm text-[#525252]">({filteredIssues.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "board" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("board")}
          >
            <Columns className="h-4 w-4" />
          </Button>
          <Button onClick={() => setCreateOpen(true)} size="sm">
            <Plus className="h-4 w-4" />
            נושא חדש
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 px-6 py-3 border-b border-[#262626]">
        <Input
          placeholder="חיפוש נושאים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="כל הסטטוסים" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">כל הסטטוסים</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <LoadingList />
        ) : filteredIssues.length === 0 ? (
          <EmptyState
            icon={CircleDot}
            title="אין נושאים"
            description="צרו נושא ראשון כדי להתחיל"
            action={{ label: "נושא חדש", onClick: () => setCreateOpen(true) }}
          />
        ) : viewMode === "list" ? (
          <div className="divide-y divide-[#262626]">
            {filteredIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/${companySlug}/issues/${issue.id}`}
                className="flex items-center gap-3 px-6 py-3 hover:bg-[#1a1a1a] transition-colors"
              >
                <PriorityBadge priority={issue.priority} />
                <span className="text-xs text-[#525252] font-mono w-20 flex-shrink-0">
                  {issue.identifier}
                </span>
                <span className="flex-1 text-sm text-[#ededed] truncate">
                  {issue.title}
                </span>
                <StatusBadge status={issue.status} />
                {issue.assignee && (
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: "#6366f1" }}
                    title={issue.assignee.name}
                  >
                    {issue.assignee.name.charAt(0)}
                  </div>
                )}
                <span className="text-xs text-[#525252] flex-shrink-0">
                  {formatRelativeTime(issue.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          // Board view
          <div className="flex gap-4 p-4 overflow-x-auto h-full">
            {boardColumns.map((col) => (
              <div
                key={col.status}
                className="flex-shrink-0 w-64 flex flex-col"
              >
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBgColor(col.status)}`}
                  >
                    {STATUS_LABELS[col.status]}
                  </span>
                  <span className="text-xs text-[#525252]">{col.issues.length}</span>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {col.issues.map((issue) => (
                    <Link
                      key={issue.id}
                      href={`/${companySlug}/issues/${issue.id}`}
                      className="block p-3 bg-[#121212] border border-[#262626] rounded-lg hover:border-[#3f3f46] transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <PriorityBadge priority={issue.priority} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#ededed] truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-[#525252] mt-1">
                            {issue.identifier}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>נושא חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>כותרת</Label>
              <Input
                value={newIssue.title}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, title: e.target.value })
                }
                placeholder="כותרת הנושא"
                className="mt-1"
              />
            </div>
            <div>
              <Label>תיאור</Label>
              <Textarea
                value={newIssue.description}
                onChange={(e) =>
                  setNewIssue({ ...newIssue, description: e.target.value })
                }
                placeholder="תיאור הנושא..."
                className="mt-1"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>סטטוס</Label>
                <Select
                  value={newIssue.status}
                  onValueChange={(v) =>
                    setNewIssue({ ...newIssue, status: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>עדיפות</Label>
                <Select
                  value={newIssue.priority}
                  onValueChange={(v) =>
                    setNewIssue({ ...newIssue, priority: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>שיוך לסוכן</Label>
              <Select
                value={newIssue.assigneeAgentId}
                onValueChange={(v) =>
                  setNewIssue({ ...newIssue, assigneeAgentId: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="בחר סוכן" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא שיוך</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>פרויקט</Label>
              <Select
                value={newIssue.projectId}
                onValueChange={(v) =>
                  setNewIssue({ ...newIssue, projectId: v })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="בחר פרויקט" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ללא פרויקט</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              ביטול
            </Button>
            <Button onClick={createIssue}>צור נושא</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
