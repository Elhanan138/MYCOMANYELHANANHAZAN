"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { Bot, Plus, Activity, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingList } from "@/components/shared/LoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const params = useParams();
  const companySlug = params.company as string;
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [newAgent, setNewAgent] = useState({
    name: "",
    title: "",
    adapterType: "cli",
    budgetUsd: "",
    capabilities: "",
  });

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const companyRes = await fetch(`/api/companies/${companySlug}`);
      const company = await companyRes.json();
      setCompanyId(company.id);
      const res = await fetch(`/api/agents?companyId=${company.id}`);
      setAgents(await res.json());
    } catch {
      toast.error("שגיאה בטעינת סוכנים");
    } finally {
      setLoading(false);
    }
  }, [companySlug]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const createAgent = async () => {
    if (!newAgent.name.trim()) {
      toast.error("שם נדרש");
      return;
    }
    try {
      const res = await fetch(`/api/agents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newAgent.name,
          title: newAgent.title || null,
          companyId,
          adapterType: newAgent.adapterType,
          budgetUsd: newAgent.budgetUsd ? parseFloat(newAgent.budgetUsd) : null,
          capabilities: newAgent.capabilities
            ? newAgent.capabilities.split(",").map((c) => c.trim()).filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("סוכן נוצר בהצלחה");
      setCreateOpen(false);
      setNewAgent({ name: "", title: "", adapterType: "cli", budgetUsd: "", capabilities: "" });
      fetchAgents();
    } catch {
      toast.error("שגיאה ביצירת סוכן");
    }
  };

  const activeAgents = agents.filter((a) => a.status === "active");
  const inactiveAgents = agents.filter((a) => a.status !== "active");

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#262626]">
        <div className="flex items-center gap-3">
          <Bot className="h-5 w-5 text-[#a3a3a3]" />
          <h1 className="text-lg font-semibold text-[#ededed]">סוכנים</h1>
          <span className="text-sm text-[#525252]">({agents.length})</span>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          סוכן חדש
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <LoadingList />
        ) : agents.length === 0 ? (
          <EmptyState
            icon={Bot}
            title="אין סוכנים"
            description="הוסיפו סוכן ראשון לחברה"
            action={{ label: "סוכן חדש", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <div className="space-y-6">
            {activeAgents.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">
                  פעילים ({activeAgents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      companySlug={companySlug}
                    />
                  ))}
                </div>
              </section>
            )}

            {inactiveAgents.length > 0 && (
              <section>
                <h2 className="text-sm font-medium text-[#a3a3a3] mb-3">
                  לא פעילים ({inactiveAgents.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inactiveAgents.map((agent) => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      companySlug={companySlug}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>סוכן חדש</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>שם</Label>
              <Input
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="שם הסוכן"
                className="mt-1"
              />
            </div>
            <div>
              <Label>תפקיד</Label>
              <Input
                value={newAgent.title}
                onChange={(e) => setNewAgent({ ...newAgent, title: e.target.value })}
                placeholder="מפתח, בודק, ..."
                className="mt-1"
              />
            </div>
            <div>
              <Label>סוג מתאם</Label>
              <Select
                value={newAgent.adapterType}
                onValueChange={(v) => setNewAgent({ ...newAgent, adapterType: v })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cli">CLI</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="webhook">Webhook</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>תקציב ($)</Label>
              <Input
                type="number"
                value={newAgent.budgetUsd}
                onChange={(e) => setNewAgent({ ...newAgent, budgetUsd: e.target.value })}
                placeholder="0.00"
                className="mt-1"
              />
            </div>
            <div>
              <Label>יכולות (מופרדות בפסיק)</Label>
              <Input
                value={newAgent.capabilities}
                onChange={(e) => setNewAgent({ ...newAgent, capabilities: e.target.value })}
                placeholder="coding, testing, reviewing"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>ביטול</Button>
            <Button onClick={createAgent}>צור סוכן</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AgentCard({ agent, companySlug }: { agent: Agent; companySlug: string }) {
  return (
    <Link href={`/${companySlug}/agents/${agent.id}`}>
      <div className="bg-[#121212] border border-[#262626] rounded-xl p-4 hover:border-[#3f3f46] transition-colors">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-sm font-bold text-indigo-400">
              {agent.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#ededed]">{agent.name}</h3>
              {agent.title && (
                <p className="text-xs text-[#a3a3a3]">{agent.title}</p>
              )}
            </div>
          </div>
          <StatusBadge status={agent.status} />
        </div>

        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {agent.capabilities.slice(0, 3).map((cap) => (
              <span
                key={cap}
                className="text-xs bg-[#1e1e1e] border border-[#262626] rounded px-1.5 py-0.5 text-[#a3a3a3]"
              >
                {cap}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-[#525252]">
          <span>{agent.adapterType || "cli"}</span>
          <span>{formatRelativeTime(agent.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
