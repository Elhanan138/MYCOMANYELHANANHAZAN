"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { RefreshCw, Plus, Bot, Calendar, Clock, Trash2 } from "lucide-react";
import type { Routine, Agent, Project } from "@/types";
import { formatDateTime } from "@/lib/utils";

const TRIGGER_LABELS: Record<string, string> = {
  cron: "Cron",
  webhook: "Webhook",
  manual: "ידני",
  interval: "מרווח זמן",
};

export default function RoutinesPage() {
  const { company } = useParams<{ company: string }>();
  const [companyId, setCompanyId] = useState("");
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: "",
    assigneeAgentId: "",
    projectId: "",
    instructions: "",
    triggerType: "manual" as const,
    triggerConfig: "{}",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then(async (c) => {
        setCompanyId(c.id);
        const [routinesRes, agentsRes] = await Promise.all([
          fetch(`/api/companies/${c.id}/routines`),
          fetch(`/api/agents?companyId=${c.id}`),
        ]);
        const [r, a] = await Promise.all([routinesRes.json(), agentsRes.json()]);
        setRoutines(Array.isArray(r) ? r : []);
        setAgents(Array.isArray(a) ? a : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company]);

  async function createRoutine() {
    setSaving(true);
    try {
      let config = {};
      try { config = JSON.parse(form.triggerConfig); } catch {}
      const res = await fetch(`/api/companies/${companyId}/routines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          triggerConfig: config,
          assigneeAgentId: form.assigneeAgentId || null,
          projectId: form.projectId || null,
        }),
      });
      if (res.ok) {
        const created = await res.json();
        setRoutines((r) => [created, ...r]);
        setShowCreate(false);
        setForm({ title: "", assigneeAgentId: "", projectId: "", instructions: "", triggerType: "manual", triggerConfig: "{}" });
      }
    } catch (e) { console.error(e); }
    setSaving(false);
  }

  async function deleteRoutine(id: string) {
    if (!confirm("האם למחוק רוטינה זו?")) return;
    await fetch(`/api/companies/${companyId}/routines/${id}`, { method: "DELETE" });
    setRoutines((r) => r.filter((x) => x.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold text-[#ededed]">רוטינות</h1>
            <p className="text-sm text-[#a3a3a3]">משימות חוזרות ומתוזמנות — ベータ</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg"
        >
          <Plus className="h-4 w-4" />
          רוטינה חדשה
        </button>
      </div>

      {showCreate && (
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-[#ededed]">רוטינה חדשה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#a3a3a3] mb-1 block">כותרת *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500"
                placeholder="שם הרוטינה"
              />
            </div>
            <div>
              <label className="text-xs text-[#a3a3a3] mb-1 block">סוכן מבצע</label>
              <select
                value={form.assigneeAgentId}
                onChange={(e) => setForm({ ...form, assigneeAgentId: e.target.value })}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500"
              >
                <option value="">ללא סוכן</option>
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#a3a3a3] mb-1 block">סוג טריגר</label>
              <select
                value={form.triggerType}
                onChange={(e) => setForm({ ...form, triggerType: e.target.value as typeof form.triggerType })}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500"
              >
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            {form.triggerType === "cron" && (
              <div>
                <label className="text-xs text-[#a3a3a3] mb-1 block">Cron Expression</label>
                <input
                  value={form.triggerConfig}
                  onChange={(e) => setForm({ ...form, triggerConfig: e.target.value })}
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] font-mono focus:outline-none focus:border-indigo-500"
                  placeholder='{"cron": "0 9 * * *"}'
                />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs text-[#a3a3a3] mb-1 block">הוראות</label>
            <textarea
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              rows={5}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-[#ededed] focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="תאר את המשימה הרוטינית..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={createRoutine}
              disabled={saving || !form.title}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm rounded-lg"
            >
              {saving ? "שומר..." : "צור רוטינה"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-[#a3a3a3] text-sm rounded-lg"
            >
              ביטול
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-[#111] rounded-xl border border-[#1e1e1e] animate-pulse" />
          ))}
        </div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <RefreshCw className="h-12 w-12 text-[#333] mb-4" />
          <p className="text-[#525252] text-sm">אין רוטינות עדיין</p>
          <p className="text-[#3a3a3a] text-xs mt-1">צור רוטינה ראשונה כדי להתחיל</p>
          <button
            onClick={() => setShowCreate(true)}
            className="mt-4 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg"
          >
            צור רוטינה
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-[#111] border border-[#262626] rounded-xl p-4 hover:border-[#333] transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-[#ededed]">{routine.title}</h3>
                    <span className="text-xs bg-[#1e1e1e] text-[#a3a3a3] px-1.5 py-0.5 rounded">
                      {TRIGGER_LABELS[routine.triggerType] || routine.triggerType}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#525252]">
                    {routine.assignee && (
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3" />
                        {routine.assignee.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDateTime(routine.createdAt)}
                    </span>
                  </div>
                  {routine.instructions && (
                    <p className="text-xs text-[#525252] mt-2 line-clamp-2">{routine.instructions}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteRoutine(routine.id)}
                  className="p-1.5 rounded text-[#525252] hover:text-red-400 hover:bg-red-400/10 transition-colors flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
