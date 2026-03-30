"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { DollarSign, TrendingUp, Zap, Activity } from "lucide-react";

interface CostEntry {
  id: string;
  agentId: string | null;
  runId: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  costUsd: string;
  provider: string | null;
  createdAt: string;
  agent?: { id: string; name: string } | null;
}

interface ByAgent {
  agentId: string | null;
  agentName: string | null;
  total: string | null;
}

interface CostData {
  ledger: CostEntry[];
  byAgent: ByAgent[];
  byDay: { date: string; cost: number }[];
  total: number;
}

export default function CostsPage() {
  const { company } = useParams<{ company: string }>();
  const [data, setData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${company}`)
      .then((r) => r.json())
      .then((c) => fetch(`/api/companies/${c.id}/costs`))
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [company]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-[#1a1a1a] rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const totalTokensIn = data?.ledger.reduce((s, e) => s + (e.tokensIn || 0), 0) || 0;
  const totalTokensOut = data?.ledger.reduce((s, e) => s + (e.tokensOut || 0), 0) || 0;

  // Group by provider
  const byProvider: Record<string, number> = {};
  data?.ledger.forEach((e) => {
    const p = e.provider || "אחר";
    byProvider[p] = (byProvider[p] || 0) + parseFloat(e.costUsd || "0");
  });

  const kpis = [
    { label: "סה״כ עלויות הסקה", value: formatCurrency(data?.total), icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "טוקנים נכנסים", value: totalTokensIn.toLocaleString("he-IL"), icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "טוקנים יוצאים", value: totalTokensOut.toLocaleString("he-IL"), icon: Activity, color: "text-purple-400", bg: "bg-purple-400/10" },
    { label: "אירועי חיוב", value: (data?.ledger.length || 0).toLocaleString("he-IL"), icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <DollarSign className="h-6 w-6 text-emerald-400" />
        <div>
          <h1 className="text-2xl font-bold text-[#ededed]">עלויות ותקציב</h1>
          <p className="text-sm text-[#a3a3a3]">מעקב עלויות הסקה וניהול תקציב</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-[#111] border border-[#262626] rounded-xl p-4">
              <div className={`inline-flex p-2 rounded-lg ${kpi.bg} mb-3`}>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </div>
              <div className="text-2xl font-bold text-[#ededed]">{kpi.value}</div>
              <div className="text-xs text-[#a3a3a3] mt-1">{kpi.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Agent */}
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">עלויות לפי סוכן</h2>
          {data?.byAgent && data.byAgent.length > 0 ? (
            <div className="space-y-3">
              {data.byAgent.map((item, i) => {
                const cost = parseFloat(item.total || "0");
                const pct = data.total > 0 ? (cost / data.total) * 100 : 0;
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#c0c0c0]">{item.agentName || "לא ידוע"}</span>
                      <span className="text-[#ededed] font-medium">{formatCurrency(cost)}</span>
                    </div>
                    <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#525252] text-center py-8">אין נתוני עלויות עדיין</p>
          )}
        </div>

        {/* By Provider */}
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">עלויות לפי ספק</h2>
          {Object.keys(byProvider).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(byProvider).map(([provider, cost]) => {
                const pct = data!.total > 0 ? (cost / data!.total) * 100 : 0;
                return (
                  <div key={provider} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#c0c0c0]">{provider}</span>
                      <span className="text-[#ededed] font-medium">{formatCurrency(cost)}</span>
                    </div>
                    <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[#525252] text-center py-8">אין נתוני ספקים עדיין</p>
          )}
        </div>
      </div>

      {/* Cost by day chart */}
      {data?.byDay && data.byDay.length > 0 && (
        <div className="bg-[#111] border border-[#262626] rounded-xl p-5">
          <h2 className="text-sm font-semibold text-[#ededed] mb-4">עלויות יומיות (30 ימים אחרונים)</h2>
          <div className="flex items-end gap-1 h-24">
            {data.byDay.map((day, i) => {
              const max = Math.max(...data.byDay.map((d) => d.cost), 0.001);
              const height = Math.max((day.cost / max) * 100, 4);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-emerald-600/60 hover:bg-emerald-600 transition-colors"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${formatCurrency(day.cost)}`}
                  />
                  {i % 5 === 0 && (
                    <span className="text-[9px] text-[#525252] whitespace-nowrap">{day.date.slice(5)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent entries */}
      <div className="bg-[#111] border border-[#262626] rounded-xl">
        <div className="p-4 border-b border-[#1e1e1e]">
          <h2 className="text-sm font-semibold text-[#ededed]">רשומות אחרונות</h2>
        </div>
        {data?.ledger && data.ledger.length > 0 ? (
          <div className="divide-y divide-[#1e1e1e]">
            {data.ledger.slice(0, 20).map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {entry.agent && (
                      <span className="text-sm font-medium text-[#ededed]">{entry.agent.name}</span>
                    )}
                    {entry.provider && (
                      <span className="text-xs text-[#525252] bg-[#1e1e1e] px-1.5 py-0.5 rounded">
                        {entry.provider}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-[#525252]">
                    {(entry.tokensIn || 0).toLocaleString("he-IL")} נכנסים ·{" "}
                    {(entry.tokensOut || 0).toLocaleString("he-IL")} יוצאים
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-400">
                    {formatCurrency(entry.costUsd)}
                  </div>
                  <div className="text-xs text-[#525252]">{formatDateTime(entry.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#525252] text-center py-12">אין רשומות עלויות עדיין</p>
        )}
      </div>
    </div>
  );
}
