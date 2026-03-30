"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDateTime, formatRelativeTime, getStatusBgColor, getPriorityColor } from "@/lib/utils";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import {
  ArrowRight,
  Send,
  Play,
  Edit2,
  Trash2,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriorityBadge } from "@/components/shared/PriorityBadge";
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Issue, IssueComment, Agent, Run } from "@/types";
import Link from "next/link";

const STATUSES = ["todo", "in_progress", "in_review", "blocked", "done", "cancelled"];
const PRIORITIES = ["urgent", "high", "medium", "low", "no_priority"];

export default function IssueDetailPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const issueId = params.id as string;
  const router = useRouter();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [comments, setComments] = useState<IssueComment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const fetchIssue = useCallback(async () => {
    try {
      const [issueRes, commentsRes] = await Promise.all([
        fetch(`/api/issues/${issueId}`),
        fetch(`/api/issues/${issueId}/comments`),
      ]);
      const issueData = await issueRes.json();
      setIssue(issueData);
      setEditTitle(issueData.title || "");
      setEditDescription(issueData.description || "");
      setComments(await commentsRes.json());
    } catch {
      toast.error("שגיאה בטעינת הנושא");
    } finally {
      setLoading(false);
    }
  }, [issueId]);

  const fetchAgents = useCallback(async () => {
    try {
      const companyRes = await fetch(`/api/companies/${companySlug}`);
      const company = await companyRes.json();
      const agentsRes = await fetch(`/api/agents?companyId=${company.id}`);
      setAgents(await agentsRes.json());
    } catch {}
  }, [companySlug]);

  useEffect(() => {
    fetchIssue();
    fetchAgents();
  }, [fetchIssue, fetchAgents]);

  const updateIssue = async (updates: Partial<Issue>) => {
    try {
      const res = await fetch(`/api/issues/${issueId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setIssue(updated);
      toast.success("נושא עודכן");
    } catch {
      toast.error("שגיאה בעדכון");
    }
  };

  const saveEdit = async () => {
    await updateIssue({ title: editTitle, description: editDescription });
    setEditing(false);
  };

  const submitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment, authorType: "board" }),
      });
      if (!res.ok) throw new Error();
      const comment = await res.json();
      setComments([...comments, comment]);
      setNewComment("");
    } catch {
      toast.error("שגיאה בשליחת תגובה");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteIssue = async () => {
    if (!confirm("למחוק נושא זה?")) return;
    try {
      await fetch(`/api/issues/${issueId}`, { method: "DELETE" });
      toast.success("נושא נמחק");
      router.push(`/${companySlug}/issues`);
    } catch {
      toast.error("שגיאה במחיקה");
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-[#1e1e1e] rounded animate-pulse" />
        <div className="h-64 bg-[#1e1e1e] rounded animate-pulse" />
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="p-6 text-center text-[#a3a3a3]">נושא לא נמצא</div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
          <Link
            href={`/${companySlug}/issues`}
            className="hover:text-[#ededed] transition-colors"
          >
            נושאים
          </Link>
          <ArrowRight className="h-3 w-3" />
          <span className="text-[#ededed]">{issue.identifier}</span>
        </div>

        {/* Title */}
        <div>
          {editing ? (
            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-b border-indigo-500 outline-none text-[#ededed] pb-1"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={6}
                placeholder="תיאור הנושא..."
              />
              <div className="flex gap-2">
                <Button onClick={saveEdit}>שמור</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  ביטול
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start gap-3">
                <h1 className="text-2xl font-bold text-[#ededed] flex-1">
                  {issue.title}
                </h1>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditing(true)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={deleteIssue}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {issue.description && (
                <div className="mt-3">
                  <MarkdownRenderer content={issue.description} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-[#a3a3a3]">
            תגובות ({comments.length})
          </h2>

          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-[#121212] border border-[#262626] rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{
                    backgroundColor:
                      comment.authorType === "agent" ? "#6366f1" : "#16a34a",
                  }}
                >
                  {comment.authorType === "agent"
                    ? comment.agent?.name?.charAt(0) || "A"
                    : "B"}
                </div>
                <span className="text-sm font-medium text-[#ededed]">
                  {comment.authorType === "agent"
                    ? comment.agent?.name || "סוכן"
                    : "לוח"}
                </span>
                <span className="text-xs text-[#525252]">
                  {formatDateTime(comment.createdAt)}
                </span>
              </div>
              <MarkdownRenderer content={comment.content} />
            </div>
          ))}

          {/* Add comment */}
          <div className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסף תגובה..."
              rows={3}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  submitComment();
                }
              }}
            />
            <div className="flex justify-end">
              <Button onClick={submitComment} disabled={submitting} size="sm">
                <Send className="h-3 w-3" />
                שלח
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 border-r border-[#262626] p-4 space-y-4 overflow-auto flex-shrink-0">
        <div>
          <p className="text-xs text-[#525252] mb-1">מזהה</p>
          <p className="text-sm font-mono text-[#ededed]">{issue.identifier}</p>
        </div>

        <div>
          <p className="text-xs text-[#525252] mb-1">סטטוס</p>
          <Select
            value={issue.status}
            onValueChange={(v) => updateIssue({ status: v as Issue["status"] })}
          >
            <SelectTrigger className="h-7 text-xs">
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
          <p className="text-xs text-[#525252] mb-1">עדיפות</p>
          <Select
            value={issue.priority}
            onValueChange={(v) =>
              updateIssue({ priority: v as Issue["priority"] })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-xs text-[#525252] mb-1">מוקצה ל</p>
          <Select
            value={issue.assigneeAgentId || ""}
            onValueChange={(v) =>
              updateIssue({ assigneeAgentId: v || null })
            }
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="לא מוקצה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">לא מוקצה</SelectItem>
              {agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <p className="text-xs text-[#525252] mb-1">נוצר</p>
          <p className="text-xs text-[#a3a3a3]">
            {formatDateTime(issue.createdAt)}
          </p>
        </div>

        <div>
          <p className="text-xs text-[#525252] mb-1">עודכן</p>
          <p className="text-xs text-[#a3a3a3]">
            {formatDateTime(issue.updatedAt)}
          </p>
        </div>

        {issue.project && (
          <div>
            <p className="text-xs text-[#525252] mb-1">פרויקט</p>
            <p className="text-xs text-[#a3a3a3]">{issue.project.name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
