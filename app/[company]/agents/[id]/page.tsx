"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDateTime, formatRelativeTime, formatCurrency } from "@/lib/utils";
import { STATUS_LABELS, RUN_TYPE_LABELS } from "@/lib/constants";
import { ArrowRight, Bot, Play, Settings, Zap, RefreshCw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingPage } from "@/components/shared/LoadingSkeleton";
import { toast } from "sonner";
import type { Agent, Run } from "@/types";

export default function AgentDetailPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const agentId = params.id as string;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: "",
    title: "",
    adapterType: "cli",
    budgetUsd: "",
    capabilities: "",
    status: "active",
  });

  const fetchAgent = useCallback(async () => {
    try {
      setLoading(true);
      const [agentRes, runsRes] = await Promise.all([
        fetch(`/api/agents/${agentId}`),
        fetch(`/api/agents/${agentId}/runs?limit=20`),
      ]);
      const agentData = await agentRes.json();
      setAgent(agentData);
      setEditData({
        name: agentData.name || "",
        title: agentData.title || "",
        adapterType: agentData.adapterType || "cli",
        budgetUsd: agentData.budgetUsd?.toString() || "",
        capabilities: (agentData.capabilities || []).join(", "),
        status: agentData.status || "active",
      });
      setRuns(await runsRes.json());
    } catch {
      toast.error("שגיאה בטעינת סוכן");
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    fetchAgent();
  }, [fetchAgent]);

  const saveAgent = async () => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editData.name,
          title: editData.title || null,
          adapterType: editData.adapterType,
          budgetUsd: editData.budgetUsd ? parseFloat(editData.budgetUsd) : null,
          capabilities: editData.capabilities
            ? editData.capabilities.split(",").map((c) => c.trim()).filter(Boolean)
            : [],
          status: editData.status,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setAgent(updated);
      setEditing(false);
      toast.success("סוכן עודכן");
    } catch {
      toast.error("שגיאה בשמירה");
    }
  };

  const triggerRun = async () => {
    if (!agent) return;
    try {
      const res = await fetch(`/api/agents/${agentId}/runs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId: agent.companyId,
          type: "manual",
          invocation: { triggeredBy: "board" },
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("ריצה הופעלה");
      fetchAgent();
    } catch {
      toast.error("שגיאה בהפעלת ריצה");
    }
  };

  if (loading) return <LoadingPage />;
  if (!agent) {
    return <div className="p-6 text-center text-[#a3a3a3]">סוכן לא נמצא</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <Link
            href={`/${companySlug}/agents`}
            className="text-[#a3a3a3] hover:text-[#ededed]"
          >
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-sm font-bold text-indigo-400">
            {agent.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-lg font-semibold text-[#ededed]">{agent.name}</h1>
            {agent.title && (
              <p className="text-xs text-[#a3a3a3]">{agent.title}</p>
            )}
          </div>
          <StatusBadge status={agent.status} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={triggerRun}>
            <Play className="h-3 w-3" />
            הפעל ריצה
          </Button>
          <Button
            variant={editing ? "default" : "outline"}
            size="sm"
            onClick={() => (editing ? saveAgent() : setEditing(true))}
          >
            <Settings className="h-3 w-3" />
            {editing ? "שמור" : "ערוך"}
          </Button>
          {editing && (
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
              ביטול
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="overview" className="h-full">
          <div className="px-6 border-b border-[#262626]">
            <TabsList className="bg-transparent h-10 p-0 gap-4">
              <TabsTrigger value="overview" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none pb-2 text-sm">
                סקירה
              </TabsTrigger>
              <TabsTrigger value="runs" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none pb-2 text-sm">
                ריצות ({runs.length})
              </TabsTrigger>
              <TabsTrigger value="config" className="data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none pb-2 text-sm">
                הגדרות
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 space-y-3">
                <h3 className="text-sm font-semibold text-[#ededed]">פרטים</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">שם</span>
                    <span className="text-[#ededed]">{agent.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">תפקיד</span>
                    <span className="text-[#ededed]">{agent.title || "—"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">סטטוס</span>
                    <StatusBadge status={agent.status} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">מתאם</span>
                    <span className="text-[#ededed]">{agent.adapterType || "cli"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">תקציב</span>
                    <span className="text-[#ededed]">
                      {agent.budgetUsd ? formatCurrency(agent.budgetUsd) : "ללא הגבלה"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#a3a3a3]">נוצר</span>
                    <span className="text-[#ededed]">{formatDateTime(agent.createdAt)}</span>
                  </div>
                </div>
              </div>

              {agent.capabilities && agent.capabilities.length > 0 && (
                <div className="bg-[#121212] border border-[#262626] rounded-xl p-4">
                  <h3 className="text-sm font-semibold text-[#ededed] mb-3">יכולות</h3>
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="text-xs bg-indigo-600/10 border border-indigo-600/20 rounded-full px-2.5 py-1 text-indigo-300"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recent runs */}
            <div className="bg-[#121212] border border-[#262626] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[#ededed]">ריצות אחרונות</h3>
                <Link href="#" className="text-xs text-indigo-400">הצג הכל</Link>
              </div>
              {runs.slice(0, 5).length === 0 ? (
                <p className="text-sm text-[#525252] text-center py-4">אין ריצות עדיין</p>
              ) : (
                <div className="space-y-2">
                  {runs.slice(0, 5).map((run) => (
                    <Link
                      key={run.id}
                      href={`/${companySlug}/agents/${agentId}/runs/${run.id}`}
                      className="flex items-center justify-between p-2 hover:bg-[#1e1e1e] rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <StatusBadge status={run.status} />
                        <span className="text-xs text-[#a3a3a3]">
                          {RUN_TYPE_LABELS[run.type] || run.type}
                        </span>
                      </div>
                      <span className="text-xs text-[#525252]">
                        {formatRelativeTime(run.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="runs" className="p-6">
            {runs.length === 0 ? (
              <div className="text-center text-[#525252] py-8">אין ריצות עדיין</div>
            ) : (
              <div className="space-y-2">
                {runs.map((run) => (
                  <Link
                    key={run.id}
                    href={`/${companySlug}/agents/${agentId}/runs/${run.id}`}
                    className="flex items-center justify-between p-3 bg-[#121212] border border-[#262626] rounded-lg hover:border-[#3f3f46] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusBadge status={run.status} />
                      <span className="text-sm text-[#ededed] font-mono">
                        {run.id.slice(0, 8)}...
                      </span>
                      <span className="text-xs text-[#a3a3a3]">
                        {RUN_TYPE_LABELS[run.type] || run.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {run.costUsd && (
                        <span className="text-xs text-[#a3a3a3]">
                          {formatCurrency(run.costUsd)}
                        </span>
                      )}
                      <span className="text-xs text-[#525252]">
                        {formatRelativeTime(run.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="p-6">
            {editing ? (
              <div className="max-w-md space-y-4">
                <div>
                  <Label>שם</Label>
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>תפקיד</Label>
                  <Input
                    value={editData.title}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>תקציב ($)</Label>
                  <Input
                    type="number"
                    value={editData.budgetUsd}
                    onChange={(e) => setEditData({ ...editData, budgetUsd: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>יכולות (מופרדות בפסיק)</Label>
                  <Input
                    value={editData.capabilities}
                    onChange={(e) => setEditData({ ...editData, capabilities: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-md space-y-3">
                <div className="bg-[#121212] border border-[#262626] rounded-lg p-4">
                  <pre className="text-xs text-[#a3a3a3] overflow-auto">
                    {JSON.stringify(agent.adapterConfig || {}, null, 2)}
                  </pre>
                </div>
                <p className="text-xs text-[#525252]">
                  לחץ "ערוך" לעדכון הגדרות
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
