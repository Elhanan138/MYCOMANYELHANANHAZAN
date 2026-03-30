"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CheckSquare, Check, X, Clock, Bot } from "lucide-react";
import type { Approval } from "@/types";
import { formatDateTime, getStatusBgColor } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/constants";

const TYPE_LABELS: Record<string, string> = {
  budget: "תקציב",
  action: "פעולה",
  deploy: "פריסה",
  other: "אחר",
};

export default function ApprovalsPage() {
  const { company } = useParams<{ company: string }>();
  const [companyId, setCompanyId] = useState("");
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"pending" | "all">("pending");
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then(async (c) => {
        setCompanyId(c.id);
        const res = await fetch(`/api/approvals?companyId=${c.id}`);
        const data = await res.json();
        setApprovals(Array.isArray(data) ? data : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company]);

  async function resolve(id: string, status: "approved" | "rejected") {
    setResolving(id);
    try {
      const res = await fetch(`/api/approvals/${id}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const updated = await res.json();
        setApprovals((a) => a.map((x) => (x.id === id ? updated : x)));
      }
    } catch (e) { console.error(e); }
    setResolving(null);
  }

  const filtered = tab === "pending"
    ? approvals.filter((a) => a.status === "pending")
    : approvals;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="h-6 w-6 text-yellow-400" />
        <div>
          <h1 className="text-2xl font-bold text-[#ededed]">אישורים</h1>
          <p className="text-sm text-[#a3a3a3]">בקשות הממתינות לאישור הלוח</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[#262626]">
        {[
          { key: "pending", label: "ממתינים", count: approvals.filter((a) => a.status === "pending").length },
          { key: "all", label: "הכל", count: approvals.length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key
                ? "border-indigo-500 text-[#ededed]"
                : "border-transparent text-[#525252] hover:text-[#a3a3a3]"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className="mr-1.5 text-xs bg-[#1e1e1e] text-[#a3a3a3] px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-[#111] rounded-xl border border-[#1e1e1e] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <CheckSquare className="h-12 w-12 text-[#333] mb-4" />
          <p className="text-[#525252] text-sm">
            {tab === "pending" ? "אין בקשות ממתינות" : "אין אישורים עדיין"}
          </p>
          <p className="text-[#3a3a3a] text-xs mt-1">
            {tab === "pending" ? "כל הבקשות טופלו" : "אישורים יופיעו כאן כשסוכנים יגישו בקשות"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((approval) => (
            <div
              key={approval.id}
              className="bg-[#111] border border-[#262626] rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono text-[#525252]">#{approval.id.slice(0, 8)}</span>
                    <span className="text-xs bg-[#1e1e1e] text-[#a3a3a3] px-2 py-0.5 rounded">
                      {TYPE_LABELS[approval.type] || approval.type}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded border ${getStatusBgColor(approval.status)}`}>
                      {STATUS_LABELS[approval.status] || approval.status}
                    </span>
                  </div>

                  {approval.agent && (
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-[#525252]" />
                      <span className="text-sm text-[#c0c0c0]">{approval.agent.name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1.5 text-xs text-[#525252]">
                    <Clock className="h-3 w-3" />
                    {formatDateTime(approval.createdAt)}
                  </div>
                </div>

                {approval.status === "pending" && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => resolve(approval.id, "approved")}
                      disabled={resolving === approval.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs rounded-lg"
                    >
                      <Check className="h-3.5 w-3.5" />
                      אשר
                    </button>
                    <button
                      onClick={() => resolve(approval.id, "rejected")}
                      disabled={resolving === approval.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-600/40 text-red-400 text-xs rounded-lg"
                    >
                      <X className="h-3.5 w-3.5" />
                      דחה
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
