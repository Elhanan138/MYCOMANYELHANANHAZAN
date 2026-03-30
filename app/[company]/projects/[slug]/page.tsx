"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FolderOpen, CircleDot, ChevronLeft, GitBranch, HardDrive, Settings, AlertTriangle, Archive } from "lucide-react";
import type { Project, Issue } from "@/types";
import { getStatusBgColor, formatDateTime } from "@/lib/utils";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/lib/constants";
import { toast } from "sonner";

export default function ProjectPage() {
  const { company, slug: projectSlug } = useParams<{ company: string; slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"issues" | "overview" | "config">("issues");
  const [companySlug, setCompanySlug] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", status: "", repoUrl: "", localFolder: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then(async (c) => {
        setCompanySlug(c.slug);
        const [pRes, iRes] = await Promise.all([
          fetch(`/api/projects/${projectSlug}?companyId=${c.id}`),
          fetch(`/api/companies/${c.id}/issues?projectSlug=${projectSlug}`),
        ]);
        const [p, i] = await Promise.all([pRes.json(), iRes.json()]);
        setProject(p);
        setIssues(Array.isArray(i) ? i : []);
        setForm({
          name: p.name || "",
          description: p.description || "",
          status: p.status || "active",
          repoUrl: p.repoUrl || "",
          localFolder: p.localFolder || "",
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company, projectSlug]);

  async function saveConfig() {
    if (!project) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
        setEditing(false);
        toast.success("הפרויקט עודכן בהצלחה");
      }
    } catch { toast.error("שגיאה בשמירה"); }
    setSaving(false);
  }

  if (loading) return (
    <div className="p-6 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-[#111] rounded-xl border border-[#1e1e1e] animate-pulse" />)}
    </div>
  );
  if (!project) return <div className="p-6 text-[#525252]">פרויקט לא נמצא</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#525252]">
        <Link href={`/${company}/issues`} className="hover:text-[#a3a3a3]">נושאים</Link>
        <ChevronLeft className="h-4 w-4" />
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-blue-400" />
          <span className="text-[#a3a3a3]">{project.name}</span>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#ededed]">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-[#a3a3a3] mt-1">{project.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBgColor(project.status)}`}>
              {STATUS_LABELS[project.status] || project.status}
            </span>
            <span className="text-xs text-[#525252]">{issues.length} נושאים</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#262626]">
        {[
          { key: "issues", label: "נושאים", icon: CircleDot },
          { key: "overview", label: "סקירה", icon: FolderOpen },
          { key: "config", label: "תצורה", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                tab === t.key ? "border-indigo-500 text-[#ededed]" : "border-transparent text-[#525252] hover:text-[#a3a3a3]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Issues tab */}
      {tab === "issues" && (
        <div className="space-y-2">
          {issues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CircleDot className="h-10 w-10 text-[#333] mb-3" />
              <p className="text-[#525252] text-sm">אין נושאים בפרויקט זה</p>
            </div>
          ) : (
            issues.map((issue) => (
              <Link
                key={issue.id}
                href={`/${company}/issues/${issue.id}`}
                className="flex items-center justify-between p-3 bg-[#111] border border-[#262626] rounded-xl hover:border-[#333] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#525252]">{issue.identifier}</span>
                  <span className="text-sm text-[#ededed]">{issue.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#525252]">{PRIORITY_LABELS[issue.priority] || issue.priority}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border ${getStatusBgColor(issue.status)}`}>
                    {STATUS_LABELS[issue.status] || issue.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Overview tab */}
      {tab === "overview" && (
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#ededed]">פרטי פרויקט</h2>
          <div className="space-y-3 text-sm">
            {project.repoUrl && (
              <div className="flex items-center gap-2 text-[#a3a3a3]">
                <GitBranch className="h-4 w-4 text-[#525252]" />
                <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                  {project.repoUrl}
                </a>
              </div>
            )}
            {project.localFolder && (
              <div className="flex items-center gap-2 text-[#a3a3a3]">
                <HardDrive className="h-4 w-4 text-[#525252]" />
                <code className="text-xs font-mono">{project.localFolder}</code>
              </div>
            )}
            <div className="pt-2 text-xs text-[#525252]">
              נוצר: {formatDateTime(project.createdAt)} · עודכן: {formatDateTime(project.updatedAt)}
            </div>
          </div>
        </div>
      )}

      {/* Config tab */}
      {tab === "config" && (
        <div className="space-y-6 max-w-xl">
          <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-[#ededed]">הגדרות פרויקט</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">שם</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">תיאור</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500 resize-none" />
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">סטטוס</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500">
                  <option value="active">פעיל</option>
                  <option value="on_hold">בהמתנה</option>
                  <option value="completed">הושלם</option>
                  <option value="archived">בארכיון</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">כתובת מאגר</label>
                <input value={form.repoUrl} onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="https://github.com/org/repo" />
              </div>
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">תיקייה מקומית</label>
                <input value={form.localFolder} onChange={(e) => setForm({ ...form, localFolder: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="/home/user/project" />
              </div>
            </div>
            <button onClick={saveConfig} disabled={saving}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg">
              {saving ? "שומר..." : "שמור שינויים"}
            </button>
          </div>

          <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h2 className="text-sm font-semibold text-red-400">אזור מסוכן</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#ededed]">ארכב פרויקט</p>
                <p className="text-xs text-[#525252]">הפרויקט יוסתר אך הנתונים יישמרו</p>
              </div>
              <button
                onClick={async () => {
                  if (!confirm("ארכב פרויקט?")) return;
                  await fetch(`/api/projects/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "archived" }) });
                  toast.success("הפרויקט הועבר לארכיב");
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-red-700/50 text-red-400 hover:bg-red-600/10 text-sm rounded-lg"
              >
                <Archive className="h-4 w-4" />
                ארכב
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
